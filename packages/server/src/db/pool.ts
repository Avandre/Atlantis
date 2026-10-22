import pg from 'pg';
import { config } from '../config';

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

/** Всё, что умеет выполнять запросы: и пул, и клиент внутри транзакции. */
export type Db = Pick<pg.Pool, 'query'>;

export async function transaction<T>(run: (db: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await run(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
