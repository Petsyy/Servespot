import { FILE_BASE_URL } from "@/shared/utils/runtime";

export function buildFileUrl(filePath) {
  if (!filePath) return "";
  
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  const base = FILE_BASE_URL.replace(/\/+$/, '');
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${base}${path}`;
}

export function isPreviewable(filePath) {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png'];
  return previewableTypes.includes(extension);
}
