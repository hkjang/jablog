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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const llm_service_1 = require("./llm/llm.service");
const image_service_1 = require("./image/image.service");
let ContentService = class ContentService {
    llmService;
    imageService;
    constructor(llmService, imageService) {
        this.llmService = llmService;
        this.imageService = imageService;
    }
    async createDraft(topic, keywords) {
        const prompt = `
    Write a blog post about "${topic}".
    Target Audience: General.
    Keywords: ${keywords.join(', ')}.
    Include: Title, Introduction, Body with headings, Conclusion.
    Tone: Informative and Engaging.
    Format: Markdown.
    `;
        const [content, imageUrl] = await Promise.all([
            this.llmService.generate(prompt),
            this.imageService.generateImage(topic)
        ]);
        return {
            topic,
            content,
            imageUrl,
            createdAt: new Date(),
            status: 'DRAFT',
        };
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [llm_service_1.LlmService,
        image_service_1.ImageService])
], ContentService);
//# sourceMappingURL=content.service.js.map