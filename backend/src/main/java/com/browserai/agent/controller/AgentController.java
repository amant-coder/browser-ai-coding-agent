package com.browserai.agent.controller;

import com.browserai.agent.model.ChatRequest;
import com.browserai.agent.model.ChatResponse;
import com.browserai.agent.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller that exposes the Gemini chat endpoint.
 *
 * <p>{@code POST /api/chat} accepts a conversation history plus an optional
 * system prompt and returns the model's next reply. The Gemini API key is
 * resolved server-side so it is never sent to or stored by the browser.
 */
@RestController
@RequestMapping("/api")
public class AgentController {

    private final GeminiService geminiService;

    public AgentController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Send a multi-turn chat request to Gemini and return the model reply.
     *
     * @param request Conversation messages and optional system prompt
     * @return {@code 200 OK} with the model's text, or {@code 500} on error
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        String text = geminiService.chat(request.messages(), request.systemPrompt());
        return ResponseEntity.ok(new ChatResponse(text));
    }
}
