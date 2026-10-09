/**
 * Optics Application Environment & Base Configuration
 * Centrally derives and normalizes all client, REST, and WebSocket endpoints
 * from a single base backend URL environment variable (`NEXT_PUBLIC_API_URL`).
 */

// Single source of truth base URL from environment (e.g., https://optics-backend-5g7q.onrender.com or http://localhost:4000)
const rawBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').trim().replace(/\/+$/, '');

// Clean root server origin without trailing /api
const serverOrigin = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl.slice(0, -4).replace(/\/+$/, '')
  : rawBaseUrl;

// Standard REST API base URL (always ensures /api path)
const apiBaseUrl = `${serverOrigin}/api`;

export const ENV = {
  /**
   * Base REST API URL (e.g., https://optics-backend-5g7q.onrender.com/api)
   */
  API_URL: apiBaseUrl,

  /**
   * Root backend server URL (e.g., https://optics-backend-5g7q.onrender.com)
   * Used for static uploads, direct server health checks, and SSE streams
   */
  BACKEND_URL: serverOrigin,

  /**
   * WebSocket server URL for real-time collaboration and sprint updates
   */
  SOCKET_URL: serverOrigin,

  /**
   * Public client application URL
   */
  APP_URL:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000',

  /**
   * Application Branding
   */
  APP_NAME: 'Optics',
  APP_DESCRIPTION: 'The project management workspace designed for speed, clarity, and focus.',

  /**
   * Runtime mode helpers
   */
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
} as const;

export default ENV;
