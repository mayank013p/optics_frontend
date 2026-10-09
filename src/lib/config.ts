/**
 * Optics Application Environment & Base Configuration
 * Centrally manages all client & backend URL endpoints with resilient normalization
 */

// Raw API URL provided by environment or default local dev port
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Normalized REST API base URL (always guarantees trailing /api without double slashes)
const normalizedApiUrl = rawApiUrl.endsWith('/api')
  ? rawApiUrl.replace(/\/+$/, '')
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

// Server root origin (e.g., http://localhost:4000)
const serverOrigin =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  normalizedApiUrl.replace(/\/api\/?$/, '') ||
  'http://localhost:4000';

export const ENV = {
  /**
   * Base REST API URL (e.g., http://localhost:4000/api)
   */
  API_URL: normalizedApiUrl,

  /**
   * Root backend server URL (e.g., http://localhost:4000)
   * Used for static uploads, direct server health checks, and SSE streams
   */
  BACKEND_URL: serverOrigin,

  /**
   * WebSocket server URL for real-time collaboration and sprint updates
   */
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || serverOrigin,

  /**
   * Public client application URL (e.g., http://localhost:3000)
   */
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /**
   * Application Branding
   */
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Optics',
  APP_DESCRIPTION:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'The project management workspace designed for speed, clarity, and focus.',

  /**
   * Runtime mode helpers
   */
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
} as const;

export default ENV;
