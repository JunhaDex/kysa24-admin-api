import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusUserAct, User } from '@/resources/user/user.entity';
import { Team } from '@/resources/team/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, StatusUserAct, Team])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
