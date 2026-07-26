package com.leydymen.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Configuration
public class BeanConfig {
    @Bean
    public SecurityService securityService() {
        return new SecurityService();
    }

    public static class SecurityService {
        public boolean isCurrentUser(Long userId) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return false;
            }
            return true;
        }

        public Long getCurrentUserId() {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }
            return null;
        }

        public String getCurrentUsername() {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }
            return authentication.getName();
        }
    }
}
