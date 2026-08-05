package com.leydymen.app.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.util.Enumeration;
import java.util.UUID;

@Slf4j
@Component
public class RequestResponseLoggingFilter extends OncePerRequestFilter {
    private static final String REQUEST_ID_HEADER = "X-Request-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isEmpty()) {
            requestId = UUID.randomUUID().toString();
        }

        request.setAttribute("requestId", requestId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request, 10000);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();

        try {
            logRequest(requestId, requestWrapper);
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            logResponse(requestId, responseWrapper, duration);
            responseWrapper.copyBodyToResponse();
        }
    }

    private void logRequest(String requestId, ContentCachingRequestWrapper request) {
        log.info("[{}] {} {} - Headers: {}", 
                requestId,
                request.getMethod(), 
                request.getRequestURI(),
                getHeadersAsString(request));
        
        if (isJsonContentType(request.getContentType())) {
            String body = new String(request.getContentAsByteArray());
            if (!body.isEmpty()) {
                log.debug("[{}] Request Body: {}", requestId, body);
            }
        }
    }

    private void logResponse(String requestId, ContentCachingResponseWrapper response, long duration) {
        log.info("[{}] Response Status: {} - Duration: {}ms", 
                requestId,
                response.getStatus(), 
                duration);
        
        if (isJsonContentType(response.getContentType())) {
            String body = new String(response.getContentAsByteArray());
            if (!body.isEmpty()) {
                log.debug("[{}] Response Body: {}", requestId, body);
            }
        }
    }

    private String getHeadersAsString(HttpServletRequest request) {
        StringBuilder sb = new StringBuilder();
        Enumeration<String> headerNames = request.getHeaderNames();
        
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            
            // Mask sensitive headers
            if (isSensitiveHeader(headerName)) {
                headerValue = "***";
            }
            
            sb.append(headerName).append("=").append(headerValue).append(" ");
        }
        
        return sb.toString();
    }

    private boolean isSensitiveHeader(String headerName) {
        return headerName.equalsIgnoreCase("Authorization") ||
               headerName.equalsIgnoreCase("Password") ||
               headerName.equalsIgnoreCase("X-API-Key");
    }

    private boolean isJsonContentType(String contentType) {
        return contentType != null && contentType.contains("application/json");
    }
}
