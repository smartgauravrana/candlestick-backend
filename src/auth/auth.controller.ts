import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleOauthGuard } from './google-oauth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { Public } from './public.decorator';

@Controller()
export class AuthController {
  readonly WEB_URL: string;
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    this.WEB_URL = this.configService.get<string>('WEB_APPURL');
  }
  @Get('auth/google')
  @Public()
  @UseGuards(GoogleOauthGuard)
  async googleAuth(@Req() _req) {
    // Guard redirects
  }

  @Get('auth/callback/google')
  @Public()
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // For now, we'll just show the user object
    const { accessToken } = await this.authService.login(req.user);
    res.cookie('jwt', accessToken, {
      sameSite: 'lax',
    });
    return res.redirect(this.WEB_URL);
  }

  @Get('auth/signout')
  async signOut(@Res() res: Response) {
    res.clearCookie('jwt');
    res.redirect(this.WEB_URL);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.authService.getCurrentUser(req.user.userId);
  }
}
