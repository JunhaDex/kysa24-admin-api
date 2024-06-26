import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '@/resources/user/user.module';
import { PostModule } from '@/resources/post/post.module';
import { GroupModule } from '@/resources/group/group.module';
import { AuthModule } from '@/resources/auth/auth.module';
import { TeamModule } from '@/resources/team/team.module';
import { REDIS_CONFIG } from '@/providers/redis.provider';
import { MYSQL_CONFIG } from '@/providers/mysql.provider';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...MYSQL_CONFIG,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
      // logging: true,
    }),
    CacheModule.register({
      ...REDIS_CONFIG,
      isGlobal: true,
      store: redisStore,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_HASH,
      signOptions: { expiresIn: '2h' },
    }),
    UserModule,
    PostModule,
    GroupModule,
    AuthModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'healthz', method: RequestMethod.GET },
      )
      .forRoutes(
        { path: '*', method: RequestMethod.GET },
        { path: '*', method: RequestMethod.POST },
        { path: '*', method: RequestMethod.PUT },
        { path: '*', method: RequestMethod.DELETE },
      );
  }
}
