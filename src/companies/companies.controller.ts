import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto, 
    @User() user: IUser
  ) {
    // @User() user: IUser => @User() đc lấy từ function decorator
    return this.companiesService.create(createCompanyDto, user);
  }

  @Get()
  // @Query("page" get url page ~~ req.query.page
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() queryString: string
  ) {
    // Để convert từ string => number: +currentPage
    return this.companiesService.findAll(+currentPage, +limit, queryString);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser
  ) {
      return this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.companiesService.remove(id, user);
  }
}
