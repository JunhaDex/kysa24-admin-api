import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupUserFollow } from '@/resources/group/group.entity';
import { Like, Repository } from 'typeorm';
import { PageQuery, Paginate } from '@/types/index.type';
import { DEFAULT_PAGE_SIZE } from '@/constants/index.constant';
import { GroupDAO, GroupDTO } from '@/resources/group/group.type';
import { User } from '@/resources/user/user.entity';
import { flattenObject } from '@/utils/index.util';
import { Post } from '@/resources/post/post.entity';

@Injectable()
export class GroupService {
  static GROUP_SERVICE_EXCEPTIONS = {
    GROUP_CREATE_INVALID_INPUT: 'GROUP_CREATE_INVALID_INPUT',
    GROUP_NOT_FOUND: 'GROUP_NOT_FOUND',
  } as const;
  private readonly Exceptions = GroupService.GROUP_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(GroupUserFollow)
    private readonly groupFollowRepo: Repository<GroupUserFollow>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async listGroups(options?: {
    page: PageQuery;
    filter: { groupName: string };
  }): Promise<Paginate<GroupDAO>> {
    // setup queries
    const size = options?.page ? options.page.pageSize : DEFAULT_PAGE_SIZE;
    const skip = options?.page
      ? (options.page.pageNo - 1) * options.page.pageSize
      : 0;
    const take = options?.page ? options.page.pageSize : size;
    // apply filter
    let filter: any;
    if (options?.filter?.groupName) {
      filter = {
        groupName: Like(`%${options.filter.groupName}%`),
      };
    }
    // query group table
    const [listRaw, count] = await this.groupRepo.findAndCount({
      where: filter,
      relations: ['creatorUser'],
      skip,
      take,
    });
    const groups = listRaw.map((group) => {
      return flattenObject(group, {
        include: [
          'id',
          'ref',
          'creator',
          'creatorUser.ref',
          'creatorUser.name',
          'groupName',
          'profileImg',
          'coverImg',
          'introduce',
          'isShow',
          'createdAt',
          'updatedAt',
        ],
        alias: {
          'creatorUser.ref': 'creatorRef',
          'creatorUser.name': 'creatorName',
        },
      }) as GroupDAO;
    });
    // return paginated result
    return {
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: size,
        totalPage: Math.ceil(count / size),
        totalCount: count,
      },
      list: groups,
    };
  }

  async createGroup(group: GroupDTO): Promise<void> {
    // find creator exists and group name is unique
    const creator = await this.userRepo.findOneBy({ ref: group.creatorRef });
    const duplicate = await this.groupRepo.findOneBy({
      groupName: group.groupName,
    });
    if (creator && !duplicate) {
      // setup new group with unique ref
      const ref = uuidv4();
      delete group.creatorRef;
      const newGroup = this.groupRepo.create({
        ref,
        creator: creator.id,
        ...group,
        isShow: true,
      });
      // save group
      await this.groupRepo.save(newGroup);
      return;
    }
    throw new Error(this.Exceptions.GROUP_CREATE_INVALID_INPUT);
  }

  async inviteAllToGroup(
    groupName: string,
    isMust: boolean,
    role: 'reader' | 'writer',
  ): Promise<void> {
    const group = await this.groupRepo.findOneBy({ groupName });
    if (group) {
      const allUsers = await this.userRepo.find();
      await this.groupFollowRepo.delete({ groupId: group.id });
      const invites = allUsers.map((user) => {
        return this.groupFollowRepo.create({
          groupId: group.id,
          follower: user.id,
          isMust,
          role,
        });
      });
      await this.groupFollowRepo.insert(invites);
      return;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }

  async updateGroup(groupId: number, update: GroupDTO): Promise<void> {
    // find group
    const group = await this.groupRepo.findOneBy({ id: groupId });
    if (group) {
      // update and save
      group.groupName = update.groupName;
      group.profileImg = update.profileImg;
      group.coverImg = update.coverImg;
      group.introduce = update.introduce;
      await this.groupRepo.save(group);
      return;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }

  async deleteGroup(groupRef: string): Promise<void> {
    // find group
    const group = await this.groupRepo.findOneBy({ ref: groupRef });
    if (group) {
      // delete group
      // TODO: use post service to remove all comment and likes.
      await this.groupFollowRepo.delete({ groupId: group.id });
      await this.groupRepo.delete({
        id: group.id,
      });
      return;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }
}
