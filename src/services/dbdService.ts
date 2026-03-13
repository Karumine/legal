const DBD_API_URL = '/dbd-api/th/api/3/action/datastore_search';
const RESOURCE_ID = 'f008dbbf-ddfa-4e3a-bac4-358a1a2b9853';

export interface DBDCompanyResult {
  companyName: string;
  address: string;
  taxId: string;
}

export async function searchCompanyByTaxId(taxId: string): Promise<DBDCompanyResult | null> {
  try {
    // Try exact filter by เลขทะเบียน first
    const filterUrl = `${DBD_API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(taxId)}&limit=10`;
    
    const response = await fetch(filterUrl);
    const data = await response.json();

    if (data.success && data.result.records.length > 0) {
      // Find the best match by checking if the tax ID is in the record
      const record = data.result.records.find(
        (r: Record<string, string>) => r['เลขทะเบียน'] === taxId
      ) || data.result.records[0];

      const addressParts = [
        record['ที่ตั้งสำนักงานใหญ่'],
        record['ตำบล'] ? `ตำบล${record['ตำบล']}` : '',
        record['อำเภอ'] ? `อำเภอ${record['อำเภอ']}` : '',
        record['จังหวัด'] ? `จังหวัด${record['จังหวัด']}` : '',
      ].filter(Boolean).join(' ');

      return {
        companyName: record['ชื่อนิติบุคคล'] || '',
        address: addressParts,
        taxId: record['เลขทะเบียน'] || taxId,
      };
    }

    return null;
  } catch (error) {
    console.error('DBD API Error:', error);
    return null;
  }
}
