import { NextResponse } from 'next/server';
import { getSocketServerUrl } from '@/lib/config';

export async function GET() {
  try {
    const socketUrl = getSocketServerUrl().replace(/\/$/, '');
    const endpoints = [
      `${socketUrl}/api/socket-status`,
      `${socketUrl}/health`
    ];

    let lastError: Error | null = null;

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          lastError = new Error(`Status ${response.status}`);
          continue;
        }

        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
          ? await response.json()
          : await response.text();

        return NextResponse.json({
          status: 'connected',
          message: 'Socket.IO server is accessible',
          socketUrl: url,
          payload,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }
    }

    throw lastError || new Error('Unable to reach socket server');
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Cannot connect to Socket.IO server',
      error: error instanceof Error ? error.message : 'Unknown error',
      socketUrl: getSocketServerUrl(),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
