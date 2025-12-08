"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const topics_module_1 = require("./topics/topics.module");
const keywords_module_1 = require("./keywords/keywords.module");
const prisma_module_1 = require("./prisma/prisma.module");
const content_module_1 = require("./content/content.module");
const publishing_module_1 = require("./publishing/publishing.module");
const seo_module_1 = require("./seo/seo.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const analytics_module_1 = require("./analytics/analytics.module");
const pipeline_module_1 = require("./pipeline/pipeline.module");
const schedule_module_1 = require("./schedule/schedule.module");
const monitoring_module_1 = require("./monitoring/monitoring.module");
const ai_module_1 = require("./ai/ai.module");
const users_module_1 = require("./users/users.module");
const reports_module_1 = require("./reports/reports.module");
const settings_module_1 = require("./settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            topics_module_1.TopicsModule,
            keywords_module_1.KeywordsModule,
            content_module_1.ContentModule,
            publishing_module_1.PublishingModule,
            seo_module_1.SeoModule,
            dashboard_module_1.DashboardModule,
            analytics_module_1.AnalyticsModule,
            pipeline_module_1.PipelineModule,
            schedule_module_1.ScheduleModule,
            monitoring_module_1.MonitoringModule,
            ai_module_1.AiModule,
            users_module_1.UsersModule,
            reports_module_1.ReportsModule,
            settings_module_1.SettingsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map