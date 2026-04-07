import PageHeader from './PageHeader';
import SignatureSection from './SignatureSection';
import type { ContractData } from '../types/contract';
import { CONTRACT_TYPE_LABELS } from '../types/contract';
import { thaiBahtText } from '../utils/thaiBahtText';
import { formatThaiDate } from '../utils/thaiDate';
import { formatThaiId, getAuthorizedSignatoryText } from '../utils/formatters';

interface Props {
  data: ContractData;
}

export default function ContractPreview({ data }: Props) {
  const formatNum = (numStr: string) => {
    const num = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(num)) return numStr;
    const isWhole = num % 1 === 0;
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: isWhole ? 0 : 2, 
      maximumFractionDigits: isWhole ? 0 : 2 
    });
  };

  const stripAddressPrefix = (addr: string) => {
    if (!addr) return '';
    return addr.replace(/^(เลขที่\s*|ที่อยู่:\s*เลขที่\s*|ที่อยู่\s*)/, '');
  };

  const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-yellow-200 print:bg-transparent rounded inline break-words">
      {children || '\u00A0'}
    </span>
  );

  const totalPages = 2;

  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
      <div>
        สัญญาชำระค่าธรรมเนียม เลขที่ <Highlight>{data.contractNo}</Highlight>
      </div>
      <div>
        หน้า {pageNum} จาก {totalPages}
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
          สัญญาชำระค่าธรรมเนียม ("สัญญา") ฉบับนี้ทำขึ้นเพื่อให้มีผลใช้บังคับตั้งแต่วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight> ("วันที่สัญญามีผลใช้บังคับ") ระหว่าง
        </div>

        <div className="mb-4 pr-2 flex gap-2 text-justify">
          <span className="shrink-0 w-6 font-bold">(1)</span>
          <div className="flex-1 text-justify">
            <b><Highlight>{data.companyName}</Highlight></b> (โดย <Highlight>{data.companyDirectors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(data.companyAddress)}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(data.companyTaxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>"ผู้รับค่าธรรมเนียม"</b>) และ
          </div>
        </div>

        <div className="mb-6 pr-2 flex gap-2 text-justify">
          <span className="shrink-0 w-6 font-bold">(2)</span>
          <div className="flex-1 text-justify">
            <b><Highlight>{data.customerCompany}</Highlight></b> (โดย <Highlight>{data.customerDirector}</Highlight> {getAuthorizedSignatoryText({ entityType: data.entityType })}) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(data.customerAddress)}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(data.customerTaxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้จะเรียกว่า <b>"ผู้ชำระค่าธรรมเนียม"</b>)
          </div>
        </div>

        <div className="indent-10 mb-6 font-bold">
          คู่สัญญาทั้งสองฝ่ายได้ตกลงเข้าทำสัญญาฉบับนี้ขึ้นโดยมีข้อความดังต่อไปนี้
        </div>

        <div className="mb-4 flex gap-2 pr-2 text-justify">
          <span className="shrink-0 w-6 font-bold">1.</span>
          <div className="flex-1 text-justify">
            ผู้รับค่าธรรมเนียม รับหน้าที่ในการจัดหาสินเชื่อตาม{itemSummaryText} ผ่านวิธีการคัดกรองความสามารถของผู้ชำระค่าธรรมเนียม ประเมินความเสี่ยง และจัดทำสัญญาต่างๆ ผู้ชำระค่าธรรมเนียมจึงตกลงและยินยอมชำระค่า Origination Fee (ค่าธรรมเนียม) เพื่อการทำสัญญาในอัตราร้อยละ <Highlight>{data.items[0]?.rate ? Number(data.items[0].rate) : 3}</Highlight> ของวงเงินสินเชื่อ
          </div>
        </div>

        {data.items.map((item, index) => {
          const label = CONTRACT_TYPE_LABELS[item.type];
          return (
            <div key={item.id} className={`flex gap-2 pl-6 pr-2 text-justify ${index === data.items.length - 1 ? 'mb-6' : 'mb-2'}`}>
              <span className="shrink-0 font-bold whitespace-nowrap">1.{index + 1}.</span>
              <div className="flex-1 text-justify">
                 ตาม {label.prefix} <Highlight>{item.contractNo}</Highlight> เป็นจำนวนเงิน <Highlight>{formatNum(item.amount)}</Highlight> บาท (<Highlight>{thaiBahtText(item.amount)}</Highlight>) {label.vatLabel}
              </div>
            </div>
          );
        })}

        <div className="pl-12 mb-6 ">
          โดยตกลงชำระค่าธรรมเนียมตามข้อ 1. ในคราวเดียว ณ วันที่ทำสัญญาเช่าซื้อดังกล่าว
        </div>

        <PageFooter pageNum={1} />
      </div>

      {/* Page 2 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="mb-6 mt-8 flex gap-2 pr-2 text-justify">
          <span className="shrink-0 w-6 font-bold">2.</span>
          <div className="flex-1 text-justify">
            <span className="font-bold">ความไม่สมบูรณ์ของข้อสัญญา</span>
            <div className="indent-10 mt-4 leading-relaxed">
              หากข้อสัญญาหรือข้อกำหนดข้อใดข้อหนึ่งภายใต้สัญญานี้ไม่สมบูรณ์ เป็นโมฆะ ขัดต่อกฎหมาย หรือไม่อาจบังคับได้ตามกฎหมาย ไม่ว่าในกรณีใดๆ ให้ถือว่าข้อสัญญาหรือข้อกำหนดอื่นในสัญญานี้ ยังคงมีผลใช้บังคับได้ตามกฎหมาย
            </div>
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

