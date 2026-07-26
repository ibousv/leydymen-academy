package com.leydymen.app.service;

import com.leydymen.app.dto.StudentProgressDTO;
import com.leydymen.app.dto.request.StudentProgressUpdateRequest;
import com.leydymen.app.entity.Enrollment;
import com.leydymen.app.entity.Lesson;
import com.leydymen.app.entity.StudentProgress;
import com.leydymen.app.mapper.StudentProgressMapper;
import com.leydymen.app.repository.EnrollmentRepository;
import com.leydymen.app.repository.LessonRepository;
import com.leydymen.app.repository.StudentProgressRepository;
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
class StudentProgressServiceTest {
    @Mock
    private StudentProgressRepository progressRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private StudentProgressMapper progressMapper;

    @InjectMocks
    private StudentProgressService studentProgressService;

    private StudentProgress testProgress;
    private StudentProgressDTO testProgressDTO;
    private Enrollment testEnrollment;
    private Lesson testLesson;
    private StudentProgressUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        testEnrollment = Enrollment.builder()
                .enrollmentId(1L)
                .build();

        testLesson = Lesson.builder()
                .lessonId(1L)
                .title("Introduction to Spring")
                .build();

        testProgress = StudentProgress.builder()
                .progressId(1L)
                .enrollment(testEnrollment)
                .lesson(testLesson)
                .completionPercentage(50)
                .isCompleted(false)
                .startedAt(LocalDateTime.now())
                .build();

        testProgressDTO = StudentProgressDTO.builder()
                .progressId(1L)
                .completionPercentage(50)
                .isCompleted(false)
                .build();

        updateRequest = StudentProgressUpdateRequest.builder()
                .completionPercentage(75)
                .isCompleted(false)
                .build();
    }

    @Test
    void testGetProgressById_Success() {
        when(progressRepository.findById(1L)).thenReturn(Optional.of(testProgress));
        when(progressMapper.toDTO(testProgress)).thenReturn(testProgressDTO);

        StudentProgressDTO result = studentProgressService.getProgressById(1L);

        assertNotNull(result);
        assertEquals(50, result.getCompletionPercentage());
        assertFalse(result.isCompleted());
        verify(progressRepository, times(1)).findById(1L);
    }

    @Test
    void testGetProgressById_NotFound() {
        when(progressRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> studentProgressService.getProgressById(99L));
    }

    @Test
    void testCreateProgress_Success() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(testEnrollment));
        when(lessonRepository.findById(1L)).thenReturn(Optional.of(testLesson));
        when(progressRepository.save(any(StudentProgress.class))).thenReturn(testProgress);
        when(progressMapper.toDTO(testProgress)).thenReturn(testProgressDTO);

        StudentProgressDTO result = studentProgressService.createProgress(1L, 1L);

        assertNotNull(result);
        assertEquals(50, result.getCompletionPercentage());
        verify(progressRepository, times(1)).save(any(StudentProgress.class));
    }

    @Test
    void testCreateProgress_EnrollmentNotFound() {
        when(enrollmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> studentProgressService.createProgress(99L, 1L));
        verify(progressRepository, never()).save(any());
    }

    @Test
    void testUpdateProgress_Success() {
        when(progressRepository.findById(1L)).thenReturn(Optional.of(testProgress));
        when(progressRepository.save(any(StudentProgress.class))).thenReturn(testProgress);
        when(progressMapper.toDTO(testProgress)).thenReturn(testProgressDTO);

        StudentProgressDTO result = studentProgressService.updateProgress(1L, updateRequest);

        assertNotNull(result);
        verify(progressRepository, times(1)).save(any(StudentProgress.class));
    }

    @Test
    void testMarkAsCompleted() {
        when(progressRepository.findById(1L)).thenReturn(Optional.of(testProgress));
        when(progressRepository.save(any(StudentProgress.class))).thenReturn(testProgress);
        when(progressMapper.toDTO(testProgress)).thenReturn(testProgressDTO);

        StudentProgressDTO result = studentProgressService.markAsCompleted(1L);

        assertNotNull(result);
        verify(progressRepository, times(1)).save(any(StudentProgress.class));
    }

    @Test
    void testGetEnrollmentProgress() {
        when(progressRepository.findByEnrollmentId(1L, org.springframework.data.domain.PageRequest.of(0, 10)))
                .thenReturn(org.springframework.data.domain.PageImpl.empty());

        var result = studentProgressService.getEnrollmentProgress(1L, 0, 10);

        assertNotNull(result);
        verify(progressRepository, times(1)).findByEnrollmentId(1L, org.springframework.data.domain.PageRequest.of(0, 10));
    }

    @Test
    void testDeleteProgress_Success() {
        when(progressRepository.findById(1L)).thenReturn(Optional.of(testProgress));

        studentProgressService.deleteProgress(1L);

        verify(progressRepository, times(1)).delete(testProgress);
    }

    @Test
    void testDeleteProgress_NotFound() {
        when(progressRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> studentProgressService.deleteProgress(99L));
        verify(progressRepository, never()).delete(any());
    }
}
