import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from '@/resources/team/team.entity';
import { Repository } from 'typeorm';
import { User } from '@/resources/user/user.entity';
import { flattenObject } from '@/utils/index.util';
import { UserDAOBase } from '@/resources/user/user.type';

@Injectable()
export class TeamService {
  static TEAM_SERVICE_EXCEPTIONS = {
    TEAM_NOT_FOUND: 'TEAM_NOT_FOUND',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
  } as const;
  private readonly Exceptions = TeamService.TEAM_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async listTeam(): Promise<{ list: Team[]; meta: { totalCount: number } }> {
    const [teams, count] = await this.teamRepo.findAndCount({
      select: ['id', 'teamName'],
    });
    return { list: teams, meta: { totalCount: count } };
  }

  async listTeamUsers(teamId: number): Promise<{
    team: Team;
    users: UserDAOBase[];
  }> {
    // find team
    const team = await this.teamRepo.findOneBy({ id: teamId });
    if (team) {
      // list users
      const userRaw = await this.userRepo.find({
        where: { teamId },
      });
      const users = userRaw.map((user) => {
        return flattenObject(user, { exclude: ['pwd'] }) as UserDAOBase;
      });
      return { team, users };
    }
    throw new Error(this.Exceptions.TEAM_NOT_FOUND);
  }

  async setLeader(teamId: number, userRef: string): Promise<void> {
    // find team
    const team = await this.teamRepo.findOneBy({ id: teamId });
    if (team) {
      // find user
      const user = await this.userRepo.findOneBy({ ref: userRef });
      if (user) {
        // update team leader
        await this.teamRepo.update(teamId, { leader: user.id });
        return;
      }
      throw new Error(this.Exceptions.USER_NOT_FOUND);
    }
    throw new Error(this.Exceptions.TEAM_NOT_FOUND);
  }
}
