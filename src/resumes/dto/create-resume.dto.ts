import { IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
    @IsNotEmpty({ message: 'email k đc để trống', })
    email: string;
    
    @IsNotEmpty({ message: 'userId k đc để trống', })
    userId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'url k đc để trống', })
    url: string;

    @IsNotEmpty({ message: 'status k đc để trống', })
    status: string;

    @IsNotEmpty({ message: 'companyId k đc để trống', })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'jobId k đc để trống', })
    jobId: mongoose.Schema.Types.ObjectId;

    // history : array object
}

export class CreateUserCvDto { // dùng để khi chưa login thì sẽ redirect đến page đang đứng trc khi login
    @IsNotEmpty({ message: 'url k đc để trống', })
    url: string;
    
    @IsNotEmpty({ message: 'companyId k đc để trống', })
    @IsMongoId({ message: 'companyId is a mongo id', })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'jobId k đc để trống', })
    @IsMongoId({ message: 'jobId is a mongo id', })
    jobId: mongoose.Schema.Types.ObjectId;
}

