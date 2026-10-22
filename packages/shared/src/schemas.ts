import { z } from 'zod';
import type { GameAction } from './game';

export const tokenSchema = z.string().uuid();
export const playerNameSchema = z.string().trim().min(2).max(24);
export const roomIdSchema = z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z2-9]{5}$/);
export const chatTextSchema = z.string().trim().min(1).max(500);

export const gameActionSchema: z.ZodType<GameAction> = z.discriminatedUnion('type', [
  z.object({ type: z.literal('end_turn') }),
]);

export const createSessionSchema = z.object({ name: playerNameSchema });
export const roomRefSchema = z.object({ roomId: roomIdSchema });
export const gameActionPayloadSchema = roomRefSchema.extend({ action: gameActionSchema });
export const chatSendSchema = roomRefSchema.extend({ text: chatTextSchema });
