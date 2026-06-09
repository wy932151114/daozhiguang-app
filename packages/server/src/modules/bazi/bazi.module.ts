// ============================================================
// 道之光·命理AI系统 — 八字模块 (BaziModule)
// 排盘入口 → 返回四柱+纳音+藏干
// ============================================================

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BaziController } from './bazi.controller';
import { BaziService } from './bazi.service';
import { BaziResult, BaziResultSchema } from '../../database/schemas';
import { BaziEngine } from '../../engines';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BaziResult.name, schema: BaziResultSchema },
    ]),
  ],
  controllers: [BaziController],
  providers: [BaziService, BaziEngine],
  exports: [BaziService, BaziEngine],
})
export class BaziModule {}
