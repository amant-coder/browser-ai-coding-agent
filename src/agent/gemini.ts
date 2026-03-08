/**
 * GeminiClient — communicates with the Spring Boot backend instead of calling
 * the Gemini API directly from the browser. This keeps the API key server-side
 * and avoids exposing it in the client bundle.
 */

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: { text: string }[]
}

const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) || 'http://localhost:8080'

export class GeminiClient {
  private _initialized = false

  /**
   * Mark the client as ready. With the Spring Boot backend the API key is
   * managed server-side, so no local key setup is required. The method is kept
   * for API compatibility with existing callers in loop.ts.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  init(_apiKey: string): void {
    this._initialized = true
  }

  async chat(messages: GeminiMessage[], systemPrompt?: string): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt: systemPrompt ?? null }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Backend chat error (${response.status}): ${detail}`)
    }

    const data = (await response.json()) as { text: string }
    return data.text
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const message: GeminiMessage = { role: 'user', parts: [{ text: prompt }] }
    return this.chat([message], systemPrompt)
  }

  isInitialized(): boolean {
    return this._initialized
  }
}

export const geminiClient = new GeminiClient()
