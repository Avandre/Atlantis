import { createSessionSchema } from '@atlantis/shared';
import type { FastifyInstance } from 'fastify';
import { pool } from '../db/pool';
import { createPlayer } from '../modules/players/player.repository';

export function registerHttp(app: FastifyInstance): void {
  app.post('/api/session', async (request, reply) => {
    const body = createSessionSchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: 'Имя: от 2 до 24 символов' });
    return createPlayer(pool, body.data.name);
  });
}
