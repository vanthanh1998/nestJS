import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';

// OmitType: bỏ đi trường nào k đc update
export class UpdateUserDto extends OmitType(CreateUserDto, ['password'] as const) {
    @IsNotEmpty({ message: '_id k đc để trống' })
    _id: string; // chỗ này nếu gửi body lên sẽ biết đc sự tồn tại của id này
}
