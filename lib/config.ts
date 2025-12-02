// Configuration for the chat application
const DEFAULT_SOCKET_PORT =
  process.env.NEXT_PUBLIC_SOCKET_PORT ||
  process.env.SOCKET_PORT ||
  process.env.PORT ||
  '3006';
const DEFAULT_SOCKET_PROTO = process.env.NEXT_PUBLIC_SOCKET_PROTOCOL || 'http';

export const config = {
  // Socket server configuration
  socket: {
    // Use environment variable or fallback to default
    url: process.env.NEXT_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || `${DEFAULT_SOCKET_PROTO}://localhost:${DEFAULT_SOCKET_PORT}`,
    path: '/api/socket',
    transports: ['polling'] as const,
  },
  
  // Next.js app configuration
  app: {
    // Use environment variable or fallback to default
    port: process.env.NEXT_PUBLIC_APP_PORT || 3000,
  },
  
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  }
};

// Helper function to get the current socket server URL
export function getSocketServerUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.SOCKET_URL;
  if (envUrl) {
    return envUrl;
  }

  // In the browser, align with the current origin when possible but keep socket server port configurable
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const socketPort = process.env.NEXT_PUBLIC_SOCKET_PORT || DEFAULT_SOCKET_PORT;
    return `${protocol}//${hostname}:${socketPort}`;
  }

  return config.socket.url;
}
