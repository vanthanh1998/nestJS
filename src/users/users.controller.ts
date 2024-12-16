import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    // @Body("email") email: string,
    // @Body("password") password: string,
    // @Body("name") name: string,
    @Body() 
    thanhrain: CreateUserDto
  ) {
    // @Body()  ~~ const myEmail: string = req.body.email // string
    return this.usersService.create(thanhrain);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') 
    id: string
  ) {
    // const id: string = rq.pareams.id;
    return this.usersService.findOne(id); // +id dùng dấu + có nghĩa là nó đang convert từ string => number
  }

  @Patch()
  update( @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
