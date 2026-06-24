export type UserRole = 'student' | 'admin';

export type AuthUser = {
  role: UserRole;
  name: string;
  mobile: string;
};

/** Demo OTP for dummy login. */
export const DEMO_OTP = '123456';

/** Admin mobiles allowed to open the admin portal. */
export const ADMIN_MOBILES = ['7619548975', '9999888877'];

export function isAdminMobile(mobile: string) {
  const digits = mobile.replace(/\D/g, '').slice(-10);
  return ADMIN_MOBILES.includes(digits);
}

export async function sendDummyOtp(mobile: string): Promise<{ success: boolean; message?: string; devOtp?: string }> {
  await delay(600);
  if (mobile.length !== 10) {
    return { success: false, message: 'Enter a valid 10-digit mobile number.' };
  }
  return {
    success: true,
    message: 'OTP sent! (Demo mode)',
    devOtp: DEMO_OTP
  };
}

export async function verifyStudentOtp(
  mobile: string,
  otp: string
): Promise<{ success: boolean; message?: string; user?: AuthUser }> {
  await delay(500);
  if (otp !== DEMO_OTP) {
    return { success: false, message: 'Incorrect OTP. Use 123456 for demo login.' };
  }
  return {
    success: true,
    user: {
      role: 'student',
      name: 'Student',
      mobile
    }
  };
}

export async function verifyAdminOtp(
  mobile: string,
  otp: string
): Promise<{ success: boolean; message?: string; user?: AuthUser }> {
  await delay(500);
  if (!isAdminMobile(mobile)) {
    return { success: false, message: 'This mobile is not registered as admin.' };
  }
  if (otp !== DEMO_OTP) {
    return { success: false, message: 'Incorrect OTP. Use 123456 for demo login.' };
  }
  return {
    success: true,
    user: {
      role: 'admin',
      name: 'Institute Admin',
      mobile
    }
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
