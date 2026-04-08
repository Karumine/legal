/**
 * Ensures the address string includes the postal code with the "รหัสไปรษณีย์" label.
 * If the address string already ends with a 5-digit code, it replaces it with the labeled version.
 */
export const formatAddressWithPostalCode = (address: string, postalCode?: string): string => {
  if (!address) return '';
  
  const trimmedAddress = address.trim();
  
  // Extract postal code from string if not provided
  // Match a 5-digit number at the end of the string
  const endPostalMatch = trimmedAddress.match(/\b(\d{5})$/);
  const extracted = endPostalMatch ? endPostalMatch[1] : null;
  
  const finalCode = postalCode || extracted;
  
  if (!finalCode) return trimmedAddress;
  
  // Clean address: remove the existing postal code if it's at the very end
  let cleanAddress = trimmedAddress;
  if (extracted && cleanAddress.endsWith(extracted)) {
    // Also remove any preceding whitespace
    cleanAddress = cleanAddress.substring(0, cleanAddress.length - extracted.length).trim();
  }
  
  // Check if "รหัสไปรษณีย์" already exists to avoid duplication
  if (cleanAddress.includes('รหัสไปรษณีย์')) {
    // If it already has the label but maybe a different code, we might want to update it
    // But for now, let's assume if the label is there, it's correct enough or we just append
    // To be safe, let's just ensure we return it nicely
    if (cleanAddress.endsWith('รหัสไปรษณีย์')) {
        return `${cleanAddress} ${finalCode}`;
    }
    // If it has "รหัสไปรษณีย์ 12345" already, we just return it
    if (new RegExp(`รหัสไปรษณีย์\\s*${finalCode}$`).test(cleanAddress)) {
        return cleanAddress;
    }
  }
  
  return `${cleanAddress} รหัสไปรษณีย์ ${finalCode}`;
};
