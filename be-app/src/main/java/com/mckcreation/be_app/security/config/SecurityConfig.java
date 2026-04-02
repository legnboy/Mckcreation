package com.mckcreation.be_app.security.config;

import com.mckcreation.be_app.security.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/category/get-all").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/item/get-all").permitAll()
                        .requestMatchers("/api/post/get-all").permitAll()
                        .requestMatchers("/api/shipping/get-user-shipping").authenticated()
                        .requestMatchers("/api/user/update").authenticated()
                        .requestMatchers("/api/user/get-user-shipping").authenticated()
                        .requestMatchers("/api/order/get-orders").authenticated()
                        .requestMatchers("/api/placed-order/get-user-orders").authenticated()
                        .requestMatchers("/api/order/delete/{orderID}").authenticated()
                        .requestMatchers("/api/order/create").authenticated()
                        .requestMatchers("/api/post/create").hasRole("ADMIN")
                        .requestMatchers("/api/post/delete/{id}").hasRole("ADMIN")
                        .requestMatchers("/api/category/create").hasRole("ADMIN")
                        .requestMatchers("/api/category/update").hasRole("ADMIN")
                        .requestMatchers("/api/category/delete").hasRole("ADMIN")
                        .requestMatchers("/api/item/create").hasRole("ADMIN")
                        .requestMatchers("/api/item/update/{id}").hasRole("ADMIN")
                        .requestMatchers("/api/item/delete/{id}").hasRole("ADMIN")
                        .requestMatchers("/api/placed-order/get-all").hasRole("ADMIN")
                        .requestMatchers("/api/placed-orders").hasRole("ADMIN")
                        .requestMatchers("/api/placed-orders/sales-summary").hasRole("ADMIN")
                        .requestMatchers("/api/category/{id}").hasRole("ADMIN")
                        .requestMatchers("/api/category/delete/{id}").hasRole("ADMIN")
                        .requestMatchers("/api/user/get-all").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // CORS configuration source
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*"); // Allows any origin (for debugging)
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
