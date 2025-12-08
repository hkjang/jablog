import { LlmService } from './llm/llm.service';
import { ImageService } from './image/image.service';
export declare class ContentService {
    private llmService;
    private imageService;
    constructor(llmService: LlmService, imageService: ImageService);
    createDraft(topic: string, keywords: string[]): Promise<{
        topic: string;
        content: string;
        imageUrl: string;
        createdAt: Date;
        status: string;
    }>;
}
