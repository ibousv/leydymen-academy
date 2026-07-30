package com.leydymen.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leydymen.app.dto.request.LoginRequest;
import com.leydymen.app.dto.request.RegisterRequest;
import com.leydymen.app.dto.response.LoginResponse;
import com.leydymen.app.entity.User;
import com.leydymen.app.entity.User.UserRole;
import com.leydymen.app.entity.User.UserStatus;
import com.leydymen.app.security.JwtTokenProvider;
import com.leydymen.app.security.UserPrincipal;
import com.leydymen.app.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .username("testuser")
                .email("test@example.com")
                .password("TestPass123!")
                .firstName("Test")
                .lastName("User")
                .role(UserRole.STUDENT)
                .build();

        loginRequest = LoginRequest.builder()
                .username("testuser")
                .password("TestPass123!")
                .build();

        testUser = User.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded_password")
                .firstName("Test")
                .lastName("User")
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    void testRegister_Success() throws Exception {
        when(userService.createUser(any(), any(), any(), any(), any(), any()))
                .thenReturn(testUser);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.message").value("User registered successfully"));

        verify(userService, times(1)).createUser(any(), any(), any(), any(), any(), any());
    }

    @Test
    void testRegister_InvalidRequest() throws Exception {
        RegisterRequest invalidRequest = RegisterRequest.builder()
                .username("test")
                .email("invalid-email")
                .password("short")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLogin_Success() throws Exception {
        UserPrincipal userPrincipal = UserPrincipal.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded_password")
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .authorities(List.of(() -> "ROLE_STUDENT"))
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities());

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);
        when(jwtTokenProvider.generateToken(any()))
                .thenReturn("test-jwt-token");
        when(jwtTokenProvider.generateRefreshToken(any(), any()))
                .thenReturn("test-refresh-token");
        when(jwtTokenProvider.getJwtExpirationMs())
                .thenReturn(86400000L);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.token").value("test-jwt-token"));

        verify(authenticationManager, times(1)).authenticate(any());
        verify(jwtTokenProvider, times(1)).generateToken(any());
    }

    @Test
    void testLogin_InvalidCredentials() throws Exception {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testLogout_Success() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logout successful"));
    }
}
