import { MetadataRoute } from 'next';
import { ENV } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = ENV.APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/invite/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
