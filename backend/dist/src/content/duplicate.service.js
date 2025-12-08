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
var DuplicateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let DuplicateService = DuplicateService_1 = class DuplicateService {
    prisma;
    logger = new common_1.Logger(DuplicateService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateContentHash(text) {
        const normalized = text
            .toLowerCase()
            .replace(/[^\w\s가-힣]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        return crypto.createHash('md5').update(normalized).digest('hex');
    }
    calculateSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        if (union.size === 0)
            return 0;
        return intersection.size / union.size;
    }
    async checkDuplicate(title, body, excludeId) {
        const contentHash = this.calculateContentHash(body);
        const exactMatch = await this.prisma.content.findFirst({
            where: {
                similarityHash: contentHash,
                id: excludeId ? { not: excludeId } : undefined,
            },
            select: { id: true, title: true },
        });
        if (exactMatch) {
            return {
                isDuplicate: true,
                similarContent: [{ id: exactMatch.id, title: exactMatch.title, similarity: 1.0 }],
            };
        }
        const recentContents = await this.prisma.content.findMany({
            where: excludeId ? { id: { not: excludeId } } : undefined,
            select: { id: true, title: true, body: true },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        const similarContent = [];
        const threshold = 0.7;
        for (const content of recentContents) {
            const titleSimilarity = this.calculateSimilarity(title, content.title);
            const bodySimilarity = this.calculateSimilarity(body, content.body);
            const combinedSimilarity = titleSimilarity * 0.3 + bodySimilarity * 0.7;
            if (combinedSimilarity >= threshold) {
                similarContent.push({
                    id: content.id,
                    title: content.title,
                    similarity: Math.round(combinedSimilarity * 100) / 100,
                });
            }
        }
        similarContent.sort((a, b) => b.similarity - a.similarity);
        return {
            isDuplicate: similarContent.length > 0 && similarContent[0].similarity >= 0.9,
            similarContent: similarContent.slice(0, 5),
        };
    }
    async updateContentHash(contentId, body) {
        const hash = this.calculateContentHash(body);
        await this.prisma.content.update({
            where: { id: contentId },
            data: {
                similarityHash: hash,
                isDuplicate: false,
            },
        });
    }
    async markAsDuplicate(contentId) {
        await this.prisma.content.update({
            where: { id: contentId },
            data: { isDuplicate: true },
        });
    }
};
exports.DuplicateService = DuplicateService;
exports.DuplicateService = DuplicateService = DuplicateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DuplicateService);
//# sourceMappingURL=duplicate.service.js.map