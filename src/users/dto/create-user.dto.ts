import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

// data transfer object // class = {}

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;
  
    @IsNotEmpty()
    name: string;
  }
  
export class CreateUserDto {
    @IsNotEmpty({ message: 'Name k đc để trống', })
    name: string;

    @IsEmail({}, { message: 'Email k đúng định dạng', })
    @IsNotEmpty({ message: 'Email k đc để trống', })
    email: string;

    @IsNotEmpty({ message: 'Password k đc để trống', })
    password: string;

    @IsNotEmpty({ message: 'Age k đc để trống', })
    age: string;

    @IsNotEmpty({ message: 'Gender k đc để trống', })
    gender: string;

    @IsNotEmpty({ message: 'Address k đc để trống', })
    address: string;

    @IsNotEmpty({ message: 'Role k đc để trống', })
    @IsMongoId({ message: 'Role có định dạng là mongo id', }) // do use ref nên phải check mongo id
    role: string;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;
}

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Name k đc để trống', })
    name: string;

    @IsEmail({}, { message: 'Email k đúng định dạng', })
    @IsNotEmpty({ message: 'Email k đc để trống', })
    email: string;

    @IsNotEmpty({ message: 'Password k đc để trống', })
    password: string;

    @IsNotEmpty({ message: 'Age k đc để trống', })
    age: string;

    @IsNotEmpty({ message: 'Gender k đc để trống', })
    gender: string;

    @IsNotEmpty({ message: 'Address k đc để trống', })
    address: string;
}
