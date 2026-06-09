// ============================================================
// 道之光·命理AI系统 — 根模块
// ============================================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

// 业务模块
import { BaziModule } from './modules/bazi/bazi.module';
import { WuxingModule } from './modules/wuxing/wuxing.module';
import { JiugongModule } from './modules/jiugong/jiugong.module';
import { DayunModule } from './modules/dayun/dayun.module';
import { ShenshaModule } from './modules/shensha/shensha.module';
import { AiModule } from './modules/ai/ai.module';
import { DailyFortuneModule } from './modules/daily-fortune/daily-fortune.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RitualModule } from './modules/ritual/ritual.module';
import { MembershipModule } from './modules/membership/membership.module';
import { WebConsoleModule } from './modules/web-console/web-console.module';

@Module({
  imports: [
    // 配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 数据库
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/daozhiguang'),
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      }),
    }),

    // 限流保护
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // 业务模块
    AuthModule,
    UserModule,
    BaziModule,
    WuxingModule,
    JiugongModule,
    DayunModule,
    ShenshaModule,
    DailyFortuneModule,
    AiModule,
    RitualModule,
    MembershipModule,
    WebConsoleModule,
  ],
})
export class AppModule {}
