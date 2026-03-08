package com.browserai.agent.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class VercelDeployService {

    private final WebClient webClient;

    @Value("${vercel.token:}")
    private String vercelToken;

    public VercelDeployService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.vercel.com")
                .build();
    }

    /**
     * Deploys the given files to Vercel and returns the deployment URL.
     *
     * @param projectName Name for the Vercel project
     * @param files       Map of filePath → content
     * @return deployment URL string
     */
    public String deploy(String projectName, Map<String, String> files) {
        if (vercelToken == null || vercelToken.isBlank()) {
            throw new IllegalStateException("VERCEL_TOKEN is not configured");
        }

        // Build Vercel deployment payload
        var filesList = files.entrySet().stream()
                .map(e -> Map.of("file", e.getKey(), "data", e.getValue()))
                .toList();

        var payload = Map.of(
                "name", projectName,
                "files", filesList,
                "projectSettings", Map.of("framework", (Object) null)
        );

        var result = webClient.post()
                .uri("/v13/deployments")
                .header("Authorization", "Bearer " + vercelToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (result == null) {
            throw new RuntimeException("Empty response from Vercel API");
        }

        String url = (String) result.get("url");
        return url != null ? "https://" + url : null;
    }
}
