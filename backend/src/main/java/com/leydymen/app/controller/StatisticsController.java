package com.leydymen.app.controller;

import com.leydymen.app.dto.response.ApiResponse;
import com.leydymen.app.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Tag(name = "Statistics", description = "APIs for retrieving platform statistics and analytics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get dashboard statistics", description = "Retrieve overall platform statistics (ADMIN)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStatistics() {
        Map<String, Object> stats = statisticsService.getDashboardStatistics();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", stats));
    }

    @GetMapping("/formations/{formationId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get formation statistics", description = "Retrieve detailed statistics for a specific formation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFormationStatistics(
            @Parameter(description = "Formation ID") @PathVariable Long formationId) {
        Map<String, Object> stats = statisticsService.getFormationStatistics(formationId);
        return ResponseEntity.ok(ApiResponse.success("Formation statistics retrieved successfully", stats));
    }

    @GetMapping("/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Get student statistics", description = "Retrieve progress statistics for a specific student")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentStatistics(
            @Parameter(description = "Student ID") @PathVariable Long studentId) {
        Map<String, Object> stats = statisticsService.getStudentStatistics(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student statistics retrieved successfully", stats));
    }
}
