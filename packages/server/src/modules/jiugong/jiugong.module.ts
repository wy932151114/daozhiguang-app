// ============================================================
// 道之光·命理AI系统 — Jiugong模块
// ============================================================

import { Module } from '@nestjs/common';
import { JiugongController } from './jiugong.controller';
import { JiugongService } from './jiugong.service';
import { JiugongEngine } from '../../engines';

@Module({
  controllers: [JiugongController],
  providers: [JiugongService, JiugongEngine],
  exports: [JiugongService, JiugongEngine],
})
export class JiugongModule {}
