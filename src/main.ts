import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as process from 'node:process';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    {
      bodyParser: true,
      cors: {
        origin: '*',
        credentials: true,
      },
    },
  );
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
  Logger.log(`Server running on port 3000`);
  Logger.log(`Timezone: ${process.env.TZ}`);
  Logger.log(`Server Started: ${new Date().toString()}`);
}

bootstrap();
