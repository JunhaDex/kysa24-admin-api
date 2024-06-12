import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/resources/user/user.entity';
import { Group, GroupUserFollow } from '@/resources/group/group.entity';
import { Post } from '@/resources/post/post.entity';
import { PostModule } from '@/resources/post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, User, Post, GroupUserFollow]),
    PostModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
