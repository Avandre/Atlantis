import { randomInt } from 'node:crypto';
import {
  applyAction,
  createGame,
  MAX_PLAYERS,
  MIN_PLAYERS,
  type GameAction,
  type Player,
  type RoomSnapshot,
} from '@atlantis/shared';
import { transaction, type Db } from '../../db/pool';
import { AppError } from '../../errors';
import * as repo from './room.repository';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generateCode = () =>
  Array.from({ length: 5 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');

export const createRoom = (player: Player): Promise<RoomSnapshot> =>
  transaction(async (db) => {
    const id = generateCode();
    await repo.insertRoom(db, id, player.id);
    await repo.addMember(db, id, player.id);
    return loadSnapshot(db, id);
  });

/** Повторный вход участника (реконнект) не меняет состав комнаты. */
export const joinRoom = (player: Player, roomId: string): Promise<RoomSnapshot> =>
  transaction(async (db) => {
    const room = await requireRoom(db, roomId, { lock: true });
    if (!(await repo.isMember(db, roomId, player.id))) {
      if (room.status !== 'lobby') throw new AppError('Игра уже началась');
      if ((await repo.listMembers(db, roomId)).length >= MAX_PLAYERS) throw new AppError('Комната заполнена');
      await repo.addMember(db, roomId, player.id);
    }
    return loadSnapshot(db, roomId);
  });

export const startGame = (player: Player, roomId: string): Promise<RoomSnapshot> =>
  transaction(async (db) => {
    const room = await requireRoom(db, roomId, { lock: true });
    if (room.hostId !== player.id) throw new AppError('Начать игру может только хост');
    if (room.status !== 'lobby') throw new AppError('Игра уже началась');

    const members = await repo.listMembers(db, roomId);
    if (members.length < MIN_PLAYERS) throw new AppError(`Нужно минимум игроков: ${MIN_PLAYERS}`);

    await repo.updateRoom(db, roomId, { status: 'playing', game: createGame(members.map((m) => m.id)) });
    return loadSnapshot(db, roomId);
  });

export const performAction = (player: Player, roomId: string, action: GameAction): Promise<RoomSnapshot> =>
  transaction(async (db) => {
    const room = await requireRoom(db, roomId, { lock: true });
    if (room.status !== 'playing' || !room.game) throw new AppError('Игра не идёт');

    const result = applyAction(room.game, player.id, action);
    if (!result.ok) throw new AppError(result.error);

    await repo.updateRoom(db, roomId, { game: result.value });
    return loadSnapshot(db, roomId);
  });

async function requireRoom(db: Db, id: string, opts?: { lock?: boolean }) {
  const room = await repo.findRoom(db, id, opts);
  if (!room) throw new AppError('Комната не найдена');
  return room;
}

async function loadSnapshot(db: Db, id: string): Promise<RoomSnapshot> {
  const room = await requireRoom(db, id);
  return { ...room, members: await repo.listMembers(db, id) };
}
