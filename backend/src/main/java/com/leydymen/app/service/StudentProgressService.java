package com.leydymen.app.service;

import com.leydymen.app.dto.StudentProgressDTO;
import com.leydymen.app.dto.request.ProgressUpdateRequest;
import com.leydymen.app.entity.Enrollment;
import com.leydymen.app.entity.Lesson;
import com.leydymen.app.entity.StudentProgress;
import com.leydymen.app.entity.StudentProgress.ProgressStatus;
import com.leydymen.app.entity.User;
import com.leydymen.app.repository.EnrollmentRepository;
import com.leydymen.app.repository.LessonRepository;
import com.leydymen.app.repository.StudentProgressRepository;
import com.leydymen.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentProgressService {
    private final StudentProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;

    public StudentProgressDTO getProgressById(Long progressId) {
        return progressRepository.findById(progressId)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Progress not found with ID: " + progressId));
    }

    public StudentProgressDTO trackProgress(Long studentId, ProgressUpdateRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + request.getLessonId()));

        StudentProgress progress = progressRepository.findByStudentAndLesson(student, lesson)
                .orElse(StudentProgress.builder()
                        .student(student)
                        .lesson(lesson)
                        .status(ProgressStatus.NOT_STARTED)
                        .percentageWatched(0f)
                        .build());

        progress.setStatus(request.getStatus());
        progress.setPercentageWatched(request.getPercentageWatched());

        if (request.getStatus() == ProgressStatus.COMPLETED) {
            progress.setCompletedDate(LocalDateTime.now());
        }

        StudentProgress savedProgress = progressRepository.save(progress);
        return toDTO(savedProgress);
    }

    public StudentProgressDTO trackProgressWithEnrollment(Long studentId, Long enrollmentId, ProgressUpdateRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + request.getLessonId()));
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));

        StudentProgress progress = progressRepository.findByStudentAndLesson(student, lesson)
                .orElse(StudentProgress.builder()
                        .student(student)
                        .lesson(lesson)
                        .enrollment(enrollment)
                        .status(ProgressStatus.NOT_STARTED)
                        .percentageWatched(0f)
                        .build());

        progress.setStatus(request.getStatus());
        progress.setPercentageWatched(request.getPercentageWatched());

        if (request.getStatus() == ProgressStatus.COMPLETED) {
            progress.setCompletedDate(LocalDateTime.now());
        }

        StudentProgress savedProgress = progressRepository.save(progress);
        return toDTO(savedProgress);
    }

    public List<StudentProgressDTO> getStudentProgress(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        return progressRepository.findByStudent(student).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<StudentProgressDTO> getEnrollmentProgress(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));
        return progressRepository.findProgressByEnrollment(enrollment).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<StudentProgressDTO> getFormationProgress(Long studentId, Long formationId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        return progressRepository.findProgressByStudentAndFormation(student, formationId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public long getCompletedLessonsCount(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));
        return progressRepository.countCompletedLessonsByEnrollment(enrollment);
    }

    public long getTotalLessonsCount(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));
        return progressRepository.countTotalLessonsByEnrollment(enrollment);
    }

    public Double getEnrollmentCompletionPercentage(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));
        return progressRepository.getAverageCompletionPercentageByEnrollment(enrollment);
    }

    private StudentProgressDTO toDTO(StudentProgress progress) {
        return StudentProgressDTO.builder()
                .progressId(progress.getProgressId())
                .studentId(progress.getStudent() != null ? progress.getStudent().getUserId() : null)
                .lessonId(progress.getLesson() != null ? progress.getLesson().getLessonId() : null)
                .enrollmentId(progress.getEnrollment() != null ? progress.getEnrollment().getEnrollmentId() : null)
                .status(progress.getStatus())
                .percentageWatched(progress.getPercentageWatched())
                .completedDate(progress.getCompletedDate())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }
}
