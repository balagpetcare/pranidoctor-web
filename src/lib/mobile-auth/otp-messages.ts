/** Bengali copy for mobile OTP API responses (customer app). */

export const OTP_MSG = {
  validationPhone:
    "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।",
  requestFailed:
    "যাচাইকরণ কোড পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  smsUnavailable:
    "এসএমএস পাঠানো যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  wrongCode: "ভুল যাচাইকরণ কোড। আবার চেষ্টা করুন।",
  expired: "কোডের মেয়াদ শেষ হয়েছে। নতুন কোড পাঠান।",
  tooManyAttempts:
    "অনেকবার ভুল কোড দেওয়া হয়েছে। নতুন কোড পাঠান।",
  loginNotAllowed:
    "এই নম্বর দিয়ে প্রবেশ করা যাচ্ছে না।",
  signupFailed:
    "প্রবেশ সম্পূর্ণ করা যায়নি। আবার চেষ্টা করুন।",
} as const;

export function otpResendCooldownMessage(secondsRemaining: number): string {
  if (secondsRemaining <= 0) {
    return "আবার যাচাইকরণ কোড পাঠাতে পারেন।";
  }
  return `অনুরোধ খুব দ্রুত। ${secondsRemaining} সেকেন্ড পর আবার চেষ্টা করুন।`;
}

export function otpHourlyRateLimitMessage(): string {
  return "এই নম্বরে অনেকবার কোড পাঠানো হয়েছে। এক ঘণ্টা পর আবার চেষ্টা করুন।";
}
