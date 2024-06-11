import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  type AdminDTO,
  type LoginDTO,
  AdminDTOKeys,
  LoginDTOKeys,
} from '@/resources/auth/auth.type';
import {
  fallbackCatch,
  formatResponse,
  validateBody,
} from '@/utils/index.util';
import { AuthGuard } from '@/guards/auth.guard';

/**
 * Auth Controller
 * @end-points
 * - POST `/login` login admin
 * - POST `/new` create a new admin
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login admin
   * @param loginDto
   * see LoginDTO
   * @param res
   * fastify response
   */
  @Post('login')
  async login(@Body() loginDto: LoginDTO, @Res() res: any) {
    if (validateBody(LoginDTOKeys, loginDto)) {
      try {
        const data = await this.authService.loginAdmin(loginDto);
        return res
          .code(HttpStatus.OK)
          .send(formatResponse(HttpStatus.OK, data));
      } catch (e) {
        if (
          e.message === AuthService.ADMIN_SERVICE_EXCEPTIONS.ADMIN_NOT_FOUND
        ) {
          return res
            .code(HttpStatus.FORBIDDEN)
            .send(formatResponse(HttpStatus.FORBIDDEN, 'invalid request'));
        }
        Logger.error(e);
        return res
          .code(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(
            formatResponse(
              HttpStatus.INTERNAL_SERVER_ERROR,
              'internal server error',
            ),
          );
      }
    }
    return res
      .code(HttpStatus.FORBIDDEN)
      .send(formatResponse(HttpStatus.FORBIDDEN, 'invalid request'));
  }

  /**
   * Create a new admin
   * @param adminDto
   * see AdminDTO
   * @param res
   * fastify response
   */
  @Post('new')
  @UseGuards(AuthGuard)
  async register(@Body() adminDto: AdminDTO, @Res() res: any) {
    if (validateBody(AdminDTOKeys, adminDto)) {
      try {
        await this.authService.createAdmin(adminDto);
        return res
          .code(HttpStatus.CREATED)
          .send(formatResponse(HttpStatus.CREATED, 'admin created'));
      } catch (e) {
        if (e.message === AuthService.ADMIN_SERVICE_EXCEPTIONS.ADMIN_EXISTS) {
          return res
            .code(HttpStatus.FORBIDDEN)
            .send(formatResponse(HttpStatus.FORBIDDEN, 'admin exists'));
        }
        return fallbackCatch(e, res);
      }
    }
    return res
      .code(HttpStatus.FORBIDDEN)
      .send(formatResponse(HttpStatus.FORBIDDEN, 'invalid request'));
  }
}
