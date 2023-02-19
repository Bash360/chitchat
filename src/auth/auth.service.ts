import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/models/user.model';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  async login(user: User) {
    const payLoad = { id: user._id, email: user.email, avatar: user.avatar };

    return { access_token: await this.jwtService.signAsync(payLoad) };
  }

  async verify(id: string) {
    const payLoad = { id };

    return { access_token: await this.jwtService.signAsync(payLoad) };
  }

  async extract(token) {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.SECRET,
    });
  }
}
