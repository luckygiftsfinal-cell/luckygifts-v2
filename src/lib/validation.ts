export const isValidPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');

  // Must be between 7 and 15 digits
  if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;

  // Reject all same digits (e.g. 0000000, 1111111)
  if (/^(\d)\1+$/.test(digitsOnly)) return false;

  // Reject obviously fake numbers (0000, 1234567, 9999999, etc.)
  const sequential = '0123456789012345678901234567890';
  const reverseSeq = '9876543210987654321098765432109';
  if (sequential.includes(digitsOnly) || reverseSeq.includes(digitsOnly)) return false;

  // Must start with a valid country or local prefix (not 000, 111, etc.)
  if (/^0{3,}/.test(digitsOnly)) return false;

  // Basic format check: optional +, digits, spaces, dashes, parentheses
  const phoneRegex = /^(\+?\d{1,4}[\s-]?)?(\(?\d{1,4}\)?[\s-]?)?[\d\s-]{5,15}$/;
  return phoneRegex.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
