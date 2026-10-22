import type { z } from 'zod';
import type { ChatMessage, RoomSnapshot } from './domain';
import type { chatSendSchema, gameActionPayloadSchema, roomRefSchema } from './schemas';

export type AckResult<T> = { ok: true; data: T } | { ok: false; error: string };
export type Ack<T> = (result: AckResult<T>) => void;

type RoomRef = z.input<typeof roomRefSchema>;
type GameActionPayload = z.input<typeof gameActionPayloadSchema>;
type ChatSendPayload = z.input<typeof chatSendSchema>;

export interface ClientToServerEvents {
  'room:create': (ack: Ack<RoomSnapshot>) => void;
  'room:join': (payload: RoomRef, ack: Ack<{ room: RoomSnapshot; history: ChatMessage[] }>) => void;
  'room:leave': () => void;
  'game:start': (payload: RoomRef, ack: Ack<void>) => void;
  'game:action': (payload: GameActionPayload, ack: Ack<void>) => void;
  'chat:send': (payload: ChatSendPayload, ack: Ack<void>) => void;
}

export interface ServerToClientEvents {
  'room:updated': (room: RoomSnapshot) => void;
  'chat:message': (message: ChatMessage) => void;
}
