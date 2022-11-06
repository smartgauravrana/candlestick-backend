import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(email: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ email }).lean();
    return user;
  }

  async create(user: User): Promise<User> {
    return this.userModel.create(user);
  }
}
