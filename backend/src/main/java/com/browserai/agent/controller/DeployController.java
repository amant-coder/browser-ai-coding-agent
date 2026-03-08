package com.browserai.agent.controller;

import com.browserai.agent.model.Deployment;
import com.browserai.agent.repository.DeploymentRepository;
import com.browserai.agent.service.GitHubPagesService;
import com.browserai.agent.service.JwtService;
import com.browserai.agent.service.VercelDeployService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/deploy")
public class DeployController {

    private final VercelDeployService vercelDeployService;
    private final GitHubPagesService gitHubPagesService;
    private final DeploymentRepository deploymentRepository;
    private final JwtService jwtService;

    public DeployController(VercelDeployService vercelDeployService,
                            GitHubPagesService gitHubPagesService,
                            DeploymentRepository deploymentRepository,
                            JwtService jwtService) {
        this.vercelDeployService = vercelDeployService;
        this.gitHubPagesService = gitHubPagesService;
        this.deploymentRepository = deploymentRepository;
        this.jwtService = jwtService;
    }

    record DeployVercelRequest(String projectName, Map<String, String> files) {}
    record DeployGitHubPagesRequest(String repoName, Map<String, String> files) {}

    @PostMapping("/vercel")
    public ResponseEntity<?> deployVercel(
            @RequestBody DeployVercelRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String deploymentUrl = vercelDeployService.deploy(req.projectName(), req.files());
            Deployment dep = new Deployment();
            dep.setProjectName(req.projectName());
            dep.setProvider("vercel");
            dep.setStatus("READY");
            dep.setPublicUrl(deploymentUrl);
            dep.setUserId(extractUserId(authHeader));
            deploymentRepository.save(dep);
            return ResponseEntity.ok(Map.of(
                    "deploymentUrl", deploymentUrl != null ? deploymentUrl : "",
                    "deploymentId", dep.getId(),
                    "status", "READY"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/github-pages")
    public ResponseEntity<?> deployGitHubPages(
            @RequestBody DeployGitHubPagesRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String pageUrl = gitHubPagesService.deploy(req.repoName(), req.files());
            Deployment dep = new Deployment();
            dep.setProjectName(req.repoName());
            dep.setProvider("github-pages");
            dep.setStatus("READY");
            dep.setPublicUrl(pageUrl);
            dep.setUserId(extractUserId(authHeader));
            deploymentRepository.save(dep);
            return ResponseEntity.ok(Map.of(
                    "pageUrl", pageUrl,
                    "deploymentId", dep.getId(),
                    "status", "READY"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/status/{deploymentId}")
    public ResponseEntity<?> getStatus(@PathVariable String deploymentId) {
        return deploymentRepository.findById(deploymentId)
                .map(dep -> ResponseEntity.ok(Map.of(
                        "deploymentId", dep.getId(),
                        "status", dep.getStatus(),
                        "publicUrl", dep.getPublicUrl() != null ? dep.getPublicUrl() : "",
                        "provider", dep.getProvider()
                )))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private String extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                return jwtService.extractUserId(authHeader.substring(7));
            } catch (Exception ignored) {}
        }
        return null;
    }
}
