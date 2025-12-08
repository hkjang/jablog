import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TopicsModule } from './topics/topics.module';
import { KeywordsModule } from './keywords/keywords.module';
import { PrismaModule } from './prisma/prisma.module';
import { ContentModule } from './content/content.module';
import { PublishingModule } from './publishing/publishing.module';
import { SeoModule } from './seo/seo.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { ScheduleModule } from './schedule/schedule.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    PrismaModule,
    TopicsModule,
    KeywordsModule,
    ContentModule,
    PublishingModule,
    SeoModule,
    DashboardModule,
    AnalyticsModule,
    PipelineModule,
    ScheduleModule,
    MonitoringModule,
    AiModule,
    UsersModule,
    ReportsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

