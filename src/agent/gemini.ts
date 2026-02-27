import { GoogleGenerativeAI } from '@google/generative-ai'

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

// Flash model: fast and cost-effective for agentic coding tasks.
const DEFAULT_MODEL = 'gemini-1.5-flash'

export class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null

  init(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    })
  }

  async chat(messages: GeminiMessage[], systemPrompt?: string): Promise<string> {
    if (!this.model) throw new Error('Gemini not initialized. Please set your API key.')

    const history = messages.slice(0, -1)
    const lastMessage = messages[messages.length - 1]

    const chat = this.model.startChat({
      history,
      systemInstruction: systemPrompt,
    })

    const result = await chat.sendMessage(lastMessage.parts[0].text)
    const response = await result.response
    return response.text()
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.model) throw new Error('Gemini not initialized. Please set your API key.')

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt
    const result = await this.model.generateContent(fullPrompt)
    const response = await result.response
    return response.text()
  }

  isInitialized(): boolean {
    return this.model !== null
  }
}

export const geminiClient = new GeminiClient()
