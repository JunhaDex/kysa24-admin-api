import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { AuthGuard } from '@/guards/auth.guard';
import {
  fallbackCatch,
  formatResponse,
  validateBody,
} from '@/utils/index.util';

/**
 * Team Controller
 * @end-points
 * - GET `/:tid` list all team users
 * - PUT `/:tid/leader` change team leader
 */
@Controller('user/team')
@UseGuards(AuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  /**
   * List all team users
   * @param tid
   * team id
   * @param res
   * fastify response
   */
  @Get(':tid')
  async getTeam(@Param('tid') tid: string, @Res() res: any) {
    try {
      const data = await this.teamService.listTeamUsers(parseInt(tid));
      return res.code(HttpStatus.OK).send(formatResponse(HttpStatus.OK, data));
    } catch (e) {
      if (e.message === TeamService.TEAM_SERVICE_EXCEPTIONS.TEAM_NOT_FOUND) {
        return res
          .code(HttpStatus.NOT_FOUND)
          .send(formatResponse(HttpStatus.NOT_FOUND, 'team not found'));
      }
      fallbackCatch(res, e);
    }
  }

  /**
   * Update team leader
   * @param tid
   * team id
   * @param user
   * - userRef: user ref for leader
   * @param res
   * fastify response
   */
  @Put(':tid/leader')
  async changeLeader(
    @Param('tid') tid: string,
    @Body() user: { userRef: string },
    @Res() res: any,
  ) {
    if (validateBody({ userRef: { type: 'string', required: true } }, user)) {
      try {
        await this.teamService.setLeader(parseInt(tid), user.userRef);
        return res
          .code(HttpStatus.OK)
          .send(formatResponse(HttpStatus.OK, 'team leader updated'));
      } catch (e) {
        if (e.message === TeamService.TEAM_SERVICE_EXCEPTIONS.TEAM_NOT_FOUND) {
          return res
            .code(HttpStatus.NOT_FOUND)
            .send(formatResponse(HttpStatus.NOT_FOUND, 'team not found'));
        }
        if (e.message === TeamService.TEAM_SERVICE_EXCEPTIONS.USER_NOT_FOUND) {
          return res
            .code(HttpStatus.FORBIDDEN)
            .send(formatResponse(HttpStatus.FORBIDDEN, 'user not found'));
        }
        fallbackCatch(res, e);
      }
    }
    return res
      .code(HttpStatus.FORBIDDEN)
      .send(formatResponse(HttpStatus.FORBIDDEN, 'invalid request'));
  }
}
