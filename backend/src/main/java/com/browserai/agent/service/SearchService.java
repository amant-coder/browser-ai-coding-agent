package com.browserai.agent.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

/**
 * Performs web searches using the DuckDuckGo Instant Answer API.
 */
@Service
public class SearchService {

    private static final String DDG_BASE_URL = "https://api.duckduckgo.com";

    private final WebClient webClient;

    public SearchService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl(DDG_BASE_URL).build();
    }

    /**
     * Queries the DuckDuckGo Instant Answer API and returns a plain-text result.
     *
     * @param query The search query
     * @return A short textual answer or "No results found." when nothing matches
     */
    public String search(String query) {
        DdgResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("q", query)
                        .queryParam("format", "json")
                        .queryParam("no_html", "1")
                        .queryParam("skip_disambig", "1")
                        .build())
                .retrieve()
                .bodyToMono(DdgResponse.class)
                .block();

        if (response == null) {
            return "No results found.";
        }

        if (response.abstractText() != null && !response.abstractText().isBlank()) {
            return response.abstractText();
        }

        if (response.relatedTopics() != null && !response.relatedTopics().isEmpty()) {
            String text = response.relatedTopics().get(0).text();
            if (text != null && !text.isBlank()) {
                return text;
            }
        }

        return "No results found.";
    }

    // -------------------------------------------------------------------------
    // Internal response DTOs (DuckDuckGo JSON shape)
    // -------------------------------------------------------------------------

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record DdgResponse(
            @JsonProperty("AbstractText") String abstractText,
            @JsonProperty("RelatedTopics") List<RelatedTopic> relatedTopics
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record RelatedTopic(
            @JsonProperty("Text") String text
    ) {}
}
