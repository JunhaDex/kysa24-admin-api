import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Like, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PageQuery, Paginate } from '@/types/index.type';
import { StatusUserAct, User } from '@/resources/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DEFAULT_PAGE_SIZE } from '@/constants/index.constant';
import { UserDTO, UserStatus } from '@/resources/user/user.type';
import { Team } from '@/resources/team/team.entity';

@Injectable()
export class UserService {
  static USER_SERVICE_EXCEPTIONS = {
    USER_EXISTS: 'USER_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_PWD_NOT_MATCH: 'USER_PASS_NOT_MATCH',
  } as const;
  private readonly Exceptions = UserService.USER_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(StatusUserAct)
    private readonly userStatRepo: Repository<StatusUserAct>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
  ) {}

  async listUsers(options?: {
    page: PageQuery;
    filter: { name: string; teamName: string };
  }): Promise<Paginate<User>> {
    // setup queries
    const size = options?.page ? options.page.pageSize : DEFAULT_PAGE_SIZE;
    const skip = options?.page
      ? (options.page.pageNo - 1) * options.page.pageSize
      : 0;
    const take = options?.page ? options.page.pageSize : size;
    // apply filter
    let filter: any;
    if (options?.filter) {
      let teamId: number | undefined;
      if (options.filter.teamName) {
        // query team table
        const team = await this.teamRepo.findOneBy({
          teamName: Like(`%${options.filter.teamName}%`),
        });
        teamId = team ? team.id : undefined;
      }
      filter = {
        name: Like(`%${options.filter.name}%`),
        teamId,
      };
    }
    // query user table
    const [list, count] = await this.userRepo.findAndCount({
      select: { pwd: false },
      where: filter,
      skip,
      take,
    });
    // return paginated result
    return {
      meta: {
        pageNo: options.page?.pageNo ?? 1,
        pageSize: size,
        totalPage: Math.ceil(count / size),
        totalCount: count,
      },
      list,
    };
  }

  async createUser(user: UserDTO): Promise<void> {
    // find any duplicate user
    const duplicate = await this.userRepo.findOneBy({ authId: user.id });
    if (!duplicate) {
      // setup new user with unique ref
      const ref = uuidv4();
      const newUser = this.userRepo.create({
        ref,
        name: user.name,
        sex: user.sex === 'm' ? 1 : 2,
        age: this.getAge(user.dob),
        dob: user.dob,
        nickname: user.nickname,
        authId: user.id,
        pwd: user.pwd,
        teamId: user.teamId,
        profileImg: user.profileImg ?? '',
        coverImg: user.coverImg ?? '',
        introduce: user.introduce ?? '',
        geo: user.geo,
        actStatus: 1,
      });
      // hash password
      const round = Number(process.env.BCRYPT_SALT_ROUND);
      const salt = await bcrypt.genSalt(round);
      newUser.pwd = await bcrypt.hash(newUser.pwd, salt);
      // save new user
      await this.userRepo.save(newUser);
      return;
    }
    throw new Error(this.Exceptions.USER_EXISTS);
  }

  private getAge(dob: Date): number {
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      return age - 1;
    }
    return age;
  }

  async updateUserPassword(
    userRef: string,
    oldPwd: string,
    newPwd: string,
  ): Promise<void> {
    // find user by id
    const user = await this.userRepo.findOneBy({ ref: userRef });
    if (user) {
      // compare old password
      if (await bcrypt.compare(oldPwd, user.pwd)) {
        // hash new password
        const round = Number(process.env.BCRYPT_SALT_ROUND);
        const salt = await bcrypt.genSalt(round);
        user.pwd = await bcrypt.hash(newPwd, salt);
        // save new password
        await this.userRepo.save(user);
        return;
      }
      throw new Error(this.Exceptions.USER_PWD_NOT_MATCH);
    }
    throw new Error(this.Exceptions.USER_NOT_FOUND);
  }

  async blockUser(userRef: string, userStat: UserStatus): Promise<void> {
    // find user and status
    const currentUsr = await this.userRepo.findOneBy({ ref: userRef });
    const status = await this.userStatRepo.findOneBy({ level: userStat });
    if (currentUsr && status) {
      // update user status
      currentUsr.actStatus = status.level;
      await this.userRepo.save(currentUsr);
      return;
    }
    throw new Error(this.Exceptions.USER_NOT_FOUND);
  }
}
