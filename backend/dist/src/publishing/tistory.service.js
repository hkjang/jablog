"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TistoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TistoryService = void 0;
const common_1 = require("@nestjs/common");
let TistoryService = TistoryService_1 = class TistoryService {
    logger = new common_1.Logger(TistoryService_1.name);
    accessToken = process.env.TISTORY_ACCESS_TOKEN;
    blogName = process.env.TISTORY_BLOG_NAME;
    async createPost(title, content, visibility = 0) {
        if (!this.accessToken || !this.blogName) {
            this.logger.warn('Tistory config missing');
            return null;
        }
        this.logger.log(`Publishing to Tistory: ${title}`);
        try {
            const formData = new URLSearchParams();
            formData.append('access_token', this.accessToken);
            formData.append('output', 'json');
            formData.append('blogName', this.blogName);
            formData.append('title', title);
            formData.append('content', content);
            formData.append('visibility', visibility.toString());
            const response = await fetch('https://www.tistory.com/apis/post/write', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error(`Tistory network error: ${response.status}`);
            }
            const data = await response.json();
            if (data.tistory.status !== '200') {
                throw new Error(`Tistory API Error: ${data.tistory.error_message}`);
            }
            return {
                platform: 'tistory',
                id: data.tistory.postId,
                url: data.tistory.url
            };
        }
        catch (e) {
            this.logger.error('Tistory publishing failed', e);
            throw e;
        }
    }
};
exports.TistoryService = TistoryService;
exports.TistoryService = TistoryService = TistoryService_1 = __decorate([
    (0, common_1.Injectable)()
], TistoryService);
//# sourceMappingURL=tistory.service.js.map