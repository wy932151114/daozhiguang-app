// ============================================================
// 道之光·命理AI系统 — DTO: 登录/用户操作
// ============================================================

import { IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  code: string;
}

export class PhoneLoginDto {
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
