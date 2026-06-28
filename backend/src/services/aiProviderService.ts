// Multi-LLM provider support using native fetch
interface AIProvider {
  name: string;
  apiKey: string;
  model: string;
  enabled: boolean;
}

class AIProviderService {
  private groqProvider?: AIProvider;
  private geminiProvider?: AIProvider;
  private nvidiaProvider?: AIProvider;
  private activeProvider: AIProvider;

  constructor() {
    this.groqProvider = {
      name: 'groq',
      apiKey: process.env.GROQ_API_KEY || '',
      model: 'mixtral-8x7b-32768', // Fast, efficient
      enabled: !!process.env.GROQ_API_KEY,
    };

    this.geminiProvider = {
      name: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || '',
      model: 'gemini-1.5-flash', // Cost-effective
      enabled: !!process.env.GEMINI_API_KEY,
    };

    this.nvidiaProvider = {
      name: 'nvidia',
      apiKey: process.env.NVIDIA_API_KEY || '',
      model: 'nvidia/llama-2-70b', // Enterprise
      enabled: !!process.env.NVIDIA_API_KEY,
    };

    // Set active provider (prefer Groq for speed)
    this.activeProvider = this.getActiveProvider();
  }

  private getActiveProvider(): AIProvider {
    if (this.groqProvider?.enabled) return this.groqProvider;
    if (this.geminiProvider?.enabled) return this.geminiProvider;
    if (this.nvidiaProvider?.enabled) return this.nvidiaProvider;
    
    // Fallback default mock provider if no keys are configured, so the app doesn't crash
    return {
      name: 'mock',
      apiKey: '',
      model: 'mock-model',
      enabled: true,
    };
  }

  async analyzeCompliance(prompt: string): Promise<string> {
    try {
      if (this.activeProvider.name === 'mock') {
        return this.getMockResponse(prompt);
      }
      return await this.callActiveProvider(prompt);
    } catch (error) {
      console.error(`[AI Provider] ${this.activeProvider.name} failed, trying fallback...`, error);
      return await this.callFallbackProvider(prompt);
    }
  }

  async generateTicketAutoReply(ticketContent: string, complianceContext: string): Promise<string> {
    const prompt = `You are an AI assistant for a data center / community hub. A community member has submitted a grievance ticket.
Ticket details: "${ticketContent}"
Compliance context: "${complianceContext}"
Please provide a polite, professional auto-reply acknowledging the issue, referencing the compliance context if relevant, and assuring them it is being looked into. Keep it under 3 sentences. Output only the message text, no JSON.`;

    try {
      if (this.activeProvider.name === 'mock') {
        return `Thank you for reaching out. We have received your ticket regarding: "${ticketContent.substring(0, 50)}...". Our team is investigating this issue and will get back to you shortly.`;
      }
      return await this.callActiveProvider(prompt, false);
    } catch (error) {
      console.error(`[AI Provider] Auto-reply failed, trying fallback...`, error);
      return await this.callFallbackProvider(prompt, false);
    }
  }

  private async callActiveProvider(prompt: string, expectJson: boolean = true): Promise<string> {
    switch (this.activeProvider.name) {
      case 'groq':
        return await this.callGroq(prompt, expectJson);
      case 'gemini':
        return await this.callGemini(prompt, expectJson);
      case 'nvidia':
        return await this.callNvidia(prompt, expectJson);
      default:
        throw new Error('Unknown provider');
    }
  }

  private async callFallbackProvider(prompt: string, expectJson: boolean = true): Promise<string> {
    // Try Gemini
    if (this.geminiProvider?.enabled && this.activeProvider.name !== 'gemini') {
      try {
        console.log('[AI Provider] Switching to fallback Gemini...');
        return await this.callGemini(prompt, expectJson);
      } catch (e) {
        console.error('[AI Provider] Fallback Gemini failed:', e);
      }
    }

    // Try Nvidia
    if (this.nvidiaProvider?.enabled && this.activeProvider.name !== 'nvidia') {
      try {
        console.log('[AI Provider] Switching to fallback Nvidia...');
        return await this.callNvidia(prompt, expectJson);
      } catch (e) {
        console.error('[AI Provider] Fallback Nvidia failed:', e);
      }
    }

    // If everything fails, return mock data to prevent hard crash
    console.warn('[AI Provider] All real AI providers failed or are unconfigured. Falling back to mock analysis.');
    return expectJson ? this.getMockResponse(prompt) : "We're currently experiencing high volumes. Your ticket has been logged and we will respond soon.";
  }

  private async callGroq(prompt: string, expectJson: boolean = true): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.groqProvider?.apiKey}`,
      },
      body: JSON.stringify({
        model: this.groqProvider?.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
        ...(expectJson ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API returned HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callGemini(prompt: string, expectJson: boolean = true): Promise<string> {
    const fullPrompt = expectJson ? prompt + '\nIMPORTANT: Your output MUST be raw JSON only.' : prompt;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiProvider?.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: fullPrompt }],
            },
          ],
          ...(expectJson ? {
            generationConfig: {
              responseMimeType: 'application/json',
            }
          } : {})
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private async callNvidia(prompt: string, expectJson: boolean = true): Promise<string> {
    const response = await fetch('https://api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.nvidiaProvider?.apiKey}`,
      },
      body: JSON.stringify({
        model: this.nvidiaProvider?.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`Nvidia API returned HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Provide realistic simulated analysis if no APIs are set up
  private getMockResponse(prompt: string): string {
    // Parse name out of prompt to generate matching mock
    let metricName = 'CSR Metric';
    if (prompt.includes('Metric:')) {
      const match = prompt.match(/Metric:\s*([^\n]+)/);
      if (match) metricName = match[1].trim();
    }

    let status = 'GREEN';
    if (prompt.includes('Status: RED')) status = 'RED';
    else if (prompt.includes('Status: YELLOW')) status = 'YELLOW';

    const analysis = `The current telemetry measurements for ${metricName} are aligned with regulatory expectations. Continuous monitoring of resource consumption and waste outputs remains critical to prevent deviations.`;
    
    let recommendations = 'Maintain operational limits. Implement baseline energy conservation metrics.';
    let priority = 'soon';

    if (status === 'RED') {
      recommendations = 'Immediate audit of raw emission factors. Increase renewable procurement shares. Install additional energy meters to isolate leakages.';
      priority = 'immediate';
    } else if (status === 'YELLOW') {
      recommendations = 'Review carbon offset balances. Update waste treatment contracts to improve recycling throughput.';
      priority = 'soon';
    }

    return JSON.stringify({
      analysis,
      recommendations,
      priority,
    });
  }
}

export const aiProviderService = new AIProviderService();
