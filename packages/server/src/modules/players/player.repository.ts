import type { Player, Session } from '@atlantis/shared';
import type { Db } from '../../db/pool';

export async function createPlayer(db: Db, name: string): Promise<Session> {
  const { rows } = await db.query<{ id: string; token: string }>(
    'insert into players (name) values ($1) returning id, token',
    [name],
  );
  const row = rows[0]!;
  return { token: row.token, player: { id: row.id, name } };
}

export async function findPlayerByToken(db: Db, token: string): Promise<Player | null> {
  const { rows } = await db.query<Player>('select id, name from players where token = $1', [token]);
  return rows[0] ?? null;
}
