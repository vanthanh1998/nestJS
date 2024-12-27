import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Role.name, schema: RoleSchema }
  ])], // name (định danh id) chỗ này k phải là field trong db
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // exports => nơi khác có thể dùng đc usersService
})
export class UsersModule {}
