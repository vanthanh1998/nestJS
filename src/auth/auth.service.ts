import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    // username + pass là 2 tham số thư viện passport nó ném về
    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if(user){
            const isValid = this.usersService.isValidPassword(pass, user.password)
            if(isValid === true){
                return user;
            }
        }
        
        return null;
    }

    async login(user: IUser, response: Response) {
        const { _id, name, email, role } = user

        const payload = { 
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role,
        };

        const refresh_token = this.createRefreshToken(payload);

        // update user with refresh token
        await this.usersService.updateUserToken(refresh_token, _id);

        // set refresh token as cookies
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true, // set true thì chỉ server mới lấy đc cookies này thôi
            maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE'))// ~~ EXPIRE nhưng đc tính theo miliseconds => vì vậy k cần / 1000
        })
        
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                _id,
                name,
                email,
                role
            }
        };
    }

    async register(user: RegisterUserDto){
        let newUser = await this.usersService.register(user);

        return {
            _id : newUser?._id,
            createdAt: newUser?.createdAt
        }
    }

    createRefreshToken = (payload: any) => {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SCERET'),
            expiresIn: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
        });

        return refresh_token;
    }

    processNewToken = async (refreshToken: string, response: Response) =>{
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SCERET'),
            })

            let user = await this.usersService.findUserByToken(refreshToken);
            if(user) {
                const { _id, name, email, role } = user

                const payload = { 
                    sub: "token refresh",
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role,
                };

                const refresh_token = this.createRefreshToken(payload);

                // update user with refresh token
                await this.usersService.updateUserToken(refresh_token, _id.toString());

                // remove cookies
                response.clearCookie("refresh_token")

                // set refresh token as cookies
                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true, // set true thì chỉ server mới lấy đc cookies này thôi
                    maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE'))
                })
                
                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role
                    }
                };
            } else {
                throw new BadRequestException(`Refresh token k hợp lệ. Vui lòng login`)
            }
        } catch (error) {
            throw new BadRequestException(`Refresh token k hợp lệ. Vui lòng login`)
        }
    }
}
