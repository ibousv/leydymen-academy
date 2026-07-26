package com.leydymen.app.controller;

import com.leydymen.app.dto.UserDTO;
import com.leydymen.app.dto.request.LoginRequest;
import com.leydymen.app.dto.request.RegisterRequest;
import com.leydymen.app.dto.response.ApiResponse;
import com.leydymen.app.dto.response.LoginResponse;
import com.leydymen.app.entity.User;
import com.leydymen.app.mapper.UserMapper;
import com.leydymen.app.security.JwtTokenProvider;
import com.leydymen.app.security.UserPrincipal;
import com.leydymen.app.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user authentication and registration")
public class AuthController {
    private final UserService userService;
    private final UserMapper userMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create a new user account")
    public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName(),
                request.getRole()
        );
        
        UserDTO userDTO = userMapper.toDTO(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("User registered successfully", userDTO));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate user and receive JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(
                userPrincipal.getUsername(),
                userPrincipal.getUserId()
        );

        userService.updateLastLogin(userPrincipal.getUserId());

        LoginResponse response = LoginResponse.builder()
                .userId(userPrincipal.getUserId())
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getEmail())
                .token(token)
                .refreshToken(refreshToken)
                .role(userPrincipal.getRole())
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Generate a new access token using refresh token")
    public ResponseEntity<ApiResponse<LoginResponse>> refreshToken(@RequestParam String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(401, "Invalid refresh token"));
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String newToken = jwtTokenProvider.generateTokenFromUsername(username, userId);

        LoginResponse response = LoginResponse.builder()
                .userId(userId)
                .username(username)
                .token(newToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getJwtExpirationMs())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Logout current user (invalidate token on client side)")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Token invalidation is typically handled on the client side by removing the token
        // For stateless JWT, we don't need to do anything on the server
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}
