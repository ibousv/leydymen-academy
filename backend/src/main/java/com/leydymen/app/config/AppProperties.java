package com.leydymen.app.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private String jwtSecret;
    private long jwtExpirationMs;
    private long jwtRefreshExpirationMs;
}
