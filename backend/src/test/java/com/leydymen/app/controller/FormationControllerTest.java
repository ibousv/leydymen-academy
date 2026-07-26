package com.leydymen.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leydymen.app.dto.FormationDTO;
import com.leydymen.app.dto.request.FormationCreateRequest;
import com.leydymen.app.entity.Formation.FormationLevel;
import com.leydymen.app.entity.Formation.FormationStatus;
import com.leydymen.app.mapper.FormationMapper;
import com.leydymen.app.service.FormationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class FormationControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FormationService formationService;

    @MockBean
    private FormationMapper formationMapper;

    private FormationDTO testFormationDTO;
    private FormationCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        testFormationDTO = FormationDTO.builder()
                .formationId(1L)
                .title("Spring Boot Bootcamp")
                .description("Learn Spring Boot from scratch")
                .category("Backend")
                .level(FormationLevel.INTERMEDIATE)
                .duration(80)
                .maxStudents(50)
                .price(BigDecimal.valueOf(999.99))
                .status(FormationStatus.PUBLISHED)
                .build();

        createRequest = FormationCreateRequest.builder()
                .title("Spring Boot Bootcamp")
                .description("Learn Spring Boot from scratch")
                .category("Backend")
                .level(FormationLevel.INTERMEDIATE)
                .duration(80)
                .maxStudents(50)
                .startDate(LocalDate.now().plusDays(7))
                .endDate(LocalDate.now().plusDays(67))
                .price(BigDecimal.valueOf(999.99))
                .build();
    }

    @Test
    void testGetFormationById_Success() throws Exception {
        when(formationService.getFormationById(1L)).thenReturn(testFormationDTO);

        mockMvc.perform(get("/api/formations/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.formationId").value(1))
                .andExpect(jsonPath("$.data.title").value("Spring Boot Bootcamp"));

        verify(formationService, times(1)).getFormationById(1L);
    }

    @Test
    void testGetFormationById_NotFound() throws Exception {
        when(formationService.getFormationById(99L))
                .thenThrow(new RuntimeException("Formation not found"));

        mockMvc.perform(get("/api/formations/99")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetAllFormations_Success() throws Exception {
        var formations = Arrays.asList(testFormationDTO);
        when(formationService.getAllFormations(0, 10))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(formations));

        mockMvc.perform(get("/api/formations")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        verify(formationService, times(1)).getAllFormations(0, 10);
    }

    @Test
    void testCreateFormation_Success() throws Exception {
        when(formationService.createFormation(any(), any()))
                .thenReturn(testFormationDTO);

        mockMvc.perform(post("/api/formations")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated());

        verify(formationService, times(1)).createFormation(any(), any());
    }

    @Test
    void testUpdateFormation_Success() throws Exception {
        when(formationService.updateFormation(1L, createRequest))
                .thenReturn(testFormationDTO);

        mockMvc.perform(put("/api/formations/1")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk());

        verify(formationService, times(1)).updateFormation(1L, createRequest);
    }

    @Test
    void testDeleteFormation_Success() throws Exception {
        mockMvc.perform(delete("/api/formations/1")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(formationService, times(1)).deleteFormation(1L);
    }

    @Test
    void testChangeFormationStatus_Success() throws Exception {
        when(formationService.changeFormationStatus(1L, FormationStatus.PUBLISHED))
                .thenReturn(testFormationDTO);

        mockMvc.perform(patch("/api/formations/1/status")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"PUBLISHED\"}"))
                .andExpect(status().isOk());

        verify(formationService, times(1)).changeFormationStatus(1L, FormationStatus.PUBLISHED);
    }
}
