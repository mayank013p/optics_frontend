import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Optics by Ivors',
    short_name: 'Optics',
    description: 'The project management workspace designed for speed, clarity, and focus.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#faf8f5',
    icons: [
      {
        src: '/brand/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/brand/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
