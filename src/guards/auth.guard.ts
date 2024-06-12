import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@/resources/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = (req.headers['authorization']?.split(' ') ?? [])[1];
    try {
      const user = await this.jwtService.verifyAsync(token);
      if (user) {
        const id = user.sub;
        const admin = await this.authService.getAdminById(id);
        if (admin) {
          req['user'] = admin;
          return true;
        }
      }
    } catch (e) {
      Logger.error(e.message);
    }

    throw new UnauthorizedException();
  }
}
