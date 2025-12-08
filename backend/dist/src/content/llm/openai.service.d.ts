import { LlmService } from './llm.service';
export declare class OpenAiService extends LlmService {
    private readonly logger;
    private readonly apiKey;
    generate(prompt: string): Promise<string>;
}
