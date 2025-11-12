export const DEFAULT_OG_IMAGE = '/logo/logo3.png';

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!envUrl) return '';
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
};

export const resolveOgImage = (image?: string | null): string => {
  if (image && image.trim().length > 0) {
    return image;
  }
  return DEFAULT_OG_IMAGE;
};

export const toAbsoluteUrl = (path: string): string => {
  if (!path) return '';
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const buildOgImages = (image?: string | null) => {
  const resolved = resolveOgImage(image);
  const absolute = toAbsoluteUrl(resolved);
  return {
    resolved,
    absolute,
  };
};
