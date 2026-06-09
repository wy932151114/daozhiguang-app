// ============================================================
// 道之光·命理AI系统 — MongoDB Schema: 用户
// ============================================================

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true })
  nickname: string;

  @Prop({ type: String, unique: true, sparse: true })
  phone: string;

  @Prop({ type: String, unique: true, sparse: true })
  wechatOpenid: string;

  @Prop({ type: String })
  avatarUrl: string;

  @Prop({ type: String, enum: ['free', 'basic', 'premium', 'vip'], default: 'free' })
  membershipLevel: string;

  @Prop({ type: Number, default: 0 })
  points: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  lastLoginAt: Date;

  /** 用户当前困扰/目标领域（用于AI针对性分析） */
  @Prop({ type: String })
  currentProblem: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ wechatOpenid: 1 });
UserSchema.index({ phone: 1 });
