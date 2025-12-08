"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OpenAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiService = void 0;
const common_1 = require("@nestjs/common");
const llm_service_1 = require("./llm.service");
let OpenAiService = OpenAiService_1 = class OpenAiService extends llm_service_1.LlmService {
    logger = new common_1.Logger(OpenAiService_1.name);
    apiKey = process.env.OPENAI_API_KEY;
    async generate(prompt) {
        this.logger.log('Generating with OpenAI...');
        if (!this.apiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        { role: "system", content: "You are a helpful blog writer." },
                        { role: "user", content: prompt }
                    ]
                })
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`OpenAI API Error: ${err}`);
            }
            const data = await response.json();
            return data.choices[0].message.content;
        }
        catch (e) {
            this.logger.error('OpenAI generation failed', e);
            throw e;
        }
    }
};
exports.OpenAiService = OpenAiService;
exports.OpenAiService = OpenAiService = OpenAiService_1 = __decorate([
    (0, common_1.Injectable)()
], OpenAiService);
//# sourceMappingURL=openai.service.js.map