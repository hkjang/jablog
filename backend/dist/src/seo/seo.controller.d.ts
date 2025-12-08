import { SeoService } from './seo.service';
export declare class SeoController {
    private readonly seoService;
    constructor(seoService: SeoService);
    analyze(content: string): {
        score: number;
        issues: string[];
    };
}
