import PageHeader from './PageHeader';
import type { ServiceAgreementData, AppData, ContractType } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import { formatThaiDate, formatThaiDateShort, addMonths } from '../utils/thaiDate';
import { thaiBahtText } from '../utils/thaiBahtText';

interface Props {
  data: ServiceAgreementData;
  appData: AppData;
}

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-yellow-200 print:bg-transparent py-0.5 rounded inline break-words">
    {children || '\u00A0'}
  </span>
);

export default function ServiceAgreementPreview({ data, appData }: Props) {
  const formatCurrency = (value: string | number) => {
    if (value === undefined || value === null || value === '') return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return value.toString();
    if (num % 1 === 0) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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

  const getPriceAndVat = (totalStr: string) => {
    const total = parseFloat(totalStr.replace(/,/g, '')) || 0;
    const price = total / 1.07;
    const vat = total - price;
    return { price, vat, total };
  };

  const fee21 = getPriceAndVat(data.originationFeeTotal);
  const fee22 = getPriceAndVat(data.serviceFeeTotal);
  const grandTotal = {
    price: fee21.price + fee22.price,
    vat: fee21.vat + fee22.vat,
    total: fee21.total + fee22.total
  };

  const selectedAgreements = appData.agreements.filter(a => data.selectedAgreementIds.includes(a.id));

  const contractListText = selectedAgreements.map(a => {
    const label = CONTRACT_TYPE_LABELS[a.type as ContractType] || a.type;
    return `${label} เลขที่ ${a.data.contractNo}`;
  }).join(' , ');

  const serviceFeeAdditionalPages = selectedAgreements.reduce((acc, a) => {
    const p = data.agreementServiceFeePeriods?.[a.id] || 0;
    return acc + (p > 48 ? 1 : 0);
  }, 0);
  const totalPages = (selectedAgreements.length > 1 ? 8 : 7) + selectedAgreements.length + serviceFeeAdditionalPages;

  const renderServiceFeeTable = (agreement: any, agreeIdx: number) => {
    const label = CONTRACT_TYPE_LABELS[agreement.type as ContractType] || agreement.type;
    const firstDate = data.agreementServiceFeeFirstDates?.[agreement.id] || '';
    const installmentAmountStr = data.agreementServiceFeeAmounts?.[agreement.id] || '0';
    const periods = data.agreementServiceFeePeriods?.[agreement.id] || 0;
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
    const firstDate = data.agreementFirstDates?.[agreement.id] || '';
    const installmentAmountStr = data.agreementInstallmentAmounts?.[agreement.id] || '0';
    const periods = data.agreementOriginationFeePeriods?.[agreement.id] || 0;
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
        <div className="font-bold text-justify">
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

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line space-y-8 print:space-y-0 mx-auto">
      {/* Page 1 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-xl">สัญญาจ้างบริการ</h2>
        </div>

        <div className="text-center mb-10">
          วันที่ <Highlight>{formatThaiDate(data.contractDate)}</Highlight>
        </div>

        <div className="indent-10 mb-6 font-normal">
          สัญญาจ้างบริการฉบับนี้ทำขึ้นระหว่าง <Highlight>{appData.tkInfo.companyName}</Highlight> โดย <Highlight>{appData.tkInfo.directors}</Highlight> กรรมการผู้มีอำนาจ มีสำนักงานใหญ่ตั้งอยู่เลขที่ <Highlight>{appData.tkInfo.address}</Highlight> ซึ่งต่อไปนี้ในสัญญาจะเรียกว่า “ผู้ว่าจ้าง” กับ <Highlight>{appData.agileInfo.companyName}</Highlight> โดย <Highlight>{appData.agileInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท มีสำนักงานใหญ่ตั้งอยู่เลขที่ <Highlight>{appData.agileInfo.address}</Highlight> ซึ่งต่อไปนี้ในสัญญาจะเรียกว่า “ผู้รับจ้าง” ทั้งสองฝ่ายได้ทำสัญญาจ้างบริการโดยมีข้อความดังต่อไปนี้
        </div>

        <div className="space-y-6 font-normal">
          <div>
            ข้อ 1. ผู้ว่าจ้างตกลงจ้างและผู้รับจ้างตกลงรับจ้างจัดหาลูกค้า จัดทำสัญญาทางการเงิน และบริหารจัดการสัญญาทางการเงินให้แก่ผู้ว่าจ้าง เพื่อให้ผู้ว่าจ้างสนับสนุนทางการเงินในสัญญาทางการเงิน
          </div>

          <div className="space-y-4">
            <div>ข้อ 2. ผู้ว่าจ้างตกลงให้ค่าตอบแทนให้แก่ผู้รับจ้างดังต่อไปนี้</div>

            <div className="pl-8 flex gap-2">
              <span className="shrink-0">2.1</span>
              <div>
                ค่าตอบแทนการจัดหาลูกค้า (Origination Fee) ที่ผู้รับจ้างได้จัดหามาให้แก่ผู้ว่าจ้าง ตาม {contractListText} <b>(“สัญญาทางการเงิน”)</b> ค่าบริการ {formatCurrency(fee21.price)} บาท ภาษีมูลค่าเพิ่ม {formatCurrency(fee21.vat)} บาท รวมทั้งหมด {formatCurrency(fee21.total)} บาท
              </div>
            </div>

            <div className="pl-8 flex gap-2">
              <span className="shrink-0">2.2</span>
              <div>
                ค่าตอบแทนการบริหารจัดการลูกค้า (Service Fee) ที่ผู้รับจ้างได้บริการให้แก่ผู้ว่าจ้าง ตาม {contractListText} <b>(“สัญญาทางการเงิน”)</b> ค่าบริการ {formatCurrency(fee22.price)} บาท ภาษีมูลค่าเพิ่ม {formatCurrency(fee22.vat)} บาท รวมทั้งหมด {formatCurrency(fee22.total)} บาท
              </div>
            </div>

            <div className="pl-8 flex gap-3 font-bold">
              <span className="shrink-0">2.3</span>
              <div className="underline decoration-dotted underline-offset-4">
                รวมค่าตอบแทนทั้งหมดตาม ข้อ 2.1 และ ข้อ 2.2 ค่าบริการ {formatCurrency(grandTotal.price)} บาท ภาษีมูลค่าเพิ่ม {formatCurrency(grandTotal.vat)} บาท รวมทั้งหมด {formatCurrency(grandTotal.total)} บาท
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>สัญญาจ้างบริการ</div>
          <div>หน้า 1 จาก {totalPages}</div>
        </div>
      </div>

      {/* Page 2 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-6 font-normal">
          <div className="pl-8 flex gap-2">
            <span className="shrink-0">2.4</span>
            <div>
              ชำระงวดแรก <Highlight>{formatThaiDateShort(data.firstInstallmentDate)}</Highlight> งวดสุดท้าย <Highlight>{formatThaiDateShort(data.lastInstallmentDate)}</Highlight>
            </div>
          </div>

          <div className="indent-10">
            รายละเอียดในการชำระค่าจ้าง ให้เป็นไปตามค่าตอบแทนที่เกี่ยวข้องกับการให้บริการเอกสารแนบท้ายสัญญาจ้างบริการฉบับนี้ และให้ถือว่าเอกสารดังกล่าวเป็นส่วนหนึ่งของสัญญาจ้างบริการฉบับนี้
          </div>

          <div>
            ข้อ 3. หากผู้ว่าจ้างผิดนัดไม่ชำระค่าจ้างตามข้อ 2. ให้กับผู้รับจ้าง ถือว่าผู้ว่าจ้างผิดนัดทั้งหมด ผู้ว่าจ้างตกลงที่จะยอมรับผิดชำระดอกเบี้ยให้กับผู้รับจ้างในอัตราร้อยละ 15 ต่อปี ของต้นเงินที่ค้างชำระทั้งหมด
          </div>

          <div>
            ข้อ 4. ในกรณีที่ผู้ว่าจ้างส่งเอกสาร หนังสือบอกกล่าวทวงถาม หรือหนังสือใดๆ ให้แก่ผู้รับจ้าง ตามสถานที่อยู่ของผู้รับจ้างตามสัญญานี้โดยไม่ต้องคำนึงว่าจะมีผู้รับหรือไม่ หรือแม้หากส่งไม่ได้เพราะผู้รับจ้าง ย้ายที่อยู่ หรือสถานที่ดังกล่าวนั้นเปลี่ยนแปลงไป หรือถูกรื้อถอนไป หรือถูกไฟไหม้ หรือส่งไม่ได้เพราะหาสถานที่ตามที่ระบุไว้ไม่พบ ก็ให้ถือว่าผู้รับจ้าง ได้รับเอกสารหรือหนังสือดังกล่าวไว้โดยชอบแล้ว
          </div>

          <div className="indent-10 py-4">
            สัญญาฉบับนี้ทำขึ้นเป็นสองฉบับมีข้อความถูกต้องตรงกัน คู่สัญญาต่างได้อ่านและเข้าใจข้อความในสัญญานี้ดีแล้ว จึงได้ลงลายมือชื่อไว้ต่อหน้าพยานเป็นสำคัญ
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 space-y-16">
          <div className="grid grid-cols-1 gap-12">
            <div className="flex flex-col items-center mx-auto w-2/3">
              <div className="w-full flex items-baseline gap-2">
                <span>ลงชื่อ</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
                <span>ผู้ว่าจ้าง</span>
              </div>
              <div className="mt-4 text-center text-sm">
                <div>{appData.tkInfo.companyName}</div>
                <div className="mt-2 text-sm">โดย {appData.tkInfo.directors}</div>
              </div>
            </div>

            <div className="flex flex-col items-center mx-auto w-2/3">
              <div className="w-full flex items-baseline gap-2">
                <span>ลงชื่อ</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
                <span>ผู้รับจ้าง</span>
              </div>
              <div className="mt-4 text-center text-sm">
                <div>{appData.agileInfo.companyName}</div>
                <div className="mt-2 text-sm">โดย {appData.agileInfo.directors}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 pt-8">
            <div className="flex flex-col items-center">
              <div className="w-full flex items-baseline gap-2">
                <span>ลงชื่อ</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
                <span>พยาน</span>
              </div>
              <div className="mt-2 text-sm">( <span className="inline-block w-[150px]"></span> )</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full flex items-baseline gap-2">
                <span>ลงชื่อ</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
                <span>พยาน</span>
              </div>
              <div className="mt-2 text-sm">( <span className="inline-block w-[150px]"></span> )</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>สัญญาจ้างบริการ</div>
          <div>หน้า 2 จาก {totalPages}</div>
        </div>
      </div>

      {/* Page 3: Annex Pt. 1 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="text-center font-bold mb-8">
          <div>เอกสารแนบท้ายหมายเลข 1</div>
          <div>การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน</div>
        </div>

        <div className="space-y-4 font-normal">
          <div className="font-bold underline">1. การจัดหาลูกค้าและจัดทำสัญญาทางการเงิน</div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.1.</span>
            <div className="text-justify">จัดหาลูกค้าและให้คำปรึกษาแก่ลูกค้าในการออกแบบแผนธุรกิจ โครงสร้างการจัดหาเงินทุน เงื่อนไขทางการเงิน การประสานงานกับผู้ผลิตเครื่องจักร รายละเอียดของเครื่องจักร</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.2.</span>
            <div className="text-justify">ทำความรู้จักลูกค้า (Know Your Customer – KYC) และ ตรวจสอบเพื่อทราบข้อเท็จจริงเกี่ยวกับลูกค้า (Customer Due Diligence - CDD) และจัดทำสรุปการตรวจสอบอย่างย่อให้แก่คู่สัญญา</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.3.</span>
            <div className="text-justify">ดำเนินการจัดเตรียมเอกสารที่จำเป็นและประสานงานกับบุคคลภายนอก ซึ่งรวมถึงแต่ไม่จำกัดเพียง ผู้ผลิตเครื่องจักร เพื่อประโยชน์ของลูกค้าในการเข้าทำสัญญาทางการเงิน</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.4.</span>
            <div className="text-justify">เข้าตรวจสอบโรงงาน และ/หรือ สถานที่ประกอบการของลูกค้าเพื่อประกอบการพิจารณาเข้าทำสัญญาทางการเงิน</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.5.</span>
            <div className="text-justify">ตรวจสอบรายละเอียดของทรัพย์สินหลักประกันและรายงานการประเมินมูลค่าทรัพย์สินของทรัพย์สินหลักประกัน</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.6.</span>
            <div className="text-justify">เจรจากับลูกค้าในเบื้องต้น และจัดทำสรุปสาระสำคัญของข้อตกลงและเงื่อนไข (Term sheet) และประมาณการทางการเงินอย่างย่อ เพื่อนำส่งให้แก่คู่สัญญา</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.7.</span>
            <div className="text-justify">ให้ความช่วยเหลือลูกค้าในการประสานงานกับคู่สัญญา และ/หรือ ตัวแทนของคู่สัญญา เพื่อให้สามารถบรรลุข้อตกลงและลงนามสัญญาทางการเงินให้แล้วเสร็จ</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.8.</span>
            <div className="text-justify">ดำเนินการจัดเตรียมเอกสารที่เกี่ยวข้องกับการรับจำนองทรัพย์สินหลักประกันให้แก่คู่สัญญาและดำเนินการจดทะเบียนจำนองทรัพย์สินหลักประกันกับหน่วยงานราชการที่เกี่ยวข้อง</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.9.</span>
            <div className="text-justify">ตรวจสอบความถูกต้องของเอกสารที่ได้รับจากลูกค้าเพื่อประโยชน์ในการเข้าทำสัญญาทางการเงิน</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.10.</span>
            <div className="text-justify">ดำเนินการนำส่งมอบเช็ค และ/หรือ เช็คสั่งจ่ายล่วงหน้าที่ได้รับจากลูกค้าให้แก่คู่สัญญา</div>
          </div>

          <div className="grid grid-cols-[40px_1fr] gap-2 pl-4">
            <span>1.11.</span>
            <div className="text-justify">ดำเนินการอื่นใดที่เกี่ยวข้องกับการจัดหาลูกค้าและจัดทำสัญญาทางการเงินตามที่คู่สัญญาจะแจ้งเป็นครั้งคราว</div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>สัญญาจ้างบริการ</div>
          <div>หน้า 3 จาก {totalPages}</div>
        </div>
      </div>

      {/* Page 4: Annex Pt. 2 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-3 font-normal">
          <div className="space-y-1.5">
            <div className="font-bold underline">2. การบริหารจัดการสัญญาทางการเงินให้แก่คู่สัญญา</div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.1.</span>
              <div className="text-justify">แจ้งข่าวสาร และ/หรือ ข้อมูลที่ถูกต้อง จำเป็น และเกี่ยวเนื่องกับสัญญาทางการเงินให้แก่คู่สัญญาทราบอยู่เสมอ</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.2.</span>
              <div className="text-justify">ติดตาม ดูแล และประสานงานกับลูกค้าเพื่อให้ลูกค้าปฏิบัติให้เป็นไปตามสัญญาทางการเงิน</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.3.</span>
              <div className="text-justify">ดำเนินการเป็นตัวแทนสินเชื่อหรือตัวแทนเช่าซื้อเพื่อให้คู่สัญญาปฏิบัติให้เป็นไปตามสัญญาทางการเงิน</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.4.</span>
              <div className="text-justify">รวบรวมใบแจ้งหนี้จากคู่สัญญาและนำส่งให้แก่ลูกค้า</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.5.</span>
              <div className="text-justify">นำส่งรายการค่าใช้จ่ายอื่น ๆ ที่เกี่ยวข้องกับการบริหารจัดการสัญญาทางการเงินให้แก่คู่สัญญา</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.6.</span>
              <div className="text-justify">ดำเนินการติดตามและตรวจสอบสภาพทรัพย์สินที่ให้เช่าซื้อ และ/หรือ ทรัพย์สินที่เป็นหลักประกัน ไม่ว่าด้วยวิธีการใด หรือด้วยวิธีการเข้าตรวจสอบ ณ โรงงาน และ/หรือ สถานที่ประกอบการของลูกค้า</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.7.</span>
              <div className="text-justify">แจ้งให้คู่สัญญาทราบในทันทีที่ทราบถึงเหตุที่อาจทำให้เกิดเหตุแห่งการผิดสัญญาหรือเกิดเหตุแห่งการผิดสัญญา</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.8.</span>
              <div className="text-justify">ดำเนินการติดตามและตรวจสอบมูลค่าของทรัพย์สินหลักประกัน โดยหากมีมูลค่าลดน้อยกว่าที่กำหนดในสัญญาทางการเงิน จะต้องประสานงานกับลูกค้าให้ดำเนินการเพิ่มเติมทรัพย์สินหลักประกันเพื่อประโยชน์ของคู่สัญญา</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.9.</span>
              <div className="text-justify">ดำเนินการติดตาม ทวงถามหนี้ตามสัญญาทางการเงิน การออกหนังสือบอกกล่าวทวงถาม (โนติส) การฟ้องร้องดำเนินคดี ทั้งศาลในชั้นต้น อุทธรณ์ ฎีกา งานสืบทรัพย์ บังคับคดี รวมไปถึงการจัดหาทีมกฎหมาย ทนายความและการอื่นใดที่เกี่ยวข้องจนเสร็จการ ตามเงื่อนไขที่คู่สัญญากำหนด</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.10.</span>
              <div className="text-justify">ดำเนินการแบ่งทรัพย์สินที่ได้จากการบังคับคดีให้แก่คู่สัญญาตามเงื่อนไขที่คู่สัญญากำหนด</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>2.11.</span>
              <div className="text-justify">ดำเนินการอื่นใดที่เกี่ยวข้องกับการบริหารจัดการสัญญาทางการเงินให้แก่คู่สัญญาตามที่คู่สัญญาจะแจ้งเป็นครั้งคราว</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="font-bold underline">3. ข้อตกลงกระทำการของผู้รับจ้าง (“ผู้ให้บริการ”)</div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>3.1.</span>
              <div className="text-justify">ผู้ให้บริการตกลงให้บริการตามข้อ 1. และ/หรือ ข้อ 2. ข้างต้น ภายใต้เงื่อนไขที่กำหนดในสัญญาฉบับนี้ ทั้งนี้ การใดที่ขัดหรือแย้งกับเงื่อนไขที่กำหนดในสัญญาฉบับนี้ ให้ถือว่าไม่มีผลผูกพันคู่สัญญาและให้มีผลผูกพันเฉพาะผู้ให้บริการ</div>
            </div>

            <div className="grid grid-cols-[30px_1fr] gap-1 pl-4">
              <span>3.2.</span>
              <div className="text-justify">ผู้ให้บริการตกลงรับผิดชดใชต่อคู่สัญญาในค่าเสียหาย และค่าใช้จ่ายใด ๆ ที่เกิดขึ้นจริงจากการปฏิบัติผิดสัญญาทางการเงินอันเนื่องมาจากความบกพร่องในการปฏิบัติหน้าที่ ไม่ปฏิบัติตามหน้าที่ หรือปฏิบัติหน้าที่ที่ผิดพลาด หรือที่เกิดจากความประมาทเลินเล่อของผู้ให้บริการ ซึ่งทำให้มีกรณีพิพาทหรือความเสียหายใด ๆ เกิดขึ้นกับคู่สัญญา หรือคู่สัญญาถูกฟ้องร้องดำเนินคดีหรือต้องชำระค่าเสียหายใด ๆ โดยผู้ให้บริการตกลงยินยอมรับผิดชอบชดใช้ค่าเสียหาย ซึ่งรวมถึงค่าใช้จ่ายในการดำเนินคดี ค่าจ้างทนายความ เพื่อแก้ไขข้อพิพาทหรือต่อสู้คดีดังกล่าว</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>สัญญาจ้างบริการ</div>
          <div>หน้า 4 จาก {totalPages}</div>
        </div>
      </div>

      {/* Page 5: Annex Pt. 3 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
        <PageHeader />

        <div className="space-y-4 font-normal">
          <div className="grid grid-cols-[30px_1fr] gap-1.5 pl-4">
            <span>3.3.</span>
            <div className="text-justify">ผู้ให้บริการจะปฏิบัติหน้าที่ในฐานะที่เป็นผู้ที่มีวิชาชีพซึ่งได้รับความไววางใจ ด้วยความระมัดระวัง ซื่อสัตย์สุจริต เพื่อประโยชน์ที่ดีที่สุดของคู่สัญญาทั้งสองฝ่ายโดยรวม และเป็นไปตามสัญญาฉบับนี้และกฎหมายที่เกี่ยวข้อง รวมถึงมติของคู่สัญญาภายใต้สัญญาฉบับนี้</div>
          </div>

          <div className="grid grid-cols-[30px_1fr] gap-1.5 pl-4">
            <span>3.4.</span>
            <div className="text-justify">ผู้ให้บริการไม่สามารถมอบหมายช่วงหน้าที่ตามข้อ 1. และ/หรือ ข้อ 2. ข้างต้น ให้แก่บุคคลอื่นได้ เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากคู่สัญญา</div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>สัญญาจ้างบริการ</div>
          <div>หน้า 5 จาก {totalPages}</div>
        </div>
      </div>

      {/* Page 6: Annex No. 2 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
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
                เนื่องจากผู้รับจ้างรับหน้าที่และให้บริการในการจัดหาลูกค้า ตามที่ระบุในข้อ 1. ของ<u>เอกสารแนบท้ายหมายเลข 1</u> (การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน) ดังนั้น คู่สัญญาทั้งสองฝ่ายตกลงให้ผู้ว่าจ้างเป็นผู้ชำระค่าตอบแทนให้แก่ผู้รับจ้าง
                <span className="bg-[#ccffcc] print:bg-transparent px-1"> ในอัตราร้อยละ {data.originationFeeRate} ({translateRateToThai(data.originationFeeRate)})</span> ของจำนวนเงินที่ผู้ว่าจ้างให้การสนับสนุนทางการเงินแก่ลูกค้าในสัญญาทางการเงิน
                <span className="bg-[#ccffcc] print:bg-transparent px-1"> โดยแบ่งชำระเป็น {data.agreementOriginationFeePeriods?.[selectedAgreements[0]?.id] || 0} ({translateNumberToThai(data.agreementOriginationFeePeriods?.[selectedAgreements[0]?.id] || 0)}) งวด</span> โดย {selectedAgreements.map((a, idx) => {
                  const label = CONTRACT_TYPE_LABELS[a.type as ContractType] || a.type;
                  const date = data.agreementFirstDates?.[a.id] || '';
                  return (
                    <span key={a.id}>
                      {idx + 1}. {label} เลขที่ {a.data.contractNo}
                      <span className="bg-yellow-200 print:bg-transparent px-1 mx-1 flex-inline"> เริ่มต้นงวดแรกในวันที่ {formatThaiDate(date)}</span>
                      {idx < selectedAgreements.length - 1 ? ' ' : ''}
                    </span>
                  );
                })} รายละเอียดปรากฏตามตารางที่แนบมาด้วยนี้
              </div>

              {/* Only Table 1.1 on this page */}
              {selectedAgreements.length > 0 && renderAgreementTable(selectedAgreements[0], 0)}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>สัญญาจ้างบริการ</div>
          <div>หน้า 6 จาก {totalPages}</div>
        </div>
      </div>

      {/* Page 7: Remaining Tables */}
      {selectedAgreements.length > 1 && (
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
          <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
            <div>สัญญาจ้างบริการ</div>
            <div>หน้า 7 จาก {totalPages}</div>
          </div>
        </div>
      )}

      {/* Page 8: Annex No. 2 Item 2 (Service Fee) */}
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
                เนื่องจากผู้รับจ้าง รับหน้าที่และให้บริการในการบริหารจัดการลูกค้า ตามที่ระบุในข้อ 2. ของ <u>เอกสารแนบท้ายหมายเลข 1</u> (การให้บริการที่เกี่ยวข้องกับสัญญาทางการเงิน) ดังนั้น คู่สัญญาทั้งสองฝ่ายตกลงให้ผู้ว่าจ้าง เป็นผู้ชำระค่าตอบแทนให้แก่ผู้รับจ้าง <span className="bg-[#ccffcc] print:bg-transparent px-1">ในอัตราร้อยละ {data.serviceFeeRate} ({translateRateToThai(data.serviceFeeRate)})</span> ต่อปี ของจำนวนเงินที่ผู้ว่าจ้าง ให้การสนับสนุนทางการเงินแก่ลูกค้าในสัญญาทางการเงิน <span className="bg-yellow-200 print:bg-transparent px-1">โดยกำหนดชำระเป็นรายเดือน ตลอดอายุสัญญาฉบับนี้</span> รายละเอียดปรากฏตามตารางที่แนบนมาด้วยนี้
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
          <div>สัญญาจ้างบริการ</div>
          <div>หน้า {selectedAgreements.length > 1 ? 8 : 7} จาก {totalPages}</div>
        </div>
      </div>

      {/* Pages 9+: Service Fee Schedules per contract */}
      {(() => {
        let currentPageOffset = 0;
        
        const renderClosingText = () => (
          <div className="mt-8 space-y-4 font-normal text-[12px]">
            <div className="text-justify">
              ทั้งนี้ ในกรณีที่วันครบกำหนดชำระค่าตอบแทนไม่ใช่วันที่ธนาคารเปิดดำเนินการเพื่อประกอบธุรกิจเป็นการทั่วไปในประเทศไทย ("วันทำการ") ให้คู่สัญญาฝ่ายที่ 2 ชำระเงินดังกล่าวในวันทำการแรกถัดจากวันที่กำหนดให้ชำระค่าตอบแทน
            </div>
            <div className="text-justify">
              อนึ่ง ตลอดระยะเวลาของสัญญานี้ คู่สัญญาฝ่ายที่ 2 ตกลงรับผิดชอบภาษีมูลค่าเพิ่ม (Value Added Tax) และอากรแสตมป์ (Stamp Duty) และมีสิทธิหักภาษีหักเงินได้ ณ ที่จ่าย (Withholding tax) ในอัตราเท่ากับร้อยละ 3 (สาม) ของค่าตอบแทนข้างต้นหรือตามอัตราอื่นใดที่กำหนดโดยหน่วยงานที่เกี่ยวข้องในระยะเวลานั้นๆ
            </div>
          </div>
        );

        return selectedAgreements.map((agreement, idx) => {
          const { part1, part2 } = renderServiceFeeTable(agreement, idx);
          const basePageNum = (selectedAgreements.length > 1 ? 9 : 8) + idx + currentPageOffset;
          const isLastAgreement = idx === selectedAgreements.length - 1;
          
          const pages = [];
          
          // Page 1 for this agreement
          pages.push(
            <div key={`sf-schedule-${agreement.id}-p1`} className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 mt-8 print:mt-0">
              <PageHeader />
              {part1}
              {isLastAgreement && !part2 && renderClosingText()}
              <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
                <div>สัญญาจ้างบริการ</div>
                <div>หน้า {basePageNum} จาก {totalPages}</div>
              </div>
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
                <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
                  <div>สัญญาจ้างบริการ</div>
                  <div>หน้า {basePageNum + 1} จาก {totalPages}</div>
                </div>
              </div>
            );
          }

          return pages;
        });
      })()}
    </div>
  );
}
