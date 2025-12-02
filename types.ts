export enum AppRoute {
  HOME = 'home',
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt',
  RETRIEVE = 'retrieve'
}

export interface FileProcessState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number;
}