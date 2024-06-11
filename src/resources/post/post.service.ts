import { Injectable, UseGuards } from '@nestjs/common';
import { Post } from '@/resources/post/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from '@/guards/auth.guard';
import { PageQuery, Paginate } from '@/types/index.type';
import { DEFAULT_PAGE_SIZE } from '@/constants/index.constant';

@Injectable()
@UseGuards(AuthGuard)
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  async listPosts(options?: {
    page: PageQuery;
    filter: { authorRef: string };
  }): Promise<Paginate<Post>> {
    // setup queries
    const size = options?.page ? options.page.pageSize : DEFAULT_PAGE_SIZE;
    const skip = options?.page
      ? (options.page.pageNo - 1) * options.page.pageSize
      : 0;
    const take = options?.page ? options.page.pageSize : size;
    // apply filter
    let filter: any;
    if (options?.filter) {
      filter = {
        authorRef: options.filter.authorRef,
      };
    }
    // query post table
    const [listRaw, count] = await this.postRepo.findAndCount({
      where: filter,
      relations: ['authorUser'],
      skip,
      take,
    });
    // return paginated result
    return {
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: size,
        totalPage: Math.ceil(count / size),
        totalCount: count,
      },
      list: listRaw,
    };
  }

  async deletePost(id: number) {}
}
