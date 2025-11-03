package com.patrones.api.config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    // =============================================
    // 🔓 ENDPOINTS PÚBLICOS (Sin autenticación)
    // =============================================
    private static final String[] PUBLIC_PATHS = {
        // Autenticación y registro
        "/auth/**",
        "/api/auth/**",
        
        // Testing y health checks
        "/test",
        "/api/test", 
        "/debug/**",
        "/health",
        
        // Documentación API
        "/swagger-ui/**",
        "/v3/api-docs/**",
        "/api-docs/**",
        
        // Archivos estáticos y errores
        "/error",
        "/favicon.ico",
        "/public/**"
    };

    // =============================================
    // 🔐 ENDPOINTS PRIVADOS (Requieren JWT + Scopes)
    // =============================================
    private static final String[] SERVICE_PATHS = {
        "/service/**"
    };
    
    private static final String[] USER_PATHS = {
        "/user/**"
    };
    
    private static final String[] ADMIN_PATHS = {
        "/admin/**"
    };

    // 🔓 Public endpoints - COMPLETELY BYPASS SECURITY (no JWT, no authentication)
    @Bean
    @Order(1)
    public SecurityFilterChain publicFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher(PUBLIC_PATHS)
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // No authentication required
            )
            // CRITICAL: Disable all authentication for this filter chain
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    // 🔐 Protected endpoints - WITH JWT processing
    @Bean
    @Order(2)
    public SecurityFilterChain protectedFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // ========================
                // 🔐 ENDPOINTS PRIVADOS
                // ========================
                
                // Servicios - requiere scope service.read
                .requestMatchers(SERVICE_PATHS).hasAuthority("SCOPE_service.read")
                
                // Usuarios - requiere scope user.read  
                .requestMatchers(USER_PATHS).hasAuthority("SCOPE_user.read")
                
                // Administración - requiere scope admin
                .requestMatchers(ADMIN_PATHS).hasAuthority("SCOPE_admin")
                
                // ========================
                // 🛡️ SEGURIDAD POR DEFECTO
                // ========================
                .anyRequest().authenticated()  // All other endpoints need JWT
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("SCOPE_");
        grantedAuthoritiesConverter.setAuthoritiesClaimName("scope");
        
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        
        return jwtAuthenticationConverter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173", 
            "https://localhost:5173",
            "http://localhost:3000",
            "https://localhost:3000"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}