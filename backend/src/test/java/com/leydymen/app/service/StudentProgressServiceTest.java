package com.leydymen.app.service;

import com.leydymen.app.dto.StudentProgressDTO;
import com.leydymen.app.dto.request.ProgressUpdateRequest;
import com.leydymen.app.entity.Enrollment;
import com.leydymen.app.entity.Lesson;
import com.leydymen.app.entity.StudentProgress;
import com.leydymen.app.entity.StudentProgress.ProgressStatus;
import com.leydymen.app.repository.EnrollmentRepository;
import com.leydymen.app.repository.LessonRepository;
import com.leydymen.app.repository.StudentProgressRepository;
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
class StudentProgressServiceTest {
    @Mock
    private StudentProgressRepository progressRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StudentProgressService studentProgressService;

    private StudentProgress testProgress;
    private StudentProgressDTO testProgressDTO;
    private Enrollment testEnrollment;
    private Lesson testLesson;
    private ProgressUpdateRequest updateRequest;

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
                .percentageWatched(50f)
                .status(ProgressStatus.IN_PROGRESS)
                .build();

        testProgressDTO = StudentProgressDTO.builder()
                .progressId(1L)
                .percentageWatched(50f)
                .status(ProgressStatus.IN_PROGRESS)
                .build();

        updateRequest = ProgressUpdateRequest.builder()
                .lessonId(1L)
                .percentageWatched(75f)
                .status(ProgressStatus.IN_PROGRESS)
                .build();
    }

    @Test
    void testGetProgressById_Success() {
        when(progressRepository.findById(1L)).thenReturn(Optional.of(testProgress));

        StudentProgressDTO result = studentProgressService.getProgressById(1L);

        assertNotNull(result);
        assertEquals(50f, result.getPercentageWatched());
        assertEquals(ProgressStatus.IN_PROGRESS, result.getStatus());
        verify(progressRepository, times(1)).findById(1L);
    }

    @Test
    void testGetProgressById_NotFound() {
        when(progressRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> studentProgressService.getProgressById(99L));
    }

    @Test
    void testTrackProgress_Success() {
        when(progressRepository.findByStudentAndLesson(any(), any())).thenReturn(Optional.empty());
        when(progressRepository.save(any(StudentProgress.class))).thenReturn(testProgress);

        StudentProgressDTO result = studentProgressService.trackProgress(1L, updateRequest);

        assertNotNull(result);
        verify(progressRepository, times(1)).save(any(StudentProgress.class));
    }

    @Test
    void testTrackProgress_Update() {
        when(progressRepository.findByStudentAndLesson(any(), any())).thenReturn(Optional.of(testProgress));
        when(progressRepository.save(any(StudentProgress.class))).thenReturn(testProgress);

        StudentProgressDTO result = studentProgressService.trackProgress(1L, updateRequest);

        assertNotNull(result);
        verify(progressRepository, times(1)).save(any(StudentProgress.class));
    }

    @Test
    void testGetEnrollmentProgress() {
        when(enrollmentRepository.findById(1L)).thenReturn(Optional.of(testEnrollment));
        when(progressRepository.findProgressByEnrollment(testEnrollment))
                .thenReturn(java.util.Arrays.asList(testProgress));

        var result = studentProgressService.getEnrollmentProgress(1L);

        assertNotNull(result);
        verify(progressRepository, times(1)).findProgressByEnrollment(testEnrollment);
    }
