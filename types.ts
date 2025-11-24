export enum AppRoute {
  HOME = 'home',
  ENCRYPT = 'encrypt',
  DECRYPT = 'decrypt'
}

export interface FileProcessState {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  progress?: number;
}