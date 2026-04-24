/**
 * Resolves a file path to a full URL.
 * Handles both full Cloudinary URLs and legacy local paths.
 */
export const getFileUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL (Cloudinary)
  if (path.startsWith('http')) {
    return path;
  }
  
  // If it's a legacy local path (e.g., /uploads/...)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Ensure we add the /api prefix for local storage files
  let normalizedPath = path.startsWith('/uploads') ? `/api${path}` : path;
  
  // Ensure path starts with a slash
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  return `${apiUrl}${normalizedPath}`;
};

/**
 * Gets a preview-safe URL for documents (especially PDFs).
 * Wraps PDF URLs in Google Docs Viewer to avoid force-download behavior.
 */
export const getDocPreviewUrl = (path) => {
  const url = getFileUrl(path);
  if (!url) return null;

  // If it's a PDF, use Google Docs Viewer to ensure it renders correctly in an iframe
  // especially if it was uploaded to Cloudinary as 'raw' (application/octet-stream)
  if (url.toLowerCase().endsWith('.pdf') || url.includes('/raw/upload/')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }

  return url;
};
