import PageHeader from './PageHeader';
import type { ODData, CompanyInfo, GuarantorData } from '../types/app';
import { formatThaiDate } from '../utils/thaiDate';
import { formatThaiId, getAuthorizedSignatoryText } from '../utils/formatters';
import { formatAddressWithPostalCode } from '../utils/address';
import { thaiBahtText } from '../utils/thaiBahtText';
import { thaiNumberText } from '../utils/thaiNumberText';
import { Highlight } from './Highlight';

interface Props {
  data: ODData;
  customerInfo: CompanyInfo;
  agileInfo: CompanyInfo;
  tkInfo: CompanyInfo;
  guarantors: GuarantorData[];
  companyMode?: string;
}

export const THAI_INDEX = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ'];

export default function ODPreview({ data, customerInfo, agileInfo, tkInfo, guarantors, companyMode }: Props) {
  const isAgileOnly = companyMode === 'agileOnly';
  // Strip leading "เลขที่" from address data to prevent duplication
  const stripAddressPrefix = (addr: string) =>
    addr?.replace(/^เลขที่\s*/, '') || '';

  const loanAmt = typeof data.loanAmount === 'string' ? parseFloat(data.loanAmount.replace(/,/g, '')) : (parseFloat(data.loanAmount) || 0);
  const p1 = parseFloat(String(data.lender1?.proportion || '0')) || 0;
  const p2 = parseFloat(String(data.lender2?.proportion || '0')) || 0;

  const limit1 = Math.floor(loanAmt * (p1 / 100));
  const limit2 = Math.floor(loanAmt * (p2 / 100));

  // Section 3.3 dynamic conditions overflow logic
  const conditions33 = data.conditions33 || [];
  const totalCond33Chars = conditions33.reduce((sum, s) => sum + s.length, 0);
  // ถ้าตัวอักษรเกิน 1900 หรือมีข้อ จ ขึ้นไป (length >= 5) ให้เกิดหน้าใหม่
  const hasCond33Overflow = totalCond33Chars > 1900 || conditions33.length >= 5;
  // ถ้า overflow ให้หน้าแรกแสดงแค่ 3 ข้อ (ก, ข, ค) แล้วดันข้อ ง เป็นต้นไป รวมถึง 3.4 ไปหน้าใหม่
  const cond33FirstPageCount = hasCond33Overflow ? 3 : conditions33.length;
  const baseTotalPages = 48;
  const totalPages = baseTotalPages + (hasCond33Overflow ? 1 : 0);

  // Render page footer with dynamic page numbering
  // Pages >= 7 shift by 1 when overflow page is inserted after page 6
  const renderPageFooter = (basePageNum: number) => {
    const actualPage = (hasCond33Overflow && basePageNum >= 7) ? basePageNum + 1 : basePageNum;
    return (
      <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600 font-sans">
        <div>
          สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
        </div>
        <div>
          หน้า {actualPage} จาก {totalPages}
        </div>
      </div>
    );
  };


  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line space-y-8 print:space-y-0 mx-auto">
      {/* Page 1 */}
      <div data-section-id="od-general" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-[16px]">สัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข</h2>
          <div className="mt-2 text-[16px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          <b>สัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข</b> (“สัญญา”) ฉบับนี้ ทำขึ้นที่ <Highlight>{data.madeAt || agileInfo.companyName}</Highlight> <b>เมื่อวันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight></b>
        </div>

        <div className="mb-4 mt-6">โดยและระหว่าง</div>

        <div className="space-y-4 mb-6">
          {isAgileOnly ? (
            <>
              <div className="flex gap-4 text-justify">
                <span className="shrink-0 w-6">1)</span>
                <div className="flex-1">
                  <b><Highlight>{agileInfo.companyName}</Highlight></b> (โดย <Highlight>{agileInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(agileInfo.address, agileInfo.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(agileInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้สินเชื่อ”</b>)
                </div>
              </div>

              <div className="flex gap-4 text-justify">
                <span className="shrink-0 w-6">2)</span>
                <div className="flex-1">
                  <b><Highlight>{customerInfo.companyName}</Highlight></b> (โดย <Highlight>{customerInfo.directors}</Highlight> {getAuthorizedSignatoryText(customerInfo)}) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(customerInfo.address, customerInfo.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(customerInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้กู้”</b>)
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-4 text-justify">
                <span className="shrink-0 w-6">1)</span>
                <div className="flex-1">
                  <b><Highlight>{agileInfo.companyName}</Highlight></b> (โดย <Highlight>{agileInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(agileInfo.address, agileInfo.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(agileInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้สินเชื่อฝ่ายที่ 1”</b>)
                </div>
              </div>

              <div className="flex gap-4 text-justify">
                <span className="shrink-0 w-6">2)</span>
                <div className="flex-1">
                  <b><Highlight>{tkInfo.companyName}</Highlight></b> (โดย <Highlight>{tkInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(tkInfo.address, tkInfo.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(tkInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้สินเชื่อฝ่ายที่ 2”</b>)
                </div>
              </div>

              <div className="pl-10">
                (ซึ่ง 1. และ 2. ต่อไปจะเรียกรวมว่า <b>“ผู้ให้สินเชื่อ”</b>) และ
              </div>

              <div className="flex gap-4 text-justify">
                <span className="shrink-0 w-6">3)</span>
                <div className="flex-1">
                  <b><Highlight>{customerInfo.companyName}</Highlight></b> (โดย <Highlight>{customerInfo.directors}</Highlight> {getAuthorizedSignatoryText(customerInfo)}) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(customerInfo.address, customerInfo.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(customerInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้กู้”</b>)
                </div>
              </div>
            </>
          )}
        </div>

        <div className="font-bold mb-4">โดยที่</div>
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <span>ก.</span>
            <div className="flex-1">
              ผู้กู้มีความประสงค์จะขอสินเชื่อเงินกู้แบบมีกำหนดเวลา <b>(“สินเชื่อ”)</b> จากผู้ให้สินเชื่อ
            </div>
          </div>
          <div className="flex gap-2">
            <span>ข.</span>
            <div className="flex-1">
              ผู้ให้สินเชื่อตกลงจะให้สินเชื่อแก่ผู้กู้ตามเงื่อนไขและข้อกำหนดที่ได้ระบุไว้ในสัญญาฉบับนี้
            </div>
          </div>
        </div>

        {renderPageFooter(1)}
      </div>

      {/* Page 2 */}
      <div data-section-id="od-financials" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div>
            {!isAgileOnly && (
              <>
                <div className="flex gap-2">
                  <span>ค.</span>
                  <div className="flex-1 mb-4">
                    ผู้ให้สินเชื่อฝ่ายที่ 1 ประสงค์จะทำหน้าที่เป็นตัวแทนของผู้ให้สินเชื่อในการติดต่อประสานงานกับผู้กู้เพื่อประโยชน์ในการปฏิบัติหน้าที่ตามสัญญาฉบับนี้ <b>(“ตัวแทนสินเชื่อ”)</b>
                  </div>
                </div>
                <div className="flex gap-2 mb-6">
                  <span>ง.</span>
                  <div className="flex-1">
                    ผู้กู้และผู้ให้สินเชื่อฝ่ายที่ 2 ตกลงจะให้ผู้ให้สินเชื่อฝ่ายที่ 1 ทำหน้าที่เป็นตัวแทนสินเชื่อ
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-2 mb-6">
              <div className="flex-1">
                คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}จึงได้ตกลงเข้าทำสัญญาฉบับนี้ขึ้น โดยมีข้อความดังต่อไปนี้
              </div>
            </div>

            <div className="flex gap-2 items-center mb-4">
              <span className="font-bold">1.</span>
              <span className="font-bold">วงเงินสินเชื่อ</span>
            </div>
            <div className="flex gap-4 mb-4">
              <span className="shrink-0 w-8">1.1</span>
              <div className="flex-1 text-justify">
                ภายใต้เงื่อนไขและข้อกำหนดที่ระบุในสัญญาฉบับนี้ ผู้ให้สินเชื่อตกลงให้สินเชื่อแก่ผู้กู้ และผู้กู้ตกลงที่จะรับสินเชื่อดังกล่าวจากผู้ให้สินเชื่อ <Highlight>เป็นจำนวนเงิน {data.loanAmount} บาท ({thaiBahtText(data.loanAmount)})</Highlight>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <span className="shrink-0 w-8">1.2</span>
              <div className="flex-1 text-justify">
                ผู้ให้สินเชื่อตกลงให้สินเชื่อแก่ผู้กู้ตามที่กำหนดไว้ในข้อ 1.1 ของสัญญาฉบับนี้ ตามสัดส่วนดังต่อไปนี้
              </div>
            </div>

            <table className="w-full border-collapse border border-black text-center text-[12px] mb-6">
              <thead>
                <tr className="bg-slate-50 print:bg-transparent uppercase font-bold text-black border-black">
                  <th className="border border-black p-2 w-[40%]">ผู้ให้สินเชื่อ</th>
                  <th className="border border-black p-2 w-[30%]">สัดส่วน (ร้อยละ)</th>
                  <th className="border border-black p-2 w-[30%]">วงเงินสินเชื่อ (บาท)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2">{isAgileOnly ? 'ผู้ให้สินเชื่อ' : 'ผู้ให้สินเชื่อฝ่ายที่ 1'}</td>
                  <td className="border border-black p-2">
                    <Highlight>{data.lender1?.proportion || '0'} ({thaiNumberText(data.lender1?.proportion || '0')})</Highlight>
                  </td>
                  <td className="border border-black p-2">
                    <Highlight>{limit1.toLocaleString('en-US')}</Highlight>
                  </td>
                </tr>
                {!isAgileOnly && (
                  <tr>
                    <td className="border border-black p-2">ผู้ให้สินเชื่อฝ่ายที่ 2</td>
                    <td className="border border-black p-2">
                      <Highlight>{data.lender2?.proportion || '0'} ({thaiNumberText(data.lender2?.proportion || '0')})</Highlight>
                    </td>
                    <td className="border border-black p-2">
                      <Highlight>{limit2.toLocaleString('en-US')}</Highlight>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <div className="flex gap-2 items-center mb-4">
              <span className="font-bold">2.</span>
              <span className="font-bold">วัตถุประสงค์</span>
            </div>
            <div className="indent-8 text-justify">
              ผู้กู้ตกลงที่จะนำสินเชื่อที่ได้รับจากผู้ให้สินเชื่อภายใต้สัญญาฉบับนี้ ไปใช้เพื่อวัตถุประสงค์สำหรับ<Highlight>{data.businessPurpose || 'ระบุวัตถุประสงค์การใช้สินเชื่อ'}</Highlight>
            </div>
          </div>

          <div>
            <div className="flex gap-2 items-center mb-4">
              <span className="font-bold">3.</span>
              <span className="font-bold">การเบิกใช้สินเชื่อ</span>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 w-8">3.1</span>
              <div className="flex-1 text-justify">
                ผู้กู้และผู้ให้สินเชื่อตกลงกันว่าในการเบิกใช้สินเชื่อ ผู้กู้ต้องเบิกใช้สินเชื่อจากผู้ให้สินเชื่อ{isAgileOnly ? '' : 'แต่ละราย'}ตามสัดส่วน และไม่เกินจำนวนสินเชื่อของผู้ให้สินเชื่อ{isAgileOnly ? '' : 'แต่ละราย'}ตามที่กำหนดในข้อ 1.2 ของสัญญาฉบับนี้
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(2)}
      </div>

      {/* Page 3 */}
      <div data-section-id="od-conditions" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8">3.2</span>
            <div className="flex-1 text-justify">
              <span className="mb-2 inline-block underline">เงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อ</span>
              <div className="mb-4">
                ผู้กู้จะเริ่มมีสิทธิขอเบิกใช้สินเชื่อภายใต้สัญญาฉบับนี้ได้ก็ต่อเมื่อ ในการเบิกใช้สินเชื่อในแต่ละครั้งละตามข้อ 3.4 ผู้กู้ได้ดำเนินการ และ/หรือ ส่งมอบเอกสาร ดังต่อไปนี้ครบถ้วนในวันที่ผู้กู้ยื่นหนังสือขอเบิกใช้สินเชื่อตามข้อ 3.4 (ก) ของสัญญาฉบับนี้ หรือได้รับการยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อให้ผู้กู้ไม่ต้องดำเนินการ และ/หรือ ส่งมอบเอกสารอย่างใดอย่างหนึ่ง หรือหลายอย่างดังกล่าว
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ก)</span>
                  <div className="flex-1">
                    ผู้ให้สินเชื่อได้รับเอกสารทุกอย่างตามที่ระบุไว้ใน <span className="underline decoration-1 font-bold">เอกสารแนบท้ายหมายเลข 1</span> <i>(เงื่อนไขบังคับก่อน)</i> โดยเอกสารแต่ละฉบับที่ส่งมอบจะต้องอยู่ในรูปแบบและเนื้อหาที่ผู้ให้สินเชื่อยอมรับ ทั้งนี้ ในกรณีเอกสารที่ส่งมอบนั้นเป็นสำเนาเอกสาร เอกสารดังกล่าวจะต้องได้รับการรับรองความถูกต้องโดยผู้มีอำนาจลงนามรับรองสำเนาเอกสารของผู้กู้
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ข)</span>
                  <div className="flex-1">
                    ผู้กู้ได้ปฏิบัติตามเงื่อนไขทุกประการที่ระบุไว้ใน <span className="underline decoration-1 font-bold">เอกสารแนบท้ายหมายเลข 1</span> <i>(เงื่อนไขบังคับก่อน)</i>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ค)</span>
                  <div className="flex-1">
                    ผู้กู้ได้ดำเนินการที่เกี่ยวข้องกับการเปิดบัญชีเพื่อการชำระหนี้ ดังต่อไปนี้

                    <div className="mt-4 flex gap-2">
                      <span className="shrink-0 w-8">(1)</span>
                      <div className="flex-1">
                        ดำเนินการเปิดบัญชีธนาคารในนามของบริษัท <Highlight>{customerInfo.companyName}</Highlight> และดำเนินการให้ผู้ให้สินเชื่อ หรือตัวแทนของผู้ให้สินเชื่อเป็นผู้มีอำนาจลงนามสั่งจ่าย / ถอนเงิน หรือทำธุรกรรมของบัญชีดังกล่าวเท่านั้น
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <span className="shrink-0 w-8"></span>
                      <div className="flex-1">
                        ทั้งนี้ ผู้กู้ได้ดำเนินการเปิดบัญชี<Highlight>{data.bankAccountBank}</Highlight> ชื่อบัญชี <Highlight>{data.bankAccountName || customerInfo.companyName}</Highlight> ประเภท<Highlight>{data.bankAccountType}</Highlight> สาขา<Highlight>{data.bankAccountBranch}</Highlight> หมายเลขบัญชี <Highlight>{data.bankAccountNumber}</Highlight> และได้ดำเนินการให้ตัวแทนของผู้ให้สินเชื่อ (<Highlight>{data.bankAccountRepresentative}</Highlight> และ/หรือ บุคคลอื่นใดที่ผู้ให้สินเชื่อกำหนด) เท่านั้น เป็นผู้มีอำนาจลงนามสั่งจ่าย / ถอนเงินหรือทำธุรกรรมของบัญชีธนาคารดังกล่าวได้ ตั้งแต่วันที่ทำสัญญาฉบับนี้ ทั้งนี้ ผู้กู้ต้องไม่กระทำการเปลี่ยนแปลงบัญชีดังกล่าวในภายหลัง เว้นแต่ได้รับความยินยอมเป็นหนังสือจากผู้ให้สินเชื่อทั้งสองฝ่าย
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(3)}
      </div>

      {/* Page 4 */}
      <div data-section-id="od-conditions-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span> {/* Spacer for 3.2 */}
            <div className="flex-1 text-justify">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8"></span> {/* Spacer for (ค) */}
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(2)</span>
                      <div className="flex-1">
                        ดำเนินการส่งมอบสมุดบัญชีธนาคารตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ ให้แก่ตัวแทนสินเชื่อเพื่อประโยชน์ของผู้ให้สินเชื่อทั้งสองราย
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(3)</span>
                      <div className="flex-1">
                        ดำเนินการส่งมอบสำเนามติที่ประชุมของคณะกรรมการของผู้กู้ซึ่งมีมติอนุมัติให้ตัวแทนของผู้ให้สินเชื่อตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้เท่านั้น เป็นผู้มีอำนาจลงนามสั่งจ่าย / ถอนเงินหรือทำธุรกรรมของบัญชีธนาคารดังกล่าวและ/หรือ เอกสาร และ/หรือ หลักฐานอื่นใดตามที่ผู้ให้สินเชื่อกำหนด โดยที่เอกสารข้างต้นจะต้องรับรองความถูกต้องโดยกรรมการผู้มีอำนาจของผู้กู้
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ง)</span>
                  <div className="flex-1">
                    ผู้กู้ได้ดำเนินการที่เกี่ยวข้องกับลูกหนี้ทางการค้าของผู้กู้ ซึ่งเป็นผู้สั่งให้ผู้กู้ผลิตสินค้า และ/หรือ ให้บริการ และ/หรือ ว่าจ้างให้ผู้กู้ผลิตสินค้า และ/หรือ ให้บริการ (“ลูกค้าของผู้กู้”) ดังต่อไปนี้

                    <div className="mt-4 flex gap-2">
                      <span className="shrink-0 w-8">(1)</span>
                      <div className="flex-1">
                        ดำเนินการส่งมอบสำเนาเอกสารใบคำสั่งซื้อ (PO) ของลูกค้าของผู้กู้ ใบวางบิลของผู้กู้ และเอกสารอื่นใดที่เกี่ยวข้องที่แสดงถึงสิทธิเรียกร้อง และ/หรือ หนี้ที่ผู้กู้มีต่อลูกค้าของผู้กู้ ที่ผู้ให้สินเชื่อยอมรับ พร้อมหลักฐานการตรวจรับสินค้า และ/หรือ ตรวจรับบริการที่มีลูกค้าของผู้กู้ หรือตัวแทนของลูกค้าของผู้กู้ได้ลงลายมือชื่อตรวจรับสินค้า และ/หรือ ตรวจรับบริการครบถ้วนสมบูรณ์ (“เอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้”) ให้แก่ผู้ให้สินเชื่อ ประกอบการเบิกใช้สินเชื่อแต่ละคราวตามข้อ 3.4 ของสัญญาฉบับนี้ (“โครงการ”) และให้ถือว่าเอกสารดังกล่าวเป็น <span className="font-bold underline decoration-1">เอกสารแนบท้ายหมายเลข 2</span> (สำเนาคำสั่งซื้อของลูกค้าของผู้กู้และสำเนาเอกสารวางบิลของผู้กู้) หรือ <span className="font-bold underline decoration-1">เอกสารแนบท้ายหมายเลข 3</span> <i>(ตารางแสดงใบคำสั่งซื้อและจำนวนเงินที่ผู้ให้สินเชื่อมีสิทธิหักเพื่อชำระคืนเงินในแต่ละรายการ)</i> (แล้วแต่กรณี) ของสัญญาฉบับนี้
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(4)}
      </div>

      {/* Page 5 */}
      <div data-section-id="od-conditions-extra" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span> {/* Spacer for 3.2 */}
            <div className="flex-1 text-justify">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8"></span> {/* Spacer for (ง) */}
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8"></span> {/* Spacer for (1) */}
                      <div className="flex-1">
                        <div className="mb-4">
                          อย่างไรก็ดี เนื่องจากผู้ให้สินเชื่อจะต้องพิจารณาถึงความสามารถในการชำระหนี้ของลูกค้าของผู้กู้ตามแต่ละโครงการ ดังนั้น ผู้กู้ตกลงให้เป็นสิทธิของผู้ให้สินเชื่อในการพิจารณาว่าจะยอมรับเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ตามวรรคแรกหรือไม่ก็ได้ ตามที่ผู้ให้สินเชื่อเห็นสมควร โดยไม่จำเป็นต้องชี้แจงหรือแสดงเหตุผล และไม่จำเป็นต้องแจ้งหรือบอกกล่าวให้ผู้กู้ทราบล่วงหน้า
                        </div>
                        <div>
                          และผู้กู้ตกลงจะไม่คัดค้าน โต้แย้ง หรือเรียกร้องค่าเสียหายใด ๆ จากการที่ผู้ให้สินเชื่อไม่ยอมรับเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้รายใดรายหนึ่ง หรือทุกรายในคราวใด ๆ จากผู้ให้สินเชื่อทั้งสิ้น
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(2)</span>
                      <div className="flex-1">
                        ดำเนินการแจ้งเป็นลายลักษณ์อักษรให้แก่ลูกค้าของผู้กู้ เพื่อเปลี่ยนแปลงช่องทางการรับชำระเงินของผู้กู้ตามมูลหนี้ที่เกิดขึ้นตามที่ระบุในเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ตามแต่ละโครงการ ซึ่งผู้กู้ได้ส่งมอบให้แก่ผู้ให้สินเชื่อตามข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ พร้อมจัดให้มีการลงนามโดยกรรมการผู้มีอำนาจลงนามของลูกค้าของผู้กู้ และประทับตราสำคัญของบริษัท (หากจำเป็น) หรือจัดให้มีการลงนามตามเงื่อนไขการลงนามนิติบุคคลตามหนังสือจดทะเบียนของลูกค้าของผู้กู้ในเอกสารแจ้งเปลี่ยนแปลงช่องการชำระเงินนั้นด้วย โดยมีสาระสำคัญตามแบบที่กำหนดใน<span className="font-bold underline decoration-1">เอกสารแนบท้ายหมายเลข 4</span> <i>(แบบของหนังสือแจ้งเปลี่ยนแปลงช่องทางการชำระเงิน)</i> ทั้งนี้ เพื่อให้ลูกค้าของผู้กู้ดำเนินการชำระหนี้ไปยังบัญชีธนาคารตามรายละเอียดที่ปรากฏในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ แทน
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(3)</span>
                      <div className="flex-1">
                        ดำเนินการแจ้งเป็นลายลักษณ์อักษรให้แก่ลูกค้าของผู้กู้ เพื่อโอนสิทธิเรียกร้องของผู้กู้ให้แก่ผู้ให้สินเชื่อแบบมีเงื่อนไข ในการรับชำระเงินจากลูกค้าของผู้กู้ตามมูลหนี้ที่เกิดขึ้นทั้งที่มีอยู่ในปัจจุบัน และที่จะเกิดขึ้นในอนาคตตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ที่ผู้กู้ได้ส่งมอบตามแต่ละโครงการ ให้ผู้ให้สินเชื่อตามข้อ 3.2 (ง) (1) ของสัญญาฉบับนี้ โดยมีสาระสำคัญตามแบบที่กำหนดใน<span className="font-bold underline decoration-1">เอกสารแนบท้ายหมายเลข 5</span> <i>(แบบของหนังสือบอกกล่าวการโอนสิทธิการรับชำระเงิน แบบมีเงื่อนไข)</i>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(4)</span>
                      <div className="flex-1">
                        ดำเนินการส่งมอบสำเนาเอกสาร และ/หรือ หลักฐานเกี่ยวกับการแจ้งลูกค้าของผู้กู้ตามที่กำหนดในข้อ 3.2 (ง) (2) และ ข้อ 3.2 (ง) (3) ของสัญญาฉบับนี้ให้แก่ผู้ให้สินเชื่อ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(5)}
      </div>

      {/* Page 6 */}
      <div data-section-id="od-conditions-extra-2" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8">3.3</span>
            <div className="flex-1 text-justify">
              <span className="mb-2 inline-block underline">เงื่อนไขบังคับเพิ่มเติมก่อนการเบิกใช้สินเชื่อ</span>

              <div className="space-y-4">
                {/* Dynamic conditions — show first batch on this page */}
                {conditions33.slice(0, cond33FirstPageCount).map((condition, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="shrink-0 w-8">({THAI_INDEX[idx]})</span>
                    <div className="flex-1">
                      <Highlight className="block">
                        {condition.split('\n').map((line, lIdx) => {
                          const match = line.match(/^\s*(\(\d+\))\s*(.*)/);
                          if (match) {
                            return (
                              <div key={lIdx} className="flex gap-2 pl-8">
                                <span className="shrink-0">{match[1]}</span>
                                <div className="flex-1">{match[2]}</div>
                              </div>
                            );
                          }
                          if (lIdx === 0) return <div key={lIdx}>{line || '\u00A0'}</div>;
                          return (
                            <div key={lIdx} className="flex gap-2 pl-8">
                              <span className="shrink-0 opacity-0 select-none">(1)</span>
                              <div className="flex-1">{line || '\u00A0'}</div>
                            </div>
                          );
                        })}
                      </Highlight>
                    </div>
                  </div>
                ))}
                {conditions33.length === 0 && (
                  <div className="text-gray-400 italic text-xs">— ยังไม่มีเงื่อนไขเพิ่มเติม —</div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3.4 only if NOT overflowing (stays on same page) */}
          {!hasCond33Overflow && (
            <div className="flex gap-2">
              <span className="shrink-0 w-8">3.4</span>
              <div className="flex-1 text-justify">
                <span className="mb-2 inline-block underline">การขอเบิกใช้สินเชื่อ</span>
                <div>
                  ผู้กู้มีสิทธิเบิกใช้สินเชื่อได้หลายครั้ง (Multiple Drawdown) ภายใต้เงื่อนไขว่าผู้กู้ต้องปฏิบัติตามเงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อตามข้อ 3.2 ของสัญญาฉบับนี้ในการเบิกใช้สินเชื่อแต่ละครั้ง และในกรณีที่ผู้กู้ได้ชำระคืน
                </div>
              </div>
            </div>
          )}
        </div>

        {renderPageFooter(6)}
      </div>

      {/* Overflow Page for Section 3.3 — only rendered when conditions33 overflows */}
      {hasCond33Overflow && (
        <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
          <PageHeader />

          <div className="space-y-6 mt-4">
            {/* Continuation of Section 3.3 items */}
            <div className="flex gap-2">
              <span className="invisible shrink-0 w-8">3.3</span>
              <div className="flex-1 space-y-4">
                {conditions33.slice(cond33FirstPageCount).map((condition, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="shrink-0 w-8">({THAI_INDEX[idx + cond33FirstPageCount]})</span>
                    <div className="flex-1 text-justify">
                      <Highlight className="block">
                        {condition.split('\n').map((line, lIdx) => {
                          const match = line.match(/^\s*(\(\d+\))\s*(.*)/);
                          if (match) {
                            return (
                              <div key={lIdx} className="flex gap-2 pl-8">
                                <span className="shrink-0">{match[1]}</span>
                                <div className="flex-1">{match[2]}</div>
                              </div>
                            );
                          }
                          if (lIdx === 0) return <div key={lIdx}>{line || '\u00A0'}</div>;
                          return (
                            <div key={lIdx} className="flex gap-2 pl-8">
                              <span className="shrink-0 opacity-0 select-none">(1)</span>
                              <div className="flex-1">{line || '\u00A0'}</div>
                            </div>
                          );
                        })}
                      </Highlight>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3.4 moved to this overflow page */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">3.4</span>
              <div className="flex-1 text-justify">
                <span className="mb-2 inline-block underline">การขอเบิกใช้สินเชื่อ</span>
                <div>
                  ผู้กู้มีสิทธิเบิกใช้สินเชื่อได้หลายครั้ง (Multiple Drawdown) ภายใต้เงื่อนไขว่าผู้กู้ต้องปฏิบัติตามเงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อตามข้อ 3.2 ของสัญญาฉบับนี้ในการเบิกใช้สินเชื่อแต่ละครั้ง และในกรณีที่ผู้กู้ได้ชำระคืน
                </div>
              </div>
            </div>
          </div>

          {/* This is the overflow page (page 7 in overflow layout) */}
          <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600 font-sans">
            <div>
              สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
            </div>
            <div>
              หน้า 7 จาก {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* Page 6 */}
      <div data-section-id="od-drawdown-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span> {/* Spacer for 3.4 header */}
            <div className="flex-1 text-justify">
              <div>
                เงินต้นจำนวนใด ๆ ให้แก่ผู้ให้สินเชื่อแล้ว ผู้กู้มีสิทธิเบิกใช้สินเชื่อจากผู้ให้สินเชื่อได้อีก โดยจำนวนที่เบิกใช้จะต้องไม่เกินส่วนต่างระหว่างวงเงินสินเชื่อกับยอดหนี้เงินต้นในขณะที่ขอเบิกใช้สินเชื่อ (Revolving) จากผู้ให้สินเชื่อตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้
              </div>

              <div className="mt-6 space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ก)</span>
                  <div className="flex-1">
                    <span className="mb-2 inline-block">วิธีการและเงื่อนไขในการขอเบิกใช้สินเชื่อ</span>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <span className="shrink-0 w-8">(1)</span>
                        <div className="flex-1">
                          ผู้กู้จะขอเบิกใช้สินเชื่อดังกล่าวได้ มีกำหนดระยะเวลา 1 ปี นับแต่วันที่ทำสัญญาฉบับนี้ แต่เมื่อครบกำหนดระยะเวลาให้สินเชื่อดังกล่าวแล้ว ถึงแม้ผู้กู้ได้ชำระหนี้หมดสิ้นภายในเวลาที่กำหนดหรือไม่ก็ตาม แต่ผู้กู้ยังคงเบิกเงินไปจากผู้ให้สินเชื่อต่อไปได้อีก ดังนั้น ผู้กู้ยอมให้ถือว่าผู้ให้สินเชื่อ ตกลงยืดอายุสัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข เกินสัญญาฉบับนี้ต่อไปมีกำหนดคราวละ 1 ปี นับแต่วันที่ครบกำหนดดังกล่าว แต่ไม่เกิน 3 ครั้ง โดยผู้กู้ไม่ต้องทำหนังสือแจ้งความประสงค์ต่อผู้ให้สินเชื่อ และให้ถือว่าเงินอันผู้กู้ได้เบิกไปจากผู้ให้สินเชื่อตามกำหนดเวลาดังกล่าวนี้ เป็นหนี้เงินกู้ตามสัญญานี้และอยู่ภายใต้ข้อตกลงและเงื่อนไขตามสัญญานี้ทุกประการ แต่ทั้งนี้ ในระหว่างการยืดอายุสัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข เกินสัญญาฉบับนี้ ผู้ให้สินเชื่อมีสิทธิพิจารณาทบทวนสัญญาทุก 1 ปี แต่พิจารณาทบทวนสัญญาได้ไม่เกิน 3 ครั้งเช่นกัน เพื่อพิจารณาว่าจะให้ยืดอายุสัญญาต่อไปหรือไม่ อย่างไร เว้นแต่ภายหลังจากที่กล่าวมาข้างต้นนี้ หากผู้กู้ประสงค์ที่จะขอขยายอายุสัญญาฉบับนี้ต่อไปอีก ผู้กู้ต้องทำเป็นหนังสือขอขยายอายุสัญญาฯ โดยผู้ให้สินเชื่อจะอนุญาตหรือไม่ก็ได้ขึ้นอยู่กับดุลยพินิจของผู้ให้สินเชื่ออย่างเด็ดขาด และผู้กู้จะไม่มีข้อโต้แย้งใดๆ ทั้งสิ้น
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="shrink-0 w-8">(2)</span>
                        <div className="flex-1">
                          ผู้กู้จะต้องเบิกใช้สินเชื่อเป็นรายครั้งตามแต่ละโครงการ ภายในวันที่ธนาคารเปิดดำเนินการเพื่อประกอบธุรกิจเป็นการทั่วไปในประเทศไทย <b>(“วันทำการ”)</b> ในระหว่างระยะเวลาซึ่งเริ่มต้นนับตั้งแต่วันทำสัญญาฉบับนี้ จนกว่าสัญญาฉบับนี้จะสิ้นสุดลง <b>(“ระยะเวลาการเบิกใช้สินเชื่อ”)</b> เท่านั้น
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(7)}
      </div>

      {/* Page 7 */}
      <div data-section-id="od-drawdown-methods" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span> {/* Spacer for 3.4 header */}
            <div className="flex-1 text-justify">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8"></span> {/* Spacer for (ก) header */}
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(3)</span>
                      <div className="flex-1">
                        ผู้กู้จะต้องยื่นหนังสือขอเบิกใช้สินเชื่อของผู้ให้สินเชื่อแต่ละราย ซึ่งมีสาระสำคัญตามแบบที่กำหนดไว้ใน <span className="font-bold underline decoration-1">เอกสารแนบท้ายหมายเลข 6</span> <i>(แบบของหนังสือขอเบิกใช้สินเชื่อ)</i> ให้แก่ตัวแทนสินเชื่อ อย่างน้อย 3 (สาม) วันทำการก่อนวันที่ระบุให้เป็นวันเบิกใช้สินเชื่อ <b>(“วันเบิกใช้สินเชื่อ”)</b> ในแต่ละคราว
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <span className="shrink-0 w-8"></span>
                      <div className="flex-1">
                        ทั้งนี้ ผู้กู้จะต้องเบิกใช้สินเชื่อภายในวงเงินไม่เกินร้อยละ 80 (แปดสิบ) ของมูลหนี้ที่เกิดขึ้นตามที่ระบุในเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ตามแต่ละโครงการ ซึ่งผู้กู้ได้ส่งมอบให้แก่ผู้ให้สินเชื่อตามข้อ 3.2 (ง) (1) ของสัญญาฉบับนี้ ในแต่ละคราว เว้นแต่ผู้ให้สินเชื่อกำหนดเป็นอย่างอื่นตามที่ผู้ให้สินเชื่อเห็นสมควร
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ข)</span>
                  <div className="flex-1">
                    <span className="mb-2 inline-block">วิธีการรับสินเชื่อและหลักฐานการรับสินเชื่อ</span>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <span className="shrink-0 w-8">(1)</span>
                        <div className="flex-1">
                          คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}ตกลงว่าวิธีการรับสินเชื่อตามสัญญาฉบับนี้ สามารถกระทำได้ในรูปแบบของแคชเชียร์เช็ค (Cashier Cheque) หรือเช็คธนาคารสั่งจ่ายล่วงหน้า ซึ่งออกโดยธนาคารพาณิชย์ที่กำหนดโดยผู้ให้สินเชื่อและยอมรับโดยผู้กู้ หรือ การโอนเงินเข้าบัญชีธนาคารของผู้กู้ หรือวิธีการอื่นใดที่คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}จะได้ตกลงร่วมกัน โดยผู้ให้สินเชื่อจะดำเนินการส่งมอบสินเชื่อให้ผู้กู้ด้วยวิธีการที่ระบุในหนังสือขอเบิกใช้สินเชื่อในแต่ละคราว ภายใต้เงื่อนไขดังต่อไปนี้

                          <div className="mt-4 space-y-4">
                            <div className="flex gap-2">
                              <span className="shrink-0 w-8">(1.1)</span>
                              <div className="flex-1">
                                <span className="underline">รูปแบบของแคชเชียร์เช็ค (Cashier Cheque)</span>
                                <div className="mt-2">
                                  ผู้ให้สินเชื่อตกลงจะส่งมอบแคชเชียร์เช็ค (Cashier Cheque) ตามจำนวนเงินที่ระบุในหนังสือขอเบิกใช้สินเชื่อจำนวน <Highlight>{isAgileOnly ? '1 (หนึ่ง)' : '2 (สอง)'}</Highlight> ฉบับ ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ให้แก่ผู้กู้ ณ ที่ทำการของผู้ให้สินเชื่อภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นกาารให้สินเชื่อเมื่อผู้ให้สินเชื่อได้มีการส่งมอบแคชเชียร์เช็ค (Cashier Cheque) ให้แก่ผู้กู้
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(8)}
      </div>

      {/* Page 8 */}
      <div data-section-id="od-drawdown-receipt" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span> {/* Spacer for 3.4 header */}
            <div className="flex-1 text-justify">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8"></span> {/* Spacer for (ข) header */}
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8"></span> {/* Spacer for (1) level */}
                      <div className="flex-1 space-y-6">
                        <div className="flex gap-2">
                          <span className="shrink-0 w-8">(1.2)</span>
                          <div className="flex-1">
                            <span className="underline">รูปแบบของเช็คธนาคารสั่งจ่ายล่วงหน้า</span>
                            <div className="mt-2 text-justify">
                              ผู้ให้สินเชื่อตกลงจะส่งมอบเช็คธนาคารสั่งจ่ายล่วงหน้าในนามผู้กู้ตามจำนวนเงินที่ระบุในหนังสือขอเบิกใช้เงินกู้จำนวน <Highlight>{isAgileOnly ? '1 (หนึ่ง)' : '2 (สอง)'}</Highlight> ฉบับ ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ให้แก่ผู้กู้ ณ ที่ทำการของผู้ให้สินเชื่อ ก่อนหรือภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อเมื่อผู้กู้ได้รับเงินจำนวนดังกล่าวไว้ในบัญชีธนาคารเต็มจำนวนเรียบร้อยแล้ว
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <span className="shrink-0 w-8">(1.3)</span>
                          <div className="flex-1">
                            <span className="underline">รูปแบบของการโอนเงินเข้าบัญชีธนาคารของผู้กู้</span>
                            <div className="mt-2 text-justify">
                              ผู้ให้สินเชื่อตกลงจะโอนเงินตามจำนวนเงินที่ระบุในหนังสือขอเบิกใช้สินเชื่อตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ให้แก่ผู้กู้ ไปยังบัญชีของผู้กู้ที่ระบุในหนังสือขอเบิกใช้สินเชื่อในแต่ละคราว ภายในวันที่เบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อเมื่อผู้กู้ได้รับเงินจำนวนดังกล่าวไว้ในบัญชีธนาคารเต็มจำนวนเรียบร้อยแล้ว
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <span className="shrink-0 w-8">(1.4)</span>
                          <div className="flex-1">
                            <span className="underline">รูปแบบอื่นใด</span>
                            <div className="mt-2 text-justify">
                              ผู้ให้สินเชื่อตกลงจะได้ส่งมอบสินเชื่อตามจำนวนที่ระบุในหนังสือขอเบิกใช้เงินกู้ให้แก่ผู้กู้ ตามวิธีการอื่นใดที่คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}จะได้ตกลงร่วมกัน ก่อนหรือภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อตามที่คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}จะได้ตกลงร่วมกัน
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <span className="shrink-0 w-8">(2)</span>
                      <div className="flex-1">
                        เมื่อผู้กู้ได้รับสินเชื่อจากผู้ให้สินเชื่อแล้ว ผู้กู้ต้องส่งมอบเอกสารการรับสินเชื่อตามจำนวนที่ได้รับจากผู้ให้สินเชื่อแต่ละราย ซึ่งมีสาระสำคัญตามแบบที่กำหนดใน <span className="font-bold underline decoration-1">เอกสารแนบท้ายหมายเลข 7</span> <i>(แบบของเอกสารการรับสินเชื่อ)</i> ให้แก่ตัวแทนสินเชื่อ ในวันเดียวกับวันที่ผู้กู้ได้รับสินเชื่อตามสัญญาฉบับนี้
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(9)}
      </div>

      {/* Page 9 */}
      <div data-section-id="od-interest-repayment" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-8 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2 items-center">
              <span className="font-bold shrink-0 w-8">4.</span>
              <span className="font-bold">ดอกเบี้ย</span>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">4.1</span>
              <div className="flex-1 text-justify">
                <span className="underline">ระยะเวลาของดอกเบี้ย</span>
                <div className="mt-2">
                  ภายใต้บังคับของสัญญาฉบับนี้ ให้ระยะเวลาของงวดดอกเบี้ยสินเชื่อมีกำหนดชำระพร้อมเงินต้น ตามแต่ละโครงการที่ผู้กู้ขอเบิกใช้
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">4.2</span>
              <div className="flex-1 text-justify">
                <span className="underline">อัตราดอกเบี้ย</span>
                <div className="mt-2">
                  ผู้กู้ตกลงยินยอมให้ผู้ให้สินเชื่อคิดดอกเบี้ยบนเงินต้นที่ยังไม่ได้ชำระคืนในอัตราร้อยละ <Highlight>1.25 ต่อเดือน</Highlight> ในรูปแบบดอกเบี้ยแบบคงที่ (Flat Interest Rate) โดยการคำนวณดอกเบี้ยให้เป็นไปตามธรรมเนียมปฏิบัติของผู้ให้สินเชื่อและภายใต้กฎหมายที่เกี่ยวข้อง นับแต่วันเบิกใช้สินเชื่อจนกว่าผู้กู้จะชำระคืนเงินตามข้อ 5.1 ของสัญญาฉบับนี้
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-2 items-center">
              <span className="font-bold shrink-0 w-8">5.</span>
              <span className="font-bold">การชำระคืนเงินต้นและดอกเบี้ย</span>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">5.1</span>
              <div className="flex-1 text-justify">
                ภายใต้บังคับของสัญญาฉบับนี้ ผู้กู้ตกลงชำระคืนเงินต้นของสินเชื่อพร้อมดอกเบี้ย (ไม่ว่าทั้งหมดหรือบางส่วน) ให้แก่ผู้ให้สินเชื่อ ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ในวันที่ครบกำหนดชำระหนี้ของมูลหนี้ที่เกิดขึ้นตามที่ระบุในเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ตามแต่ละโครงการ หรือวันอื่นใดที่ผู้ให้สินเชื่อกำหนด <b>(“วันครบกำหนดชำระเงิน”)</b>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">5.2</span>
              <div className="flex-1 text-justify">
                คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}ตกลงให้ผู้กู้สามารถชำระคืนเงินต้นก่อนวันครบกำหนดชำระเงินตามข้อ 5.1 ของสัญญาฉบับนี้ได้ (ไม่ว่าจะชำระคืนทั้งหมดหรือแต่เพียงบางส่วน) โดยให้คิดดอกเบี้ยตามจริงในส่วนของต้นเงินที่ขอเบิกใช้สินเชื่อไปจนถึงวันที่ผู้กู้ได้ชำระหนี้เงินต้นคืนทั้งหมด ทั้งนี้ การชำระคืนก่อนกำหนดดังกล่าวจะไม่ถือเป็นการผิดสัญญา
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(10)}
      </div>

      {/* Page 10 */}
      <div data-section-id="od-payment-methods" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2 items-center">
              <span className="font-bold shrink-0 w-8">6.</span>
              <span className="font-bold">วิธีการชำระเงิน</span>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">6.1</span>
              <div className="flex-1 text-justify">
                ในกรณีที่ผู้กู้ต้องชำระเงินใด ๆ ให้แก่ผู้ให้สินเชื่อ ผู้กู้ตกลงชำระเงินให้ผู้ให้สินเชื่อแต่ละรายตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ด้วยวิธีการดังต่อไปนี้ ในวันครบกำหนดชำระเงิน

                <div className="mt-6 space-y-6">
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ก)</span>
                    <div className="flex-1">
                      ผู้ให้สินเชื่อมีสิทธิดำเนินการตัด / หัก / ถอนเงินจากบัญชีธนาคารตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ เพื่อนำมาชำระคืนเงินต้น ดอกเบี้ย และค่าใช้จ่ายอื่น ๆ ที่เกิดขึ้นหรือเกี่ยวข้องกับสัญญาฉบับนี้ให้แก่ผู้ให้สินเชื่อทันที เมื่อผู้กู้ได้รับชำระเงินของผู้กู้จากลูกค้าของผู้กู้ ตามมูลหนี้ที่เกิดขึ้นตามที่ระบุในเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ ตามแต่ละโครงการ ซึ่งผู้กู้ได้ส่งมอบให้แก่ผู้ให้สินเชื่อตามข้อ 3.2 (ง) (1) ของสัญญาฉบับนี้ โดยผู้ให้สินเชื่อมิต้องบอกกล่าวให้ผู้กู้ทราบล่วงหน้า
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ข)</span>
                    <div className="flex-1">
                      ผู้ให้สินเชื่อมีสิทธิดำเนินการตัด / หัก / ถอนเงินจากบัญชีธนาคารตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ เพื่อนำมาชำระคืนหนี้อื่น ๆ ที่ผู้กู้คงค้างต่อผู้ให้สินเชื่อก่อน โดยไม่จำเป็นต้องแจ้งให้ผู้กู้ทราบล่วงหน้า หรือไม่จำเป็นต้องชี้แจง และผู้กู้จะไม่แสดงเหตุผลแห่งการใช้สิทธิไม่ยินยอมอย่างใด ๆ และผู้กู้ตกลงที่จะไม่คัดค้าน หรือโต้แย้งตลอดจนตกลงว่าจะไม่เรียกร้องค่าเสียหาย จากการที่ไม่ได้รับเงินเพราะการไม่ยินยอมดังเช่นที่ว่าไว้นั้นทั้งสิ้น แต่หากมีเงินคงเหลือจากที่หักหนี้คงค้างแล้ว ผู้ให้สินเชื่อยินดีที่จะโอนเงินคงเหลือให้แก่ผู้กู้ ตามบัญชีที่ผู้กู้ได้แจ้งไว้แก่ผู้ให้สินเชื่อ
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ค)</span>
                    <div className="flex-1">
                      ในกรณีที่ผู้กู้ไม่ได้รับการชำระเงินทั้งจำนวนหรือได้รับเงินเพียงบางส่วนจากลูกค้าของผู้กู้ และ/หรือ มีเหตุอื่นใดที่ทำให้ผู้ให้สินเชื่อไม่สามารถดำเนินการตัด / หัก / ถอนเงินจากบัญชีธนาคารตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ มาชำระคืนเงินต้น ดอกเบี้ย และค่าใช้จ่ายอื่น ๆ ที่เกิดขึ้นหรือเกี่ยวข้องกับสัญญาฉบับนี้ ผู้กู้ตกลงจะชำระเงินในรูปแบบหรือวิธีการอื่นใดที่ผู้ให้สินเชื่อกำหนดจนครบ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">6.2</span>
              <div className="flex-1 text-justify">
                ในกรณีที่คู่สัญญาฝ่ายใดฝ่ายหนึ่งมีความประสงค์จะเปลี่ยนแปลงวิธีการชำระเงินที่ระบุในข้อ 6.1 ของสัญญาฉบับนี้เป็นรูปแบบอื่น คู่สัญญาทั้งสามฝ่ายจะต้องตกลงกันเป็นลายลักษณ์อักษร
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(11)}
      </div>

      {/* Page 11 */}
      <div data-section-id="od-collateral" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2">
              <span className="shrink-0 w-8">6.3</span>
              <div className="flex-1 text-justify">
                ในกรณีที่ผู้กู้ประสงค์จะชำระหนี้ด้วยวิธีการอื่นใดเป็นครั้งคราว เนื่องจากมีเหตุผิดนัดชำระ ชำระเบี้ยปรับ ค่าใช้จ่ายอื่นใดที่เกี่ยวข้องกับสัญญาฉบับนี้ ให้ดำเนินการชำระผ่านบัญชีธนาคาร <b>ชื่อบัญชี บริษัท อาไจล์ แอสเซ็ทส์ จำกัด ธนาคารกสิกรไทย ประเภทออมทรัพย์ หมายเลขบัญชี 025-3-77662-5</b>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">6.4</span>
              <div className="flex-1 text-justify">
                คู่สัญญาทั้งสามฝ่ายตกลงว่าถ้าวันครบกำหนดชำระเงินใด ๆ มิใช่วันทำการ ก็ให้เงินจำนวนนั้น ๆ ถึงกำหนดชำระในวันทำการก่อนวันถึงกำหนดชำระนั้น
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">6.5</span>
              <div className="flex-1 text-justify">
                <b>การโอนสิทธิเรียกร้องในการรับชำระเงิน แบบมีเงื่อนไข</b> โดยผู้กู้ตกลงโอนสิทธิเรียกร้องของผู้กู้ให้แก่ผู้ให้สินเชื่อแบบมีเงื่อนไขในการรับชำระเงินของผู้กู้ ตามมูลหนี้ที่เกิดขึ้นทั้งที่มีอยู่ในปัจจุบัน และที่จะเกิดขึ้นในอนาคตตามที่ระบุในเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ ตามแต่ละโครงการ ซึ่งผู้กู้ได้ส่งมอบให้แก่ผู้ให้สินเชื่อตามข้อ 3.2 (ง) (1) ของสัญญาฉบับนี้ และผู้กู้ได้บอกกล่าวให้ลูกค้าของผู้กู้ทราบถึงการโอนสิทธิเรียกร้องในการรับชำระเงิน แบบมีเงื่อนไขดังกล่าว เป็นลายลักษณ์อักษรตามรายละเอียดและเงื่อนไขที่ระบุในข้อ 3.2 (ง) (3) ของสัญญาฉบับนี้
              </div>
            </div>

            <div className="flex gap-2 items-center pt-4">
              <span className="font-bold shrink-0 w-8">7.</span>
              <span className="font-bold">หลักประกัน</span>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.1</span>
              <div className="flex-1 text-justify">
                ในการทำสัญญาให้สินเชื่อแบบมีเงื่อนไขฉบับนี้ ผู้กู้ต้องจัดหาบุคคลหรือนิติบุคคลมาค้ำประกันให้แก่ผู้ให้สินเชื่อ <b>(“บุคคลค้ำประกัน”)</b>

                <div className="mt-6 space-y-6">
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ก)</span>
                    <div className="flex-1 text-justify">
                      <b>สัญญาค้ำประกันโดยบุคคลภายนอก</b>: <Highlight>{(guarantors || []).filter(g => g.guarantorName?.trim()).map((g, i) => `${i + 1}. ${g.guarantorName}`).join(' ') || '....................'}</Highlight> โดยผู้ค้ำประกันอาจเป็นบุคคลธรรมดาหรือนิติบุคคลซึ่งไม่มีหนี้สินล้นพ้นตัว มีแหล่งรายได้ชัดเจนและมีคุณสมบัติอื่นๆ ตามที่ผู้ให้สินเชื่อกำหนด โดยผู้ให้สินเชื่อขอสงวนสิทธิในการใช้ดุลยพินิจฝ่ายเดียวในการพิจารณาคุณสมบัติในการเลือกบุคคลที่เป็นผู้ค้ำประกัน เพื่อเข้าค้ำประกันแทนหรือเพิ่มเติม เพื่อค้ำประกันหนี้สินใดๆ ภายใต้หรือที่เกี่ยวข้องกับสัญญาฉบับนี้
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(12)}
      </div>

      {/* Page 12 */}
      <div data-section-id="od-collateral-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2">
              <span className="shrink-0 w-8"></span>
              <div className="flex-1 text-justify">
                นอกจากนี้ ผู้ให้สินเชื่อมีสิทธิกำหนดให้ผู้กู้จัดหาหลักประกันประเภทอื่น ๆ ตามที่ผู้ให้สินเชื่อเห็นสมควรมาเป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้กู้ที่มีต่อผู้ให้สินเชื่อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.2</span>
              <div className="flex-1 text-justify space-y-4">
                <div>
                  การโอนสิทธิเรียกร้องในการรับชำระเงิน แบบมีเงื่อนไขตามข้อ 6.5 ของสัญญาฉบับนี้ เป็นการโอนสิทธิแบบมีเงื่อนไขและผู้กู้ในฐานะผู้โอนสิทธิจะยกเลิกหรือเพิกถอนไม่ได้ เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อในฐานะผู้รับโอนสิทธิ
                </div>
                <div>
                  ทั้งนี้ ผู้ให้สินเชื่อต้องส่งหนังสือแจ้งการโอนสิทธิ เพื่อให้มีผลบังคับใช้ ซึ่งมีสาระสำคัญตามแบบที่กำหนดไว้ใน <b>เอกสารแนบท้ายหมายเลข 9</b> <i>(แบบของหนังสือแจ้งการโอนสิทธิมีผลบังคับใช้)</i> ให้แก่ลูกค้าของผู้กู้
                </div>
                <div>
                  อย่างไรก็ดี ผู้กู้ตกลงและยอมรับว่าผู้ให้สินเชื่อมีสิทธิ ที่จะบังคับสิทธิรับชำระเงินเพื่อการชำระหนี้หรือไม่ก็ได้ และการเลือกที่จะไม่บังคับชำระหนี้ด้วยการโอนสิทธิรับเงินนั้น ไม่เป็นเหตุให้จำนวนหนี้ที่ตามสัญญาฉบับนี้ลดลงตามมูลค่าของเงินที่มีสิทธิจะได้รับชำระจากลูกค้าของผู้กู้รายดังกล่าว
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.3</span>
              <div className="flex-1 text-justify space-y-4">
                <div>
                  ผู้กู้ตกลงและรับทราบว่าเมื่อการโอนสิทธิเรียกร้องในการรับชำระเงินมีผลบังคับใช้แล้ว สิทธิเรียกร้องในการรับชำระเงินจากลูกค้าของผู้กู้รายดังกล่าวจะเป็นสิทธิโดยเด็ดขาดของผู้ให้สินเชื่อ โดยผู้กู้ตกลงสละสิทธิใด ๆ ในการโต้แย้งหรือข้อเรียกร้องใด ๆ เกี่ยวกับการมีผลบังคับใช้ของการโอนสิทธิเรียกร้องในรับชำระเงินดังกล่าว และผู้กู้จะไม่มีสิทธิได้รับชำระเงินใด ๆ จากลูกค้าของผู้กู้รายดังกล่าวอีกต่อไป
                </div>
                <div>
                  อย่างไรก็ดี ผู้กู้จะต้องดำเนินการใด ๆ หรือส่งมอบเอกสารใด ๆ ทันทีที่ผู้ให้สินเชื่อร้องขอและยังคงมีหน้าที่ที่จะต้องช่วยดำเนินการและใช้ความพยายามอย่างเต็มที่เพื่อให้การโอนสิทธิเรียกร้องในการรับชำระเงินข้างต้นมีผลบังคับใช้ได้ตามกฎหมาย
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(13)}
      </div>

      {/* Page 13 */}
      <div data-section-id="od-collateral-final" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.4</span>
              <div className="flex-1 text-justify">
                ในกรณีที่ทรัพย์สินหลักประกันเป็นที่ดิน และ/หรือ สิ่งปลูกสร้าง และ/หรือ เครื่องจักร และ/หรือ หลักประกันอื่น ผู้กู้ตกลงจะดำเนินการประเมินมูลค่าของทรัพย์สินหลักประกันดังกล่าวโดยหน่วยงานที่เชื่อได้และเป็นที่ยอมรับของผู้ให้สินเชื่อ <b>(“ผู้ประเมินมูลค่าทรัพย์สิน”)</b> และผู้กู้จะดำเนินการให้ผู้ประเมินมูลค่าทรัพย์สินทบทวนมูลค่าทรัพย์สินหลักประกันทุก 4 (สี่) ปี นับแต่วันที่สัญญาฉบับนี้ และ/หรือ ให้เป็นดุลยพินิจของผู้ให้สินเชื่อ
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.5</span>
              <div className="flex-1 text-justify">
                ในกรณีที่ทรัพย์สินหลักประกันเป็นสิ่งปลูกสร้าง และ/หรือ เครื่องจักร ผู้กู้ตกลงจัดให้มีการทำประกันภัยทรัพย์สินบนสิ่งปลูกสร้าง และ/หรือ เครื่องจักรที่เป็นทรัพย์สินหลักประกันกับบริษัทประกันภัยที่ผู้ให้สินเชื่อยอมรับ ตลอดระยะเวลาจนกว่าผู้กู้จะชำระหนี้ตามสัญญาฉบับนี้จนครบถ้วน โดยผู้กู้จะเป็นผู้ชำระเบี้ยประกันและค่าใช้จ่าย และให้ผู้ให้สินเชื่อเป็นผู้รับผลประโยชน์ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.6</span>
              <div className="flex-1 text-justify space-y-4">
                <div>
                  ผู้กู้ตกลงว่าหากมูลค่าทรัพย์สินหลักประกันลดลงน้อยกว่ามูลค่าตามที่ระบุในข้อ 7.1 ของสัญญาฉบับนี้ ผู้กู้จะนำทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกันจนครบมูลค่าตามที่ระบุในข้อ 7.1 ของสัญญาฉบับนี้ ภายใน 30 (สามสิบ) วัน นับจากวันที่ผู้กู้ได้รับแจ้งจากผู้ให้สินเชื่อ
                </div>
                <div>
                  หากผู้กู้ประสงค์จะขยายระยะเวลาการหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ผู้กู้จะต้องแจ้งให้ตัวแทนสินเชื่อทราบเป็นลายลักษณ์อักษรล่วงหน้าก่อนครบกำหนดในวรรคแรกไม่น้อยกว่า 7 (เจ็ด) วัน และ
                </div>
                <div>
                  หากผู้ให้สินเชื่อตกลงยินยอมให้ขยายระยะเวลาในการหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ให้ถือว่าผู้ให้สินเชื่อยินยอมให้ขยายระยะเวลาเฉพาะคราวดังกล่าวเท่านั้น ทั้งนี้ ระยะเวลา หรือ การยินยอมดังกล่าวให้เป็นดุลยพินิจของผู้ให้สินเชื่อ
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.7</span>
              <div className="flex-1 text-justify">
                โดยไม่คำนึงถึงข้อ 7.1 ของสัญญาฉบับนี้ ผู้กู้ตกลงว่าในกรณีที่ผู้ให้สินเชื่อได้ร้องขอให้ผู้กู้จัดหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ผู้กู้ตกลงจัดหาทรัพย์สินเพิ่มเติมแก่ผู้ให้สินเชื่อภายใน 1 (หนึ่ง) เดือน นับจากวันที่ผู้ให้สินเชื่อร้องขอ ทั้งนี้ ผู้ให้สินเชื่อตกลงว่าจะไม่ใช้สิทธิในข้อนี้โดยไม่มีเหตุอันสมควร
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(14)}
      </div>

      {/* Page 14 */}
      <div data-section-id="od-collateral-final-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.8</span>
              <div className="flex-1 text-justify">
                ผู้กู้ตกลงเป็นผู้รับผิดชอบในค่าธรรมเนียม ค่าจดทะเบียน ค่าภาษีอากร อากรแสตมป์ การประเมินมูลค่าทรัพย์สิน หรือค่าใช้จ่ายอื่นใดอันเกี่ยวข้องสัญญาหรือเอกสารที่เกี่ยวข้องกับทรัพย์สินหลักประกัน หรือการให้หลักประกันใด ๆ ของสัญญาฉบับนี้ แต่เพียงผู้เดียว
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.9</span>
              <div className="flex-1 text-justify">
                ภายหลังจากที่ผู้กู้ได้ปฏิบัติหน้าที่ตามสัญญาฉบับนี้เสร็จสิ้นแล้ว ผู้ให้สินเชื่อตกลงจะดำเนินการตามที่จำเป็นเพื่อส่งคืนทรัพย์สินหลักประกันดังกล่าวแก่ผู้กู้ ภายใน 1 (หนึ่ง) เดือน หลังจากผู้กู้ได้ปฏิบัติหน้าที่ตามสัญญานี้เสร็จสิ้นดังกล่าว
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.10</span>
              <div className="flex-1 text-justify">
                ในกรณีผู้กู้มีการนำทรัพย์สินหลักประกันมาเป็นหลักประกันให้แก่ผู้ให้สินเชื่อ ถ้าผู้ให้สินเชื่อบังคับหลักประกัน ไม่ว่าจะด้วยวิธีการโอนสิทธิเรียกร้องในการรับชำระเงินแล้ว แต่ได้รับชำระเงินต่ำกว่าจำนวนหนี้ หรือ ขายทอดตลาดแล้ว ได้เงินสุทธิไม่พอชำระหนี้ หรือเอาทรัพย์สินหลักประกันหลุดเป็นสิทธิและราคาทรัพย์สินหลักประกันนั้น ต่ำกว่าจำนวนหนี้อยู่เท่าใด ผู้กู้ยอมชำระหนี้ที่ขาดจำนวนนั้นจากทรัพย์สินอื่นของผู้กู้ให้แก่ผู้ให้สินเชื่อตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ จนครบถ้วน
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.11</span>
              <div className="flex-1 text-justify">
                กรณีที่มีเครื่องจักรเป็นทรัพย์สินหลักประกัน ผู้กู้ยินยอมและอนุญาต ให้ผู้ให้สินเชื่อฝ่ายใดฝ่ายหนึ่ง ตัวแทน หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งโดยชอบจากผู้ให้สินเชื่อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งจากผู้ผลิตทรัพย์สินหรือตัวแทนจำหน่ายทรัพย์สินที่ใช้เป็นหลักประกัน ให้มีสิทธิเข้าถึงข้อมูลการใช้งานทรัพย์สินหลักประกันทั้งในการใช้งานและการบำรุงรักษา เพื่อให้สามารถตรวจสอบประสิทธิภาพของทรัพย์สินหลักประกันได้ในระหว่างที่สัญญาฉบับนี้มีผลบังคับใช้ ทั้งนี้ ไม่ว่าการเข้าถึงข้อมูลดังกล่าวจะกระทำผ่านทางระบบออนไลน์ หรือทางการติดต่อสื่อสารใด ๆ ทั้งนี้ หากผู้ให้สินเชื่อฝ่ายใดฝ่ายหนึ่งตรวจพบว่า ทรัพย์สินหรือส่วนหนึ่งส่วนใดของทรัพย์สินเสียหาย ชำรุด หรืออยู่ในสภาพที่ไม่เหมาะสมแก่การใช้งาน ตัวแทนสินเชื่อจะดำเนินการแจ้งเป็นลายลักษณ์อักษรไปยังผู้กู้เพื่อให้ทราบเรื่องดังกล่าว และให้ดำเนินการซ่อมแซมทรัพย์สินในการนี้ ผู้กู้ตกลงที่จะทำการซ่อมแซมทรัพย์สินหลักประกันให้กลับคืนสู่สภาพที่ดีและเหมาะสมในการใช้งานได้อย่างมีประสิทธิภาพ ภายในระยะเวลาที่ผู้ให้สินเชื่อกำหนด โดยค่าใช้จ่ายทั้งหมดให้ถือเป็นหน้าที่ของผู้กู้แต่เพียงผู้เดียว
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(15)}
      </div>

      {/* Page 15 */}
      <div data-section-id="od-default-interest" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2">
              <span className="shrink-0 w-8">7.12</span>
              <div className="flex-1 text-justify">
                กรณีที่ผู้ให้สินเชื่อจะดำเนินการบังคับชำระหนี้จากทรัพย์สินหลักประกันตามข้อ 11.2 (ก) ของสัญญาฉบับนี้ ผู้กู้ตกลงให้ผู้ให้สินเชื่อมีสิทธิในการพิจารณาบังคับชำระหนี้จากทรัพย์สินหลักประกัน ไม่ว่าจะทั้งหมดหรือบางส่วน และไม่ว่าจะเป็นทรัพย์สินหลักประกันอย่างใดอย่างหนึ่งหรือหลายอย่างแต่เพียงผู้เดียว และตกลงให้การที่ผู้ให้สินเชื่อไม่บังคับชำระหนี้จากทรัพย์สินหลักประกันอย่างใดอย่างหนึ่งหรือหลายอย่างนั้น ไม่เป็นเหตุให้จำนวนหนี้ที่ตามสัญญาฉบับนี้ลดลงตามมูลค่าของเงินที่มีสิทธิจะได้รับจากการบังคับทรัพย์สินหลักประกันดังกล่าว
              </div>
            </div>

            <div className="flex gap-2 items-center pt-4">
              <span className="font-bold shrink-0 w-8">8.</span>
              <span className="font-bold">ดอกเบี้ยผิดนัด</span>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">8.1</span>
              <div className="flex-1 text-justify space-y-4">
                <div>
                  หากผู้กู้ผิดนัดชำระหนี้ตามสัญญาฉบับนี้ <b>ผู้กู้ตกลงชำระดอกเบี้ยในอัตราดอกเบี้ยผิดนัดที่ร้อยละ 18 (สิบแปด) ต่อปี</b> และในการคิดดอกเบี้ยผิดนัดนั้น ให้คิดตามหลักเกณฑ์ดังต่อไปนี้
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ก)</span>
                  <div className="flex-1">
                    ในกรณีที่ผู้กู้ผิดนัดไม่ชำระหนี้เงินต้นหรือดอกเบี้ย ผู้กู้ยอมชำระดอกเบี้ยในอัตราดอกเบี้ยผิดนัดบนจำนวนเงินต้นที่ยังไม่ได้ชำระคืน นับแต่วันครบกำหนดชำระเงิน เป็นต้นไปจนกว่าจะชำระหนี้ค้างชำระจนครบถ้วน
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ข)</span>
                  <div className="flex-1">
                    ในกรณีที่ผู้กู้ผิดนัดไม่ชำระเงินอื่นใดนอกเหนือจากข้อ (ก) ข้างต้น ผู้กู้ยอมชำระดอกเบี้ยในอัตราดอกเบี้ยผิดนัดบนเงินจำนวนนั้น ๆ นับแต่วันครบกำหนดชำระหนี้ดังกล่าว ที่ผู้กู้ผิดนัดชำระเป็นต้นไปจนกว่าผู้กู้จะชำระจนครบถ้วน
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(16)}
      </div>

      {/* Page 16 */}
      <div data-section-id="od-representations" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2 items-center pt-4">
              <span className="font-bold shrink-0 w-8">9.</span>
              <span className="font-bold">คำรับรองและยืนยัน</span>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8"></span>
              <div className="flex-1 text-justify">
                ผู้กู้ยอมรับว่าผู้ให้สินเชื่อได้เข้าทำสัญญานี้ โดยอาศัยคำรับรองและยืนยันที่ผู้กู้ได้ให้ไว้ต่อผู้ให้สินเชื่อ ดังนั้น ผู้กู้จึงขอให้คำรับรองและยืนยันต่อผู้ให้สินเชื่อตั้งแต่วันที่ของสัญญาฉบับนี้จนกระทั่งถึงวันที่ผู้กู้ไม่มีหนี้ค้างชำระ หรือหน้าที่อื่นใดภายใต้สัญญานี้อีกต่อไปว่า
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ก)</span>
              <div className="flex-1 text-justify">
                <b>สถานภาพ</b>: ผู้กู้เป็นบริษัทจำกัดที่จัดตั้งขึ้นและดำรงอยู่อย่างถูกต้องตามกฎหมายไทย
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ข)</span>
              <div className="flex-1 text-justify space-y-4">
                <div>
                  <b>อำนาจ</b>: เอกสารจัดตั้งของผู้กู้มีข้อกำหนดซึ่งให้อำนาจผู้กู้เข้าทำเอกสารทางธุรกรรมที่ตนเป็นคู่สัญญา และดำเนินการต่าง ๆ ตามที่ระบุไว้ หรือที่ผู้กู้ต้องทำภายใต้เอกสารทางธุรกรรมซึ่งเป็นคู่สัญญา และผู้กู้มีอำนาจหรือได้รับอำนาจทุกประการในส่วนของตนในการเป็นเจ้าของทรัพย์สิน ในการประกอบธุรกิจ และดำเนินการต่าง ๆ ของตนตามที่กระทำอยู่ในปัจจุบัน และเอกสารทางธุรกรรมที่ตนเป็นคู่สัญญาเป็นเอกสารที่สมบูรณ์ ถูกต้อง และมีผลใช้บังคับกับผู้กู้ตามข้อกำหนดของเอกสารทางธุรกรรมที่เกี่ยวข้องดังกล่าว
                </div>
                <div>
                  <b>“เอกสารทางธุรกรรม”</b> หมายถึง สัญญาให้สินเชื่อฉบับนี้ สัญญาหลักประกัน (ถ้ามี) และเอกสารอื่น ๆ ที่เกี่ยวข้อง
                </div>
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ค)</span>
              <div className="flex-1 text-justify space-y-4">
                <div>
                  <b>อำนาจกระทำการ</b>: ผู้กู้ได้กระทำการที่จำเป็นทุกประการเพื่อ:
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(1)</span>
                  <div className="flex-1">
                    ให้ได้รับอำนาจในการเข้าทำและดำเนินการตามเอกสารทางธุรกรรมซึ่งเป็นคู่สัญญา และ
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(2)</span>
                  <div className="flex-1">
                    ให้เอกสารทางธุรกรรมที่เป็นคู่สัญญาดังกล่าวนั้นมีผลสมบูรณ์ ผูกพัน และมีผลใช้บังคับกับคู่สัญญาแต่ละฝ่ายได้
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ง)</span>
              <div className="flex-1 text-justify">
                <b>ความสมบูรณ์ของสัญญา</b>: เอกสารทางธุรกรรมที่ผู้กู้เป็นคู่สัญญาเป็นเอกสารที่สมบูรณ์ ถูกต้อง และมีผลใช้บังคับกับผู้กู้ได้ตามข้อกำหนดของเอกสารทางธุรกรรมนั้น
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(17)}
      </div>

      {/* Page 17 */}
      <div data-section-id="od-representations-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(จ)</span>
              <div className="flex-1 text-justify">
                <b>การไม่ทำผิดกฎหมาย</b>: การเข้าทำเอกสารทางธุรกรรม และการดำเนินกาใด ๆ ตามที่ระบุไว้ในเอกสารทางธุรกรรมดังกล่าวที่ผู้กู้เป็นคู่สัญญา ไม่เป็นการขัด หรือจะไม่ขัด หรือเป็นเหตุให้เกิดการผิดนัดขึ้น หรือเป็นการกระทำที่เกินขอบอำนาจของตนหรือของกรรมการภายใต้ กฎหมาย ระเบียบ ข้อบังคับ หรือใบอนุญาตใด ๆ ซึ่งผู้กู้หรือทรัพย์สินของผู้กู้อยู่ในบังคับ หรือ หนังสือรับรอง หนังสือบริคณห์สนธิ หรือข้อบังคับของผู้กู้ หรือ สัญญาใด ๆ ซึ่งผู้กู้เป็นคู่สัญญา หรือซึ่งทรัพย์สินใด ๆ ของผู้กู้นั้นผูกพันอยู่
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ฉ)</span>
              <div className="flex-1 text-justify">
                <b>การไม่มีกระบวนการพิจารณาคดี</b>: ไม่มีกระบวนการพิจารณาในทางศาล ในทางอนุญาโตตุลาการ หรือการดำเนินการใด ๆ หรือไม่มีการฟ้องร้องดำเนินคดี ซึ่งเมื่อพิจารณาโดยแยกต่างหากจากกัน หรือเมื่อพิจารณาร่วมกันกับกระบวนการพิจารณาอื่น ๆ หรือข้อฟ้องร้องอื่น ๆ อาจมีผลกระทบในทางลบอย่างมีนัยสำคัญต่อผู้กู้ในการปฏิบัติหน้าที่ภายใต้เอกสารทางธุรกรรมที่ตนเป็นคู่สัญญา
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ช)</span>
              <div className="flex-1 text-justify">
                <b>การเลิกบริษัทหรือกระบวนการล้มละลาย</b>: ผู้กู้ไม่อยู่ในระหว่างการเลิกบริษัทหรือขั้นตอนการฟ้องหรือการดำเนินขบวนการล้มละลาย
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ซ)</span>
              <div className="flex-1 text-justify">
                <b>ความถูกต้องของข้อมูล</b>: ข้อมูลต่าง ๆ ที่ผู้กู้ได้ส่งมอบให้กับผู้ให้สินเชื่อเพื่อใช้ประกอบการพิจารณาให้สินเชื่อแก่ผู้กู้ภายใต้สัญญาฉบับนี้นั้นเป็นข้อมูลที่ถูกต้อง
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ฌ)</span>
              <div className="flex-1 text-justify">
                <b>สถานะของลูกค้าของผู้กู้</b>: ลูกค้าของผู้กู้เป็นลูกค้าปกติ ซึ่งไม่เคยผิดนัดชำระหนี้แก่ผู้กู้ และไม่เคยมีข้อพิพาทที่มีผลกระทบอย่างมีนัยสำคัญต่อการชำระหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ กับผู้กู้
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ญ)</span>
              <div className="flex-1 text-justify">
                <b>สถานะของมูลหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้</b>: มูลหนี้ที่เกิดขึ้นระหว่างผู้กู้และลูกค้าของผู้กู้ตามที่ระบุในเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้นั้นมีอยู่จริง ยังไม่ถึงกำหนดชำระหนี้ของลูกค้าของผู้กู้ และผู้กู้ยังไม่ได้รับชำระเงินจากลูกค้าของผู้กู้ไม่ว่าจะทั้งหมดหรือบางส่วน
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(18)}
      </div>

      {/* Page 18 */}
      <div data-section-id="od-representations-final" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ฎ)</span>
              <div className="flex-1 text-justify">
                <b>สิทธิเรียกร้องของผู้กู้ในมูลหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้</b>: ผู้กู้มีสิทธิ และ/หรือ หน้าที่โดยสมบูรณ์ในมูลหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ ไม่มีข้อกำหนดใด ๆ ในเอกสารดังกล่าวที่มีสาระสำคัญเป็นการห้ามไม่ให้ผู้กู้โอนสิทธิ และ/หรือ หน้าที่ ให้แก่ผู้ให้สินเชื่อ อีกทั้ง ผู้กู้ไม่เคยโอนสิทธิ และ/หรือ หน้าที่ และ ไม่เคยก่อภาระติดพันใด ๆ ในสิทธิ และ/หรือ หน้าที่ตามเอกสารดังกล่าวให้แก่บุคคลอื่น
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ฏ)</span>
              <div className="flex-1 text-justify">
                <b>กรรมการผู้มีอำนาจลงนาม</b>: นายพรรษา เริงพิทยา ซึ่งหากปัจจุบันหรืออนาคตมิได้เป็นกรรมการผู้มีอำนาจลงนามผูกพันนิติบุคคลของผู้กู้แล้ว ผู้กู้ตกลงยินยอมให้ผู้ให้สินเชื่อมีสิทธิพิจารณาบอกเลิกสัญญา และ/หรือ ระงับหรือเพิกถอนวงเงินใช้สินเชื่อทั้งหมดหรือบางส่วนได้ทันที โดยไม่ต้องบอกกล่าวล่วงหน้า ทั้งนี้ ผู้กู้ตกลงว่าจะไม่ติดใจ และไม่โต้แย้งใด ๆ รวมถึงเรียกร้องค่าเสียหาย หรือยกเป็นข้อต่อสู้ในภายหลังได้
              </div>
            </div>

            <div className="flex gap-2 pl-10">
              <span className="shrink-0 w-8">(ก)</span>
              <div className="flex-1 text-justify space-y-4">
                <div>
                  <u>สัดส่วนผู้ถือหุ้น</u>: กรณีมีผู้ถือหุ้นรายใดรายหนึ่ง ณ วันทำสัญญาฉบับนี้ นอกเหนือจากนายพรรษา เริงพิทยา ยังถือหุ้นในสัดส่วนตั้งแต่ร้อยละ 25 ขึ้นไป ภายหลังจากระยะเวลา 6 เดือน นับแต่วันที่ทำสัญญาฉบับนี้ ผู้กู้ต้องจัดให้ผู้ถือหุ้นรายนั้นเข้าทำสัญญาค้ำประกันเพิ่มเติมทันที และ
                </div>
                <div>
                  นับจากวันทำสัญญาฉบับนี้ถ้ามีบุคคลใดบุคคลหนึ่ง หรือกลุ่มบุคคลใด เข้ามาถือหุ้นในนิติบุคคลของผู้กู้ ในสัดส่วนตั้งแต่ร้อยละ 25 ขึ้นไป นอกจากที่ระบุไว้ข้างต้น ไม่ว่าการถือหุ้นดังกล่าวจะเกิดจากการซื้อขาย โอนหุ้น การเพิ่มทุน หรือเหตุอื่นใด ผู้กู้ตกลงจะแจ้งให้ผู้ให้สินเชื่อทราบเป็นลายลักษณ์อักษรโดยทันที และจัดให้ผู้ถือหุ้นรายดังกล่าวเข้าทำสัญญาค้ำประกันภายในระยะเวลาที่ผู้ให้สินเชื่อกำหนด ผู้ให้สินเชื่อมีสิทธิ ระงับวงเงินสินเชื่อทั้งหมดหรือบางส่วน หรือบอกเลิกสัญญานี้ได้ทันที โดยไม่จำเป็นต้องบอกกล่าวล่วงหน้า และผู้กู้ตกลงจะไม่โต้แย้ง ไม่เรียกร้องค่าเสียหาย หรือยกข้อขัดข้องใด ๆ ขึ้นเป็นข้อต่อสู้ในภายหลังเกี่ยวกับการใช้สิทธิของผู้ให้สินเชื่อตามข้อกำหนดนี้
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(19)}
      </div>

      {/* Page 19 */}
      <div data-section-id="od-covenants" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="space-y-6">
            <div className="flex gap-2 pt-4">
              <span className="font-bold shrink-0 w-8">10.</span>
              <div className="flex-1">
                <div className="font-bold mb-6">ข้อตกลงกระทำการ</div>
                <div className="text-justify mb-6">
                  ผู้กู้ตกลงว่าตั้งแต่วันที่สัญญามีผลใช้บังคับจนกระทั่งถึงวันที่ผู้กู้ไม่มีหนี้ค้างชำระ หรือหน้าที่อื่นใดภายใต้สัญญานี้อีกต่อไป
                </div>

                <div className="space-y-6">
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ก)</span>
                    <div className="flex-1 text-justify">
                      <b>สถานะของผู้กู้</b>: ผู้กู้ต้องดำรงไว้ซึ่งการมีอยู่ของบริษัทจำกัด และดำเนินกิจการของตนอย่างถูกต้อง มีประสิทธิภาพ และเป็นไปตามบทบัญญัติของกฎหมาย รวมถึงดำเนินการชำระค่าภาษีอากรที่ผู้กู้มีหน้าที่ต้องชำระอย่างครบถ้วนตามกำหนด
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ข)</span>
                    <div className="flex-1 text-justify">
                      <b>การประกอบธุรกิจของผู้กู้</b>: ผู้กู้ต้องไม่เปลี่ยนแปลงสาระสำคัญใด ๆ ในธุรกิจที่ดำเนินอยู่ในขณะนี้ หรือประกอบธุรกิจประเภทอื่นที่แตกต่างไปจากประเภทธุรกิจที่ดำเนินอยู่ในขณะสัญญาฉบับนี้ หรือกระทำการใด ๆ อันมีลักษณะและผลเช่นเดียวกันกับการเปลี่ยนแปลงประเภทธุรกิจ เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ค)</span>
                    <div className="flex-1 text-justify">
                      <b>การปฏิบัติตามกฎหมาย</b>: ผู้กู้ต้องปฏิบัติตามกฎหมาย และดำเนินการทุกประการเพื่อให้แน่ใจว่าผู้กู้ได้ดำเนินธุรกิจของตนตามกฎ ข้อบังคับ มาตรฐาน และกฎหมายที่เกี่ยวข้องทุกประการ
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ง)</span>
                    <div className="flex-1 text-justify">
                      <b>การไม่ก่อหนี้เพิ่มเติม</b>: ผู้กู้ต้องไม่ก่อหนี้ หรือภาระใด ๆ โดยการกู้ยืมจากบุคคลใด ๆ หรือโดยวิธีการอื่นเพิ่มเติม เว้นแต่เป็นการก่อหนี้ในทางการค้าปกติของผู้กู้ หรือได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(20)}
      </div>

      {/* Page 20 */}
      <div data-section-id="od-covenants-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1 space-y-6">
              <div className="flex gap-2">
                <span className="shrink-0 w-8">(จ)</span>
                <div className="flex-1 text-justify">
                  <b>การจัดส่งงบการเงินประจำปี</b>: ผู้กู้ต้องส่งสำเนางบการเงินซึ่งได้รับการตรวจสอบบัญชีจากผู้ตรวจสอบบัญชีที่ได้รับอนุญาตที่เชื่อถือได้และผู้ให้สินเชื่อให้การยอมรับ ภายในระยะเวลาไม่เกิน 120 (หนึ่งร้อยยี่สิบ) วัน นับแต่วันสิ้นงวดปีบัญชีนั้น ๆ พร้อมทั้งให้กรรมการผู้มีอำนาจลงนามรับรองสำเนาถูกต้องให้แก่ผู้ให้สินเชื่อ
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ฉ)</span>
                <div className="flex-1 text-justify">
                  <b>การดำรงไว้ซึ่งสัดส่วนหนี้สินต่อทุน</b>: ผู้กู้ต้องดำรงสัดส่วนหนี้สินต่อทุน (Debt to Equity Ratio) ของผู้กู้ไว้ในอัตราไม่เกิน 4 เท่า ณ วันสิ้นงวดปีบัญชีของแต่ละปี หากไม่ตรงตามเงื่อนไขให้ขึ้นอยู่กับดุลยพินิจของผู้ให้สินเชื่อ
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ช)</span>
                <div className="flex-1 text-justify">
                  <b>การไม่จ่ายเงินปันผล</b>: ผู้กู้ต้องไม่ประกาศจ่ายเงินปันผล ในกรณีที่ผู้กู้ผิดนัดไม่ชำระเงินต้น และ/หรือดอกเบี้ย หรือ เงินอื่น ๆ ตามสัญญาฉบับนี้ที่ถึงกำหนดชำระแล้วและการผิดนัดดังกล่าวยังไม่ได้รับการแก้ไข หรือมีเหตุผิดนัดหรือเหตุการณ์ที่อาจกลายเป็นเหตุผิดนัดเกิดขึ้น เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ซ)</span>
                <div className="flex-1 text-justify">
                  <b>การไม่จำหน่ายทรัพย์สินของผู้กู้</b>: ผู้กู้ต้องไม่จำหน่าย จ่าย โอน ให้เช่า จำนำ จำนอง ก่อให้เกิดภาระติดพัน หรือยอมรับให้มีการรอนสิทธิโดยบุคคลหนึ่งบุคคลใดเหนือทรัพย์สินของผู้กู้ เว้นแต่ การจำหน่ายไปไม่ก่อให้เกิดผลกระทบในทางลบอย่างมีนัยสำคัญต่อผู้กู้ในการปฏิบัติหน้าที่ตามสัญญาฉบับนี้ หรือเป็นการทางการค้าปกติของผู้กู้ หรือ เป็นการจำหน่ายทรัพย์สินที่เสื่อมสภาพอันเนื่องมาจากลักษณะหรือสภาพของทรัพย์สินนั้นเอง หรือ ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ฌ)</span>
                <div className="flex-1 text-justify">
                  <b>การดำรงไว้ซึ่งทรัพย์สินหลักประกัน</b>: ผู้กู้ต้องดำรงไว้ซึ่งทรัพย์สินหลักประกัน และจะไม่จำหน่าย จ่าย โอน ให้เช่า จำนำ จำนอง ก่อให้เกิดภาระติดพัน หรือยอมรับให้มีการรอนสิทธิโดยบุคคลหนึ่งบุคคลใดเหนือทรัพย์สินหลักประกัน เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter(21)}
        </div>
      </div>

      {/* Page 21 */}
      <div data-section-id="od-covenants-cont-2" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1 space-y-6">
              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ญ)</span>
                <div className="flex-1 text-justify">
                  <b>การยินยอมให้เปิดเผยข้อมูล</b>: ผู้กู้ยินยอมให้ผู้ให้สินเชื่อทั้งสองเปิดเผยข้อมูลที่จำเป็นเกี่ยวกับผู้กู้ให้แก่บริษัทในเครือ ที่ปรึกษา และ/หรือ ผู้รับโอนสิทธิ และ/หรือ หน้าที่ของผู้ให้สินเชื่อภายใต้สัญญานี้ หรือเปิดเผยข้อมูลของผู้กู้ให้แก่บุคคลหรือหน่วยงานที่ผู้ให้สินเชื่อทั้งสองมีความจำเป็นต้องเปิดเผยภายใต้กฎหมายที่เกี่ยวข้อง ทั้งนี้ เมื่อผู้ให้สินเชื่อรายใดรายหนึ่งร้องขอ ผู้กู้ตกลงยินยอมให้ผู้ให้สินเชื่อดังกล่าว ตรวจสอบ และเปิดเผยข้อมูลทางการเงินที่เกี่ยวข้องกับความน่าเชื่อถือของผู้กู้และกรรมการผู้มีอำนาจลงนามของผู้กู้
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ฎ)</span>
                <div className="flex-1 text-justify">
                  <b>การยินยอมให้ตรวจสอบข้อมูลเครดิต</b>: ผู้กู้ตกลงยินยอมและจะให้ความร่วมมือทุกประการแก่ผู้ให้สินเชื่อในการดำเนินการตรวจสอบข้อมูลเครดิต และ/หรือ ข้อมูลอื่น ๆ ที่ผู้กู้มีอยู่กับบริษัท ข้อมูลเครดิตแห่งชาติ จำกัด (National Credit Bureau) หรือบริษัทข้อมูลเครดิตอื่นที่ได้จัดตั้งขึ้นและได้รับอนุญาตให้ประกอบธุรกิจภายใต้กฎหมายว่าด้วยการประกอบธุรกิจข้อมูลเครดิต และ/หรือ นิติบุคคลอื่น
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ฏ)</span>
                <div className="flex-1 text-justify">
                  <b>หน้าที่กระทำการอื่นใด</b>: ผู้กู้จะต้องกระทำการ หรือปฏิบัติตามคำร้องขอของผู้ให้สินเชื่ออื่นใดเพิ่มเติม เพื่อให้การดำเนินการ หรือปฏิบัติตามสัญญานี้ของคู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}สำเร็จลุล่วงไปได้ด้วยดี
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ฐ)</span>
                <div className="flex-1 text-justify">
                  <b>การระดมทุน</b>: ผู้ให้สินเชื่อมีสิทธิที่จะหาแหล่งเงินทุน หรือหาผู้ร่วมระดมทุนในการทำสัญญาตัวนี้เพิ่มเติมได้ โดยการใช้ดุลยพินิจของผู้ให้สินเชื่อเอง และไม่จำเป็นต้องแจ้งให้ผู้กู้ทราบในรายละเอียดดังกล่าว
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ฑ)</span>
                <div className="flex-1 text-justify">
                  <b>การโอนสิทธิและ/หรือ หน้าที่</b>: ผู้กู้ตกลงจะไม่โอนสิทธิ และ/หรือ หน้าที่ตามสัญญาฉบับนี้ให้แก่บุคคลใด และผู้กู้ยินยอมให้ผู้ให้สินเชื่อฝ่ายใดฝ่ายหนึ่งโอนสิทธิ และ/หรือ หน้าที่ตามสัญญาฉบับนี้ ไม่ว่าจะเป็นเรื่องเกี่ยวกับการรับชำระเงิน การดำเนินการที่เกี่ยวข้องกับทรัพย์สินหลักประกัน และ/หรือ การดำเนินการอื่นใดได้ โดยการแจ้งเป็นลายลักษณ์อักษรล่วงหน้า 30 (สามสิบ) วัน แก่ผู้กู้
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter(22)}
        </div>
      </div>
      {/* Page 22 */}
      <div data-section-id="od-covenants-cont-3" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1 space-y-6">
              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ฒ)</span>
                <div className="flex-1 text-justify">
                  <b>การไม่เปลี่ยนแปลงผู้มีอำนาจลงนามสั่งจ่าย / ถอนเงินหรือทำธุรกรรมของบัญชีธนาคาร</b>: ผู้กู้ตกลงจะไม่เปลี่ยนแปลงผู้มีอำนาจลงนามสั่งจ่าย / ถอนเงินหรือทำธุรกรรมของบัญชีธนาคารตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ เว้นแต่ได้รับความยินยอมจากผู้ให้สินเชื่อ
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ณ)</span>
                <div className="flex-1 text-justify">
                  <b>การปฏิบัติตามหน้าที่ของผู้กู้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้</b>: ผู้กู้ตกลงจะปฏิบัติตามหน้าที่ที่ผู้กู้มีต่อลูกค้าของผู้กู้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้อย่างครบถ้วน ซึ่งรวมถึงแต่ไม่จำกัดเพียงการผลิตสินค้า และ/หรือ บริการ การนำส่งสินค้า และ/หรือ ให้บริการ หรือการดำเนินกาใด ๆ ซึ่งป้องกัน และ/หรือ เยียวยาไม่ให้ลูกค้าของผู้กู้ยกข้อต่อสู้มาเพื่อจะไม่ชำระหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้า
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ด)</span>
                <div className="flex-1 text-justify">
                  <b>การไม่กระทำการใด ๆ ซึ่งอาจมีผลต่อการชำระหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้</b>: ไม่ว่ากรณีใด ๆ ผู้กู้ตกลงจะไม่ผ่อนผันเวลาการชำระหนี้ และ/หรือ ไม่ปลดหนี้ และ/หรือ ไม่ลดหนี้ และ/หรือ ไม่กระทำการใด ๆ ซึ่งอาจมีผลต่อการชำระหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
                </div>
              </div>

              <div className="flex gap-2">
                <span className="shrink-0 w-8">(ต)</span>
                <div className="flex-1 text-justify">
                  <b>หน้าที่ของผู้กู้หากลูกค้าของผู้กู้ไม่ชำระเงินหรือชำระเงินเพียงบางส่วน</b>: ในกรณีที่ลูกค้าของผู้กู้ไม่ชำระเงินทั้งหมดหรือชำระเงินเพียงบางส่วนตามมูลหนี้ที่เกิดขี้นตามที่ระบุในเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ ตามแต่ละโครงการ ซึ่งผู้กู้ได้ส่งมอบให้แก่ผู้ให้สินเชื่อตามข้อ 3.2 (ง) (1) ของสัญญาฉบับนี้ หรือมีเหตุอื่นใดที่ทำให้ลูกค้าของผู้กู้ไม่สามารถชำระเงินใด ๆ ภายใต้เอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ดังกล่าว ผู้กู้ตกลงและรับทราบว่าผู้กู้ยังคงมีหน้าที่ชำระเงินใด ๆ ตามสัญญาฉบับนี้ให้แก่ผู้ให้สินเชื่อแต่ละรายตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ในวันครบกำหนดชำระเงิน และผู้กู้ตกลงจะไม่ยกเหตุของลูกค้าของผู้กู้ใด ๆ มาเป็นข้อต่อสู้ หรือข้อยกเว้นในการไม่ชำระเงินใด ๆ ตามสัญญาฉบับนี้ทั้งสิ้น
                </div>
              </div>
            </div>
          </div>

          {renderPageFooter(23)}
        </div>
      </div>
      {/* Page 23 */}
      <div data-section-id="od-default" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2 items-center">
            <span className="font-bold shrink-0 w-8">11.</span>
            <span className="font-bold">เหตุผิดนัด</span>
          </div>

          <div className="flex gap-2">
            <span className=" shrink-0 w-8">11.1</span>
            <div className="flex-1">
              <span className="">เหตุผิดนัด</span>
              <div className="mt-4 text-justify">
                เมื่อเกิดเหตุการณ์ใดเหตุการณ์หนึ่งดังต่อไปนี้ขึ้นให้ถือว่าเป็นเหตุผิดนัด
              </div>

              <div className="mt-6 space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ก)</span>
                  <div className="flex-1 text-justify">
                    <b>การไม่ชำระหนี้เงิน</b>: เมื่อผู้กู้ ผิดนัดไม่ชำระเงินจำนวนใด ๆ ภายใต้สัญญาฉบับนี้เมื่อถึงกำหนดชำระ หรือเมื่อมีการเรียกร้องให้มีการชำระแต่ผู้กู้ไม่ชำระตามกำหนดเวลา
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ข)</span>
                  <div className="flex-1 text-justify">
                    <b>การผิดข้อสัญญา</b>: ผู้กู้ไม่ปฏิบัติตามหน้าที่ใด ๆ หรือไม่ปฏิบัติตามข้อตกลง หรือข้อกำหนดใด ๆ ซึ่งได้กระทำขึ้นภายใต้ หรือเกี่ยวข้องกับเอกสารทางธุรกรรม (นอกเหนือจากเหตุผิดนัดตามข้อ 11.1 (ก) และ ข้อ 11.1 (ซ) ของสัญญาฉบับนี้)
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ค)</span>
                  <div className="flex-1 text-justify">
                    <b>การผิดคำรับรอง</b>: ผู้กู้ผิดคำรับรองและยืนยันใด ๆ ที่ให้ไว้ในสัญญาฉบับนี้ในสาระสำคัญ ไม่ว่าจะทั้งหมดหรือบางส่วน และ/หรือ คำรับรองและยืนยันใด ๆ ที่ให้ไว้ในสัญญาฉบับนี้เป็นคำรับรองและยืนยันที่ไม่เป็นความจริง หรือพิสูจน์ได้ว่าไม่เป็นความจริง ไม่ถูกต้อง หรืออาจจะก่อให้เกิดความเข้าใจผิดในสาระสำคัญ
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ง)</span>
                  <div className="flex-1 text-justify">
                    <b>การผิดนัดชำระหนี้ตามสัญญาอื่น</b>: ผู้กู้ผิดนัดชำระหนี้ใด ๆ ซึ่งมีอยู่กับเจ้าหนี้ใด ๆ (นอกเหนือจากหนี้ตามสัญญาฉบับนี้) เมื่อหนี้นั้นถึงกำหนด
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(จ)</span>
                  <div className="flex-1 text-justify">
                    <b>การใช้สิทธิเหนือทรัพย์สินหลักประกัน</b>: เมื่อบุคคลใดดำเนินการฟ้องร้องเพื่อบังคับคดีเหนือทรัพย์สินหลักประกันของผู้กู้ที่ผู้กู้ให้ไว้สำหรับความรับผิดของตนเอง หรือของบุคคลอื่น
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(24)}
      </div>
      {/* Page 24 */}
      <div data-section-id="od-default-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ฉ)</span>
                  <div className="flex-1 text-justify">
                    <b>การแต่งตั้งเจ้าพนักงานบังคับคดี หรือการดำเนินการทางคดี</b>: เมื่อเจ้าพนักงานบังคับคดี ผู้ทำแผน ผู้บริหารแผน หรือเจ้าพนักงานในลักษณะอื่นใดที่คล้ายคลึงกัน ได้รับการแต่งตั้งเพื่อจัดการกับธุรกิจ ฟื้นฟูกิจการ หรือทรัพย์สินของผู้กู้ ไม่ว่าทั้งหมดหรือแต่บางส่วน หรือเมื่อมีคำสั่งในทางบังคับคดีซึ่งบังคับเอากับทรัพย์สินของผู้กู้ หรือเมื่อมีการบังคับหลักประกันเอากับทรัพย์สินใด ๆ ของผู้กู้
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ช)</span>
                  <div className="flex-1 text-justify">
                    <b>ศาลมีคำสั่งพิทักษ์ทรัพย์</b>: เมื่อศาลมีคำสั่งพิทักษ์ทรัพย์ผู้กู้ คำสั่งฟื้นฟูกิจการ หรือคำสั่งให้มีการชำระบัญชี และ/หรือ เลิกกิจการ หรือมีคำสั่งอื่นในลักษณะเดียวกัน
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ซ)</span>
                  <div className="flex-1 text-justify">
                    <b>การเปลี่ยนแปลงอย่างมีนัยสำคัญ</b>: เมื่อผู้ให้สินเชื่อเห็นว่าเกิดการเปลี่ยนแปลงอย่างมีนัยสำคัญในทางที่ไม่เป็นคุณกับการประกอบกิจการ ทรัพย์สิน หรือหนี้สินของผู้กู้ หรือสถานะ (ทางการเงินหรืออื่น ๆ) ของผู้กู้ หรือมีเหตุอันควรเชื่อได้ว่าเหตุการณ์ดังกล่าวอาจมีผลกระทบอย่างร้ายแรงต่อความสามารถของผู้กู้ในการปฏิบัติตามตามสัญญาฉบับนี้ ทั้งนี้ รวมตลอดแต่ไม่จำกัดเพียงการเลิกกิจการ เลิกบริษัท การชำระบัญชี หรือการเปลี่ยนแปลงประเภทธุรกิจ หรือสัดส่วนของผู้ถือหุ้นรายใหญ่ หรือเปลี่ยนแปลงกรรมการ หรือคณะผู้บริหารของผู้กู้
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8">11.2</span>
            <div className="flex-1">
              <span className="underline">การดำเนินการเมื่อมีเหตุผิดนัดเกิดขึ้น</span>
              <div className="mt-4 text-justify">
                เมื่อมีเหตุผิดนัดเกิดขึ้น และเหตุผิดนัดดังกล่าวนั้นยังคงดำเนินอยู่ ผู้ให้สินเชื่อมีสิทธิส่งคำบอกกล่าวเหตุผิดนัด รวมทั้งมีสิทธิดำเนินการอย่างใดอย่างหนึ่งหรือหลายอย่างดังต่อไปนี้ทันที
              </div>

              <div className="mt-6 space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ก)</span>
                  <div className="flex-1 text-justify">
                    ยกเลิกวงเงินสินเชื่อที่จะให้ไม่ว่าทั้งหมด หรือบางส่วน และ/หรือ
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ข)</span>
                  <div className="flex-1 text-justify">
                    เรียกให้หนี้ที่มีอยู่ทั้งหมดถึงกำหนดชำระทันที และเรียกให้ผู้กู้ชำระหนี้ที่มีอยู่ ไม่ว่าทั้งหมดหรือแต่เพียงบางส่วนโดยพลัน หรือภายในระยะเวลาที่ผู้ให้สินเชื่อกำหนด และ/หรือ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(25)}
      </div>
      {/* Page 25 */}
      <div data-section-id="od-indemnity" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ค)</span>
                  <div className="flex-1 text-justify">
                    บังคับชำระหนี้จากทรัพย์สินหลักประกัน ไม่ว่าจะทั้งหมดหรือบางส่วน และไม่ว่าจะเป็นทรัพย์สินหลักประกันอย่างใดอย่างหนึ่งหรือหลายอย่าง ตามวิธีการของกฎหมายเกี่ยวกับหลักประกันนั้น และ/หรือ
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ง)</span>
                  <div className="flex-1 text-justify">
                    ใช้สิทธิ อำนาจ หรือการเยียวยาอื่นใดที่ผู้กู้มีอยู่ภายใต้กฎหมายหรือภายใต้สัญญาฉบับนี้
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center pt-4">
            <span className="font-bold shrink-0 w-8">12.</span>
            <span className="font-bold">การชดใช้ค่าเสียหาย</span>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1 text-justify">
              ผู้กู้จะต้องชดใช้ความเสียหายให้แก่ผู้ให้สินเชื่อ สำหรับค่าใช้จ่าย ความสูญเสีย ความเสียหาย หรือความรับผิดใดๆ ซึ่งผู้ให้สินเชื่อต้องเสียไป หรือได้รับจากเหตุการณ์ใดเหตุการณ์หนึ่งที่ถือว่าเป็นเหตุผิดนัดตามสัญญาฉบับนี้ ทันทีที่ผู้ให้สินเชื่อมีการเรียกร้องเอากับผู้กู้ การที่ผู้กู้ต้องชดใช้ความเสียหายดังกล่าวให้รวมถึง การชดใช้สำหรับค่าใช้จ่าย หรือความสูญเสียที่อาจเกิดขึ้นจากการที่ผู้ให้สินเชื่อได้รับชำระหนี้ช้ากว่ากำหนดเวลาชำระที่ตกลงกันไว้ ความสูญเสียใด ๆ ที่เกิดขึ้นจากค่าธรรมเนียม ดอกเบี้ย หรือจำนวนเงินอื่นใดที่ผู้ให้สินเชื่อต้องเสียไปเพื่อชำระหนี้ใด ๆ ที่ผู้ให้สินเชื่อไปกู้ยืมมาเพื่อนำมาให้เป็นสินเชื่อตามสัญญาฉบับนี้ (ถ้ามี)
            </div>
          </div>

          <div className="flex gap-2 items-center pt-4">
            <span className="font-bold shrink-0 w-8">13.</span>
            <span className="font-bold">ค่าใช้จ่ายอื่น ๆ</span>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8">13.1</span>
            <div className="flex-1">
              <span className="underline">ค่าใช้จ่าย</span>
              <div className="mt-4 text-justify">
                ผู้กู้ต้องชำระค่าใช้จ่ายทั้งหมดที่เกิดขึ้นดังต่อไปนี้ให้แก่ผู้ให้สินเชื่อ เมื่อผู้ให้สินเชื่อทวงถาม
              </div>

              <div className="mt-6 space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ก)</span>
                  <div className="flex-1 text-justify">
                    บรรดาค่าใช้จ่ายต่าง ๆ ค่าใช้จ่ายทางด้านเอกสาร และค่าใช้จ่ายต่าง ๆ ที่ผู้ให้สินเชื่อได้มีการจ่ายไปใด ๆ ซึ่งเกิดขึ้นจากการเจรจา การจัดเตรียมเอกสาร และการเข้าทำสัญญาฉบับนี้ และ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(26)}
      </div>
      {/* Page 26 */}
      <div data-section-id="od-expenses-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1">
              <div className="space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ข)</span>
                  <div className="flex-1 text-justify">
                    บรรดาค่าใช้จ่าย ค่าใช้จ่ายทางศาลในการฟ้องร้องดำเนินคดี และค่าใช้จ่ายต่างๆ ที่ผู้ให้สินเชื่อได้มีการจ่ายไปใด ๆ ที่เกิดขึ้นจากการแก้ไข เปลี่ยนแปลง ให้ความยินยอม หรือให้อนุญาตที่เกี่ยวข้องกับสัญญาฉบับนี้ หรือเอกสารที่เกี่ยวข้องใด ๆ หรือที่เกี่ยวข้องกับการป้องกันสิทธิหรือการใช้สิทธิบังคับ หรือความพยายามที่จะป้องกันหรือที่จะใช้สิทธิบังคับของผู้ให้สินเชื่อใด ๆ ที่มีอยู่ภายใต้สัญญาฉบับนี้ หรือเอกสารที่เกี่ยวข้องใด ๆ
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center pt-4">
            <span className="shrink-0 w-8">13.2</span>
            <span className="underline">ค่าอากรแสตมป์</span>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1 text-justify">
              ผู้กู้มีหน้าที่ต้องชำระค่าอากรแสตมป์สำหรับการทำสัญญาฉบับนี้ เป็นจำนวนทั้งสิ้น <Highlight>{data.stampDuty || '0'}</Highlight> บาท (<Highlight>{data.stampDuty ? thaiBahtText(data.stampDuty) : 'ศูนย์บาทถ้วน'}</Highlight>) โดยตกลงชำระ ณ วันที่ทำสัญญาฉบับนี้ และมีหน้าที่ต้องชำระค่าภาษีอากรอื่น ๆ ในทำนองเดียวกันที่เกี่ยวข้องกับสัญญาฉบับนี้ แต่เพียงผู้เดียว (เว้นแต่ ค่าอากรแสตมป์ และค่าภาษีอากรอื่น ๆ ที่เกี่ยวข้องกับหนังสือโอนสิทธิ และ/หรือ หน้าที่ของผู้ให้สินเชื่อตามสัญญาฉบับนี้ (หากมี)) และหากผู้ให้สินเชื่อได้ชำระค่าอากรแสตมป์ หรือค่าภาษีอากรอื่น ๆ ไปแทนผู้กู้อันเนื่องมาจากการที่ผู้กู้ชำระล่าช้าหรือไม่ชำระเงินค่าอากรดังกล่าว ผู้กู้ต้องชดใช้เงินจำนวนดังกล่าวคืนให้แก่ผู้ให้สินเชื่อเต็มจำนวน
            </div>
          </div>

          <div className="flex gap-2 items-center pt-4">
            <span className="shrink-0 w-8">13.3</span>
            <span className="underline">ค่าบริการอันเกี่ยวข้องกับสัญญาฉบับนี้</span>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1 text-justify">
              ผู้กู้ตกลงยินยอมชำระค่าบริการในการจดทะเบียนจำนองทรัพย์สินหลักประกันกับหน่วยงานราชการที่เกี่ยวข้อง และค่าบริการในการจดทะเบียนกรรมสิทธิ์เครื่องจักร (ถ้ามี) ให้แก่ผู้ให้สินเชื่อ โดยตกลงชำระ ณ วันที่ทำสัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-2 items-center pt-4">
            <span className="shrink-0 w-8">13.4</span>
            <span className="underline">ค่าธรรมเนียมการจดทะเบียนหลักประกัน หรือ กรรมสิทธิ์เครื่องจักร</span>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1 text-justify">
              ผู้กู้ตกลงยินยอมรับผิดชอบบรรดาค่าธรรมเนียมและค่าใช้จ่ายอื่นใดเกี่ยวกับการจดทะเบียนจำนองทรัพย์สินหลักประกัน หรือ จดทะเบียนกรรมสิทธิ์เครื่องจักร (ถ้ามี)
            </div>
          </div>
        </div>

        {renderPageFooter(27)}
      </div>

      {/* Page 27 */}
      <div data-section-id="od-misc" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8">13.5</span>
            <div className="flex-1 text-justify">
              กรณีที่มีค่าใช้จ่ายอันเกิดจากการดำเนินการใด ๆ เพื่อชำระหนี้ด้วยวิธีการตามข้อ 6. ของสัญญาฉบับนี้ โดยมิใช่ความผิดของผู้ให้สินเชื่อ ผู้กู้ตกลงชำระให้แก่ผู้ให้สินเชื่อทั้งสองฝ่ายในสัดส่วนตามข้อ 1.2 ของสัญญาฉบับนี้ ภายในในระยะเวลาที่ผู้ให้สินเชื่อกำหนด
            </div>
          </div>

          <div className="flex gap-2 items-center pt-4">
            <span className="font-bold shrink-0 w-8">14.</span>
            <span className="font-bold">เบ็ดเตล็ด</span>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8">14.1</span>
            <div className="flex-1">
              <span className="underline">การสั่งจ่าย / ถอนเงินที่คงเหลือในบัญชีธนาคารให้แก่ผู้กู้</span>
              <div className="mt-4 text-justify">
                ภายหลังจากที่ผู้ให้สินเชื่อได้รับชำระเงินตามวิธีการชำระเงินที่กำหนดในข้อ 6. ของสัญญาฉบับนี้จนครบถ้วนแล้ว ผู้ให้สินเชื่อตกลงจะให้ตัวแทนของผู้ให้สินเชื่อซึ่งเป็นผู้มีอำนาจลงนามสั่งจ่าย / ถอนเงินหรือทำธุรกรรมของบัญชีธนาคารตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ ดำเนินการสั่งจ่าย / ถอนเงินที่คงเหลือในบัญชีธนาคารดังกล่าว ตามแต่ละโครงการ และส่งมอบให้แก่ผู้กู้ด้วยวิธีการตามที่คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}ตกลงร่วมกันภายใน 7 (เจ็ด) วันทำการ นับแต่วันที่ผู้ให้สินเชื่อได้ตัด / หัก / ถอนเงินจากบัญชีธนาคารดังกล่าวเพื่อนำมาชำระคืนเงินต้น ดอกเบี้ย และค่าใช้จ่ายอื่น ๆ ที่เกิดขึ้นหรือเกี่ยวข้องกับสัญญาฉบับนี้ ตามแต่ละโครงการ ให้แก่ผู้ให้สินเชื่อ
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8">14.2</span>
            <div className="flex-1">
              <span className="underline">การยกเลิกวงเงินสินเชื่อ</span>
              <div className="mt-4 text-justify space-y-4">
                <div>
                  เว้นแต่กรณีที่เกิดเหตุการณ์ใดเหตุการณ์หนึ่งตามข้อ 11.1 ของสัญญาฉบับนี้ หากผู้กู้ได้ชำระเงินใด ๆ ที่เกิดขึ้นหรือเกี่ยวข้องกับสัญญาฉบับนี้ให้แก่ผู้ให้สินเชื่อจนครบถ้วนแล้ว และผู้กู้มีความประสงค์จะยกเลิกวงเงินสินเชื่อของสัญญาฉบับนี้ ผู้กู้จะต้องแจ้งให้ตัวแทนสินเชื่อทราบเป็นลายลักษณ์อักษรไม่น้อยกว่า 30 (สามสิบ) วัน ก่อนวันยกเลิกวงเงินสินเชื่อ โดยหลังจากที่ผู้กู้ได้แจ้งการยกเลิกวงเงินสินเชื่อดังกล่าวเป็นหนังสือไปยังตัวแทนสินเชื่อแล้ว คำบอกกล่าวขอยกเลิกวงเงินสินเชื่อจะเพิกถอนไม่ได้
                </div>
                <div>
                  ทั้งนี้ เมื่อผู้กู้ได้มีการแจ้งให้ตัวแทนสินเชื่อทราบเป็นลายลักษณ์อักษรแล้ว ให้ถือว่าผู้ให้สินเชื่อยินยอมให้ผู้กู้เปลี่ยนแปลงผู้มีอำนาจลงนามสั่งจ่าย / ถอนเงินหรือทำธุรกรรมของบัญชีธนาคารตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้ และผู้ให้สินเชื่อจะส่งคืนสมุดบัญชีธนาคารตามที่ระบุในข้อ 3.2 (ค) (1) ของสัญญาฉบับนี้คืนให้แก่ผู้กู้ภายในระยะเวลาอันสมควร
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(28)}
      </div>

      {/* Page 28 */}
      <div data-section-id="od-misc-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8">14.3</span>
            <div className="flex-1 text-justify">
              <span className="underline">การแก้ไขหรือยกเว้นข้อกำหนดหรือเงื่อนไขในสัญญา</span>
              <div className="mt-4">
                การแก้ไขสัญญานี้ การสละสิทธิ ให้การยกเว้น หรือให้ความยินยอมใด ๆ ภายใต้สัญญานี้ จะต้องเป็นการตกลงร่วมกันระหว่างคู่สัญญาทั้งสามฝ่ายเป็นลายลักษณ์อักษร เว้นแต่สัญญาฉบับนี้จะกำหนดไว้เป็นอย่างอื่น
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8">14.4</span>
            <div className="flex-1 text-justify">
              <span className="underline">การที่สิทธิไม่ระงับและการสละสิทธิ</span>
              <div className="mt-4">
                ผู้ให้สินเชื่อสามารถใช้สิทธิต่าง ๆ ภายใต้สัญญาฉบับนี้ได้ตามที่เห็นสมควร และสิทธิดังกล่าวเป็นสิทธิที่เพิ่มเติมจากสิทธิต่าง ๆ ที่ผู้ให้สินเชื่อทั้งสองฝ่ายมีอยู่ตามกฎหมาย นอกจากนี้ การไม่ใช้สิทธิหรือความล่าช้าในการใช้สิทธิ ไม่ถือเป็นการสละสิทธิในเรื่องดังกล่าว และการใช้สิทธิแต่เพียงบางส่วน หรือการใช้สิทธิโดยบกพร่อง ไม่เป็นการตัดสิทธิในอันที่จะใช้สิทธิอื่นหรือสิทธิเดิมนั้นอีก
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8">14.5</span>
            <div className="flex-1">
              <span className="underline">หนังสือบอกกล่าว</span>
              <div className="mt-4 space-y-6">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ก)</span>
                  <div className="flex-1 text-justify">
                    <span className="underline">การส่งหนังสือบอกกล่าว</span>
                    <div className="mt-4">
                      หนังสือบอกกล่าวหรือหนังสือติดต่อใด ๆ ที่ได้กระทำขึ้นภายใต้หรือเนื่องด้วยกับสัญญานี้ จะต้องทำเป็นหนังสือหรือส่งโดยทางโทรสาร และลงลายมือชื่อของคู่สัญญาฝ่ายที่จัดทำเอกสารดังกล่าว และให้ถือว่าหนังสือบอกกล่าวนั้นได้ส่งโดยชอบแล้วเมื่อได้ดำเนินการดังต่อไปนี้
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex gap-2">
                        <span className="shrink-0 w-8">(1)</span>
                        <div className="flex-1">
                          ในกรณีที่ส่งโดยบุคคล (By Hand) ให้มีผลเมื่อได้จัดส่งหนังสือบอกกล่าว
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="shrink-0 w-8">(2)</span>
                        <div className="flex-1">
                          ในกรณีที่ส่งทางไปรษณีย์ลงทะเบียน ให้มีผลภายในวันที่กำหนดในใบตอบรับทางไปรษณีย์หรือใบรับที่เป็นลายลักษณ์อักษรอื่น
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(29)}
      </div>

      {/* Page 29 */}
      <div data-section-id="od-notices-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8"></span>
            <div className="flex-1">
              <div className="flex gap-2">
                <span className="shrink-0 w-8"></span>
                <div className="flex-1 text-justify">
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(3)</span>
                    <div className="flex-1">
                      ในกรณีที่ส่งทางโทรสาร ให้มีผลเมื่อครบกำหนด 1 (หนึ่ง) วัน นับแต่วันที่ส่งหนังสือบอกกล่าวหรือหนังสือติดต่อใด ๆ ที่ได้กระทำขึ้นตามข้อกำหนดดังกล่าวข้างต้น แต่วันที่การส่งหนังสือบอกกล่าวหรือหนังสือติดต่อใด ๆ มีผลนั้นมิใช่วันทำการ หรือการส่งโดยบุคคลนั้นได้รับเมื่อเลิกเวลาทำการแล้วในสถานที่ที่ได้รับเอกสารดังกล่าว ให้ถือว่าได้ส่งโดยชอบในวันทำการของสถานที่นั้นในวันถัดไป
                    </div>
                  </div>

                  <div className="mt-6">
                    หากคู่สัญญาฝ่ายหนึ่งฝ่ายใดต้องการเปลี่ยนสถานที่อยู่ คู่สัญญาฝ่ายนั้นจะต้องแจ้งให้คู่สัญญาอีกฝ่ายทราบล่วงหน้าเป็นลายลักษณ์อักษรไม่น้อยกว่า 5 (ห้า) วันทำการก่อนวันที่ย้ายหรือเปลี่ยนแปลงสถานที่อยู่ ในกรณีเช่นนี้คู่สัญญาฝ่ายที่ได้รับแจ้งการเปลี่ยนแปลงสถานที่อยู่จะส่งคำบอกกล่าวให้แก่คู่สัญญาฝ่ายที่แจ้งเปลี่ยนแปลงสถานที่อยู่ตามรายละเอียดที่ได้รับแจ้งดังกล่าว
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-6">
                <span className="shrink-0 w-8">(ข)</span>
                <div className="flex-1">
                  <span className="underline">การติดต่อทางอิเล็กทรอนิกส์</span>
                  <div className="mt-4 text-justify">
                    การติดต่อระหว่างผู้ให้สินเชื่อกับผู้กู้ภายใต้สัญญาฉบับนี้ สามารถทำได้โดยวิธีส่งจดหมายอิเล็กทรอนิกส์หรือวิธีการอื่นใดทางอิเล็กทรอนิกส์ หากผู้ให้สินเชื่อกับผู้กู้
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(1)</span>
                      <div className="flex-1 text-justify">
                        ตกลงและยอมรับว่าการติดต่อดังกล่าวเป็นรูปแบบในการติดต่อระหว่างผู้ให้สินเชื่อทั้งสองฝ่ายกับผู้กู้ เว้นแต่หรือจนกว่าจะมีการแจ้งเป็นอย่างอื่น
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(2)</span>
                      <div className="flex-1 text-justify">
                        ได้แจ้งแก่คู่สัญญาอีกฝ่ายหนึ่งเป็นหนังสือ ถึงที่อยู่ของจดหมายอิเล็กทรอนิกส์ของตน และ/หรือ ข้อมูลอื่นใดที่จำเป็นต่อการรับส่งข้อมูลด้วยวิธีดังกล่าว และ
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="shrink-0 w-8">(3)</span>
                      <div className="flex-1 text-justify">
                        ได้แจ้งให้คู่สัญญาอีกฝ่ายหนึ่งทราบ กรณีมีการเปลี่ยนแปลงที่อยู่ของจดหมายอิเล็กทรอนิกส์หรือข้อมูลอื่นใดที่ได้ให้ไว้แก่คู่สัญญาอีกฝ่ายหนึ่ง
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(30)}
      </div>

      {/* Page 30 */}
      <div data-section-id="od-validity" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span className="shrink-0 w-8">14.6</span>
            <div className="flex-1 text-justify">
              <span className="underline">ความไม่สมบูรณ์ของข้อสัญญา</span>
              <div className="mt-4">
                หากข้อสัญญาหรือข้อกำหนดข้อใดข้อหนึ่งภายใต้สัญญานี้ไม่สมบูรณ์ เป็นโมฆะ ขัดต่อกฎหมาย หรือไม่อาจบังคับได้ตามกฎหมาย ไม่ว่าในกรณีใด ๆ ให้ถือว่าข้อสัญญาหรือข้อกำหนดอื่นในสัญญานี้ ยังคงมีผลใช้บังคับได้ตามกฎหมาย
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="shrink-0 w-8">14.7</span>
            <div className="flex-1 text-justify">
              <span className="underline">กฎหมายที่ใช้บังคับ</span>
              <div className="mt-4">
                สัญญาฉบับนี้ให้ใช้บังคับและตีความตามกฎหมายไทย ข้อพิพาท ข้อโต้แย้ง หรือสิทธิเรียกร้องใด ๆ ที่เกิดขึ้นจากหรือเกี่ยวกับสัญญาฉบับนี้ซึ่งไม่สามารถตกลงกันได้ระหว่างคู่สัญญาให้นำเสนอต่อศาลไทยที่มีเขตอำนาจ
              </div>
            </div>
          </div>

          <div className="text-center italic text-gray-500">
            (คู่สัญญาลงนามในหน้าถัดไป)
          </div>
        </div>

        {renderPageFooter(31)}
      </div>

      {/* Page 31 (Signatories: Agile Assets & Borrower) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 pt-4">
          <div className="text-justify indent-12">
            สัญญาฉบับนี้ทำขึ้นมา <Highlight>{isAgileOnly ? '2 (สอง)' : '3 (สาม)'}</Highlight> ฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}ได้อ่านข้อความในสัญญาเพื่อเป็นหลักฐานในการทำสัญญานี้ คู่สัญญา{isAgileOnly ? 'ทั้งสองฝ่าย' : 'ทั้งสามฝ่าย'}ได้ลงนามในสัญญาฉบับนี้ต่อหน้าพยาน ณ วันที่ซึ่งได้ระบุไว้ในหน้าแรกของสัญญาฉบับนี้
          </div>

          <div className="mt-4 grid grid-cols-2 border border-black min-h-[600px] text-[12px] font-bold">
            {/* Left Column: Lender 1 */}
            <div className="border-r border-black p-4 flex flex-col h-full">
              <div className="space-y-12">
                <div className="font-bold">
                  ผู้ให้สินเชื่อฝ่ายที่ 1: <Highlight>{agileInfo.companyName}</Highlight>
                </div>

                <div className="pt-8 space-y-12">
                  {(agileInfo.directors || '').split(/\s*และ\s*/).map((sig, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="border-b border-black w-full h-8"></div>
                      <div className="flex justify-center gap-2">
                        <span>ชื่อ:</span>
                        <div className="font-bold">
                          <Highlight>{sig.trim()}</Highlight>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 text-left">
                    <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                    <div className="mt-2 text-left font-bold">
                      <Highlight>{agileInfo.companyName}</Highlight>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 space-y-4">
                <div>พยาน:</div>
                <div className="border-b border-black w-full h-8"></div>
                <div className="flex justify-between">
                  <span>(</span>
                  <span className="flex-1 border-b border-black mx-4"></span>
                  <span>)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Borrower */}
            <div className="p-4 flex flex-col h-full">
              <div className="space-y-12">
                <div className="font-bold">ผู้กู้: <Highlight>{customerInfo.companyName}</Highlight>
                </div>
                <div className="pt-8 space-y-12">
                  {(customerInfo.directors || '').split(/\s*และ\s*/).map((sig, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="border-b border-black w-full h-8"></div>
                      <div className="flex justify-center gap-2">
                        <span>ชื่อ:</span>
                        <div className="font-bold">
                          <Highlight>{sig.trim()}</Highlight>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 text-left">
                    <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                    <div className="mt-2 text-left font-bold">
                      <Highlight>{customerInfo.companyName}</Highlight>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 space-y-4">
                <div>พยาน:</div>
                <div className="border-b border-black w-full h-8"></div>
                <div className="flex justify-between">
                  <span>(</span>
                  <span className="flex-1 border-b border-black mx-4"></span>
                  <span>)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(32)}
      </div>

      {/* Page 32 (Signatories: TK Assets) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 pt-4">
          <div className="mt-4 grid grid-cols-2 border border-black min-h-[600px] text-[12px] font-bold">
            {/* Left Column: Lender 2 */}
            <div className="border-r border-black p-4 flex flex-col h-full">
              <div className="space-y-12">
                <div className="font-bold">
                  ผู้ให้สินเชื่อฝ่ายที่ 2: <Highlight>{tkInfo.companyName}</Highlight>
                </div>

                <div className="pt-8 space-y-12">
                  {(tkInfo.directors || '').split(/\s*และ\s*/).map((sig, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="border-b border-black w-full h-8"></div>
                      <div className="flex justify-center gap-2">
                        <span>ชื่อ:</span>
                        <div className="font-bold">
                          <Highlight>{sig.trim()}</Highlight>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 text-left">
                    <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                    <div className="mt-2 text-left font-bold">
                      <Highlight>{tkInfo.companyName}</Highlight>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 space-y-4">
                <div>พยาน:</div>
                <div className="border-b border-black w-full h-8"></div>
                <div className="flex justify-between">
                  <span>(</span>
                  <span className="flex-1 border-b border-black mx-4"></span>
                  <span>)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Empty */}
            <div className="p-4 flex flex-col h-full">
            </div>
          </div>
        </div>

        {renderPageFooter(33)}
      </div>

      {/* Page 33 (Annex 1: Conditions Precedent) */}
      <div data-section-id="od-annex-1" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 pt-4 text-[13px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 1</div>
            <div className="underline">เงื่อนไขบังคับก่อน</div>
          </div>

          <div className="text-justify leading-relaxed">
            ผู้กู้ตกลงส่งเอกสารตามที่ได้กำหนดไว้ในข้อ (ก) ทุกประการก่อนการเบิกใช้สินเชื่อ และตกลงปฏิบัติตามที่กำหนดไว้ในข้อ (ข) ทุกประการก่อนการเบิกใช้สินเชื่อ ซึ่งได้มีการจัดเตรียมในรูปแบบและสาระสำคัญที่ผู้ให้สินเชื่อแต่ละรายเห็นสมควรภายในกำหนดเวลาในข้อ 3 ของสัญญาฉบับนี้ให้แก่ตัวแทนสินเชื่อ
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="shrink-0 w-8">1.</span>
              <div className="flex-1 space-y-4">
                <div>เอกสารที่เป็นเงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อภายใต้สัญญานี้</div>

                <div>
                  ผู้ให้สินเชื่อจะต้องได้รับเอกสารต่าง ๆ ดังต่อไปนี้ตามรูปแบบและสาระสำคัญที่ผู้ให้สินเชื่อเห็นสมควร
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ก)</span>
                    <div className="flex-1">
                      หนังสือรับรองบริษัทของผู้กู้จากนายทะเบียนหุ้นส่วนบริษัท กระทรวงพาณิชย์ ลงวันที่รับรองไม่เกิน 30 (สามสิบ) วัน ก่อนวันที่กำหนดให้เป็นวันเบิกใช้สินเชื่อ
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ข)</span>
                    <div className="flex-1">
                      สำเนาเอกสารเกี่ยวกับผู้กู้ ซึ่งรับรองโดยนายทะเบียนหุ้นส่วนบริษัท กระทรวงพาณิชย์ ลงวันที่รับรองไม่เกิน 30 (สามสิบ) วัน ก่อนวันที่กำหนดให้เป็นวันเบิกใช้สินเชื่อ ดังต่อไปนี้
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <span className="shrink-0 w-8">(1)</span>
                          <span>หนังสือบริคณห์สนธิ</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="shrink-0 w-8">(2)</span>
                          <span>ข้อบังคับของบริษัท</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="shrink-0 w-8">(3)</span>
                          <span>สำเนาบัญชีรายชื่อผู้ถือหุ้น</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ค)</span>
                    <div className="flex-1">
                      สำเนามติที่ประชุมของคณะกรรมการและสำเนามติที่ประชุมของผู้ถือหุ้นของผู้กู้ (ในกรณีที่จะต้องได้รับมติจากผู้ถือหุ้น) ซึ่งรับรองความถูกต้องโดยกรรมการผู้มีอำนาจของผู้กู้ อนุมัติให้ลงนามและปฏิบัติตามสัญญาฉบับนี้และเอกสารทางธุรกรรมตามสัญญาฉบับนี้
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ง)</span>
                    <div className="flex-1">
                      ตัวอย่างลายมือชื่อของกรรมการผู้มีอำนาจ และ/หรือ เจ้าหน้าที่ผู้มีอำนาจ ตามข้อ 1 (ฉ) (ถ้ามี) ของผู้กู้
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(34)}
      </div>

      {/* Page 34 (Annex 1: Conditions Precedent - Cont.) */}
      <div data-section-id="od-annex-1-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 pt-4 text-[13px]">
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="shrink-0 w-8"></span>
              <div className="flex-1 space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(จ)</span>
                    <div className="flex-1">
                      สำเนาบัตรประจำตัวประชาชนและสำเนาทะเบียนบ้านของกรรมการผู้มีอำนาจ และ/หรือ เจ้าหน้าที่ผู้มีอำนาจตามข้อ 1 (ฉ) (ถ้ามี) ของผู้กู้
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ฉ)</span>
                    <div className="flex-1">
                      หนังสือมอบอำนาจแต่งตั้งเจ้าหน้าที่ผู้มีอำนาจของผู้กู้ (ในกรณีที่มีการมอบอำนาจให้บุคคลซึ่งไม่ใช่กรรมการผู้มีอำนาจของผู้กู้กระทำการแทน)
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ช)</span>
                    <div className="flex-1">
                      เอกสารที่เกี่ยวข้องกับหลักประกันตามที่ผู้ให้สินเชื่อกำหนด
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-8">2.</span>
              <div className="flex-1 space-y-4">
                <div>ข้อปฏิบัติที่เป็นเงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อภายใต้สัญญานี้</div>

                <div className="space-y-4">
                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ก)</span>
                    <div className="flex-1">
                      สัญญาให้สินเชื่อและเอกสารทางธุรกรรม ได้ทำขึ้นถูกต้องครบถ้วนและลงนามโดยผู้มีอำนาจลงนามตามเงื่อนไขที่กำหนดไว้ในสัญญานี้ และมีผลสมบูรณ์
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ข)</span>
                    <div className="flex-1">
                      ผู้กู้ได้ชำระค่าธรรมเนียม เงินใด ๆ ที่ถึงกำหนดต้องชำระตามสัญญานี้ (รวมทั้งค่าใช้จ่ายต่าง ๆ ที่เกิดขึ้นตามสัญญานี้) ครบถ้วนแล้วก่อนหรือภายในวันเบิกใช้สินเชื่อ
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ค)</span>
                    <div className="flex-1">
                      ไม่มีการเปลี่ยนแปลงอย่างมีนัยสำคัญ ซึ่งในความเห็นของผู้ให้สินเชื่ออาจมีผลกระทบในทางลบต่อฐานะในทางการเงินของผู้กู้
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ง)</span>
                    <div className="flex-1">
                      บรรดาคำรับรองและยืนยันที่ผู้กู้ให้ไว้ในข้อ 9. ของสัญญาฉบับนี้ เป็นความจริง และถูกต้องเสมือนว่าได้ทำขึ้น หรือให้ไว้ ณ วันที่กำหนดให้เป็นวันใช้สินเชื่อครั้งแรก
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(จ)</span>
                    <div className="flex-1">
                      ผู้กู้ได้ปฏิบัติตามข้อตกลงกระทำการที่ระบุในข้อ 10. ของสัญญาฉบับนี้ หรือตามเงื่อนไขที่ให้ไว้ในเอกสารที่เกี่ยวข้องตามสัญญาอื่น ๆ ตามกำหนดเวลาที่ระบุไว้และไม่มีเหตุผิดนัด หรือกรณีที่จะเป็นเหตุผิดนัดใด ๆ เกิดขึ้น หรืออาจเกิดขึ้นเมื่อมีการใช้สินเชื่อตามสัญญาฉบับนี้
                    </div>
                  </div>

                  <div className="flex gap-2 text-justify">
                    <span className="shrink-0 w-8">(ฉ)</span>
                    <div className="flex-1">
                      ผู้กู้ได้จดทะเบียนทรัพย์สินหลักประกันกับหน่วยงานราชการที่เกี่ยวข้องตามข้อกำหนดและเงื่อนไขที่ระบุในสัญญาฉบับนี้ (ถ้ามี)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(35)}
      </div>

      {/* Page 35 (Annex 2) */}
      <div data-section-id="od-annex-2" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 2</div>
            <div>สำเนาเอกสารคำสั่งซื้อของลูกค้าของผู้กู้และสำเนาเอกสารวางบิลของผู้กู้</div>
          </div>
        </div>

        {renderPageFooter(36)}
      </div>

      {/* Page 36 (Annex 3) */}
      <div data-section-id="od-annex-3" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 3</div>
            <div>ตารางแสดงใบคำสั่งซื้อและจำนวนเงินที่ผู้ให้สินเชื่อมีสิทธิหักเพื่อชำระคืนเงินในแต่ละรายการ</div>
          </div>
        </div>

        {renderPageFooter(37)}
      </div>

      {/* Page 37 (Annex 4) */}
      <div data-section-id="od-annex-4" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 4</div>
            <div>แบบของหนังสือแจ้งเปลี่ยนแปลงช่องทางการชำระเงิน</div>
          </div>

          <div className="flex justify-end pt-4">
            <div>วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight></div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรื่อง</span>
              <span>ขอเปลี่ยนแปลงวิธีการรับชำระเงิน</span>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <span><Highlight>{customerInfo.companyName}</Highlight></span>
            </div>
          </div>

          <div className="text-justify indent-12 leading-relaxed">
            ตามที่ท่านได้ทำการ[สั่งให้ข้าพเจ้าผลิตสินค้า และ/หรือ ให้บริการ และ/หรือ ว่าจ้างให้ข้าพเจ้าผลิตสินค้า และ/หรือ ให้บริการ] ภายใต้เลขที่ใบสั่งซื้อ <Highlight>{data.annex4PONo || '[หมายเลขใบสั่งซื้อ]'}</Highlight> ลงวันที่ <Highlight>{formatThaiDate(data.annex4PODate || '') || '[วันที่สั่งซื้อ]'}</Highlight> และข้าพเจ้าได้วางบิล <Highlight>{data.annex4BillNo || '[หมายเลขใบวางบิล]'}</Highlight> ลงวันที่ <Highlight>{formatThaiDate(data.annex4BillDate || '') || '[วันที่ของบิล]'}</Highlight> นั้น ข้าพเจ้ามีความประสงค์ขอเปลี่ยนแปลงวิธีการชำระเงินสำหรับการ[สั่งให้ผลิตสินค้า และ/หรือ ให้บริการ และ/หรือ ว่าจ้างให้ผลิตสินค้า และ/หรือ ให้บริการ] ดังกล่าวจากวิธีการเดิม เป็นการโอนเงินเข้าบัญชีธนาคาร บริษัท โปรเทคฟิลด์ จำกัด ประเภทออมทรัพย์ สาขาเพชรบุรีตัดใหม่ หมายเลขบัญชี 207-8-43222-8 สำหรับการชำระเงินที่จะเกิดขึ้นหลังจากวันที่ของหนังสือฉบับนี้เป็นต้นไป
          </div>

          <div className="indent-12">
            หากมีข้อสงสัยประการใด โปรดติดต่อ ..................... โทร .....................
          </div>

          <div className="flex flex-col items-end pt-8 space-y-12 pr-12">
            <div className="text-center space-y-4">
              <div>ขอแสดงความนับถือ</div>
              <div className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></div>
            </div>
          </div>

          <div className="flex justify-between pt-8 px-12">
            <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">ประทับตราบริษัท (ถ้ามี)</div>
            <div className="w-1/2 space-y-4 pt-4 border-t border-gray-400">
              <div className="flex items-end gap-2">
                <span>ชื่อ:</span>
                <div className="flex-1 border-b border-dotted border-gray-400"></div>
              </div>
              <div className="flex items-end gap-2">
                <span>ตำแหน่ง:</span>
                <div className="flex-1">กรรมการผู้มีอำนาจลงนาม</div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(38)}
      </div>

      {/* Page 38 (Annex 4 Acknowledgement) */}
      <div data-section-id="od-annex-4-ack" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px] pt-8">
          <div className="text-justify indent-12 leading-relaxed">
            ข้าพเจ้ารับทราบและจะดำเนินการเปลี่ยนแปลงวิธีการชำระเงินเป็นการโอนเงินเข้าบัญชีธนาคารตามรายละเอียดที่ท่านได้แจ้งในหนังสือฉบับนี้ สำหรับการชำระเงินที่จะเกิดขึ้นหลังจากวันที่ของหนังสือฉบับนี้เป็นต้นไป
          </div>

          <div className="flex flex-col items-end pt-8 space-y-12 pr-12">
            <div className="text-center space-y-4">
              <div>ขอแสดงความนับถือ</div>
              <div className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></div>
            </div>
          </div>

          <div className="flex justify-between pt-8 px-12">
            <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">ประทับตราบริษัท (ถ้ามี)</div>
            <div className="w-1/2 space-y-4 pt-4 border-t border-gray-400">
              <div className="flex items-end gap-2">
                <span>ชื่อ:</span>
                <div className="flex-1 border-b border-dotted border-gray-400"></div>
              </div>
              <div className="flex items-end gap-2">
                <span>ตำแหน่ง:</span>
                <div className="flex-1">กรรมการผู้มีอำนาจลงนาม</div>
              </div>
              <div className="flex items-end gap-2">
                <span>วันที่:</span>
                <div className="flex-1 border-b border-dotted border-gray-400"></div>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-4">
            <div className="text-justify leading-relaxed">
              ทั้งนี้ ขอให้ท่านกรุณาดำเนินการลงนามยืนยันในหนังสือฉบับนี้ จำนวน 2 (สอง) ฉบับ โดยภายหลังจากจากการลงนามโปรดจัดเก็บหนังสือฉบับนี้จำนวน 1 ฉบับไว้กับท่าน และส่งหนังสือฉบับนี้จำนวน 1 ฉบับ พร้อมด้วยเอกสารประกอบการลงนามตามรายการด้านล่างจำนวนอย่างละ 1 ฉบับให้แก่ข้าพเจ้า ภายในวันที่ <Highlight>{formatThaiDate(data.annex4ReturnDate || '') || '[•]'}</Highlight> ตามรายละเอียดผู้ติดต่อดังนี้
            </div>

            <div className="space-y-1 pt-4">
              <div className="flex gap-2">
                <span className="shrink-0">เรียน</span>
                <span className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></span>
              </div>
              <div className="pl-10">
                <Highlight>{customerInfo.address}</Highlight>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-4">
            <div className="font-bold underline">รายการของเอกสารประกอบการลงนาม</div>
            <div className="space-y-2">
              <div className="flex gap-4">
                <span className="shrink-0 w-6">1)</span>
                <span>สำเนาหนังสือรับรองบริษัท</span>
              </div>
              <div className="flex gap-4">
                <span className="shrink-0 w-6">2)</span>
                <span>สำเนาบัตรประจำตัวประชาชน/หนังสือเดินทางของกรรมการผู้มีอำนาจ</span>
              </div>
              <div className="flex gap-4">
                <span className="shrink-0 w-6">3)</span>
                <div className="flex-1">
                  สำเนาหนังสือมอบอำนาจ พร้อมสำเนาบัตรประจำตัวประชาชน/หนังสือเดินทางของผู้มอบอำนาจ (ถ้ามี) ในกรณีที่มีการมอบอำนาจ
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(39)}
      </div>

      {/* Page 39 (Annex 5) */}
      <div data-section-id="od-annex-5" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 5</div>
            <div>แบบของหนังสือบอกกล่าวการโอนสิทธิการรับชำระเงิน แบบมีเงื่อนไข</div>
          </div>

          <div className="flex justify-end pt-4">
            <div>วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight></div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรื่อง</span>
              <span>การโอนสิทธิการรับชำระเงิน แบบมีเงื่อนไข</span>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <span><Highlight>{customerInfo.companyName}</Highlight></span>
            </div>
            <div className="flex gap-2 pl-14">
              <span><Highlight>{customerInfo.companyName}</Highlight></span>
            </div>
          </div>

          <div className="text-justify indent-12 leading-relaxed">
            ตามที่ท่านได้ทำการ[สั่งให้ข้าพเจ้าผลิตสินค้า และ/หรือ ให้บริการ และ/หรือ ว่าจ้างให้ข้าพเจ้าผลิตสินค้า และ/หรือ ให้บริการ] ภายใต้เลขที่ใบสั่งซื้อ <Highlight>{data.annex4PONo || '[หมายเลขใบสั่งซื้อ]'}</Highlight> ลงวันที่ <Highlight>{formatThaiDate(data.annex4PODate || '') || '[วันที่สั่งซื้อ]'}</Highlight> และข้าพเจ้าได้วางบิล <Highlight>{data.annex4BillNo || '[หมายเลขใบวางบิล]'}</Highlight> ลงวันที่ <Highlight>{formatThaiDate(data.annex4BillDate || '') || '[วันที่ของบิล]'}</Highlight> นั้น (“เอกสารที่เกี่ยวข้อง”) ข้าพเจ้าขอแจ้งให้ท่านทราบว่าข้าพเจ้าได้โอนสิทธิเรียกร้องแบบมีเงื่อนไขในการรับชำระเงินตามมูลหนี้ที่เกิดขึ้นทั้งที่มีอยู่ในปัจจุบัน และที่จะเกิดขึ้นในอนาคตตามเอกสารที่เกี่ยวข้อง และไม่อาจเพิกถอนได้ให้แก่บริษัท อาไจล์ แอสเซ็ทส์ จำกัด และ บริษัท ฐิติกร จำกัด (มหาชน) (รวมเรียกว่า “ผู้รับโอนสิทธิ”) เพื่อเป็นประกันการชำระหนี้ของข้าพเจ้าที่มีต่อผู้รับโอนสิทธิ
          </div>

          <div className="text-justify indent-12 leading-relaxed">
            ข้าพเจ้าขอเรียนให้ท่านทราบว่าการโอนสิทธิเรียกร้องในการรับชำระเงินข้างต้นเป็นการโอนสิทธิแบบมีเงื่อนไขและไม่อาจเพิกถอนได้ โดยการโอนสิทธิรับชำระเงินนี้จะมีผลบังคับตามกฎหมายก็ต่อเมื่อผู้รับโอนสิทธิได้ส่ง “หนังสือแจ้งการโอนสิทธิการรับชำระเงินมีผลบังคับใช้” ให้ท่าน เพื่อให้ท่านทราบว่าการโอนสิทธิเรียกร้องในการรับชำระเงินดังกล่าวมีผลบังคับใช้ตามกฎหมายและตามที่ข้าพเจ้าได้ตกลงกับผู้รับโอนสิทธิ
          </div>

          <div className="text-justify indent-12 leading-relaxed">
            ทั้งนี้ ข้าพเจ้ายังคงมีหน้าที่ต่อท่านตามเอกสารที่เกี่ยวข้อง ไม่ว่าการโอนสิทธิเรียกร้องในการรับชำระเงินนี้จะมีผลบังคับตามกฎหมายแล้วหรือไม่ก็ตาม
          </div>

          <div className="indent-12">
            หากมีข้อสงสัยประการใด โปรดติดต่อ ..................... โทร .....................
          </div>
        </div>

        {renderPageFooter(40)}
      </div>

      {/* Page 40 (Annex 5 Signature & Acknowledgement) */}
      <div data-section-id="od-annex-5-ack" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px] pt-4">
          {/* Borrower Signature Section */}
          <div className="flex flex-col items-end space-y-12 pr-12">
            <div className="text-center space-y-4">
              <div>ขอแสดงความนับถือ</div>
              <div className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></div>
            </div>
          </div>

          <div className="flex justify-between px-12">
            <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">ประทับตราบริษัท (ถ้ามี)</div>
            <div className="w-1/2 space-y-4 pt-4 border-t border-black">
              <div className="flex items-end gap-2">
                <span>ชื่อ:</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
              </div>
              <div className="flex items-end gap-2">
                <span>ตำแหน่ง:</span>
                <div className="flex-1">กรรมการผู้มีอำนาจลงนาม</div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-black my-8"></div>

          {/* Acknowledgement Text */}
          <div className="text-justify leading-relaxed">
            ข้าพเจ้ารับทราบและยินยอมอย่างเพิกถอนไม่ได้ในการโอนสิทธิเรียกร้องในการรับชำระเงินของท่านตามรายละเอียดที่ท่านได้แจ้งในหนังสือฉบับนี้
          </div>

          {/* Customer Signature Section */}
          <div className="flex flex-col items-end space-y-12 pr-12 pt-4">
            <div className="text-center space-y-4">
              <div>ขอแสดงความนับถือ</div>
              <div className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></div>
            </div>
          </div>

          <div className="flex justify-between px-12">
            <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">ประทับตราบริษัท (ถ้ามี)</div>
            <div className="w-1/2 space-y-4 pt-4 border-t border-black">
              <div className="flex items-end gap-2">
                <span>ชื่อ:</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
              </div>
              <div className="flex items-end gap-2">
                <span>ตำแหน่ง:</span>
                <div className="flex-1">กรรมการผู้มีอำนาจลงนาม</div>
              </div>
              <div className="flex items-end gap-2">
                <span>วันที่:</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
              </div>
            </div>
          </div>

          <div className="border-t border-black my-8"></div>

          <div className="text-justify leading-relaxed">
            ทั้งนี้ ขอให้ท่านกรุณาดำเนินการลงนามยืนยันในหนังสือฉบับนี้ จำนวน 2 (สอง) ฉบับ โดยภายหลังจากจากการลงนามโปรดจัดเก็บหนังสือฉบับนี้จำนวน 1 ฉบับไว้กับท่าน และส่งหนังสือฉบับนี้จำนวน 1 ฉบับ พร้อมด้วยเอกสารประกอบการลงนามตามรายการด้านล่างจำนวนอย่างละ 1 ฉบับให้แก่ข้าพเจ้า ภายในวันที่ <Highlight>{formatThaiDate(data.annex4ReturnDate || '') || '[•]'}</Highlight>
          </div>
        </div>

        {renderPageFooter(41)}
      </div>

      {/* Page 41 (Annex 5 Documents List) */}
      <div data-section-id="od-annex-5-docs" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-8 text-[13px] pt-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <span className="font-bold">บริษัท <Highlight>{customerInfo.companyName}</Highlight></span>
            </div>
            <div className="pl-14">
              <Highlight>{customerInfo.address}</Highlight>
            </div>
          </div>

          <div className="pt-8 space-y-6">
            <div className="font-bold underline underline-offset-4">รายการของเอกสารประกอบการลงนาม</div>
            <div className="space-y-6">
              <div className="flex gap-6">
                <span className="shrink-0 w-6 text-center">1)</span>
                <span>สำเนาหนังสือรับรองบริษัท</span>
              </div>
              <div className="flex gap-6">
                <span className="shrink-0 w-6 text-center">2)</span>
                <span>สำเนาบัตรประจำตัวประชาชน/หนังสือเดินทางของกรรมการผู้มีอำนาจ</span>
              </div>
              <div className="flex gap-6">
                <span className="shrink-0 w-6 text-center">3)</span>
                <div className="flex-1">
                  สำเนาหนังสือมอบอำนาจ พร้อมสำเนาบัตรประจำตัวประชาชน/หนังสือเดินทางของผู้มอบอำนาจ (ถ้ามี) ในกรณีที่มีการมอบอำนาจ
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(42)}
      </div>

      {/* Page 42 (Annex 6 - Credit Drawdown Request Form) */}
      <div data-section-id="od-annex-6-drawdown" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px]">
          <div className="text-center font-bold">
            <div className="text-[13px]">เอกสารแนบท้ายหมายเลข 6</div>
            <div className="text-[13px]">แบบของหนังสือขอเบิกใช้สินเชื่อ ครั้งที่____ใบที่____/____</div>
          </div>

          {/* Date */}
          <div className="flex justify-end">
            <div>วันที่ <span className="inline-block w-48 border-b border-black"></span></div>
          </div>

          {/* Subject */}
          <div className="flex gap-2">
            <span className="shrink-0">เรื่อง</span>
            <div className="flex-1 text-justify indent-4">
              การเบิกสินเชื่อตามสัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข สัญญาเลขที่ <Highlight>{data.contractNo || '[•]'}</Highlight> ("สัญญาให้สินเชื่อ")
            </div>
          </div>

          {/* To */}
          <div>
            <div className="flex gap-2">
              <span className="shrink-0">เรียน</span>
              <div className="flex-1">
                <Highlight>{agileInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 1 และ
              </div>
            </div>
            <div className="pl-10">
              <Highlight>{tkInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 2
            </div>
          </div>

          {/* Clause 1 */}
          <div className="flex gap-2">
            <span className="shrink-0 w-8">1.</span>
            <div className="flex-1 text-justify">
              ข้าพเจ้า<Highlight>บริษัท {customerInfo.companyName}</Highlight> ขออ้างถึงสัญญาให้สินเชื่อ และให้คำจำกัดความต่าง ๆ ที่ใช้ในสัญญาให้สินเชื่อ ให้มีความหมายเช่นเดียวกันกับการใช้ในคำขอเบิกใช้สินเชื่อนี้
            </div>
          </div>

          {/* Clause 2 */}
          <div className="flex gap-2">
            <span className="shrink-0 w-8">2.</span>
            <div className="flex-1">
              ข้าพเจ้ามีความประสงค์จะเบิกสินเชื่อ ดังรายละเอียดต่อไปนี้
            </div>
          </div>

          <div className="pl-10 space-y-1">
            {/* (ก) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(ก)</span>
              <span className="shrink-0">วันที่เบิกใช้สินเชื่อ:</span>
              <div className="flex-1 border-b border-black"></div>
            </div>

            {/* (ข) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(ข)</span>
              <span className="shrink-0">จำนวนเงิน:</span>
              <div className="flex-1 border-b border-black"></div>
              <span className="shrink-0">บาท (ไม่รวมภาษีมูลค่าเพิ่ม)</span>
            </div>

            {/* (ค) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(ค)</span>
              <span className="shrink-0">ค่าธรรมเนียมในอัตราร้อยละ 0.5 ของการเบิกใช้วงเงินในครั้งนี้:</span>
              <div className="flex-1 border-b border-black"></div>
              <span className="shrink-0">บาท</span>
            </div>

            {/* (ง) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(ง)</span>
              <span className="shrink-0">วัตถุประสงค์การใช้สินเชื่อ:</span>
              <div className="flex-1 border-b border-black"></div>
            </div>

            {/* (จ) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(จ)</span>
              <div className="flex-1">
                <div className="mb-2">ส่งมอบเงินโดย (วิธีการใดวิธีการหนึ่ง)</div>

                <div className="space-y-2 pl-4">
                  {/* Cashier Cheque */}
                  <div className="flex gap-2">
                    <span className="inline-block w-4 h-4 border border-black shrink-0 mt-[2px]"></span>
                    <span className="shrink-0">แคชเชียร์เช็ค (Cashier Cheque): ธนาคาร</span>
                    <div className="flex-1 border-b border-black"></div>
                    <span className="shrink-0">, สั่งจ่ายชื่อ</span>
                    <div className="flex-1 border-b border-black"></div>
                  </div>

                  {/* Bank Cheque */}
                  <div className="flex gap-2">
                    <span className="inline-block w-4 h-4 border border-black shrink-0 mt-[2px]"></span>
                    <span className="shrink-0">เช็คธนาคารสั่งจ่ายล่วงหน้า: ธนาคาร</span>
                    <div className="flex-1 border-b border-black"></div>
                    <span className="shrink-0">, สั่งจ่ายชื่อ</span>
                    <div className="flex-1 border-b border-black"></div>
                  </div>

                  {/* Bank Transfer */}
                  <div className="flex gap-2">
                    <span className="inline-block w-4 h-4 border border-black shrink-0 mt-[2px]"></span>
                    <span className="shrink-0">โอนเงินไปที่บัญชี: ธนาคาร</span>
                    <div className="flex-1 border-b border-black"></div>
                    <span className="shrink-0">, เลขที่บัญชี</span>
                    <div className="flex-1 border-b border-black"></div>
                  </div>

                  {/* Other */}
                  <div className="flex gap-2">
                    <span className="inline-block w-4 h-4 border border-black shrink-0 mt-[2px]"></span>
                    <span className="shrink-0">วิธีการอื่นใด:</span>
                    <div className="flex-1 border-b border-black"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* (ฉ) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(ฉ)</span>
              <div className="flex-1">
                อัตราดอกเบี้ย: ร้อยละ <Highlight>1.25</Highlight> ต่อเดือน
              </div>
            </div>

            {/* (ช) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(ช)</span>
              <div className="flex-1">
                ระยะเวลาชำระดอกเบี้ย: ชำระทั้งจำนวนเมื่อครบกำหนดชำระคืนเงินต้น
              </div>
            </div>

            {/* (ซ) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(ซ)</span>
              <span className="shrink-0">ระยะเวลาชำระคืนเงินต้น: วันที่</span>
              <div className="flex-1 border-b border-black"></div>
            </div>

          </div>
        </div>

        {renderPageFooter(43)}
      </div>

      {/* Page 43 (Annex 6 - Credit Drawdown Request Form - Cont.) */}
      <div data-section-id="od-annex-6-drawdown-cont" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-4 text-[13px] pt-6">
          <div className="pl-10 space-y-3">
            {/* (ฌ) */}
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(ฌ)</span>
              <div className="flex-1 text-justify">
                เอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ที่ผู้กู้ส่งมอบให้แก่ผู้ให้สินเชื่อ ซึ่งเป็นเงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อในครั้งนี้ ได้แก่เอกสารระหว่างผู้กู้และบริษัท<span className="inline-block w-48 border-b border-black mx-1"></span>
              </div>
            </div>
          </div>

          <div className="text-justify pl-10">
            โดยให้ถือว่าข้าพเจ้าได้รับสินเชื่อโดยชอบด้วยกฎหมายแล้วทันทีเมื่อเป็นไปตามเงื่อนไขที่กำหนดในข้อ 3. ของสัญญาให้สินเชื่อ
          </div>

          {/* Clause 3 */}
          <div className="flex gap-2">
            <span className="shrink-0 w-8">3.</span>
            <div className="flex-1 text-justify">
              ข้าพเจ้าขอยืนยันว่า คำรับรองและยืนยันตามที่ระบุไว้ในข้อ 9. ของสัญญาให้สินเชื่อ เป็นความจริงและถูกต้อง ณ วันที่ที่ระบุไว้ในคำขอเบิกใช้สินเชื่อนี้เสมือนหนึ่งว่าคำรับรองและยืนยันดังกล่าวได้กระทำขึ้นโดยคำนึงถึงข้อเท็จจริง และเหตุการณ์ที่เกิดขึ้น หรือที่เป็นอยู่จริง ณ ขณะนี้ และไม่มีกรณีเหตุผิดนัด และเหตุการณ์ที่อาจจะนำไปสู่เหตุผิดนัดเกิดขึ้น หรือกำลังจะเกิดขึ้น หรือจะมีเหตุผิดนัดหรือเหตุการณ์ที่อาจจะนำไปสู่เหตุผิดนัดเกิดขึ้นเนื่องมาจากการเบิกใช้สินเชื่อที่ให้ในครั้งนี้
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex flex-col items-end pt-8 space-y-12 pr-12">
            <div className="text-center space-y-4">
              <div>ขอแสดงความนับถือ</div>
              <div className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></div>
            </div>
          </div>

          <div className="flex justify-between pt-8 px-12">
            <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">ประทับตราบริษัท (ถ้ามี)</div>
            <div className="w-1/2 space-y-4 pt-4 border-t border-black">
              <div className="flex items-end gap-2">
                <span>ชื่อ:</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
              </div>
              <div className="flex items-end gap-2">
                <span>ตำแหน่ง:</span>
                <div className="flex-1">กรรมการผู้มีอำนาจลงนาม</div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(44)}
      </div>

      {/* Page 44 (Annex 7 - Receipt of Credit Facility) */}
      <div data-section-id="od-annex-7" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px]">
          <div className="text-center font-bold">
            <div className="text-[13px]">เอกสารแนบท้ายหมายเลข 7</div>
            <div className="text-[13px]">แบบของเอกสารการรับสินเชื่อ</div>
          </div>

          <div className="flex justify-end pt-4">
            <div>วันที่ <Highlight>{formatThaiDate(data.effectiveDate) || '[•]'}</Highlight></div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรื่อง</span>
              <span className="flex-1 text-justify">
                การรับสินเชื่อตามสัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข สัญญาเลขที่ <Highlight>{data.contractNo || 'AGA/17-PL112025'}</Highlight> <b>(“สัญญาให้สินเชื่อ”)</b>
              </span>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <div className="flex-1">
                <Highlight>{agileInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 1 และ<br />
                <Highlight>{tkInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 2
              </div>
            </div>
          </div>

          <div className="text-justify indent-12 leading-relaxed pt-2">
            ตามที่ข้าพเจ้า<Highlight>{customerInfo.companyName}</Highlight> ได้ขอเบิกสินเชื่อต่อ [<Highlight>{agileInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 1 / <Highlight>{tkInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 2] เป็นจำนวน <span className="inline-block w-30 border-b border-black"></span> บาท ดังรายละเอียดปรากฏตามหนังสือขอเบิกใช้สินเชื่อ ฉบับลงวันที่ <span className="inline-block w-30 border-b border-black"></span>
          </div>

          <div className="text-justify indent-12 leading-relaxed">
            ในวันที่ <span className="inline-block w-23 border-b border-black"></span>ข้าพเจ้าได้รับสินเชื่อตามสัญญาให้สินเชื่อเป็นจำนวนเงิน <span className="inline-block w-30 border-b border-black"></span> บาท จาก [<Highlight>{agileInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 1 / <Highlight>{tkInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 2] ไว้ถูกต้องเรียบร้อยแล้ว จึงลงลายมือชื่อไว้เป็นสำคัญ ณ วัน เดือน ปี ที่กล่าวข้างต้น
          </div>

          <div className="flex flex-col items-end pt-5 space-y-12 pr-12">
            <div className="text-center">
              <div>ขอแสดงความนับถือ</div>
              <div className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></div>
            </div>
          </div>

          <div className="flex justify-between pt-8 px-12">
            <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">ประทับตราบริษัท (ถ้ามี)</div>
            <div className="w-1/2 space-y-4 pt-4">
              <div className="border-t border-black mb-2"></div>
              <div className="flex items-end gap-2">
                <span>ชื่อ:</span>
                <div className="flex-1 border-b border-dotted border-black"></div>
              </div>
              <div className="flex items-end gap-2">
                <span>ตำแหน่ง:</span>
                <div className="flex-1 text-center font-bold">กรรมการผู้มีอำนาจลงนาม</div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(45)}
      </div>

      {/* Page 45 (Annex 8) */}
      <div data-section-id="od-annex-8" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="flex flex-col items-center text-[13px]">
          <div className="font-bold">เอกสารแนบท้ายหมายเลข 8</div>
          <div className="font-bold underline text-center uppercase">
            รายละเอียดเกี่ยวกับหลักประกัน
          </div>
        </div>


        {renderPageFooter(46)}
      </div>

      {/* Page 46 (Annex 9) */}
      <div data-section-id="od-annex-9" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 text-[13px]">
          <div className="text-center font-bold">
            <div className="text-[13px]">เอกสารแนบท้ายหมายเลข 9</div>
            <div className="text-[13px]">แบบของหนังสือแจ้งการโอนสิทธิการรับชำระเงินมีผลบังคับใช้</div>
          </div>

          <div className="flex justify-end pt-4">
            <div>วันที่ <Highlight>{formatThaiDate(data.effectiveDate) || '[•]'}</Highlight></div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรื่อง</span>
              <span className="flex-1 text-justify">
                แจ้งการโอนสิทธิการรับชำระเงินมีผลบังคับใช้
              </span>
            </div>

            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <div className="flex-1">
                <Highlight>[•]</Highlight>
              </div>
            </div>
            <div className="pl-14">
              บริษัท <Highlight>[ชื่อของลูกค้าของผู้กู้]</Highlight>
            </div>
          </div>

          <div className="text-justify indent-12 leading-relaxed pt-2">
            ตามที่ <Highlight>{customerInfo.companyName || '[ชื่อของผู้กู้]'}</Highlight> <b>(“ผู้โอนสิทธิ”)</b> ได้มีการแจ้งการโอนสิทธิเรียกร้องในการรับชำระเงินให้ท่านทราบ ดังรายละเอียดปรากฏตามหนังสือบอกกล่าวการโอนสิทธิการรับชำระเงิน แบบมีเงื่อนไข ฉบับลงวันที่ <span className="inline-block w-30 border-b border-dotted border-black"></span> <b>(“หนังสือบอกกล่าว”)</b> นั้น
          </div>

          <div className="text-justify indent-12 leading-relaxed">
            โดยหนังสือฉบับนี้ ข้าพเจ้า<Highlight>{agileInfo.companyName}</Highlight> และ <Highlight> {tkInfo.companyName}</Highlight> <b>(“ผู้รับโอนสิทธิ”)</b> ขอส่งหนังสือแจ้งการโอนสิทธิการรับชำระเงินมีผลบังคับใช้ เพื่อแจ้งให้ท่านทราบว่าการโอนสิทธิเรียกร้องในการรับชำระเงินดังกล่าวมีผลบังคับใช้ตามกฎหมายและตามที่ข้าพเจ้าได้ตกลงกับผู้โอนสิทธิ ตั้งแต่วันที่ท่านได้รับหนังสือฉบับนี้เป็นต้นไป <b>(“วันบังคับโอนสิทธิ”)</b> ดังนั้น ตั้งแต่วันบังคับโอนสิทธิ สิทธิเรียกร้องในการรับเงินทุกประการตามเอกสารที่เกี่ยวข้องตามที่ระบุในหนังสือบอกกล่าวจะตกเป็นของผู้รับโอนสิทธิ และผู้โอนสิทธิไม่มีสิทธิรับเงินใด ๆ ตามเอกสารที่เกี่ยวข้องตามที่ระบุในหนังสือบอกกล่าวอีกต่อไป
          </div>

          <div className="text-justify indent-12 leading-relaxed">
            จึงเรียนมาเพื่อทราบ และขอความกรุณาให้ท่านให้ความร่วมมือกับผู้รับโอนสิทธิหรือตัวแทนของผู้รับโอนสิทธิในการดำเนินการต่าง ๆ ต่อไปทุกประการด้วย จักขอบพระคุณยิ่ง
          </div>

          <div className="text-justify indent-12 leading-relaxed pt-4">
            หากมีข้อสงสัยประการใด โปรดติดต่อ <span className="inline-block w-32 border-b border-dotted border-black"></span> โทร <span className="inline-block w-32 border-b border-dotted border-black"></span>
          </div>
        </div>

        {renderPageFooter(47)}
      </div>

      {/* Page 47 (Annex 9 - Signature) */}
      <div data-section-id="od-annex-9-sig" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="pt-20 text-[13px]">
          <div className="text-center mb-16">
            ขอแสดงความนับถือ
          </div>

          <div className="grid grid-cols-2 gap-16 px-12">
            {/* Agile Assets Sig */}
            <div className="flex flex-col items-center">
              <div className="mb-24"><Highlight>{agileInfo.companyName}</Highlight></div>
              <div className="w-full space-y-3">
                <div className="border-t border-black w-full mb-2"></div>
                <div className="flex items-end gap-2">
                  <span className="shrink-0">ชื่อ:</span>
                  <div className="flex-1 border-b border-dotted border-black"></div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0">ตำแหน่ง:</span>
                  <div className="flex-1 text-center">กรรมการผู้มีอำนาจลงนาม</div>
                </div>
                <div className="text-center text-gray-600 pt-8">
                  ประทับตราบริษัท (ถ้ามี)
                </div>
              </div>
            </div>

            {/* TK Sig */}
            <div className="flex flex-col items-center">
              <div className="mb-24"><Highlight>{tkInfo.companyName}</Highlight></div>
              <div className="w-full space-y-3">
                <div className="border-t border-black w-full mb-2"></div>
                <div className="flex items-end gap-2">
                  <span className="shrink-0">ชื่อ:</span>
                  <div className="flex-1 border-b border-dotted border-black"></div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0">ตำแหน่ง:</span>
                  <div className="flex-1 text-center">กรรมการผู้มีอำนาจลงนาม</div>
                </div>
                <div className="text-center text-gray-600 pt-8">
                  ประทับตราบริษัท (ถ้ามี)
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(48)}
      </div>
    </div>
  );
}
