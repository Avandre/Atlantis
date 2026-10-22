import type { ChatMessage, Player } from '@atlantis/shared';
import type { Db } from '../../db/pool';

type MessageRow = { id: string; text: string; sent_at: Date; player_id: string; name: string };

const toMessage = (row: MessageRow): ChatMessage => ({
  id: row.id,
  text: row.text,
  sentAt: row.sent_at.toISOString(),
  author: { id: row.player_id, name: row.name },
});

export async function insertMessage(db: Db, roomId: string, author: Player, text: string): Promise<ChatMessage> {
  const { rows } = await db.query<{ id: string; sent_at: Date }>(
    'insert into messages (room_id, player_id, text) values ($1, $2, $3) returning id, sent_at',
    [roomId, author.id, text],
  );
  const row = rows[0]!;
  return { id: row.id, author, text, sentAt: row.sent_at.toISOString() };
}

export async function listRecent(db: Db, roomId: string, limit: number): Promise<ChatMessage[]> {
  const { rows } = await db.query<MessageRow>(
    `select m.id, m.text, m.sent_at, m.player_id, p.name
       from messages m join players p on p.id = m.player_id
      where m.room_id = $1
      order by m.id desc
      limit $2`,
    [roomId, limit],
  );
  return rows.reverse().map(toMessage);
}
