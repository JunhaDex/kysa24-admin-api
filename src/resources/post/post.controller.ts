import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@/guards/auth.guard';
import { PageQuery } from '@/types/index.type';
import { cleanFilter, fallbackCatch, formatResponse } from '@/utils/index.util';

@Controller('post')
@UseGuards(AuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * list all posts
   * @param query
   * - group-ref: group reference id to filter
   * @param res
   * fastify response
   */
  @Get()
  async listPosts(@Query() query: any, @Res() res: any) {
    let page: PageQuery;
    if (query.page || query.size) {
      page = {
        pageNo: query.page ?? 1,
        pageSize: query.size ?? 10,
      };
    }
    const list = await this.postService.listPosts({
      page,
      filter: cleanFilter(query, ['group-ref']),
    });
    return res.code(HttpStatus.OK).send(formatResponse(HttpStatus.OK, list));
  }

  /**
   * delete post
   * @param pid
   * post id
   * @param res
   * fastify response
   */
  @Delete(':pid')
  async deletePost(@Param('pid') pid: string, @Res() res: any) {
    if (isNaN(parseInt(pid))) {
      return res
        .code(HttpStatus.BAD_REQUEST)
        .send(formatResponse(HttpStatus.BAD_REQUEST, 'invalid request'));
    }
    try {
      await this.postService.deletePost(parseInt(pid));
      return res
        .code(HttpStatus.OK)
        .send(formatResponse(HttpStatus.OK, 'post deleted'));
    } catch (e) {
      if (e.message === PostService.POST_SERVICE_EXCEPTIONS.POST_NOT_FOUND) {
        return res
          .code(HttpStatus.NOT_FOUND)
          .send(formatResponse(HttpStatus.NOT_FOUND, 'post not found'));
      }
      fallbackCatch(e, res);
    }
  }
}
