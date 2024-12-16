import { IsEmail, IsNotEmpty } from 'class-validator';

// data transfer object // class = {}
export class CreateUserDto {
    @IsEmail({}, { message: 'Email k đúng định dạng', })
    @IsNotEmpty({ message: 'Email k đc để trống', })
    email: string;

    @IsNotEmpty({ message: 'Password k đc để trống', })
    password: string;

    name: string;
    address: string;
}
