export const isValidPhone = (phone: string): boolean => {
  // Regex to validate phone number:
  // - Optional leading '+'
  // - Allows digits, spaces, dashes, and parentheses
  // - Minimum 7 digits, maximum 15 digits (standard E.164)
  const phoneRegex = /^(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?[\d\s-]{7,15}$/;
  
  // Strip non-digit characters to check actual digit count
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
