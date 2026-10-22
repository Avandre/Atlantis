import {
  chatSendSchema,
  gameActionPayloadSchema,
  roomRefSchema,
  tokenSchema,
  type Ack,
  type ClientToServerEvents,
  type Player,
  type ServerToClientEvents,
} from '@atlantis/shared';
import type { Server } from 'socket.io';
import type { z } from 'zod';
import { pool } from '../db/pool';
import { AppError } from '../errors';
import * as chat from '../modules/chat/chat.service';
import { findPlayerByToken } from '../modules/players/player.repository';
import * as rooms from '../modules/rooms/room.service';

type SocketData = { player: Player };
export type AppServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

function parse<S extends z.ZodTypeAny>(schema: S, payload: unknown): z.infer<S> {
  const result = schema.safeParse(payload);
  if (!result.success) throw new AppError('Некорректный запрос');
  return result.data;
}

/** Единая точка превращения исключений в ответ клиенту. */
async function respond<T>(ack: Ack<T>, run: () => Promise<T>): Promise<void> {
  if (typeof ack !== 'function') return;
  try {
    ack({ ok: true, data: await run() });
  } catch (error) {
    if (!(error instanceof AppError)) console.error(error);
    ack({ ok: false, error: error instanceof AppError ? error.message : 'Внутренняя ошибка сервера' });
  }
}

export function registerSocket(io: AppServer): void {
  io.use(async (socket, next) => {
    const token = tokenSchema.safeParse(socket.handshake.auth.token);
    const player = token.success ? await findPlayerByToken(pool, token.data) : null;
    if (!player) return next(new Error('unauthorized'));
    socket.data.player = player;
    next();
  });

  io.on('connection', (socket) => {
    const { player } = socket.data;

    const leaveRooms = async () => {
      for (const room of socket.rooms) if (room !== socket.id) await socket.leave(room);
    };
    const enter = async (roomId: string) => {
      await leaveRooms();
      await socket.join(roomId);
    };

    socket.on('room:create', (ack) =>
      respond(ack, async () => {
        const room = await rooms.createRoom(player);
        await enter(room.id);
        return room;
      }),
    );

    socket.on('room:join', (payload, ack) =>
      respond(ack, async () => {
        const { roomId } = parse(roomRefSchema, payload);
        const room = await rooms.joinRoom(player, roomId);
        await enter(room.id);
        io.to(room.id).emit('room:updated', room);
        return { room, history: await chat.getHistory(room.id) };
      }),
    );

    socket.on('room:leave', () => void leaveRooms());

    socket.on('game:start', (payload, ack) =>
      respond(ack, async () => {
        const { roomId } = parse(roomRefSchema, payload);
        io.to(roomId).emit('room:updated', await rooms.startGame(player, roomId));
      }),
    );

    socket.on('game:action', (payload, ack) =>
      respond(ack, async () => {
        const { roomId, action } = parse(gameActionPayloadSchema, payload);
        io.to(roomId).emit('room:updated', await rooms.performAction(player, roomId, action));
      }),
    );

    socket.on('chat:send', (payload, ack) =>
      respond(ack, async () => {
        const { roomId, text } = parse(chatSendSchema, payload);
        io.to(roomId).emit('chat:message', await chat.sendMessage(player, roomId, text));
      }),
    );
  });
}
