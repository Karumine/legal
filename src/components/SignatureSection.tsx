import type { ContractData } from '../types/contract';

interface Props {
  data: ContractData;
}

export default function SignatureSection({ data }: Props) {
  return (
    <div className="mt-4 text-justify-reset">
      <div className="grid grid-cols-2 border border-black min-h-[600px] font-bold text-[13px]">
        {/* Left Column - Company (Fee Receiver) */}
        <div className="border-r border-black p-4 flex flex-col h-full">
          <div className="flex-1 space-y-16">
            <div className="font-bold text-[13px] text-left">
              <div>ผู้รับค่าธรรมเนียม:</div>
              <div>
                <span className="bg-yellow-100 print:bg-transparent leading-relaxed rounded px-1">บริษัท อาไจล์ แอสเซ็ทส์ จำกัด</span>
              </div>
            </div>

            <div className="pt-8 space-y-12">
              {(data.companyDirectors || '').split(/\s*(?:และ|,)\s*/).map((dir: string, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="border-b border-black w-full h-8"></div>
                  <div className="text-center w-full">
                    ( <span className="bg-yellow-100 print:bg-transparent leading-relaxed rounded px-1">{dir.trim() || '\u00A0'}</span> )
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 space-y-8">
            <div className="relative flex justify-center w-full">
              <div className="absolute left-0">ตำแหน่ง:</div>
              <div className="text-center">
                <div>กรรมการผู้มีอำนาจลงนาม</div>
                <div className="mt-2">
                  <span className="bg-yellow-100 print:bg-transparent leading-relaxed rounded px-1">บริษัท อาไจล์ แอสเซ็ทส์ จำกัด</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>พยาน:</div>
              <div className="border-b border-black w-full h-8"></div>
              <div className="flex justify-between px-4">
                <span>(</span>
                <span className="flex-1 mx-4"></span>
                <span>)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer (Fee Payer) */}
        <div className="p-4 flex flex-col h-full">
          <div className="flex-1 space-y-16">
            <div className="font-bold text-[13px] text-left">
              <div>ผู้ชำระค่าธรรมเนียม:</div>
              <div>
                <span className="bg-yellow-100 print:bg-transparent leading-relaxed rounded px-1">{data.customerCompany || '\u00A0'}</span>
              </div>
            </div>

            <div className="pt-8 space-y-12">
              {(data.customerDirector || '').split(/\s*(?:และ|,)\s*/).map((dir: string, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="border-b border-black w-full h-8"></div>
                  <div className="text-center w-full">
                    ( <span className="bg-yellow-100 print:bg-transparent leading-relaxed rounded px-1">{dir.trim() || '\u00A0'}</span> )
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 space-y-8">
            <div className="relative flex justify-center w-full">
              <div className="absolute left-0">ตำแหน่ง:</div>
              <div className="text-center">
                <div>{data.entityType === 'partnership' ? 'หุ้นส่วนผู้จัดการ' : 'กรรมการผู้มีอำนาจลงนาม'}</div>
                <div className="mt-2">
                  <span className="bg-yellow-100 print:bg-transparent leading-relaxed rounded px-1">{data.customerCompany || '\u00A0'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>พยาน:</div>
              <div className="border-b border-black w-full h-8"></div>
              <div className="flex justify-between px-4">
                <span>(</span>
                <span className="flex-1 mx-4"></span>
                <span>)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
