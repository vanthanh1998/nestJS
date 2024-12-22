import { IsNotEmpty } from 'class-validator';

// data transfer object // class = {}
export class CreateCompanyDto {
    @IsNotEmpty({ message: 'Name k đc để trống', })
    name: string;

    @IsNotEmpty({ message: 'Address k đc để trống', })
    address: string;

    @IsNotEmpty({ message: 'Desc k đc để trống', })
    desc: string;
}
