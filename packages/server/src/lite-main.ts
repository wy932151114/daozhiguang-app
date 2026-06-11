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
import type { NestExpressApplication } from '@nestjs/platform-express';

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

/**
 * 注册所有手动API路由（直接操作Express实例，绕过NestJS控制器）
 */
function registerAPIRoutes(app: NestExpressApplication, baziEngine: BaziEngine) {
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

  console.log(`  📦 已注册 ${2} 个手动API路由`);
}

/**
 * 注册SPA catch-all中间件
 * 所有非API请求返回 index.html（支持Next.js客户端路由）
 */
function registerSPACatchAll(app: NestExpressApplication, frontendOutDir: string) {
  const expressApp = app.getHttpAdapter().getInstance();
  const path = require('path');

  // 先注册静态文件中间件
  expressApp.use(require('express').static(frontendOutDir));

  // 再注册SPA catch-all（在静态文件中间件之后，API路由之后）
  expressApp.use((req: any, res: any, next: any) => {
    // API请求 — 跳过（由上方手动路由处理，或返回404）
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // SPA路径 — 返回 index.html
    // 包括 _next/（Next.js静态资源）、h5/（子页面）、console/、/ 等
    return res.sendFile(path.join(frontendOutDir, 'index.html'));
  });
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(LiteAppModule, {
    logger,
    abortOnError: false,
  });

  app.enableCors({
    origin: true, // 允许所有来源（局域网其他设备的访问）
    credentials: true,
  });

  // 全局前缀（仅影响NestJS控制器，不影响手动Express路由）
  app.setGlobalPrefix('api/v1');

  // body parser
  const express = require('express');
  app.getHttpAdapter().use(express.json());

  // 获取引擎实例（必须在API路由注册之前获取）
  const baziEngine = app.get(BaziEngine);

  // 注册所有手动API路由（在中间件之前注册，确保优先匹配）
  registerAPIRoutes(app, baziEngine);

  // ============================================================
  // 生产模式：后端托管前端静态文件
  // ============================================================
  const path = require('path');
  const fs = require('fs');
  const frontendOutDir = path.join(process.cwd(), 'apps/web-console/out');

  if (fs.existsSync(frontendOutDir)) {
    registerSPACatchAll(app, frontendOutDir);
    console.log(`  🖥️  前端静态文件: ${frontendOutDir}`);
  } else {
    console.log(`  ⚠️  前端静态目录不存在，仅API模式: ${frontendOutDir}`);
  }

  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`\n🚀 龙道命理计算游戏 (Lite) 已启动!
  📡 API: http://localhost:${port}/api/v1
  🌐 局域网: http://0.0.0.0:${port}/api/v1
  📋 健康检查: http://localhost:${port}/api/v1/health
  📋 八字排盘: POST /api/v1/bazi/calculate`);
}

bootstrap().catch((e: any) => {
  console.error('启动失败:', e.message);
  process.exit(1);
});
