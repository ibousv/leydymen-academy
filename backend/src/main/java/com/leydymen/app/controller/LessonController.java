package com.leydymen.app.controller;

import com.leydymen.app.dto.LessonDTO;
import com.leydymen.app.dto.request.LessonCreateRequest;
import com.leydymen.app.dto.response.ApiResponse;
import com.leydymen.app.entity.Lesson.LessonStatus;
import com.leydymen.app.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@Tag(name = "Lesson Management", description = "APIs for managing course lessons")
public class LessonController {
    private final LessonService lessonService;

    @GetMapping("/{lessonId}")
    @Operation(summary = "Get lesson by ID", description = "Retrieve lesson details")
    public ResponseEntity<ApiResponse<LessonDTO>> getLessonById(
            @Parameter(description = "Lesson ID") @PathVariable Long lessonId) {
        LessonDTO lesson = lessonService.getLessonById(lessonId);
        return ResponseEntity.ok(ApiResponse.success("Lesson retrieved successfully", lesson));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Create lesson", description = "Create a new lesson in a module")
    public ResponseEntity<ApiResponse<LessonDTO>> createLesson(
            @Valid @RequestBody LessonCreateRequest request) {
        LessonDTO lesson = lessonService.createLesson(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Lesson created successfully", lesson));
    }

    @PutMapping("/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Update lesson", description = "Update lesson information")
    public ResponseEntity<ApiResponse<LessonDTO>> updateLesson(
            @Parameter(description = "Lesson ID") @PathVariable Long lessonId,
            @Valid @RequestBody LessonCreateRequest request) {
        LessonDTO lesson = lessonService.updateLesson(lessonId, request);
        return ResponseEntity.ok(ApiResponse.success("Lesson updated successfully", lesson));
    }

    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Delete lesson", description = "Delete a lesson")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(
            @Parameter(description = "Lesson ID") @PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("Lesson deleted successfully", null));
    }

    @PatchMapping("/{lessonId}/status")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Update lesson status", description = "Change lesson status")
    public ResponseEntity<ApiResponse<LessonDTO>> changeLessonStatus(
            @Parameter(description = "Lesson ID") @PathVariable Long lessonId,
            @Parameter(description = "New status") @RequestParam LessonStatus status) {
        LessonDTO lesson = lessonService.changeLessonStatus(lessonId, status);
        return ResponseEntity.ok(ApiResponse.success("Lesson status updated successfully", lesson));
    }
}
