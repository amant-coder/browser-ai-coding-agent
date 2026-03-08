package com.browserai.agent.controller;

import com.browserai.agent.service.SearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SearchController.class)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SearchService searchService;

    @Test
    void search_returnsResult() throws Exception {
        when(searchService.search("Spring Boot")).thenReturn("Spring Boot is a framework.");

        mockMvc.perform(get("/api/search").param("q", "Spring Boot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value("Spring Boot is a framework."));
    }

    @Test
    void search_returnsBadRequest_whenQueryBlank() throws Exception {
        mockMvc.perform(get("/api/search").param("q", "   "))
                .andExpect(status().isBadRequest());
    }
}
