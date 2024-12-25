import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller("auth") // route => /auth
export class AuthController {
  constructor(
    private authService: AuthService
  ) {}

  @Public() // dùng để disable guard => đgl: decorator
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("User login")
  @Post('/login')
  handleLogin(
    @Req() req, 
    @Res({ passthrough: true }) response: Response
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
  handleGetUserInfo(@User() user: IUser){ // decorator này lấy từ req.user ~~ @req.user
    return { user };
  }
}
