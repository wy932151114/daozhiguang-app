// ============================================================
// 道之光·命理AI系统 — Jiugong模块：服务
// ============================================================

import { Injectable } from '@nestjs/common';
import { JiugongEngine } from '../../engines';

@Injectable()
export class JiugongService {
  constructor(private readonly engine: JiugongEngine) {}
}
