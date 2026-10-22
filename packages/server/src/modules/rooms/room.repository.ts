import type { GameState, Player, RoomStatus } from '@atlantis/shared';
import type { Db } from '../../db/pool';

export type RoomRow = { id: string; hostId: string; status: RoomStatus; game: GameState | null };

export async function insertRoom(db: Db, id: string, hostId: string): Promise<void> {
  await db.query('insert into rooms (id, host_id) values ($1, $2)', [id, hostId]);
}

/** `lock` блокирует строку до конца транзакции: ходы в одной комнате выполняются строго по очереди. */
export async function findRoom(db: Db, id: string, { lock = false } = {}): Promise<RoomRow | null> {
  const { rows } = await db.query<RoomRow>(
    `select id, host_id as "hostId", status, game from rooms where id = $1 ${lock ? 'for update' : ''}`,
    [id],
  );
  return rows[0] ?? null;
}

export async function updateRoom(db: Db, id: string, patch: { status?: RoomStatus; game?: GameState }): Promise<void> {
  await db.query(
    'update rooms set status = coalesce($2, status), game = coalesce($3, game) where id = $1',
    [id, patch.status ?? null, patch.game ? JSON.stringify(patch.game) : null],
  );
}

export async function addMember(db: Db, roomId: string, playerId: string): Promise<void> {
  await db.query(
    'insert into room_members (room_id, player_id) values ($1, $2) on conflict do nothing',
    [roomId, playerId],
  );
}

export async function listMembers(db: Db, roomId: string): Promise<Player[]> {
  const { rows } = await db.query<Player>(
    `select p.id, p.name
       from room_members m join players p on p.id = m.player_id
      where m.room_id = $1
      order by m.joined_at`,
    [roomId],
  );
  return rows;
}

export async function isMember(db: Db, roomId: string, playerId: string): Promise<boolean> {
  const { rowCount } = await db.query(
    'select 1 from room_members where room_id = $1 and player_id = $2',
    [roomId, playerId],
  );
  return (rowCount ?? 0) > 0;
}
