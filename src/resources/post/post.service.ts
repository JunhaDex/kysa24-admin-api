import { Injectable, UseGuards } from '@nestjs/common';
import { Post, PostComment, PostLike } from '@/resources/post/post.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from '@/guards/auth.guard';
import { PageQuery, Paginate } from '@/types/index.type';
import { DEFAULT_PAGE_SIZE, EMPTY_PAGE } from '@/constants/index.constant';
import { Group } from '@/resources/group/group.entity';
import { flattenObject } from '@/utils/index.util';
import { PostDAO } from '@/resources/post/post.type';

@Injectable()
@UseGuards(AuthGuard)
export class PostService {
  static POST_SERVICE_EXCEPTIONS = {
    POST_NOT_FOUND: 'POST_NOT_FOUND',
  } as const;
  private readonly Exceptions = PostService.POST_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Group) private readonly groupRepo: Repository<Group>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async listPosts(options?: {
    page: PageQuery;
    filter: { groupRef: string };
  }): Promise<Paginate<PostDAO>> {
    // setup queries
    const size = options?.page ? options.page.pageSize : DEFAULT_PAGE_SIZE;
    const skip = options?.page
      ? (options.page.pageNo - 1) * options.page.pageSize
      : 0;
    const take = options?.page ? options.page.pageSize : size;
    // apply filter
    let filter: any;
    if (options?.filter?.groupRef) {
      const group = await this.groupRepo.findOneBy({
        ref: options.filter.groupRef,
      });
      if (group) {
        filter = {
          groupId: group.id,
        };
      } else {
        return EMPTY_PAGE as Paginate<PostDAO>;
      }
    }
    // query post table
    const [listRaw, count] = await this.postRepo.findAndCount({
      where: filter,
      relations: ['authorUser', 'group'],
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
    const posts = listRaw.map((post) => {
      return flattenObject(post, {
        include: [
          'id',
          'author',
          'authorUser.ref',
          'authorUser.name',
          'image',
          'message',
          'groupId',
          'group.ref',
          'group.groupName',
          'createdAt',
          'updatedAt',
        ],
        alias: {
          'authorUser.ref': 'authorRef',
          'authorUser.name': 'authorName',
          'group.ref': 'groupRef',
          'group.groupName': 'groupName',
        },
      }) as PostDAO;
    });
    // return paginated result
    return {
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: size,
        totalPage: Math.ceil(count / size),
        totalCount: count,
      },
      list: posts,
    };
  }

  async deletePost(id: number) {
    const post = await this.postRepo.findOneBy({ id });
    if (post) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.manager.delete(PostLike, { postId: id });
        await queryRunner.manager.delete(PostComment, { postId: id });
        await queryRunner.manager.delete(Post, id);
        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
      return;
    }
    throw new Error(this.Exceptions.POST_NOT_FOUND);
  }

  async deletePostByGroup(groupId: number) {
    const posts = (
      await this.postRepo.find({
        select: ['id'],
        where: { groupId },
      })
    ).map((post) => post.id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(PostLike, { postId: In(posts) });
      await queryRunner.manager.delete(PostComment, { postId: In(posts) });
      await queryRunner.manager.delete(Post, { id: In(posts) });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return;
  }
}
