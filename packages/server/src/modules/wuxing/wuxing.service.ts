// ============================================================
// 道之光·命理AI系统 — Wuxing模块：服务
// ============================================================

import { Injectable } from '@nestjs/common';
import { WuxingEngine } from '../../engines';

@Injectable()
export class WuxingService {
  constructor(private readonly engine: WuxingEngine) {}
}
