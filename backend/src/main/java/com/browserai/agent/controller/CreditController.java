package com.browserai.agent.controller;

import com.browserai.agent.model.CreditCosts;
import com.browserai.agent.model.UserRole;
import com.browserai.agent.service.CreditService;
import com.browserai.agent.service.JwtService;
import com.browserai.agent.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/credits")
public class CreditController {

    private final CreditService creditService;
    private final JwtService jwtService;
    private final UserService userService;

    public CreditController(CreditService creditService, JwtService jwtService, UserService userService) {
        this.creditService = creditService;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    record DeductRequest(String action, int amount) {}
    record GrantRequest(String userId, int amount) {}

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.ok(Map.of("balance", 0));
        return ResponseEntity.ok(Map.of("balance", creditService.getBalance(userId)));
    }

    @PostMapping("/deduct")
    public ResponseEntity<?> deduct(
            @RequestBody DeductRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.ok(Map.of("balance", 0));
        try {
            int newBalance = creditService.deductCredits(userId, req.action(), req.amount());
            return ResponseEntity.ok(Map.of("balance", newBalance));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/usage")
    public ResponseEntity<?> usage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.ok(Map.of("events", List.of()));
        var events = creditService.getUsageHistory(userId, null, null, PageRequest.of(page, size));
        var dtos = events.getContent().stream().map(e -> Map.of(
                "id", e.getId(),
                "action", e.getAction(),
                "creditsUsed", e.getCreditsUsed(),
                "createdAt", e.getCreatedAt().toString()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("events", dtos, "total", events.getTotalElements()));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> adminUsers(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        var users = userService.findAll().stream().map(u -> Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "name", u.getName(),
                "role", u.getRole().name(),
                "creditBalance", creditService.getBalance(u.getId())
        )).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("users", users));
    }

    @PostMapping("/admin/grant")
    public ResponseEntity<?> adminGrant(
            @RequestBody GrantRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        int newBalance = creditService.addCredits(req.userId(), req.amount());
        return ResponseEntity.ok(Map.of("userId", req.userId(), "newBalance", newBalance));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private String extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                if (jwtService.isTokenValid(token)) {
                    return jwtService.extractUserId(token);
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private boolean isAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        try {
            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) return false;
            String userId = jwtService.extractUserId(token);
            return userService.findById(userId)
                    .map(u -> u.getRole() == UserRole.ADMIN)
                    .orElse(false);
        } catch (Exception e) {
            return false;
        }
    }
}
