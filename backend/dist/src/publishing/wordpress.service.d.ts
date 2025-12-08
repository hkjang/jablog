export declare class WordpressService {
    private readonly logger;
    private readonly baseUrl;
    private readonly username;
    private readonly password;
    createPost(title: string, content: string, status?: string): Promise<{
        platform: string;
        id: any;
        url: any;
    } | null>;
}
