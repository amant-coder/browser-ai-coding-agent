package com.browserai.agent.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Request body for POST /api/chat.
 *
 * <p>The {@code messages} list mirrors the Gemini conversation history format:
 * each entry has a {@code role} ("user" | "model") and a list of {@code parts}
 * where each part carries a {@code text} string.
 */
public record ChatRequest(
        @NotNull List<GeminiMessage> messages,
        String systemPrompt
) {

    public record GeminiMessage(
            @NotBlank String role,
            @NotNull List<Part> parts
    ) {}

    public record Part(@NotBlank String text) {}
}
