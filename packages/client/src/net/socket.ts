import type { AckResult, ClientToServerEvents, ServerToClientEvents } from '@atlantis/shared';
import { io, type Socket } from 'socket.io-client';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const createSocket = (token: string): AppSocket => io({ auth: { token } });

export function unwrap<T>(result: AckResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
