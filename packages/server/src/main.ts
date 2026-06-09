// ============================================================
// 道之光·命理AI系统 — 应用入口 (NestJS)
// ============================================================

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger });

  // 全局管道：参数验证
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // CORS（前后端分离 + WSL跨机访问）
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3333', 'http://172.31.138.38:3333'],
    credentials: true,
  });

  // API前缀
  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);

  // 尝试连接MongoDB，失败也继续运行（mock模式）
  try {
    await app.init();
    logger.log('Application initialized');
  } catch (e) {
    logger.warn(`Init warning (non-fatal): ${e.message}`);
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`🪷 DZS-OS API Server :${port}/api/v1`);
  console.log(`\n🚀 DZS-OS 道之光命理AI系统 已启动!
  📡 API: http://localhost:${port}/api/v1
  🌐 Windows: http://172.31.138.38:${port}/api/v1`);
}
bootstrap();
