import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class JobsService {

  constructor(
    @InjectModel(Job.name) 
    private jobModel: SoftDeleteModel<JobDocument>
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {
    let newJob = await this.jobModel.create({
      ...createJobDto,
      createdBy:{
        _id: user._id,
        email: user.email,
      }
    })
    return {
      _id : newJob?._id,
      createdAt: newJob?.createdAt
    }
  }

  update = async(id: string, updateJobDto: UpdateJobDto, user: IUser) => {
    let job = await this.jobModel.updateOne(
      {_id: id},
      {
      ...updateJobDto,
      updatedBy:{
          _id: user._id,
          email: user.email,
        }
      }
  )

    return job;
  }
  remove = async(id: string, user: IUser) => {
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy:{
          _id: user._id,
          email: user.email,
        }
      }
    )

    return this.jobModel.softDelete({
      _id: id
    })
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population } = aqp(queryString); // population dùng để join table

    delete filter.current;
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    console.log({filter})

    const result = await this.jobModel.find(filter)
      .select('-password')
      .skip(offset)
      .limit(defaultLimit)
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

  findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id))
          return "not found";

    return this.jobModel.findOne({
      _id: id
    }).select('-password');
  }
}
