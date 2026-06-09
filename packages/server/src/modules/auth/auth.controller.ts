// ============================================================
// 道之光·命理AI系统 — Auth模块：控制器
// ============================================================

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/wechat-login
   * 微信登录
   */
  @Post('wechat-login')
  async wechatLogin(@Body() body: { code: string }) {
    return this.authService.wechatLogin(body.code);
  }

  /**
   * POST /api/v1/auth/phone-login
   * 手机号登录
   */
  @Post('phone-login')
  async phoneLogin(@Body() body: { phone: string; nickname?: string }) {
    return this.authService.phoneLogin(body.phone, body.nickname);
  }

  /**
   * POST /api/v1/auth/guest-login
   * 访客登录（无需注册）
   */
  @Post('guest-login')
  async guestLogin() {
    return this.authService.guestLogin();
  }
}
