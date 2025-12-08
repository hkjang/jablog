import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';

@Injectable()
export class OpenAiService extends LlmService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;

  async generate(prompt: string): Promise<string> {
    this.logger.log('Generating with OpenAI...');
    
    if (!this.apiKey) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', 
                messages: [
                    { role: "system", content: "You are a helpful blog writer." },
                    { role: "user", content: prompt }
                ]
            })
        });
        
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenAI API Error: ${err}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        this.logger.error('OpenAI generation failed', e);
        throw e;
    }
  }
}
