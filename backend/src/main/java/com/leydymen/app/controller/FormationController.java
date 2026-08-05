package com.leydymen.app.controller;

import com.leydymen.app.config.BeanConfig.SecurityService;
import com.leydymen.app.dto.EnrollmentDTO;
import com.leydymen.app.dto.FormationDTO;
import com.leydymen.app.dto.ModuleDTO;
import com.leydymen.app.dto.request.FormationCreateRequest;
import com.leydymen.app.dto.response.ApiResponse;
import com.leydymen.app.dto.response.PaginatedResponse;
import com.leydymen.app.entity.Enrollment.EnrollmentStatus;
import com.leydymen.app.entity.Formation.FormationLevel;
import com.leydymen.app.entity.Formation.FormationStatus;
import com.leydymen.app.service.EnrollmentService;
import com.leydymen.app.service.FormationService;
import com.leydymen.app.service.ModuleService;
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
@RequestMapping("/api/formations")
@RequiredArgsConstructor
@Tag(name = "Formation Management", description = "APIs for managing formations/courses")
public class FormationController {
    private final FormationService formationService;
    private final EnrollmentService enrollmentService;
    private final ModuleService moduleService;
    private final SecurityService securityService;

    @GetMapping
    @Operation(summary = "Get all formations", description = "Retrieve all formations with pagination and optional filters")
    public ResponseEntity<ApiResponse<PaginatedResponse<FormationDTO>>> getAllFormations(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Formation status filter") @RequestParam(required = false) FormationStatus status,
            @Parameter(description = "Formation level filter") @RequestParam(required = false) FormationLevel level,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category) {
        Pageable pageable = PageRequest.of(page, size);
        
        PaginatedResponse<FormationDTO> response;
        if (status != null) {
            response = formationService.getFormationsByStatus(status, pageable);
        } else if (level != null) {
            response = formationService.getFormationsByLevel(level, pageable);
        } else if (category != null) {
            response = formationService.getFormationsByCategory(category, pageable);
        } else {
            response = formationService.getAllFormations(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Formations retrieved successfully", response));
    }

    @GetMapping("/{formationId}")
    @Operation(summary = "Get formation by ID", description = "Retrieve detailed information about a specific formation")
    public ResponseEntity<ApiResponse<FormationDTO>> getFormationById(
            @Parameter(description = "Formation ID") @PathVariable Long formationId) {
        FormationDTO formation = formationService.getFormationById(formationId);
        return ResponseEntity.ok(ApiResponse.success("Formation retrieved successfully", formation));
    }

    @GetMapping("/search")
    @Operation(summary = "Search formations", description = "Search formations by keyword (title, description, category)")
    public ResponseEntity<ApiResponse<PaginatedResponse<FormationDTO>>> searchFormations(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PaginatedResponse<FormationDTO> response = formationService.searchFormations(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("Formations found", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Create formation", description = "Create a new formation (INSTRUCTOR or ADMIN only)")
    public ResponseEntity<ApiResponse<FormationDTO>> createFormation(
            @Valid @RequestBody FormationCreateRequest request) {
        Long instructorId = securityService.getCurrentUserId();
        if (instructorId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "User not authenticated"));
        }
        FormationDTO formation = formationService.createFormation(instructorId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Formation created successfully", formation));
    }

    @PutMapping("/{formationId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Update formation", description = "Update an existing formation")
    public ResponseEntity<ApiResponse<FormationDTO>> updateFormation(
            @Parameter(description = "Formation ID") @PathVariable Long formationId,
            @Valid @RequestBody FormationCreateRequest request) {
        FormationDTO formation = formationService.updateFormation(formationId, request);
        return ResponseEntity.ok(ApiResponse.success("Formation updated successfully", formation));
    }

    @DeleteMapping("/{formationId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Delete formation", description = "Delete a formation")
    public ResponseEntity<ApiResponse<Void>> deleteFormation(
            @Parameter(description = "Formation ID") @PathVariable Long formationId) {
        formationService.deleteFormation(formationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("Formation deleted successfully", null));
    }

    @PatchMapping("/{formationId}/status")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Update formation status", description = "Change formation status")
    public ResponseEntity<ApiResponse<FormationDTO>> changeFormationStatus(
            @Parameter(description = "Formation ID") @PathVariable Long formationId,
            @Parameter(description = "New status") @RequestParam FormationStatus status) {
        FormationDTO formation = formationService.changeFormationStatus(formationId, status);
        return ResponseEntity.ok(ApiResponse.success("Formation status updated successfully", formation));
    }

    @GetMapping("/{formationId}/modules")
    @Operation(summary = "Get formation modules", description = "Retrieve all modules for a formation")
    public ResponseEntity<ApiResponse<Object>> getFormationModules(
            @Parameter(description = "Formation ID") @PathVariable Long formationId) {
        List<ModuleDTO> modules = moduleService.getModulesByFormation(formationId);
        return ResponseEntity.ok(ApiResponse.success("Modules retrieved successfully", modules));
    }

    @GetMapping("/{formationId}/enrollments")
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
