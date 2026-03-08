package com.browserai.agent.controller;

import com.browserai.agent.config.RateLimitConfig;
import com.browserai.agent.interceptor.RateLimitInterceptor;
import com.browserai.agent.service.JwtService;
import com.browserai.agent.service.SearchService;
import com.browserai.agent.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SearchController.class)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SearchService searchService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    @MockBean
    private RateLimitConfig rateLimitConfig;

    @MockBean
    private RateLimitInterceptor rateLimitInterceptor;

    @BeforeEach
    void setUp() throws Exception {
        lenient().doReturn(true).when(rateLimitInterceptor).preHandle(any(), any(), any());
    }

    @Test
    @WithMockUser
    void search_returnsResult() throws Exception {
        when(searchService.search("Spring Boot")).thenReturn("Spring Boot is a framework.");

        mockMvc.perform(get("/api/search").param("q", "Spring Boot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("Spring Boot is a framework."));
    }

    @Test
    @WithMockUser
    void search_returnsBadRequest_whenQueryBlank() throws Exception {
        mockMvc.perform(get("/api/search").param("q", "   "))
                .andExpect(status().isBadRequest());
    }
}
