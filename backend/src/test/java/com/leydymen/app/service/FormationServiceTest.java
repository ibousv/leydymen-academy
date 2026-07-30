package com.leydymen.app.service;

import com.leydymen.app.dto.FormationDTO;
import com.leydymen.app.dto.request.FormationCreateRequest;
import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.Formation.FormationLevel;
import com.leydymen.app.entity.Formation.FormationStatus;
import com.leydymen.app.entity.User;
import com.leydymen.app.entity.User.UserRole;
import com.leydymen.app.repository.FormationRepository;
import com.leydymen.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FormationServiceTest {
    @Mock
    private FormationRepository formationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FormationService formationService;

    private Formation testFormation;
    private FormationDTO testFormationDTO;
    private User instructor;
    private FormationCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        instructor = User.builder()
                .userId(1L)
                .username("instructor")
                .email("instructor@example.com")
                .role(UserRole.INSTRUCTOR)
                .build();

        testFormation = Formation.builder()
                .formationId(1L)
                .title("Spring Boot Bootcamp")
                .description("Learn Spring Boot from scratch")
                .category("Backend")
                .level(FormationLevel.INTERMEDIATE)
                .duration(80)
                .maxStudents(50)
                .startDate(LocalDate.now().plusDays(7))
                .endDate(LocalDate.now().plusDays(67))
                .price(BigDecimal.valueOf(999.99))
                .instructor(instructor)
                .status(FormationStatus.DRAFT)
                .build();

        testFormationDTO = FormationDTO.builder()
                .formationId(1L)
                .title("Spring Boot Bootcamp")
                .description("Learn Spring Boot from scratch")
                .category("Backend")
                .level(FormationLevel.INTERMEDIATE)
                .duration(80)
                .maxStudents(50)
                .price(BigDecimal.valueOf(999.99))
                .status(FormationStatus.DRAFT)
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
    void testGetFormationById_Success() {
        when(formationRepository.findById(1L)).thenReturn(Optional.of(testFormation));

        FormationDTO result = formationService.getFormationById(1L);

        assertNotNull(result);
        assertEquals("Spring Boot Bootcamp", result.getTitle());
        verify(formationRepository, times(1)).findById(1L);
    }

    @Test
    void testGetFormationById_NotFound() {
        when(formationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> formationService.getFormationById(99L));
    }

    @Test
    void testCreateFormation_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(instructor));
        when(formationRepository.save(any(Formation.class))).thenReturn(testFormation);

        FormationDTO result = formationService.createFormation(1L, createRequest);

        assertNotNull(result);
        assertEquals("Spring Boot Bootcamp", result.getTitle());
        verify(formationRepository, times(1)).save(any(Formation.class));
    }

    @Test
    void testCreateFormation_InstructorNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> formationService.createFormation(99L, createRequest));
        verify(formationRepository, never()).save(any());
    }

    @Test
    void testUpdateFormation_Success() {
        when(formationRepository.findById(1L)).thenReturn(Optional.of(testFormation));
        when(formationRepository.save(any(Formation.class))).thenReturn(testFormation);

        FormationDTO result = formationService.updateFormation(1L, createRequest);

        assertNotNull(result);
        assertEquals("Spring Boot Bootcamp", result.getTitle());
        verify(formationRepository, times(1)).save(any(Formation.class));
    }

    @Test
    void testChangeFormationStatus() {
        when(formationRepository.findById(1L)).thenReturn(Optional.of(testFormation));
        when(formationRepository.save(any(Formation.class))).thenReturn(testFormation);

        FormationDTO result = formationService.changeFormationStatus(1L, FormationStatus.PUBLISHED);

        assertNotNull(result);
        verify(formationRepository, times(1)).save(any(Formation.class));
    }

    @Test
    void testDeleteFormation_Success() {
        when(formationRepository.findById(1L)).thenReturn(Optional.of(testFormation));

        formationService.deleteFormation(1L);

        verify(formationRepository, times(1)).delete(testFormation);
    }

    @Test
    void testDeleteFormation_NotFound() {
        when(formationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> formationService.deleteFormation(99L));
        verify(formationRepository, never()).delete(any());
    }
}
