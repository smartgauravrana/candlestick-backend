import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  profilePic: string;

  @Prop({ default: 1 })
  userType?: number;

  @Prop()
  provider?: string;

  @Prop({ default: new Date() })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
