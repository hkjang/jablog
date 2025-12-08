import { WordpressService } from './wordpress.service';
import { TistoryService } from './tistory.service';
export declare class PublishingService {
    private wpService;
    private tistoryService;
    constructor(wpService: WordpressService, tistoryService: TistoryService);
    publishToAll(title: string, content: string): Promise<any[]>;
}
