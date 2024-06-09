import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginInput } from '@/resources/user/user.type';
import { formatResponse, validateObject } from '@/utils/index.util';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async listUsers(@Query() query: any) {
    return 'list';
  }

  @Post('new')
  async createUser(@Body() user: any) {
    return 'create';
  }

  @Put(':id/block')
  async blockUser(@Param() id: string) {
    return 'block';
  }

  @Put(':id/pwd')
  async changePassword(@Param() id: string) {
    return 'change';
  }
}
