package com.leydymen.app.config;

import com.leydymen.app.filter.ApiVersionFilter;
import com.leydymen.app.filter.RequestResponseLoggingFilter;
import com.leydymen.app.interceptor.PerformanceInterceptor;
import com.leydymen.app.interceptor.SecurityInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    private final SecurityInterceptor securityInterceptor;
    private final PerformanceInterceptor performanceInterceptor;
    private final RequestResponseLoggingFilter requestResponseLoggingFilter;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(securityInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**");

        registry.addInterceptor(performanceInterceptor)
                .addPathPatterns("/api/**");
    }

    @Bean
    public FilterRegistrationBean<ApiVersionFilter> apiVersionFilter() {
        FilterRegistrationBean<ApiVersionFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new ApiVersionFilter());
        registrationBean.addUrlPatterns("/api/*");
        registrationBean.setOrder(1);
        return registrationBean;
    }

    @Bean
    public FilterRegistrationBean<RequestResponseLoggingFilter> loggingFilter() {
        FilterRegistrationBean<RequestResponseLoggingFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(requestResponseLoggingFilter);
        registrationBean.addUrlPatterns("/api/*");
        registrationBean.setOrder(2);
        return registrationBean;
    }
}
