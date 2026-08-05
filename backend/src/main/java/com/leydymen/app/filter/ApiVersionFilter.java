package com.leydymen.app.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class ApiVersionFilter extends OncePerRequestFilter {
    private static final String API_VERSION_HEADER = "X-API-Version";
    private static final String ACCEPT_VERSION_HEADER = "Accept-Version";
    private static final String DEFAULT_VERSION = "1.0";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        String apiVersion = request.getHeader(API_VERSION_HEADER);
        
        if (apiVersion == null) {
            apiVersion = request.getHeader(ACCEPT_VERSION_HEADER);
        }
        
        if (apiVersion == null) {
            apiVersion = DEFAULT_VERSION;
        }

        request.setAttribute("apiVersion", apiVersion);
        response.setHeader(API_VERSION_HEADER, apiVersion);

        log.debug("API Version: {}", apiVersion);
        filterChain.doFilter(request, response);
    }
}
