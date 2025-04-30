export interface CPResponse {
  code: number;
  files: CPFile[];
  count: { total: number; folders: number; files: number };
}

export interface CPFile {
  id: string;
  name: string;
  type: 'folder' | 'image' | 'video' | 'file';
  date: string;
  tags?: string[];
  size?: number;
  url?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration_in_seconds?: number | null;
  subfolders?: number;
  files?: number;
  items?: number;
}
