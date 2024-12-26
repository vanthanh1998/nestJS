import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;
  
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
  }
export class CreateJobDto {
    @IsNotEmpty({ message: 'Name k đc để trống', })
    name: string;

    @IsNotEmpty({ message: 'skills k đc để trống', })
    @IsArray({ message: 'skills có định dạng là array', })
    // each => test từng phần tử trong array, nếu k có định dạng string báo error
    @IsString({ each: true, message: 'skills định dạng là string', }) 
    skills: string[];

    @IsNotEmptyObject()
        @IsObject()
        @ValidateNested()
        @Type(() => Company)
        company: Company;

    @IsNotEmpty({ message: 'location k đc để trống', })
    location: string;

    @IsNotEmpty({ message: 'salary k đc để trống', })
    salary: number;

    @IsNotEmpty({ message: 'quantity k đc để trống', })
    quantity: number;

    @IsNotEmpty({ message: 'level k đc để trống', })
    level: string;

    @IsNotEmpty({ message: 'description k đc để trống', })
    description: string;

    @IsNotEmpty({ message: 'startDate k đc để trống', })
    @Transform( ({ value }) => new Date(value) )
    @IsDate({ message: 'startDate có định dạng là date', })
    startDate: Date;

    @IsNotEmpty({ message: 'endDate k đc để trống', })
    @Transform( ({ value }) => new Date(value) )
    @IsDate({ message: 'endDate có định dạng là date', })
    endDate: Date;

    @IsNotEmpty({ message: 'isActive k đc để trống', })
    @IsBoolean({ message: 'isActive có định dạng là boolean', })
    isActive: boolean;
}
