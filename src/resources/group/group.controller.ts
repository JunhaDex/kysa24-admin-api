import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  async listGroups(@Query() query: any) {
    return 'list';
  }

  @Post('new')
  async createGroup(@Body() group: any) {
    return 'create';
  }

  @Delete(':gid')
  async deleteGroup(@Param() gid: string) {
    return 'delete';
  }
}
