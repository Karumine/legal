import PageHeader from './PageHeader';
import type { JointVentureData, CompanyInfo, Agreement, AppData, ContractType } from '../types/app';
import { formatThaiDate, formatThaiDateShort, addMonths } from '../utils/thaiDate';
import { thaiBahtText } from '../utils/thaiBahtText';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import { thaiNumberText } from '../utils/thaiNumberText';

interface Props {
  data: JointVentureData;
  agileInfo: CompanyInfo;
  tkInfo: CompanyInfo;
  agreements: Agreement[];
  appData: AppData;
}

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-yellow-200 print:bg-transparent py-0.5 rounded inline break-words">
    {children || '\u00A0'}
  </span>
);

export default function JointVenturePreview({ data, agileInfo, tkInfo, agreements, appData }: Props) {
  const translateRateToThai = (rate: string) => {
    const digits: Record<string, string> = {
      '0': 'ศูนย์', '1': 'หนึ่ง', '2': 'สอง', '3': 'สาม', '4': 'สี่',
      '5': 'ห้า', '6': 'หก', '7': 'เจ็ด', '8': 'แปด', '9': 'เก้า', '.': 'จุด'
    };
    return rate.split('').map(char => digits[char] || char).join('');
  }

  const translateNumberToThai = (num: number) => {
    const words = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า', 'สิบ',
      'สิบเอ็ด', 'สิบสอง', 'สิบสาม', 'สิบสี่', 'สิบห้า', 'สิบหก', 'สิบเจ็ด', 'สิบแปด', 'สิบเก้า', 'ยี่สิบ',
      'ยี่สิบเอ็ด', 'ยี่สิบสอง', 'ยี่สิบสาม', 'ยี่สิบสี่', 'ยี่สิบห้า', 'ยี่สิบหก', 'ยี่สิบเจ็ด', 'ยี่สิบแปด', 'ยี่สิบเก้า', 'สามสิบ',
      'สามสิบเอ็ด', 'สามสิบสอง', 'สามสิบสาม', 'สามสิบสี่', 'สามสิบห้า', 'สามสิบหก', 'สามสิบเจ็ด', 'สามสิบแปด', 'สามสิบเก้า', 'สี่สิบ',
      'สี่สิบเอ็ด', 'สี่สิบสอง', 'สี่สิบสาม', 'สี่สิบสี่', 'สี่สิบห้า', 'สี่สิบหก', 'สี่สิบเจ็ด', 'สี่สิบแปด', 'สี่สิบเก้า', 'ห้าสิบ',
      'ห้าสิบเอ็ด', 'ห้าสิบสอง', 'ห้าสิบสาม', 'ห้าสิบสี่', 'ห้าสิบห้า', 'ห้าสิบหก', 'ห้าสิบเจ็ด', 'ห้าสิบแปด', 'ห้าสิบเก้า', 'หกสิบ',
    ];
    if (num <= 60) return words[num] || num.toString();
    return num.toString();
  };

  const saData = appData.serviceAgreementData;
  const selectedAgreements = agreements.filter(a => (data.selectedAgreementIds || []).includes(a.id));

  const renderServiceFeeTable = (agreement: any, agreeIdx: number) => {
    const label = CONTRACT_TYPE_LABELS[agreement.type as ContractType] || agreement.type;
    const firstDate = saData.agreementServiceFeeFirstDates?.[agreement.id] || '';
    const installmentAmountStr = saData.agreementServiceFeeAmounts?.[agreement.id] || '0';
    const periods = saData.agreementServiceFeePeriods?.[agreement.id] || 0;
    const totalAmount = parseFloat(installmentAmountStr.replace(/,/g, '')) || 0;

    // Calculations
    const feePerInstallment = Number((totalAmount / 1.07).toFixed(2));
    const vatPerInstallment = Number((totalAmount - feePerInstallment).toFixed(2));

    const grandTotal = totalAmount * periods;
    const totalFee = Number((grandTotal / 1.07).toFixed(2));
    const totalVat = Number((grandTotal - totalFee).toFixed(2));

    const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Helper to render a table column
    const renderColumn = (startIdx: number, endIdx: number) => (
      <table className="w-full border-collapse border border-black text-center text-[10px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-0.5 w-[35px]">ลำดับ</th>
            <th className="border border-black p-0.5 text-center">วันที่</th>
            <th className="border border-black p-0.5 text-center">Service Fee</th>
            <th className="border border-black p-0.5 text-center">VAT</th>
            <th className="border border-black p-0.5 text-center">รวม</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: endIdx - startIdx + 1 }).map((_, i) => {
            const currentIdx = startIdx + i;
            if (currentIdx > periods) return null;
            const rowDate = currentIdx === 1 ? firstDate : addMonths(firstDate, currentIdx - 1);
            return (
              <tr key={currentIdx} className="h-[18px]">
                <td className="border border-black p-0.5">{currentIdx}</td>
                <td className="border border-black p-0.5 whitespace-nowrap">{formatThaiDateShort(rowDate)}</td>
                <td className="border border-black p-0.5">{formatNum(feePerInstallment)}</td>
                <td className="border border-black p-0.5">{formatNum(vatPerInstallment)}</td>
                <td className="border border-black p-0.5">{formatNum(totalAmount)}</td>
              </tr>
            );
          })}
          {endIdx >= periods && periods > 0 && (
            <tr className="font-bold bg-gray-50 h-[21px]">
              <td className="border border-black p-0.5" colSpan={2}>รวม</td>
              <td className="border border-black p-0.5">{formatNum(totalFee)}</td>
              <td className="border border-black p-0.5">{formatNum(totalVat)}</td>
              <td className="border border-black p-0.5">{formatNum(grandTotal)}</td>
            </tr>
          )}
        </tbody>
      </table>
    );

    const rowsPage1Column1 = periods > 48 ? 24 : Math.ceil(periods / 2);

    const part1 = (
      <div className="space-y-3">
        <div className="font-normal text-justify">
          2.{agreeIdx + 1} {label} เลขที่ <Highlight>{agreement.data.contractNo}</Highlight> โดยชำระงวดละ <Highlight>{formatNum(totalAmount)}</Highlight> บาท ({thaiBahtText(totalAmount)}) (รวมภาษีมูลค่าเพิ่ม)
        </div>
        <div className={periods > 1 ? "grid grid-cols-2 gap-4" : "w-1/2"}>
          <div>{renderColumn(1, rowsPage1Column1)}</div>
          {periods > 1 && <div>{renderColumn(rowsPage1Column1 + 1, Math.min(periods, 48))}</div>}
        </div>
      </div>
    );

    const part2 = periods > 48 ? (
      <div className="space-y-3">
        <div className="font-normal text-justify opacity-50">
          (ต่อ) 2.{agreeIdx + 1} {label} เลขที่ {agreement.data.contractNo}
        </div>
        <div className="w-1/2">
          {renderColumn(49, 72)}
        </div>
      </div>
    ) : null;

    return { part1, part2 };
  };

  const renderAgreementTable = (agreement: any, agreeIdx: number) => {
    const label = CONTRACT_TYPE_LABELS[agreement.type as ContractType] || agreement.type;
    const firstDate = saData.agreementFirstDates?.[agreement.id] || '';
    const installmentAmountStr = saData.agreementInstallmentAmounts?.[agreement.id] || '0';
    const periods = saData.agreementOriginationFeePeriods?.[agreement.id] || 0;
    const totalAmount = parseFloat(installmentAmountStr.replace(/,/g, '')) || 0;

    // Calculations
    const vatPerInstallment = totalAmount * 7 / 107;
    const feePerInstallment = totalAmount - vatPerInstallment;

    const totalFee = feePerInstallment * periods;
    const totalVat = vatPerInstallment * periods;
    const grandTotal = totalAmount * periods;

    const formatNum = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
      <div key={agreement.id} className="space-y-3">
        <div className="font-bold text-justify text-[13px]">
          1.{agreeIdx + 1}. {label} เลขที่ {agreement.data.contractNo} โดยชำระงวดละ {formatNum(totalAmount)} บาท ({thaiBahtText(totalAmount)}) (รวมภาษีมูลค่าเพิ่ม)
        </div>

        <table className="w-full border-collapse border border-black text-center text-[12px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 py-1.5 w-[80px]">ลำดับ</th>
              <th className="border border-black p-1 py-1.5">วันที่</th>
              <th className="border border-black p-1 py-1.5">Origination Fee</th>
              <th className="border border-black p-1 py-1.5">VAT</th>
              <th className="border border-black p-1 py-1.5">รวม</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: periods }).map((_, monthsToAdd) => {
              const rowDate = monthsToAdd === 0 ? firstDate : addMonths(firstDate, monthsToAdd);
              return (
                <tr key={monthsToAdd}>
                  <td className="border border-black p-1">{monthsToAdd + 1}</td>
                  <td className="border border-black p-1">{formatThaiDate(rowDate)}</td>
                  <td className="border border-black p-1">{formatNum(feePerInstallment)}</td>
                  <td className="border border-black p-1">{formatNum(vatPerInstallment)}</td>
                  <td className="border border-black p-1">{formatNum(totalAmount)}</td>
                </tr>
              );
            })}
            <tr className="font-bold bg-gray-50">
              <td className="border border-black p-1" colSpan={2}>รวม</td>
              <td className="border border-black p-1">{formatNum(totalFee)}</td>
              <td className="border border-black p-1">{formatNum(totalVat)}</td>
              <td className="border border-black p-1">{formatNum(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const serviceFeeAdditionalPages = selectedAgreements.reduce((acc, a) => {
    const p = saData.agreementServiceFeePeriods?.[a.id] || 0;
    return acc + (p > 48 ? 1 : 0);
  }, 0);

  const totalPagesCount = (selectedAgreements.length > 1 ? 25 : 24) + serviceFeeAdditionalPages;

  // Create the referenced agreements string
  const agreementRefs = selectedAgreements.map((a, idx) => {
    const label = CONTRACT_TYPE_LABELS[a.type as keyof typeof CONTRACT_TYPE_LABELS] || a.type;
    const isLast = idx === selectedAgreements.length - 1;
    const isSecondToLast = idx === selectedAgreements.length - 2;

    let text = `${label}เลขที่ ${a.data.contractNo}`;
    if (selectedAgreements.length > 1) {
      if (isSecondToLast) text += ' และ';
      else if (!isLast) text += ' ';
    }
    return text;
  }).join('');

  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
      <div>
        สัญญาค้าร่วมเลขที่ {data.contractNo}
      </div>
      <div>
        หน้า {pageNum} / {totalPagesCount}
      </div>
    </div>
  );

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line space-y-8 print:space-y-0 mx-auto">
      {/* Page 1 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-xl">สัญญาค้าร่วม (Consortium)</h2>
          <div className="mt-2 text-[14px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          สัญญาค้าร่วม (“สัญญา”) ฉบับนี้ ทำขึ้นที่ <Highlight>{agileInfo.companyName}</Highlight> เมื่อวันที่ <Highlight>{formatThaiDate(data.contractDate)}</Highlight>
        </div>

        <div className="mb-6">โดยและระหว่าง</div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-2 text-justify pr-2">
            <span className="shrink-0 w-4">1.</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{agileInfo.companyName}</Highlight></span> (โดย<Highlight>{agileInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{agileInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{agileInfo.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“คู่สัญญาฝ่ายที่ 1”</b>) และ
            </div>
          </div>
          <div className="flex gap-2 text-justify pr-2">
            <span className="shrink-0 w-4">2.</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{tkInfo.companyName}</Highlight></span> (โดย<Highlight>{tkInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{tkInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{tkInfo.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“คู่สัญญาฝ่ายที่ 2”</b>)
            </div>
          </div>
        </div>

        <div className="font-bold mb-4">โดยที่</div>
        <div className="space-y-3 mb-6">
          <div className="flex gap-4">
            <span>ก.</span>
            <div className="flex-1">
              คู่สัญญาทั้งสองฝ่ายได้ตกลงกันทำสัญญาค้าร่วมฉบับนี้ เพื่อเป็นการระดมทุนระหว่างคู่สัญญา เพื่อประโยชน์ในการร่วมกันเข้าทำ<Highlight>{agreementRefs}</Highlight> (“สัญญาทางการเงิน”) กับผู้กู้/ผู้เช่าซื้อ (“ลูกค้า”) เนื่องจากสัญญาทางการเงินดังกล่าวเป็นการให้การสนับสนุนทางการเงินแก่ลูกค้าในวงเงินที่สูง และเพื่อเป็นการกำหนดสิทธิและหน้าที่ of คู่สัญญาในการดำเนินการใด ๆ ที่เกี่ยวข้องกับสัญญาทางการเงิน
            </div>
          </div>
          <div className="flex gap-4">
            <span>ข.</span>
            <div className="flex-1">
              การที่คู่สัญญาทั้งสองฝ่ายได้ตกลงกันทำสัญญาฉบับนี้ จะทำให้คู่สัญญาไม่ต้องรับภาระในการให้การสนับสนุนทางการเงิน และ/หรือ การปฏิบัติหน้าที่ตามข้อตกลงและเงื่อนไขภายใต้สัญญาทางการเงินที่มากจนเกินไป และเพื่อให้บรรลุตามวัตถุประสงค์ของสัญญาทั้งสองฝ่ายในการเข้าทำสัญญาทางการเงินดังกล่าว
            </div>
          </div>
          <div className="flex gap-4">
            <span>ค.</span>
            <div className="flex-1">
              คู่สัญญาทั้งสองฝ่ายจะไม่มีการจดทะเบียนจัดตั้งบริษัทใหม่ และเข้าทำสัญญาฉบับนี้เพื่อประโยชน์ในการค้าร่วมเท่านั้น
            </div>
          </div>
        </div>

        <PageFooter pageNum={1} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 2 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="font-bold text-center mb-4">
            คู่สัญญาทั้งสองฝ่ายจึงได้ตกลงทำสัญญาฉบับนี้ขึ้น โดยมีข้อความต่อไปนี้
          </div>
          <div>
            <div className="font-bold">1. ข้อตกลงในการค้าร่วม</div>
            <div className="indent-10 mt-2">
              คู่สัญญาทั้งสองฝ่ายตกลงแบ่งสัดส่วนการค้าร่วมกัน กล่าวคือ คู่สัญญาจะให้การสนับสนุนทางการเงินแก่ลูกค้าภายใต้สัญญาทางการเงินในสัดส่วน ดังต่อไปนี้
            </div>

            <table className="w-full border-collapse border border-black text-center mt-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 w-1/2">ผู้ค้าร่วม</th>
                  <th className="border border-black p-2">สัดส่วน (ร้อยละ)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2">คู่สัญญาฝ่ายที่ 1</td>
                  <td className="border border-black p-2">
                    <Highlight>{data.proportion1}</Highlight> ({thaiNumberText(data.proportion1)})
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2">คู่สัญญาฝ่ายที่ 2</td>
                  <td className="border border-black p-2">
                    <Highlight>{data.proportion2}</Highlight> ({thaiNumberText(data.proportion2)})
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="font-bold">2. การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน</div>

            <div className="flex gap-2">
              <span className="shrink-0 w-6">2.1</span>
              <div className="flex-1 space-y-4">
                <div className="text-justify leading-relaxed">
                  คู่สัญญาฝ่ายที่ 2 ตกลงรับบริการ from คู่สัญญาฝ่ายที่ 1 สำหรับการให้บริการที่เกี่ยวข้องกับการจัดหาลูกค้าและจัดทำสัญญาทางการเงิน และบริหารจัดการสัญญาทางการเงิน โดยคู่สัญญาฝ่ายที่ 1 มีขอบเขตอำนาจ หน้าที่ และเงื่อนไขในการให้บริการตามที่กำหนดใน<span className="font-bold underline">เอกสารแนบท้ายหมายเลข 1</span> (การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน)
                </div>
                <div className="text-justify leading-relaxed">
                  อย่างไรก็ดี คู่สัญญาตกลงว่าข้อสัญญาข้างต้นไม่ตัดสิทธิคู่สัญญาฝ่ายที่ 2 ที่จะร่วมดำเนินการต่าง ๆ กับคู่สัญญาฝ่ายที่ 1 ในการให้บริการตามที่กำหนดใน<span className="font-bold underline">เอกสารแนบท้ายหมายเลข 1</span> (การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน) หรือดำเนินการดังกล่าวด้วยตนเองตามที่คู่สัญญาฝ่ายที่ 2 เห็นสมควร
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-6">2.2</span>
              <div className="flex-1">
                คู่สัญญาฝ่ายที่ 2 ตกลงชำระค่าตอบแทนให้แก่คู่สัญญาฝ่ายที่ 1 สำหรับการให้บริการตามที่ระบุในข้อ 2.1 ของสัญญาฉบับนี้ โดยมีรายละเอียด of ค่าตอบแทนและวิธีการชำระค่าตอบแทนตามที่กำหนดใน<span className="font-bold underline">เอกสารแนบท้ายหมายเลข 2</span> (ค่าตอบแทนที่เกี่ยวข้องกับการให้บริการ)
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={2} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 3 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div>
            <div className="font-bold">3. ระยะเวลาและการมีผลบังคับใช้ของสัญญา</div>
            <div className="indent-10 mt-2 text-justify">
              คู่สัญญาทั้งสองฝ่ายตกลงให้สัญญาฉบับนี้มีผลบังคับใช้นับแต่วันที่คู่สัญญาลงนามในสัญญาฉบับนี้ และให้สัญญาฉบับนี้สิ้นสุดลงทันที เมื่อ (1) สัญญาทางการเงินสิ้นสุดลง และ (2) คู่สัญญาได้รับชำระหนี้ ดอกเบี้ย ค่าเสียหาย และค่าใช้จ่ายอื่น ๆ (ถ้ามี) ภายใต้สัญญาทางการเงินจนครบถ้วนแล้ว
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">4. วิธีการรับชำระเงินและค่าใช้จ่ายอื่น ๆ ที่เกิดขึ้นตามสัญญาทางการเงิน</div>

            <div className="flex gap-2">
              <span className="shrink-0 w-6">4.1</span>
              <div className="flex-1 text-justify">
                คู่สัญญาทั้งสองฝ่ายตกลงกำหนดให้ลูกค้าชำระค่างวดเช่าซื้อ และ/หรือ ค่าใช้จ่ายอื่น ๆ (ซึ่งรวมถึงดอกเบี้ย ค่าปรับ และ/หรือ ค่าใช้จ่ายต่าง ๆ ในการเข้าทำสัญญาทางการเงิน) ที่เกิดขึ้นตามสัญญาทางการเงิน (“หนี้เงิน”) ด้วยเงินสด เช็ค การโอนเงินเข้าบัญชี หรือด้วยการสั่งจ่ายเช็คล่วงหน้า (วิธีการใดวิธีการหนึ่งหรือหลายวิธี) หรือวิธีการอื่นใดตามที่คู่สัญญาตกลงร่วมกันเท่านั้น โดยรายละเอียดให้เป็นไปตามสัญญาทางการเงิน ทั้งนี้ ลูกค้าจะต้องชำระหนี้เงินให้แก่คู่สัญญาแต่ละรายโดยตรง ตามสัดส่วนที่ระบุ in ข้อ 1. ของสัญญาฉบับนี้
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-6">4.2</span>
              <div className="flex-1 text-justify">
                คู่สัญญาทั้งสองฝ่ายตกลงว่าระหว่างคู่สัญญาด้วยกันเองและกับลูกค้า สิทธิและข้อเรียกร้องทุกประการของคู่สัญญาแต่ละรายในหนี้เงินของคู่สัญญาภายใต้สัญญาทางการเงิน เป็นสิทธิและข้อเรียกร้องที่เท่าเทียมกัน (Pari Passu) ระหว่างคู่สัญญาภายใต้สัญญาฉบับนี้ และตามสัดส่วนในการให้การสนับสนุนทางการเงินแก่ลูกค้าของคู่สัญญาแต่ละราย (Pro Rata) ดังนั้น หากคู่สัญญารายใดรายหนึ่งได้รับเงินจำนวนหนึ่งซึ่งมิใช่จำนวนเงินที่ตนจะมีสิทธิได้รับ หรือเกินกว่าจำนวนเงินที่ตนจะมีสิทธิได้รับตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้จากลูกค้า (ไม่ว่าโดยวิธีการใดก็ตาม) คู่สัญญาที่เป็นผู้ได้รับเงินนั้นจะต้องแจ้งจำนวนเงินที่ได้รับดังกล่าวมให้คู่สัญญาอีกฝ่ายทราบทันที และคู่สัญญาทั้งสองฝ่ายจะดำเนินการร่วมกันจัดสรรจำนวนเงินที่ได้รับมานั้นตามสัดส่วนที่ถูกต้องตามสิทธิที่คู่สัญญาแต่ละรายมีภายใต้สัญญาฉบับนี้ต่อไป
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={3} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 4 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div>
            <div className="font-bold">5. สิทธิ หน้าที่ และความรับผิดชอบระหว่างคู่สัญญา</div>
            
            <div className="flex gap-2 mb-4">
              <span className="shrink-0 w-6">5.1</span>
              <div className="flex-1 space-y-4">
                <div className="text-justify leading-relaxed">
                  คู่สัญญาทั้งสองฝ่ายตกลงร่วมกันซื้อทรัพย์สินที่จะให้เช่าซื้อ (ในกรณีของสัญญาเช่าซื้อ) โดยอ้างอิงตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้ ตามเงื่อนไขและในเวลาที่คู่สัญญาทั้งสองฝ่ายเห็นพ้องต้องกัน
                </div>
                <div className="text-justify leading-relaxed">
                  ทั้งนี้ ในการดำเนินการตามวรรคแรก คู่สัญญาฝ่ายที่ 2 ตกลงโอนเงินเข้าบัญชีของตัวแทนจำหน่ายโดยตรง เพื่อประโยชน์ในการซื้อทรัพย์สินที่จะให้เช่าซื้อ เว้นแต่คู่สัญญาจะตกลงเป็นอย่างอื่น โดยในกรณีดังกล่าวคู่สัญญาฝ่ายที่ 1 ตกลงจะแจ้งรายละเอียดของเลขบัญชีธนาคารให้คู่สัญญาฝ่ายที่ 2 ทราบล่วงหน้าอย่างน้อย 5 (ห้า) วัน ก่อนวันที่คู่สัญญาทั้งสองฝ่ายเห็นพ้องต้องกันในวรรคแรก หากคู่สัญญาฝ่ายใดไม่ปฏิบัติตามเงื่อนไขที่กำหนดในวรรคแรก และทำให้คู่สัญญาอีกฝ่ายได้รับความเสียหาย คู่สัญญาฝ่ายที่กระทำผิดต้องชำระค่าชดเชยให้แก่คู่สัญญาอีกฝ่าย ในอัตราร้อยละ 7 (เจ็ด) ต่อปี ของจำนวนเงินที่คู่สัญญาฝ่ายดังกล่าวจะต้องส่งมอบให้แก่ลูกค้า โดยอ้างอิงตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้ นับจากวันที่คู่สัญญาทั้งสองฝ่ายตกลงซื้อทรัพย์สินที่จะให้เช่าซื้อ (ในกรณีของสัญญาเช่าซื้อ)
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-6">5.2</span>
              <div className="flex-1 space-y-4 text-justify">
                <div>
                  คู่สัญญาทั้งสองฝ่ายตกลงว่าสิทธิ หน้าที่ และความรับผิดชอบของคู่สัญญาแต่ละฝ่าย ภายใต้สัญญาทางการเงินจะแยกต่างหากจากกัน การที่คู่สัญญารายใดไม่ปฏิบัติตามหน้าที่ที่กำหนดไว้ในสัญญาทางการเงิน ไม่เป็นเหตุปลดเปลื้องคู่สัญญาอีกรายหนึ่งในการปฏิบัติตามหน้าที่ในส่วนของคู่สัญญารายนั้นและไม่เป็นเหตุให้คู่สัญญาอีกรายหนึ่งมีความรับผิดหรือภาระผูกพันใด ๆ เพิ่มเกินกว่าหน้าที่และภาระผูกพันของตนตามที่กำหนดไว้ในสัญญาทางการเงิน
                </div>
                <div>
                  หนี้เงินตามสัญญาทางการเงินที่ถึงกำหนดชำระใด ๆ ต่อคู่สัญญาไม่ว่า ณ ขณะใดก็ตาม เป็นหนี้ซึ่งแยกต่างหากจากกัน และเป็นอิสระจากกัน นอกจากนี้ คู่สัญญาทางการเงินมีสิทธิที่จะปกป้อง รักษา และบังคับใช้สิทธิในสัดส่วนของตนที่มีภายใต้สัญญาทางการเงินได้โดยไม่ต้องให้คู่สัญญาอีกฝ่ายเข้ามาร่วมเป็นคู่ความร่วมในการดำเนินการเพื่อปกป้อง รักษา หรือบังคับใช้สิทธิดังกล่าวด้วยแต่อย่างใด แต่ยังคงต้องปฏิบัติตามมติของคู่สัญญาภายใต้การลงมิติดตามที่กำหนดในข้อ 5.4 และ/หรือ ข้อ 5.5 ของสัญญาฉบับนี้
                </div>
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={4} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 5 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="flex gap-2">
            <span className="shrink-0 w-6">5.3</span>
            <div className="flex-1 text-justify">
              ในกรณีที่ลูกค้าตามสัญญาทางการเงิน ชำระหนี้เงินล่าช้า หรือไม่ปฏิบัติตามสัญญาทางการเงิน คู่สัญญาตกลงรับผิดชอบค่าใช้จ่ายในการดำเนินการต่าง ๆ เพื่อติดตามให้ลูกค้าชำระหนี้หรือปฏิบัติตามสัญญาทางการเงินตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-6">5.4</span>
            <div className="flex-1 space-y-4">
              <div className="text-justify leading-relaxed">
                เว้นแต่เป็นกรณีที่กำหนดให้ใช้มติเอกฉันท์ของคู่สัญญาในข้อ 5.5 ของสัญญาฉบับนี้ คู่สัญญาทั้งสองฝ่ายตกลงว่าการใช้สิทธิของคู่สัญญาหรือการดำเนินการใด ๆ ตามสัญญาทางการเงินกับลูกค้าในทุกกรณี ซึ่งรวมถึงแต่ไม่จำกัดเพียงการดำเนินการพิจารณาเครดิต การใช้สิทธิของคู่สัญญาภายใต้สัญญาทางการเงิน การส่งหนังสือบอกกล่าวการฟ้องร้องดำเนินคดีกับลูกค้า และการจัดหาทีมกฎหมาย ทนายความ และการอื่นใดที่เกี่ยวข้องจนเสร็จการ ให้ถือเป็นดุลยพินิจและการตัดสินใจของคู่สัญญาฝ่ายที่ 1 คู่สัญญาฝ่ายที่ 2 ยินยอมให้คู่สัญญาฝ่ายที่ 1 เป็นตัวแทนของคู่สัญญาฝ่ายที่ 2 และเป็นผู้ดำเนินการเพื่อให้การดำเนินการเป็นไปด้วยความสะดวก รวดเร็ว และต้องดำเนินการโดยถือเอาประโยชน์ของคู่สัญญาทั้งสองฝ่ายเป็นสำคัญ ทั้งนี้ ก่อนการดำเนินการตามวรรคแรก คู่สัญญาฝ่ายที่ 1 จะแจ้งให้คู่สัญญาฝ่ายที่ 2 ทราบภายในระยะเวลาตามสมควร และคู่สัญญาฝ่ายที่ 2 สงวนสิทธิ์ที่จะระงับ และ/หรือ ยับยั้งไม่ให้คู่สัญญาฝ่ายที่ 1 ดำเนินการได้ ไม่ว่าคู่สัญญาฝ่ายที่ 1 จะได้ดำเนินการแล้วหรือไม่ก็ตาม
              </div>
              <div className="text-justify leading-relaxed">
                ในกรณีที่มีค่าใช้จ่ายที่เกิดขึ้นจากการดำเนินการ และ/หรือ ค่าใช้จ่ายอื่นใด อันเกี่ยวข้องกับการใช้สิทธิตามวรรคแรก ให้คู่สัญญาฝ่ายที่ 1 สามารถดำเนินการได้หากค่าใช้จ่ายดังกล่าวไม่เกิน 20,000 บาท (สองหมื่นบาทถ้วน) ในแต่ละคราว แต่หากมีค่าใช้จ่ายเกิน 20,000 บาท (สองหมื่นบาทถ้วน) ในแต่ละคราว ต้องได้รับความเห็นชอบร่วมกันจากคู่สัญญาทั้งสองฝ่าย
              </div>
              <div className="text-justify leading-relaxed">
                ทั้งนี้ นอกเหนือจากข้อความตามข้อ 5.4 วรรคหนึ่งและวรรคสองข้างต้น ให้ใช้มติของเสียงข้างมาก เพื่อให้เป็นที่สงสัย <span className="font-bold">“มติเสียงข้างมากของคู่สัญญา”</span> หมายถึง มติให้ความเห็นชอบจากคู่สัญญาภายใต้สัญญาฉบับนี้ในสัดส่วนไม่น้อยกว่าร้อยละ 50 (ห้าสิบ) ของสิทธิในการออกเสียงลงมติทั้งหมดของคู่สัญญา โดยสิทธิในการออกเสียงลงมติของคู่สัญญาแต่ละรายเป็นไปตามสัดส่วนที่ระบุ in ข้อ 1. ของสัญญาฉบับนี้
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={5} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 6 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div>
            <div className="flex gap-2 mb-4">
              <span className="shrink-0 w-6">5.5</span>
              <div className="flex-1 space-y-4">
                <div className="text-justify leading-relaxed">
                  คู่สัญญาทั้งสองฝ่ายตกลงว่าการใช้สิทธิหรือการดำเนินการใด ๆ ตามสัญญาทางการเงินกับลูกค้าในเรื่องดังต่อไปนี้ ต้องได้รับมติเอกฉันท์ของคู่สัญญา
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className="shrink-0">(ก)</span>
                    <div className="flex-1">การเปลี่ยนแปลงอัตราดอกเบี้ย</div>
                  </div>
                  <div className="flex gap-4">
                    <span className="shrink-0">(ข)</span>
                    <div className="flex-1">การเปลี่ยนแปลงกำหนดเวลาชำระคืนเงินต้น/ค่าเช่าซื้อ และ</div>
                  </div>
                  <div className="flex gap-4">
                    <span className="shrink-0">(ค)</span>
                    <div className="flex-1 text-justify">
                      การปลด ปลอด หรือไถ่ถอนหลักประกันใด ๆ หรือการดำเนินการอื่นใดที่มีผลทำให้หลักประกันของสัญญาทางการเงินนั้นมีมูลค่าลดลงหรือเสื่อมราคา หรือเกิดบุริมสิทธิหรือเกิดภาระติดพันขึ้นบนหลักประกันดังกล่าว หรือสิ้นผลหรือใช้บังคับไม่ได้อีกต่อไป
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="shrink-0">(ง)</span>
                    <div className="flex-1">การขอปรับปรุงโครงสร้างหนี้ รวมถึงเรื่องที่ส่งผลกระทบต่อหลักประกัน</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <span className="shrink-0 w-6">5.6</span>
              <div className="flex-1 text-justify leading-relaxed">
                คู่สัญญาทั้งสองฝ่ายตกลงว่าในกรณีที่มีการลงมติตามที่กำหนดในข้อ 5.4 และ/หรือ ข้อ 5.5 ของสัญญาฉบับนี้ คู่สัญญาทั้งสองฝ่ายจะปฏิบัติตามผลการลงมติอย่างเคร่งครัด ซึ่งรวมถึงแต่ไม่จำกัดเพียง การดำเนินการที่เกี่ยวข้องกับลูกค้าภายใต้สัญญาทางการเงิน และการแก้ไขสัญญาทางการเงิน
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-6">5.7</span>
              <div className="flex-1 text-justify leading-relaxed">
                คู่สัญญาทั้งสองฝ่ายตกลงว่าในกรณีที่จำนวนเงินที่ลูกค้าได้ชำระให้แก่คู่สัญญาตามสัญญาทางการเงิน ไม่เพียงพอที่จะชำระเงินจำนวนใด ๆ ที่ถึงกำหนดชำระ ณ ขณะนั้น ๆ ให้แก่คู่สัญญา หรือในกรณีที่จำนวนเงินที่ได้จากการบังคับหลักประกันไม่เพียงพอที่จะชำระเงินให้แก่คู่สัญญา ให้จัดสรรเงินที่ได้รับชำระหรือที่ได้คืนมาตามลำดับดังต่อไปนี้
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={6} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 7 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="ml-10 space-y-4">
            <div className="flex gap-4">
              <span className="shrink-0">(ก)</span>
              <div className="flex-1 text-justify">
                ลำดับแรก: ชำระค่าธรรมเนียมและค่าใช้จ่ายต่าง ๆ ตามสัญญาทางการเงิน ที่ยังไม่ได้ชำระ
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0">(ข)</span>
              <div className="flex-1 text-justify">
                ลำดับที่สอง: ชำระดอกเบี้ยที่ถึงกำหนดชำระ
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0">(ค)</span>
              <div className="flex-1 text-justify">
                ลำดับที่สาม: ชำระเงินต้น/ค่าเช่าซื้อที่ถึงกำหนดชำระ และ
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0">(ง)</span>
              <div className="flex-1 text-justify">
                ลำดับที่สี่: ชำระเงินจำนวนอื่นใดซึ่งถึงกำหนดชำระ (ถ้ามี)
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-6">5.8</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาทั้งสองฝ่ายตกลงว่ากรรมสิทธิ์ของทรัพย์สินที่เช่าซื้อภายใต้สัญญาทางการเงิน เป็นของคู่สัญญาทั้งสองฝ่ายตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้ จนกว่าจะมีการโอนกรรมสิทธิ์ให้แก่ลูกค้าตามเงื่อนไขของสัญญาทางการเงิน
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-6">5.9</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาทั้งสองฝ่ายตกลงว่าสิทธิในการได้รับผลประโยชน์จากประกันภัยทรัพย์สินภายใต้สัญญาทางการเงิน เป็นของคู่สัญญาทั้งสองฝ่ายตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-6">5.10</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาทั้งสองฝ่ายตกลงว่าสิทธิต่าง ๆ ของคู่สัญญาบนทรัพย์สินหลักประกันภายใต้สัญญาทางการเงิน ซึ่งรวมถึงแต่ไม่จำกัดเพียงการจำนอง เป็นของคู่สัญญาทั้งสองฝ่ายตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-6">5.11</span>
            <div className="flex-1 space-y-4">
              <div className="text-justify leading-relaxed">
                คู่สัญญาทั้งสองฝ่ายตกลงว่าจะไม่โอนสิทธิ และ/หรือ หน้าที่ของตนภายใต้สัญญาทางการเงินให้แก่บุคคลอื่น เว้นแต่ คู่สัญญาฝ่ายที่ประสงค์จะโอนสิทธิ และ/หรือ หน้าที่ (<span className="font-bold">“ผู้โอน”</span>) ได้บอกกล่าวเป็นลายลักษณ์อักษรล่วงหน้า 30 (สามสิบ) วัน ให้คู่สัญญาอีกฝ่ายทราบ และได้รับความยินยอมเป็นลายลักษณ์อักษรจากคู่สัญญาอีกฝ่าย
              </div>
              <div className="text-justify leading-relaxed">
                ภายใต้เงื่อนไขที่กำหนดในวรรคแรก ผู้โอนจะต้องดำเนินการให้บุคคลที่จะรับโอนสิทธิ และ/หรือ หน้าที่ (<span className="font-bold">“ผู้รับโอน”</span>) นั้นตกลงเป็นลายลักษณ์อักษรกับคู่สัญญาอีกฝ่าย เพื่อยินยอมผูกพันและอยู่ภายใต้บังคับของสิทธิและหน้าที่ต่าง ๆ ของผู้โอนตามสัญญาฉบับนี้ทุกประการ เว้นแต่ผู้โอนและคู่สัญญาอีกฝ่ายจะตกลงกันเป็นอย่างอื่น
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={7} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 8 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="flex gap-2">
            <span className="shrink-0 w-6">5.12</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาทั้งสองฝ่ายตกลงแบ่งสัดส่วนการค้าร่วมกัน ในอัตราส่วนตามข้อ 1. ซึ่งเมื่อถึงระยะเวลาในการชำระเงินค้าร่วมดังกล่าว คู่สัญญาฝ่ายใดฝ่ายหนึ่งผิดนัดไม่ชำระตามส่วนที่ได้ตกลงกันไว้ คู่สัญญาอีกฝ่ายหนึ่งมีสิทธิบอกเลิกสัญญาและเรียกค่าเสียหายกับคู่สัญญาอีกฝ่ายหนึ่งได้ ซึ่งแบ่งเป็นสัดส่วนตามที่ระบุในข้อ 1.
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-6">5.13</span>
            <div className="flex-1 text-justify leading-relaxed">
              การขอออกใบสั่งซื้อ (PO) ให้ออกในนามคู่สัญญาทั้งสองฝ่าย ซึ่งคู่สัญญาฝ่ายที่ 2 ยินยอมให้คู่สัญญาฝ่ายที่ 1 เป็นผู้ดำเนินการในกระบวนการต่าง ๆ ที่เกี่ยวข้องทั้งหมด
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">6. คำรับรองและยืนยัน</div>

            <div className="flex gap-2">
              <span className="shrink-0 w-6">6.1</span>
              <div className="flex-1 text-justify leading-relaxed">
                คู่สัญญาทั้งสองฝ่ายตกลงให้คำรับรองและยืนยันตามรายละเอียดที่ระบุไว้ใน <span className="font-bold underline">เอกสารแนบท้ายหมายเลข 3</span> (คำรับรองและยืนยัน) และคู่สัญญาทั้งสองฝ่ายเข้าใจดีว่าคำรับรองและยืนยันดังกล่าวถือเป็นสาระสำคัญในการปฏิบัติตามสัญญาฉบับนี้
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-6">6.2</span>
              <div className="flex-1 text-justify leading-relaxed">
                ในกรณีที่คู่สัญญาฝ่ายใดตรวจพบภายหลังวันที่สัญญาฉบับนี้มีผลบังคับใช้ ว่าคำรับรองและยืนยันใดของคู่สัญญาอีกฝ่ายไม่ถูกต้องหรือไม่เป็นจริง อันมีผลกระทบต่อการตัดสินใจในการเข้าทำและปฏิบัติตามสัญญาฉบับนี้ของคู่สัญญา คู่สัญญาฝ่ายที่ผิดคำรับรองและยืนยันยังคงต้องรับผิดต่อคู่สัญญาอีกฝ่ายในบรรดาความเสียหายใด ๆ ที่เกิดขึ้นดังกล่าว รวมทั้งรับผิดชอบค่าใช้จ่าย ค่าธรรมเนียม ค่าปรับใด ๆ (หากมี) ในการดำเนินการแก้ไขเปลี่ยนแปลงใด ๆ เพื่อให้เป็นไปตามคำรับรองและยืนยัน
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">7. เหตุแห่งการผิดสัญญา</div>
            <div className="text-justify leading-relaxed">
              เมื่อเกิดเหตุการณ์ใดเหตุการณ์หนึ่งดังต่อไปนี้ขึ้น และไม่สามารถดำเนินการแก้ไขและปฏิบัติให้ถูกต้องตามสัญญาฉบับนี้ภายใน 60 (หกสิบ) วัน ให้ถือว่าเป็นเหตุแห่งการผิดสัญญา ยกเว้นกรณีที่เกิดเหตุการณ์ตามข้อ (ก) ให้ถือว่าเป็นเหตุแห่งการผิดสัญญาทันที
            </div>
          </div>
        </div>

        <PageFooter pageNum={8} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 9 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="flex gap-4">
            <span className="shrink-0">(ก)</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาฝ่ายใดฝ่ายหนึ่งไม่รักษาหรือปฏิบัติตามข้อตกลง ข้อผูกพัน และข้อกำหนดใด ๆ อันเป็นหน้าที่ของตนตามที่ระบุไว้ในสัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-4">
            <span className="shrink-0">(ข)</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาฝ่ายใดฝ่ายหนึ่งผิดคำรับรองและยืนยันใด ๆ ที่ให้ไว้ในสัญญาฉบับนี้ในสาระสำคัญ ไม่ว่าจะทั้งหมดหรือบางส่วน และ/หรือ คำรับรองและยืนยันใด ๆ ที่ให้ไว้ในสัญญาฉบับนี้เป็นคำรับรองและยืนยันที่ไม่เป็นความจริง หรือพิสูจน์ได้ว่าไม่เป็นความจริง ไม่ถูกต้อง หรืออาจจะก่อให้เกิดความเข้าใจผิดในสาระสำคัญ
            </div>
          </div>

          <div className="flex gap-4">
            <span className="shrink-0">(ค)</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาฝ่ายใดฝ่ายหนึ่งกระทำการหรือไม่กระทำการสิ่งใดซึ่งเป็นเหตุหรืออาจเป็นเหตุที่ก่อให้เกิดความเสียหายหรือเป็นอันตรายอย่างมีนัยสำคัญต่อคู่สัญญาอีกฝ่าย ภายใต้สัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-4">
            <span className="shrink-0">(ง)</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาฝ่ายใดฝ่ายหนึ่งถูกฟ้องร้อง และ/หรือ ไม่ปฏิบัติตามคำพิพากษาของศาลใด ๆ จนเป็นเหตุให้หรืออาจเป็นเหตุให้มีผลกระทบในทางลบอย่างมีนัยสำคัญต่อความสามารถของคู่สัญญาในการปฏิบัติหน้าที่ใด ๆ ภายใต้สัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-4">
            <span className="shrink-0">(จ)</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาฝ่ายใดฝ่ายหนึ่งมีหนี้สินล้นพ้นตัว (รวมทั้งการเข้าข้อสันนิษฐานตามกฎหมายล้มละลายเรื่องการมีหนี้สินล้นพ้นตัว) ล้มละลาย ถูกศาลสั่งให้เป็นคนไร้ความสามารถ คนเสมือนไร้ความสามารถ เลิกบริษัท ชำระบัญชี ควบรวมบริษัท หรือ กระทำการใด ๆ ที่สันนิษฐานได้ว่ามีหนี้สินล้นพ้นตัว หรือศาลมีคำสั่งรับคำร้องขอฟื้นฟูกิจการ คำสั่งฟื้นฟูกิจการ คำสั่งพิทักษ์ทรัพย์ (ไม่ว่าชั่วคราวหรือเด็ดขาด) ของคู่สัญญา จนเป็นเหตุให้หรืออาจเป็นเหตุให้มีผลกระทบในทางลบอย่างมีนัยสำคัญต่อความสามารถของคู่สัญญาในการปฏิบัติหน้าที่ใด ๆ ภายใต้สัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-4">
            <span className="shrink-0">(ฉ)</span>
            <div className="flex-1 text-justify leading-relaxed">
              คู่สัญญาฝ่ายใดฝ่ายหนึ่งไม่ดำเนินการส่งมอบเงินให้แก่ลูกค้าตามที่ระบุในข้อ 5.1. ของสัญญาฉบับนี้
            </div>
          </div>
        </div>

        <PageFooter pageNum={9} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 10 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
         {(() => {
        let currentPageOffset = 0;
        
        const renderClosingText = () => (
          <div className="mt-8 space-y-4 font-normal text-[12px]">
            <div className="text-justify">
              ทั้งนี้ ในกรณีที่วันครบกำหนดชำระค่าตอบแทนไม่ใช่วันทำการ ให้คู่สัญญาฝ่ายที่ 2 ชำระเงินดังกล่าวในวันทำการแรกถัดจากวันที่กำหนดให้ชำระค่าตอบแทน
            </div>
            <div className="text-justify">
              อนึ่ง ตลอดระยะเวลาของสัญญานี้ คู่สัญญาฝ่ายที่ 2 ตกลงรับผิดชอบภาษีมูลค่าเพิ่ม (Value Added Tax) และอากรแสตมป์ (Stamp Duty) และมีสิทธิหักภาษีหักเงินได้ ณ ที่จ่าย (Withholding tax) ในอัตราเท่ากับร้อยละ 3 (สาม) ของค่าตอบแทนข้างต้นหรือตามอัตราอื่นใดที่กำหนดโดยหน่วยงานที่เกี่ยวข้องในระยะเวลานั้นๆ
            </div>
          </div>
        );

        return selectedAgreements.map((agreement, idx) => {
          const { part1, part2 } = renderServiceFeeTable(agreement, idx);
          const basePageNum = (selectedAgreements.length > 1 ? 20 : 19) + idx + currentPageOffset;
          const isLastAgreement = idx === selectedAgreements.length - 1;
          
          const pages = [];
          
          // Page 1 for this agreement
          pages.push(
            <div key={`sf-schedule-${agreement.id}-p1`} className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
              <PageHeader />
              {part1}
              {isLastAgreement && !part2 && renderClosingText()}
              <PageFooter pageNum={basePageNum} />
            </div>
          );

          // Page 2 for this agreement (if periods > 48)
          if (part2) {
            currentPageOffset += 1;
            pages.push(
              <div key={`sf-schedule-${agreement.id}-p2`} className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
                <PageHeader />
                {part2}
                {isLastAgreement && renderClosingText()}
                <PageFooter pageNum={basePageNum + 1} />
              </div>
            );
          }

          return pages;
        });
      })()}

      {/* Annex 3: Representations and Warranties */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="text-center font-bold mb-8">
          <div className="text-[14px]">เอกสารแนบท้ายหมายเลข 3</div>
          <div className="text-[14px]">คำรับรองและยืนยัน</div>
        </div>

        <div className="space-y-6 font-normal text-[12px] pt-4">
          <div className="grid grid-cols-[30px_1fr] gap-2">
            <span className="font-bold underline">1.</span>
            <div className="space-y-6">
              <span className="font-bold underline">คำรับรองและยืนยันของคู่สัญญาฝ่ายที่ 1</span>
              <div>ณ วันที่ตามสัญญาฉบับนี้และตลอดระยะเวลาของสัญญาฉบับนี้ คู่สัญญาฝ่ายที่ 1 ให้คำรับรองและยืนยันว่า</div>
              
              <div className="space-y-6 ml-4">
                <div className="grid grid-cols-[40px_1fr] gap-2">
                  <span className="shrink-0">(ก)</span>
                  <div className="text-justify">คู่สัญญาฝ่ายที่ 1 เป็นบริษัทจำกัดที่จัดตั้งขึ้นและดำรงอยู่อย่างถูกต้องตามกฎหมายไทย</div>
                </div>
                <div className="grid grid-cols-[40px_1fr] gap-2">
                  <span className="shrink-0">(ข)</span>
                  <div className="text-justify leading-relaxed">คู่สัญญาฝ่ายที่ 1 มีอำนาจในการเข้าทำสัญญา การปฏิบัติตามสัญญา การจัดทำเอกสาร และการดำเนินการอื่นใดตามที่ระบุไว้ในสัญญาฉบับนี้ ตลอดจนการกระทำต่าง ๆ ที่เกี่ยวเนื่องกับสัญญาฉบับนี้ และการกระทำดังกล่าวไม่ขัดต่อวัตถุประสงค์และข้อบังคับของคู่สัญญาฝ่ายที่ 1</div>
                </div>
                <div className="grid grid-cols-[40px_1fr] gap-2">
                  <span className="shrink-0">(ค)</span>
                  <div className="text-justify leading-relaxed">การที่คู่สัญญาฝ่ายที่ 1 เข้าทำสัญญาฉบับนี้หรือปฏิบัติตามความผูกพันใด ๆ ในสัญญาฉบับนี้ ไม่เป็นการขัดแย้งหรือฝ่าฝืนข้อกำหนด เงื่อนไข หรือคำรับรองใด ๆ ในส่วนที่เป็นสาระสำคัญภายใต้สัญญาที่มีนัยสำคัญที่คู่สัญญาฝ่ายที่ 1 ได้ทำหรือให้กับบุคคลอื่น หรือข้อกำหนดหรือเงื่อนไขตามที่ระบุไว้ในการอนุญาต ใบอนุญาต ความเห็นชอบ หรือสิทธิหรือประโยชน์อื่นใดที่คู่สัญญาฝ่ายที่ 1 ได้รับ</div>
                </div>
                <div className="grid grid-cols-[40px_1fr] gap-2">
                  <span className="shrink-0">(ง)</span>
                  <div className="text-justify">คู่สัญญาฝ่ายที่ 1 ไม่อยู่ในระหว่างการเลิกบริษัทหรือขั้นตอนการฟ้องหรือการดำเนินกระบวนการล้มละลาย</div>
                </div>
                <div className="grid grid-cols-[40px_1fr] gap-2">
                  <span className="shrink-0">(จ)</span>
                  <div className="text-justify leading-relaxed">เท่าที่คู่สัญญาฝ่ายที่ 1 ทราบ ไม่มีข้อพิพาททางกฎหมายกับบุคคลใด ๆ และ ทั้งในและนอกศาล ที่มีผลกระทบในทางลบอย่างมีนัยสำคัญต่อการเข้าและปฏิบัติตามสัญญาฉบับนี้หรือส่งผลกระทบในทางลบอย่างมีนัยสำคัญกับการให้บริการแก่คู่สัญญาฝ่ายที่ 2 และเท่าที่คู่สัญญาฝ่ายที่ 1 ทราบ ไม่มีเหตุ หรือข้อขัดแย้ง การถูกฟ้องร้องและการเรียกร้องค่าเสียหายเป็นลายลักษณ์อักษรจากหรือกับบุคคลอื่น ที่ส่งผลกระทบในทางลบอย่างมีนัยสำคัญต่อความสามารถของคู่สัญญาฝ่ายที่ 1 ในการปฏิบัติตามสัญญาฉบับนี้ได้อย่างสมบูรณ์ หรืออาจส่งผลกระทบในทางลบอย่างมีนัยสำคัญกับการให้บริการแก่คู่สัญญาฝ่ายที่ 2</div>
                </div>
                <div className="grid grid-cols-[40px_1fr] gap-2">
                  <span className="shrink-0">(ฉ)</span>
                  <div className="text-justify leading-relaxed">คู่สัญญาฝ่ายที่ 1 มีความรู้ความสามารถและประสบการณ์ให้การจัดหาและบริหารจัดการลูกค้าและมีบุคลากรที่เพียงพอและเหมาะสมต่อการให้บริการที่เกี่ยวข้องกับสัญญาทางการเงินตามที่กำหนดในสัญญาฉบับนี้แก่คู่สัญญาฝ่ายที่ 2</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <span className="shrink-0 w-6">8.</span>
          <div className="flex-1">
            <span className="font-bold underline">คำบอกกล่าว</span>
            <div className="text-justify leading-relaxed mt-4">
              คำบอกกล่าวใด ๆ ที่ต้องส่งให้คู่สัญญาอีกฝ่าย จะต้องส่ง ณ สถานที่อยู่ดังที่ระบุไว้ข้างล่าง หรือสถานที่อื่นตามที่คู่สัญญาจะได้แจ้งให้ทราบเป็นลายลักษณ์อักษร คำบอกกล่าวนั้นอาจส่งด้วยตนเอง พนักงานส่งเอกสาร ไปรษณีย์ลงทะเบียน หรือจดหมายอิเล็กทรอนิกส์ โดยการส่งคำบอกกล่าวให้ถือว่ามีผล ดังนี้
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <span className="shrink-0">(ก)</span>
                <div className="flex-1 text-justify leading-relaxed">
                  นับแต่เวลาที่ไปถึง หากส่งด้วยตนเอง หรือพนักงานส่งเอกสาร
                </div>
              </div>

              <div className="flex gap-4">
                <span className="shrink-0">(ข)</span>
                <div className="flex-1 text-justify leading-relaxed">
                  ภายในวันที่กำหนดในใบตอบรับทางไปรษณีย์หรือใบรับที่เป็นลายลักษณ์อักษรอื่นในกรณีที่มีการส่งทางไปรษณีย์ หรือ
                </div>
              </div>

              <div className="flex gap-4">
                <span className="shrink-0">(ค)</span>
                <div className="flex-1 text-justify leading-relaxed">
                  ภายในวันที่จดหมายอิเล็กทรอนิกส์ส่งไปยังคู่สัญญาฝ่ายผู้รับตามรายละเอียดที่คู่สัญญาฝ่ายผู้รับได้แจ้งไว้ด้านล่าง
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

      <PageFooter pageNum={10} />
      </div>

    {/* Page Break for Print */ }
    <div className = "hidden print:block page-break"></div>

      {/* Page 11 */ }
      <div className = "print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="text-justify leading-relaxed">
            ทั้งนี้ ในกรณีของการส่งคำบอกกล่าวให้ปฏิบัติตามสัญญาหรือบอกเลิกสัญญาฉบับนี้ ให้คู่สัญญาฝ่ายที่ประสงค์จะบอกกล่าวจะต้องส่งคำบอกกล่าวโดยทางไปรษณีย์ลงทะเบียนเท่านั้น
          </div>

          <div className="space-y-8 my-8">
            <div className="grid grid-cols-[120px_1fr] gap-4">
              <span className="font-bold">คู่สัญญาฝ่ายที่ 1:</span>
              <div className="space-y-1">
                <div className="font-bold">{agileInfo.companyName}</div>
                <div>{agileInfo.address}</div>
                <div>โทรศัพท์ : <Highlight>{agileInfo.phone}</Highlight></div>
                <div>จดหมายอิเล็กทรอนิกส์ (E-mail) : <Highlight>{agileInfo.email}</Highlight></div>
                <div>ผู้ติดต่อ : <Highlight>{agileInfo.contactPerson}</Highlight></div>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-4">
              <span className="font-bold">คู่สัญญาฝ่ายที่ 2:</span>
              <div className="space-y-1">
                <div className="font-bold">{tkInfo.companyName}</div>
                <div>เลขที่ {tkInfo.address}</div>
                <div>โทรศัพท์ : <Highlight>{tkInfo.phone}</Highlight></div>
                <div>จดหมายอิเล็กทรอนิกส์ (E-mail) : <Highlight>{tkInfo.email}</Highlight></div>
                <div>ผู้ติดต่อ : <Highlight>{tkInfo.contactPerson}</Highlight></div>
              </div>
            </div>
          </div>

          <div className="text-justify leading-relaxed">
            หากคู่สัญญาฝ่ายหนึ่งฝ่ายใดต้องการเปลี่ยนสถานที่อยู่ คู่สัญญาฝ่ายนั้นต้องแจ้งให้คู่สัญญาอีกฝ่ายทราบล่วงหน้าเป็นลายลักษณ์อักษรไม่น้อยกว่า 5 (ห้า) วันทำการก่อนวันที่ย้ายหรือเปลี่ยนแปลงสถานที่อยู่ ในกรณีเช่นนี้คู่สัญญาฝ่ายที่ได้รับแจ้งการเปลี่ยนแปลงสถานที่อยู่จะส่งคำบอกกล่าวให้แก่คู่สัญญาฝ่ายที่แจ้งเปลี่ยนสถานที่อยู่ตามรายละเอียดที่ได้รับแจ้งดังกล่าว
          </div>

          <div className="space-y-4 pt-4">
            <div className="font-bold">11. การใช้สิทธิ</div>
            <div className="text-justify leading-relaxed">
              การที่คู่สัญญาฝ่ายใดฝ่ายหนึ่งไม่ใช้สิทธิหรือล่าช้าในการใช้สิทธิใด ๆ ภายใต้สัญญาฉบับนี้ มิให้ถือว่าการไม่ใช้สิทธิหรือการล่าช้าดังกล่าวเป็นการสละสิทธิของคู่สัญญาฝ่ายนั้น
            </div>
          </div>
        </div>

        <PageFooter pageNum={11} />
      </div>

    {/* Page Break for Print */ }
    <div className = "hidden print:block page-break"></div>

      {/* Page 12 */ }
      <div className = "print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="space-y-4">
            <div className="font-bold">12. การแยกต่างหากของสัญญา</div>
            <div className="text-justify leading-relaxed">
              หากมีข้อความหรือข้อตกลงใดในสัญญาฉบับนี้ที่เป็นโมฆะ ไม่สมบูรณ์ หรือไม่มีผลบังคับใช้ ไม่ว่าด้วยเหตุใด ๆ ก็ตาม คู่สัญญาตกลงกัน ดังนี้
            </div>
            <div className="ml-8 space-y-4">
              <div className="flex gap-4">
                <span className="shrink-0">(ก)</span>
                <div className="flex-1 text-justify leading-relaxed">
                  ข้อความและข้อตกลงอื่น ๆ ที่เป็นโมฆะ ไม่สมบูรณ์หรือส่วนที่ไม่มีผลบังคับใช้ของสัญญาฉบับนี้ ไม่มีผลกระทบ หรือทำให้เสื่อมเสียต่อข้อความและข้อตกลงอื่น ๆ ที่ยังคงสมบูรณ์ในสัญญาฉบับนี้
                </div>
              </div>
              <div className="flex gap-4">
                <span className="shrink-0">(ข)</span>
                <div className="flex-1 text-justify leading-relaxed">
                  ร่วมกันแก้ไขข้อความ และข้อตกลงที่เป็นโมฆะ ไม่สมบูรณ์ หรือไม่มีผลบังคับใช้ ให้สมบูรณ์และสอดคล้องกับบทบัญญัติแห่งกฎหมายและวัตถุประสงค์ของสัญญาฉบับนี้
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">13. การแก้ไขสัญญา</div>
            <div className="text-justify leading-relaxed">
              รายละเอียดในสัญญาฉบับนี้ คู่สัญญาฝ่ายใดฝ่ายหนึ่งจะเปลี่ยนแปลงหรือแก้ไขโดยไม่ได้รับการยินยอมเป็นลายลักษณ์อักษรจากคู่สัญญาอีกฝ่ายมิได้ เว้นแต่การเปลี่ยนแปลงและแก้ไขนั้น จะได้ทำเป็นลายลักษณ์อักษร และลงนามโดยคู่สัญญาทั้งสองฝ่ายตามสัญญาฉบับนี้ และให้ถือว่าการแก้ไขสัญญาดังกล่าวเป็นส่วนหนึ่งของสัญญาฉบับนี้
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">14. กฎหมายที่ใช้บังคับ</div>
            <div className="text-justify leading-relaxed">
              สัญญาฉบับนี้ให้ใช้บังคับและตีความตามกฎหมายไทย ข้อพิพาท ข้อโต้แย้ง หรือสิทธิเรียกร้องใด ๆ ที่เกิดจากหรือที่เกี่ยวกับสัญญาฉบับนี้ซึ่งไม่สามารถตกลงกันได้ระหว่างคู่สัญญาให้นำเสนอต่อศาลไทยที่มีเขตอำนาจ
            </div>
          </div>

          <div className="text-center italic mt-12 pb-8">
            (คู่สัญญาลงนามในหน้าถัดไป)
          </div>
        </div>

        <PageFooter pageNum={12} />
      </div>

    {/* Page Break for Print */ }
    <div className = "hidden print:block page-break"></div>

      {/* Page 13: Signatures */ }
      <div className = "print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="text-justify leading-relaxed indent-16">
            สัญญาฉบับนี้ทำขึ้นมา 2 (สอง) ฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาทั้งสองฝ่ายได้อ่านข้อความในสัญญาเพื่อเป็นหลักฐานในการทำสัญญาฉบับนี้ คู่สัญญาทั้งสองฝ่ายได้ลงนามในสัญญาฉบับนี้ต่อหน้าพยาน ณ วันที่ซึ่งได้ระบุไว้ในหน้าแรกของสัญญาฉบับนี้
          </div>

          <div className="mt-8 border border-black divide-x divide-black grid grid-cols-2 text-[14px] leading-relaxed">
            {/* Left Column: Party 1 */}
            <div className="p-6 flex flex-col min-h-[600px]">
              <div className="font-bold mb-8 flex flex-col">
                <span>คู่สัญญาฝ่ายที่ 1 :</span>
                <span>{agileInfo.companyName}</span>
              </div>
              
              <div className="space-y-16 mt-8">
                <div className="flex flex-col items-center">
                  <div className="border-b border-black w-4/5 h-8 mb-2"></div>
                  <div className="text-center">ชื่อ: {agileInfo.directors.split(' และ ')[0]}</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="border-b border-black w-4/5 h-8 mb-2"></div>
                  <div className="text-center">ชื่อ: {agileInfo.directors.split(' และ ')[1]}</div>
                </div>
              </div>

              <div className="mt-12 text-center space-y-1">
                <div className="font-bold">ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                <div className="font-bold">{agileInfo.companyName}</div>
              </div>

              <div className="mt-auto pt-16">
                <div className="font-bold mb-8">พยาน:</div>
                <div className="flex flex-col items-center">
                  <div className="border-b border-black w-4/5 mb-2 h-8"></div>
                  <div className="text-center">( <span className="inline-block w-40"></span> )</div>
                </div>
              </div>
            </div>

            {/* Right Column: Party 2 */}
            <div className="p-6 flex flex-col min-h-[600px]">
              <div className="font-bold mb-8 flex flex-col">
                <Highlight>
                  <span>คู่สัญญาฝ่ายที่ 2 :</span>
                  <br />
                  <span>{tkInfo.companyName}</span>
                </Highlight>
              </div>
              
              <div className="space-y-16 mt-8">
                <div className="flex flex-col items-center">
                  <div className="border-b border-black w-4/5 h-8 mb-2"></div>
                  <div className="text-center">ชื่อ: <Highlight>{tkInfo.directors.split(' และ ')[0]}</Highlight></div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="border-b border-black w-4/5 h-8 mb-2"></div>
                  <div className="text-center">ชื่อ: <Highlight>{tkInfo.directors.split(' และ ')[1]}</Highlight></div>
                </div>
              </div>

              <div className="mt-12 text-center space-y-1">
                <div className="font-bold">
                  <Highlight>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</Highlight>
                </div>
                <div className="font-bold">
                  <Highlight>{tkInfo.companyName}</Highlight>
                </div>
              </div>

              <div className="mt-auto pt-16">
                <div className="font-bold mb-8">พยาน:</div>
                <div className="flex flex-col items-center">
                  <div className="border-b border-black w-4/5 mb-2 h-8"></div>
                  <div className="text-center">( <span className="inline-block w-40"></span> )</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={13} />
      </div>

    {/* Page Break for Print */ }
    <div className = "hidden print:block page-break"></div>

      {/* Page 14: Annex 1 */ }
      <div className = "print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="flex flex-col items-center mb-12">
          <div className="font-bold">เอกสารแนบท้ายหมายเลข 1</div>
          <div className="font-bold uppercase underline">การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน</div>
        </div>

        <div className="space-y-6">
          <div className="font-bold">1. การจัดหาลูกค้าและจัดทำสัญญาทางการเงิน</div>
          
          <div className="space-y-4">
            {[ 
              { id: '1.1.', text: 'จัดหาลูกค้าและให้คำปรึกษาแก่ลูกค้าในการออกแบบแผนธุรกิจ โครงสร้างการจัดหาเงินทุน เงื่อนไขทางการเงิน การประสานงานกับผู้ผลิตเครื่องจักร รายละเอียดของเครื่องจักร' },
              { id: '1.2.', text: 'ทำความรู้จักลูกค้า (Know Your Customer – KYC) และ ตรวจสอบเพื่อทราบข้อเท็จจริงเกี่ยวกับลูกค้า (Customer Due Diligence - CDD) และจัดทำสรุปการตรวจสอบอย่างย่อให้แก่คู่สัญญา' },
              { id: '1.3.', text: 'ดำเนินการจัดเตรียมเอกสารที่จำเป็นและประสานงานกับบุคคลภายนอก ซึ่งรวมถึงแต่ไม่จำกัดเพียง ผู้ผลิตเครื่องจักร เพื่อประโยชน์ของลูกค้าในการเข้าทำสัญญาทางการเงิน' },
              { id: '1.4.', text: 'เข้าตรวจสอบโรงงาน และ/หรือ สถานที่ประกอบการของลูกค้าเพื่อประกอบการพิจารณาเข้าทำสัญญาทางการเงิน' },
              { id: '1.5.', text: 'ตรวจสอบรายละเอียดของทรัพย์สินหลักประกันและรายงานการประเมินมูลค่าทรัพย์สินของทรัพย์สินหลักประกัน' },
              { id: '1.6.', text: 'เจรจากับลูกค้าในเบื้องต้น และจัดทำสรุปสาระสำคัญของข้อตกลงและเงื่อนไข (Term sheet) และประมาณการทางการเงินอย่างย่อ เพื่อนำส่งให้แก่คู่สัญญา' },
              { id: '1.7.', text: 'ให้ความช่วยเหลือลูกค้าในการประสานงานกับคู่สัญญา และ/หรือ ตัวแทนของคู่สัญญา เพื่อให้สามารถบรรลุข้อตกลงและลงนามสัญญาทางการเงินให้แล้วเสร็จ' },
              { id: '1.8.', text: 'ดำเนินการจัดเตรียมเอกสารที่เกี่ยวข้องกับการรับจำนองทรัพย์สินหลักประกันให้แก่คู่สัญญาและดำเนินการจดทะเบียนจำนองทรัพย์สินหลักประกันกับหน่วยงานราชการที่เกี่ยวข้อง' },
              { id: '1.9.', text: 'ตรวจสอบความถูกต้องของเอกสารที่ได้รับจากลูกค้าเพื่อประโยชน์ในการเข้าทำสัญญาทางการเงิน' },
              { id: '1.10.', text: 'ดำเนินการนำส่งมอบเช็ค และ/หรือ เช็คสั่งจ่ายล่วงหน้าที่ได้รับจากลูกค้าให้แก่คู่สัญญา' },
              { id: '1.11.', text: 'ดำเนินการอื่นใดที่เกี่ยวข้องกับการจัดหาลูกค้าและจัดทำสัญญาทางการเงินตามที่คู่สัญญาฝ่ายที่ 2 จะแจ้งเป็นครั้งคราว' }
            ].map(clause => (
              <div key={clause.id} className="flex gap-4">
                <span className="shrink-0 w-10">{clause.id}</span>
                <div className="flex-1 text-justify leading-relaxed">
                  {clause.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <PageFooter pageNum={14} />
      </div>

    {/* Page Break for Print */ }
    <div className = "hidden print:block page-break"></div>

      {/* Page 15: Annex 1 Cont. */ }
      <div className = "print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="font-bold">2. การบริหารจัดการสัญญาทางการเงินให้แก่คู่สัญญา</div>
          
          <div className="space-y-4">
            {[ 
              { id: '2.1.', text: 'แจ้งข่าวสาร และ/หรือ ข้อมููลที่ถูกต้อง จำเป็น และเกี่ยวข้องกับสัญญาทางการเงินให้แก่คู่สัญญาทราบอยู่เสมอ' },
              { id: '2.2.', text: 'ติดตาม ดูแล และประสานงานกับลูกค้าเพื่อให้ลูกค้าปฏิบัติให้เป็นไปตามสัญญาทางการเงิน' },
              { id: '2.3.', text: 'ดำเนินการเป็นตัวแทนสินเชื่อหรือตัวแทนเช่าซื้อเพื่อให้คู่สัญญาปฏิบัติให้เป็นไปตามสัญญาทางการเงิน' },
              { id: '2.4.', text: 'รวบรวมใบแจ้งหนี้จากคู่สัญญาและนำส่งให้แก่ลูกค้า' },
              { id: '2.5.', text: 'นำส่งรายการค่าใช้จ่ายอื่น ๆ ที่เกี่ยวข้องกับการบริหารจัดการสัญญาทางการเงินให้แก่คู่สัญญา' },
              { id: '2.6.', text: 'ดำเนินการติดตามและตรวจสอบสภาพทรัพย์สินที่ให้เช่าซื้อ และ/หรือ ทรัพย์สินที่เป็นหลักประกัน ไม่ว่าด้วยวิธีการใด หรือด้วยวิธีการเข้าตรวจสอบ ณ โรงงาน และ/หรือ สถานที่ประกอบการของลูกค้า' },
              { id: '2.7.', text: 'แจ้งให้คู่สัญญาทราบในทันทีที่ทราบถึงเหตุที่อาจทำให้เกิดเหตุแห่งการผิดสัญญาหรือเกิดเหตุแห่งการผิดสัญญา' },
              { id: '2.8.', text: 'ดำเนินการติดตามและตรวจสอบมููลค่าของทรัพย์สินหลักประกัน โดยหากมีมููลค่าลดลงน้อยกว่าที่กำหนดในสัญญาทางการเงิน จะต้องประสานงานกับลูกค้าให้ดำเนินการเพิ่มทรัพย์สินหลักประกันเพื่อประโยชน์ของคู่สัญญา' },
              { id: '2.9.', text: 'ดำเนินการติดตาม ทวงถามหนี้ตามสัญญาทางการเงิน การออกหนังสือบอกกล่าวทวงถาม (โนติส) การฟ้องร้องดำเนินคดี ทั้งศาลในชั้นต้น อุทธรณ์ ฎีกา งานสืบทรัพย์ บังคับคดี รวมไปถึงการจัดหาทีมกฎหมาย ทนายความ และการอื่นใดที่เกี่ยวข้องจนเสร็จการ ตามเงื่อนไขที่คู่สัญญากำหนดภายใต้สัญญาฉบับนี้' },
              { id: '2.10.', text: 'ดำเนินการแบ่งทรัพย์สินที่ได้จากการบังคับคดีให้แก่คู่สัญญาตามเงื่อนไขที่คู่สัญญากำหนดภายใต้สัญญาฉบับนี้' },
              { id: '2.11.', text: 'ดำเนินการอื่นใดที่เกี่ยวข้องกับการบริหารจัดการสัญญาทางการเงินให้แก่คู่สัญญาตามที่คู่สัญญาฝ่ายที่ 2 จะแจ้งเป็นครั้งคราว' }
            ].map(clause => (
              <div key={clause.id} className="flex gap-4">
                <span className="shrink-0 w-10">{clause.id}</span>
                <div className="flex-1 text-justify leading-relaxed">
                  {clause.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <PageFooter pageNum={15} />
      </div>

    {/* Page Break for Print */ }
    <div className = "hidden print:block page-break"></div>

      {/* Page 16: Annex 1 Cont. */ }
      <div className = "print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 mt-8">
          <div className="font-bold">3. ข้อตกลงกระทำการของผู้ให้บริการ</div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="shrink-0 w-10">3.1.</span>
              <div className="flex-1 text-justify leading-relaxed">
                คู่สัญญาฝ่ายที่ 1 ในฐานะผู้ให้บริการ ("ผู้ให้บริการ") ตกลงให้บริการตามข้อ 1. และ/หรือ ข้อ 2. ข้างต้น ภายใต้เงื่อนไขที่กำหนดในสัญญาฉบับนี้ ทั้งนี้ การใดที่ขัดหรือแย้งกับเงื่อนไขที่กำหนดในสัญญาฉบับนี้ ให้ถือว่าไม่มีผลผูกพันคู่สัญญาฝ่ายที่ 2 และให้มีผลผูกพันเฉพาะคู่สัญญาฝ่ายที่ 1
              </div>
            </div>

            <div className="flex gap-4">
              <span className="shrink-0 w-10">3.2.</span>
              <div className="flex-1 text-justify leading-relaxed">
                ผู้ให้บริการตกลงรับผิดชดใช้ต่อคู่สัญญาฝ่ายที่ 2 ในค่าเสียหาย และค่าใช้จ่ายใด ๆ ที่เกิดขึ้นจริงจากการปฏิบัติผิดสัญญาทางการเงินอันเนื่องมาจากความบกพร่องในการปฏิบัติหน้าที่ ไม่ปฏิบัติตามหน้าที่ หรือปฏิบัติหน้าที่ผิดพลาด หรือที่เกิดจากความประมาทเลินเล่อของผู้ให้บริการ ซึ่งทำให้มีกรณีพิพาทหรือความเสียหายใด ๆ เกิดขึ้นกับคู่สัญญาฝ่ายที่ 2 หรือคู่สัญญาฝ่ายที่ 2 ถูกฟ้องร้องดำเนินคดีหรือต้องชำระค่าเสียหายใด ๆ โดยผู้ให้บริการตกลงยินยอมรับผิดชอบชดใช้ค่าเสียหาย ซึ่งรวมถึงค่าใช้จ่ายในการดำเนินคดี ค่าจ้างทนายความ เพื่อแก้ไขข้อพิพาทหรือต่อสู้คดีดังกล่าว
              </div>
            </div>

            <div className="flex gap-4">
              <span className="shrink-0 w-10">3.3.</span>
              <div className="flex-1 text-justify leading-relaxed">
                ผู้ให้บริการจะปฏิบัติหน้าที่ในฐานะที่เป็นผู้ที่มีวิชาชีพซึ่งได้รับความไว้วางใจ ด้วยความระมัดระวัง ซื่อสัตย์สุจริต เพื่อประโยชน์ที่ดีที่สุดของคู่สัญญาทั้งสองฝ่ายโดยรวม และเป็นไปตามสัญญาฉบับนี้และกฎหมายที่เกี่ยวข้อง รวมถึงมติของคู่สัญญาภายใต้สัญญาฉบับนี้
              </div>
            </div>

            <div className="flex gap-4">
              <span className="shrink-0 w-10">3.4.</span>
              <div className="flex-1 text-justify leading-relaxed">
                ผู้ให้บริการไม่สามารถมอบหมายช่วงหน้าที่ตามข้อ 1. และ/หรือ ข้อ 2. ข้างต้น ให้แก่บุคคลอื่นได้ เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากคู่สัญญาฝ่ายที่ 2
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={16} />
      </div>

    {/* Page Break for Print */ }
    <div className = "hidden print:block page-break"></div>

      {/* Page 17: Annex No. 2 */ }
      <div className = "print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="text-center font-bold mb-8">
          <div>เอกสารแนบท้ายหมายเลข 2</div>
          <div>ค่าตอบแทนที่เกี่ยวข้องกับการให้บริการ</div>
        </div>

        <div className="space-y-6 font-normal">
          <div className="grid grid-cols-[30px_1fr] gap-2">
            <span className="font-bold underline">1.</span>
            <div className="space-y-4">
              <span className="font-bold underline">ค่าตอบแทนการจัดหาลูกค้า (Origination Fee)</span>

              <div className="text-justify leading-loose">
                เนื่องจากผู้รับจ้างรับหน้าที่และให้บริการในการจัดหาลูกค้า ตามที่ระบุในข้อ 1. ของ <u>เอกสารแนบท้ายหมายเลข 1</u> (การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน) ดังนั้น คู่สัญญาทั้งสองฝ่ายตกลงให้ผู้ว่าจ้างเป็นผู้ชำระค่าตอบแทนให้แก่ผู้รับจ้าง
                <span className="bg-[#ccffcc] print:bg-transparent px-1"> ในอัตราร้อยละ {saData.originationFeeRate} ({translateRateToThai(saData.originationFeeRate)})</span> ของจำนวนเงินที่ผู้ว่าจ้างให้การสนับสนุนทางการเงินแก่ลูกค้าในสัญญาทางการเงิน
                <span className="bg-[#ccffcc] print:bg-transparent px-1"> โดยแบ่งชำระเป็น {saData.agreementOriginationFeePeriods?.[selectedAgreements[0]?.id] || 0} ({translateNumberToThai(saData.agreementOriginationFeePeriods?.[selectedAgreements[0]?.id] || 0)}) งวด</span> โดย {selectedAgreements.map((a, idx) => {
                  const label = CONTRACT_TYPE_LABELS[a.type as ContractType] || a.type;
                  const date = saData.agreementFirstDates?.[a.id] || '';
                  return (
                    <span key={a.id}>
                      {idx + 1}. {label} เลขที่ {a.data.contractNo}
                      <span className="bg-yellow-200 print:bg-transparent px-1 mx-1 flex-inline"> เริ่มต้นงวดแรกในวันที่ {formatThaiDate(date)}</span>
                      {idx <selectedAgreements.length - 1 ? ' ' : ''}
                    </span>
                  );
                })} รายละเอียดปรากฏตามตารางที่แนบนมาด้วยนี้
              </div>

              {/* Only Table 1.1 on this page */}
              {selectedAgreements.length > 0 && renderAgreementTable(selectedAgreements[0], 0)}
            </div>
          </div>
        </div>

        <PageFooter pageNum={17} />
      </div>

    {/* Page 18: Remaining Tables (if multiple agreements) */ }
  {
    selectedAgreements.length > 1 && (
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />
        <div className="space-y-6 font-normal pt-8">
          <div className="grid grid-cols-[30px_1fr] gap-2">
            <div />
            <div className="space-y-6">
              {selectedAgreements.slice(1).map((agreement, idx) =>
                renderAgreementTable(agreement, idx + 1)
              )}
            </div>
          </div>
        </div>
        <PageFooter pageNum={18} />
      </div>
    )
  }

  {/* Next Page: Annex No. 2 Item 2 (Service Fee) */ }
  <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
    <PageHeader />

    <div className="space-y-6 font-normal">
      <div className="space-y-4 text-[12px] leading-relaxed mb-6">
        <div className="text-justify">
          ทั้งนี้ ในกรณีที่วันครบกำหนดชำระค่าตอบแทนไม่ใช่วันที่ธนาคารเปิดดำเนินการเพื่อประกอบธุรกิจเป็นการทั่วไปในประเทศไทย ("วันทำการ") ให้คู่สัญญาฝ่ายที่ 2 ชำระเงินดังกล่าวในวันทำการแรกถัดจากวันที่กำหนดให้ชำระค่าตอบแทน
        </div>
        <div className="text-justify">
          อนึ่ง ตลอดระยะเวลาของสัญญานี้ คู่สัญญาฝ่ายที่ 2 ตกลงรับผิดชอบภาษีมูลค่าเพิ่ม (Value Added Tax) และอากรแสตมป์ (Stamp Duty) และมีสิทธิหักภาษีหักเงินได้ ณ ที่จ่าย (Withholding tax) ในอัตราเท่ากับร้อยละ 3 (สาม) ของค่าตอบแทนข้างต้นหรือตามอัตราอื่นใดที่กำหนดโดยหน่วยงานที่เกี่ยวข้องในระยะเวลานั้นๆ
        </div>
      </div>

      <div className="pl-8 flex gap-2 pt-4">
        <span className="shrink-0 font-bold underline">2.</span>
        <div className="text-justify">
          <span className="font-bold underline">ค่าตอบแทนการบริหารจัดการลูกค้า (Service Fee)</span>
          <div className="mt-4 leading-loose">
            เนื่องจากผู้รับจ้าง รับหน้าที่และให้บริการในการบริหารจัดการลูกค้า ตามที่ระบุในข้อ 2. ของ <u>เอกสารแนบท้ายหมายเลข 1</u> (การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน) ดังนั้น คู่สัญญาทั้งสองฝ่ายตกลงให้ผู้ว่าจ้าง เป็นผู้ชำระค่าตอบแทนให้แก่ผู้รับจ้าง <span className="bg-[#ccffcc] print:bg-transparent px-1">ในอัตราร้อยละ {saData.serviceFeeRate} ({translateRateToThai(saData.serviceFeeRate)})</span> ต่อปี ของจำนวนเงินที่ผู้ว่าจ้าง ให้การสนับสนุนทางการเงินแก่ลูกค้าในสัญญาทางการเงิน <span className="bg-yellow-200 print:bg-transparent px-1">โดยกำหนดชำระเป็นรายเดือน ตลอดอายุสัญญาฉบับนี้</span> รายละเอียดปรากฏตามตารางที่แนบนมาด้วยนี้
          </div>
        </div>
      </div>
    </div>

    <PageFooter pageNum={selectedAgreements.length > 1 ? 19 : 18} />
  </div>

  {/* Pages 19/20+: Service Fee Schedules per contract */ }
  {
    (() => {
      let currentPageOffset = 0;

      const renderClosingText = () => (
        <div className="mt-8 space-y-4 font-normal text-[12px]">
          <div className="text-justify">
            ทั้งนี้ ในกรณีที่วันครบกำหนดชำระค่าตอบแทนไม่ใช่วันทำการ ให้คู่สัญญาฝ่ายที่ 2 ชำระเงินดังกล่าวในวันทำการแรกถัดจากวันที่กำหนดให้ชำระค่าตอบแทน
          </div>
          <div className="text-justify">
            อนึ่ง ตลอดระยะเวลาของสัญญานี้ คู่สัญญาฝ่ายที่ 2 ตกลงรับผิดชอบภาษีมูลค่าเพิ่ม (Value Added Tax) และอากรแสตมป์ (Stamp Duty) และมีสิทธิหักภาษีหักเงินได้ ณ ที่จ่าย (Withholding tax) ในอัตราเท่ากับร้อยละ 3 (สาม) ของค่าตอบแทนข้างต้นหรือตามอัตราอื่นใดที่กำหนดโดยหน่วยงานที่เกี่ยวข้องในระยะเวลานั้นๆ
          </div>
        </div>
      );

      return selectedAgreements.map((agreement, idx) => {
        const { part1, part2 } = renderServiceFeeTable(agreement, idx);
        const basePageNum = (selectedAgreements.length > 1 ? 20 : 19) + idx + currentPageOffset;
        const isLastAgreement = idx === selectedAgreements.length - 1;

        const pages = [];

        // Page 1 for this agreement
        pages.push(
          <div key={`sf-schedule-${agreement.id}-p1`} className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
            <PageHeader />
            {part1}
            {isLastAgreement && !part2 && renderClosingText()}
            <PageFooter pageNum={basePageNum} />
          </div>
        );

        // Page 2 for this agreement (if periods > 48)
        if (part2) {
          currentPageOffset += 1;
          pages.push(
            <div key={`sf-schedule-${agreement.id}-p2`} className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
              <PageHeader />
              {part2}
              {isLastAgreement && renderClosingText()}
              <PageFooter pageNum={basePageNum + 1} />
            </div>
          );
        }

        return pages;
      });
    })()
  }
    </div>
  );
}
