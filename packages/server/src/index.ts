import Fastify from 'fastify';
import { Server } from 'socket.io';
import { config } from './config';
import { migrate } from './db/migrate';
import { registerHttp } from './transport/http';
import { registerSocket, type AppServer } from './transport/socket';

async function main(): Promise<void> {
  await migrate();

  const app = Fastify({ logger: true });
  registerHttp(app);

  const io: AppServer = new Server(app.server);
  registerSocket(io);

  await app.listen({ port: config.port, host: config.host });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
