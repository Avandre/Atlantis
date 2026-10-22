import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from '../config';
import { pool, transaction } from './pool';

export async function migrate(): Promise<void> {
  await pool.query(`
    create table if not exists schema_migrations (
      name       text primary key,
      applied_at timestamptz not null default now()
    )`);

  const { rows } = await pool.query<{ name: string }>('select name from schema_migrations');
  const applied = new Set(rows.map((row) => row.name));

  const files = (await readdir(config.migrationsDir)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(config.migrationsDir, file), 'utf8');
    await transaction(async (db) => {
      await db.query(sql);
      await db.query('insert into schema_migrations (name) values ($1)', [file]);
    });
    console.log(`Миграция применена: ${file}`);
  }
}
