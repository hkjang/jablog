"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MonitoringService = class MonitoringService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getApiErrors(page = 1, limit = 20, platform, resolved) {
        const where = {};
        if (platform)
            where.platform = platform;
        if (resolved !== undefined)
            where.resolved = resolved;
        const [errors, total] = await Promise.all([
            this.prisma.apiErrorLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            this.prisma.apiErrorLog.count({ where })
        ]);
        return {
            errors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getApiErrorStats() {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalErrors, unresolvedErrors, last24HoursCount, last7DaysCount, byPlatform, byEndpoint, retryStats] = await Promise.all([
            this.prisma.apiErrorLog.count(),
            this.prisma.apiErrorLog.count({ where: { resolved: false } }),
            this.prisma.apiErrorLog.count({ where: { createdAt: { gte: last24Hours } } }),
            this.prisma.apiErrorLog.count({ where: { createdAt: { gte: last7Days } } }),
            this.prisma.apiErrorLog.groupBy({
                by: ['platform'],
                _count: true,
                where: { createdAt: { gte: last7Days } }
            }),
            this.prisma.apiErrorLog.groupBy({
                by: ['endpoint'],
                _count: true,
                where: { createdAt: { gte: last7Days } },
                orderBy: { _count: { endpoint: 'desc' } },
                take: 5
            }),
            this.prisma.apiErrorLog.aggregate({
                _avg: { retryCount: true },
                _max: { retryCount: true },
                where: { createdAt: { gte: last7Days } }
            })
        ]);
        const publishingStats = await this.prisma.publishingLog.groupBy({
            by: ['status'],
            _count: true,
            where: { createdAt: { gte: last7Days } }
        });
        const successCount = publishingStats.find(s => s.status === 'SUCCESS')?._count || 0;
        const failedCount = publishingStats.find(s => s.status === 'FAILED')?._count || 0;
        const totalPublishes = successCount + failedCount;
        return {
            totalErrors,
            unresolvedErrors,
            last24Hours: last24HoursCount,
            last7Days: last7DaysCount,
            errorRate: totalPublishes > 0
                ? Math.round((failedCount / totalPublishes) * 10000) / 100
                : 0,
            successRate: totalPublishes > 0
                ? Math.round((successCount / totalPublishes) * 10000) / 100
                : 100,
            byPlatform: byPlatform.map(p => ({
                platform: p.platform,
                count: p._count
            })),
            topEndpoints: byEndpoint.map(e => ({
                endpoint: e.endpoint,
                count: e._count
            })),
            retryStats: {
                avgRetries: Math.round((retryStats._avg.retryCount || 0) * 10) / 10,
                maxRetries: retryStats._max.retryCount || 0
            }
        };
    }
    async resolveError(errorId) {
        return this.prisma.apiErrorLog.update({
            where: { id: errorId },
            data: { resolved: true }
        });
    }
    async logError(data) {
        return this.prisma.apiErrorLog.create({
            data: {
                ...data,
                retryCount: 0,
                resolved: false
            }
        });
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map