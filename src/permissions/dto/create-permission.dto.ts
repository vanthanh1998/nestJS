import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: 'name k đc để trống', })
    name: string;
    
    @IsNotEmpty({ message: 'apiPath k đc để trống', })
    apiPath: string;

    @IsNotEmpty({ message: 'method k đc để trống', })
    method: string;

    @IsNotEmpty({ message: 'module k đc để trống', })
    module: string;
}
