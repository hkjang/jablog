"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const content_service_1 = require("./content.service");
const llm_service_1 = require("./llm/llm.service");
const ollama_service_1 = require("./llm/ollama.service");
const openai_service_1 = require("./llm/openai.service");
const image_service_1 = require("./image/image.service");
const duplicate_service_1 = require("./duplicate.service");
const prisma_module_1 = require("../prisma/prisma.module");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            content_service_1.ContentService,
            image_service_1.ImageService,
            duplicate_service_1.DuplicateService,
            ollama_service_1.OllamaService,
            openai_service_1.OpenAiService,
            {
                provide: llm_service_1.LlmService,
                useFactory: (ollama, openai) => {
                    const provider = process.env.LLM_PROVIDER || 'ollama';
                    return provider === 'openai' ? openai : ollama;
                },
                inject: [ollama_service_1.OllamaService, openai_service_1.OpenAiService],
            },
        ],
        exports: [content_service_1.ContentService, image_service_1.ImageService, duplicate_service_1.DuplicateService],
    })
], ContentModule);
//# sourceMappingURL=content.module.js.map