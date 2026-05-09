import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { connectFamilySocket } from './familySocket';

const socketMocks = vi.hoisted(() => ({
  disconnect: vi.fn(),
  on: vi.fn(),
}));

const ioMock = vi.hoisted(() => vi.fn(() => socketMocks));

vi.mock('socket.io-client', () => ({
  io: ioMock,
}));

describe('connectFamilySocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses polling-first transport fallback for family realtime connections', () => {
    const cleanup = connectFamilySocket('access-token', {});

    expect(ioMock).toHaveBeenCalledWith(
      `${window.location.origin}/family`,
      expect.objectContaining({
        auth: { token: 'access-token' },
        transports: ['polling', 'websocket'],
        tryAllTransports: true,
      })
    );

    cleanup();
    expect(socketMocks.disconnect).toHaveBeenCalled();
  });

  it('keeps nginx socket proxy compatible with both polling and websocket upgrades', () => {
    const nginxTemplate = readFileSync('deploy/nginx/default.conf.template', 'utf8');

    expect(nginxTemplate).toContain('map $http_upgrade $connection_upgrade');
    expect(nginxTemplate).toContain('proxy_set_header Connection $connection_upgrade;');
  });
});
