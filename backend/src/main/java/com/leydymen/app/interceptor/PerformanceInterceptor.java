package com.leydymen.app.interceptor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Slf4j
@Component
public class PerformanceInterceptor implements HandlerInterceptor {
    private static final String START_TIME_ATTRIBUTE = "startTime";
    private static final long SLOW_REQUEST_THRESHOLD_MS = 1000; // 1 second

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, 
                           Object handler) throws Exception {
        request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) throws Exception {
        long startTime = (long) request.getAttribute(START_TIME_ATTRIBUTE);
        long duration = System.currentTimeMillis() - startTime;

        if (duration > SLOW_REQUEST_THRESHOLD_MS) {
            log.warn("Slow request detected: {} {} - Duration: {}ms", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    duration);
        } else {
            log.debug("Request completed: {} {} - Duration: {}ms", 
                    request.getMethod(), 
                    request.getRequestURI(), 
                    duration);
        }
    }
}
