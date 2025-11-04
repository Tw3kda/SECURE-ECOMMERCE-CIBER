package com.patrones.api.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;



@Configuration
public class SecurityConfig {

    // =============================================
    // 🔓 ENDPOINTS PÚBLICOS
    // =============================================
    private static final String[] PUBLIC_PATHS = {
        "/auth/**", "/api/auth/**",
        "/test", "/api/test", "/health", "/actuator/health",
        "/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**",
        "/error", "/favicon.ico", "/public/**"
    };

    // =============================================
    // 🔐 ENDPOINTS PRIVADOS
    // =============================================
    private static final String[] PRODUCT_READ_PATHS = {
        "/api/products", "/api/products/**"
    };
    private static final String[] PRODUCT_WRITE_PATHS = {
        "/api/products/*/comments"
    };
    private static final String[] PRODUCT_ADMIN_PATHS = {
        "/api/products" // POST → crear productos
    };

    // =============================================
    // 🔓 PUBLIC FILTER CHAIN
    // =============================================
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

    // =============================================
    // 🔐 PROTECTED FILTER CHAIN (JWT)
    // =============================================
    // 🔐 PROTECTED FILTER CHAIN (JWT)
@Bean
@Order(2)
public SecurityFilterChain protectedFilterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeHttpRequests(auth -> auth
            // 🔹 Productos: lectura y comentarios → usuarios autenticados
            .requestMatchers(PRODUCT_READ_PATHS).authenticated()
            .requestMatchers(PRODUCT_WRITE_PATHS).authenticated()

            // 🔹 Creación de productos → solo admin
            .requestMatchers(PRODUCT_ADMIN_PATHS).hasRole("admin")

            // 🔹 Cualquier otro → autenticado
            .anyRequest().authenticated()
        )
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
        )
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    return http.build();
}


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
    // =============================================
    // 🌍 CORS CONFIG
    // =============================================
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
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    // =============================================
    // 🔑 JWT DECODER (dentro de Docker)
    // =============================================
    @Bean
    public JwtDecoder jwtDecoder() {
        // URL interna del servicio Keycloak (visible desde el contenedor)
        String jwkSetUri = "http://keycloak:8080/realms/Ecommerce/protocol/openid-connect/certs";

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        OAuth2TokenValidator<Jwt> withDefaults = JwtValidators.createDefault();
        OAuth2TokenValidator<Jwt> withIssuer = new MultiIssuerValidator();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(Arrays.asList(withDefaults, withIssuer)));

        return decoder;
    }

    // =============================================
    // ✅ ISSUER VALIDATOR
    // =============================================
    private static class MultiIssuerValidator implements OAuth2TokenValidator<Jwt> {
        private final List<String> validIssuers = Arrays.asList(
            "http://keycloak:8080/realms/Ecommerce", // Docker internal
            "https://localhost:9443/realms/Ecommerce", // Frontend external
            "http://localhost:8080/realms/Ecommerce"   // Local dev
        );

        @Override
        public OAuth2TokenValidatorResult validate(Jwt jwt) {
            String issuer = jwt.getIssuer().toString();
            if (validIssuers.contains(issuer)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token",
                "Issuer inválido: " + issuer + " (esperado: " + validIssuers + ")", null));
        }
    }
}
