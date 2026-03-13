import type { ContractData } from '../types/contract';

interface Props {
  data: ContractData;
}

export default function SignatureSection({ data }: Props) {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 divide-x divide-black border border-black text-[13px]">
        {/* Left Column - Company */}
        <div className="p-6 flex flex-col min-h-[380px]">
          <div>
            <div className="font-bold mb-4">ผู้รับค่าธรรมเนียม:</div>
            <div className="font-bold">บริษัท อาไจล์ แอสเซ็ทส์ จำกัด</div>
          </div>
          
          <div className="mt-8">
             <div className="grid grid-cols-[60px_1fr] gap-2 items-start">
                <div className="font-bold mt-[24px]">ชื่อ:</div>
                <div className="flex flex-col gap-8">
                   <div className="flex flex-col items-center">
                     <div className="border-b border-black w-[80%] h-[36px] mb-2"></div>
                     <div className="text-center">( นายพรรษา เริงพิทยา )</div>
                   </div>
                   <div className="flex flex-col items-center relative -top-2">
                     <div className="border-b border-black w-[80%] h-[36px] mb-2"></div>
                     <div className="text-center">( นายกอบพงษ์ ตรีสุขี )</div>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-[60px_1fr] gap-2 mt-4">
                <div className="font-bold">ตำแหน่ง:</div>
                <div className="flex flex-col text-center">
                   <div>กรรมการผู้มีอำนาจลงนาม</div>
                   <div className="mt-1">บริษัท อาไจล์ แอสเซ็ทส์ จำกัด</div>
                </div>
             </div>
          </div>

          <div className="mt-auto pt-8">
             <div className="font-bold mb-8">พยาน:</div>
             <div className="flex flex-col items-center text-black">
                <div className="border-b border-black w-[80%] mb-2"></div>
                <div className="text-center">(<span className="inline-block w-[200px]"></span>)</div>
             </div>
          </div>
        </div>

        {/* Right Column - Customer */}
        <div className="p-6 flex flex-col min-h-[420px]">
          <div>
            <div className="font-bold mb-4">ผู้ชำระค่าธรรมเนียม:</div>
            <div className="font-bold">
              <span className="bg-yellow-200 print:bg-transparent leading-relaxed px-1 rounded">{data.customerCompany || '\u00A0'}</span>
            </div>
          </div>

          <div className="mt-8">
             <div className="grid grid-cols-[60px_1fr] gap-2 items-start">
                <div className="font-bold mt-[24px]">ชื่อ:</div>
                <div className="flex flex-col gap-8">
                   <div className="flex flex-col items-center">
                     <div className="border-b border-black w-[80%] h-[36px] mb-2"></div>
                     <div className="text-center">
                       ( <span className="bg-yellow-200 print:bg-transparent leading-relaxed px-1 rounded">{data.customerDirector || '\u00A0'}</span> )
                     </div>
                   </div>
                   <div className="flex flex-col items-center relative -top-2 invisible">
                     <div className="border-b border-black w-[80%] h-[36px] mb-2"></div>
                     <div className="text-center">( spacer )</div>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-[60px_1fr] gap-2 mt-4">
                <div className="font-bold">ตำแหน่ง:</div>
                <div className="flex flex-col text-center">
                   <div>กรรมการผู้มีอำนาจลงนาม</div>
                   <div className="mt-1 min-h-[28px]">
                     <span className="bg-yellow-200 print:bg-transparent leading-relaxed px-1 rounded">{data.customerCompany || '\u00A0'}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-auto pt-8">
             <div className="font-bold mb-8">พยาน:</div>
             <div className="flex flex-col text-black">
                <div className="border-b border-black w-3/4 mx-auto mb-2"></div>
                <div className="flex items-end text-black justify-center w-3/4 mx-auto">
                   <span className="leading-none">(</span>
                   <div className="flex-1 mx-4 text-center"></div>
                   <span className="leading-none">)</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
