export function getImageUrl(relativePath: string): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://72.167.227.205:5001/api';
  const backendOrigin = apiBase.replace(/\/api\/?$/, '');
  if (!relativePath) return '';
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${backendOrigin}${path}`;
}





