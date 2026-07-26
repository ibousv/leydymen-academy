package com.leydymen.app.controller;

import com.leydymen.app.dto.StudentProgressDTO;
import com.leydymen.app.dto.request.ProgressUpdateRequest;
import com.leydymen.app.dto.response.ApiResponse;
import com.leydymen.app.service.StudentProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@Tag(name = "Progress Tracking", description = "APIs for tracking student progress")
public class ProgressController {
    private final StudentProgressService progressService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Track lesson progress", description = "Update progress for a lesson")
    public ResponseEntity<ApiResponse<StudentProgressDTO>> trackProgress(
            @Valid @RequestBody ProgressUpdateRequest request) {
        // TODO: Get current user ID from security context
        Long studentId = 1L;
        StudentProgressDTO progress = progressService.trackProgress(studentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Progress tracked successfully", progress));
    }

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get lesson progress", description = "Get student's progress on a specific lesson")
    public ResponseEntity<ApiResponse<StudentProgressDTO>> getLessonProgress(
            @Parameter(description = "Lesson ID") @PathVariable Long lessonId) {
        // TODO: Get current user ID from security context and retrieve progress
        return ResponseEntity.ok(ApiResponse.success("Progress retrieved successfully", null));
    }

    @GetMapping("/formation/{formationId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get formation progress", description = "Get student's progress in a formation")
    public ResponseEntity<ApiResponse<List<StudentProgressDTO>>> getFormationProgress(
            @Parameter(description = "Formation ID") @PathVariable Long formationId) {
        // TODO: Get current user ID from security context
        Long studentId = 1L;
        List<StudentProgressDTO> progress = progressService.getFormationProgress(studentId, formationId);
        return ResponseEntity.ok(ApiResponse.success("Progress retrieved successfully", progress));
    }

    @GetMapping("/enrollment/{enrollmentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get enrollment progress", description = "Get all progress records for an enrollment")
    public ResponseEntity<ApiResponse<List<StudentProgressDTO>>> getEnrollmentProgress(
            @Parameter(description = "Enrollment ID") @PathVariable Long enrollmentId) {
        List<StudentProgressDTO> progress = progressService.getEnrollmentProgress(enrollmentId);
        return ResponseEntity.ok(ApiResponse.success("Progress retrieved successfully", progress));
    }
}
