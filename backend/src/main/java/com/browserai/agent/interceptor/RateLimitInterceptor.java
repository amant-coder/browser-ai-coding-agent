package com.browserai.agent.interceptor;

import com.browserai.agent.config.RateLimitConfig;
import com.browserai.agent.model.UserRole;
import com.browserai.agent.service.JwtService;
import com.browserai.agent.service.UserService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitInterceptor.class);

    private final RateLimitConfig rateLimitConfig;
    private final JwtService jwtService;
    private final UserService userService;

    public RateLimitInterceptor(RateLimitConfig rateLimitConfig,
                                JwtService jwtService,
                                UserService userService) {
        this.rateLimitConfig = rateLimitConfig;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull Object handler) throws Exception {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Unauthenticated — apply FREE tier limits using IP as key
            String ip = request.getRemoteAddr();
            Bucket bucket = rateLimitConfig.resolveBucket("anon:" + ip, UserRole.FREE);
            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.getWriter().write("{\"message\":\"Rate limit exceeded\"}");
                return false;
            }
            return true;
        }

        try {
            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                return true; // Let security layer handle invalid tokens
            }
            String userId = jwtService.extractUserId(token);
            UserRole role = userService.findById(userId)
                    .map(u -> u.getRole())
                    .orElse(UserRole.FREE);

            Bucket bucket = rateLimitConfig.resolveBucket(userId, role);
            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                response.getWriter().write("{\"message\":\"Rate limit exceeded\"}");
                return false;
            }
        } catch (Exception e) {
            // Log and apply a conservative FREE-tier fallback rather than unrestricted access
            logger.warn("Rate limit check failed, applying FREE tier fallback: {}", e.getMessage());
            String ip = request.getRemoteAddr();
            Bucket fallback = rateLimitConfig.resolveBucket("fallback:" + ip, UserRole.FREE);
            if (!fallback.tryConsume(1)) {
                response.setStatus(429);
                response.getWriter().write("{\"message\":\"Rate limit exceeded\"}");
                return false;
            }
        }
        return true;
    }
}
