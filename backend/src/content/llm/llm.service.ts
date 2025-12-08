export abstract class LlmService {
  abstract generate(prompt: string): Promise<string>;
}
