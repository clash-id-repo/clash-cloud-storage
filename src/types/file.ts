export interface FileItem {
  id: string;
  item_id?: string;
  name: string;
  size: number;
  type: string;
  ctime: number;
  utime: number;
  url?: string;
  pid: number;
  driveName?: string;
  driveToken?: string;
}

export interface FileListResponse {
  data: {
    list: FileItem[];
    storage: {
      total: number;
      used: number;
      drives: Record<string, {
        used: number;
        total: number;
        nickname: string;
      }>;
    };
    tokens: Record<string, {
      token: string;
      nickname: string;
      uid: number;
    }>;
  };
}