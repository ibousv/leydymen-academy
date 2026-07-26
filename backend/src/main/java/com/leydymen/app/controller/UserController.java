package com.leydymen.app.controller;

import com.leydymen.app.dto.UserDTO;
import com.leydymen.app.dto.response.ApiResponse;
import com.leydymen.app.dto.response.PaginatedResponse;
import com.leydymen.app.entity.User.UserRole;
import com.leydymen.app.entity.User.UserStatus;
import com.leydymen.app.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users with pagination", description = "Retrieve all users with optional filtering by role and status")
    public ResponseEntity<ApiResponse<PaginatedResponse<UserDTO>>> getAllUsers(
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "User role filter") @RequestParam(required = false) UserRole role,
            @Parameter(description = "User status filter") @RequestParam(required = false) UserStatus status) {
        Pageable pageable = PageRequest.of(page, size);
        
        PaginatedResponse<UserDTO> response;
        if (role != null && status != null) {
            response = userService.getUsersByRole(role, pageable);
        } else if (role != null) {
            response = userService.getUsersByRole(role, pageable);
        } else if (status != null) {
            response = userService.getUsersByStatus(status, pageable);
        } else {
            response = userService.getAllUsers(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", response));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(#userId)")
    @Operation(summary = "Get user by ID", description = "Retrieve detailed information about a specific user")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by email", description = "Retrieve user information by email address")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByEmail(
            @Parameter(description = "User email") @PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by username", description = "Retrieve user information by username")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(
            @Parameter(description = "Username") @PathVariable String username) {
        UserDTO user = userService.getUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search users", description = "Search users by keyword (name, email, username)")
    public ResponseEntity<ApiResponse<PaginatedResponse<UserDTO>>> searchUsers(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PaginatedResponse<UserDTO> response = userService.searchUsers(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users found", response));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @securityService.isCurrentUser(#userId)")
    @Operation(summary = "Update user", description = "Update user information")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user account")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("User deleted successfully", null));
    }

    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Change user status (ACTIVE, INACTIVE, BANNED)")
    public ResponseEntity<ApiResponse<Void>> changeUserStatus(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "New status") @RequestParam UserStatus status) {
        userService.changeUserStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", null));
    }
}
