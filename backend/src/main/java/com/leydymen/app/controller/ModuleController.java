package com.leydymen.app.controller;

import com.leydymen.app.dto.LessonDTO;
import com.leydymen.app.dto.ModuleDTO;
import com.leydymen.app.dto.request.ModuleCreateRequest;
import com.leydymen.app.dto.response.ApiResponse;
import com.leydymen.app.entity.Module.ModuleStatus;
import com.leydymen.app.service.LessonService;
import com.leydymen.app.service.ModuleService;
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
@RequestMapping("/api/modules")
@RequiredArgsConstructor
@Tag(name = "Module Management", description = "APIs for managing course modules")
public class ModuleController {
    private final ModuleService moduleService;
    private final LessonService lessonService;

    @GetMapping("/{moduleId}")
    @Operation(summary = "Get module by ID", description = "Retrieve module details")
    public ResponseEntity<ApiResponse<ModuleDTO>> getModuleById(
            @Parameter(description = "Module ID") @PathVariable Long moduleId) {
        ModuleDTO module = moduleService.getModuleById(moduleId);
        return ResponseEntity.ok(ApiResponse.success("Module retrieved successfully", module));
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Create module", description = "Create a new module in a formation")
    public ResponseEntity<ApiResponse<ModuleDTO>> createModule(
            @Valid @RequestBody ModuleCreateRequest request) {
        ModuleDTO module = moduleService.createModule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Module created successfully", module));
    }

    @PutMapping("/{moduleId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Update module", description = "Update module information")
    public ResponseEntity<ApiResponse<ModuleDTO>> updateModule(
            @Parameter(description = "Module ID") @PathVariable Long moduleId,
            @Valid @RequestBody ModuleCreateRequest request) {
        ModuleDTO module = moduleService.updateModule(moduleId, request);
        return ResponseEntity.ok(ApiResponse.success("Module updated successfully", module));
    }

    @DeleteMapping("/{moduleId}")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Delete module", description = "Delete a module")
    public ResponseEntity<ApiResponse<Void>> deleteModule(
            @Parameter(description = "Module ID") @PathVariable Long moduleId) {
        moduleService.deleteModule(moduleId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("Module deleted successfully", null));
    }

    @PatchMapping("/{moduleId}/status")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    @Operation(summary = "Update module status", description = "Change module status")
    public ResponseEntity<ApiResponse<ModuleDTO>> changeModuleStatus(
            @Parameter(description = "Module ID") @PathVariable Long moduleId,
            @Parameter(description = "New status") @RequestParam ModuleStatus status) {
        ModuleDTO module = moduleService.changeModuleStatus(moduleId, status);
        return ResponseEntity.ok(ApiResponse.success("Module status updated successfully", module));
    }

    @GetMapping("/{moduleId}/lessons")
    @Operation(summary = "Get module lessons", description = "Retrieve all lessons in a module")
    public ResponseEntity<ApiResponse<List<LessonDTO>>> getModuleLessons(
            @Parameter(description = "Module ID") @PathVariable Long moduleId) {
        List<LessonDTO> lessons = lessonService.getLessonsByModule(moduleId);
        return ResponseEntity.ok(ApiResponse.success("Lessons retrieved successfully", lessons));
    }
}
