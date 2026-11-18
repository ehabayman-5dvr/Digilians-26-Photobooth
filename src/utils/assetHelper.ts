export function getAssetUrl(relativePath: string): string {
  if (!relativePath) return '';
  if (
    relativePath.startsWith('http://') ||
    relativePath.startsWith('https://') ||
    relativePath.startsWith('data:') ||
    relativePath.startsWith('blob:')
  ) {
    return relativePath;
  }
  const clean = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${import.meta.env.BASE_URL}${clean}`;
}
