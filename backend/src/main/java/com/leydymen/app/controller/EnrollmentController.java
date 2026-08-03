package com.leydymen.app.controller;

import com.leydymen.app.config.BeanConfig.SecurityService;
import com.leydymen.app.dto.EnrollmentDTO;
import com.leydymen.app.dto.request.EnrollmentCreateRequest;
import com.leydymen.app.dto.response.ApiResponse;
import com.leydymen.app.dto.response.PaginatedResponse;
import com.leydymen.app.entity.Enrollment.EnrollmentStatus;
import com.leydymen.app.service.EnrollmentService;
import com.leydymen.app.service.StudentProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollment Management", description = "APIs for managing course enrollments")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    private final StudentProgressService studentProgressService;
    private final SecurityService securityService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get my enrollments", description = "Retrieve current user's enrollments")
    public ResponseEntity<ApiResponse<PaginatedResponse<EnrollmentDTO>>> getMyEnrollments(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(required = false) Integer page,
            @Parameter(description = "Page size") @RequestParam(required = false) Integer size) {
        Long studentId = securityService.getCurrentUserId();
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "User not authenticated"));
        }
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 10;
        Pageable pageable = PageRequest.of(pageNum, pageSize);
        PaginatedResponse<EnrollmentDTO> response = enrollmentService.getStudentEnrollments(studentId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Enrollments retrieved successfully", response));
    }

    @GetMapping("/{enrollmentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get enrollment by ID", description = "Retrieve enrollment details")
    public ResponseEntity<ApiResponse<EnrollmentDTO>> getEnrollmentById(
            @Parameter(description = "Enrollment ID") @PathVariable Long enrollmentId) {
        EnrollmentDTO enrollment = enrollmentService.getEnrollmentById(enrollmentId);
        return ResponseEntity.ok(ApiResponse.success("Enrollment retrieved successfully", enrollment));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Enroll in formation", description = "Enroll current user in a formation")
    public ResponseEntity<ApiResponse<EnrollmentDTO>> enrollFormation(
            @Valid @RequestBody EnrollmentCreateRequest request) {
        Long studentId = securityService.getCurrentUserId();
        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "User not authenticated"));
        }
        EnrollmentDTO enrollment = enrollmentService.enrollStudent(studentId, request.getFormationId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Enrolled successfully", enrollment));
    }

    @PutMapping("/{enrollmentId}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Update enrollment status", description = "Change enrollment status")
    public ResponseEntity<ApiResponse<EnrollmentDTO>> updateEnrollmentStatus(
            @Parameter(description = "Enrollment ID") @PathVariable Long enrollmentId,
            @Parameter(description = "New status") @RequestParam EnrollmentStatus status) {
        EnrollmentDTO enrollment = enrollmentService.updateEnrollmentStatus(enrollmentId, status);
        return ResponseEntity.ok(ApiResponse.success("Enrollment status updated successfully", enrollment));
    }

    @DeleteMapping("/{enrollmentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    @Operation(summary = "Cancel enrollment", description = "Cancel an enrollment")
    public ResponseEntity<ApiResponse<Void>> cancelEnrollment(
            @Parameter(description = "Enrollment ID") @PathVariable Long enrollmentId) {
        enrollmentService.cancelEnrollment(enrollmentId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("Enrollment cancelled successfully", null));
    }

    @GetMapping("/{enrollmentId}/progress")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get enrollment progress", description = "Retrieve progress details for an enrollment")
    public ResponseEntity<ApiResponse<Object>> getEnrollmentProgress(
            @Parameter(description = "Enrollment ID") @PathVariable Long enrollmentId) {
        // Get enrollment progress including completed lessons and overall percentage
        List<Object> progressDetails = new java.util.ArrayList<>(studentProgressService.getEnrollmentProgress(enrollmentId));
        long completedLessons = studentProgressService.getCompletedLessonsCount(enrollmentId);
        long totalLessons = studentProgressService.getTotalLessonsCount(enrollmentId);
        Double completionPercentage = studentProgressService.getEnrollmentCompletionPercentage(enrollmentId);
        
        // Build response object
        var response = new java.util.HashMap<String, Object>();
        response.put("enrollmentId", enrollmentId);
        response.put("completedLessons", completedLessons);
        response.put("totalLessons", totalLessons);
        response.put("overallProgress", completionPercentage != null ? completionPercentage : 0.0);
        response.put("lessons", progressDetails);
        
        return ResponseEntity.ok(ApiResponse.success("Progress retrieved successfully", response));
    }

    @GetMapping("/formation/{formationId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Get formation enrollments", description = "Retrieve all enrollments for a formation (INSTRUCTOR/ADMIN)")
    public ResponseEntity<ApiResponse<PaginatedResponse<EnrollmentDTO>>> getFormationEnrollments(
            @Parameter(description = "Formation ID") @PathVariable Long formationId,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(required = false) Integer page,
            @Parameter(description = "Page size") @RequestParam(required = false) Integer size,
            @Parameter(description = "Enrollment status filter") @RequestParam(required = false) EnrollmentStatus status) {
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 10;
        Pageable pageable = PageRequest.of(pageNum, pageSize);
        PaginatedResponse<EnrollmentDTO> response;
        if (status != null) {
            response = enrollmentService.getFormationEnrollmentsByStatus(formationId, status, pageable);
        } else {
            response = enrollmentService.getFormationEnrollments(formationId, pageable);
        }
        return ResponseEntity.ok(ApiResponse.success("Formation enrollments retrieved successfully", response));
    }
}
