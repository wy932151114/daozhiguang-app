// ============================================================
// 道之光·命理AI系统 — Wuxing模块
// ============================================================

import { Module } from '@nestjs/common';
import { WuxingController } from './wuxing.controller';
import { WuxingService } from './wuxing.service';
import { WuxingEngine } from '../../engines';

@Module({
  controllers: [WuxingController],
  providers: [WuxingService, WuxingEngine],
  exports: [WuxingService, WuxingEngine],
})
export class WuxingModule {}
