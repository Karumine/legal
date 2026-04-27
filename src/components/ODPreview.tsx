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
}

export const THAI_INDEX = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ'];

export default function ODPreview({ data, customerInfo, agileInfo, tkInfo, guarantors }: Props) {
  // Strip leading "เลขที่" from address data to prevent duplication
  const stripAddressPrefix = (addr: string) =>
    addr?.replace(/^เลขที่\s*/, '') || '';

  const loanAmt = typeof data.loanAmount === 'string' ? parseFloat(data.loanAmount.replace(/,/g, '')) : (parseFloat(data.loanAmount) || 0);
  const p1 = parseFloat(String(data.lender1?.proportion || '0')) || 0;
  const p2 = parseFloat(String(data.lender2?.proportion || '0')) || 0;

  const limit1 = Math.floor(loanAmt * (p1 / 100));
  const limit2 = Math.floor(loanAmt * (p2 / 100));

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line space-y-8 print:space-y-0 mx-auto">
      {/* Page 1 */}
      <div data-section-id="cf-general" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-[16px]">สัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข</h2>
          <div className="mt-2 text-[16px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          <b>สัญญาให้สินเชื่อหมุนเวียน แบบมีเงื่อนไข</b> (“สัญญา”) ฉบับนี้ ทำขึ้นที่ <Highlight>{data.madeAt || agileInfo.companyName}</Highlight> เมื่อวันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight>
        </div>

        <div className="mb-4 mt-6">โดยและระหว่าง</div>

        <div className="space-y-4 mb-6">
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
            (ซึ่ง 1. และ 2. ต่อไปจะเรียกรวมกันว่า <b>“ผู้ให้สินเชื่อ”</b>) และ
          </div>

          <div className="flex gap-4 text-justify">
            <span className="shrink-0 w-6">3)</span>
            <div className="flex-1">
              <b><Highlight>{customerInfo.companyName}</Highlight></b> (โดย <Highlight>{customerInfo.directors}</Highlight> {getAuthorizedSignatoryText(customerInfo)}) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(customerInfo.address, customerInfo.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(customerInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้กู้”</b>)
            </div>
          </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 1 จาก 24
          </div>
        </div>
      </div>

      {/* Page 2 */}
      <div data-section-id="od-financials" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div>
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
            <div className="flex gap-2 mb-6">
              <div className="flex-1">
                คู่สัญญาทั้งสามฝ่ายจึงได้ตกลงเข้าทำสัญญาฉบับนี้ขึ้น โดยมีข้อความดังต่อไปนี้
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
                  <td className="border border-black p-2">ผู้ให้สินเชื่อฝ่ายที่ 1</td>
                  <td className="border border-black p-2">
                    <Highlight>{data.lender1?.proportion || '0'} ({thaiNumberText(data.lender1?.proportion || '0')})</Highlight>
                  </td>
                  <td className="border border-black p-2">
                    <Highlight>{limit1.toLocaleString('en-US')}</Highlight>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2">ผู้ให้สินเชื่อฝ่ายที่ 2</td>
                  <td className="border border-black p-2">
                    <Highlight>{data.lender2?.proportion || '0'} ({thaiNumberText(data.lender2?.proportion || '0')})</Highlight>
                  </td>
                  <td className="border border-black p-2">
                    <Highlight>{limit2.toLocaleString('en-US')}</Highlight>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="flex gap-2 items-center mb-4">
              <span className="font-bold">2.</span>
              <span className="font-bold">วัตถุประสงค์</span>
            </div>
            <div className="indent-8 text-justify">
              ผู้กู้ตกลงที่จะนำสินเชื่อที่ได้รับจากผู้ให้สินเชื่อภายใต้สัญญาฉบับนี้ ไปใช้เพื่อวัตถุประสงค์สำหรับ <Highlight>{data.businessPurpose || 'ระบุวัตถุประสงค์การใช้สินเชื่อ'}</Highlight>
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
                ผู้กู้และผู้ให้สินเชื่อตกลงกันว่าในการเบิกใช้สินเชื่อ ผู้กู้ต้องเบิกใช้สินเชื่อจากผู้ให้สินเชื่อแต่ละรายตามสัดส่วน และไม่เกินจำนวนสินเชื่อของผู้ให้สินเชื่อแต่ละรายตามที่กำหนดในข้อ 1.2 ของสัญญาฉบับนี้
              </div>
            </div>
          </div>
        </div>

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 2 จาก 24
          </div>
        </div>
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
                ผู้กู้จะเริ่มมีสิทธิขอเบิกใช้สินเชื่อในแต่ละครั้งภายใต้สัญญาฉบับนี้ได้ ต่อเมื่อผู้กู้ดำเนินการตามข้อ 3. ผู้กู้ได้ดำเนินการ และ/หรือ ส่งมอบเอกสาร ดังต่อไปนี้ครบถ้วนในวันที่ผู้กู้ยื่นหนังสือขอเบิกใช้สินเชื่อตามข้อ 3. ของสัญญาฉบับนี้ หรือได้รับการยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อให้ผู้กู้ไม่ต้องดำเนินการ และ/หรือ ส่งมอบเอกสารอย่างใดอย่างหนึ่ง หรือหลายอย่างดังกล่าว
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
                        ทั้งนี้ ผู้กู้ได้ดำเนินการเปิดบัญชีธนาคารกสิกรไทย ชื่อบัญชี <Highlight>{customerInfo.companyName}</Highlight> ประเภทออมทรัพย์ สาขา<Highlight>ถนนเพชรบุรีตัดใหม่ (อิตัลไทย ทาวเวอร์)</Highlight> หมายเลขบัญชี <Highlight>207-8-43222-8</Highlight> และได้ดำเนินการให้ตัวแทนของผู้ให้สินเชื่อ (<Highlight>นางสาววิสารัตน์ ทองหม่อม</Highlight> และ/หรือ บุคคลอื่นใดที่ผู้ให้สินเชื่อกำหนด) เท่านั้น เป็นผู้มีอำนาจลงนามสั่งจ่าย / ถอนเงินหรือทำธุรกรรมของบัญชีธนาคารดังกล่าวได้ ตั้งแต่วันที่ทำสัญญาฉบับนี้ ทั้งนี้ ผู้กู้ต้องไม่กระทำการเปลี่ยนแปลงบัญชีดังกล่าวในภายหลัง เว้นแต่ได้รับความยินยอมเป็นหนังสือจากผู้ให้สินเชื่อทั้งสองฝ่าย
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 3 จาก 24
          </div>
        </div>
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
                        ดำเนินการส่งมอบสำเนาเอกสารใบคำสั่งซื้อ (PO) ของลูกค้าของผู้กู้ ใบวางบิลของผู้กู้ และเอกสารอื่นใดที่เกี่ยวข้องที่แสดงถึงสิทธิเรียกร้อง และ/หรือ หนี้ที่ผู้กู้มีต่อลูกค้าของผู้กู้ ที่ผู้ให้สินเชื่อยอมรับ พร้อมหลักฐานการตรวจรับสินค้า และ/หรือ ตรวจรับบริการที่มีลูกค้าของผู้กู้ หรือตัวแทนของลูกค้าของผู้กู้ได้ลงลายมือชื่อตรวจรับสินค้า และ/หรือ ตรวจรับบริการครบถ้วนสมบูรณ์ (“เอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้”) ให้แก่ผู้ให้สินเชื่อ ประกอบการเบิกใช้สินเชื่อแต่ละคราวตามข้อ 3.4 ของสัญญาฉบับนี้ (“โครงการ”) และให้ถือว่าเอกสารดังกล่าวเป็น <span className="font-bold underline decoration-1">เอกสารแนบท้ายหมายเลข 2</span> (สำเนาใบคำสั่งซื้อของลูกค้าของผู้กู้และสำเนาเอกสารวางบิลของผู้กู้) หรือ <span className="font-bold underline decoration-1">เอกสารแนบท้ายหมายเลข 3</span> <i>(ตารางแสดงใบคำสั่งซื้อและจำนวนเงินที่ผู้ให้สินเชื่อมีสิทธิหักเพื่อชำระคืนเงินในแต่ละรายการ)</i> (แล้วแต่กรณี) ของสัญญาฉบับนี้
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 4 จาก 24
          </div>
        </div>
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

          <div className="flex gap-2">
            <span className="shrink-0 w-8">3.3</span>
            <div className="flex-1 text-justify">
              <span className="mb-2 inline-block underline">เงื่อนไขบังคับเพิ่มเติมก่อนการเบิกใช้สินเชื่อ</span>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ก)</span>
                  <div className="flex-1">
                    กรณีที่นายพรรษา เริงพิทยา มิได้เป็นกรรมการผู้มีอำนาจลงนามผูกพันนิติบุคคลของผู้กู้เมื่อใดก็ตาม ผู้ให้สินเชื่อมีสิทธิพิจารณาบอกเลิกสัญญา และ/หรือ ระงับหรือเพิกถอนวงเงินใช้สินเชื่อทั้งหมดหรือบางส่วนได้ทันที โดยไม่ต้องบอกกล่าวล่วงหน้า ทั้งนี้ ผู้กู้ตกลงว่าจะไม่ติดใจ และไม่โต้แย้งใดๆ รวมถึงเรียกร้องค่าเสียหาย หรือยกเป็นข้อต่อสู้ในภายหลังได้
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ข)</span>
                  <div className="flex-1">
                    กรณีมีผู้ถือหุ้นรายใหม่รายใด นอกเหนือจากที่มีอยู่เดิม ณ วันทำสัญญาฉบับนี้ เข้าถือหุ้นในสัดส่วนตั้งแต่ร้อยละ 25 ขึ้นไป ผู้ถือหุ้นรายนั้นต้องเข้าทำสัญญาค้ำประกันภายในระยะเวลาที่ผู้ให้สินเชื่อกำหนดก่อน จึงจะสามารถเบิกใช้วงเงินได้
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ค)</span>
                  <div className="flex-1">
                    กรณีผู้กู้มีหนี้คงค้างกับผู้ให้สินเชื่อ ผู้กู้ตกลงให้ผู้ให้สินเชื่อมีสิทธิในการหักหนี้คงค้างทั้งหมดก่อนการเบิกใช้วงเงินในแต่ละคราวได้
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(ง)</span>
                  <div className="flex-1">
                    กรณีผู้กู้มีหนี้คงค้างกับผู้ให้สินเชื่อในโครงการใดโครงการหนึ่ง ผู้กู้จะขอเบิกใช้เงินในโครงการนั้นที่มีหนี้คงค้างอยู่ไม่ได้ เว้นแต่ผู้ให้สินเชื่อเห็นสมควรพิจารณาอนุมัติเป็นรายกรณีไป
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="shrink-0 w-8">(จ)</span>
                  <div className="flex-1">
                    ผู้ให้สินเชื่อสามารถหักค่าธรรมเนียมในอัตราาร้อยละ 0.5 ก่อนการรับสินเชื่อในแต่ละคราว โดยไม่ต้องแจ้งให้ผู้กู้ทราบล่วงหน้า และ/หรือ ผู้กู้สามารถชำระโดยตรงแก่ผู้ให้สินเชื่อ ในกรณีผู้ให้สินเชื่อเรียกให้ชำระก็ได้ ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้
                  </div>
                </div>
              </div>
            </div>
          </div>

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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 5 จาก 24
          </div>
        </div>
      </div>

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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 6 จาก 24
          </div>
        </div>
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
                          คู่สัญญาทุกฝ่ายตกลงว่าวิธีการรับสินเชื่อตามสัญญาฉบับนี้ สามารถกระทำได้ในรูปแบบของแคชเชียร์เช็ค (Cashier Cheque) หรือเช็คธนาคารสั่งจ่ายล่วงหน้า ซึ่งออกโดยธนาคารพาณิชย์ที่กำหนดโดยผู้ให้สินเชื่อและยอมรับโดยผู้กู้ หรือ การโอนเงินเข้าบัญชีธนาคารของผู้กู้ หรือวิธีการอื่นใดที่คู่สัญญาทุกฝ่ายจะได้ตกลงร่วมกัน โดยผู้ให้สินเชื่อจะดำเนินการส่งมอบสินเชื่อให้ผู้กู้ด้วยวิธีการที่ระบุในหนังสือขอเบิกใช้สินเชื่อในแต่ละคราว ภายใต้เงื่อนไขดังต่อไปนี้

                          <div className="mt-4 space-y-4">
                            <div className="flex gap-2">
                              <span className="shrink-0 w-8">(1.1)</span>
                              <div className="flex-1">
                                <span className="underline">รูปแบบของแคชเชียร์เช็ค (Cashier Cheque)</span>
                                <div className="mt-2">
                                  ผู้ให้สินเชื่อตกลงจะส่งมอบแคชเชียร์เช็ค (Cashier Cheque) ตามจำนวนเงินที่ระบุในหนังสือขอเบิกใช้สินเชื่อจำนวน 2 (สอง) ฉบับ ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ให้แก่ผู้กู้ ณ ที่ทำการของผู้ให้สินเชื่อภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นกาารให้สินเชื่อเมื่อผู้ให้สินเชื่อได้มีการส่งมอบแคชเชียร์เช็ค (Cashier Cheque) ให้แก่ผู้กู้
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 7 จาก 24
          </div>
        </div>
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
                              ผู้ให้สินเชื่อตกลงจะส่งมอบเช็คธนาคารสั่งจ่ายล่วงหน้าในนามผู้กู้ตามจำนวนเงินที่ระบุในหนังสือขอเบิกใช้เงินกู้จำนวน 2 (สอง) ฉบับ ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ให้แก่ผู้กู้ ณ ที่ทำการของผู้ให้สินเชื่อ ก่อนหรือภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อเมื่อผู้กู้ได้รับเงินจำนวนดังกล่าวไว้ในบัญชีธนาคารเต็มจำนวนเรียบร้อยแล้ว
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
                              ผู้ให้สินเชื่อตกลงจะได้ส่งมอบสินเชื่อตามจำนวนที่ระบุในหนังสือขอเบิกใช้เงินกู้ให้แก่ผู้กู้ ตามวิธีการอื่นใดที่คู่สัญญาทุกฝ่ายจะได้ตกลงร่วมกัน ก่อนหรือภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อตามที่คู่สัญญาทุกฝ่ายจะได้ตกลงร่วมกัน
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 8 จาก 24
          </div>
        </div>
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
                  ผู้กู้ตกลงยินยอมให้ผู้ให้สินเชื่อคิดดอกเบี้ยบนเงินต้นที่ยังไม่ได้ชำระคืนในอัตราร้อยละ <Highlight>1.25 ต่อเดือน</Highlight> ในรูปแบบดอกเบี้ยคงที่ (Flat Rate) โดยการคำนวณดอกเบี้ยให้เป็นไปตามธรรมเนียมปฏิบัติของผู้ให้สินเชื่อและภายใต้กฎหมายที่เกี่ยวข้อง นับแต่วันเบิกใช้สินเชื่อจนกว่าผู้กู้จะชำระคืนเงินตามข้อ 5.1 ของสัญญาฉบับนี้
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
                คู่สัญญาทุกฝ่ายตกลงให้ผู้กู้สามารถชำระคืนเงินต้นก่อนวันครบกำหนดชำระเงินตามข้อ 5.1 ของสัญญาฉบับนี้ได้ (ไม่ว่าจะชำระคืนทั้งหมดหรือแต่เพียงบางส่วน) โดยให้คิดดอกเบี้ยตามจริงในส่วนของต้นเงินที่ขอเบิกใช้สินเชื่อไปจนถึงวันที่ผู้กู้ได้ชำระหนี้เงินต้นคืนทั้งหมด ทั้งนี้ การชำระคืนก่อนกำหนดดังกล่าวจะไม่ถือเป็นการผิดสัญญา
              </div>
            </div>
          </div>
        </div>

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 9 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 10 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 11 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 12 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 13 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 14 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 15 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 16 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 17 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 18 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 19 จาก 24
          </div>
        </div>
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

          {/* Footer info for print */}
          <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
            <div>
              สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
            </div>
            <div>
              หน้า 20 จาก 24
            </div>
          </div>
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
                  <b>หน้าที่กระทำการอื่นใด</b>: ผู้กู้จะต้องกระทำการ หรือปฏิบัติตามคำร้องขอของผู้ให้สินเชื่ออื่นใดเพิ่มเติม เพื่อให้การดำเนินการ หรือปฏิบัติตามสัญญานี้ของคู่สัญญาทุกฝ่ายสำเร็จลุล่วงไปได้ด้วยดี
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

          {/* Footer info for print */}
          <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
            <div>
              สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
            </div>
            <div>
              หน้า 21 จาก 24
            </div>
          </div>
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

          {/* Footer info for print */}
          <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
            <div>
              สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
            </div>
            <div>
              หน้า 22 จาก 24
            </div>
          </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 23 จาก 24
          </div>
        </div>
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

        {/* Footer info for print */}
        <div className="absolute bottom-10 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-400 font-sans">
          <div>
            สัญญาให้สินเชื่อหมุนเวียนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
          </div>
          <div>
            หน้า 24 จาก 24
          </div>
        </div>
      </div>
    </div>
  );
}
