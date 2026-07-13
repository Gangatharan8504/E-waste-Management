package com.ewaste.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class OtpService {

    private static final SecureRandom random = new SecureRandom();

    /** Generate a 6-digit numeric OTP */
    public String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /** Validate OTP string match */
    public boolean isValid(String stored, String provided) {
        if (stored == null || provided == null) return false;
        return stored.equals(provided.trim());
    }
}
