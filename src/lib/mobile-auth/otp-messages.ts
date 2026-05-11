/** Bengali copy for mobile OTP API responses (customer app). */

export const OTP_MSG = {
  serverMisconfigured:
    "মোবাইল প্রবেশের জন্য সার্ভারে JWT সিক্রেট সেট করা নেই। সাইট প্রশাসককে জানান।",
  validationPhone:
    "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।",
  requestFailed:
    "যাচাইকরণ কোড পাঠানো যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  smsUnavailable:
    "এসএমএস পাঠানো যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।",
  smsNotConfigured:
    "এসএমএস গেটওয়ে কনফিগার করা নেই। সাইট প্রশাসককে জানান।",
  tokenIssueFailed:
    "অ্যাক্সেস টোকেন তৈরি করা যায়নি। সার্ভার কনফিগারেশন পরীক্ষা করুন।",
  wrongCode: "OTP কোডটি সঠিক নয়। আবার চেষ্টা করুন।",
  expired: "কোডের মেয়াদ শেষ হয়ে গেছে। নতুন কোড নিন।",
  tooManyAttempts:
    "অনেকবার ভুল OTP দেওয়া হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
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
