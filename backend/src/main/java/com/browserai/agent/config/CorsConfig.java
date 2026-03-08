package com.browserai.agent.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS configuration is now handled by {@link SecurityConfig#corsConfigurationSource()}
 * to ensure proper integration with the Spring Security filter chain.
 *
 * <p>This class is retained as a placeholder to avoid breaking any existing references.
 */
@Configuration
public class CorsConfig {
    // CORS rules moved to SecurityConfig — see corsConfigurationSource() bean there.
}
