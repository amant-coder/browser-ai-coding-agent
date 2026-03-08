package com.browserai.agent.service;

import com.browserai.agent.model.ChatRequest;
import com.browserai.agent.model.ChatRequest.GeminiMessage;
import com.browserai.agent.model.ChatRequest.Part;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Proxies chat requests to the Google Gemini REST API.
 *
 * <p>By routing Gemini calls through this service the API key is kept server-side
 * and never exposed to the browser client.
 */
@Service
public class GeminiService {

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";
    private static final String DEFAULT_MODEL = "gemini-1.5-flash";
    private static final String GENERATE_PATH =
            "/v1beta/models/{model}:generateContent?key={key}";

    private final WebClient webClient;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model:" + DEFAULT_MODEL + "}")
    private String model;

    public GeminiService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl(GEMINI_BASE_URL).build();
    }

    /**
     * Sends a multi-turn conversation to Gemini and returns the model's text reply.
     *
     * @param messages     Conversation history (user / model turns)
     * @param systemPrompt Optional system instruction prepended to every request
     * @return The text content of the model's first candidate
     */
    public String chat(List<GeminiMessage> messages, String systemPrompt) {
        GeminiRequest requestBody = buildRequest(messages, systemPrompt);

        GeminiResponse response = webClient.post()
                .uri(GENERATE_PATH, model, apiKey)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(body -> Mono.error(
                                        new RuntimeException("Gemini API error: " + body))))
                .bodyToMono(GeminiResponse.class)
                .block();

        if (response == null
                || response.candidates() == null
                || response.candidates().isEmpty()) {
            throw new RuntimeException("Empty response from Gemini API");
        }

        return response.candidates().get(0).content().parts().get(0).text();
    }

    // -------------------------------------------------------------------------
    // Internal request/response DTOs (Gemini REST API shapes)
    // -------------------------------------------------------------------------

    private GeminiRequest buildRequest(List<GeminiMessage> messages, String systemPrompt) {
        List<ContentEntry> contents = messages.stream()
                .map(m -> new ContentEntry(
                        m.role(),
                        m.parts().stream()
                                .map(p -> new PartEntry(p.text()))
                                .toList()))
                .toList();

        SystemInstruction sysInstr = (systemPrompt != null && !systemPrompt.isBlank())
                ? new SystemInstruction(List.of(new PartEntry(systemPrompt)))
                : null;

        GenerationConfig config = new GenerationConfig(0.7, 0.8, 8192);

        return new GeminiRequest(contents, sysInstr, config);
    }

    private record GeminiRequest(
            List<ContentEntry> contents,
            SystemInstruction systemInstruction,
            GenerationConfig generationConfig
    ) {}

    private record ContentEntry(String role, List<PartEntry> parts) {}

    private record PartEntry(String text) {}

    private record SystemInstruction(List<PartEntry> parts) {}

    private record GenerationConfig(
            double temperature,
            double topP,
            int maxOutputTokens
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record GeminiResponse(List<Candidate> candidates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Candidate(Content content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Content(List<Part> parts) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Part(String text) {}
}
