export interface DBDCompanyResult {
  companyName: string;
  address: string;
  taxId: string;
  type?: string;
  status?: string;
  registrationDate?: string;
  capital?: number;
  directors?: string[];
  signingCondition?: string;
  businessCategory?: string;
}

/**
 * Searches for company information from DBD using a Vercel Serverless Function.
 */
export async function searchCompanyByTaxId(taxId: string): Promise<DBDCompanyResult | null> {
  try {
    const cleanTaxId = taxId.replace(/-/g, '');
    const response = await fetch(`/api/getDBDInfo?taxId=${cleanTaxId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch from DBD Vercel API');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DBD Scraper Error:', error);
    return null;
  }
}
