import { axios } from '@/api/axios';
import type { PositiveResponse } from '@/types/bug';
import type { FileDTO, UploadFileInput } from '@/types/file';

const base = '/api/v1/files';

export async function uploadFile(
  input: UploadFileInput,
  apiKey?: string,
): Promise<FileDTO> {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('purpose', input.purpose);

  const { data } = await axios.post<FileDTO>(
    `${base}?purpose=${encodeURIComponent(input.purpose)}`,
    formData,
    apiKey ? { headers: { 'x-api-key': apiKey } } : undefined,
  );
  return data;
}

export async function getFileById(fileId: string): Promise<FileDTO> {
  const { data } = await axios.get<FileDTO>(`${base}/${fileId}`);
  return data;
}

export async function deleteFile(fileId: string): Promise<PositiveResponse> {
  const { data } = await axios.delete<PositiveResponse>(`${base}/${fileId}`);
  return data;
}
