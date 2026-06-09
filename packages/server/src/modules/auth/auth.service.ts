// ============================================================
// 道之光·命理AI系统 — Auth模块：认证服务
// 微信一键登录 + JWT + 匿名访客
// ============================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../database/schemas';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * 微信小程序登录
   * 流程：前端调用wx.login → 获取code → 后端调微信接口 → 获取openid
   */
  async wechatLogin(code: string): Promise<{ token: string; user: any; isNew: boolean }> {
    // 这里需要用 code 调微信服务器获取 openid
    // 真实环境：https://api.weixin.qq.com/sns/jscode2session
    // 当前用模拟数据做骨架，实际接入时替换
    const mockOpenid = `wx_${code}_${Date.now()}`;

    let user = await this.userModel.findOne({ wechatOpenid: mockOpenid }).exec();
    let isNew = false;

    if (!user) {
      user = await this.userModel.create({
        nickname: `道友${code.substring(0, 4)}`,
        wechatOpenid: mockOpenid,
        membershipLevel: 'free',
      });
      isNew = true;
    }

    // 更新最后登录
    user.lastLoginAt = new Date();
    await user.save();

    const token = this.jwtService.sign({
      sub: user._id,
      openid: user.wechatOpenid,
    });

    return {
      token,
      user: this.sanitizeUser(user),
      isNew,
    };
  }

  /**
   * 手机号注册/登录
   */
  async phoneLogin(phone: string, nickname?: string): Promise<{ token: string; user: any; isNew: boolean }> {
    let user = await this.userModel.findOne({ phone }).exec();
    let isNew = false;

    if (!user) {
      user = await this.userModel.create({
        nickname: nickname || `道友${phone.slice(-4)}`,
        phone,
        membershipLevel: 'free',
      });
      isNew = true;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.jwtService.sign({
      sub: user._id,
      phone: user.phone,
    });

    return { token, user: this.sanitizeUser(user), isNew };
  }

  /**
   * 访客登录（无需注册）
   */
  async guestLogin(): Promise<{ token: string; user: any }> {
    const guest = await this.userModel.create({
      nickname: `游客${Date.now().toString().slice(-6)}`,
      membershipLevel: 'free',
    });

    const token = this.jwtService.sign({ sub: guest._id, isGuest: true });

    return { token, user: this.sanitizeUser(guest) };
  }

  /**
   * 验证Token有效性
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Token无效或已过期');
    }
  }

  private sanitizeUser(user: any) {
    return {
      id: user._id,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      membershipLevel: user.membershipLevel,
      isNew: false,
    };
  }
}
