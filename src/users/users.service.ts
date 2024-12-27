import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) 
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name) 
    private roleModel: SoftDeleteModel<RoleDocument>
  ) {}

  // hash pw
  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { name, email, password, age, gender, address, role, company } = createUserDto;

    // check mail
    const isExistEmail = await this.userModel.findOne({ email });
    if(isExistEmail){
      throw new BadRequestException(`Email ${email} đã tồn tại, Vui lòng sử dụng email khác.`)
    }

    const hashPassword = this.getHashPassword(password)

    let newUser = await this.userModel.create({
      name, email, 
      password: hashPassword, 
      age, gender, address, role, company,
      createdBy:{
        _id: user._id,
        email: user.email,
      }
    })

    return {
      _id : newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  async register(user: RegisterUserDto){
    const { name, email, password, age, gender, address } = user;

    // check mail
    const isExistEmail = await this.userModel.findOne({ email });
    if(isExistEmail){
      throw new BadRequestException(`Email ${email} đã tồn tại, Vui lòng sử dụng email khác.`)
    }

    // fetch user role
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const hashPassword = this.getHashPassword(password)

    let registerUser = await this.userModel.create({
      name,
      email, 
      password: hashPassword, 
      age,
      gender,
      address,
      role: userRole?._id,
    });

    return registerUser;
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id}, 
      { 
        ...updateUserDto,
        updatedBy:{
          _id: user._id,
          email: user.email,
        }
      })
  }

  async remove(id: string, user: IUser) {
    if(!mongoose.Types.ObjectId.isValid(id))
      return "not found user id";

    const foundUser = await this.userModel.findById(id);
    if(foundUser.email === "thanhchonthanh@gmail.com"){
      throw new BadRequestException(`Không có quyền xóa tài khoản này`);
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy:{
          _id: user._id,
          email: user.email,
        }
      }
    )

    return this.userModel.softDelete({
      _id: id
    })
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population } = aqp(queryString); // population dùng để join table

    delete filter.current;
    delete filter.pageSize

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .select('-password')
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

  findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`not found user with id=${id}`)

    return this.userModel.findById({
      _id: id
    }).select('-password')
    .populate({
      path: "role",  // role này tương úng với permissions đc khai báo trong schema
      select: { _id: 1, name: 1 } 
    }) // = 1 ~~ get ra field đó => -1 : bỏ field đó;
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    }).populate({
      path: "role", // role này tương úng với permissions đc khai báo trong schema
      select: { name: 1 } 
    }) // = 1 ~~ get ra field đó => -1 : bỏ field đó;
  }

  isValidPassword(password: string, hashPW: string){
    return compareSync(password, hashPW);
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    )
  }

  findUserByToken = async(refreshToken: string) => {
    return await this.userModel.findOne({refreshToken})
    .populate({
      path: "role", // role này tương úng với permissions đc khai báo trong schema
      select: { name: 1 } 
    })
  }
}
