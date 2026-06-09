// ============================================================
// 道之光·命理AI系统 — 八字模块：控制器
// ============================================================

import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { BaziService } from './bazi.service';

@Controller('bazi')
export class BaziController {
  constructor(private readonly baziService: BaziService) {}

  /**
   * POST /api/v1/bazi/calculate
   * 八字排盘
   */
  @Post('calculate')
  async calculate(@Body() input: {
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
    return this.baziService.calculate(input);
  }

  /**
   * GET /api/v1/bazi/:id
   * 获取历史排盘结果
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.baziService.getById(id);
  }
}
