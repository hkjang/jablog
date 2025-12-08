"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TopicsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopicsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const googleTrends = __importStar(require("google-trends-api"));
let TopicsService = TopicsService_1 = class TopicsService {
    prisma;
    logger = new common_1.Logger(TopicsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async discoverTopics() {
        this.logger.log('Starting topic discovery...');
        try {
            const result = await googleTrends.dailyTrends({ geo: 'KR' });
            const parsed = JSON.parse(result);
            const days = parsed.default.trendingSearchesDays || [];
            if (days.length === 0)
                return { success: true, count: 0 };
            const trendingSearches = days[0].trendingSearches || [];
            for (const item of trendingSearches) {
                const query = item.title.query;
                const traffic = item.formattedTraffic || '0';
                let score = parseInt(traffic.replace(/[^0-9]/g, '')) || 0;
                if (traffic.includes('K'))
                    score *= 1000;
                if (traffic.includes('M'))
                    score *= 1000000;
                await this.prisma.topic.upsert({
                    where: { name: query },
                    update: { score },
                    create: { name: query, score },
                });
                this.logger.log(`Upserted topic: ${query} (Score: ${score})`);
            }
            return { success: true, count: trendingSearches.length };
        }
        catch (error) {
            this.logger.error('Error discovering topics', error);
            throw error;
        }
    }
    async getTopics() {
        return this.prisma.topic.findMany({
            orderBy: { score: 'desc' },
            take: 20,
        });
    }
};
exports.TopicsService = TopicsService;
exports.TopicsService = TopicsService = TopicsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TopicsService);
//# sourceMappingURL=topics.service.js.map