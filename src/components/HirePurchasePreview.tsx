import PageHeader from './PageHeader';
import type { HirePurchaseData, CompanyInfo } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';

interface Props {
  data: HirePurchaseData;
  customerInfo: CompanyInfo;
}

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-yellow-200 print:bg-transparent px-1 rounded inline break-words">
    {children || '\u00A0'}
  </span>
);

const GreenHighlight = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-green-400 font-bold print:bg-transparent px-1 rounded inline break-words">
    {children || '\u00A0'}
  </span>
);

export default function HirePurchasePreview({ data, customerInfo }: Props) {

  const firstPageMax = 3;
  const subsequentPageMax = 6;
  const assetCount = data.assets?.length || 0;
  const overflowAssets = assetCount > firstPageMax ? data.assets!.slice(firstPageMax) : [];
  const overflowPagesCount = Math.ceil(overflowAssets.length / subsequentPageMax);
  const totalPages = 7 + overflowPagesCount; // Pages: 1(Assets), 2(Sec2), 3(Sec3.1-2), 4(Sec3.3-4.4), 5(Sec5.1-2), 6(Sec5.3-5.5), 7(Sec6) + Overflow

  const renderPageFooter = (pageNum: number) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
      <div>
        สัญญาเช่าซื้อ เลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
      </div>
      <div>
        หน้า {pageNum} จาก {totalPages}
      </div>
    </div>
  );

  const totalAmount = data.assets?.reduce((sum, asset) => sum + (parseFloat(asset.totalAmount.replace(/,/g, '')) || 0), 0) || 0;
  const totalAmountFormatted = totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const totalAmountThai = thaiBahtText(totalAmountFormatted);

  const formatThaiDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const days = date.getDate();
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543;
    return `${days} ${month} ${year}`;
  };

  const formatCurrency = (value: string | number) => {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return value.toString();
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const downPaymentAmount = formatCurrency(data.downPayment);
  const downPaymentAmountThai = data.downPayment ? thaiBahtText(data.downPayment.replace(/,/g, '')) : '';

  const remainingAmount = formatCurrency(data.remainingAmount);
  const remainingAmountThai = data.remainingAmount ? thaiBahtText(data.remainingAmount.replace(/,/g, '')) : '';

  const installmentAmountText = formatCurrency(data.installmentAmount);
  const installmentAmountThai = data.installmentAmount ? thaiBahtText(data.installmentAmount.replace(/,/g, '')) : '';

  const stampDutyText = formatCurrency(data.stampDuty);
  const stampDutyThai = data.stampDuty ? thaiBahtText(data.stampDuty.replace(/,/g, '')) : '';

  const totalCheques = (parseInt(data.chequesPerInstallment || '0') * parseInt(data.installments || '0')).toString();
  const insurancePremiumFormatted = formatCurrency(data.insurancePremium);
  const insurancePremiumThai = data.insurancePremium ? thaiBahtText(data.insurancePremium.replace(/,/g, '')) : '';

  const collateralValueFormatted = formatCurrency(data.collateralValue);
  const collateralValueThai = data.collateralValue ? thaiBahtText(data.collateralValue.replace(/,/g, '')) : '';

  const getThaiIndex = (idx: number) => {
    const thaiLetters = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ'];
    return thaiLetters[idx] || (idx + 1).toString();
  };

  const renderTotalSummary = () => (
    <div className="mt-4 font-bold">
      รวมเป็นมูลค่าทั้งสิ้น <Highlight>{totalAmountFormatted}</Highlight> บาท (<Highlight>{totalAmountThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม)
    </div>
  );

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line">
      {/* Page 1 */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-xl">สัญญาเช่าซื้อ (Hire Purchase Agreement)</h2>
          <div className="mt-2 text-[14px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6 font-bold">
          สัญญาเช่าซื้อ (“สัญญา”) ฉบับนี้ ทำขึ้นที่ <Highlight>{data.madeAt}</Highlight> เมื่อวันที่ <Highlight>{data.contractDate}</Highlight>
        </div>

        <div className="mb-4">โดยและระหว่าง:</div>

        <div className="space-y-4 mb-6">
          <div className="pl-6 -indent-6">
            1. <span className="font-bold"><Highlight>{data.lessor1.name}</Highlight></span> (โดย<Highlight>{data.lessor1Signatories}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{data.lessor1.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{data.lessor1.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้เช่าซื้อฝ่ายที่ 1”</b>)
          </div>
          <div className="pl-6 -indent-6">
            2. <span className="font-bold"><Highlight>{data.lessor2.name}</Highlight></span> (โดย<Highlight>{data.lessor2Signatories}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{data.lessor2.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{data.lessor2.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้เช่าซื้อฝ่ายที่ 2”</b>)
          </div>
          <div className="pl-6">
            (ซึ่ง 1. และ 2. ต่อไปจะเรียกรวมกันว่า <b>“ผู้ให้เช่าซื้อ”</b>) และ
          </div>
          <div className="pl-6 -indent-6">
            3. <span className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></span> (โดย<Highlight>{data.lesseeSignatories || customerInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{customerInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{customerInfo.taxId}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้เช่าซื้อ”</b>)
          </div>
        </div>

        <div className="font-bold mb-4">โดยที่</div>
        <div className="space-y-3 mb-6">
          <div className="flex gap-4">
            <span>ก.</span>
            <div className="flex-1">ผู้เช่าซื้อมีความประสงค์จะเช่าซื้อทรัพย์สินจากผู้ให้เช่าซื้อ</div>
          </div>
          <div className="flex gap-4">
            <span>ข.</span>
            <div className="flex-1">ผู้ให้เช่าซื้อตกลงจะให้เช่าซื้อทรัพย์สินแก่ผู้เช่าซื้อตามเงื่อนไขและข้อกำหนดที่ระบุไว้ในสัญญาฉบับนี้</div>
          </div>
        </div>

        {renderPageFooter(1)}
      </div>

      {/* Page 2 */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />

        <div className="space-y-4 mb-6 mt-4">
          <div className="flex gap-4">
            <span>ค.</span>
            <div className="flex-1">ผู้ให้เช่าซื้อฝ่ายที่ 1 ประสงค์จะทำหน้าที่เป็นตัวแทนของผู้ให้เช่าซื้อในการติดต่อประสานงานกับผู้เช่าซื้อเพื่อประโยชน์ในการปฏิบัติหน้าที่ตามสัญญาฉบับนี้ (<b>“ตัวแทนเช่าซื้อ”</b>)</div>
          </div>
          <div className="flex gap-4">
            <span>ง.</span>
            <div className="flex-1">ผู้เช่าซื้อและผู้ให้เช่าซื้อฝ่ายที่ 2 ตกลงจะให้ผู้ให้เช่าซื้อฝ่ายที่ 1 ทำหน้าที่เป็นตัวแทนเช่าซื้อ</div>
          </div>
        </div>

        <div className="font-bold mb-6">คู่สัญญาทั้งสามฝ่ายจึงตกลงทำสัญญาฉบับนี้ขึ้น โดยมีข้อความดังต่อไปนี้</div>

        <div className="mb-6">
          <div className="font-bold mb-2">1. การถือกรรมสิทธิ์รวม</div>
          <div className="indent-8 mb-4">
            ผู้ให้เช่าซื้อตกลงให้ถือกรรมสิทธิ์ในทรัพย์สินที่เช่าซื้อตามที่กำหนดไว้ในข้อ 2.1 ของสัญญาฉบับนี้ เป็นไปตามสัดส่วนดังต่อไปนี้:
          </div>
          <table className="w-[80%] mx-auto border-collapse border border-black text-center text-[12px] mb-6">
            <thead>
              <tr>
                <th className="border border-black p-2">ผู้ให้เช่าซื้อ</th>
                <th className="border border-black p-2">สัดส่วนกรรมสิทธิ์รวม (ร้อยละ)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2">ผู้ให้เช่าซื้อฝ่ายที่ 1</td>
                <td className="border border-black p-2 font-bold">
                  <Highlight>{data.lessor1.proportion}</Highlight> ({data.lessor1.proportion === '20' ? 'ยี่สิบ' : '...'})
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2">ผู้ให้เช่าซื้อฝ่ายที่ 2</td>
                <td className="border border-black p-2 font-bold">
                  <Highlight>{data.lessor2.proportion}</Highlight> ({data.lessor2.proportion === '80' ? 'แปดสิบ' : '...'})
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <div className="font-bold mb-2">2. รายละเอียดของทรัพย์สินที่เช่าซื้อ</div>
          <div className="flex gap-4 mb-2">
            <span>2.1</span>
            <div className="flex-1">ผู้ให้เช่าซื้อตกลงให้เช่าซื้อ และผู้เช่าซื้อตกลงเช่าซื้อเครื่องจักรและอุปกรณ์ประกอบ ดังต่อไปนี้</div>
          </div>
          <div className="space-y-4 pl-8">
            {data.assets?.slice(0, 3).map((asset, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="">(2.1.{idx + 1})</span>
                <div className="flex-1">
                  <span>
                    <Highlight>{asset.name}</Highlight> <Highlight>{asset.description}</Highlight>
                    <br />
                    จำนวน <Highlight>{asset.quantity}</Highlight> <Highlight>{asset.unit}</Highlight> ราคา <Highlight>{asset.totalAmount}</Highlight> บาท (ตัวอักษร) <Highlight>({thaiBahtText(asset.totalAmount)})</Highlight> <span>(รวมภาษีมูลค่าเพิ่ม)</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          {(!data.assets || data.assets.length <= 3) && renderTotalSummary()}
        </div>

        {renderPageFooter(2)}
      </div>

      {/* Overflow Asset Pages (if needed) */}
      {overflowPagesCount > 0 && Array.from({ length: overflowPagesCount }).map((_, pageIndex) => {
        const startIndex = pageIndex * subsequentPageMax;
        const endIndex = startIndex + subsequentPageMax;
        const pageAssets = overflowAssets.slice(startIndex, endIndex);
        const currentPageNum = 3 + pageIndex;

        return (
          <div key={`overflow-page-${pageIndex}`} className="print-page relative min-h-[1050px] p-24">
            <PageHeader />
            <div className="mt-8 space-y-4 pl-8">
              {pageAssets.map((asset, idx) => {
                const globalIdx = firstPageMax + startIndex + idx;
                return (
                  <div key={globalIdx} className="flex gap-2">
                    <span className="">(2.1.{globalIdx + 1})</span>
                    <div className="flex-1">
                      <span>
                        <Highlight>{asset.name}</Highlight> <Highlight>{asset.description}</Highlight>
                        <br />
                        จำนวน <Highlight>{asset.quantity}</Highlight> <Highlight>{asset.unit}</Highlight> ราคา <Highlight>{asset.totalAmount}</Highlight> บาท (ตัวอักษร) <Highlight>({thaiBahtText(asset.totalAmount)})</Highlight> <span>(รวมภาษีมูลค่าเพิ่ม)</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {pageIndex === overflowPagesCount - 1 && renderTotalSummary()}
            {renderPageFooter(currentPageNum)}
          </div>
        );
      })}

      {/* Contract Sections Page 1 */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="indent-10">
            ซึ่งเครื่องจักรและอุปกรณ์ประกอบในข้อ 2.1 ต่อไปนี้จะเรียกรวมว่า (<b>“ทรัพย์สินที่เช่าซื้อ”</b>) และผู้ให้เช่าซื้อตกลงให้เช่าซื้อทรัพย์สินที่เช่าซื้อตามสัดส่วนกรรมสิทธิ์รวมที่กำหนดไว้ในข้อ 1. ของสัญญาฉบับนี้
          </div>

          <div className="flex gap-4">
            <span className="">2.2</span>
            <div className="flex-1">
              ผู้เช่าซื้อตกลงเช่าซื้อทรัพย์สินไปเพื่อใช้ในการประกอบกิจการเกี่ยวกับ <Highlight>{data.businessPurpose}</Highlight> เท่านั้น ณ สำนักงานใหญ่เลขที่ <Highlight>{data.installationLocation}</Highlight> (“สถานที่ตั้ง”) แต่หากภายหลังจากที่เข้าทำสัญญาฉบับนี้ ในกรณีที่ผู้เช่าซื้อจำเป็นต้องทำการเคลื่อนย้ายทรัพย์สินที่เช่าซื้อจากสถานที่ตั้งเดิมที่เคยแจ้งไว้ตามสัญญาฉบับนี้ ผู้เช่าซื้อจะต้องได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้เช่าซื้อก่อนการเคลื่อนย้ายทรัพย์สินที่เช่าซื้อออกจากสถานที่ตั้งเดิม
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">2.3</span>
            <div className="flex-1">
              การเช่าซื้อทรัพย์สินที่เช่าซื้อ (<b>ตามสภาพ</b>) ผู้เช่าซื้อตกลง ยินยอม และรับทราบว่าผู้ให้เช่าซื้อ มิได้ให้คำรับรองแต่อย่างหนึ่งอย่างใดไม่ว่าทางตรง ทางอ้อม หรือโดยปริยาย เกี่ยวกับความเสียหายและความชำรุดบกพร่องของทรัพย์สินที่เช่าซื้อ และผู้ให้เช่าซื้อ มิได้ให้การรับประกันใด ๆ ในเรื่องสภาพของทรัพย์สินที่เช่าซื้อดังกล่าวและผู้เช่าซื้อตกลงจะไม่ใช้สิทธิเรียกร้องใด ๆ สำหรับความชำรุดบกพร่องของทรัพย์สินที่เช่าซื้อ หรือการถูกรอนสิทธิจากทรัพย์สินที่เช่าซื้อที่เกิดขึ้นหรือปรากฏขึ้นภายหลังจากวันที่ผู้เช่าซื้อรับมอบและตรวจสอบทรัพย์สินที่เช่าซื้อ รวมทั้งไม่มีสิทธิในการยึดหน่วงหรือระงับการชำระค่าเช่าซื้อหรือเงินอื่นใดที่จะต้องชำระให้แก่ผู้ให้เช่าซื้อจนกว่าจะครบถ้วนตามจำนวนที่ระบุในสัญญาฉบับนี้
            </div>
          </div>

          <div className="pt-4">
            <div className="font-bold mb-4">3. ค่าเช่าซื้อ การชำระค่าเช่าซื้อ และค่าใช้จ่ายอื่น ๆ</div>
            <div className="flex gap-4">
              <span className="">3.1</span>
              <div className="flex-1">
                <b>ผู้เช่าซื้อตกลงชำระค่าเช่าซื้อในราคา <Highlight>{totalAmountFormatted}</Highlight> บาท (<Highlight>{totalAmountThai}</Highlight>) (“ค่าเช่าซื้อ”)</b> ให้แก่ผู้ให้เช่าซื้อตามสัดส่วนที่ระบุในข้อ 1. และตามรายละเอียดที่ระบุในข้อ 3.2 ของสัญญาฉบับนี้
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(3 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 2 (3.2 and 3.3) */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="">3.2</span>
            <div className="flex-1 space-y-4">
              <div className="underline">การชำระค่าเช่าซื้อ</div>
              <div className="flex gap-4">
                <span className="">(ก)</span>
                <div className="flex-1">
                  ผู้เช่าซื้อตกลงชำระเงินค่าเช่าซื้อครั้งแรก (Down Payment) (“เงินดาวน์”) ในอัตราร้อยละ <Highlight>{data.downPaymentPercentage} ({thaiBahtText(data.downPaymentPercentage || '0').replace('บาทถ้วน', '').trim()})</Highlight> ของราคาทรัพย์สินที่เช่าซื้อ คิดเป็นเงินจำนวน <Highlight>{downPaymentAmount}</Highlight> บาท (<Highlight>{downPaymentAmountThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม) ในวันที่เข้าทำสัญญาฉบับนี้ โดยคู่สัญญาทั้งสามฝ่ายตกลงให้เงินดาวน์ดังกล่าวเป็นส่วนหนึ่งของเงินค่าเช่าซื้อ
                  <div className="mt-4">
                    <GreenHighlight>{data.customGreenText}</GreenHighlight>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="">(ข)</span>
                <div className="flex-1">
                  ผู้เช่าซื้อตกลงชำระเงินค่าเช่าซื้อที่เหลือทั้งหมด (จำนวนค่าเช่าซื้อที่หักด้วยเงินดาวน์) ให้แก่ผู้ให้เช่าซื้อเป็นจำนวนเงินทั้งสิ้น <Highlight>{remainingAmount}</Highlight> บาท (<Highlight>{remainingAmountThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม) โดยคิดดอกเบี้ย<Highlight>{data.interestType}</Highlight> ที่อัตราร้อยละ <Highlight>{data.interestRate}</Highlight> ต่อปี โดยผ่อนชำระค่าเช่าซื้อเป็นงวด งวดละ <Highlight>{installmentAmountText}</Highlight> บาท (<Highlight>{installmentAmountThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม) (โดยแต่ละงวดเรียกว่า “ค่างวดการเช่าซื้อ”)
                </div>
              </div>
              <div className="flex gap-4">
                <span className="">(ค)</span>
                <div className="flex-1">
                  ผู้เช่าซื้อตกลงจะชำระค่างวดการเช่าซื้อให้แก่ผู้ให้เช่าซื้องวดแรก ภายในวันที่ <Highlight>{formatThaiDate(data.firstInstallmentDate)}</Highlight> และจะชำระค่าเช่าซื้อแต่ละงวดให้แก่ผู้ให้เช่าซื้อ ภายในวันที่ <Highlight>{data.paymentDay}</Highlight> ของทุกเดือน จนกว่าจะชำระค่างวดการเช่าซื้อให้แก่ผู้ให้เช่าซื้อครบถ้วนตามจำนวน รวมทั้งสิ้น <Highlight>{data.installments}</Highlight> งวด <b>โดยงวดสุดท้าย กำหนดชำระภายในวันที่ <Highlight>{formatThaiDate(data.lastInstallmentDate)}</Highlight></b>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">3.3</span>
            <div className="flex-1 space-y-4">
              <div className="underline">ค่าอากรแสตมป์</div>
              <div>
                ผู้เช่าซื้อมีหน้าที่ต้องชำระค่าอากรแสตมป์สำหรับการทำสัญญาฉบับนี้ <Highlight>เป็นจำนวนทั้งสิ้น {stampDutyText} บาท ({stampDutyThai})</Highlight> โดยตกลงชำระ ณ วันที่ทำสัญญาฉบับนี้ และมีหน้าที่ต้องชำระค่าภาษีอากรอื่น ๆ
                ในทำนองเดียวกันที่เกี่ยวข้องกับสัญญาฉบับนี้ แต่เพียงผู้เดียว (เว้นแต่ ค่าอากรแสตมป์ และค่าภาษีอากรอื่น ๆ ที่เกี่ยวข้องกับหนังสือโอนสิทธิ และ/หรือ หน้าที่ (หากมี)) และหากผู้ให้เช่าซื้อได้ชำระค่าอากรแสตมป์ หรือค่าภาษีอากรอื่น ๆ ไปแทนผู้เช่าซื้ออันเนื่องมาจากการที่ผู้เช่าซื้อชำระล่าช้าหรือไม่ชำระเงินค่าอากรดังกล่าว ผู้เช่าซื้อต้องชดใช้เงินจำนวนดังกล่าวคืนให้แก่ผู้ให้เช่าซื้อเต็มจำนวน

              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(4 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 3 (3.4 to 3.7) */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="">3.4</span>
            <div className="flex-1 space-y-2">
              <div className="underline">ค่าบริการอันเกี่ยวข้องกับสัญญาฉบับนี้</div>
              <div>
                <b>ผู้เช่าซื้อตกลงและยินยอมชำระค่าบริการในการจดทะเบียน และ/หรือจดจำนองทรัพย์สินหลักประกันกับหน่วยงานราชการที่เกี่ยวข้อง</b> และค่าบริการในการจดทะเบียนกรรมสิทธิ์เครื่องจักร (ถ้ามี) หรือค่าใช้จ่ายอื่น ๆ ให้แก่ผู้ให้เช่าซื้อ โดยตกลงชำระ ณ วันที่ทำสัญญาฉบับนี้
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">3.5</span>
            <div className="flex-1 space-y-2">
              <div className="underline">ค่าธรรมเนียมการจดทะเบียนหลักประกัน หรือ กรรมสิทธิ์เครื่องจักร</div>
              <div>
                ผู้เช่าซื้อตกลงยินยอมรับผิดชอบบรรดาค่าธรรมเนียมและค่าใช้จ่ายอื่นใดเกี่ยวกับการจดทะเบียนจำนองทรัพย์สินหลักประกัน หรือ จดทะเบียนกรรมสิทธิ์เครื่องจักร (ถ้ามี)
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">3.6</span>
            <div className="flex-1">
              ผู้เช่าซื้อตกลงยินยอมให้ผู้ให้เช่าซื้อนำเงินที่ได้รับชำระในแต่ละงวดตามสัดส่วนในข้อ 1. นำไปหักหรือรับชำระหนี้ส่วนใด ก่อน-หลัง ได้ตามเงื่อนไขที่ผู้ให้เช่าซื้อกำหนดไว้ และผู้เช่าซื้อยินยอมให้ผู้ให้เช่าซื้อทั้งสองฝ่ายทำการปรับปรุงบัญชี และ/หรือ รายการรับชำระหนี้ได้ โดยผู้เช่าซื้อตกลงให้เป็นดุลยพินิจของผู้ให้เช่าซื้อ
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">3.7</span>
            <div className="flex-1">
              กรณีที่มีค่าใช้จ่ายอันเกิดจากการที่เช็คสั่งจ่ายล่วงหน้าเพื่อชำระหนี้ ไม่อาจขึ้นเงินได้ไม่ว่ากรณีใดก็ตาม และ/หรือ ในกรณีที่มีค่าธรรมเนียมในการเรียกเก็บเช็คข้ามเขต และ/หรือ กรณีอื่น ๆ ที่ก่อให้เกิดค่าใช้จ่ายอันเกี่ยวกับเช็คสั่งจ่ายล่วงหน้าโดยมิใช่ความผิดของผู้ให้เช่าซื้อ ผู้เช่าซื้อตกลงชำระให้แก่ผู้ให้เช่าซื้อทั้งสองฝ่ายในสัดส่วนตามข้อ 1. ของสัญญาฉบับนี้ ภายในระยะเวลาที่ผู้ให้เช่าซื้อกำหนด
            </div>
          </div>
        </div>
        {renderPageFooter(5 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 4 */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="font-bold mb-4">4. วิธีการชำระเงิน</div>

          <div className="flex gap-4">
            <span className="">4.1</span>
            <div className="flex-1 space-y-4">
              <div>
                ในกรณีที่ผู้เช่าซื้อต้องชำระเงินใด ๆ ให้แก่ผู้ให้เช่าซื้อ ผู้เช่าซื้อตกลงชำระเงินให้แก่ผู้ให้เช่าซื้อในรูปแบบเช็คธนาคารสั่งจ่ายล่วงหน้าในนามผู้ให้เช่าซื้อแต่ละราย ตามจำนวนเงินค่างวดการเช่าซื้อในแต่ละงวด <Highlight>จำนวนงวดละ {data.chequesPerInstallment} ({thaiBahtText(data.chequesPerInstallment || '0').replace('บาทถ้วน', '').trim()}) ฉบับ</Highlight> (สั่งจ่ายในนามของผู้ให้เช่าซื้อแต่ละรายตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้) <Highlight>รวมทั้งสิ้น {data.installments} งวด</Highlight> โดยให้ถือว่าเป็นการชำระค่างวดการเช่าซื้อในแต่ละงวด ต่อเมื่อได้มีการขึ้นเงินและได้รับชำระเต็มจำนวนจากธนาคารดังกล่าวข้างต้น
              </div>
              <div>
                ทั้งนี้ ผู้เช่าซื้อได้ส่งมอบเช็คสั่งจ่ายล่วงหน้าให้ไว้แก่ผู้ให้เช่าซื้อ <Highlight>งวดละ {data.chequesPerInstallment} ({thaiBahtText(data.chequesPerInstallment || '0').replace('บาทถ้วน', '').trim()}) ฉบับ รวมทั้งสิ้น {data.installments} งวด เป็นเช็คสั่งจ่ายล่วงหน้าจำนวนทั้งสิ้น {totalCheques} ฉบับ (สำหรับค่างวดเช่าซื้องวดที่ 1 ถึง งวดที่ {data.installments})</Highlight> ณ วันที่ทำสัญญาฉบับนี้แล้ว
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">4.2</span>
            <div className="flex-1">
              {data.clause4_2Text}
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">4.3</span>
            <div className="flex-1">
              ในกรณีที่ผู้เช่าซื้อประสงค์จะชำระหนี้ด้วยวิธีการอื่นใด และ/หรือ เนื่องจากมีเหตุผิดนัดชำระ ชำระเบี้ยปรับค่าใช้จ่ายอื่นใดที่เกี่ยวข้องกับสัญญาฉบับนี้ ให้ผู้เช่าซื้อดำเนินการชำระผ่านบัญชีธนาคาร <b>ชื่อบัญชี บริษัท อาไจล์ แอสเซ็ทส์ จำกัด ธนาคารกสิกรไทย ประเภทออมทรัพย์ หมายเลขบัญชี 025-3-77662-5</b>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">4.4</span>
            <div className="flex-1">
              คู่สัญญาทั้งสามฝ่ายตกลงว่าถ้าวันครบกำหนดชำระเงินใด ๆ มิใช่วันทำการ ก็ให้เงินจำนวนนั้น ๆ ถึงกำหนดชำระในวันทำการ ก่อนวันถึงกำหนดชำระนั้น
            </div>
          </div>
        </div>
        {renderPageFooter(5 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 5 */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="font-bold mb-4">5. หน้าที่และความรับผิดชอบของผู้เช่าซื้อ</div>

          <div className="flex gap-4">
            <span className="">5.1.</span>
            <div className="flex-1 space-y-4">
              <div className="underline">การใช้ทรัพย์สินที่เช่าซื้อ</div>
              <div className="flex gap-4">
                <span className="">(ก)</span>
                <div className="flex-1">
                  ผู้เช่าซื้อจะใช้สอยทรัพย์สินที่เช่าซื้อสำหรับตนเอง หรือในธุรกิจของผู้เช่าซื้อและ ณ สถานที่ที่ระบุไว้ในข้อ 2.2 ของสัญญาฉบับนี้เท่านั้น ด้วยความระมัดระวังในระดับวิญญูชนที่พึงใช้สำหรับทรัพย์สินประเภทนั้น ๆ ทั้งนี้ ห้ามมิให้ผู้เช่าซื้อใช้ และ/หรือ ยินยอมให้บุคคลอื่นใช้ ให้เช่าช่วง จำนำ จำนอง ยักย้าย เคลื่อนที่หรือกระทำการอย่างหนึ่งอย่างใดต่อทรัพย์สินที่เช่าซื้อโดยมิได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้เช่าซื้อทุกกรณี
                </div>
              </div>
              <div className="flex gap-4">
                <span className="">(ข)</span>
                <div className="flex-1">
                  ผู้เช่าซื้อจะดูแลรักษาทรัพย์สินที่เช่าซื้อให้อยู่ในสภาพเรียบร้อยใช้งานได้ดี ในระดับวิญญูชนที่พึงใช้ในการดูแลรักษาทรัพย์สินของตน และจัดให้มีการซ่อมแซมที่ดี รวมถึงการบำรุงรักษาทรัพย์สินตามกำหนดระยะเวลาในการบำรุงรักษาด้วย ผู้เช่าซื้อตกลงแจ้งให้ตัวแทนผู้ให้เช่าซื้อทราบเป็นลายลักษณ์อักษรโดยทันที ถ้าทรัพย์สินไม่สามารถใช้งานได้ตามปกติ หรือเกิดความเสียหายหรือสูญหาย หรือถูกทำลาย หรือผู้เช่าซื้อไม่ได้ใช้ทรัพย์สินเป็นระยะเวลาเกินกว่า 30 (สามสิบ) วัน
                </div>
              </div>
              <div className="flex gap-4">
                <span className="">(ค)</span>
                <div className="flex-1">
                  ผู้เช่าซื้อจะไม่เปลี่ยนแปลงสภาพ ดัดแปลง แก้ไข หรือต่อเติมทรัพย์สินที่เช่าซื้อ อุปกรณ์ หรืออะไหล่ หรือส่วนหนึ่งส่วนใดของทรัพย์สินด้วยประการใด ๆ เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้เช่าซื้อ
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">5.2.</span>
            <div className="flex-1 space-y-2">
              <div className="underline">ค่าใช้จ่ายและค่าธรรมเนียม</div>
              <div>
                ผู้เช่าซื้อตกลงชำระและรับผิดชอบค่าใช้จ่ายทั้งปวง และ/หรือ การดำเนินการอย่างหนึ่งอย่างใดหรือหลายอย่างอันเกี่ยวกับทรัพย์สินที่เช่าซื้อตามรายละเอียดและข้อกำหนดที่ผู้ให้เช่าซื้อกำหนดไว้อย่างเคร่งครัด
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(5 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 6 */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="">5.3.</span>
            <div className="flex-1 space-y-2">
              <div className="underline">การเข้าถึงข้อมูลการใช้งานและการตรวจสอบสภาพของทรัพย์สิน</div>
              <div>
                ผู้เช่าซื้อยินยอมและอนุญาตให้ตัวแทนเช่าซื้อ ผู้ให้เช่าซื้อ ตัวแทน หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งโดยชอบจากตัวแทนเช่าซื้อหรือผู้ให้เช่าซื้อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งจากผู้ผลิตทรัพย์สินที่เช่าซื้อ หรือ ตัวแทนจำหน่าย ให้มีสิทธิเข้าถึงข้อมูลการใช้งานทรัพย์สินที่เช่าซื้อในการใช้งานและการบำรุงรักษา เพื่อให้สามารถตรวจสอบประสิทธิภาพของทรัพย์สินที่เช่าซื้อได้ในระหว่างที่สัญญาฉบับนี้มีผลบังคับใช้ ทั้งนี้ ไม่ว่าการเข้าถึงข้อมูลดังกล่าวจะกระทำผ่านทางระบบออนไลน์ หรือทางการติดต่อสื่อสารใด ๆ ทั้งสิ้น หากตัวแทนเช่าซื้อหรือผู้ให้เช่าซื้อตรวจพบว่าทรัพย์สินหรือส่วนหนึ่งส่วนใดของทรัพย์สินที่เช่าซื้อ เสียหาย ชำรุด หรืออยู่ในสภาพที่ไม่เหมาะสมแก่การใช้งาน ตัวแทนเช่าซื้อจะดำเนินการแจ้งเป็นลายลักษณ์อักษรไปยังผู้เช่าซื้อเพื่อให้ทราบเรื่องดังกล่าว และให้ดำเนินการซ่อมแซมทรัพย์สินในการนี้ ผู้เช่าซื้อตกลงที่จะทำการซ่อมแซมทรัพย์สินให้กลับคืนสู่สภาพที่ดีและเหมาะสมในการใช้งานได้อย่างมีประสิทธิภาพ โดยค่าใช้จ่ายทั้งหมดให้ถือเป็นหน้าที่ของผู้เช่าซื้อเอง
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">5.4.</span>
            <div className="flex-1 space-y-2">
              <div className="underline">การรับประกันและการบริการบำรุงรักษาทรัพย์สิน โดยผู้ผลิต</div>
              <div>
                การรับประกันและการบริการบำรุงรักษาทรัพย์สินที่เช่าซื้อ ให้เป็นไปตามเงื่อนไขที่ผู้ผลิตทรัพย์สินที่เช่าซื้อกำหนดไว้ทุกประการ
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">5.5.</span>
            <div className="flex-1 space-y-2">
              <div className="underline">การประกันภัยทรัพย์สิน</div>
              <div>
                ตลอดอายุของสัญญาฉบับนี้ ผู้เช่าซื้อตกลงจะทำประกันภัยทรัพย์สินกับบริษัทประกันภัยที่ผู้ให้เช่าซื้อยอมรับ<b>โดยเงื่อนไขการเอาประกันภัยจะเป็นไปตามที่ผู้ให้เช่าซื้อกำหนด และผู้เช่าซื้อตกลงชำระค่าเบี้ยประกันภัยเป็นรายปี จำนวนเงิน <Highlight>{insurancePremiumFormatted}</Highlight> บาท (<Highlight>{insurancePremiumThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม)</b> ด้วยวิธีการสั่งจ่ายเช็คล่วงหน้าในนามผู้ให้เช่าซื้อฝ่ายที่ 1 ให้ครบถ้วนตามจำนวนปีของอายุสัญญา และมอบไว้ให้แก่ผู้ให้เช่าซื้อฝ่ายที่ 1 ณ วันที่ทำสัญญาฉบับนี้ เพื่อให้ผู้ให้เช่าซื้อฝ่ายที่ 1 เป็นผู้ดำเนินการชำระเบี้ยประกันภัยให้แก่บริษัทประกันภัยแทนผู้เช่าซื้อ โดยหากเบี้ยประกันภัยที่จ่ายจริงต่ำกว่ายอดเงินตามเช็ค ผู้ให้เช่าซื้อจะคืนเงินส่วนเกินให้ แต่หากเบี้ยประกันภัยจริงสูงกว่ายอดเงินตามเช็ค ผู้เช่าซื้อตกลงชำระส่วนที่ขาดเพิ่มทันทีภายใน 7 วัน นับจากวันที่ได้รับแจ้ง ผู้ให้เช่าซื้อมีสิทธิเข้าชำระค่าเบี้ยประกันภัยแทนไปก่อนเพื่อให้ความคุ้มครองมีผลต่อเนื่อง และให้ถือว่าเงินจำนวนที่ได้สำรองจ่ายไปนั้นเป็นหนี้ที่มีอยู่จริงและบังคับได้ตามกฎหมายซึ่งผู้เช่าซื้อต้องมีหน้าที่ชำระคืนทันที ทั้งนี้ ในกรณีที่ธนาคารปฏิเสธการจ่ายเงินตามเช็คฉบับใดฉบับหนึ่ง ผู้เช่าซื้อตกลงให้ผู้ให้เช่าซื้อทรงไว้ซึ่งสิทธิในการดำเนินคดีกับผู้เช่าซื้อจนกว่าคดีจะถึงที่สุดในทางแพ่งและทางอาญาที่เกี่ยวข้องจากการที่ธนาคารปฏิเสธการจ่ายเงินตามเช็คดังกล่าว
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(6 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 7 - Section 6 */}
      <div className="print-page relative min-h-[1050px] p-24">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4 font-bold">
            <span className="">6.</span>
            <span className="">หลักประกัน</span>
          </div>

          <div className="flex gap-4">
            <span className="">6.1.</span>
            <div className="flex-1">
              ในวันที่เข้าทำสัญญาฉบับนี้และตลอดระยะเวลาของสัญญาฉบับนี้ ผู้เช่าซื้อตกลงจัดหาหลักประกันให้แก่ผู้ให้เช่าซื้อ โดยมูลค่าของหลักประกัน ภายใต้เงื่อนไขที่กำหนดในข้อ 6.4 ของสัญญาฉบับนี้จะต้องมีมูลค่ารวมกันไม่น้อยกว่า <Highlight>{collateralValueFormatted}</Highlight> บาท (<Highlight>{collateralValueThai}</Highlight>) หรือตามที่ผู้ให้เช่าซื้อเห็นสมควร
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">6.2.</span>
            <div className="flex-1 space-y-2">
              <div>ในการทำสัญญาเช่าซื้อฉบับนี้ ผู้เช่าซื้อได้ตกลงทำสัญญาค้ำประกันโดยบุคคลภายนอก (“บุคคลค้ำประกัน”)</div>
              <div className="flex gap-4">
                <span>(ก)</span>
                <div>
                  <span className="font-bold">สัญญาค้ำประกันโดยบุคคลภายนอก:</span> <Highlight>{(data.hpGuarantors || []).map((name, i) => `${i + 1}. ${name}`).join(' ')}</Highlight> โดยผู้ค้ำประกันอาจเป็นบุคคลธรรมดาหรือนิติบุคคลซึ่งไม่มีหนี้สินล้นพ้นตัว มีแหล่งรายได้ชัดเจนและมีคุณสมบัติอื่น ๆ ตามที่ผู้ให้สินเชื่อกำหนด โดยผู้ให้สินเชื่อขอสงวนสิทธิในการใช้ดุลยพินิจฝ่ายเดียวในการพิจารณาคุณสมบัติในการเลือกบุคคลผู้เป็นผู้ค้ำประกัน เพื่อเข้าค้ำประกันแทนหรือเพิ่มเติม เพื่อค้ำประกันหนี้สินใด ๆ ภายใต้หรือที่เกี่ยวข้องกับสัญญาฉบับนี้
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="">6.3.</span>
            <div className="flex-1 space-y-4">
              <div>ผู้เช่าซื้อตกลงว่าบรรดาทรัพย์สินดังต่อไปนี้ (“ทรัพย์สินหลักประกัน”) เป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้เช่าซื้อที่มีต่อผู้ให้เช่าซื้อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า</div>
              
              {(data.collateralAssets || []).map((asset, idx) => (
                <div key={idx} className="flex gap-4">
                  <span>({getThaiIndex(idx)})</span>
                  <div className="flex-1">
                    {asset.type === 'land' && asset.landDetails && (
                      <div>
                        <span className="font-bold">การจำนองที่ดิน :</span> ที่ดินเปล่า โฉนดที่ดินเลขที่ <Highlight>{asset.landDetails.deedNo}</Highlight> เล่ม <Highlight>{asset.landDetails.volume}</Highlight> หน้า <Highlight>{asset.landDetails.page}</Highlight> ระวาง <Highlight>{asset.landDetails.mapSheet}</Highlight> เลขที่ดิน <Highlight>{asset.landDetails.landNo}</Highlight> หน้าสำรวจ <Highlight>{asset.landDetails.surveyNo}</Highlight> ตำบล <Highlight>{asset.landDetails.subDistrict}</Highlight> อำเภอ <Highlight>{asset.landDetails.district}</Highlight> จังหวัด <Highlight>{asset.landDetails.province}</Highlight> อันเป็นทรัพย์สินที่ไม่มีภาระผูกพันของ <Highlight>{asset.landDetails.owner}</Highlight> รายละเอียดปรากฏตามเอกสารแนบท้ายหมายเลข 6
                      </div>
                    )}
                    {asset.type === 'cash' && (
                      <div>
                        <span className="font-bold">เงินสด :</span> เงินสดจำนวน <Highlight>{formatCurrency(asset.cashAmount || '0')}</Highlight> บาท
                      </div>
                    )}
                    {asset.type === 'machinery' && (
                      <div>
                        <span className="font-bold">เครื่องจักร :</span> <Highlight>{asset.machineryDetails}</Highlight>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {renderPageFooter(totalPages)}
      </div>
    </div>
  );
}

