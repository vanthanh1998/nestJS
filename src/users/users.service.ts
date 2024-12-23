import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) 
    private userModel: SoftDeleteModel<UserDocument>
  ) {}

  // hash pw
  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(thanhrain: CreateUserDto) {
    const hashPassword = this.getHashPassword(thanhrain.password)

    let user = await this.userModel.create({
      email: thanhrain.email, 
      password: hashPassword, 
      name: thanhrain.name
    })
    return user;
  }

  async register(user: RegisterUserDto){
    const { name, email, password, age, gender, address } = user;

    // check mail
    const isExistEmail = await this.userModel.findOne({ email });
    if(isExistEmail){
      throw new BadRequestException(`Email ${email} đã tồn tại, Vui lòng sử dụng email khác.`)
    }

    const hashPassword = this.getHashPassword(password)

    let registerUser = await this.userModel.create({
      name,
      email, 
      password: hashPassword, 
      age,
      gender,
      address,
      role: "USER",
    });

    return registerUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id))
      return "not found";

    return this.userModel.findOne({
      _id: id
    })
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username
    })
  }

  isValidPassword(password: string, hashPW: string){
    return compareSync(password, hashPW);
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({ _id: updateUserDto._id}, { ...updateUserDto })
  }

  async remove(id: string) {
    if(!mongoose.Types.ObjectId.isValid(id))
      return "not found user id";

    return await this.userModel.softDelete({
      _id: id
    })
  }
}
