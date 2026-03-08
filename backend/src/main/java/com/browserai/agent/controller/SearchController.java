package com.browserai.agent.controller;

import com.browserai.agent.model.SearchResponse;
import com.browserai.agent.service.SearchService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for web search requests.
 *
 * <p>{@code GET /api/search?q=...} proxies the query to the DuckDuckGo
 * Instant Answer API and returns a plain-text result.
 */
@RestController
@RequestMapping("/api")
@Validated
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Perform a web search via DuckDuckGo.
     *
     * @param query The search query (required, must not be blank)
     * @return {@code 200 OK} with a short text answer
     */
    @GetMapping("/search")
    public ResponseEntity<SearchResponse> search(
            @RequestParam("q") @NotBlank String query) {
        String result = searchService.search(query);
        return ResponseEntity.ok(new SearchResponse(result));
    }
}
