/**
 * Formats a string as a Thai ID (National ID or Tax ID): X-XXXX-XXXXX-XX-X
 * @param id The raw ID string
 * @returns Formatted string with dashes
 */
export const formatThaiId = (id: string): string => {
  if (!id) return '';
  const digits = id.replace(/\D/g, ''); // Remove non-digits
  
  let formatted = '';
  if (digits.length > 0) {
    formatted += digits.substring(0, 1);
    if (digits.length > 1) {
      formatted += '-' + digits.substring(1, 5);
      if (digits.length > 5) {
        formatted += '-' + digits.substring(5, 10);
        if (digits.length > 10) {
          formatted += '-' + digits.substring(10, 12);
          if (digits.length > 12) {
            formatted += '-' + digits.substring(12, 13);
          }
        }
      }
    }
  }
  return formatted;
};

/**
 * Formats a string as a Thai Phone Number: 0XX-XXX-XXXX or 02-XXX-XXXX
 * @param phone The raw phone string
 * @returns Formatted string with dashes
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '').substring(0, 10);
  
  let formatted = '';
  if (digits.length > 0) {
    if (digits.startsWith('02')) {
      // Fixed line (Bangkok): 02-XXX-XXXX
      formatted = digits.substring(0, 2);
      if (digits.length > 2) {
        formatted += '-' + digits.substring(2, 5);
        if (digits.length > 5) {
          formatted += '-' + digits.substring(5, 9);
        }
      }
    } else {
      // Mobile or Provincial: 0XX-XXX-XXXX or 0XX-XXX-XXX
      // We use 3-3-4 pattern for 10 digits, and 3-3-3 for 9 digits
      formatted = digits.substring(0, 3);
      if (digits.length > 3) {
        formatted += '-' + digits.substring(3, 6);
        if (digits.length > 6) {
          formatted += '-' + digits.substring(6, 10);
        }
      }
    }
  }
  return formatted;
};

/**
 * Formats a string as currency with commas while allowing decimals while typing.
 * @param value The value to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: string): string => {
  const cleanValue = value.replace(/,/g, '');
  if (cleanValue === '') return '';
  if (cleanValue === '.') return '.';
  
  const parts = cleanValue.split('.');
  if (parts.length > 2) return value; // Invalid number with multiple dots

  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : null;

  let formattedInteger = integerPart;
  if (integerPart !== '' && !isNaN(Number(integerPart))) {
    formattedInteger = Number(integerPart).toLocaleString('en-US', {
      maximumFractionDigits: 0
    });
  }

  if (decimalPart !== null) {
    return `${formattedInteger}.${decimalPart.substring(0, 2)}`;
  }
  return formattedInteger;
};

/**
 * Returns the correct terminology for authorized signatories based on entity type.
 * @param company The company info
 * @returns "กรรมการผู้มีอำนาจกระทำการแทนบริษัท" or "หุ้นส่วนผู้จัดการผู้มีอำนาจกระทำการ"
 */
export const getAuthorizedSignatoryText = (company?: { entityType?: 'company' | 'partnership' }): string => {
  if (!company) return 'กรรมการผู้มีอำนาจกระทำการแทนบริษัท';
  return company.entityType === 'partnership' 
    ? 'หุ้นส่วนผู้จัดการผู้มีอำนาจกระทำการ' 
    : 'กรรมการผู้มีอำนาจกระทำการแทนบริษัท';
};
