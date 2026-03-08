package com.browserai.agent.controller;

import com.browserai.agent.config.RateLimitConfig;
import com.browserai.agent.interceptor.RateLimitInterceptor;
import com.browserai.agent.model.ChatRequest;
import com.browserai.agent.model.ChatRequest.GeminiMessage;
import com.browserai.agent.model.ChatRequest.Part;
import com.browserai.agent.service.GeminiService;
import com.browserai.agent.service.JwtService;
import com.browserai.agent.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AgentController.class)
class AgentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GeminiService geminiService;

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
    void chat_returnsModelReply() throws Exception {
        when(geminiService.chat(any(), any())).thenReturn("Hello from Gemini!");

        ChatRequest request = new ChatRequest(
                List.of(new GeminiMessage("user", List.of(new Part("Hi!")))),
                null
        );

        mockMvc.perform(post("/api/chat")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("Hello from Gemini!"));
    }

    @Test
    @WithMockUser
    void chat_returnsBadRequest_whenMessagesNull() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"messages\":null}"))
                .andExpect(status().isBadRequest());
    }
}
