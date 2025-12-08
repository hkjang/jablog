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
var KeywordsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const googleTrends = __importStar(require("google-trends-api"));
let KeywordsService = KeywordsService_1 = class KeywordsService {
    prisma;
    logger = new common_1.Logger(KeywordsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateKeywordsForTopic(topicName) {
        this.logger.log(`Generating keywords for topic: ${topicName}`);
        return { error: 'Use generateKeywordsForTopicById' };
    }
    async generateKeywordsForTopicById(topicId) {
        const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        try {
            const result = await googleTrends.relatedQueries({ keyword: topic.name, geo: 'KR' });
            const parsed = JSON.parse(result);
            const rankedLists = parsed.default?.rankedList || [];
            let count = 0;
            for (const list of rankedLists) {
                const keywords = list.rankedKeyword || [];
                for (const kw of keywords) {
                    const text = kw.query;
                    const value = kw.value;
                    let volume = 0;
                    if (typeof value === 'number')
                        volume = value;
                    await this.prisma.keyword.create({
                        data: {
                            text,
                            volume,
                            topicId: topic.id,
                        }
                    });
                    count++;
                }
            }
            this.logger.log(`Generated ${count} keywords for topic ${topic.name}`);
            return { success: true, count };
        }
        catch (e) {
            this.logger.error('Error generating keywords', e);
            throw e;
        }
    }
    async getKeywords(topicId) {
        return this.prisma.keyword.findMany({ where: { topicId } });
    }
};
exports.KeywordsService = KeywordsService;
exports.KeywordsService = KeywordsService = KeywordsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KeywordsService);
//# sourceMappingURL=keywords.service.js.map