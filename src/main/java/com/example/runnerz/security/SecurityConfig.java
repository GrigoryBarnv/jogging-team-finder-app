package com.example.runnerz.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

@Configuration
@Profile("oauth")
public class SecurityConfig {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/api/auth/me", "/api/auth/display-name", "/error").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/auth/nickname").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/runs/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/runs").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/runs/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .successHandler(frontendRedirectSuccessHandler())
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl(frontendUrl)
            )
            .build();
    }

    private AuthenticationSuccessHandler frontendRedirectSuccessHandler() {
        return (request, response, authentication) ->
            response.sendRedirect(frontendUrl);
    }
}
