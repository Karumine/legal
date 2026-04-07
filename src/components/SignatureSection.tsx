import type { ContractData } from '../types/contract';
import { getAuthorizedSignatoryText } from '../utils/formatters';

interface Props {
  data: ContractData;
}

export default function SignatureSection({ data }: Props) {
  return (
    <div className="mt-4 text-justify-reset">
      <div className="grid grid-cols-2 divide-x divide-black border border-black text-[13px]">
        {/* Left Column - Company (Fee Receiver) */}
        <div className="p-8 flex flex-col min-h-[550px]">
          <div className="flex-1 space-y-12">
            <div className="space-y-1 mb-8">
              <div className="font-bold whitespace-nowrap">ผู้รับค่าธรรมเนียม:</div>
              <div className="font-bold">
                <span className="bg-yellow-200 print:bg-transparent leading-relaxed rounded px-1">บริษัท อาไจล์ แอสเซ็ทส์ จำกัด</span>
              </div>
            </div>

            <div className="space-y-12">
              {(data.companyDirectors || '').split(/\s*(?:และ|,)\s*/).map((dir: string, idx: number) => (
                <div key={idx} className="flex flex-col items-start w-full">
                  <div className="border-b border-black w-full mb-1 h-8"></div>
                  <div className="w-full text-left">
                    ชื่อ: <span className="bg-yellow-200 print:bg-transparent leading-relaxed rounded px-1">{dir.trim() || '\u00A0'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-1 text-left px-0">
              <div className="font-bold whitespace-nowrap">ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
              <div className="font-bold">
                 <span className="bg-yellow-200 print:bg-transparent leading-relaxed rounded px-1">บริษัท อาไจล์ แอสเซ็ทส์ จำกัด</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="font-bold mb-8 text-left">พยาน:</div>
            <div className="flex flex-col items-center max-w-[250px]">
               <div className="border-b border-black w-full mb-1 h-8"></div>
               <div className="text-center w-full">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer (Fee Payer) */}
        <div className="p-8 flex flex-col min-h-[550px]">
          <div className="flex-1 space-y-12">
            <div className="space-y-1 mb-8">
              <div className="font-bold whitespace-nowrap">ผู้ชำระค่าธรรมเนียม:</div>
              <div className="font-bold">
                <span className="bg-yellow-200 print:bg-transparent leading-relaxed rounded px-1">{data.customerCompany || '\u00A0'}</span>
              </div>
            </div>

            <div className="space-y-12">
              {(data.customerDirector || '').split(/\s*(?:และ|,)\s*/).map((dir: string, idx: number) => (
                <div key={idx} className="flex flex-col items-start w-full">
                  <div className="border-b border-black w-full mb-1 h-8"></div>
                  <div className="w-full text-left">
                    ชื่อ: <span className="bg-yellow-200 print:bg-transparent leading-relaxed rounded px-1">{dir.trim() || '\u00A0'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-1 text-left px-0">
              <div className="font-bold whitespace-nowrap">ตำแหน่ง: {getAuthorizedSignatoryText({ entityType: data.entityType })}</div>
              <div className="font-bold">
                 <span className="bg-yellow-200 print:bg-transparent leading-relaxed rounded px-1">{data.customerCompany || '\u00A0'}</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="font-bold mb-8 text-left">พยาน:</div>
            <div className="flex flex-col items-center max-w-[250px]">
               <div className="border-b border-black w-full mb-1 h-8"></div>
               <div className="text-center w-full">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
