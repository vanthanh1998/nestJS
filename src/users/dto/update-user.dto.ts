import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// OmitType: bỏ đi trường nào k đc update
export class UpdateUserDto extends OmitType(CreateUserDto, ['password'] as const) {
    _id: string; // chỗ này nếu gửi body lên sẽ biết đc sự tồn tại của id này
}
