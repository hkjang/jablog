import { LlmService } from './llm.service';
export declare class OllamaService extends LlmService {
    private readonly logger;
    generate(prompt: string): Promise<string>;
}
