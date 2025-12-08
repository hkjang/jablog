import { KeywordsService } from './keywords.service';
export declare class KeywordsController {
    private readonly keywordsService;
    constructor(keywordsService: KeywordsService);
    generate(topicId: number): Promise<{
        success: boolean;
        count: number;
    }>;
    findAll(topicId: number): Promise<{
        id: number;
        text: string;
        volume: number;
        competition: number;
        topicId: number | null;
    }[]>;
}
