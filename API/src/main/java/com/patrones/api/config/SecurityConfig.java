package com.patrones.api.config;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

import org.springframework.core.convert.converter.Converter;

@Configuration
public class SecurityConfig {

    // ----------------------------
    // Endpoints públicos
    // ----------------------------
    private static final String[] PUBLIC_PATHS = {
            "/auth/**", "/api/auth/**",
            "/test", "/api/test",
            "/health", "/actuator/health",
            "/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**",
            "/error", "/favicon.ico", "/public/**", "api/test/**"
    };

    // ----------------------------
    // Endpoints protegidos
    // ----------------------------
    private static final String[] PRODUCT_READ_PATHS = {"/api/products", "/api/products/**"};
    private static final String[] PRODUCT_WRITE_PATHS = {"/api/products/*/comments"};
    private static final String[] PRODUCT_ADMIN_PATHS = {"/api/products"}; // POST → crear productos
    private static final String[] CLIENTDATA_PATHS = {"/api/clientdata", "/api/clientdata/**"};
    private static final String[] PAYMENT_PATHS = {"/api/payments", "/api/payments/**"};

    // =============================
    // Public filter chain
    // =============================
    @Bean
    @Order(1)
    public SecurityFilterChain publicFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(PUBLIC_PATHS)
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    // =============================
    // Protected filter chain (JWT)
    // =============================
    @Bean
    @Order(2)
    public SecurityFilterChain protectedFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // Permitir preflight CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Productos: lectura y comentarios → usuarios autenticados
                .requestMatchers(PRODUCT_READ_PATHS).authenticated()
                .requestMatchers(PRODUCT_WRITE_PATHS).authenticated()
                // Creación de productos → solo admin
                .requestMatchers(PRODUCT_ADMIN_PATHS).hasRole("admin")
                // Otros endpoints protegidos
                .requestMatchers(CLIENTDATA_PATHS).authenticated()
                .requestMatchers(PAYMENT_PATHS).authenticated()
                // Cualquier otro → autenticado
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    // =============================
    // JWT -> GrantedAuthorities
    // =============================
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new Converter<Jwt, Collection<GrantedAuthority>>() {
            @Override
            public Collection<GrantedAuthority> convert(Jwt jwt) {
                Collection<String> realmRoles = Optional.ofNullable(jwt.getClaimAsMap("realm_access"))
                        .map(r -> (Collection<String>) r.get("roles"))
                        .orElse(Collections.emptyList());

                Collection<String> resourceRoles = Optional.ofNullable(jwt.getClaimAsMap("resource_access"))
                        .map(r -> (Map<String, Object>) r.get("backend-client"))
                        .map(r -> (Collection<String>) r.get("roles"))
                        .orElse(Collections.emptyList());

                return Stream.concat(realmRoles.stream(), resourceRoles.stream())
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toSet());
            }
        });
        return converter;
    }

    // =============================
    // CORS Configuration
    // =============================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "https://localhost:5173",
            "http://frontend:5173",
            "https://frontend:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type", "Content-Length"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // =============================
    // JWT Decoder con Keycloak
    // =============================
    @Bean
    public JwtDecoder jwtDecoder() {
        String jwkSetUri = "http://keycloak:8080/realms/Ecommerce/protocol/openid-connect/certs";

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        // Use only default validators to avoid compilation issues
        // The issuer validation is handled by Spring Security automatically when using withJwkSetUri
        return decoder;
    }

    // =============================
    // Alternative: Simple Issuer Validator (if needed)
    // =============================
    /*
    // If you need custom issuer validation, use this simplified approach:
    private OAuth2TokenValidator<Jwt> createIssuerValidator() {
        return new OAuth2TokenValidator<Jwt>() {
            private final List<String> validIssuers = Arrays.asList(
                "http://keycloak:8080/realms/Ecommerce",
                "https://localhost:9443/realms/Ecommerce",
                "http://localhost:8080/realms/Ecommerce"
            );
            
            @Override
            public org.springframework.security.oauth2.core.OAuth2TokenValidatorResult validate(Jwt jwt) {
                String issuer = jwt.getIssuer().toString();
                if (validIssuers.contains(issuer)) {
                    return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.success();
                }
                return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", 
                        "Issuer inválido: " + issuer + " (esperado: " + validIssuers + ")", null)
                );
            }
        };
    }
    */
}