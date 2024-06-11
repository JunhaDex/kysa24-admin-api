import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminDTO, LoginDTO, LoginResponse } from '@/resources/auth/auth.type';
import { Admin } from '@/resources/auth/auth.entity';

@Injectable()
export class AuthService {
  static ADMIN_SERVICE_EXCEPTIONS = {
    ADMIN_EXISTS: 'ADMIN_EXISTS',
    ADMIN_NOT_FOUND: 'ADMIN_NOT_FOUND',
  } as const;

  private readonly Exceptions = AuthService.ADMIN_SERVICE_EXCEPTIONS;

  constructor(
    private jwtService: JwtService,
    @InjectRepository(Admin) private readonly adminRepo: Repository<Admin>,
  ) {}

  async loginAdmin(login: LoginDTO): Promise<LoginResponse> {
    const admin = await this.adminRepo.findOneBy({ loginId: login.userId });
    if (admin) {
      console.log(admin);
      if (await bcrypt.compare(login.password, admin.pwd)) {
        const payload = {
          loginId: admin.loginId,
          name: admin.name,
          sub: admin.id,
        };
        const accessToken = await this.jwtService.signAsync(payload);
        return { accessToken };
      }
    }
    throw new Error(this.Exceptions.ADMIN_NOT_FOUND);
  }

  async createAdmin(admin: AdminDTO): Promise<void> {
    const duplicate = await this.adminRepo.findOneBy({
      loginId: admin.loginId,
    });
    if (!duplicate) {
      const newAdmin = this.adminRepo.create(admin);
      const round = Number(process.env.BCRYPT_SALT_ROUND);
      const salt = await bcrypt.genSalt(round);
      newAdmin.pwd = await bcrypt.hash(newAdmin.pwd, salt);
      await this.adminRepo.save(newAdmin);
      return;
    }
    throw new Error(this.Exceptions.ADMIN_EXISTS);
  }

  async getAdminById(id: number) {
    return await this.adminRepo.findOneBy({ id });
  }
}
