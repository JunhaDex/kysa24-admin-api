import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { formatResponse } from '@/utils/index.util';
import * as http from 'node:http';

const RESPONSE_HEADER = {
  'content-type': 'application/json',
  charset: 'utf-8',
  connection: 'keep-alive',
  'keep-alive': 'timeout=72',
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor() {}

  async use(req: Request, res: http.ServerResponse, next: () => void) {
    if (req.method === 'options') return next();
    const [type, token] = req.headers['authorization']?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return next();
    }
    res.writeHead(HttpStatus.FORBIDDEN, RESPONSE_HEADER);
    return res.end(
      JSON.stringify(formatResponse(HttpStatus.FORBIDDEN, 'invalid request')),
    );
  }
}
