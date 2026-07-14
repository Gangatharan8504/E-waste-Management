/**
 * Mock Email Service (All actual email sending has been removed to bypass verification locks)
 */

const sendOtp = async (email, otp) => {
  console.log(`[MOCK EMAIL] OTP verification code [${otp}] generated for ${email}`);
};

const sendWelcomeEmail = async (email, firstName) => {
  console.log(`[MOCK EMAIL] Welcome email mock triggered for ${firstName} (${email})`);
};

const sendPasswordResetOtp = async (email, otp) => {
  console.log(`[MOCK EMAIL] Password reset OTP [${otp}] generated for ${email}`);
};

const sendPickupScheduled = async (email, deviceType, date, time, adminNotes) => {
  console.log(`[MOCK EMAIL] Pickup scheduled notice mock triggered for ${email}`);
};

const sendBetterImagesRequired = async (email, deviceType) => {
  console.log(`[MOCK EMAIL] Better images required notice mock triggered for ${email}`);
};

const sendTrackingStatusUpdate = async (email, deviceType, requestId, status) => {
  console.log(`[MOCK EMAIL] Tracking update for request #${requestId} to status [${status}] sent to ${email}`);
};

module.exports = {
  sendOtp,
  sendWelcomeEmail,
  sendPasswordResetOtp,
  sendPickupScheduled,
  sendBetterImagesRequired,
  sendTrackingStatusUpdate
};
