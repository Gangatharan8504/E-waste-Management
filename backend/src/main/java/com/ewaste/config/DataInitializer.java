package com.ewaste.config;

import com.ewaste.model.User;
import com.ewaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@ewaste.com")) {
            userRepository.save(User.builder()
                    .firstName("Admin").lastName("User")
                    .email("admin@ewaste.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("+91 9000000001")
                    .address("EcoCollect HQ, Chennai, Tamil Nadu")
                    .pincode("600001")
                    .role(User.Role.ADMIN)
                    .enabled(true).emailVerified(true)
                    .build());
            log.info("Admin created: admin@ewaste.com / admin123");
        }

        if (!userRepository.existsByEmail("user@ewaste.com")) {
            userRepository.save(User.builder()
                    .firstName("Demo").lastName("User")
                    .email("user@ewaste.com")
                    .password(passwordEncoder.encode("user123"))
                    .phone("+91 9000000002")
                    .address("42 Anna Nagar, Coimbatore, Tamil Nadu")
                    .pincode("641001")
                    .role(User.Role.USER)
                    .enabled(true).emailVerified(true)
                    .build());
            log.info("Demo user created: user@ewaste.com / user123");
        }
    }
}
