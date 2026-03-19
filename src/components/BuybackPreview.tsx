import PageHeader from './PageHeader';
import type { BuybackData, CompanyInfo } from '../types/app';

interface Props {
  data: BuybackData;
  agileInfo: CompanyInfo;
  customerInfo: CompanyInfo;
}

export default function BuybackPreview({ data, agileInfo, customerInfo }: Props) {
  const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-yellow-200 print:bg-transparent px-1 rounded inline break-words">
      {children || '\u00A0'}
    </span>
  );

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line">
      <div className="print-page relative">
        <PageHeader />

        <div className="text-center font-bold mb-6">
          <h2 className="text-xl">สัญญารับซื้อคืน</h2>
          <div className="text-sm mt-1">Buyback Agreement</div>
          <div className="mt-2">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          สัญญารับซื้อคืน ("สัญญา") ฉบับนี้ทำขึ้นเมื่อวันที่ <Highlight>{data.contractDate}</Highlight> ระหว่าง
        </div>

        <div className="mb-4 pl-8 -indent-8">
          (1) <b><Highlight>{agileInfo.companyName}</Highlight></b> (โดย<Highlight>{agileInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่ <Highlight>{agileInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{agileInfo.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>"ผู้ซื้อคืน"</b>)
        </div>

        <div className="mb-6 pl-8 -indent-8">
          (2) <b><Highlight>{customerInfo.companyName}</Highlight></b> (โดย<Highlight>{customerInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่ <Highlight>{customerInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{customerInfo.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>"ผู้ขาย"</b>)
        </div>

        <div className="indent-10 mb-4 font-bold">
          คู่สัญญาทั้งสองฝ่ายได้ตกลงเข้าทำสัญญารับซื้อคืนฉบับนี้โดยมีข้อความดังต่อไปนี้
        </div>

        <div className="mb-4 pl-8 -indent-8">
          1. <b>การรับซื้อคืน</b> — ผู้ซื้อคืนตกลงรับซื้อคืนทรัพย์สินตามสัญญาเช่าซื้อ ในราคารับซื้อคืน <Highlight>{data.buybackPrice}</Highlight> บาท ภายในวันที่ <Highlight>{data.buybackDate}</Highlight>
        </div>

        <div className="mb-4 pl-8 -indent-8">
          2. <b>เงื่อนไข</b> — {data.conditions || 'ตามข้อตกลงของคู่สัญญาทั้งสองฝ่าย'}
        </div>

        <div className="mb-4 pl-8 -indent-8">
          3. <b>กฎหมายที่ใช้บังคับ</b> — สัญญานี้อยู่ภายใต้กฎหมายไทย
        </div>

        <div className="indent-10 mb-12 mt-6">
          สัญญาฉบับนี้ทำขึ้นสองฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาทั้งสองฝ่ายได้อ่านข้อความในสัญญาครบถ้วน และเข้าใจดี
        </div>

        {/* Simple signature */}
        <div className="grid grid-cols-2 gap-12 mt-8 text-[12px]">
          <div className="flex flex-col items-center gap-2">
            <div className="font-bold mb-4">ผู้ซื้อคืน</div>
            <div className="border-b border-black w-[80%] h-[36px]"></div>
            <div>( <Highlight>{agileInfo.directors}</Highlight> )</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="font-bold mb-4">ผู้ขาย</div>
            <div className="border-b border-black w-[80%] h-[36px]"></div>
            <div>( <Highlight>{customerInfo.directors}</Highlight> )</div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>
            สัญญารับซื้อคืน เลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
          <div>page 1 of 1</div>
        </div>
      </div>
    </div>
  );
}

