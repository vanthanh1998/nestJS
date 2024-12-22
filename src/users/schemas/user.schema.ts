
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  address: string;

  @Prop()
  created_at: Date;

  @Prop()
  updated_ad: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  detetedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
