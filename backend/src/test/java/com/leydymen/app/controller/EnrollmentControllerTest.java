package com.leydymen.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leydymen.app.dto.EnrollmentDTO;
import com.leydymen.app.dto.request.EnrollmentCreateRequest;
import com.leydymen.app.entity.Enrollment.EnrollmentStatus;
import com.leydymen.app.service.EnrollmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class EnrollmentControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EnrollmentService enrollmentService;

    private EnrollmentDTO testEnrollmentDTO;
    private EnrollmentCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        testEnrollmentDTO = EnrollmentDTO.builder()
                .enrollmentId(1L)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        createRequest = EnrollmentCreateRequest.builder()
                .formationId(1L)
                .build();
    }

    @Test
    void testGetEnrollmentById_Success() throws Exception {
        when(enrollmentService.getEnrollmentById(1L)).thenReturn(testEnrollmentDTO);

        mockMvc.perform(get("/api/enrollments/1")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.enrollmentId").value(1))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        verify(enrollmentService, times(1)).getEnrollmentById(1L);
    }

    @Test
    void testGetEnrollmentById_NotFound() throws Exception {
        when(enrollmentService.getEnrollmentById(99L))
                .thenThrow(new RuntimeException("Enrollment not found"));

        mockMvc.perform(get("/api/enrollments/99")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetMyEnrollments_Success() throws Exception {
        var enrollments = Arrays.asList(testEnrollmentDTO);
        when(enrollmentService.getStudentEnrollments(any(), 0, 10))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(enrollments));

        mockMvc.perform(get("/api/enrollments/my")
                .header("Authorization", "Bearer test-token")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(enrollmentService, times(1)).getStudentEnrollments(any(), 0, 10);
    }

    @Test
    void testEnrollStudent_Success() throws Exception {
        when(enrollmentService.enrollStudent(any(), any()))
                .thenReturn(testEnrollmentDTO);

        mockMvc.perform(post("/api/enrollments")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated());

        verify(enrollmentService, times(1)).enrollStudent(any(), any());
    }

    @Test
    void testCancelEnrollment_Success() throws Exception {
        mockMvc.perform(delete("/api/enrollments/1")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(enrollmentService, times(1)).cancelEnrollment(1L);
    }

    @Test
    void testChangeEnrollmentStatus_Success() throws Exception {
        when(enrollmentService.changeEnrollmentStatus(1L, EnrollmentStatus.COMPLETED))
                .thenReturn(testEnrollmentDTO);

        mockMvc.perform(patch("/api/enrollments/1/status")
                .header("Authorization", "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk());

        verify(enrollmentService, times(1)).changeEnrollmentStatus(1L, EnrollmentStatus.COMPLETED);
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/enrollments/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
