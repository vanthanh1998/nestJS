import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';

@Injectable()
export class CompaniesService {

  constructor(
    @InjectModel(Company.name) 
    private companyModel: SoftDeleteModel<CompanyDocument>
  ) {}

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    // let company = this.companyModel.create({
    //   name: createCompanyDto.name,
    //   address: createCompanyDto.address,
    //   desc: createCompanyDto.desc,
    // })

    let company = this.companyModel.create({ 
      ...createCompanyDto,
      createdBy:{
        _id: user._id,
        email: user.email,
      }
    })

    return company;
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population } = aqp(queryString); // population dùng để join table

    delete filter.page;
    delete filter.limit

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    console.log({filter})

    const result = await this.companyModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // => đoạn comment trên giúp ts giúp check code lỗi do package api-query-params => sort: Record<string, number>;
      // chỉ hỗ trợ như này => bị mâu thuẩn type với sort
      .sort(sort as any) // ép kiểu là any để tránh bị error type do typescript bắt lỗi
      .populate(population)
      .exec();

      return {
        meta: {
            current: currentPage, //trang hiện tại
            pageSize: limit, //số lượng bản ghi đã lấy
            pages: totalPages, //tổng số trang với điều kiện query
            total: totalItems // tổng số phần tử (số bản ghi)
          },
        result //kết quả query
      }
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    return await this.companyModel.updateOne(
      {_id: id},
      {
        ...updateCompanyDto,
        updatedBy:{
          _id: user._id,
          email: user.email,
        }
      }
    )
  }

  async remove(
    id: string, 
    user: IUser
  ) {
    // do softDelete chỉ hỗ trợ 2 trường {isDeleted, deletedAt} k hỗ trợ lưu trường deletedBy 
    // => nên phải updateOne xong s đó mới softDelete (2 câu query) or có thể viết 1 câu query như đoạn comment
    await this.companyModel.updateOne(
      {_id: id},
      {
        // deletedBy:{
        //   _id: user._id,
        //   email: user.email,
        //   isDeleted: true,
        //   deletedAt: new Date(),
        // }
        deletedBy:{
          _id: user._id,
          email: user.email,
        }
      }
    )
    return this.companyModel.softDelete({
      _id: id, 
    })
  }
}
