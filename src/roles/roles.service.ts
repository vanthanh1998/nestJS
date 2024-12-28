import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) 
    private roleModel: SoftDeleteModel<RoleDocument>
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = createRoleDto;
    const { _id, email } = user;

    const isExistName = await this.roleModel.findOne({ name })
    if(isExistName){
      throw new BadRequestException(`Name =${name} đã tồn tại!`)
    }

    let newPermission =  await this.roleModel.create({
      name, description, isActive, permissions,
      createdBy:{
        _id, email
      },
    })

    return {
      _id : newPermission?._id,
      createdAt: newPermission?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population, projection } = aqp(queryString); // population dùng để join table

    delete filter.current;
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.roleModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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
      throw new BadRequestException(`not found role with id=${id}`)
    let role = await this.roleModel.findById(id);

    if(role){
      return role.populate({
        path: "permissions",  // permissions này tương úng với permissions đc khai báo trong schema
        select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 } 
      })
    }
    return role
    
     // = 1 ~~ get ra field đó => -1 : bỏ field đó
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = updateRoleDto;
    
    if(!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`not found role with id=${id}`)

    return await this.roleModel.updateOne(
      {_id: id},
      {
        name, description, isActive, permissions,
        updatedBy:{
          _id: user._id,
          email: user.email,
        },
      }
    )
  }

  async remove(id: string, user: IUser) {
    if(!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`not found role with id=${id}`)

    const foundRole = await this.roleModel.findById(id);
    if(foundRole.name === ADMIN_ROLE){
      throw new BadRequestException(`Không có quyền xóa role ADMIN`);
    }
    
    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy:{
          _id: user._id,
          email: user.email,
        }
      }
    )
    return this.roleModel.softDelete({
      _id: id, 
    })
  }
}
