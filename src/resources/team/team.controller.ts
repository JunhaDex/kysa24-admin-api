import { Controller, Get, Param, Put } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('user/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get(':tid')
  async getTeam(@Param() tid: string) {
    return 'get';
  }

  @Put(':tid/leader')
  async changeLeader(@Param() tid: string) {
    return 'change';
  }
}
