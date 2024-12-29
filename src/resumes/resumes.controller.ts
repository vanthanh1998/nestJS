import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @ResponseMessage("Create a new resume")
  @Post()
  create(
    @Body() createUserCvDto: CreateUserCvDto,
    @User() user: IUser
  ) {
    return this.resumesService.create(createUserCvDto, user);
  }

  @ResponseMessage("Fetch all resumes with paginate")
  @Get()
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() queryString: string
  ) {
    return this.resumesService.findAll(+currentPage, +limit, queryString);
  }

  @ResponseMessage("Fetch a resume by id")
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @ResponseMessage("Get Resumes by User")
  @Post('by-user') // use post để tránh bị trùng vs method get =>  // xem lịch sử cv
  getResumeByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }

  @ResponseMessage("Update status resume")
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body("status") status: string, // update status
    @User() user: IUser
  ) {
    return this.resumesService.update(id, status, user);
  }

  @ResponseMessage("Delete a resume by id")
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
