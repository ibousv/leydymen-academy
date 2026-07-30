package com.leydymen.app.service;

import com.leydymen.app.dto.EnrollmentDTO;
import com.leydymen.app.dto.request.EnrollmentCreateRequest;
import com.leydymen.app.entity.Enrollment;
import com.leydymen.app.entity.Enrollment.EnrollmentStatus;
import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.User;
import com.leydymen.app.entity.User.UserRole;
import com.leydymen.app.repository.EnrollmentRepository;
import com.leydymen.app.repository.FormationRepository;
import com.leydymen.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {
    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private FormationRepository formationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EnrollmentService enrollmentService;

    private Enrollment testEnrollment;
    private EnrollmentDTO testEnrollmentDTO;
    private User testStudent;
    private Formation testFormation;
    private EnrollmentCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        testStudent = User.builder()
                .userId(1L)
                .username("student")
                .email("student@example.com")
                .role(UserRole.STUDENT)
                .build();

        testFormation = Formation.builder()
                .formationId(1L)
                .title("Spring Boot Course")
                .build();

        testEnrollment = Enrollment.builder()
                .enrollmentId(1L)
                .student(testStudent)
                .formation(testFormation)
                .enrollmentDate(LocalDateTime.now())
                .status(EnrollmentStatus.ACTIVE)
                .build();

        testEnrollmentDTO = EnrollmentDTO.builder()
                .enrollmentId(1L)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        createRequest = EnrollmentCreateRequest.builder()
                .formationId(1L)
                .build();
    }

    @Test
    void testGetEnrollmentById_Success() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(testEnrollment));

        EnrollmentDTO result = enrollmentService.getEnrollmentById(1L);

        assertNotNull(result);
        assertEquals(EnrollmentStatus.ACTIVE, result.getStatus());
        verify(enrollmentRepository, times(1)).findById(1L);
    }

    @Test
    void testGetEnrollmentById_NotFound() {
        when(enrollmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> enrollmentService.getEnrollmentById(99L));
    }

    @Test
    void testEnrollStudent_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(formationRepository.findById(1L)).thenReturn(Optional.of(testFormation));
        when(enrollmentRepository.findByStudentAndFormation(testStudent, testFormation))
                .thenReturn(Optional.empty());
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(testEnrollment);

        EnrollmentDTO result = enrollmentService.enrollStudent(1L, 1L);

        assertNotNull(result);
        assertEquals(EnrollmentStatus.PENDING, result.getStatus());
        verify(enrollmentRepository, times(1)).save(any(Enrollment.class));
    }

    @Test
    void testEnrollStudent_AlreadyEnrolled() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(formationRepository.findById(1L)).thenReturn(Optional.of(testFormation));
        when(enrollmentRepository.findByStudentAndFormation(testStudent, testFormation))
                .thenReturn(Optional.of(testEnrollment));

        assertThrows(RuntimeException.class, () -> enrollmentService.enrollStudent(1L, 1L));
        verify(enrollmentRepository, never()).save(any());
    }

    @Test
    void testUpdateEnrollmentStatus() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(testEnrollment));
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(testEnrollment);

        EnrollmentDTO result = enrollmentService.updateEnrollmentStatus(1L, EnrollmentStatus.COMPLETED);

        assertNotNull(result);
        verify(enrollmentRepository, times(1)).save(any(Enrollment.class));
    }

    @Test
    void testCancelEnrollment_Success() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(testEnrollment));

        enrollmentService.cancelEnrollment(1L);

        verify(enrollmentRepository, times(1)).delete(testEnrollment);
    }

    @Test
    void testCancelEnrollment_NotFound() {
        when(enrollmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> enrollmentService.cancelEnrollment(99L));
    }
}
