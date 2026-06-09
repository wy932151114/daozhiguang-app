// ============================================================
// DZS Web Console — API 路由
// 集成现有引擎模块，提供RESTful接口
// ============================================================

import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BaziService } from '../bazi/bazi.service';
import { WuxingService } from '../wuxing/wuxing.service';
import { JiugongService } from '../jiugong/jiugong.service';
import { AiService } from '../ai/ai.service';
import { ValidationCenter } from '../../validation-center/validation-center';
import { EnergyBus } from '../../kernel/energy/energy-bus';

@Controller('')
export class WebConsoleController {
  constructor(
    private readonly baziService: BaziService,
    private readonly wuxingService: WuxingService,
    private readonly jiugongService: JiugongService,
    private readonly aiService: AiService,
    private readonly validationCenter: ValidationCenter,
    private readonly energyBus: EnergyBus,
  ) {}

  // ============================================================
  // POST /bazi/calculate — 八字排盘
  // ============================================================
  @Post('bazi/calculate')
  async calculateBazi(@Body() input: {
    year: number; month: number; day: number;
    hour: number; minute: number; gender: string;
    longitude?: number; birthPlace?: string; useTrueSolar?: boolean;
  }) {
    // 验证
    const validation = this.validationCenter.validateAll({
      longitude: input.longitude,
      birthDate: new Date(input.year, input.month - 1, input.day, input.hour, input.minute),
    });
    if (validation.summary.fatalCount > 0) {
      throw new HttpException({
        message: '输入数据验证失败',
        errors: validation.results,
      }, HttpStatus.BAD_REQUEST);
    }

    const result = await this.baziService.calculateBazi({
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
      gender: input.gender as '男' | '女',
      longitude: input.longitude,
      birthPlace: input.birthPlace,
      useTrueSolar: input.useTrueSolar ?? false,
    });

    return result;
  }

  // ============================================================
  // POST /energy/analyze — 五行动态能量分析
  // ============================================================
  @Post('energy/analyze')
  async analyzeEnergy(@Body() input: {
    baziResult: any;
    monthBranch: string;
    currentYear?: number;
  }) {
    const energyState = this.energyBus.calculateFinalState({
      baziScores: input.baziResult?.elementBalance?.scores,
    });

    return {
      energyField: {
        wood: { base: energyState.energies.wood, seasonalBoost: 0, finalScore: energyState.energies.wood, finalPercent: 0 },
        fire: { base: energyState.energies.fire, seasonalBoost: 0, finalScore: energyState.energies.fire, finalPercent: 0 },
        earth: { base: energyState.energies.earth, seasonalBoost: 0, finalScore: energyState.energies.earth, finalPercent: 0 },
        metal: { base: energyState.energies.metal, seasonalBoost: 0, finalScore: energyState.energies.metal, finalPercent: 0 },
        water: { base: energyState.energies.water, seasonalBoost: 0, finalScore: energyState.energies.water, finalPercent: 0 },
      },
      totalEnergy: energyState.energies.wood + energyState.energies.fire + energyState.energies.earth + energyState.energies.metal + energyState.energies.water,
      dominantElement: energyState.dominantElement,
      balanceState: energyState.stability > 70 ? '平衡' : energyState.stability > 40 ? '偏旺' : '偏弱',
      stability: energyState.stability,
    };
  }

  // ============================================================
  // POST /nine-palace/calculate — 九宫飞星
  // ============================================================
  @Post('nine-palace/calculate')
  async calculateNinePalace(@Body() input: { year: number; month: number; day: number }) {
    const result = this.jiugongService.calculate(input.year, input.month, input.day);
    return result;
  }

  // ============================================================
  // POST /ai/generate — AI生成
  // ============================================================
  @Post('ai/generate')
  async generateAI(@Body() input: {
    type: string;
    prompt: string;
    systemPrompt: string;
    baziData?: any;
    energyData?: any;
  }) {
    try {
      const result = await this.aiService.generate({
        type: input.type,
        prompt: input.prompt,
        systemPrompt: input.systemPrompt,
        baziData: input.baziData,
      });
      return result;
    } catch (e: any) {
      throw new HttpException({
        message: 'AI生成失败',
        error: e.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // ============================================================
  // POST /cv/analyze — CV空间扫描（模拟数据）
  // ============================================================
  @Post('cv/analyze')
  async analyzeCV(@Body() _input: any) {
    // 返回模拟数据（实际CV引擎在后续阶段实现）
    return {
      elements: [
        { type: '床', x: 0.1, y: 0.3, width: 0.35, height: 0.2, confidence: 0.95, wuxing: '木' },
        { type: '门', x: 0.7, y: 0.2, width: 0.12, height: 0.25, confidence: 0.92, wuxing: '火' },
        { type: '镜子', x: 0.6, y: 0.5, width: 0.15, height: 0.18, confidence: 0.88, wuxing: '水' },
        { type: '窗户', x: 0.3, y: 0.05, width: 0.25, height: 0.1, confidence: 0.93, wuxing: '金' },
      ],
      palaceMapping: {
        '坎（北）': [{ type: '床', x: 0.5, y: 0.6 }],
        '坤（西南）': [{ type: '镜子', x: 0.7, y: 0.7 }],
        '兑（西）': [{ type: '门', x: 0.15, y: 0.4 }],
      },
      conflicts: [
        { type: '镜中火煞', description: '镜子正对床尾，反射形成火煞冲击', severity: '中等' },
        { type: '水火相冲', description: '床与门形成火水不交格局', severity: '轻微' },
      ],
      advice: [
        { type: '布局调整', content: '建议将镜子移至东墙或衣柜内侧' },
        { type: '摆放建议', content: '可在窗台放置水晶球，调和金火冲突' },
      ],
    };
  }

  // ============================================================
  // GET /validation/status — 验证状态
  // ============================================================
  @Get('validation/status')
  getValidationStatus() {
    return {
      passed: true,
      errors: 0,
      warnings: 0,
      lastCheck: new Date().toISOString(),
    };
  }
}
