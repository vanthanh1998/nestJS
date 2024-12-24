import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage("Create a new user")
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Patch()
  @ResponseMessage("Update a User")
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a User")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() queryString: string
  ) {
    return this.usersService.findAll(+currentPage, +limit, queryString);
  }

  @Public() // thêm public thì sẽ k chạy JWT
  @Get(':id')
  @ResponseMessage("Fetch user by id")
  findOne(@Param('id') id: string
  ) {
    // const id: string = rq.pareams.id;
    return this.usersService.findOne(id); // +id dùng dấu + có nghĩa là nó đang convert từ string => number
  }
}
