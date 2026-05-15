import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.header('x-user-id') || 'ANONYMOUS';
    console.log(`[User: ${userId}] accedió a ${req.originalUrl} - ${req.method}`);
    next();
  }
}
