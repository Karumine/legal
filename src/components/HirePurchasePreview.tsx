import PageHeader from './PageHeader';
import type { HirePurchaseData, CompanyInfo } from '../types/app';

interface Props {
  data: HirePurchaseData;
  agileInfo: CompanyInfo;
  customerInfo: CompanyInfo;
}

export default function HirePurchasePreview({ data, agileInfo, customerInfo }: Props) {
  const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-yellow-200 print:bg-transparent px-1 rounded inline break-words">
      {children || '\u00A0'}
    </span>
  );

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line">
      {/* Page 1 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="text-center font-bold mb-6">
          <h2 className="text-xl">สัญญาเช่าซื้อ</h2>
          <div className="text-sm mt-1">Hire Purchase Agreement</div>
          <div className="mt-2">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          สัญญาเช่าซื้อ ("สัญญา") ฉบับนี้ทำขึ้นเมื่อวันที่ <Highlight>{data.contractDate}</Highlight> ระหว่าง
        </div>

        <div className="mb-4 pl-8 -indent-8">
          (1) <b><Highlight>{agileInfo.companyName}</Highlight></b> (โดย<Highlight>{agileInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่ <Highlight>{agileInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{agileInfo.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>"ผู้ให้เช่าซื้อ"</b>)
        </div>

        <div className="mb-6 pl-8 -indent-8">
          (2) <b><Highlight>{customerInfo.companyName}</Highlight></b> (โดย<Highlight>{customerInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่ <Highlight>{customerInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{customerInfo.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>"ผู้เช่าซื้อ"</b>)
        </div>

        <div className="indent-10 mb-4 font-bold">
          คู่สัญญาทั้งสองฝ่ายได้ตกลงเข้าทำสัญญาฉบับนี้ขึ้นโดยมีข้อความดังต่อไปนี้
        </div>

        <div className="mb-4 pl-8 -indent-8">
          1. <b>ทรัพย์สินที่เช่าซื้อ</b> — ผู้ให้เช่าซื้อตกลงให้เช่าซื้อและผู้เช่าซื้อตกลงเช่าซื้อทรัพย์สินดังต่อไปนี้: <Highlight>{data.assetDescription}</Highlight>
        </div>

        <div className="mb-4 pl-8 -indent-8">
          2. <b>ราคาเช่าซื้อ</b> — ราคาเช่าซื้อรวมทั้งสิ้น <Highlight>{data.totalAmount}</Highlight> บาท โดยผู้เช่าซื้อตกลงชำระเงินดาวน์จำนวน <Highlight>{data.downPayment}</Highlight> บาท คงเหลือ <Highlight>{data.remainingAmount}</Highlight> บาท แบ่งชำระเป็น <Highlight>{data.installments}</Highlight> งวด งวดละ <Highlight>{data.installmentAmount}</Highlight> บาท
        </div>

        <div className="mb-4 pl-8 -indent-8">
          3. <b>อัตราดอกเบี้ย</b> — อัตราดอกเบี้ยร้อยละ <Highlight>{data.interestRate}</Highlight> ต่อปี อัตราดอกเบี้ยผิดนัดร้อยละ <Highlight>{data.penaltyRate}</Highlight> ต่อปี
        </div>

        <div className="mb-4 pl-8 -indent-8">
          4. <b>กรรมสิทธิ์ในทรัพย์สิน</b> — กรรมสิทธิ์ในทรัพย์สินที่เช่าซื้อยังคงเป็นของผู้ให้เช่าซื้อจนกว่าผู้เช่าซื้อจะได้ชำระเงินค่าเช่าซื้อครบถ้วนตามสัญญา
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>
            สัญญาเช่าซื้อ เลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
          <div>page 1 of 2</div>
        </div>
      </div>

      {/* Page 2 - Placeholder */}
      <div className="print-page relative mt-8 print:mt-0">
        <PageHeader />

        <div className="mt-8">
          <div className="mb-4 pl-8 -indent-8">
            5. <b>การผิดนัด</b> — หากผู้เช่าซื้อผิดนัดชำระค่าเช่าซื้องวดใดงวดหนึ่ง ผู้ให้เช่าซื้อมีสิทธิบอกเลิกสัญญาและเรียกคืนทรัพย์สินที่เช่าซื้อได้
          </div>

          <div className="mb-4 pl-8 -indent-8">
            6. <b>การบำรุงรักษา</b> — ผู้เช่าซื้อต้องบำรุงรักษาทรัพย์สินที่เช่าซื้อให้อยู่ในสภาพดี และต้องรับผิดชอบค่าใช้จ่ายในการบำรุงรักษาทั้งหมด
          </div>

          <div className="mb-4 pl-8 -indent-8">
            7. <b>ความรับผิด</b> — ผู้เช่าซื้อต้องรับผิดชอบต่อความเสียหายใดๆ ที่เกิดขึ้นกับทรัพย์สินที่เช่าซื้อในระหว่างระยะเวลาเช่าซื้อ
          </div>

          <div className="mb-4 pl-8 -indent-8">
            8. <b>กฎหมายที่ใช้บังคับ</b> — สัญญานี้อยู่ภายใต้กฎหมายไทย
          </div>

          <div className="indent-10 mb-12 mt-6">
            สัญญาฉบับนี้ทำขึ้นสองฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาทั้งสองฝ่ายได้อ่านข้อความในสัญญาครบถ้วน และเข้าใจดี คู่สัญญาทั้งสองฝ่ายจึงลงนามในสัญญาฉบับนี้ต่อหน้าพยาน
          </div>

          {/* Simple signature section */}
          <div className="grid grid-cols-2 gap-12 mt-8 text-[12px]">
            <div className="flex flex-col items-center gap-2">
              <div className="font-bold mb-4">ผู้ให้เช่าซื้อ</div>
              <div className="border-b border-black w-[80%] h-[36px]"></div>
              <div>( <Highlight>{agileInfo.directors}</Highlight> )</div>
              <div className="mt-1">{agileInfo.companyName}</div>
              <div className="mt-6 w-full">
                <div className="font-bold mb-2">พยาน:</div>
                <div className="border-b border-black w-[70%] mx-auto h-[24px]"></div>
                <div className="text-center">(<span className="inline-block w-[120px]"></span>)</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="font-bold mb-4">ผู้เช่าซื้อ</div>
              <div className="border-b border-black w-[80%] h-[36px]"></div>
              <div>( <Highlight>{customerInfo.directors}</Highlight> )</div>
              <div className="mt-1"><Highlight>{customerInfo.companyName}</Highlight></div>
              <div className="mt-6 w-full">
                <div className="font-bold mb-2">พยาน:</div>
                <div className="border-b border-black w-[70%] mx-auto h-[24px]"></div>
                <div className="text-center">(<span className="inline-block w-[120px]"></span>)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>
            สัญญาเช่าซื้อ เลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
          <div>page 2 of 2</div>
        </div>
      </div>
    </div>
  );
}
