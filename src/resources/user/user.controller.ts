import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@/guards/auth.guard';
import { DTOKeys, PageQuery } from '@/types/index.type';
import { DEFAULT_PAGE_SIZE } from '@/constants/index.constant';
import {
  cleanFilter,
  fallbackCatch,
  formatResponse,
  safeObject,
  validateBody,
} from '@/utils/index.util';
import { UserDTO, UserDTOKeys } from '@/resources/user/user.type';

/**
 * User Controller
 * @end-points
 * - GET `/` list all users
 * - POST `/new` create a new user
 * - PUT `/:ref/block` block / unblock user by features
 * - PUT `/:ref/pwd` change user password
 */
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * List all users
   * @param query
   * - page: page number
   * - size: page size
   * - name: username search (FTS)
   * - team-name: team name search (FTS)
   * @param res
   * fastify response
   */
  @Get()
  async listUsers(@Query() query: any, @Res() res: any) {
    let page: PageQuery;
    if (query.page || query.size) {
      page = {
        pageNo: query.page ?? 1,
        pageSize: query.size ?? DEFAULT_PAGE_SIZE,
      };
    }
    const list = await this.userService.listUsers({
      page,
      filter: cleanFilter(query, ['name', 'team-name']),
    });
    return res.code(HttpStatus.OK).send(formatResponse(HttpStatus.OK, list));
  }

  /**
   * Create a new user
   * @param userDto
   * see UserDTO
   * @param res
   * fastify response
   */
  @Post('new')
  async createUser(@Body() userDto: UserDTO, @Res() res: any) {
    if (validateBody(UserDTOKeys, userDto)) {
      const newUserInput = safeObject(UserDTOKeys, userDto) as UserDTO;
      try {
        await this.userService.createUser(newUserInput);
        return res
          .code(HttpStatus.CREATED)
          .send(formatResponse(HttpStatus.CREATED, 'user created'));
      } catch (e) {
        if (e.message === UserService.USER_SERVICE_EXCEPTIONS.USER_EXISTS) {
          return res
            .code(HttpStatus.FORBIDDEN)
            .send(formatResponse(HttpStatus.FORBIDDEN, 'user exists'));
        }
        fallbackCatch(e, res);
      }
    }
    return res
      .code(HttpStatus.FORBIDDEN)
      .send(formatResponse(HttpStatus.FORBIDDEN, 'invalid request'));
  }

  /**
   * Block / Unblock user by features
   * @param ref
   * user ref
   * @param status
   * - level 0: block all, 1: allow all, 2: block post, 3: block group, 4: block chat
   * @param res
   * fastify response
   */
  @Put(':ref/block')
  async blockUser(
    @Param('ref') ref: string,
    @Body()
    status: {
      level: number;
    },
    @Res() res: any,
  ) {
    if (validateBody({ level: { type: 'number', required: true } }, status)) {
      await this.userService.blockUser(ref, status.level);
      return res
        .code(HttpStatus.OK)
        .send(formatResponse(HttpStatus.OK, 'user status updated'));
    }
    return res
      .code(HttpStatus.FORBIDDEN)
      .send(formatResponse(HttpStatus.FORBIDDEN, 'invalid request'));
  }

  /**
   * Change user password
   * @param ref
   * user ref
   * @param pwdUpdate
   * - oldPwd: old password
   * - newPwd: new password
   * @param res
   * fastify response
   */
  @Put(':ref/pwd')
  async changePassword(
    @Param('ref') ref: string,
    @Body() pwdUpdate: any,
    @Res() res: any,
  ) {
    const DTO_KEYS: DTOKeys = {
      newPwd: { type: 'string', required: true },
    } as const;
    if (validateBody(DTO_KEYS, pwdUpdate)) {
      try {
        await this.userService.updateUserPassword(ref, pwdUpdate.newPwd);
        return res
          .code(HttpStatus.OK)
          .send(formatResponse(HttpStatus.OK, 'user password updated'));
      } catch (e) {
        fallbackCatch(e, res);
      }
    }
    return res
      .code(HttpStatus.FORBIDDEN)
      .send(formatResponse(HttpStatus.FORBIDDEN, 'invalid request'));
  }
}
