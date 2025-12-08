export declare class TistoryService {
    private readonly logger;
    private readonly accessToken;
    private readonly blogName;
    createPost(title: string, content: string, visibility?: number): Promise<{
        platform: string;
        id: any;
        url: any;
    } | null>;
}
