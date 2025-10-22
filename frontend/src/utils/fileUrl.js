// src/utils/fileUrl.js
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const FILE_BASE = import.meta.env.VITE_FILE_BASE || API_BASE.replace(/\/api\/?$/, "");

/**
 * Build an absolute file URL from a stored path
 */
export function buildFileUrl(filePath) {
  if (!filePath) return "";
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  const base = FILE_BASE.replace(/\/+$/, '');
  
  // Ensure the path starts with a single slash
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  
  return `${base}${path}`;
}

/**
 * Check if file type can be previewed in browser
 */
export function isPreviewable(filePath) {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png'];
  return previewableTypes.includes(extension);
}