// ============================================================
// 道之光·命理AI系统 — 八字模块：服务
// 排盘 + 保存 + 读取
// ============================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaziResult } from '../../database/schemas';
import { BaziEngine } from '../../engines';

@Injectable()
export class BaziService {
  constructor(
    @InjectModel(BaziResult.name)
    private baziModel: Model<BaziResult>,
    private baziEngine: BaziEngine,
  ) {}

  /**
   * 排盘并保存
   */
  async calculate(input: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: '男' | '女';
    longitude?: number;
    useTrueSolar?: boolean;
    saveToHistory?: boolean;
    userId?: string;
  }) {
    // 1. 规则引擎计算（精确，不依赖AI）
    const result = this.baziEngine.calculate(input);

    // 2. 保存到数据库（如果需要）
    if (input.saveToHistory && input.userId) {
      // 这里用schema存储（略，后面补）
    }

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 根据ID获取历史排盘
   */
  async getById(id: string) {
    const doc = await this.baziModel.findById(id).exec();
    if (!doc) throw new NotFoundException('排盘记录不存在');
    return doc;
  }
}
