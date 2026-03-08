package com.browserai.agent.config;

import com.browserai.agent.model.UserRole;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitConfig {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * Returns a rate-limiting Bucket for the given user+role.
     * FREE: 10 agent actions/hour, PRO: 200/hour, ADMIN: unlimited (very high limit).
     */
    public Bucket resolveBucket(String userId, UserRole role) {
        return buckets.computeIfAbsent(userId, id -> createBucket(role));
    }

    private Bucket createBucket(UserRole role) {
        Bandwidth limit = switch (role) {
            case FREE  -> Bandwidth.classic(10,  Refill.intervally(10,  Duration.ofHours(1)));
            case PRO   -> Bandwidth.classic(200, Refill.intervally(200, Duration.ofHours(1)));
            case ADMIN -> Bandwidth.classic(100_000, Refill.intervally(100_000, Duration.ofHours(1)));
        };
        return Bucket.builder().addLimit(limit).build();
    }
}
