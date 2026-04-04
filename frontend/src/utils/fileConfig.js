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
  const normalizedPath = path.startsWith('/uploads') ? `/api${path}` : path;
  return `${apiUrl}${normalizedPath}`;
};

/**
 * Gets a preview-safe URL for documents (especially PDFs).
 * Wraps PDF URLs in Google Docs Viewer to avoid force-download behavior.
 */
export const getDocPreviewUrl = (path) => {
  const url = getFileUrl(path);
  if (!url) return null;

  // Detect if it's a PDF:
  // 1. URL ends with .pdf
  // 2. Cloudinary raw upload (always a document, usually PDF)
  const isPdf = url.toLowerCase().endsWith('.pdf') || url.includes('/raw/upload/');
  const isRemote = url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1');

  // For remote PDFs (Cloudinary), use Google Docs Viewer to prevent forced download
  if (isPdf && isRemote) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }

  return url;
};
