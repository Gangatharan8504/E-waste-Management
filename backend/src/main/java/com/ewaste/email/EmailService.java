package com.ewaste.email;

import com.ewaste.model.EwasteRequest;
import com.ewaste.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    // ─── Registration OTP ──────────────────────────────────────────────────
    @Async
    public void sendRegistrationOtp(String email, String otp) {
        try {
            String html = buildOtpEmail(
                "Verify Your Email", email, otp,
                "Use this OTP to complete your EcoCollect registration.",
                "This OTP expires in <strong>5 minutes</strong>."
            );
            sendHtmlEmail(email, "EcoCollect – Email Verification OTP", html);
            log.info("Registration OTP sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send registration OTP to {}: {}", email, e.getMessage());
        }
    }

    // ─── Forgot Password OTP ───────────────────────────────────────────────
    @Async
    public void sendForgotPasswordOtp(String email, String otp) {
        try {
            String html = buildOtpEmail(
                "Reset Your Password", email, otp,
                "Use this OTP to reset your EcoCollect password.",
                "This OTP expires in <strong>5 minutes</strong>. If you did not request this, ignore this email."
            );
            sendHtmlEmail(email, "EcoCollect – Password Reset OTP", html);
            log.info("Password reset OTP sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP: {}", e.getMessage());
        }
    }

    // ─── Request Submit OTP ────────────────────────────────────────────────
    @Async
    public void sendRequestSubmitOtp(String email, String name, String otp, String deviceType) {
        try {
            String html = buildOtpEmail(
                "Verify Your e-Waste Request", email, otp,
                "You're submitting a pickup request for <strong>" + deviceType + "</strong>. Use this OTP to verify.",
                "This OTP expires in <strong>5 minutes</strong>. The request will not be processed without verification."
            );
            sendHtmlEmail(email, "EcoCollect – Verify Your e-Waste Request", html);
            log.info("Request submit OTP sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send request OTP: {}", e.getMessage());
        }
    }

    // ─── Welcome Email ─────────────────────────────────────────────────────
    public void sendWelcomeEmail(User user) {
        try {
            String html = buildWelcomeEmail(user.getFirstName());
            sendHtmlEmail(user.getEmail(), "Welcome to EcoCollect! 🌿", html);
        } catch (Exception e) {
            log.error("Failed to send welcome email: {}", e.getMessage());
        }
    }

    // ─── Request Confirmation ──────────────────────────────────────────────
    public void sendRequestConfirmation(EwasteRequest req) {
        try {
            sendHtmlEmail(
                req.getUser().getEmail(),
                "Request Confirmed – #" + req.getId() + " | EcoCollect",
                buildRequestConfirmationEmail(req)
            );
        } catch (Exception e) {
            log.error("Failed to send confirmation: {}", e.getMessage());
        }
    }

    // ─── Pickup Scheduled ─────────────────────────────────────────────────
    public void sendPickupScheduledEmail(EwasteRequest req) {
        try {
            sendHtmlEmail(
                req.getUser().getEmail(),
                "Pickup Scheduled – " + formatDate(req) + " | EcoCollect",
                buildScheduleEmail(req)
            );
        } catch (Exception e) {
            log.error("Failed to send schedule email: {}", e.getMessage());
        }
    }

    // ─── Rejection ────────────────────────────────────────────────────────
    public void sendRejectionEmail(EwasteRequest req) {
        try {
            sendHtmlEmail(req.getUser().getEmail(),
                "Request Update – #" + req.getId() + " | EcoCollect",
                buildRejectionEmail(req));
        } catch (Exception e) {
            log.error("Failed to send rejection email: {}", e.getMessage());
        }
    }

    // ─── Completion ───────────────────────────────────────────────────────
    public void sendCompletionEmail(EwasteRequest req) {
        try {
            sendHtmlEmail(req.getUser().getEmail(),
                "Pickup Completed – Thank You! | EcoCollect",
                buildCompletionEmail(req));
        } catch (Exception e) {
            log.error("Failed to send completion email: {}", e.getMessage());
        }
    }

    // ─── Core send ────────────────────────────────────────────────────────
    private void sendHtmlEmail(String to, String subject, String html) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(message);
    }

    private String formatDate(EwasteRequest req) {
        if (req.getScheduledDate() == null) return "";
        return req.getScheduledDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
    }

    // ─── HTML Templates ───────────────────────────────────────────────────

    private String wrapper(String content) {
        return """
        <!DOCTYPE html><html><head><meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0}
          .wrap{max-width:560px;margin:32px auto;padding:0 16px}
          .header{background:linear-gradient(135deg,#0f172a 0%%,#1e3a2f 100%%);border:1px solid #22c55e33;border-radius:16px 16px 0 0;padding:28px 32px;display:flex;align-items:center;gap:12px}
          .logo{width:40px;height:40px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.4);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px}
          .logo-text{font-size:22px;font-weight:800;color:#f8fafc;letter-spacing:-0.02em}
          .body{background:#1e293b;border:1px solid #334155;border-top:none;padding:32px}
          .footer{background:#0f172a;border:1px solid #334155;border-top:none;border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;font-size:12px;color:#475569}
          h1{font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:10px}
          p{font-size:14px;color:#94a3b8;line-height:1.7;margin-bottom:14px}
          .otp-box{background:#0f172a;border:2px dashed #22c55e66;border-radius:14px;padding:28px;text-align:center;margin:24px 0}
          .otp-code{font-size:46px;font-weight:800;letter-spacing:12px;color:#22c55e;font-family:monospace}
          .otp-label{font-size:12px;color:#64748b;margin-top:8px;text-transform:uppercase;letter-spacing:.08em}
          .info-box{background:#0f172a;border:1px solid #334155;border-radius:10px;padding:18px;margin:18px 0}
          .info-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #1e293b;font-size:13px}
          .info-row:last-child{border-bottom:none}
          .il{color:#64748b}.iv{color:#e2e8f0;font-weight:600}
          .highlight{color:#22c55e;font-weight:600}
          .badge{display:inline-block;padding:3px 12px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
          .b-sched{background:rgba(96,165,250,.15);color:#60a5fa;border:1px solid rgba(96,165,250,.3)}
          .b-done{background:rgba(34,197,94,.15);color:#22c55e;border:1px solid rgba(34,197,94,.3)}
          .b-rej{background:rgba(248,113,113,.15);color:#f87171;border:1px solid rgba(248,113,113,.3)}
          .warn{background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.25);border-radius:8px;padding:10px 14px;color:#fbbf24;font-size:13px;margin-top:8px}
        </style></head><body><div class="wrap">
        <div class="header"><div class="logo">♻</div><span class="logo-text">EcoCollect</span></div>
        <div class="body">%s</div>
        <div class="footer">© 2025 EcoCollect · Smart e-Waste Management<br>This is an automated email — please do not reply.</div>
        </div></body></html>
        """.formatted(content);
    }

    private String buildOtpEmail(String title, String email, String otp, String context, String expiry) {
        return wrapper("""
            <h1>%s</h1>
            <p>%s</p>
            <div class="otp-box">
              <div class="otp-code">%s</div>
              <div class="otp-label">Your One-Time Password</div>
            </div>
            <p style="text-align:center;font-size:13px;">⏱ %s</p>
            <div class="warn">🔒 Never share this OTP with anyone. EcoCollect will never ask for your OTP.</div>
            """.formatted(title, context, otp, expiry));
    }

    private String buildWelcomeEmail(String firstName) {
        return wrapper("""
            <h1>Welcome to EcoCollect, %s! 🌿</h1>
            <p>Your account has been verified and created successfully. You're now part of a community making e-waste disposal responsible and easy.</p>
            <div class="info-box">
              <div class="info-row"><span class="il">Submit Requests</span><span class="iv">Log e-waste for pickup</span></div>
              <div class="info-row"><span class="il">Track Status</span><span class="iv">Real-time updates</span></div>
              <div class="info-row"><span class="il">Get Notified</span><span class="iv">Email at every step</span></div>
              <div class="info-row"><span class="il">Map Pickup</span><span class="iv">Pin your exact location</span></div>
            </div>
            <p>Start by submitting your first e-waste pickup request today. Together, let's build a greener planet. 🌍</p>
            """.formatted(firstName));
    }

    private String buildRequestConfirmationEmail(EwasteRequest req) {
        return wrapper("""
            <h1>Request Verified & Submitted! ✅</h1>
            <p>Hi <span class="highlight">%s</span>, your e-waste pickup request has been verified and submitted for review.</p>
            <div class="info-box">
              <div class="info-row"><span class="il">Request ID</span><span class="iv">#%d</span></div>
              <div class="info-row"><span class="il">Device</span><span class="iv">%s – %s %s</span></div>
              <div class="info-row"><span class="il">Condition</span><span class="iv">%s</span></div>
              <div class="info-row"><span class="il">Quantity</span><span class="iv">%d</span></div>
              <div class="info-row"><span class="il">Pickup Address</span><span class="iv">%s</span></div>
            </div>
            <p>Our admin team will review your request and schedule a pickup shortly.</p>
            """.formatted(
                req.getUser().getFirstName(), req.getId(),
                req.getDeviceType(), req.getBrand(), req.getModel(),
                req.getCondition(), req.getQuantity(), req.getPickupAddress()));
    }

    private String buildScheduleEmail(EwasteRequest req) {
        String notes = (req.getAdminNotes() != null && !req.getAdminNotes().isBlank())
            ? "<p><strong>Note from our team:</strong> " + req.getAdminNotes() + "</p>" : "";
        return wrapper("""
            <h1>Pickup Scheduled! 📅</h1>
            <p>Hi <span class="highlight">%s</span>, your e-waste pickup has been confirmed.</p>
            <div class="info-box">
              <div class="info-row"><span class="il">Request ID</span><span class="iv">#%d</span></div>
              <div class="info-row"><span class="il">Device</span><span class="iv">%s – %s %s</span></div>
              <div class="info-row"><span class="il">Pickup Date</span><span class="iv" style="color:#60a5fa">%s</span></div>
              <div class="info-row"><span class="il">Pickup Time</span><span class="iv" style="color:#60a5fa">%s</span></div>
              <div class="info-row"><span class="il">Address</span><span class="iv">%s</span></div>
              <div class="info-row"><span class="il">Status</span><span class="iv"><span class="badge b-sched">SCHEDULED</span></span></div>
            </div>
            %s
            <p>Please ensure your e-waste is accessible on the scheduled day. Thank you for recycling responsibly! 🌿</p>
            """.formatted(
                req.getUser().getFirstName(), req.getId(),
                req.getDeviceType(), req.getBrand(), req.getModel(),
                formatDate(req),
                req.getScheduledTime() != null ? req.getScheduledTime() : "TBD",
                req.getPickupAddress(), notes));
    }

    private String buildRejectionEmail(EwasteRequest req) {
        return wrapper("""
            <h1>Request Update</h1>
            <p>Hi <span class="highlight">%s</span>, your pickup request <strong>#%d</strong> could not be processed at this time.</p>
            <div class="info-box">
              <div class="info-row"><span class="il">Request ID</span><span class="iv">#%d</span></div>
              <div class="info-row"><span class="il">Device</span><span class="iv">%s – %s %s</span></div>
              <div class="info-row"><span class="il">Status</span><span class="iv"><span class="badge b-rej">REJECTED</span></span></div>
            </div>
            <p>Please feel free to submit a new request or contact our support team.</p>
            """.formatted(
                req.getUser().getFirstName(), req.getId(), req.getId(),
                req.getDeviceType(), req.getBrand(), req.getModel()));
    }

    private String buildCompletionEmail(EwasteRequest req) {
        return wrapper("""
            <h1>Pickup Completed! 🎉</h1>
            <p>Hi <span class="highlight">%s</span>, your e-waste pickup <strong>#%d</strong> is done!</p>
            <div class="info-box">
              <div class="info-row"><span class="il">Request ID</span><span class="iv">#%d</span></div>
              <div class="info-row"><span class="il">Device</span><span class="iv">%s – %s %s</span></div>
              <div class="info-row"><span class="il">Status</span><span class="iv"><span class="badge b-done">COMPLETED</span></span></div>
            </div>
            <p>Your e-waste has been collected and will be recycled by our certified partners. Thank you for contributing to a greener planet! 🌍</p>
            """.formatted(
                req.getUser().getFirstName(), req.getId(), req.getId(),
                req.getDeviceType(), req.getBrand(), req.getModel()));
    }
}
