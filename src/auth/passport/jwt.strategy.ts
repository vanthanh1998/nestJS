
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private rolesService: RolesService
  ) {
    super({ // đoạn này giúp giải mã token jwt
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SCERET'),
    });
  }

  async validate(payload: IUser) { // hàm validate này của package jwt => nếu token hợp lệ thì trả ra data như này
    // return { 
    //     userId: payload.sub, 
    //     username: payload.username,
    //     name: "foxrainsad",
    // };

    const { _id, name, email, role } = payload;

    // cần gán thêm permissions vào req.user
    const userRole = role as unknown as { _id: string; name: string} // casting data => để k bị error
    const temp = (await this.rolesService.findOne(userRole._id)).toObject();

    return {
      _id,
      name,
      email,
      role,
      permissions: temp?.permissions ?? []
    };
  }
}
