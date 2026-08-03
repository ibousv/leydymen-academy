package com.leydymen.app.service;

import com.leydymen.app.dto.EnrollmentDTO;
import com.leydymen.app.dto.response.PaginatedResponse;
import com.leydymen.app.entity.Enrollment;
import com.leydymen.app.entity.Enrollment.EnrollmentStatus;
import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.User;
import com.leydymen.app.repository.EnrollmentRepository;
import com.leydymen.app.repository.FormationRepository;
import com.leydymen.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final FormationRepository formationRepository;

    public EnrollmentDTO getEnrollmentById(Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));
    }

    public PaginatedResponse<EnrollmentDTO> getStudentEnrollments(Long studentId, Pageable pageable) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        Page<Enrollment> enrollments = enrollmentRepository.findByStudent(student, pageable);
        return buildPaginatedResponse(enrollments, pageable);
    }

    public PaginatedResponse<EnrollmentDTO> getFormationEnrollments(Long formationId, Pageable pageable) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        Page<Enrollment> enrollments = enrollmentRepository.findByFormation(formation, pageable);
        return buildPaginatedResponse(enrollments, pageable);
    }

    public PaginatedResponse<EnrollmentDTO> getFormationEnrollmentsByStatus(Long formationId, EnrollmentStatus status, Pageable pageable) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        Page<Enrollment> enrollments = enrollmentRepository.findByFormationAndStatus(formation, status, pageable);
        return buildPaginatedResponse(enrollments, pageable);
    }

    public PaginatedResponse<EnrollmentDTO> getStudentEnrollmentsByStatus(Long studentId, EnrollmentStatus status, Pageable pageable) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        Page<Enrollment> enrollments = enrollmentRepository.findByStudentAndStatus(student, status, pageable);
        return buildPaginatedResponse(enrollments, pageable);
    }

    public EnrollmentDTO enrollStudent(Long studentId, Long formationId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));

        if (enrollmentRepository.findByStudentAndFormation(student, formation).isPresent()) {
            throw new RuntimeException("Student is already enrolled in this formation");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .formation(formation)
                .enrollmentDate(LocalDate.now())
                .status(EnrollmentStatus.PENDING)
                .completionPercentage(0f)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return toDTO(savedEnrollment);
    }

    public EnrollmentDTO updateEnrollmentStatus(Long enrollmentId, EnrollmentStatus status) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));
        enrollment.setStatus(status);
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return toDTO(updatedEnrollment);
    }

    public EnrollmentDTO updateEnrollmentProgress(Long enrollmentId, Float completionPercentage) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));
        enrollment.setCompletionPercentage(completionPercentage);
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return toDTO(updatedEnrollment);
    }

    public void cancelEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with ID: " + enrollmentId));
        enrollmentRepository.delete(enrollment);
    }

    public long getFormationEnrollmentCount(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        return enrollmentRepository.countByFormation(formation);
    }

    public long getActiveEnrollmentCount(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        return enrollmentRepository.countActiveEnrollmentsByFormation(formation);
    }

    public long getCompletedEnrollmentCount(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        return enrollmentRepository.countCompletedEnrollmentsByFormation(formation);
    }

    public Double getAverageCompletionPercentage(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        return enrollmentRepository.getAverageCompletionPercentageByFormation(formation);
    }

    public long getTotalEnrollments() {
        return enrollmentRepository.count();
    }

    private EnrollmentDTO toDTO(Enrollment enrollment) {
        return EnrollmentDTO.builder()
                .enrollmentId(enrollment.getEnrollmentId())
                .studentId(enrollment.getStudent() != null ? enrollment.getStudent().getUserId() : null)
                .formationId(enrollment.getFormation() != null ? enrollment.getFormation().getFormationId() : null)
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .completionPercentage(enrollment.getCompletionPercentage())
                .build();
    }

    private PaginatedResponse<EnrollmentDTO> buildPaginatedResponse(Page<Enrollment> page, Pageable pageable) {
        return PaginatedResponse.<EnrollmentDTO>builder()
                .content(page.getContent().stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList()))
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
