import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { PageQuery } from '@/types/index.type';
import { DEFAULT_PAGE_SIZE } from '@/constants/index.constant';
import {
  cleanFilter,
  fallbackCatch,
  formatResponse,
  validateBody,
} from '@/utils/index.util';
import { GroupDTO, GroupDTOKeys } from '@/resources/group/group.type';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  /**
   * List all groups
   * @param query
   * - group-name: group name search (FTS)
   * @param res
   * fastify response
   */
  @Get()
  async listGroups(@Query() query: any, @Res() res: any) {
    let page: PageQuery;
    if (query.page || query.size) {
      page = {
        pageNo: query.page ?? 1,
        pageSize: query.size ?? DEFAULT_PAGE_SIZE,
      };
    }
    const list = await this.groupService.listGroups({
      page,
      filter: cleanFilter(query, ['group-name']),
    });
    return res.code(HttpStatus.OK).send(formatResponse(HttpStatus.OK, list));
  }

  /**
   * Create a new group
   * @param query
   * - must: invite all users to group (set to 'true')
   * - role: default role for invited users ('writer' | 'reader')
   * @param groupDto
   * see GroupDTO
   * @param res
   * fastify response
   */
  @Post('new')
  async createGroup(
    @Query() query: any,
    @Body() groupDto: GroupDTO,
    @Res() res: any,
  ) {
    const q = cleanFilter(query, ['must', 'role']);
    if (validateBody(GroupDTOKeys, groupDto)) {
      try {
        await this.groupService.createGroup(groupDto);
        if (q.must === 'true') {
          await this.groupService.inviteAllToGroup(
            groupDto.groupName,
            true,
            q.role ?? 'writer',
          );
        }
        return res
          .code(HttpStatus.CREATED)
          .send(formatResponse(HttpStatus.CREATED, 'group created'));
      } catch (e) {
        if (
          e.message ===
          GroupService.GROUP_SERVICE_EXCEPTIONS.GROUP_CREATE_INVALID_INPUT
        ) {
          return res
            .code(HttpStatus.FORBIDDEN)
            .send(
              formatResponse(
                HttpStatus.FORBIDDEN,
                'group already exists or invalid creator',
              ),
            );
        }
        fallbackCatch(res, e);
      }
    }
    return res
      .code(HttpStatus.FORBIDDEN)
      .send(formatResponse(HttpStatus.FORBIDDEN, 'invalid input'));
  }

  /**
   * Delete a group
   * @param ref
   * group ref
   * @param res
   * fastify response
   */
  @Delete(':ref')
  async deleteGroup(@Param('ref') ref: string, @Res() res: any) {
    try {
      await this.groupService.deleteGroup(ref);
      return res
        .code(HttpStatus.OK)
        .send(formatResponse(HttpStatus.OK, 'group deleted'));
    } catch (e) {
      if (e.message === GroupService.GROUP_SERVICE_EXCEPTIONS.GROUP_NOT_FOUND) {
        return res
          .code(HttpStatus.NOT_FOUND)
          .send(formatResponse(HttpStatus.NOT_FOUND, 'group not found'));
      }
      fallbackCatch(res, e);
    }
  }
}
