import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'name k đc để trống', })
    name: string;
    
    @IsNotEmpty({ message: 'description k đc để trống', })
    description: string;

    @IsNotEmpty({ message: 'isActive k đc để trống', })
    @IsBoolean({ message: 'isActive có giá trị là boolean', })
    isActive: boolean;

    @IsNotEmpty({ message: 'permissions k đc để trống', })
    @IsMongoId({ each: true, message: 'each permission là mongo object id', })
    @IsArray({ message: 'permissions có định dạng là array', })
    permissions: mongoose.Schema.Types.ObjectId[];
}
