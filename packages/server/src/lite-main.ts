// ============================================================
// 道之光·命理AI系统 — 精简模式入口（零数据库依赖）
// ============================================================

import { NestFactory } from '@nestjs/core';
import { Module, ValidationPipe, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// 纯引擎模块（无Mongoose）
import { WuxingModule } from './modules/wuxing/wuxing.module';
import { JiugongModule } from './modules/jiugong/jiugong.module';
import { DayunModule } from './modules/dayun/dayun.module';
import { ShenshaModule } from './modules/shensha/shensha.module';

// 简易路由（直接调用引擎，无数据库）
import { BaziEngine } from './engines';
import { WuxingEngine } from './engines/wuxing-engine/wuxing.engine';
import { JiugongEngine } from './engines/jiugong-engine/jiugong.engine';
import { DayunEngine } from './engines/dayun-engine/dayun.engine';
import { ShenshaEngine } from './engines/shensha-engine/shensha.engine';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    WuxingModule,
    JiugongModule,
    DayunModule,
    ShenshaModule,
  ],
  controllers: [],
  providers: [BaziEngine],
})
export class LiteAppModule {}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(LiteAppModule, {
    logger,
    abortOnError: false,
  });

  app.enableCors({
    origin: true, // 允许所有来源（局域网其他设备的访问）
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  // body parser
  const express = require('express');
  app.getHttpAdapter().use(express.json());

  // ============================================================
  // 生产模式：后端托管前端静态文件
  // 路径：daozhiguang/apps/web-console/out/  (next build输出目录)
  // ============================================================
  const path = require('path');
  const fs = require('fs');
  const frontendOutDir = path.join(__dirname, '../../apps/web-console/out');
  if (fs.existsSync(frontendOutDir)) {
    // 服务静态文件
    app.getHttpAdapter().use(express.static(frontendOutDir));
    // 所有非API路由返回 index.html（支持SPA路由）
    app.getHttpAdapter().use('*', (req: any, res: any, next: any) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(frontendOutDir, 'index.html'));
    });
    console.log(`  🖥️  前端静态文件: ${frontendOutDir}`);
  } else {
    console.log(`  ⚠️  前端静态目录不存在，仅API模式: ${frontendOutDir}`);
  }

  // 获取引擎实例
  const baziEngine = app.get(BaziEngine);

  // 注册手动路由（绕过Mongoose控制器）
  const router = app.getHttpAdapter().getInstance();

  // 八字排盘
  router.post('/api/v1/bazi/calculate', (req: any, res: any) => {
    try {
      const { year, month, day, hour, minute, gender, longitude, useTrueSolar } = req.body;
      const bazi = baziEngine.calculate({
        year, month, day, hour, minute, gender,
        longitude: longitude || undefined,
        useTrueSolar: useTrueSolar || false,
      });
      res.json({ success: true, data: bazi });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  });

  // 健康检查
  router.get('/api/v1/health', (_req: any, res: any) => {
    res.json({
      status: 'ok',
      version: '1.0.0',
      mode: 'lite',
      timestamp: new Date().toISOString(),
      modules: ['bazi', 'wuxing', 'jiugong', 'dayun', 'shensha'],
    });
  });

  const port = 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 DZS-OS 道之光命理AI系统 (Lite) 已启动!
  📡 API: http://localhost:${port}/api/v1
  🌐 Windows: http://172.31.138.38:${port}/api/v1
  📋 健康检查: http://localhost:${port}/api/v1/health
  📋 八字排盘: POST /api/v1/bazi/calculate`);
}

bootstrap().catch((e: any) => {
  console.error('启动失败:', e.message);
  process.exit(1);
});
