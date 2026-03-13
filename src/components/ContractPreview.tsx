import PageHeader from './PageHeader';
import SignatureSection from './SignatureSection';
import type { ContractData } from '../types/contract';
import { CONTRACT_TYPE_LABELS } from '../types/contract';
import { thaiBahtText } from '../utils/thaiBahtText';

interface Props {
  data: ContractData;
}

export default function ContractPreview({ data }: Props) {
  const formatNum = (numStr: string) => {
    const num = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(num)) return numStr;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-yellow-200 print:bg-transparent px-1 rounded inline break-words">
      {children || '\u00A0'}
    </span>
  );

  const totalPages = 2;

  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
      <div>
        สัญญาชำระค่าธรรมเนียม เลขที่ <span className="bg-yellow-200 print:bg-transparent px-1 rounded">{data.contractNo || '\u00A0'}</span>
      </div>
      <div>
        page {pageNum} of {totalPages}
      </div>
    </div>
  );

  // Build the summary text for clause 1
  const itemSummaryParts = data.items.map((item) => {
    const label = CONTRACT_TYPE_LABELS[item.type];
    return `${label.prefix} ${item.contractNo}`;
  });
  
  const itemSummaryText = itemSummaryParts.length > 1
    ? itemSummaryParts.slice(0, -1).join(', ') + ' และ ' + itemSummaryParts[itemSummaryParts.length - 1]
    : itemSummaryParts[0] || '';

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line">
      {/* Page 1 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="text-center font-bold mb-6">
          <h2 className="text-xl">สัญญาชำระค่าธรรมเนียม</h2>
          <div className="mt-2">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          สัญญาชำระค่าธรรมเนียม ("สัญญา") ฉบับนี้ทำขึ้นเพื่อให้มีผลใช้บังคับตั้งแต่วันที่ <Highlight>{data.effectiveDate}</Highlight> ("วันที่สัญญามีผลใช้บังคับ") ระหว่าง
        </div>

        <div className="mb-4 pl-8 -indent-8">
          (1) <b>บริษัท อาไจล์ แอสเซ็ทส์ จำกัด</b> ซึ่งเป็นบริษัทจำกัด จดทะเบียนจัดตั้งในประเทศไทย โดยมีสำนักงานใหญ่ตั้งอยู่เลขที่ 20 หมู่ที่ 1 ถนนสุขุมวิท ตำบลบางเมืองใหม่ อำเภอเมืองสมุทรปราการ จังหวัดสมุทรปราการ เลขประจำตัวผู้เสียภาษี 0115558012195 (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้รับค่าธรรมเนียม") และ
        </div>

        <div className="mb-6 pl-8 -indent-8">
          (2) <b><Highlight>{data.customerCompany}</Highlight></b> (โดย <Highlight>{data.customerDirector}</Highlight> กรรมการผู้มีอำนาจกระทำการแทน) มีสำนักงานจดทะเบียนตั้งอยู่ <Highlight>{data.customerAddress}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{data.customerTaxId}</Highlight> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า "ผู้ชำระค่าธรรมเนียม")
        </div>

        <div className="indent-10 mb-6 font-bold">
          คู่สัญญาทั้งสองฝ่ายได้ตกลงเข้าทำสัญญาฉบับนี้ขึ้นโดยมีข้อความดังต่อไปนี้
        </div>

        <div className="mb-4 pl-8 -indent-8">
          1. ผู้รับค่าธรรมเนียม รับหน้าที่ในการจัดหาสินเชื่อตาม{itemSummaryText} ผ่านวิธีการคัดกรองความสามารถของผู้ชำระค่าธรรมเนียม ประเมินความเสี่ยง และจัดทำสัญญาต่างๆ ผู้ชำระค่าธรรมเนียมจึงตกลงและยินยอมชำระค่า Origination Fee (ค่าธรรมเนียม) เพื่อการทำสัญญาในอัตราร้อยละ 3 ของวงเงินสินเชื่อ
        </div>

        {data.items.map((item, index) => {
          const label = CONTRACT_TYPE_LABELS[item.type];
          return (
            <div key={item.id} className={`pl-16 ${index === data.items.length - 1 ? 'mb-6' : 'mb-2'} -indent-8`}>
              1.{index + 1}. ตาม{label.prefix} <Highlight>{item.contractNo}</Highlight> เป็นจำนวนเงิน <Highlight>{formatNum(item.amount)}</Highlight> บาท (<Highlight>{thaiBahtText(item.amount)}</Highlight>) {label.vatLabel}
            </div>
          );
        })}

        <div className="pl-8 mb-6 ">
          โดยตกลงชำระค่าธรรมเนียมตามข้อ 1. ในคราวเดียว ณ วันที่ทำสัญญาเช่าซื้อดังกล่าว
        </div>

        <PageFooter pageNum={1} />
      </div>

      {/* Page 2 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="mb-6 pl-8 -indent-8 mt-8">
          2. <span className="font-bold">ความไม่สมบูรณ์ของข้อสัญญา</span><br />
          <div className="indent-10 mt-4">
            หากข้อสัญญาหรือข้อกำหนดข้อใดข้อหนึ่งภายใต้สัญญานี้ไม่สมบูรณ์ เป็นโมฆะ ขัดต่อกฎหมาย หรือไม่อาจบังคับได้ตามกฎหมาย ไม่ว่าในกรณีใดๆ ให้ถือว่าข้อสัญญาหรือข้อกำหนดอื่นในสัญญานี้ ยังคงมีผลใช้บังคับได้ตามกฎหมาย
          </div>
        </div>

        <div className="indent-10 mb-12 mt-6">
          สัญญาฉบับนี้ทำขึ้นสองฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาทั้งสองฝ่ายได้อ่านข้อความในสัญญาครบถ้วน และเข้าใจดี คู่สัญญาทั้งสองฝ่ายจึงลงนามในสัญญาฉบับนี้ต่อหน้าพยาน ณ วันที่ซึ่งได้ระบุไว้ในหน้าแรกของสัญญาฉบับนี้
        </div>

        <SignatureSection data={data} />

        <PageFooter pageNum={2} />
      </div>
    </div>
  );
}
