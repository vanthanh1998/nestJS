import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) 
    private resumeModel: SoftDeleteModel<ResumeDocument>
  ) {}

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { url, companyId, jobId } = createUserCvDto;
    const { _id, email } = user;

    let newResume = await this.resumeModel.create({
      email, url, companyId, jobId,
      userId: _id,
      status: "PENDING",
      createdBy:{ _id, email},
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: { _id, email},
        }
      ],
    })

    return {
      _id : newResume?._id,
      createdAt: newResume?.createdAt
    }
  }

 async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population, projection } = aqp(queryString); // population dùng để join table

    delete filter.current;
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) // ép kiểu là any để tránh bị error type do typescript bắt lỗi
      .populate(population)
      .select(projection as any)
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

  async findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`not found compay with id=${id}`)

    return await this.resumeModel.findById({ _id: id })
  }

  async findByUsers(user: IUser) {
    return await this.resumeModel.find({
      userId: user._id
    })
  }

  async update(id: string, status: string, user: IUser) {

    if(!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`not found resume with id=${id}`)

    return await this.resumeModel.updateOne(
      {_id: id},
      {
        status,
        updatedBy:{
          _id: user._id,
          email: user.email,
        },
        $push: { // đẩy thêm data vào data cũ // ví dụ đang có [0] => push => [0][1]
          history: {
            status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        }
    })
  }

  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy:{
          _id: user._id,
          email: user.email,
        }
      }
    )
    return this.resumeModel.softDelete({
      _id: id, 
    })
  }
}
