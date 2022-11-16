import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getCurrentUser(userId: string) {
    return this.usersService.getUser({ _id: userId });
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id, ...user };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
