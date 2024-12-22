import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';

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

  findAll() {
    return `This action returns all companies`;
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
