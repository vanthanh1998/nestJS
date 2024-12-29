import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller("auth") // route => /auth
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService
  ) {}

  @Public() // dùng để disable guard => đgl: decorator
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard) // mỗi lần login chỉ cho phép login bao nhiêu lần thì sẽ chặn
  @Throttle({ default: { limit: 5, ttl: 60000 } })// 5 lần trong 60s
  @ApiBody({ type: UserLoginDto, })
  @ResponseMessage("User login")
  @Post('/login')
  handleLogin(
    @Req() req, 
    @Res({ passthrough: true }) response: Response // để xử lý token JWT
  ){
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage("Register a new user")
  @Post('/register')
  handleRegister(@Body() registerUserDto: RegisterUserDto){
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage("Get user information")
  @Get('/account')
  async handleGetUserInfo(@User() user: IUser){ // decorator này lấy từ req.user ~~ @req.user
    // decorator user lấy từ JWT nên k có permissions vì vậy cần thêm 1 bước query xuống db lấy findOne 
    const temp = await this.rolesService.findOne(user.role._id) as any; //  as any bỏ đi check typess
    user.permissions = temp.permissions;

    return { user };
  }

  @Public()
  @ResponseMessage("Get user by refresh token")
  @Get('/refresh')
  handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response){
    const refreshToken = request.cookies["refresh_token"]
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage("Logout user")
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser
  ){
    return this.authService.logout(response, user);
  }
}
