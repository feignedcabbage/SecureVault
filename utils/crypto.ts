// Utility to derive a key from a password
async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

async function getKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptFile(
  file: File, 
  password: string, 
  useGzip: boolean
): Promise<Blob> {
  // 1. Prepare Metadata Payload
  // Format: [4 bytes Metadata Length][Metadata JSON][File Content]
  const metadata = JSON.stringify({ name: file.name, type: file.type });
  const metadataBytes = new TextEncoder().encode(metadata);
  const metaLength = metadataBytes.byteLength;
  
  const lenBuffer = new ArrayBuffer(4);
  new DataView(lenBuffer).setUint32(0, metaLength, true); // Little endian
  
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  
  // Combine: [Len] + [Meta] + [File]
  const payload = new Uint8Array(4 + metaLength + fileBytes.length);
  payload.set(new Uint8Array(lenBuffer), 0);
  payload.set(metadataBytes, 4);
  payload.set(fileBytes, 4 + metaLength);

  let dataToEncrypt = payload;

  // 2. Compress if requested (using CompressionStream)
  // Note: We compress the entire payload including metadata
  if (useGzip && 'CompressionStream' in window) {
    const stream = new Blob([dataToEncrypt]).stream().pipeThrough(new CompressionStream('gzip'));
    dataToEncrypt = new Uint8Array(await new Response(stream).arrayBuffer());
  }

  // 3. Prepare Crypto
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await getKeyMaterial(password);
  const key = await getKey(keyMaterial, salt);

  // 4. Encrypt
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    dataToEncrypt
  );

  // 5. Pack: Salt (16) + IV (12) + GZIP_FLAG (1) + EncryptedData
  // GZIP_FLAG: 1 = compressed, 0 = raw
  const flag = new Uint8Array([useGzip ? 1 : 0]);
  
  return new Blob([salt, iv, flag, encryptedContent], { type: 'application/octet-stream' });
}

export interface DecryptionResult {
  blob: Blob;
  filename: string;
}

export async function decryptFile(
  file: File, 
  password: string
): Promise<DecryptionResult> {
  const fileData = new Uint8Array(await file.arrayBuffer());

  // Extract headers
  const salt = fileData.slice(0, 16);
  const iv = fileData.slice(16, 28);
  const flag = fileData.slice(28, 29); // 1 byte flag
  const encryptedContent = fileData.slice(29);

  const isGzipped = flag[0] === 1;

  // Derive Key
  const keyMaterial = await getKeyMaterial(password);
  const key = await getKey(keyMaterial, salt);

  // Decrypt
  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedContent
    );
  } catch (e) {
    throw new Error("Decryption failed. Invalid password or corrupted file.");
  }

  // Decompress if needed
  let rawDataBuffer = decryptedBuffer;
  if (isGzipped && 'DecompressionStream' in window) {
    try {
      const stream = new Blob([decryptedBuffer]).stream().pipeThrough(new DecompressionStream('gzip'));
      rawDataBuffer = await new Response(stream).arrayBuffer();
    } catch (e) {
        throw new Error("Decompression failed.");
    }
  }

  // Parse Internal Structure: [Len][Meta][File]
  try {
    const view = new DataView(rawDataBuffer);
    const metaLength = view.getUint32(0, true); // Little endian
    
    // Safety check on length
    if (metaLength > rawDataBuffer.byteLength - 4) {
      throw new Error("Metadata length mismatch");
    }

    const metaBytes = new Uint8Array(rawDataBuffer, 4, metaLength);
    const metaStr = new TextDecoder().decode(metaBytes);
    const metadata = JSON.parse(metaStr);
    
    // The rest is the actual file
    // Slice creates a copy, which is safer for Blob creation but memory intensive.
    // Using a view for Blob is efficient.
    const fileBytes = new Uint8Array(rawDataBuffer, 4 + metaLength);
    
    return {
      blob: new Blob([fileBytes], { type: metadata.type || 'application/octet-stream' }),
      filename: metadata.name || 'decrypted_file'
    };

  } catch (e) {
    // Fallback for backward compatibility or corrupt metadata
    // Returns the raw buffer as a generic file
    console.warn("Could not parse metadata, returning raw content", e);
    return {
      blob: new Blob([rawDataBuffer], { type: 'application/octet-stream' }),
      filename: `decrypted_${file.name.replace('.enc', '')}`
    };
  }
}