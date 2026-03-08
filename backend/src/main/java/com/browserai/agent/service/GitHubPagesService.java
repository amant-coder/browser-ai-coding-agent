package com.browserai.agent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GitHubPagesService {

    private final WebClient webClient;

    @Value("${github.token:}")
    private String githubToken;

    public GitHubPagesService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.github.com")
                .defaultHeader("Accept", "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .build();
    }

    /**
     * Creates or updates a GitHub repository with the provided files and enables Pages.
     *
     * @param repoName  Name for the repository (also used as Pages URL slug)
     * @param files     Map of filePath → content
     * @return GitHub Pages URL
     */
    public String deploy(String repoName, Map<String, String> files) {
        if (githubToken == null || githubToken.isBlank()) {
            throw new IllegalStateException("GITHUB_TOKEN is not configured");
        }

        // Get authenticated user login
        Map<?, ?> userInfo = webClient.get()
                .uri("/user")
                .header("Authorization", "Bearer " + githubToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        String login = userInfo != null ? (String) userInfo.get("login") : null;
        if (login == null) throw new RuntimeException("Could not resolve GitHub user");

        // Create repo (ignore conflict if already exists)
        try {
            webClient.post()
                    .uri("/user/repos")
                    .header("Authorization", "Bearer " + githubToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "name", repoName,
                            "auto_init", true,
                            "private", false
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception ignored) {
            // Repo may already exist — continue
        }

        // Push each file via Contents API
        for (Map.Entry<String, String> entry : files.entrySet()) {
            String path = entry.getKey().startsWith("/") ? entry.getKey().substring(1) : entry.getKey();
            String encoded = Base64.getEncoder().encodeToString(entry.getValue().getBytes());
            String apiPath = "/repos/" + login + "/" + repoName + "/contents/" + path;

            // Check if file exists to get its SHA
            String sha = null;
            try {
                Map<?, ?> existing = webClient.get()
                        .uri(apiPath)
                        .header("Authorization", "Bearer " + githubToken)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();
                if (existing != null) sha = (String) existing.get("sha");
            } catch (Exception ignored) {}

            Map<String, Object> body = sha != null
                    ? Map.of("message", "deploy: update " + path, "content", encoded, "sha", sha)
                    : Map.of("message", "deploy: add " + path, "content", encoded);

            webClient.put()
                    .uri(apiPath)
                    .header("Authorization", "Bearer " + githubToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        }

        // Enable GitHub Pages from main branch
        try {
            webClient.post()
                    .uri("/repos/" + login + "/" + repoName + "/pages")
                    .header("Authorization", "Bearer " + githubToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("source", Map.of("branch", "main", "path", "/")))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception ignored) {
            // Pages may already be enabled
        }

        return "https://" + login + ".github.io/" + repoName + "/";
    }
}
