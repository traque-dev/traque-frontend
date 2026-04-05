export type FilePurpose =
  | 'BUG'
  | 'ISSUE'
  | 'AI_CHAT'
  | 'AVATAR'
  | 'LOGO'
  | 'ATTACHMENT';

export type FileDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  purpose: FilePurpose;
  url: string;
  uploadedById?: string;
};

export type UploadFileInput = {
  file: File | Blob;
  purpose: FilePurpose;
};
