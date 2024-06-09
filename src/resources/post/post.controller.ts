import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  async listPosts(@Query() query: any) {
    return 'list';
  }

  @Delete(':pid')
  async deletePost(@Param() pid: string) {
    return 'delete';
  }
}
