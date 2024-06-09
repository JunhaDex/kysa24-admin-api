import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    return 'login';
  }

  @Post('new')
  async register(@Body() registerDto: any) {
    return 'register';
  }
}
