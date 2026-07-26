package com.leydymen.app.security;

import com.leydymen.app.config.AppProperties;
import com.leydymen.app.entity.User;
import com.leydymen.app.entity.User.UserRole;
import com.leydymen.app.entity.User.UserStatus;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {
    @Mock
    private AppProperties appProperties;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    private UserPrincipal userPrincipal;
    private String testSecret;
    private long jwtExpirationMs;
    private long jwtRefreshExpirationMs;

    @BeforeEach
    void setUp() {
        testSecret = "this-is-a-very-long-secret-key-for-jwt-token-generation-and-validation-min-256-chars-long-please";
        jwtExpirationMs = 86400000;
        jwtRefreshExpirationMs = 604800000;

        when(appProperties.getJwtSecret()).thenReturn(testSecret);
        when(appProperties.getJwtExpirationMs()).thenReturn(jwtExpirationMs);
        when(appProperties.getJwtRefreshExpirationMs()).thenReturn(jwtRefreshExpirationMs);

        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_STUDENT");
        userPrincipal = UserPrincipal.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded_password")
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .authorities(Collections.singletonList(authority))
                .build();

        when(authentication.getPrincipal()).thenReturn(userPrincipal);
    }

    @Test
    void testGenerateToken_Success() {
        String token = jwtTokenProvider.generateToken(authentication);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertFalse(jwtTokenProvider.isTokenExpired(token));
    }

    @Test
    void testGetJwtExpirationMs() {
        long expiration = jwtTokenProvider.getJwtExpirationMs();

        assertEquals(jwtExpirationMs, expiration);
    }

    @Test
    void testGetUsernameFromToken() {
        String token = jwtTokenProvider.generateToken(authentication);
        String username = jwtTokenProvider.getUsernameFromToken(token);

        assertEquals("testuser", username);
    }

    @Test
    void testGetUserIdFromToken() {
        String token = jwtTokenProvider.generateToken(authentication);
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        assertEquals(1L, userId);
    }

    @Test
    void testValidateToken_ValidToken() {
        String token = jwtTokenProvider.generateToken(authentication);

        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void testValidateToken_InvalidToken() {
        String invalidToken = "invalid.token.here";

        assertFalse(jwtTokenProvider.validateToken(invalidToken));
    }

    @Test
    void testValidateToken_ExpiredToken() {
        String expiredToken = Jwts.builder()
                .setSubject("testuser")
                .setIssuedAt(new Date(System.currentTimeMillis() - jwtExpirationMs - 1000))
                .setExpiration(new Date(System.currentTimeMillis() - 1000))
                .signWith(SignatureAlgorithm.HS512, testSecret)
                .compact();

        assertFalse(jwtTokenProvider.validateToken(expiredToken));
    }

    @Test
    void testIsTokenExpired() {
        String token = jwtTokenProvider.generateToken(authentication);

        assertFalse(jwtTokenProvider.isTokenExpired(token));
    }

    @Test
    void testGenerateRefreshToken() {
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication, userPrincipal.getUsername());

        assertNotNull(refreshToken);
        assertFalse(refreshToken.isEmpty());
    }

    @Test
    void testGetUserPrincipalFromToken() {
        String token = jwtTokenProvider.generateToken(authentication);
        String username = jwtTokenProvider.getUsernameFromToken(token);

        assertNotNull(username);
        assertEquals("testuser", username);
    }
}
