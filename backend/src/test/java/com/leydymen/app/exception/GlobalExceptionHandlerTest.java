package com.leydymen.app.exception;

import com.leydymen.app.dto.response.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.WebRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {
    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        webRequest = mock(WebRequest.class);
    }

    @Test
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException exception = new ResourceNotFoundException("User not found");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleResourceNotFoundException(exception, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("User not found", response.getBody().getMessage());
    }

    @Test
    void testHandleDuplicateResourceException() {
        DuplicateResourceException exception = new DuplicateResourceException("User already exists");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleDuplicateResourceException(exception, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("User already exists", response.getBody().getMessage());
    }

    @Test
    void testHandleUnauthorizedException() {
        UnauthorizedException exception = new UnauthorizedException("Unauthorized access");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleUnauthorizedException(exception, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals(401, response.getBody().getStatus());
    }

    @Test
    void testHandleBadRequestException() {
        BadRequestException exception = new BadRequestException("Invalid request");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleBadRequestException(exception, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(400, response.getBody().getStatus());
    }

    @Test
    void testHandleException() {
        Exception exception = new Exception("Unexpected error");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleException(exception, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(500, response.getBody().getStatus());
    }

    @Test
    void testHandleIllegalArgumentException() {
        IllegalArgumentException exception = new IllegalArgumentException("Invalid argument");

        ResponseEntity<ErrorResponse> response = globalExceptionHandler
                .handleException(exception, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}
