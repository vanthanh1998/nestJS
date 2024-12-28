import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ // isPublic: lấy ra thông tin metaData
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
  
  handleRequest(err, user, info, context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException("Token or bearer token not found ");
    }

    // check permissions
    const targetMethod = request.method;
    const targetEndPoint = request.route?.path;

    const permissions = user?.permissions ?? [];
    const isExist = permissions.find(permissions =>
      targetMethod === permissions.method 
      && 
      targetEndPoint === permissions.apiPath
    )

    if (!isExist) {
      throw err || new ForbiddenException("Bạn không có quyền để truy cập endpoint này");
    }

    return user;
  }
}