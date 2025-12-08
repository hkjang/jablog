"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WordpressService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordpressService = void 0;
const common_1 = require("@nestjs/common");
let WordpressService = WordpressService_1 = class WordpressService {
    logger = new common_1.Logger(WordpressService_1.name);
    baseUrl = process.env.WORDPRESS_URL;
    username = process.env.WORDPRESS_USERNAME;
    password = process.env.WORDPRESS_APP_PASSWORD;
    async createPost(title, content, status = 'draft') {
        if (!this.baseUrl) {
            this.logger.warn('WordPress config missing');
            return null;
        }
        this.logger.log(`Publishing to WordPress: ${title}`);
        const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        try {
            const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`
                },
                body: JSON.stringify({
                    title,
                    content,
                    status
                })
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error(`WordPress API Error: ${err}`);
            }
            const data = await response.json();
            return {
                platform: 'wordpress',
                id: data.id,
                url: data.link
            };
        }
        catch (e) {
            this.logger.error('WordPress publishing failed', e);
            throw e;
        }
    }
};
exports.WordpressService = WordpressService;
exports.WordpressService = WordpressService = WordpressService_1 = __decorate([
    (0, common_1.Injectable)()
], WordpressService);
//# sourceMappingURL=wordpress.service.js.map