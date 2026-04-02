import PageHeader from './PageHeader';
import type { CreditFacilityData, CompanyInfo, GuarantorData } from '../types/app';
import { formatThaiDate } from '../utils/thaiDate';
import { formatThaiId, getAuthorizedSignatoryText } from '../utils/formatters';
import { thaiBahtText } from '../utils/thaiBahtText';
import { thaiNumberText } from '../utils/thaiNumberText';

interface Props {
  data: CreditFacilityData;
  customerInfo: CompanyInfo;
  agileInfo: CompanyInfo;
  tkInfo: CompanyInfo;
  guarantors: GuarantorData[];
}

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-yellow-100 px-1 rounded">
    {children || '\u00A0'}
  </span>
);

export default function CreditFacilityPreview({ data, customerInfo, agileInfo, tkInfo, guarantors }: Props) {
  const totalPages = 35; // As seen in the image

  const getThaiIndex = (index: number) => {
    const symbols = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ'];
    return symbols[index] || (index + 1).toString();
  };

  const renderPageFooter = (pageNum: number) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600 font-sans">
      <div>
        สัญญาให้สินเชื่อเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
      </div>
      <div>
        หน้า {pageNum} / {totalPages}
      </div>
    </div>
  );

  const loanAmt = typeof data.loanAmount === 'string' ? parseFloat(data.loanAmount.replace(/,/g, '')) : (parseFloat(data.loanAmount) || 0);
  const p1 = parseFloat(String(data.lender1?.proportion || '0')) || 0;
  const p2 = parseFloat(String(data.lender2?.proportion || '0')) || 0;

  const limit1 = Math.floor(loanAmt * (p1 / 100));
  const limit2 = Math.floor(loanAmt * (p2 / 100));

  // No longer needed as machinery is now flat
  const hasLargeMachinery = false;
  const collateralOverflow = (data.collateralAssets || []).length > 2;
  const machineryOffset = collateralOverflow ? 1 : 0;

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line space-y-8 print:space-y-0 mx-auto">
      {/* Page 1 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-xl">สัญญาให้สินเชื่อ</h2>
          <div className="mt-2 text-[14px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6 font-bold">
          สัญญาให้สินเชื่อ (“สัญญา”) ฉบับนี้ ทำขึ้นที่<Highlight>{agileInfo.companyName}</Highlight> ให้มีผลใช้บังคับตั้งแต่วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight> (“วันที่สัญญามีผลใช้บังคับ”)
        </div>

        <div className="mb-4 mt-6">โดยและระหว่าง</div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-2 text-justify pr-2">
            <span className="shrink-0 w-4">1)</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{agileInfo.companyName}</Highlight></span> (โดย <Highlight>{agileInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{agileInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(agileInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้สินเชื่อฝ่ายที่ 1”</b>)
            </div>
          </div>

          <div className="flex gap-2 text-justify pr-2">
            <span className="shrink-0 w-4">2)</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{tkInfo.companyName}</Highlight></span> (โดย <Highlight>{tkInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{tkInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(tkInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้สินเชื่อฝ่ายที่ 2”</b>)
            </div>
          </div>

          <div className="pl-6">
            (ซึ่ง 1. และ 2. ต่อไปจะเรียกรวมกันว่า <b>“ผู้ให้สินเชื่อ”</b>) และ
          </div>

          <div className="flex gap-2 text-justify pr-2">
            <span className="shrink-0 w-4">3)</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></span> (โดย <Highlight>{customerInfo.directors}</Highlight> {getAuthorizedSignatoryText(customerInfo)}) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{customerInfo.address}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(customerInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้กู้”</b>)
            </div>
          </div>
        </div>

        <div className="font-bold mb-4">โดยที่</div>
        <div className="space-y-3 mb-6">
          <div className="flex gap-2">
            <span>ก.</span>
            <div className="flex-1">ผู้กู้มีความประสงค์จะขอสินเชื่อเงินกู้แบบมีกำหนดเวลา (<b>“สินเชื่อ”</b>) จากผู้ให้สินเชื่อ</div>
          </div>
          <div className="flex gap-2">
            <span>ข.</span>
            <div className="flex-1">ผู้ให้สินเชื่อตกลงจะให้สินเชื่อแก่ผู้กู้ตามเงื่อนไขและข้อกำหนดที่ระบุไว้ในสัญญาฉบับนี้</div>
          </div>
          <div className="flex gap-2">
            <span>ค.</span>
            <div className="flex-1">การให้สินเชื่อตามสัญญาฉบับนี้ เป็นการให้สินเชื่อร่วมกันระหว่างผู้ให้สินเชื่อฝ่ายที่ 1 และผู้ให้สินเชื่อฝ่ายที่ 2 โดยมีลักษณะเป็นการให้สินเชื่อร่วมกัน (Consortium Loan)</div>
          </div>
        </div>

        {renderPageFooter(1)}
      </div>

      {/* Page 2 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div>
            <div className="flex gap-2 items-center mb-4">
              <span className="font-bold">1.</span>
              <span className="font-bold underline decoration-1 underline-offset-4">วงเงินสินเชื่อ</span>
            </div>
            <div className="flex gap-4 mb-4">
              <span>1.1</span>
              <div className="flex-1 text-justify">
                ภายใต้เงื่อนไขและข้อกำหนดที่ระบุในสัญญาฉบับนี้ ผู้ให้สินเชื่อตกลงให้สินเชื่อแก่ผู้กู้ และผู้กู้ตกลงที่จะรับสินเชื่อดังกล่าวจากผู้ให้สินเชื่อ <Highlight>เป็นจำนวนเงิน {data.loanAmount} บาท ({thaiBahtText(data.loanAmount)})</Highlight>
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <span>1.2</span>
              <div className="flex-1 text-justify">
                ผู้ให้สินเชื่อตกลงให้สินเชื่อแก่ผู้กู้ตามที่กำหนดไว้ในข้อ 1.1 ของสัญญาฉบับนี้ ตามสัดส่วนดังต่อไปนี้
              </div>
            </div>

            <table className="w-full border-collapse border border-black text-center text-[12px] mb-6">
              <thead>
                <tr className="bg-slate-50 uppercase font-bold text-black border-black">
                  <th className="border border-black p-2 w-[40%]">ผู้ให้สินเชื่อ</th>
                  <th className="border border-black p-2 w-[30%]">สัดส่วน (ร้อยละ)</th>
                  <th className="border border-black p-2 w-[30%]">วงเงินสินเชื่อ (บาท)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black p-2">ผู้ให้สินเชื่อฝ่ายที่ 1</td>
                  <td className="border border-black p-2">
                    <Highlight>{data.lender1.proportion} ({thaiNumberText(data.lender1.proportion)})</Highlight>
                  </td>
                  <td className="border border-black p-2">
                    <Highlight>{limit1.toLocaleString('en-US')}</Highlight>
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-2">ผู้ให้สินเชื่อฝ่ายที่ 2</td>
                  <td className="border border-black p-2">
                    <Highlight>{data.lender2.proportion} ({thaiNumberText(data.lender2.proportion)})</Highlight>
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
              <span className="font-bold underline decoration-1 underline-offset-4">วัตถุประสงค์</span>
            </div>
            <div className="indent-8 text-justify">
              ผู้กู้ตกลงที่จะนำสินเชื่อที่ได้รับจากผู้ให้สินเชื่อภายใต้สัญญาฉบับนี้ ไปใช้เพื่อวัตถุประสงค์สำหรับ<Highlight>{data.businessPurpose || 'ใช้เป็นเงินทุนหมุนเวียนธุรกิจ ประกอบกิจการเกี่ยวกับโรงงานผลิตและจำหน่ายน้ำดื่มตรากรีนดริ้งค์ และรับจ้างผลิตน้ำดื่มในแบรนด์ของลูกค้าของผู้กู้'}</Highlight>
            </div>
          </div>

          <div>
            <div className="flex gap-2 items-center mb-4">
              <span className="font-bold">3.</span>
              <span className="font-bold underline decoration-1 underline-offset-4">การเบิกใช้สินเชื่อ</span>
            </div>
            <div className="flex gap-4">
              <span>3.1</span>
              <div className="flex-1 text-justify">
                ผู้กู้และผู้ให้สินเชื่อตกลงกันว่าในการเบิกใช้สินเชื่อ ผู้กู้ต้องเบิกใช้สินเชื่อจากผู้ให้สินเชื่อแต่ละรายตามสัดส่วนที่กำหนดในข้อ 1.2 ของสัญญาฉบับนี้
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(2)}
      </div>

      {/* Page 3 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2">
            <span>3.2</span>
            <div className="flex-1 text-justify">
              <span className="underline decoration-1 underline-offset-4 mb-2 inline-block">เงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อ</span>
              <div className="mb-4">
                ผู้กู้จะเริ่มมีสิทธิขอเบิกใช้สินเชื่อภายใต้สัญญาฉบับนี้ได้ก็ต่อเมื่อผู้กู้ได้ดำเนินการ และ/หรือ ส่งมอบเอกสารดังต่อไปนี้ครบถ้วนในวันที่ผู้กู้ยื่นหนังสือขอเบิกใช้สินเชื่อตามสัญญาฉบับนี้ หรือได้รับการยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อให้ผู้กู้ไม่ต้องดำเนินการ และ/หรือ ส่งมอบเอกสารอย่างใดอย่างหนึ่ง หรือหลายอย่างดังกล่าว
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span>(ก)</span>
                  <div className="flex-1">
                    ผู้ให้สินเชื่อได้รับเอกสารทุกอย่างตามที่ระบุไว้ใน <span className="underline decoration-1  font-bold">เอกสารแนบท้ายหมายเลข 1</span> (เงื่อนไขบังคับก่อน) โดยเอกสารแต่ละฉบับที่ส่งมอบจะต้องอยู่ในรูปแบบและเนื้อหาที่ผู้ให้สินเชื่อยอมรับ ทั้งนี้ ในกรณีเอกสารที่ส่งมอบนั้นเป็นสำเนาเอกสาร เอกสารดังกล่าวจะต้องได้รับการรับรองความถูกต้องโดยผู้มีอำนาจลงนามรับรองสำเนาเอกสารของผู้กู้
                  </div>
                </div>
                <div className="flex gap-2">
                  <span>(ข)</span>
                  <div className="flex-1">
                    ผู้กู้ได้ปฏิบัติตามเงื่อนไขทุกประการที่ระบุไว้ใน <span className="underline decoration-1 font-bold">เอกสารแนบท้ายหมายเลข 1</span> (เงื่อนไขบังคับก่อน)
                  </div>
                </div>
                <div className="flex gap-2">
                  <span>(ค)</span>
                  <div className="flex-1">
                    ผู้กู้ตกลงและยินยอมให้ผู้ให้สินเชื่อมีสิทธิในการหักเงินจากวงเงินกู้ที่จะได้รับตามสัญญาฉบับนี้ เพื่อการชำระค่าจดทะเบียนจำนองหลักประกัน ค่าอากรแสตมป์ ชำระค่าธรรมเนียมการทำสัญญา เงินดาวน์ ค่าประกันภัยเครื่องจักร ค่าจดทะเบียนกรรมสิทธิ์เครื่องจักร รวมถึงค่าใช้จ่ายอื่นๆ ทั้งตามสัญญาฉบับนี้ และสัญญาฉบับอื่นๆ ที่ผู้กู้มีหน้าที่ต้องชำระให้แก่ผู้ให้สินเชื่อ ก่อนการเบิกใชวงเงินตามสัญญาฉบับนี้
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span>3.3</span>
            <div className="flex-1 text-justify">
              <span className="underline decoration-1 mb-2 inline-block">การขอเบิกใช้สินเชื่อ</span>
              <div className="mb-4">
                ผู้กู้ตกลงจะเบิกใช้สินเชื่อทั้งหมดในคราวเดียว ภายใต้เงื่อนไขว่าผู้กู้ต้องปฏิบัติตามเงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อตามข้อ 3.2 ของสัญญาฉบับนี้
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <span>(ก)</span>
                  <div className="flex-1 text-justify">วิธีการและเงื่อนไขในการขอเบิกใช้สินเชื่อ
                    <div className="flex gap-2 mt-2">
                      <span>(1)</span>
                      <div className="flex-1">
                        ผู้กู้จะต้องยื่นหนังสือขอเบิกใช้สินเชื่อ ซึ่งมีสาระสำคัญตามแบบที่กำหนดไว้ใน <span className="underline decoration-1 font-sans font-bold">เอกสารแนบท้ายหมายเลข 2 (แบบของหนังสือขอเบิกใช้สินเชื่อ)</span> ให้แก่ผู้ให้สินเชื่อ อย่างน้อย <span className="underline decoration-1 font-bold">3</span> วันทำการ ก่อนวันเบิกใช้สินเชื่อ โดยหนังสือขอเบิกใช้สินเชื่อจะต้องระบุวันที่เป็นวันเบิกใช้สินเชื่อ ซึ่งจะต้องเป็นวันทำการเสมอด้วย
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
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="text-justify mb-4">
            ทั้งนี้ เพื่อมิให้เป็นที่สงสัย <span className="font-bold">“ระยะเวลาการเบิกใช้สินเชื่อ”</span> หมายถึง ระยะเวลาซึ่งเริ่มต้นนับตั้งแต่วันที่สัญญามีผลใช้บังคับและสิ้นสุดลงในวันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight> และ <span className="font-bold">“วันทำการ”</span> หมายถึง วันที่ธนาคารเปิดดำเนินงานเพื่อประกอบธุรกิจเป็นการทั่วไปในประเทศไทย
          </div>

          <div className="flex gap-2">
            <span className="text-gray-800">(ข)</span>
            <div className="flex-1 text-justify">
              <span className="mb-2 inline-block text-gray-800">วิธีการรับสินเชื่อและหลักฐานการรับสินเชื่อ</span>

              <div className="space-y-4 mt-2">
                <div className="flex gap-2">
                  <span>(1)</span>
                  <div className="flex-1 text-justify uppercase">
                    คู่สัญญาทุกฝ่ายตกลงว่าวิธีการรับสินเชื่อตามสัญญาฉบับนี้ สามารถกระทำได้ในรูปแบบของ แคชเชียร์เช็ค (Cashier Cheque) หรือเช็คธนาคารสั่งจ่ายล่วงหน้า หรือ วิธีการอื่นใดที่คู่สัญญาทุกฝ่ายจะได้ตกลงร่วมกัน
                  </div>
                </div>

                <div className="flex gap-2 ml-12">
                  <span className="text-gray-700">(1.1)</span>
                  <div className="flex-1 text-justify">
                    <span className="mb-2 inline-block">รูปแบบของแคชเชียร์เช็ค (Cashier Cheque)</span>
                    <div className="mt-1">
                      ผู้ให้สินเชื่อตกลงจะส่งมอบแคชเชียร์เช็ค (Cashier Cheque) ตามจำนวนเงินที่ระบุในหนังสือขอเบิกใช้สินเชื่อจำนวน <Highlight>2 (สอง)</Highlight> ฉบับ ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ให้ผู้กู้ ณ ที่ทำการของผู้ให้สินเชื่อภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อเมื่อผู้ให้สินเชื่อได้มีการส่งมอบแคชเชียร์เช็ค (Cashier Cheque) ให้แก่ผู้กู้
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-12">
                  <span className="text-gray-700">(1.2)</span>
                  <div className="flex-1 text-justify">
                    <span className="mb-2 inline-block">รูปแบบของเช็คธนาคารสั่งจ่ายล่วงหน้า</span>
                    <div className="mt-1">
                      ผู้ให้สินเชื่อตกลงจะส่งมอบเช็คธนาคารสั่งจ่ายล่วงหน้าในนามผู้กู้ตามจำนวนเงินที่ระบุในหนังสือขอเบิกใช้เงินกู้จำนวน <Highlight>2 (สอง)</Highlight> ฉบับ ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ให้ผู้กู้ ณ ที่ทำการของผู้ให้สินเชื่อ ก่อนหรือภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อเมื่อผู้กู้ได้รับเงินจำนวนดังกล่าวไว้ในบัญชีธนาคารเต็มจำนวนเรียบร้อยแล้ว
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
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />

        <div className="space-y-6 mt-4">
          <div className="flex gap-2 ml-16">
            <span className="shrink-0 w-8">(1.3)</span>
            <div className="flex-1 text-justify">
              <span className="mb-2 inline-block">รูปแบบของการโอนเงินเข้าบัญชีธนาคารของผู้กู้</span>
              <div className="mt-1">
                ผู้ให้สินเชื่อตกลงจะโอนเงินตามจำนวนเงินที่ระบุในหนังสือขอเบิกใช้สินเชื่อตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ ให้แก่ผู้กู้ ไปยังบัญชีของผู้กู้ที่ระบุในหนังสือขอเบิกใช้สินเชื่อในแต่ละคราว ภายในวันที่เบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อเมื่อผู้กู้ได้รับเงินจำนวนดังกล่าวไว้ในบัญชีธนาคารเต็มจำนวนเรียบร้อยแล้ว
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-16">
            <span className="shrink-0 w-8">(1.4)</span>
            <div className="flex-1 text-justify">
              <span className="mb-2 inline-block">รูปแบบอื่นใด</span>
              <p>
                ผู้ให้สินเชื่อตกลงจะได้ส่งมอบสินเชื่อตามจำนวนที่ระบุในหนังสือขอเบิกใช้เงินกู้ให้แก่ผู้กู้ ตามวิธีการอื่นใดที่คู่สัญญาทุกฝ่ายจะได้ตกลงร่วมกัน ก่อนหรือภายในวันเบิกใช้สินเชื่อ และให้ถือว่าเป็นการให้สินเชื่อตามที่คู่สัญญาทุกฝ่ายจะได้ตกลงร่วมกัน
              </p>
            </div>
          </div>

          <div className="flex gap-2 ml-12">
            <span>(2)</span>
            <div className="flex-1 text-justify">
              เมื่อผู้กู้ได้รับสินเชื่อจากผู้ให้สินเชื่อแล้ว ผู้กู้ต้องส่งมอบเอกสารการรับสินเชื่อตามจำนวนที่ได้รับจากผู้ให้สินเชื่อแต่ละราย ซึ่งมีสาระสำคัญตามแบบที่กำหนดใน <span className="underline decoration-1 font-bold">เอกสารแนบท้ายหมายเลข 3</span>(แบบของเอกสารการรับสินเชื่อ) ให้แก่ตัวแทนสินเชื่อ ในวันเดียวกับวันที่ผู้กู้ได้รับสินเชื่อตามสัญญาฉบับนี้
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-2 items-center">
              <span className="font-bold">4.</span>
              <span className="font-bold">ดอกเบี้ย</span>
            </div>

            <div className="flex gap-2 ml-8">
              <span>4.1</span>
              <div className="flex-1">
                <span className="mb-2 inline-block">ระยะเวลาของดอกเบี้ย</span>
                <div className="text-justify">
                  ภายใต้บังคับของสัญญาฉบับนี้ ให้ระยะเวลาของงวดดอกเบี้ยสินเชื่อ มีกำหนดชำระพร้อมเงินต้นตามระยะเวลาที่กำหนดในข้อ 5 (การชำระคืนเงินต้น)
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(5)}
      </div>

      {/* Page 6 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 mt-4">
          <div className="flex gap-2 ml-8">
            <span>4.2</span>
            <div className="flex-1 text-justify">
              <span className="mb-2 inline-block text-gray-800">อัตราดอกเบี้ย</span>
              <div className="mb-4">
                ผู้กู้ตกลงยินยอมให้ผู้ให้สินเชื่อคิดดอกเบี้ยบนเงินต้นของสินเชื่อแบบลดต้นลดดอก ในอัตราร้อยละ <Highlight>{data.interestRate} ({thaiNumberText(data.interestRate)})</Highlight> ต่อปี
              </div>
              <table className="w-[60%] border-collapse border border-black text-center text-[12px] mb-6 mx-auto">
                <thead>
                  <tr className="bg-slate-50 uppercase font-bold text-black border-black">
                    <th className="border border-black p-2">งวดที่</th>
                    <th className="border border-black p-2">อัตราดอกเบี้ยร้อยละ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-2">1-<Highlight>{data.installments}</Highlight></td>
                    <td className="border border-black p-2"><Highlight>{data.interestRate}</Highlight> ต่อปี (ลดต้นลดดอก)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2 ml-8">
            <span>4.3</span>
            <div className="flex-1 text-justify">
              <span className=" mb-2 inline-block text-gray-800">การคำนวณและการชำระดอกเบี้ย</span>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span>(ก)</span>
                  <div className="flex-1">
                    ให้คำนวณดอกเบี้ยตามข้อ 4 (ดอกเบี้ย) นี้เป็นรายวันตามจำนวนที่ผ่านพ้นไปจริง โดยตกลงกำหนดให้ 1 ปี มี 365 วัน โดยให้ผู้กู้ชำระดอกเบี้ยที่เกิดขึ้นเป็นรายเดือนทุกๆ เดือน โดยชำระพร้อมกับการชำระคืนเงินต้นตามระยะเวลาที่กำหนดในข้อ 5 (การชำระคืนเงินต้น)
                  </div>
                </div>
                <div className="flex gap-2">
                  <span>(ข)</span>
                  <div className="flex-1">
                    ผู้กู้ตกลงชำระคืนเงินต้นพร้อมดอกเบี้ยภายใต้สัญญาฉบับนี้ ในรูปแบบของเช็คธนาคารสั่งจ่ายล่วงหน้า ในนามผู้ให้สินเชื่อแต่ละรายตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ โดยระบุจำนวนเงินต้นพร้อมดอกเบี้ยในแต่ละงวด ลงวันที่ที่ครบกำหนดชำระหนี้ รวมทั้งสิ้น <Highlight>{data.installments} ({thaiNumberText(data.installments)})</Highlight> งวด งวดละ 2 (สอง) ฉบับ ลงบนเช็ค <Highlight>{(parseInt(data.installments) * 2).toString()} ({(thaiNumberText((parseInt(data.installments) * 2).toString()))})</Highlight> ฉบับ และให้ถือว่าเป็นการชำระค่างวดเงินกู้ในแต่ละงวดเมื่อได้มีการขึ้นเงินและได้รับชำระเต็มจำนวนจากธนาคารดังกล่าวข้างต้น ทั้งนี้ ผู้กู้ได้จัดส่งมอบเช็คสั่งจ่ายล่วงหน้าให้ไว้แก่ผู้ให้สินเชื่อ เป็นจำนวน <Highlight>{(parseInt(data.installments) * 2).toString()}</Highlight> ฉบับ ณ วันที่ทำสัญญาฉบับนี้แล้ว โดยรายละเอียดเกี่ยวกับเช็คสั่งจ่ายล่วงหน้า <span className="underline decoration-1 underline-offset-4"><span className="font-bold">เอกสารแนบท้ายหมายเลข 4</span> (หลักฐานการส่งมอบเช็คสั่งจ่ายล่วงหน้าสำหรับการชำระค่างวดและดอกเบี้ย)</span> ทั้งนี้รายละเอียดการคำนวณเงินต้นพร้อมดอกเบี้ยในแต่ละงวด ปรากฏตามตารางคำนวณดอกเบี้ยเงินกู้ <span className="underline decoration-1 underline-offset-4"><span className="font-bold">เอกสารแนบท้ายหมายเลข 5</span> (รายละเอียดค่างวดแต่ละงวดและวิธีการคำนวณค่างวด)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(6)}
      </div>

      {/* Page 7 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 mt-4">
          <div className="flex gap-2 ml-14">
            <span>(ค)</span>
            <div className="flex-1 text-justify text-[12px]">
              สัญญาให้สินเชื่อฉบับนี้ คู่สัญญาทุกฝ่ายตกลงร่วมกันว่าการชำระเงินค่างวดเป็นงวดๆ ตามที่ระบุในสัญญา เป็นการชำระหนี้อันมีกำหนดระยะเวลาการชำระหนี้ที่แน่นอนอันถือเป็นสาระสำคัญของสัญญา ผู้กู้ตกลงและยินยอมที่จะไม่ขอชำระค่างวดและ/หรือ เงินต้นและ/หรือ ดอกเบี้ยก่อนกำหนดเวลา อย่างไรก็ตาม ในกรณีที่ผู้กู้มีความประสงค์จะชำระปิดบัญชีก่อนกำหนดชำระหนี้ ไม่ว่าด้วยเหตุที่ผู้กู้ได้รับเงินทุนจากแหล่งเงินทุนอื่น และ/หรือ จากสถาบันการเงินอื่นใดอันเป็นแหล่งเงินทุนใหม่นอกเหนือจากให้ผู้ให้สินเชื่อ หรือด้วยเหตุผลอื่นใดก็ตาม ผู้กู้จะต้องทำหนังสือแจ้งล่วงหน้าฝ่ายเดียวไปยังผู้ให้สินเชื่อไม่น้อยกว่า 5 (ห้า) วันทำการเพื่อแจ้งถึงการชำระเงินต้นสินเชื่อพร้อมดอกเบี้ยล่วงหน้าดังกล่าว และระบุจำนวนเงินที่จะชำระให้ชัดเจน
            </div>
          </div>
          <div className="text-justify ml-20 text-[12px]">
            <div className="mt-4">
              ทั้งนี้การที่ผู้กู้จะใช้สิทธิชำระปิดบัญชีก่อนกำหนดนั้น ผู้กู้จะต้องได้ชำระค่างวดเรียบร้อยแล้วเป็นจำนวนทั้งสิ้นอย่างน้อย 16 (สิบหก) งวด และผู้กู้ไม่ได้ผิดสัญญาในข้อใด ผู้ให้สินเชื่ออาจใช้ดุลยพินิจอนุญาตให้ผู้กู้ชำระค่างวดที่เหลือทั้งหมดเพื่อปิดวงเงินก่อนกำหนดระยะเวลาก็ได้ โดยผู้ให้สินเชื่อสงวนสิทธิในการคิดค่าดำเนินการเพิ่มเติมในอัตราร้อยละ 5 (ห้า) โดยคำนวณจากยอดเงินต้นและดอกเบี้ยที่เหลือที่นำมาชำระทั้งหมดได้ โดยให้ถือเป็นดุลยพินิจฝ่ายเดียวของผู้ให้สินเชื่อ
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-2 items-center">
              <span className="font-bold">5.</span>
              <span className="font-bold">การชำระคืนเงินต้นและดอกเบี้ย</span>
            </div>

            <div className="flex gap-2 ml-8">
              <span>5.1</span>
              <div className="flex-1 text-justify">
                ภายใต้บังคับของสัญญานี้ ผู้กู้ตกลงชำระคืนเงินต้นของสินเชื่อพร้อมดอกเบี้ยให้แก่ผู้ให้สินเชื่อตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ โดยผู้กู้ตกลงชำระคืนเงินต้นภายใต้สัญญาฉบับนี้เป็นงวดพร้อมดอกเบี้ยแบบลดต้นลดดอก เป็นจำนวนเงินงวดละ <Highlight>{data.installmentAmount || '63,032.64'}</Highlight> บาท (<Highlight>{thaiBahtText(data.installmentAmount || '63,032.64')}</Highlight>) รวมทั้งสิ้น <Highlight>{data.installments || '24'}</Highlight> (<Highlight>{thaiNumberText(data.installments || '24')}</Highlight>) งวด โดยชำระ 1 (หนึ่ง) เดือนต่อ 1 (หนึ่ง) งวด และตกลงจะชำระเงินต้นพร้อมดอกเบี้ยให้แก่ผู้ให้สินเชื่อในงวดแรก วันที่ <Highlight>{data.firstInstallmentDate ? formatThaiDate(data.firstInstallmentDate) : '25 เมษายน 2569'}</Highlight> และจะชำระเงินต้นพร้อมดอกเบี้ยให้แก่ผู้ให้สินเชื่อในแต่ละงวดทุกวันที่ <Highlight>{data.paymentDay || '25'}</Highlight> (<Highlight>{thaiNumberText(data.paymentDay || '25')}</Highlight>) ของเดือนปฏิทินนั้นๆ และในงวดสุดท้ายผู้กู้ตกลงชำระทั้งเงินต้นและดอกเบี้ยที่ยังคงค้างชำระตามสัญญานี้ให้ครบถ้วน ทั้งนี้ผู้กู้จะชำระเงินต้นสินเชื่อพร้อมดอกเบี้ยให้เสร็จสิ้นภายในวันที่ <Highlight>{data.lastInstallmentDate ? formatThaiDate(data.lastInstallmentDate) : '25 มีนาคม 2571'}</Highlight> (“วันครบกำหนดชำระเงินงวดสุดท้าย”)
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(7)}
      </div>

      {/* Page 8 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans text-justify">
        <PageHeader />
        <div className="space-y-6 mt-4">
          <div className="flex gap-2 ml-8">
            <span>5.2</span>
            <div className="flex-1 text-justify">
              ผู้กู้ตกลงชำระคืนเงินต้นภายใต้สัญญาฉบับนี้ ณ ภูมิลำเนาของผู้ให้สินเชื่อในรูปแบบเช็คธนาคารสั่งจ่ายล่วงหน้าในนามผู้ให้สินเชื่อตามจำนวนคืนเงินต้นพร้อมดอกเบี้ยในแต่ละงวด โดยลงวันที่ที่ครบกำหนดชำระหนี้ รวมทั้งสิ้น <Highlight>{data.installments || '24'}</Highlight> (<Highlight>{thaiNumberText(data.installments || '24')}</Highlight>) งวด งวดละ 2 (สอง) ฉบับ (สั่งจ่ายในนามของผู้ให้สินเชื่อแต่ละรายตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้) ลงบนเช็ค <Highlight>{(parseInt(data.installments || '24') * 2).toString()}</Highlight> (<Highlight>{thaiNumberText((parseInt(data.installments || '24') * 2).toString())}</Highlight>) ฉบับ และให้ถือว่าเป็นการชำระคืนเงินต้นพร้อมดอกเบี้ยในแต่ละงวดเมื่อได้มีการขึ้นเงินและได้รับชำระเต็มจำนวนจากธนาคารดังกล่าวข้างต้น
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span>5.3</span>
            <div className="flex-1 text-justify">
              ผู้กู้ได้ส่งมอบเช็คธนาคารสั่งจ่ายล่วงหน้าให้ไว้แก่ผู้ให้สินเชื่อ เป็นจำนวนทั้งสิ้น <Highlight>{(parseInt(data.installments || '24') * 2).toString()}</Highlight> (<Highlight>{thaiNumberText((parseInt(data.installments || '24') * 2).toString())}</Highlight>) ฉบับ ณ วันที่ทำสัญญาฉบับนี้แล้ว รายละเอียดเกี่ยวกับเช็คสั่งจ่ายล่วงหน้า <span className="underline decoration-1 underline-offset-4">เอกสารแนบท้ายหมายเลข 4</span> (หลักฐานการส่งมอบเช็คสั่งจ่ายล่วงหน้า สำหรับการชำระค่างวดและดอกเบี้ย) ทั้งนี้ หากคู่สัญญาตกลงจะเปลี่ยนแปลงวิธีการชำระในรูปแบบอื่น คู่สัญญาทั้งสองฝ่ายจะต้องตกลงกันเป็นลายลักษณ์อักษร โดยผู้กู้สามารถชำระด้วยเงินสด เช็ค หรือด้วยวิธีการโอนเงินเข้าบัญชีของผู้ให้สินเชื่อฝ่ายที่ 1 ชื่อบัญชี <Highlight>{agileInfo.companyName}</Highlight> ธนาคารกสิกรไทย ประเภทออมทรัพย์ หมายเลขบัญชี 025-3-77662-5
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span>5.4</span>
            <div className="flex-1 text-justify text-gray-800">
              ถ้าวันครบกำหนดชำระหนี้มีใช่วันทำการ ก็ให้เงินจำนวนนั้นๆ ถึงกำหนดชำระในวันทำการก่อนวันถึงกำหนดชำระนั้น
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span>5.5</span>
            <div className="flex-1 text-justify">
              ผู้กู้ตกลงที่จะไม่ชำระคืนเงินต้นก่อนวันครบกำหนดชำระเงินตามข้อ 5.1 ของสัญญาฉบับนี้ ไม่ว่าจะทั้งหมดหรือบางส่วน เว้นแต่ได้รับความยินยอมจากผู้ให้สินเชื่อ และภายใต้เงื่อนไขที่ผู้ให้สินเชื่อกำหนด
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-2 items-center">
              <span className="font-bold">6.</span>
              <span className="font-bold">วิธีการชำระเงิน</span>
            </div>
            <div className="flex gap-2 ml-8">
              <span>6.1</span>
              <div className="flex-1 text-justify">
                ในกรณีที่คู่สัญญาฝ่ายใดฝ่ายหนึ่งมีความประสงค์จะเปลี่ยนแปลงวิธีการชำระตามที่ระบุในข้อ 5 ของสัญญาฉบับนี้เป็นรูปแบบอื่น คู่สัญญาทั้งสามฝ่ายจะต้องตกลงกันเป็นลายลักษณ์อักษร
              </div>
            </div>
            <div className="flex gap-2 ml-8">
              <span>6.2</span>
              <div className="flex-1 text-justify">
                ในกรณีที่ผู้กู้ประสงค์จะชำระหนี้ด้วยวิธีการอื่นใดเป็นครั้งคราว เนื่องจากมีเหตุผิดนัดชำระ ชำระเบี้ยปรับหรือค่าใช้จ่ายอื่นใดที่เกี่ยวข้องกับสัญญาฉบับนี้ ให้ดำเนินการชำระผ่านบัญชีธนาคาร <span className="font-bold">ชื่อบัญชี <Highlight>{agileInfo.companyName}</Highlight> ธนาคารกสิกรไทย ประเภทออมทรัพย์ หมายเลขบัญชี 025-3-77662-5</span>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(8)}
      </div>

      {/* Page 9 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans text-gray-900">
        <PageHeader />
        <div className="space-y-6 mt-4">
          <div className="flex gap-2 ml-8">
            <span>6.3</span>
            <div className="flex-1 text-justify">
              คู่สัญญาทั้งสามฝ่ายตกลงว่าถ้าวันครบกำหนดชำระเงินใด ๆ มิใช่วันทำการ ก็ให้เงินจำนวนนั้น ๆ ถึงกำหนดชำระในวันทำการก่อนถึงกำหนดชำระนั้น
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-2 items-center">
              <span className="font-bold">7.</span>
              <span className="font-bold">หลักประกัน</span>
            </div>
            <div className="flex gap-2 ml-8 border-b-0">
              <span>7.1</span>
              <div className="flex-1 text-justify">
                ในวันที่ทำสัญญาฉบับนี้ และตลอดระยะเวลาของสัญญาฉบับนี้ ผู้กู้ตกลงจัดหาหลักประกันให้แก่ผู้ให้สินเชื่อ โดยมูลค่าของหลักประกัน ภายใต้เงื่อนไขที่กำหนดในข้อ 7.7 ของสัญญาฉบับนี้จะต้องมีมูลค่ารวมกันไม่น้อยกว่า <Highlight>{data.collateralValue || '0'}</Highlight> บาท หรือตามที่ผู้ให้สินเชื่อเห็นสมควร
              </div>
            </div>
            <div className="flex gap-2 ml-8">
              <span>7.2</span>
              <div className="flex-1 text-justify">
                ในการทำสัญญาให้สินเชื่อฉบับนี้ ผู้กู้ได้ตกลงทำสัญญาค้ำประกันโดยบุคคลภายนอก (“บุคคลค้ำประกัน”)
              </div>
            </div>
            <div className="flex gap-2 ml-16">
              <span>(ก)</span>
              <div className="flex-1 text-justify">
                สัญญาค้ำประกันโดยบุคคลภายนอก: <Highlight>{(guarantors || []).filter(g => g.guarantorName.trim()).map((g, i) => `${i + 1}. ${g.guarantorName}`).join(' ') || '....................'}</Highlight> โดยผู้ค้ำประกันอาจเป็นบุคคลธรรมดาหรือนิติบุคคลซึ่งไม่มีหนี้สินล้นพ้นตัว มีแหล่งรายได้ชัดเจนและมีคุณสมบัติอื่นๆ ตามที่ผู้ให้สินเชื่อกำหนด โดยผู้ให้สินเชื่อขอสงวนสิทธิในการใช้ดุลยพินิจฝ่ายเดียวในการพิจารณาคุณสมบัติในการเลือกบุคคลที่เป็นผู้ค้ำประกัน เพื่อเข้าค้ำประกันแทนหรือเพิ่มเติม เพื่อค้ำประกันหนี้สินใดๆ ภายใต้หรือที่เกี่ยวข้องกับสัญญาฉบับนี้
              </div>
            </div>
            <div className="flex gap-2 ml-8">
              <span>7.3</span>
              <div className="flex-1 text-justify">
                ผู้กู้ตกลงว่าบรรดาทรัพย์สินดังต่อไปนี้ (“<span className="font-bold">ทรัพย์สินหลักประกัน</span>”) ให้เป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้กู้ที่มีต่อผู้ให้สินเชื่อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า
              </div>
            </div>

            {data.collateralAssets && data.collateralAssets.length > 0 ? (
              <>
                {(data.collateralAssets || [])
                  .slice(0, hasLargeMachinery ? 0 : 2)
                  .map((asset, idx) => (
                    <div key={idx} className="flex gap-2 ml-16 italic">
                      <span>({getThaiIndex(idx)})</span>
                      <div className="flex-1 text-justify">
                        {asset.type === 'land' && asset.landDetails && (
                          <div>
                            <span className="font-bold border-b border-black text-black">การจำนองที่ดิน</span> : ที่ดินเปล่า โฉนดที่ดินเลขที่ <Highlight>{asset.landDetails.deedNo}</Highlight> เล่ม <Highlight>{asset.landDetails.volume}</Highlight> หน้า <Highlight>{asset.landDetails.page}</Highlight> ระวาง <Highlight>{asset.landDetails.mapSheet}</Highlight> เลขที่ดิน <Highlight>{asset.landDetails.landNo}</Highlight> หน้าสำรวจ <Highlight>{asset.landDetails.surveyNo}</Highlight> {asset.landDetails.province === 'กรุงเทพมหานคร' ? 'แขวง' : 'ตำบล'} <Highlight>{asset.landDetails.subDistrict}</Highlight> {asset.landDetails.province === 'กรุงเทพมหานคร' ? 'เขต' : 'อำเภอ'} <Highlight>{asset.landDetails.district}</Highlight> จังหวัด <Highlight>{asset.landDetails.province}</Highlight> อันเป็นทรัพย์สินที่ไม่มีภาระผูกพันของ <Highlight>{asset.landDetails.owner}</Highlight> รายละเอียดปรากฏตาม <span className="underline decoration-1 underline-offset-4">เอกสารแนบท้ายหมายเลข 6</span>
                          </div>
                        )}
                        {asset.type === 'cash' && (
                          <div>
                            <span className="font-bold border-b border-black text-black">เงินสด</span> : จำนวนเงิน <Highlight>{asset.cashAmount}</Highlight> บาท
                          </div>
                        )}
                        {asset.type === 'machinery' && (
                          <div className="mt-2 text-justify">
                            <span className="font-bold border-b border-black text-black italic">เครื่องจักร</span> :{' '}
                            <Highlight>{asset.machineName}</Highlight>{' '}
                            {asset.machineModel && <span className="italic text-gray-700">({asset.machineModel})</span>}{' '}
                            จำนวน <Highlight>{asset.machineQuantity}</Highlight> <Highlight>{asset.machineUnit || 'ชุด'}</Highlight>{' '}
                            ราคา <Highlight>{asset.machinePrice}</Highlight> บาท{' '}
                            อันเป็นทรัพย์สินของ <Highlight>{asset.machineOwner}</Highlight>
                          </div>
                        )}
                        {asset.type === 'carPledge' && asset.carPledgeDetails && (
                          <div>
                            <span className="font-bold border-b border-black text-black italic">จำนำรถ</span> : รถยนต์ยี่ห้อ <Highlight>{asset.carPledgeDetails.brand}</Highlight> รุ่น <Highlight>{asset.carPledgeDetails.model}</Highlight> ทะเบียนเลขที่ <Highlight>{asset.carPledgeDetails.plateNo}</Highlight> จังหวัด <Highlight>{asset.carPledgeDetails.province}</Highlight> เลขตัวถัง <Highlight>{asset.carPledgeDetails.chassisNo}</Highlight> เลขเครื่องยนต์ <Highlight>{asset.carPledgeDetails.engineNo}</Highlight> สี <Highlight>{asset.carPledgeDetails.color}</Highlight> โดยมี <Highlight>{asset.carPledgeDetails.owner}</Highlight> เป็นผู้ถือกรรมสิทธิ์
                          </div>
                        )}
                        {asset.type === 'stockPledge' && asset.stockPledgeDetails && (
                          <div>
                            <span className="font-bold border-b border-black text-black italic">จำนำหุ้น</span> : หุ้นของบริษัท <Highlight>{asset.stockPledgeDetails.companyName}</Highlight> ตามใบถือหุ้นเลขที่ <Highlight>{asset.stockPledgeDetails.certificateNo}</Highlight> จำนวน <Highlight>{asset.stockPledgeDetails.quantity}</Highlight> หุ้น มูลค่าหุ้นละ <Highlight>{asset.stockPledgeDetails.parValue}</Highlight> บาท รวมมูลค่า <Highlight>{asset.stockPledgeDetails.totalValue}</Highlight> บาท โดยมี <Highlight>{asset.stockPledgeDetails.owner}</Highlight> เป็นผู้ถือหุ้น
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                {(data.collateralAssets.length <= 2 && !hasLargeMachinery) && (
                  <div className="ml-16 mt-4 text-justify">
                    นอกจากนี้ ผู้ให้สินเชื่อมีสิทธิกำหนดให้ผู้กู้จัดหาหลักประกันประเภทอื่น ๆ ตามที่ผู้ให้สินเชื่อเห็นสมควรมาเป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้กู้ที่มีต่อผู้ให้สินเชื่อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
        {renderPageFooter(9)}
      </div>

      {/* Page 10 (Conditional Collateral Overflow or Machinery) */}
      {collateralOverflow && (
        <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
          <PageHeader />
          <div className="space-y-4 pt-4">
            {(data.collateralAssets || [])
              .slice(hasLargeMachinery ? 0 : 2)
              .map((asset, idx) => (
                <div key={idx + (hasLargeMachinery ? 0 : 2)} className="flex gap-2 ml-16 italic">
                  <span>({getThaiIndex(idx + (hasLargeMachinery ? 0 : 2))})</span>
                  <div className="flex-1 text-justify">
                    {asset.type === 'land' && asset.landDetails && (
                      <div>
                        <span className="font-bold border-b border-black text-black">การจำนองที่ดิน</span> : ที่ดินเปล่า โฉนดที่ดินเลขที่ <Highlight>{asset.landDetails.deedNo}</Highlight> เล่ม <Highlight>{asset.landDetails.volume}</Highlight> หน้า <Highlight>{asset.landDetails.page}</Highlight> ระวาง <Highlight>{asset.landDetails.mapSheet}</Highlight> เลขที่ดิน <Highlight>{asset.landDetails.landNo}</Highlight> หน้าสำรวจ <Highlight>{asset.landDetails.surveyNo}</Highlight> {asset.landDetails.province === 'กรุงเทพมหานคร' ? 'แขวง' : 'ตำบล'} <Highlight>{asset.landDetails.subDistrict}</Highlight> {asset.landDetails.province === 'กรุงเทพมหานคร' ? 'เขต' : 'อำเภอ'} <Highlight>{asset.landDetails.district}</Highlight> จังหวัด <Highlight>{asset.landDetails.province}</Highlight> อันเป็นทรัพย์สินที่ไม่มีภาระผูกพันของ <Highlight>{asset.landDetails.owner}</Highlight> รายละเอียดปรากฏตาม <span className="underline decoration-1 underline-offset-4">เอกสารแนบท้ายหมายเลข 6</span>
                      </div>
                    )}
                    {asset.type === 'cash' && (
                      <div>
                        <span className="font-bold border-b border-black text-black">เงินสด</span> : จำนวนเงิน <Highlight>{asset.cashAmount}</Highlight> บาท
                      </div>
                    )}
                    {asset.type === 'machinery' && (
                      <div className="mt-2 text-justify">
                        <span className="font-bold border-b border-black text-black italic">เครื่องจักร</span> :{' '}
                        <Highlight>{asset.machineName}</Highlight>{' '}
                        {asset.machineModel && <span className="italic text-gray-700">({asset.machineModel})</span>}{' '}
                        จำนวน <Highlight>{asset.machineQuantity}</Highlight> <Highlight>{asset.machineUnit || 'ชุด'}</Highlight>{' '}
                        ราคา <Highlight>{asset.machinePrice}</Highlight> บาท{' '}
                        อันเป็นทรัพย์สินของ <Highlight>{asset.machineOwner}</Highlight>
                      </div>
                    )}
                    {asset.type === 'carPledge' && asset.carPledgeDetails && (
                      <div>
                        <span className="font-bold border-b border-black text-black italic">จำนำรถ</span> : รถยนต์ยี่ห้อ <Highlight>{asset.carPledgeDetails.brand}</Highlight> รุ่น <Highlight>{asset.carPledgeDetails.model}</Highlight> ทะเบียนเลขที่ <Highlight>{asset.carPledgeDetails.plateNo}</Highlight> จังหวัด <Highlight>{asset.carPledgeDetails.province}</Highlight> เลขตัวถัง <Highlight>{asset.carPledgeDetails.chassisNo}</Highlight> เลขเครื่องยนต์ <Highlight>{asset.carPledgeDetails.engineNo}</Highlight> สี <Highlight>{asset.carPledgeDetails.color}</Highlight> โดยมี <Highlight>{asset.carPledgeDetails.owner}</Highlight> เป็นผู้ถือกรรมสิทธิ์
                      </div>
                    )}
                    {asset.type === 'stockPledge' && asset.stockPledgeDetails && (
                      <div>
                        <span className="font-bold border-b border-black text-black italic">จำนำหุ้น</span> : หุ้นของบริษัท <Highlight>{asset.stockPledgeDetails.companyName}</Highlight> ตามใบถือหุ้นเลขที่ <Highlight>{asset.stockPledgeDetails.certificateNo}</Highlight> จำนวน <Highlight>{asset.stockPledgeDetails.quantity}</Highlight> หุ้น มูลค่าหุ้นละ <Highlight>{asset.stockPledgeDetails.parValue}</Highlight> บาท รวมมูลค่า <Highlight>{asset.stockPledgeDetails.totalValue}</Highlight> บาท โดยมี <Highlight>{asset.stockPledgeDetails.owner}</Highlight> เป็นผู้ถือหุ้น
                      </div>
                    )}
                  </div>
                </div>
              ))}
            <div className="ml-16 mt-4 text-justify italic">
              นอกจากนี้ ผู้ให้สินเชื่อมีสิทธิกำหนดให้ผู้กู้จัดหาหลักประกันประเภทอื่น ๆ ตามที่ผู้ให้สินเชื่อเห็นสมควรมาเป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้กู้ที่มีต่อผู้ให้สินเชื่อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า
            </div>
          </div>
          {renderPageFooter(10)}
        </div>
      )}

      {/* Page 11 (Clauses 7.4 - 7.7) */}
      {(() => {
        const pageNum = 10 + machineryOffset;
        return (
          <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
            <PageHeader />
            <div className="space-y-4 pt-4">
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.4</span>
                <div className="flex-1 text-justify">
                  คู่สัญญาทั้งสามฝ่ายตกลงว่าสิทธิของผู้ให้สินเชื่อเหนือทรัพย์สินที่เป็นหลักประกันตามข้อ 7.3 ของสัญญาฉบับนี้ นั้น เป็นไปตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.5</span>
                <div className="flex-1 text-justify">
                  ในกรณีที่ทรัพย์สินหลักประกันเป็นที่ดิน และ/หรือ สิ่งปลูกสร้าง และ/หรือ เครื่องจักร และ/หรือ หลักประกันอื่น ผู้กู้ตกลงจะดำเนินการประเมินมูลค่าของทรัพย์สินหลักประกันดังกล่าวโดยหน่วยงานที่เชื่อถือได้และเป็นที่ยอมรับของผู้ให้สินเชื่อ (“<span className="font-bold">ผู้ประเมินมูลค่าทรัพย์สิน</span>”) และผู้กู้จะดำเนินการให้ผู้ประเมินมูลค่าทรัพย์สินทบทวนมูลค่าทรัพย์สินหลักประกันทุก 4 (สี่) ปี นับแต่วันที่สัญญาฉบับนี้ และ/หรือ ให้เป็นดุลยพินิจของผู้ให้สินเชื่อ
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.6</span>
                <div className="flex-1 text-justify">
                  ในกรณีที่ทรัพย์สินหลักประกันเป็นสิ่งปลูกสร้าง และ/หรือ เครื่องจักร ผู้กู้ตกลงจัดให้มีการทำประกันภัยทรัพย์สินบนสิ่งปลูกสร้าง และเครื่องจักรที่เป็นทรัพย์สินหลักประกันกับบริษัทประกันภัยที่ผู้ให้สินเชื่อยอมรับ ตลอดระยะเวลาในจนกว่าผู้กู้จะชำระหนี้ตามสัญญาฉบับนี้จนครบถ้วน โดยผู้กู้จะเป็นผู้ชำระเบี้ยประกันและค่าใช้จ่าย และให้ผู้ให้สินเชื่อเป็นผู้รับผลประโยชน์ตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.7</span>
                <div className="flex-1 text-justify">
                  <p>
                    ผู้กู้ตกลงว่าหากมูลค่าทรัพย์สินหลักประกันลดน้อยกว่ามูลค่าที่ระบุในข้อ 7.1 ของสัญญาฉบับนี้ ผู้กู้จะนำทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกันจนครบมูลค่าที่ระบุในข้อ 7.1 ของสัญญาฉบับนี้ ภายใน 30 (สามสิบ) วัน นับจากวันที่ผู้กู้ได้รับแจ้งจากผู้ให้สินเชื่อ หากผู้กู้ประสงค์จะขอขยายระยะเวลาการหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ผู้กู้จะต้องแจ้งให้ตัวแทนสินเชื่อทราบเป็นลายลักษณ์อักษรล่วงหน้าก่อนครบกำหนดในวรรคแรกไม่น้อยกว่า 7 (เจ็ด) วัน และ หากผู้ให้สินเชื่อตกลงยินยอมให้ขยายระยะเวลาในการหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ให้ถือว่าผู้ให้สินเชื่อยินยอมให้ขยายระยะเวลาเฉพาะคราวดังกล่าวเท่านั้น ทั้งนี้ ระยะเวลา หรือ การยินยอมดังกล่าวให้เป็นดุลยพินิจของผู้ให้สินเชื่อ
                  </p>
                </div>
              </div>
            </div>
            {renderPageFooter(pageNum)}
          </div>
        );
      })()}

      {/* Page 11 or 12 (Clauses 7.8 - 7.12) */}
      {(() => {
        const pageNum = data.collateralAssets && data.collateralAssets.length > 2 ? 12 : 11;
        return (
          <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
            <PageHeader />
            <div className="space-y-4 pt-4">
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.8</span>
                <div className="flex-1 text-justify">
                  โดยไม่คำนึงถึงข้อ 7.1 ของสัญญาฉบับนี้ ผู้กู้ตกลงว่าในกรณีที่ผู้ให้สินเชื่อได้ร้องขอให้ผู้กู้จัดหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ผู้กู้ตกลงจัดหาทรัพย์สินเพิ่มเติมแก่ผู้ให้สินเชื่อภายใน 1 (หนึ่ง) เดือน นับจากวันที่ผู้ให้สินเชื่อร้องขอ ทั้งนี้ ผู้ให้สินเชื่อตกลงว่าจะไม่ใช้สิทธิในข้อนี้โดยไม่มีเหตุอันสมควร
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.9</span>
                <div className="flex-1 text-justify">
                  ผู้กู้ตกลงเป็นผู้รับผิดชอบในค่าธรรมเนียม ค่าจดทะเบียน ค่าภาษีอากร อากรแสตมป์ การประเมินมูลค่าทรัพย์สิน หรือค่าใช้จ่ายอื่นใดอันเกี่ยวข้องสัญญาหรือเอกสารที่เกี่ยวข้องกับทรัพย์สินหลักประกัน หรือการให้หลักประกันใด ๆ ตามที่ระบุในข้อ <Highlight>7.3</Highlight> ของสัญญาฉบับนี้ แต่เพียงผู้เดียว
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.10</span>
                <div className="flex-1 text-justify">
                  ภายหลังจากที่ผู้กู้ได้ปฏิบัติหน้าที่ตามสัญญาฉบับนี้เสร็จสิ้นแล้ว ผู้ให้สินเชื่อตกลงจะดำเนินการตามที่จำเป็นเพื่อส่งคืนทรัพย์สินหลักประกันดังกล่าวแก่ผู้กู้ ภายใน <Highlight>1 (หนึ่ง) เดือน</Highlight> หลังจากที่ผู้กู้ได้ปฏิบัติหน้าที่ตามสัญญานี้เสร็จสิ้นดังกล่าว
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.11</span>
                <div className="flex-1 text-justify">
                  ในกรณีผู้ให้สินเชื่อมีการนำทรัพย์สินหลักประกันมาเป็นหลักประกันให้แก่ผู้ให้สินเชื่อ ถ้าผู้ให้สินเชื่อบังคับหลักประกันไม่ว่าจะด้วยวิธีการ โอนสิทธิเรียกร้องในการรับชำระเงินแล้ว แต่ได้รับชำระเงินต่ำกว่าจำนวนหนี้ หรือ ขายทอดตลาดแล้ว ได้เงินสุทธิไม่พอชำระหนี้ หรือเอาทรัพย์สินหลักประกันหลุดเป็นสิทธิและราคาทรัพย์สินหลักประกันนั้น ต่ำกว่าจำนวนหนี้อยู่เท่าใด ผู้กู้ยอมชำระหนี้ที่ขาดจำนวนนั้นจากทรัพย์สินอื่นของผู้กู้ให้แก่ผู้ให้สินเชื่อตามสัดส่วนที่ระบุในข้อ 1.2 ของสัญญาฉบับนี้ จนครบถ้วน
                </div>
              </div>
              <div className="flex gap-2 ml-8">
                <span className="shrink-0 w-6">7.12</span>
                <div className="flex-1 text-justify">
                  กรณีที่มีเครื่องจักรเป็นทรัพย์สินหลักประกัน ผู้กู้ยินยอมและอนุญาต ให้ผู้ให้สินเชื่อฝ่ายใดฝ่ายหนึ่ง ตัวแทน หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งโดยชอบจากผู้ให้สินเชื่อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งจากผู้ผลิตทรัพย์สินหรือตัวแทนจำหน่ายทรัพย์สินที่ใช้เป็นหลักประกัน ให้มีสิทธิเข้าถึงข้อมูลการใช้งานทรัพย์สินหลักประกันทั้งในการใช้งานและการบำรุงรักษา เพื่อให้สามารถตรวจสอบประสิทธิภาพของทรัพย์สิน
                </div>
              </div>
            </div>
            {renderPageFooter(pageNum)}
          </div>
        );
      })()}

      {/* Page 13 (Continuation of 7.12, 7.13 and Section 8) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6 opacity-0">7.12</span>
            <div className="flex-1 text-justify">
              หลักประกันได้ในระหว่างที่สัญญาฉบับนี้มีผลบังคับใช้ ทั้งนี้ ไม่ว่าการเข้าถึงข้อมูลดังกล่าวจะกระทำผ่านทางระบบออนไลน์ หรือทางการติดต่อสื่อสารใด ๆ ทั้งนี้ หากผู้ให้สินเชื่อฝ่ายใดฝ่ายหนึ่งตรวจพบว่า ทรัพย์สินหรือส่วนหนึ่งส่วนใดของทรัพย์สินเสียหาย ชำรุด หรืออยู่ในสภาพที่ไม่เหมาะสมแก่การใช้งาน ตัวแทนสินเชื่อจะดำเนินการแจ้งเป็นลายลักษณ์อักษรไปยังผู้กู้เพื่อให้ทราบเรื่องดังกล่าวและให้ดำเนินการซ่อมแซมทรัพย์สินในการนี้ ผู้กู้ตกลงที่จะทำการซ่อมแซมทรัพย์สินหลักประกันให้กลับคืนสู่สภาพที่ดีและเหมาะสมในการใช้งานได้อย่างมีประสิทธิภาพ ภายในระยะเวลาที่ผู้ให้สินเชื่อกำหนด โดยค่าใช้จ่ายทั้งหมดให้ถือเป็นหน้าที่ของผู้กู้แต่เพียงผู้เดียว
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">7.13</span>
            <div className="flex-1 text-justify">
              กรณีที่ผู้ให้สินเชื่อจะดำเนินการบังคับชำระหนี้จากทรัพย์สินหลักประกันตามข้อ 11.2 (ก) ของสัญญาฉบับนี้ ผู้กู้ตกลงให้ผู้ให้สินเชื่อมีสิทธิในการพิจารณาบังคับชำระหนี้จากทรัพย์สินหลักประกัน ไม่ว่าจะทั้งหมดหรือบางส่วน และไม่ว่าเป็นทรัพย์สินหลักประกันอย่างใดอย่างหนึ่งหรือหลายอย่างแต่เพียงผู้เดียว และตกลงให้การที่ผู้ให้สินเชื่อไม่บังคับชำระหนี้จากทรัพย์สินหลักประกันอย่างใดอย่างหนึ่งหรือหลายอย่างดังนั้น ไม่เป็นเหตุให้จำนวนหนี้ที่ตามสัญญาฉบับนี้ลดลงตามมูลค่าของเงินที่มีสิทธิจะได้รับจากการบังคับทรัพย์สินหลักประกันดังกล่าว
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex gap-2 items-center">
              <span className="font-bold">8.</span>
              <span className="font-bold">ดอกเบี้ยผิดนัด</span>
            </div>
            <div className="flex gap-2 ml-8">
              <span className="shrink-0 w-6">8.1</span>
              <div className="flex-1 text-justify">
                หากผู้กู้ผิดนัดชำระหนี้ตามสัญญาฉบับนี้ <span className="font-bold">ผู้กู้ตกลงชำระดอกเบี้ยในอัตราดอกเบี้ยผิดนัดที่ <Highlight>ร้อยละ 18 (สิบแปด) ต่อปี</Highlight></span> และในการคิดดอกเบี้ยผิดนัดนั้น ให้คิดตามหลักเกณฑ์ดังต่อไปนี้
              </div>
            </div>
            <div className="flex gap-2 ml-16">
              <span className="shrink-0 w-6">(ก)</span>
              <div className="flex-1 text-justify">
                ในกรณีที่ผู้กู้ผิดนัดไม่ชำระหนี้เงินต้นหรือดอกเบี้ย ผู้กู้ยอมชำระดอกเบี้ยในอัตราดอกเบี้ยผิดนัดบนจำนวนเงินต้นที่ยังไม่ได้ชำระคืน นับแต่วันครบกำหนดชำระเงิน เป็นต้นไปจนกว่าจะชำระหนี้ค้างชำระจนครบถ้วน
              </div>
            </div>
            <div className="flex gap-2 ml-16">
              <span className="shrink-0 w-6">(ข)</span>
              <div className="flex-1 text-justify">
                ในกรณีที่ผู้กู้ผิดนัดไม่ชำระเงินอื่นใดนอกเหนือจากข้อ (ก) ข้างต้น ผู้กู้ยอมชำระดอกเบี้ยในอัตราดอกเบี้ยผิดนัดบนจำนวนเงินนั้น ๆ นับแต่วันครบกำหนดชำระหนี้ดังกล่าว ที่ผู้กู้ผิดนัดชำระเป็นต้นไปจนกว่าผู้กู้จะชำระจนครบถ้วน
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(13)}
      </div>

      {/* Page 14 (Section 9: (ก)-(ง)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 items-center">
            <span className="font-bold">9.</span>
            <span className="font-bold">คำรับรองและยืนยัน</span>
          </div>

          <div className="ml-8 text-justify">
            ผู้กู้ยอมรับว่าผู้ให้สินเชื่อได้เข้าทำสัญญานี้ โดยอาศัยคำรับรองและยืนยันที่ผู้กู้ได้ให้ไว้ต่อผู้ให้สินเชื่อ ดังนั้น ผู้กู้จึงขอให้คำรับรองและยืนยันต่อผู้ให้สินชื่อตั้งแต่วันที่ของสัญญาฉบับนี้จนกระทั่งถึงวันที่ผู้กู้ไม่มีหนี้ค้างชำระหรือหน้าที่อื่นใดภายใต้สัญญานี้อีกต่อไปว่า
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ก)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">สถานภาพ:</span> ผู้กู้เป็นบริษัทจำกัดที่จัดตั้งขึ้นและดำรงอยู่อย่างถูกต้องตามกฎหมายไทย
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ข)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">อำนาจ:</span> เอกสารจัดตั้งของผู้กู้ข้อกำหนดซึ่งให้อำนาจผู้กู้เข้าเอกสารทางธุรกรรมที่ตนเป็นคู่สัญญาและดำเนินการต่าง ๆ ตามที่ระบุไว้ หรือที่ผู้กู้ต้องทำภายใต้เอกสารทางธุรกรรมซึ่งตนเป็นคู่สัญญาและผู้กู้มีอำนาจหรือได้รับอำนาจทุกประการในส่วนของตนในการเป็นเจ้าของทรัพย์สิน ในการประกอบธุรกิจ และดำเนินการต่าง ๆ ของตนตามที่กระทำอยู่ในปัจจุบัน และเอกสารทางธุรกรรมที่ตนเป็นคู่สัญญาเป็นเอกสารที่สมบูรณ์ ถูกต้อง และมีผลใช้บังคับกับผู้กู้ตามข้อกำหนดของเอกสารทางธุรกรรมที่เกี่ยวข้องดังกล่าว
              <p className="mt-4"><span className="font-bold">“เอกสารทางธุรกรรม”</span> หมายถึง สัญญาให้สินเชื่อฉบับนี้ สัญญาหลักประกัน (ถ้ามี) และเอกสารอื่น ๆ ที่เกี่ยวข้อง</p>
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ค)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">อำนาจกระทำการ:</span> ผู้กู้ได้กระทำการที่จำเป็นทุกประการเพื่อ:
              <div className="mt-2 space-y-2">
                <div className="flex gap-4">
                  <span>(1)</span>
                  <span>ให้ได้รับอำนาจในการเข้าทำและดำเนินการตามเอกสารทางธุรกรรมซึ่งตนเป็นคู่สัญญา และ</span>
                </div>
                <div className="flex gap-4">
                  <span>(2)</span>
                  <span>ให้เอกสารทางธุรกรรมที่ตนเป็นคู่สัญญาดังกล่าวนั้นมีผลสมบูรณ์ ผูกพัน และมีผลใช้บังคับกับคู่สัญญาแต่ละฝ่ายได้</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ง)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">ความสมบูรณ์ของสัญญา:</span> เอกสารทางธุรกรรมที่ผู้กู้เป็นคู่สัญญาเป็นเอกสารที่สมบูรณ์ ถูกต้อง และมีผลใช้บังคับกับผู้กู้ได้ตามข้อกำหนดของเอกสารทางธุรกรรมนั้น
            </div>
          </div>
        </div>
        {renderPageFooter(14)}
      </div>

      {/* Page 15 (Section 9: (จ)-(ญ)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(จ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การไม่ทำผิดกฎหมาย:</span> การเข้าทำเอกสารทางธุรกรรม และการดำเนินการใดๆ ตามที่ระบุไว้ในเอกสารทางธุรกรรมดังกล่าวที่ผู้กู้เป็นคู่สัญญา ไม่เป็นการขัด หรือจะไม่ขัด หรือเป็นเหตุให้เกิดการผิดนัดขึ้น หรือเป็นการกระทำที่เกินขอบอำนาจของตนหรือของกรรมการภายใต้ กฎหมาย ระเบียบ บ้อบังคับ หรือใบอนุญาตใดๆ ซึ่งผู้กู้หรือทรัพย์สินของผู้กู้ที่อยู่ในบังคับ หรือ หนังสือรับรอง หนังสือบริคณห์สนธิ หรือข้อบังคับของผู้กู้ หรือ สัญญาใด ๆ ซึ่งผู้กู้เป็นคู่สัญญา หรือซึ่งทรัพย์สินใด ๆ ของผู้กู้นั้นผูกพันอยู่
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ฉ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การไม่มีกระบวนการพิจารณาคดี:</span> ไม่มีกระบวนการพิจารณาในทางศาล ในทางอนุญาโตตุลาการ หรือการดำเนินการใดๆ หรือไม่มีการฟ้องร้องดำเนินคดี ซึ่งเมื่อพิจารณาโดยแยกต่างหากจากกัน หรือเมื่อพิจารณาร่วมกันกับกระบวนการพิจารณาอื่นๆ หรือข้อฟ้องร้องอื่น ๆ อาจมีผลกระทบในทางลบอย่างมีนัยสำคัญต่อผู้กู้ในการปฏิบัติหน้าที่ภายใต้เอกสารทางธุรกรรมที่ตนเป็นคู่สัญญา
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ช)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การเลิกบริษัทหรือกระบวนการล้มละลาย:</span> ผู้กู้ไม่อยู่ในระหว่างการเลิกบริษัทหรือขั้นตอนการฟ้องหรือการดำเนินขบวนการล้มละลาย
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ซ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">ความถูกต้องของข้อมูล:</span> ข้อมูลต่าง ๆ ที่ผู้กู้ได้ส่งมอบให้กับผู้ให้สินเชื่อเพื่อใช้ประกอบการพิจารณาให้สินเชื่อแก่ผู้กู้ภายใต้สัญญาฉบับนี้นั้นเป็นข้อมูลที่ถูกต้อง
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ณ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">สถานะของลูกค้าของผู้กู้:</span> ลูกค้าของผู้กู้เป็นลูกค้าปกติ ซึ่งไม่เคยผิดนัดชำระหนี้แก่ผู้กู้ และไม่เคยมีข้อพิพาทที่มีผลกระทบอย่างมีนัยสำคัญต่อการชำระหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้ กับผู้กู้
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ญ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">สถานะของมูลหนี้ตามเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้:</span> มูลหนี้ที่เกิดขึ้นระหว่างผู้กู้และลูกค้าของผู้กู้ตามที่ระบุในเอกสารที่เกี่ยวข้องกับลูกค้าของผู้กู้นั้นมีอยู่จริง ยังไม่ถึงกำหนดชำระหนี้ของลูกค้าของผู้กู้ และผู้กู้ยังไม่ได้รับชำระเงินจากลูกค้าของผู้กู้ไม่ว่าจะทั้งหมดหรือบางส่วน
            </div>
          </div>
        </div>
        {renderPageFooter(15)}
      </div>

      {/* Page 16 (Section 10: (ก)-(ง)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 items-center">
            <span className="font-bold">10.</span>
            <span className="font-bold">ข้อตกลงกระทำการ</span>
          </div>
          <div className="ml-8 text-justify">
            ผู้กู้ตกลงว่าตั้งแต่วันที่สัญญามีผลใช้บังคับจนกระทั่งถึงวันที่ผู้กู้ไม่มีหนี้ค้างชำระ หรือหน้าที่อื่นใดภายใต้สัญญานี้อีกต่อไป
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ก)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">สถานะของผู้กู้:</span> ผู้กู้ต้องดำรงไว้ซึ่งการมีอยู่ของบริษัทจำกัด และดำเนินกิจการของตนอย่างถูกต้องมีประสิทธิภาพ และเป็นไปตามบทบัญญัติของกฎหมาย รวมถึงดำเนินการชำระค่าภาษีอากรที่ผู้กู้มีหน้าที่ต้องชำระอย่างครบถ้วนตามกำหนด
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ข)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การประกอบธุรกิจของผู้กู้:</span> ผู้กู้ต้องไม่เปลี่ยนแปลงสาระสำคัญใด ๆ ในธุรกิจที่ดำเนินอยู่ในขณะนี้ หรือประกอบธุรกิจประเภทอื่นที่แตกต่างไปจากประเภทธุรกิจที่ดำเนินอยู่ในขณะทำสัญญาฉบับนี้ หรือกระทำการใด ๆ อันมีลักษณะและผลเช่นเดียวกันกับการเปลี่ยนแปลงประเภทธุรกิจ เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ค)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การปฏิบัติตามกฎหมาย:</span> ผู้กู้ต้องปฏิบัติตามกฎหมาย และดำเนินการทุกประการเพื่อให้แน่ใจว่าผู้กู้ได้ดำเนินธุรกิจของตนตามกฎ ข้อบังคับ มาตรฐาน และกฎหมายที่เกี่ยวข้องทุกประการ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ง)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การไม่ก่อหนี้เพิ่มเติม:</span> ผู้กู้ต้องไม่ก่อหนี้ หรือภาระใด ๆ โดยการกู้ยืมจากบุคคลใด ๆ หรือโดยวิธีการอื่นเพิ่มเติม เว้นแต่เป็นการก่อหนี้ในทางการค้าปกติของผู้กู้ หรือ ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
            </div>
          </div>
        </div>
        {renderPageFooter(16)}
      </div>

      {/* Page 17 (Section 10: (จ)-(ณ)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(จ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การจัดส่งงบการเงินประจำปี:</span> ผู้กู้ต้องส่งสำเนางบการเงินซึ่งได้รับการตรวจบัญชีจากผู้ตรวจสอบบัญชีที่ได้รับอนุญาตที่เชื่อถือได้และผู้ให้สินเชื่อให้การยอมรับ ภายในระยะเวลาไม่เกิน 120 (หนึ่งร้อยยี่สิบ) วัน นับแต่วันสิ้นงวดปีบัญชีนั้น ๆ พร้อมทั้งให้กรรมการผู้มีอำนาจลงนามรับรองสำเนาถูกต้องให้แก่ผู้ให้สินเชื่อ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ฉ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การดำรงไว้ซึ่งสัดส่วนหนี้สินต่อทุน:</span> ผู้กู้ต้องดำรงสัดส่วนหนี้สินต่อทุน (Debt to Equity Ratio) ของผู้กู้ไว้ในอัตราไม่เกิน 4 เท่า ณ วันสิ้นงวดปีบัญชีของแต่ละปี หากไม่ตรงตามเงื่อนไขให้ขึ้นอยู่กับดุลยพินิจของผู้ให้สินเชื่อ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ช)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การไม่จ่ายเงินปันผล:</span> ผู้กู้ต้องไม่ประกาศจ่ายเงินปันผล ในกรณีที่ผู้กูผิดนัดไม่ชำระเงินต้น และ/หรือ ดอกเบี้ย หรือ เงินอื่น ๆ ตามสัญญาฉบับนี้ที่ถึงกำหนดชำระแล้วและการผิดนัดดังกล่าวยังไม่ได้รับการแก้ไข หรือมีเหตุผิดนัดหรือเหตุการณ์ที่อาจกลายเป็นเหตุผิดนัดเกิดขึ้น เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ซ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การไม่จำหน่ายทรัพย์สินของผู้กู้:</span> ผู้กู้ต้องไม่จำหน่าย จ่าย โอน ให้เช่า จำนำ จำนอง ก่อให้เกิดภาระติดพัน หรือยอมรับให้มีการรอนสิทธิโดยบุคคลคนหนึ่งบุคคลใดเหนือทรัพย์สินของผู้กู้ เว้นแต่ การจำหน่ายไปไม่ก่อให้เกิดผลกระทบในทางลบอย่างมีนัยสำคัญต่อผู้กู้ในการปฏิบัติหน้าที่ตามสัญญาฉบับนี้ หรือ เป็นทางการค้าปกติของผู้กู้ หรือ เป็นการจำหน่ายทรัพย์สินที่เสื่อมสภาพอันเนื่องมาจากลักษณะหรือสภาพของทรัพย์สินนั้นเอง หรือ ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ณ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การดำรงไว้ซึ่งทรัพย์สินหลักประกัน:</span> ผู้กู้ต้องดำรงไว้ซึ่งทรัพย์สินหลักประกัน และจะไม่จำหน่าย จ่าย โอน ให้เช่า จำนำ จำนอง ก่อให้เกิดภาระติดพัน หรือยอมรับให้มีการรอนสิทธิโดยบุคคลคนหนึ่งบุคคลใดเหนือทรัพย์สินหลักประกัน เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้สินเชื่อ
            </div>
          </div>
        </div>
        {renderPageFooter(17)}
      </div>

      {/* Page 18 (Section 10: (ญ)-(ฑ)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ญ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การยินยอมให้เปิดเผยข้อมูล:</span> ผู้กู้ยินยอมให้ผู้ให้สินเชื่อทั้งสองเปิดเผยข้อมูลที่จำเป็นเกี่ยวกับผู้กู้ให้แก่บริษัทในเครือ ที่ปรึกษา และ/หรือ ผู้รับโอนสิทธิ และ/หรือ หน้าที่ของผู้ให้สินชื่อภายใต้สัญญานี้ หรือเปิดเผยข้อมูลของผู้กู้ให้แก่บุคคลหรือหน่วยงานที่ผู้ให้สินเชื่อทั้งสองมีความจำเป็นต้องเปิดเผยภายใต้กฎหมายที่เกี่ยวข้อง ทั้งนี้ เมื่อผู้ให้สินเชื่อรายใดรายหนึ่งร้องขอ ผู้กู้ตกลงยินยอมให้ผู้ให้สินเชื่อดังกล่าวตรวจสอบ และเปิดเผยข้อมูลทางการเงินที่เกี่ยวข้องกับความน่าเชื่อถือของผู้กู้และกรรมการผู้มีอำนาจลงนามของผู้กู้
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ฎ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การยินยอมให้ตรวจสอบข้อมูลเครดิต:</span> ผู้กู้ตกลงยินยอมและจะให้ความร่วมมือทุกประการแก่ผู้ให้สินเชื่อในการดำเนินการตรวจสอบข้อมูลเครดิต และ/หรือ ข้อมูลอื่น ๆ ที่ผู้กู้อยู่กับบริษัท ข้อมูลเครดิตแห่งชาติ จำกัด (National Credit Bureau) หรือบริษัทข้อมูลเครดิตอื่นที่ได้จัดตั้งขึ้นและได้รับอนุญาตให้ประกอบธุรกิจภายใต้กฎหมายว่าด้วยการประกอบธุรกิจข้อมูลเครดิต และ/หรือ นิติบุคคลอื่น
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ฏ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">หน้าที่กระทำการอื่นใด:</span> ผู้กู้จะต้องกระทำการ หรือปฏิบัติตามคำร้องขอของผู้ให้สินเชื่อใดเพิ่มเติม เพื่อให้การดำเนินการ หรือปฏิบัติตามสัญญานี้ของคู่สัญญาทุกฝ่ายสำเร็จลุล่วงไปได้ด้วยดี
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ฐ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การระดมทุน:</span> ผู้ให้สินเชื่อมีสิทธิที่จะหาแหล่งเงินทุน หรือหาผู้ร่วมระดมทุนในการทำสัญญายืมเงินฉบับนี้เพิ่มเติมได้ โดยการใช้ดุลยพินิจของผู้ให้สินเชื่อเอง และไม่จำเป็นต้องแจ้งให้ผู้กู้ทราบในรายละเอียดดังกล่าว
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ฑ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การโอนสิทธิและ/หรือ หน้าที่:</span> ผู้กู้ตกลงจะไม่โอนสิทธิ และ/หรือ หน้าที่ตามสัญญาฉบับนี้แก่บุคคลใด และผู้กู้ยินยอมให้ผู้ให้สินเชื่อฝ่ายใดฝ่ายหนึ่งโอนสิทธิ และ/หรือ หน้าที่ตามสัญญาฉบับนี้ ไม่ว่าจะเป็นเรื่องเกี่ยวกับการรับชำระเงิน การดำเนินการที่เกี่ยวข้องกับทรัพย์สินหลักประกัน และ/หรือ การดำเนินการอื่นใดได้ โดยการแจ้งเป็นลายลักษณ์อักษรล่วงหน้า 30 (สามสิบ) วัน แก่ผู้กู้
            </div>
          </div>
        </div>
        {renderPageFooter(18)}
      </div>

      {/* Page 19 (Section 11.1: (ก)-(จ)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 items-center">
            <span className="font-bold">11.</span>
            <span className="font-bold">เหตุผิดนัด</span>
          </div>
          <div className="flex gap-2 items-center ml-8">
            <span>11.1 <span className="underline">เหตุผิดนัด</span></span>
          </div>
          <div className="ml-8 text-justify">
            เมื่อเกิดเหตุการณ์ใดเหตุการณ์หนึ่งดังต่อไปนี้ให้ถือว่าเป็นเหตุผิดนัด
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ก)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การไม่ชำระหนี้เงิน:</span> เมื่อผู้กู้ผิดนัดไม่ชำระเงินจำนวนใด ๆ ภายใต้สัญญาฉบับนี้เมื่อถึงกำหนดชำระหรือเมื่อมีการเรียกร้องให้มีการชำระแต่ผู้กู้ไม่ชำระตามกำหนดเวลา
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ข)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การผิดข้อสัญญา:</span> ผู้กู้ไม่ปฏิบัติตามหน้าที่ใด ๆ หรือไม่ปฏิบัติตามข้อตกลง หรือข้อกำหนดใด ๆ ซึ่งได้กระทำขึ้นภายใต้ หรือเกี่ยวข้องกับเอกสารทางธุรกรรม (นอกเหนือจากเหตุผิดนัดตามข้อ 11.1 (ก) และ ข้อ 11.1 (ซ) ของสัญญาฉบับนี้)
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ค)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การผิดคำรับรอง:</span> ผู้กู้ผิดคำรับรองและยืนยันใด ๆ ที่ให้ไว้ในสัญญาฉบัับนี้ในสาระสำคัญ ไม่ว่าจะทั้งหมดหรือบางส่วน และ/หรือ คำรับรองและยืนยันใด ๆ ที่ให้ไว้ในสัญญาฉบับนี้เป็นคำรับรองและยืนยันที่ไม่เป็นความจริง หรือพิสูจน์ได้ว่าไม่เป็นความจริง ไม่ถูกต้อง หรืออาจจะก่อให้เกิดความเข้าใจผิดในสาระสำคัญ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ง)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การผิดนัดชำระหนี้ตามสัญญาอื่น:</span> ผู้กู้ผิดนัดชำระหนี้ใด ๆ ซึ่งมีอยู่กับเจ้าหนี้ใด ๆ (นอกเหนือจากหนี้ตามสัญญาฉบับนี้) เมื่อหนี้นั้นถึงกำหนด
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(จ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การใช้สิทธิเหนือทรัพย์สินหลักประกัน:</span> เมื่อบุคคลใดดำเนินการฟ้องร้องเพื่อบังคับคดีเหนือทรัพย์สินหลักประกันของผู้กู้ที่ผู้กู้ได้ไว้สำหรับความรับผิดของตนเอง หรือของบุคคลอื่น
            </div>
          </div>
        </div>
        {renderPageFooter(19)}
      </div>

      {/* Page 20 (Section 11.1: (ฉ)-(ซ), 11.2: (ก)-(ข)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ฉ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การแต่งตั้งเจ้าพนักงานบังคับคดี หรือการดำเนินการทางคดี:</span> เมื่อเจ้าพนักงานบังคับคดี ผู้ทำแผน ผู้บริหารแผน หรือเจ้าพนักงานในลักษณะอื่นใดที่คล้ายคลึงกัน ได้รับการแต่งตั้งเพื่อจัดการกับธุรกิจ ฟื้นฟูกิจการ หรือทรัพย์สินของผู้กู้ ไม่ว่าทั้งหมดหรือแต่บางส่วน หรือเมื่อมีคำสั่งในทางบังคับซึ่งบังคับเอากับทรัพย์สินของผู้กู้ หรือมีการบังคับหลักประกันเอากับทรัพย์สินใดๆ ของผู้กู้
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ช)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">ศาลมีคำสั่งพิทักษ์ทรัพย์:</span> เมื่อศาลมีคำสั่งพิทักษ์ทรัพย์ผู้กู้ คำสั่งฟื้นฟูกิจการ หรือคำสั่งให้มีการชำระบัญชี และ/หรือ เลิกกิจการ หรือมีคำสั่งอื่นในลักษณะเดียวกัน
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ซ)</span>
            <div className="flex-1 text-justify">
              <span className="font-bold">การเปลี่ยนแปลงอย่างมีนัยสำคัญ:</span> เมื่อผู้ให้สินเชื่อเห็นว่าเกิดการเปลี่ยนแปลงอย่างมีนัยสำคัญในทางที่ไม่เป็นคุณกับการประกอบกิจการ ทรัพย์สิน หรือหนี้สินของผู้กู้ หรือสถานะ (ทางการเงินหรืออื่น ๆ) ของผู้กู้ หรือมีเหตุอันควรเชื่อได้ว่าเหตุการณ์ดังกล่าวอาจมีผลกระทบอย่างร้ายแรงต่อความสามารถของผู้กู้ในการปฏิบัติตามสัญญาฉบับนี้ ทั้งนี้ รวมถึงตลอดแต่ไม่จำกัดเพียงการเลิกกิจการ เลิกบริษัท การชำระบัญชี หรือการเปลี่ยนแปลงประเภทธุรกิจ หรือสัดส่วนของผู้ถือหุ้นรายใหญ่ หรือเปลี่ยนแปลงกรรมการ หรือคณะผู้บริหารของผู้กู้
            </div>
          </div>

          <div className="flex gap-2 items-center ml-8 mt-4">
            <span>11.2 <span className="underline">การดำเนินการเมื่อมีเหตุผิดนัดเกิดขึ้น</span></span>
          </div>
          <div className="ml-8 text-justify">
            เมื่อมีเหตุผิดนัดเกิดขึ้น และเหตุผิดนัดดังกล่าวนั้นยังคงดำเนินอยู่ ผู้ให้สินเชื่อมีสิทธิส่งคำบอกกล่าวระงับสิทธิการเบิกใช้เงินกู้ รวมทั้งมีสิทธิดำเนินการอย่างใดอย่างหนึ่งหรือหลายอย่างดังต่อไปนี้ทันที
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ก)</span>
            <div className="flex-1 text-justify">
              ยกเลิกวงเงินสินเชื่อที่จะให้ไม่ว่าทั้งหมด หรือบางส่วน และ/หรือ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ข)</span>
            <div className="flex-1 text-justify">
              เรียกให้หนี้ที่มีอยู่ทั้งหมดถึงกำหนดชำระทันที และเรียกให้ผู้กู้ชำระหนี้ที่มีอยู่ ไม่ว่าทั้งหมดหรือแต่เพียงบางส่วนโดยพลัน หรือภายในระยะเวลาที่ผู้ให้สินเชื่อกำหนด และ/หรือ
            </div>
          </div>
        </div>
        {renderPageFooter(20)}
      </div>

      {/* Page 21 (Section 11.2: (ค)-(ง), Section 12, 13.1: (ก)-(ข)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 ml-16">
            <span className="shrink-0 w-6">(ค)</span>
            <div className="flex-1 text-justify">
              บังคับชำระหนี้จากทรัพย์สินหลักประกัน ไม่ว่าจะทั้งหมดหรือบางส่วน และไม่ว่าเป็นทรัพย์สินหลักประกันอย่างใดอย่างหนึ่งหรือหลายอย่าง ตามวิธีการของกฎหมายเกี่ยวกับหลักประกันนั้น และ/หรือ
            </div>
          </div>
          <div className="flex gap-2 ml-16">
            <span className="shrink-0 w-6">(ง)</span>
            <div className="flex-1 text-justify">
              ใช้สิทธิ อำนาจ หรือการเยียวยาอื่นใดที่ผู้ให้สินเชื่อมีอยู่ภายใต้กฎหมายหรือภายใต้สัญญาฉบับนี้
            </div>
          </div>

          <div className="flex gap-2 items-center mt-6">
            <span className="font-bold">12.</span>
            <span className="font-bold">การชดใช้ค่าเสียหาย</span>
          </div>
          <div className="ml-8 text-justify">
            ผู้กู้จะต้องชดใช้ความเสียหายให้แก่ผู้ให้สินเชื่อ สำหรับค่าใช้จ่าย ความสูญเสีย ความเสียหาย หรือความรับผิดใดๆ ซึ่งผู้ให้สินเชื่อต้องเสียไป หรือได้รับจากเหตุการณ์ใดเหตุการณ์หนึ่งที่ถือว่าเป็นเหตุผิดนัดตามสัญญาฉบับนี้ ทันทีที่ผู้ให้สินเชื่อมีการเรียกร้องเอากับผู้กู้ การที่ผู้กู้ต้องชดใช้ความเสียหายดังกล่าวให้รวมถึง การชดใช้สำหรับค่าใช้จ่าย หรือความสูญเสียที่อาจเกิดขึ้นจากการที่ผู้ให้สินเชื่อได้รับชำระหนี้ช้ากว่ากำหนดเวลาชำระที่ตกลงกันไว้ ความสูญเสียใด ๆ ที่เกิดขึ้นจากค่าธรรมเนียม ดอกเบี้ย หรือจำนวนเงินอื่นใดที่ผู้ให้สินเชื่อต้องเสียไปเพื่อชำระหนี้ใด ๆ ที่ผู้ให้สินเชื่อไปกู้ยืมมาเพื่อนำมาให้เป็นสินเชื่อตามสัญญาฉบับนี้ (ถ้ามี)
          </div>

          <div className="flex gap-2 items-center mt-6">
            <span className="font-bold">13.</span>
            <span className="font-bold">ค่าใช้จ่ายอื่น ๆ</span>
          </div>
          <div className="flex gap-2 items-center ml-8">
            <span>13.1 <span className="underline">ค่าใช้จ่าย</span></span>
          </div>
          <div className="ml-8 text-justify">
            ผู้กู้ต้องชำระค่าใช้จ่ายทั้งหมดที่เกิดขึ้นดังต่อไปนี้ให้แก่ผู้ให้สินเชื่อ เมื่อผู้ให้สินเชื่อทวงถาม
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ก)</span>
            <div className="flex-1 text-justify">
              บรรดาค่าใช้จ่ายต่าง ๆ ค่าใช้จ่ายทางด้านเอกสาร และค่าใช้จ่ายต่าง ๆ ที่ผู้ให้สินชื่อได้มีการจ่ายไปใด ๆ ซึ่งเกิดขึ้นจากการเจรจา การจัดเตรียมเอกสาร และการเข้าทำสัญญาฉบับนี้ และ
            </div>
          </div>
          <div className="flex gap-2 ml-8">
            <span className="shrink-0 w-6">(ข)</span>
            <div className="flex-1 text-justify">
              บรรดาค่าใช้จ่าย ค่าใช้จ่ายทางศาลในการฟ้องร้องดำเนินคดี และค่าใช้จ่ายต่าง ๆ ที่ผู้ให้สินชื่อได้มีการจ่ายไปใด ๆ ที่เกิดขึ้นจากการแก้ไข เปลี่ยนแปลง ให้ความยินยอม หรือให้อนุญาตที่เกี่ยวข้องกับสัญญาฉบับนี้ หรือเอกสารที่เกี่ยวข้องใด ๆ หรือที่เกี่ยวข้องกับการป้องกันสิทธิหรือการใช้สิทธิบังคับ หรือความพยายามที่จะป้องกันหรือที่จะใช้สิทธิบังคับของผู้ให้สินเชื่อใด ๆ ที่มีอยู่ภายใต้สัญญาฉบับนี้ หรือเอกสารที่เกี่ยวข้องใด ๆ
            </div>
          </div>
        </div>
        {renderPageFooter(21)}
      </div>

      {/* Page 22 (Section 13.2: Stamp Duty onwards) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 items-center ml-8">
            <span className="shrink-0 w-6">13.2</span>
            <span className="underline">ค่าอากรแสตมป์</span>
          </div>
          <div className="ml-16 text-justify">
            <p>
              <span className="font-bold">ผู้ที่มีหน้าที่ต้องชำระค่าอากรแสตมป์สำหรับการทำสัญญาฉบับนี้ <Highlight>เป็นจำนวนทั้งสิ้น {data.stampDuty || '0'} บาท ({thaiBahtText(data.stampDuty || '0')}บาทถ้วน)</Highlight> โดยตกลงชำระ ณ วันที่ทำสัญญาฉบับนี้</span> และมีหน้าที่ต้องชำระค่าภาษีอากรอื่น ๆ ในทำนองเดียวกันที่เกี่ยวข้องกับสัญญาฉบับนี้ แต่เพียงผู้เดียว (เว้นแต่ ค่าอากรแสตมป์ และค่าภาษีอากรอื่น ๆ ที่เกี่ยวข้องกับหนังสือโอนสิทธิ และ/หรือ หน้าที่ของผู้ให้สินเชื่อตามสัญญาฉบับนี้ (หากมี)) และหากผู้ให้สินเชื่อได้ชำระค่าอากรแสตมป์ หรือค่าภาษีอากรอื่น ๆ ไปแทนผู้กู้อันเนื่องมาจากการที่ผู้กู้ชำระล่าช้าหรือไม่ชำระเงินค่าอากรดังกล่าว ผู้กู้ต้องชดใช้เงินจำนวนดังกล่าวคืนให้แก่ผู้ให้สินเชื่อเต็มจำนวน
            </p>
          </div>

          <div className="flex gap-2 items-center ml-8 mt-4">
            <span className="shrink-0 w-6">13.3</span>
            <span className="underline">ค่าบริการอันเกี่ยวข้องกับสัญญาฉบับนี้</span>
          </div>
          <div className="ml-16 text-justify">
            <span className="font-bold">ผู้กู้ตกลงยินยอมชำระค่าบริการในการจดทะเบียนจำนองทรัพย์สินหลักประกันกับหน่วยงานราชการที่เกี่ยวข้อง</span> และค่าบริการในการจดทะเบียนกรรมสิทธิ์เครื่องจักร (ถ้ามี) ให้แก่ผู้ให้สินเชื่อ โดยตกลงชำระ ณ วันที่ทำสัญญาฉบับนี้
          </div>

          <div className="flex gap-2 items-center ml-8 mt-4">
            <span className="shrink-0 w-6">13.4</span>
            <span className="underline">ค่าธรรมเนียมการจดทะเบียนหลักประกัน หรือ กรรมสิทธิ์เครื่องจักร</span>
          </div>
          <div className="ml-16 text-justify">
            ผู้กู้ตกลงยอมรับผิดชอบบรรดาค่าธรรมเนียมและค่าใช้จ่ายอื่นใดเกี่ยวกับการจดทะเบียนจำนองทรัพย์สินหลักประกัน หรือ จดทะเบียนกรรมสิทธิ์เครื่องจักร (ถ้ามี)
          </div>

          <div className="flex gap-2 ml-8 mt-4">
            <span className="shrink-0 w-6">13.5</span>
            <div className="flex-1 text-justify">
              กรณีที่มีค่าใช้จ่ายอันเกิดจากการดำเนินการใด ๆ เพื่อชำระหนี้ด้วยวิธีการตามข้อ 6. ของสัญญาฉบับนี้ โดยมิใช่ความผิดของผู้ให้สินเชื่อ ผู้กู้ตกลงชำระให้แก่ผู้ให้สินเชื่อทั้งสองฝ่ายในสัดส่วนตามข้อ 1.2 ของสัญญาฉบับนี้ ภายในระยะเวลาที่ผู้ให้สินเชื่อกำหนด
            </div>
          </div>
        </div>
        {renderPageFooter(22)}
      </div>

      {/* Page 23 (Section 14.1 - 14.3 (ก)) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 items-center">
            <span className="font-bold">14.</span>
            <span className="font-bold">เบ็ตเตล็ด</span>
          </div>

          <div className="flex gap-2 items-center ml-8">
            <span className="shrink-0 w-6">14.1</span>
            <span className="underline">การแก้ไขหรือยกเว้นข้อกำหนดหรือเงื่อนไขในสัญญา</span>
          </div>
          <div className="ml-16 text-justify">
            การแก้ไขสัญญานี้ การสละสิทธิ ให้การยกเว้น หรือให้ความยินยอมใด ๆ ภายใต้สัญญานี้ จะต้องเป็นการตกลงร่วมกันระหว่างคู่สัญญาทั้งสามฝ่ายเป็นลายลักษณ์อักษร เว้นแต่สัญญาฉบับนี้จะกำหนดไว้เป็นอย่างอื่น
          </div>

          <div className="flex gap-2 items-center ml-8 mt-4">
            <span className="shrink-0 w-6">14.2</span>
            <span className="underline">การที่สิทธิไม่ระงับและการสละสิทธิ</span>
          </div>
          <div className="ml-16 text-justify">
            ผู้ให้สินเชื่อสามารถใช้สิทธิต่าง ๆ ภายใต้สัญญาฉบับนี้ได้ตามที่เห็นสมควร และสิทธิดังกล่าวเป็นสิทธิที่เพิ่มเติมจากสิทธิต่าง ๆ ที่ผู้ให้สินเชื่อทั้งสองฝ่ายมีอยู่ตามกฎหมาย นอกจากนี้ การไม่ใช้สิทธิหรือความล่าช้าในการใช้สิทธิ ไม่ถือเป็นการสละสิทธิในเรื่องดังกล่าว และการใช้สิทธิแต่เพียงบางส่วน หรือการใช้สิทธิโดยบกพร่อง ไม่เป็นการตัดสิทธิในอันที่จะใช้สิทธิอื่นหรือสิทธิเดิมนั้นอีก
          </div>

          <div className="flex gap-2 items-center ml-8 mt-4">
            <span className="shrink-0 w-6">14.3</span>
            <span className="underline">หนังสือบอกกล่าว</span>
          </div>
          <div className="flex gap-2 ml-16">
            <span className="shrink-0 w-6">(ก)</span>
            <div className="flex-1 text-justify underline">การส่งหนังสือบอกกล่าว</div>
          </div>
          <div className="ml-24 text-justify">
            หนังสือบอกกล่าวหรือหนังสือติดต่อใด ๆ ที่ได้กระทำขึ้นภายใต้หรือเกี่ยวเนื่องกับสัญญานี้ จะต้องทำเป็นหนังสือหรือส่งโดยทางโทรสาร และลงลายมือชื่อของคู่สัญญาฝ่ายที่จัดทำเอกสารดังกล่าว และให้ถือว่าหนังสือบอกกล่าวถอนนั้นได้ส่งโดยชอบแล้วเมื่อได้ดำเนินการดังต่อไปนี้
          </div>
          <div className="flex gap-2 ml-24">
            <span className="shrink-0 w-6">(1)</span>
            <div className="flex-1 text-justify">ในกรณีที่ส่งโดยบุคคล (By Hand) ให้มีผลเมื่อได้จัดส่งหนังสือบอกกล่าว</div>
          </div>
          <div className="flex gap-2 ml-24">
            <span className="shrink-0 w-6">(2)</span>
            <div className="flex-1 text-justify">ในกรณีที่ส่งทางไปรษณีย์ลงทะเบียน ให้มีผลภายในวันที่กำหนดในใบตอบรับทางไปรษณีย์หรือใบรับที่เป็นลายลักษณ์อักษรอื่น</div>
          </div>
          <div className="flex gap-2 ml-24">
            <span className="shrink-0 w-6">(3)</span>
            <div className="flex-1 text-justify">ในกรณีที่ส่งทางโทรสาร ให้มีผลเมื่อครบกำหนด 1 (หนึ่ง) วัน นับแต่วันที่ส่งหนังสือบอกกล่าว</div>
          </div>
          <div className="flex gap-2 ml-24">
            <span className="shrink-0 w-6">(3)</span>
            <div className="flex-1 text-justify">หรือหนังสือติดต่อใด ๆ ที่ได้กระทำขึ้นตามข้อกำหนดดังกล่าวข้างต้น แต่วันที่ทำการส่งหนังสือบอกกล่าวหรือหนังสือติดต่อใด ๆ มีผลนั้นมิใช่วันทำการ หรือการส่งโดยบุคคลนั้นได้รับเมื่อเลิกเวลาทำการแล้วในสถานที่ที่ได้รับเอกสารดังกล่าว ให้ถือว่าได้ส่งโดยชอบในวันทำการของสถานที่นั้นในวันถัดไป</div>
          </div>
        </div>
        {renderPageFooter(23)}
      </div>

      {/* Page 24 (Section 14.3 (ข) - 14.5) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4">
          <div className="ml-16 text-justify">
            หากคู่สัญญาฝ่ายหนึ่งฝ่ายใดต้องการเปลี่ยนสถานที่อยู่ คู่สัญญาฝ่ายนั้นต้องแจ้งให้คู่สัญญาอีกฝ่ายทราบล่วงหน้าเป็นลายลักษณ์อักษรไม่น้อยกว่า 5 (ห้า) วันทำการก่อนวันที่ย้ายหรือเปลี่ยนแปลงสถานที่อยู่ในกรณีเช่นนี้คู่สัญญาฝ่ายที่ได้รับแจ้งการเปลี่ยนแปลงสถานที่อยู่จะส่งคำบอกกล่าวให้แก่คู่สัญญาฝ่ายที่แจ้งเปลี่ยนแปลงสถานที่อยู่ตามรายละเอียดที่ได้รับแจ้งดังกล่าว
          </div>

          <div className="flex gap-2 ml-16 mt-4">
            <span className="shrink-0 w-6">(ข)</span>
            <div className="flex-1 text-justify underline">การติดต่อทางอิเล็กทรอนิกส์</div>
          </div>
          <div className="ml-24 text-justify">
            การติดต่อระหว่างผู้ให้สินเชื่อกับผู้กู้ภายใต้สัญญาฉบับนี้ สามารถทำได้โดยวิธีส่งจดหมายอิเล็กทรอนิกส์หรือวิธีการอื่นใดทางอิเล็กทรอนิกส์ หากผู้ให้สินเชื่อกับผู้กู้
          </div>
          <div className="flex gap-2 ml-24">
            <span className="shrink-0 w-6">(1)</span>
            <div className="flex-1 text-justify">ตกลงและยอมรับว่าการติดต่อดังกล่าวเป็นรูปแบบในการติดต่อระหว่างผู้ให้สินเชื่อทั้งสองฝ่ายกับผู้กู้ เว้นแต่หรือจนกว่าจะมีการแจ้งเป็นอย่างอื่น</div>
          </div>
          <div className="flex gap-2 ml-24">
            <span className="shrink-0 w-6">(2)</span>
            <div className="flex-1 text-justify">ได้แจ้งแก่คู่สัญญาอีกฝ่ายหนึ่งเป็นหนังสือ ถึงที่อยู่ของจดหมายอิเล็กทรอนิกส์ของตน และ/หรือ ข้อมูลอื่นใดที่จำเป็นต่อการรับส่งข้อมูลด้วยวิธีดังกล่าว และ</div>
          </div>
          <div className="flex gap-2 ml-24">
            <span className="shrink-0 w-6">(3)</span>
            <div className="flex-1 text-justify">ได้แจ้งให้คู่สัญญาอีกฝ่ายหนึ่งทราบ กรณีมีการเปลี่ยนแปลงที่อยู่ของจดหมายอิเล็กทรอนิกส์ หรือข้อมูลอื่นใดที่ได้ให้ไว้แก่คู่สัญญาอีกฝ่ายหนึ่ง</div>
          </div>

          <div className="flex gap-2 items-center ml-8 mt-6">
            <span className="shrink-0 w-10">14.4</span>
            <span className="underline">ความไม่สมบูรณ์ของข้อสัญญา</span>
          </div>
          <div className="ml-20 text-justify">
            หากข้อสัญญาหรือข้อกำหนดข้อใดข้อหนึ่งภายใต้สัญญานี้ไม่สมบูรณ์ เป็นโมฆะ ขัดต่อกฎหมาย หรือไม่อาจบังคับได้ตามกฎหมาย ไม่ว่าในกรณีใด ๆ ให้ถือว่าข้อสัญญาหรือข้อกำหนดอื่นในสัญญานี้ ยังคงมีผลใช้บังคับได้ตามกฎหมาย
          </div>

          <div className="flex gap-2 items-center ml-8 mt-6">
            <span className="shrink-0 w-10">14.5</span>
            <span className="underline">กฎหมายที่ใช้บังคับ</span>
          </div>
          <div className="ml-20 text-justify">
            สัญญาฉบับนี้ให้ใช้บังคับและตีความตามกฎหมายไทย ข้อพิพาท ข้อโต้แย้ง หรือสิทธิเรียกร้องใด ๆ ที่เกิดขึ้นหรือที่เกี่ยวกับสัญญาฉบับนี้ซึ่งไม่สามารถตกลงกันได้ระหว่างคู่สัญญาให้นำเสนอต่อศาลไทยที่มีเขตอำนาจ
          </div>

          <div className="text-center mt-12 italic">
            (คู่สัญญาลงนามในหน้าถัดไป)
          </div>
        </div>
        {renderPageFooter(24)}
      </div>

      {/* Page 25 (Signatories: Agile & Borrower) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-6 pt-4">
          <div className="text-justify leading-relaxed">
            สัญญาฉบับนี้ทำขึ้นมา 3 (สาม) ฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านข้อความและเข้าใจในสัญญาเพื่อเป็นหลักฐานในการทำสัญญานี้ คู่สัญญาจึงลงนามในสัญญาฉบับนี้ต่อหน้าพยาน ณ วันที่ซึ่งได้ระบุไว้ในหน้าแรกของสัญญาฉบับนี้
          </div>

          <div className="mt-4 grid grid-cols-2 border border-black min-h-[600px] text-[12px] font-bold">
            {/* Left Column: Lender 1 */}
            <div className="border-r border-black p-4 flex flex-col h-full">
              <div className="space-y-12">
                <div className="font-bold underline">ผู้ให้สินเชื่อฝ่ายที่ 1:</div>
                <div className="font-bold"><Highlight>{agileInfo.companyName}</Highlight></div>

                <div className="pt-8 space-y-12">
                  {(agileInfo.directors || '').split(/\s*และ\s*/).map((sig, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="border-b border-black w-full h-8"></div>
                      <div className="flex gap-2">
                        <span>ชื่อ:</span>
                        <div className="flex-1 font-bold"><Highlight>{sig.trim()}</Highlight></div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4">
                    <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                    <div className="mt-2"><Highlight>{agileInfo.companyName}</Highlight></div>
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
                <div className="font-bold underline">ผู้กู้:</div>
                <div className="font-bold">
                  <Highlight>{customerInfo.companyName}</Highlight>
                </div>

                <div className="pt-8 space-y-12">
                  {(customerInfo.directors || '').split(/\s*และ\s*/).map((sig, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="border-b border-black w-full h-8"></div>
                      <div className="flex gap-2">
                        <span>ชื่อ:</span>
                        <div className="flex-1">
                          <Highlight>{sig.trim()}</Highlight>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4">
                    <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                    <div className="mt-2">
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
        {renderPageFooter(25)}
      </div>

      {/* Page 26 (Signatories: TK Assets) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-6 pt-4">
          <div className="mt-4 grid grid-cols-2 border border-black min-h-[600px] text-[12px] font-bold">
            {/* Left Column: Lender 2 */}
            <div className="border-r border-black p-4 flex flex-col h-full">
              <div className="space-y-12">
                <div className="font-bold underline">
                  ผู้ให้สินเชื่อฝ่ายที่ 2: <Highlight>{tkInfo.companyName}</Highlight>
                </div>

                <div className="pt-8 space-y-12">
                  {(tkInfo.directors || '').split(/\s*และ\s*/).map((sig, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="border-b border-black w-full h-8"></div>
                      <div className="flex gap-2">
                        <span>ชื่อ:</span>
                        <div className="flex-1 font-bold">
                          <Highlight>{sig.trim()}</Highlight>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4">
                    <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                    <div className="mt-2">
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
        {renderPageFooter(26)}
      </div>

      {/* Page 27 (Annex 1: Conditions Precedent) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-6 pt-4 text-[12px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 1</div>
            <div className="underline decoration-1 underline-offset-4">เงื่อนไขบังคับก่อน</div>
          </div>

          <div className="text-justify leading-relaxed">
            ผู้กู้ตกลงส่งเอกสารตามที่ได้กำหนดไว้ในข้อ (ก) ทุกประการก่อนการเบิกใช้สินเชื่อ และตกลงปฏิบัติตามที่กำหนดไว้ในข้อ (ข) ทุกประการก่อนการเบิกใช้สินเชื่อ ซึ่งได้มีการจัดเตรียมในรูปแบบและสาระสำคัญที่ผู้ให้สินเชื่อแต่ละรายเห็นสมควรภายในกำหนดเวลาในข้อ 3 ของสัญญาฉบับนี้ให้แก่ตัวแทนสินเชื่อ
          </div>

          <div className="space-y-4">
            <div>1. เอกสารที่เป็นเงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อภายใต้สัญญานี้</div>
            <div className="indent-8 text-justify">ผู้ให้สินเชื่อจะต้องได้รับเอกสารต่าง ๆ ดังต่อไปนี้ตามรูปแบบและสาระสำคัญที่ผู้ให้สินเชื่อเห็นสมควร</div>

            <div className="space-y-3 ml-6">
              <div className="flex gap-2 text-justify">
                <span className="shrink-0 w-6">(ก)</span>
                <div className="flex-1">
                  หนังสือรับรองบริษัทของผู้กู้จากนายทะเบียนหุ้นส่วนบริษัท กระทรวงพาณิชย์ ลงวันที่รับรองไม่เกิน <Highlight>30 (สามสิบ) วัน</Highlight> ก่อนวันที่กำหนดให้เป็นวันเบิกใช้สินเชื่อ
                </div>
              </div>

              <div className="flex gap-2 text-justify">
                <span className="shrink-0 w-6">(ข)</span>
                <div className="flex-1">
                  สำเนาเอกสารเกี่ยวกับผู้กู้ ซึ่งรับรองโดยนายทะเบียนหุ้นส่วนบริษัท กระทรวงพาณิชย์ ลงวันที่รับรองไม่เกิน <Highlight>30 (สามสิบ) วัน</Highlight> ก่อนวันที่กำหนดให้เป็นวันเบิกใช้สินเชื่อ ดังต่อไปนี้
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-4">
                      <span>(1)</span>
                      <span>หนังสือบริคณห์สนธิ</span>
                    </div>
                    <div className="flex gap-4">
                      <span>(2)</span>
                      <span>ข้อบังคับของบริษัท</span>
                    </div>
                    <div className="flex gap-4">
                      <span>(3)</span>
                      <span>สำเนาบัญชีรายชื่อผู้ถือหุ้น</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 text-justify">
                <span className="shrink-0 w-6">(ค)</span>
                <div className="flex-1">
                  สำเนามติที่ประชุมของคณะกรรมการและสำเนามติที่ประชุมของผู้ถือหุ้นของผู้กู้ (ในกรณีที่จะต้องได้รับมติจากผู้ถือหุ้น) ซึ่งรับรองความถูกต้องโดยกรรมการผู้มีอำนาจของผู้กู้ อนุมัติให้ลงนามและปฏิบัติตามสัญญาฉบับนี้และเอกสารทางธุรกรรมตามสัญญาฉบับนี้
                </div>
              </div>

              <div className="flex gap-2 text-justify">
                <span className="shrink-0 w-6">(ง)</span>
                <div className="flex-1">
                  ตัวอย่างลายมือชื่อของกรรมการผู้มีอำนาจ และ/หรือ เจ้าหน้าที่ผู้มีอำนาจ ตามข้อ 1 (ฉ) (ถ้ามี) ของผู้กู้
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(27)}
      </div>

      {/* Page 28 (Annex 1: Conditions Precedent Cont.) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-6 pt-4 text-[12px]">
          <div className="space-y-3 ml-6">
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

          <div className="space-y-4">
            <div>2. ข้อปฏิบัติที่เป็นเงื่อนไขบังคับก่อนการเบิกใช้สินเชื่อภายใต้สัญญานี้</div>

            <div className="space-y-3 ml-6">
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
                  บรรดาคำรับรองและยืนยันที่ผู้กู้ได้ให้ไว้ในข้อ 9. ของสัญญาฉบับนี้ เป็นความจริง และถูกต้องเสมือนว่าได้ทำขึ้น หรือให้ไว้ใน วันที่กำหนดให้เป็นวันเบิกใช้สินเชื่อครั้งแรก
                </div>
              </div>

              <div className="flex gap-2 text-justify">
                <span className="shrink-0 w-8">(จ)</span>
                <div className="flex-1">
                  ผู้กู้ได้ปฏิบัติตามข้อตกลงกระทำการที่ระบุในข้อ 10. ของสัญญาฉบับนี้ หรือตามเงื่อนไขที่ให้ไว้ใน
                </div>
              </div>

              <div className="flex gap-2 text-justify">
                <span className="shrink-0 w-8">(ฉ)</span>
                <div className="flex-1">
                  เอกสารที่เกี่ยวข้องตามสัญญาอื่น ๆ ตามกำหนดเวลาที่ระบุไว้และไม่มีเหตุผิดนัด หรือกรณีที่จะเป็น
                </div>
              </div>

              <div className="flex gap-2 text-justify">
                <span className="shrink-0 w-8">(ช)</span>
                <div className="flex-1">
                  เหตุผิดนัดใด ๆ เกิดขึ้น หรืออาจเกิดขึ้นเมื่อมีการใช้สินเชื่อตามสัญญาฉบับนี้
                </div>
              </div>

              <div className="flex gap-2 text-justify">
                <span className="shrink-0 w-8">(ซ)</span>
                <div className="flex-1">
                  ผู้กู้ได้จดทะเบียนทรัพย์สินหลักประกันกับหน่วยงานราชการที่เกี่ยวข้อง ตามข้อกำหนดและเงื่อนไขที่ระบุในสัญญาฉบับนี้ (ถ้ามี)
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(28)}
      </div>

      {/* Page 29 (Annex 2: Loan Drawdown Request - Lender 1) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4 text-[12px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 2</div>
            <div className="underline decoration-1 underline-offset-4">หนังสือขอเบิกใช้สินเชื่อ</div>
          </div>

          <div className="flex justify-end">
            <div>วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight></div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรื่อง</span>
              <div className="flex-1">การเบิกสินเชื่อตามสัญญาให้สินเชื่อ สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight> (“<span className="font-bold">สัญญาให้สินเชื่อ</span>”)</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <div className="flex-1"><Highlight>{agileInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 1</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">1.</span>
              <div className="flex-1">
                ข้าพเจ้าบริษัท <Highlight>{customerInfo.companyName}</Highlight> ขออ้างถึงสัญญาให้สินเชื่อ และให้คำจำกัดความต่าง ๆ ที่ใช้ในสัญญาให้สินเชื่อ ให้มีความหมายเช่นเดียวกันกับการใช้ในคำขอเบิกใช้สินเชื่อนี้
              </div>
            </div>

            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">2.</span>
              <div className="flex-1">
                ข้าพเจ้ามีความประสงค์จะเบิกสินเชื่อ ดังรายละเอียดต่อไปนี้
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ก)</span>
                    <div className="flex-1">วันที่เบิกใช้สินเชื่อ: <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight></div>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ข)</span>
                    <div className="flex-1">จำนวนเงิน: <Highlight>{limit1.toLocaleString()}</Highlight> บาท</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ค)</span>
                    <div className="flex-1">
                      ส่งมอบเงินโดย (วิธีการใดวิธีการหนึ่ง)
                      <div className="mt-1 space-y-1">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-black shrink-0 mt-0.5"></div>
                          <div className="flex-1">แคชเชียร์เช็ค (Cashier Cheque): ธนาคาร.................................................... สั่งจ่ายชื่อ ....................................................</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-black shrink-0 mt-0.5"></div>
                          <div className="flex-1">เช็คธนาคารสั่งจ่ายล่วงหน้า: ธนาคาร.................................................... สั่งจ่ายชื่อ ....................................................</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-black shrink-0 mt-0.5"></div>
                          <div className="flex-1">โอนเงินไปที่บัญชี: ธนาคาร.................................................... เลขที่บัญชี ....................................................</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-black shrink-0 mt-0.5"></div>
                          <div className="flex-1">วิธีการอื่นใด: .................................................................................................................................................................................</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">3.</span>
              <div className="flex-1">
                ข้าพเจ้าขอยืนยันว่า คำรับรองและยืนยันตามที่ระบุไว้ในข้อ 9. ของสัญญาให้สินเชื่อ เป็นความจริงและถูกต้อง ณ วันที่ที่ระบุไว้ในคำขอเบิกใช้สินเชื่อนี้เสมือนหนึ่งว่าคำรับรองและยืนยันดังกล่าวได้กระทำขึ้นโดยคำนึงถึงข้อเท็จจริง และเหตุการณ์ที่เกิดขึ้น หรือที่เป็นอยู่จริง ณ ขณะนี้ และไม่มีกรณีเหตุผิดนัด และเหตุการณ์ที่อาจจะนำไปสู่เหตุผิดนัดเกิดขึ้น หรือกำลังจะเกิดขึ้น หรือจะมีเหตุผิดนัดหรือเหตุการณ์ที่อาจจะนำไปสู่เหตุผิดนัดเกิดขึ้นเนื่องมาจากการเบิกใช้สินเชื่อที่ให้ในครั้งนี้
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-end">
            <div className="w-1/2 text-center mb-4">ขอแสดงความนับถือ</div>

            <div className="w-full flex items-center justify-end gap-24">
              {/* Company Stamp Text - Balanced position */}
              <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">
                ประทับตราบริษัท (ถ้ามี)
              </div>

              {/* Signature Block */}
              <div className="w-1/2 flex flex-col items-center space-y-4">
                <div className="w-full pt-14 space-y-4 text-center">
                  <div className="border-b border-black w-full mx-auto max-w-[250px]"></div>

                  <div className="space-y-1 font-bold">
                    <div>
                      <Highlight>{customerInfo.directors}</Highlight>
                    </div>
                    <div>กรรมการผู้มีอำนาจลงนาม</div>
                    <div>บริษัท <Highlight>{customerInfo.companyName}</Highlight></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(29)}
      </div>

      {/* Page 30 (Annex 2: Loan Drawdown Request - Lender 2) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />
        <div className="space-y-4 pt-4 text-[12px]">
          <div className="text-center font-bold">

            <div className="underline decoration-1 underline-offset-4">หนังสือขอเบิกใช้สินเชื่อ</div>
          </div>

          <div className="flex justify-end">
            <div>วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight></div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรื่อง</span>
              <div className="flex-1">การเบิกสินเชื่อตามสัญญาให้สินเชื่อ สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight> (“<span className="font-bold">สัญญาให้สินเชื่อ</span>”)</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <div className="flex-1"><Highlight>{tkInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 2</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">1.</span>
              <div className="flex-1">
                ข้าพเจ้าบริษัท <Highlight>{customerInfo.companyName}</Highlight> ขออ้างถึงสัญญาให้สินเชื่อ และให้คำจำกัดความต่าง ๆ ที่ใช้ในสัญญาให้สินเชื่อ ให้มีความหมายเช่นเดียวกันกับการใช้ในคำขอเบิกใช้สินเชื่อนี้
              </div>
            </div>

            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">2.</span>
              <div className="flex-1">
                ข้าพเจ้ามีความประสงค์จะเบิกสินเชื่อ ดังรายละเอียดต่อไปนี้
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ง)</span>
                    <div className="flex-1">วันที่เบิกใช้สินเชื่อ: <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight></div>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(จ)</span>
                    <div className="flex-1">จำนวนเงิน: <Highlight>{limit2.toLocaleString()}</Highlight> บาท</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 w-8">(ฉ)</span>
                    <div className="flex-1">
                      ส่งมอบเงินโดย (วิธีการใดวิธีการหนึ่ง)
                      <div className="mt-1 space-y-1">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-black shrink-0 mt-0.5"></div>
                          <div className="flex-1">แคชเชียร์เช็ค (Cashier Cheque): ธนาคาร.................................................... สั่งจ่ายชื่อ ....................................................</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-black shrink-0 mt-0.5"></div>
                          <div className="flex-1">เช็คธนาคารสั่งจ่ายล่วงหน้า: ธนาคาร.................................................... สั่งจ่ายชื่อ ....................................................</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-black shrink-0 mt-0.5"></div>
                          <div className="flex-1">โอนเงินไปที่บัญชี: ธนาคาร.................................................... เลขที่บัญชี ....................................................</div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 border border-black shrink-0 mt-0.5"></div>
                          <div className="flex-1">วิธีการอื่นใด: .................................................................................................................................................................................</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">3.</span>
              <div className="flex-1">
                ข้าพเจ้าขอยืนยันว่า คำรับรองและยืนยันตามที่ระบุไว้ในข้อ 9. ของสัญญาให้สินเชื่อ เป็นความจริงและถูกต้อง ณ วันที่ที่ระบุไว้ในคำขอเบิกใช้สินเชื่อนี้เสมือนหนึ่งว่าคำรับรองและยืนยันดังกล่าวได้กระทำขึ้นโดยคำนึงถึงข้อเท็จจริง และเหตุการณ์ที่เกิดขึ้น หรือที่เป็นอยู่จริง ณ ขณะนี้ และไม่มีกรณีเหตุผิดนัด และเหตุการณ์ที่อาจจะนำไปสู่เหตุผิดนัดเกิดขึ้น หรือกำลังจะเกิดขึ้น หรือจะมีเหตุผิดนัดหรือเหตุการณ์ที่อาจจะนำไปสู่เหตุผิดนัดเกิดขึ้นเนื่องมาจากการเบิกใช้สินเชื่อที่ให้ในครั้งนี้
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-end">
            <div className="w-1/2 text-center mb-4">ขอแสดงความนับถือ</div>

            <div className="w-full flex items-center justify-end gap-24">
              {/* Company Stamp Text - Balanced position */}
              <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">
                ประทับตราบริษัท (ถ้ามี)
              </div>

              {/* Signature Block */}
              <div className="w-1/2 flex flex-col items-center space-y-4">
                <div className="w-full pt-14 space-y-4 text-center">
                  <div className="border-b border-black w-full mx-auto max-w-[250px]"></div>

                  <div className="space-y-1 font-bold">
                    <div>
                      <Highlight>{customerInfo.directors}</Highlight>
                    </div>
                    <div>กรรมการผู้มีอำนาจลงนาม</div>
                    <div>บริษัท <Highlight>{customerInfo.companyName}</Highlight></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(30)}
      </div>

      {/* Page 31 (Annex 3: Evidence of Receipt of Credit - Lender 1) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 pt-4 text-[12px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 3</div>
            <div className="underline decoration-1 underline-offset-4">เอกสารการรับสินเชื่อ</div>
          </div>

          <div className="flex justify-end pr-8">
            <div className="flex gap-1">
              <span>วันที่</span>
              <div className="border-b border-dotted border-black w-48 mt-[-2px]"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรื่อง</span>
              <div className="flex-1">การรับสินเชื่อตามสัญญาให้สินเชื่อ สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight> (“<span className="font-bold">สัญญาให้สินเชื่อ</span>”)</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <div className="flex-1"><Highlight>{agileInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 1</div>
            </div>
          </div>

          <div className="space-y-6 mt-12 pb-12">
            <div className="text-justify indent-16 leading-[2.2]">
              ตามที่ข้าพเจ้าบริษัท <Highlight>{customerInfo.companyName}</Highlight> ได้ขอเบิกสินเชื่อต่อบริษัท <Highlight>{agileInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 1 เป็นจำนวน <Highlight>{limit1.toLocaleString()}</Highlight> บาท ดังรายละเอียดปรากฏตามหนังสือขอเบิกใช้สินเชื่อ ฉบับลงวันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight>
            </div>

            <div className="text-left indent-16 leading-[2.2]">
              ในวันที่<span className="inline-block border-b border-dotted border-black w-40 h-4 mx-1"></span>ข้าพเจ้าได้รับสินเชื่อตามสัญญาให้สินเชื่อเป็นจำนวนเงิน<span className="inline-block border-b border-dotted border-black w-48 h-4 mx-1"></span>บาท จาก<Highlight>{agileInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 1 ไว้ถูกต้องครบถ้วนเรียบร้อยแล้ว จึงลงลายมือชื่อไว้เป็นสำคัญ ณ วัน เดือน ปี ที่กล่าวข้างต้น
            </div>
          </div>

          <div className="mt-16 flex flex-col items-end">
            <div className="w-1/2 text-center mb-4">ขอแสดงความนับถือ</div>

            <div className="w-full flex items-center justify-end gap-24">
              {/* Company Stamp Text - Balanced position */}
              <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">
                ประทับตราบริษัท (ถ้ามี)
              </div>

              {/* Signature Block */}
              <div className="w-1/2 flex flex-col items-center space-y-4">
                <div className="w-full pt-14 space-y-4 text-center">
                  <div className="border-b border-black w-full mx-auto max-w-[250px]"></div>

                  <div className="space-y-1 font-bold">
                    <div>
                      <Highlight>{customerInfo.directors}</Highlight>
                    </div>
                    <div>กรรมการผู้มีอำนาจลงนาม</div>
                    <div>บริษัท <Highlight>{customerInfo.companyName}</Highlight></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(31)}
      </div>

      {/* Page 32 (Annex 3: Evidence of Receipt of Credit - Lender 2) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-6 pt-4 text-[12px]">
          <div className="text-center font-bold">

            <div className="underline decoration-1 underline-offset-4">เอกสารการรับสินเชื่อ</div>
          </div>

          <div className="flex justify-end pr-8">
            <div className="flex gap-1">
              <span>วันที่</span>
              <div className="border-b border-dotted border-black w-48 mt-[-2px]"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรื่อง</span>
              <div className="flex-1">การรับสินเชื่อตามสัญญาให้สินเชื่อ สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight> (“<span className="font-bold">สัญญาให้สินเชื่อ</span>”)</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-12">เรียน</span>
              <div className="flex-1"><Highlight>{tkInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 2</div>
            </div>
          </div>

          <div className="space-y-6 mt-12 pb-12">
            <div className="text-justify indent-16 leading-[2.2]">
              ตามที่ข้าพเจ้าบริษัท <Highlight>{customerInfo.companyName}</Highlight> ได้ขอเบิกสินเชื่อต่อบริษัท <Highlight>{tkInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 2 เป็นจำนวน <Highlight>{limit2.toLocaleString()}</Highlight> บาท ดังรายละเอียดปรากฏตามหนังสือขอเบิกใช้สินเชื่อ ฉบับลงวันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight>
            </div>

            <div className="text-left indent-16 leading-[2.2]">
              ในวันที่<span className="inline-block border-b border-dotted border-black w-40 h-4 mx-1"></span>ข้าพเจ้าได้รับสินเชื่อตามสัญญาให้สินเชื่อเป็นจำนวนเงิน<span className="inline-block border-b border-dotted border-black w-48 h-4 mx-1"></span>บาท จากบริษัท <Highlight>{tkInfo.companyName}</Highlight> ในฐานะผู้ให้สินเชื่อฝ่ายที่ 2 ไว้ถูกต้องครบถ้วนเรียบร้อยแล้ว จึงลงลายมือชื่อไว้เป็นสำคัญ ณ วัน เดือน ปี ที่กล่าวข้างต้น
            </div>
          </div>

          <div className="mt-16 flex flex-col items-end">
            <div className="w-1/2 text-center mb-4">ขอแสดงความนับถือ</div>

            <div className="w-full flex items-center justify-end gap-24">
              {/* Company Stamp Text - Balanced position */}
              <div className="text-[10px] text-gray-400 italic whitespace-nowrap pb-10">
                ประทับตราบริษัท (ถ้ามี)
              </div>

              {/* Signature Block */}
              <div className="w-1/2 flex flex-col items-center space-y-4">
                <div className="w-full pt-14 space-y-4 text-center">
                  <div className="border-b border-black w-full mx-auto max-w-[250px]"></div>

                  <div className="space-y-1 font-bold">
                    <div>
                      <Highlight>{customerInfo.directors}</Highlight>
                    </div>
                    <div>กรรมการผู้มีอำนาจลงนาม</div>
                    <div>บริษัท <Highlight>{customerInfo.companyName}</Highlight></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(32)}
      </div>

      {/* Page 33 (Annex 4: Evidence of Delivery of Post-dated Checks) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="space-y-4 pt-2 text-[12px]">
          <div className="text-center font-bold">
            <div>เอกสารแนบท้ายหมายเลข 4</div>
            <div className="underline">หลักฐานการส่งมอบเช็คสั่งจ่ายล่วงหน้า สำหรับการชำระค่างวดและดอกเบี้ย</div>
          </div>

          <div className="text-justify indent-10 mt-4">
            เอกสารฉบับนี้เป็นส่วนหนึ่งของสัญญาให้สินเชื่อเลขที่ <Highlight>{data.contractNo}</Highlight> ลงวันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight> โดยคู่สัญญาทุกฝ่ายตกลงและยืนยัน ดังนี้
          </div>

          <div className="space-y-3">
            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">1.</span>
              <div className="flex-1">
                <span className="font-bold">การส่งมอบเช็ค :</span> ผู้กู้ตกลงส่งมอบเช็คสั่งจ่ายล่วงหน้า สำหรับการชำระค่างวดให้แก่ผู้ให้สินเชื่อ จำนวนทั้งสิ้น <Highlight>{(parseInt(data.installments) * 2).toString()}</Highlight> ฉบับ เพื่อเป็นการชำระค่างวดสินเชื่อ (งวดที่ 1 ถึง งวดที่ <Highlight>{data.installments}</Highlight>) โดยแบ่งชำระเป็นงวด งวดละ 2 (สอง) ฉบับ ให้แก่ผู้ให้สินเชื่อแต่ละฝ่าย ณ วันที่ทำสัญญาฉบับนี้เป็นที่เรียบร้อยแล้ว รายละเอียดปรากฏตามสำเนาเช็คสั่งจ่ายล่วงหน้าที่แนบมานี้
              </div>
            </div>

            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">2.</span>
              <div className="flex-1">
                <span className="font-bold">รายละเอียดการชำระ :</span> เช็คแต่ละฉบับจะถูกสั่งจ่ายในนามผู้ให้สินเชื่อแต่ละฝ่าย โดยระบุจำนวนเงินและวันที่ครบกำหนดชำระในแต่ละงวดให้สอดคล้องกับ "<span className="underline">รายละเอียดค่างวดแต่ละงวดและวิธีการคำนวณค่างวด</span>" ตามเอกสารแนบท้ายหมายเลข 5 ของสัญญาให้สินเชื่อฉบับนี้
              </div>
            </div>

            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">3.</span>
              <div className="flex-1">
                <span className="font-bold">การยืนยันรายละเอียดและสำนาภาพถ่ายเช็ค :</span> คู่สัญญาทุกฝ่ายตกลงให้ถือว่า "ใบรับเช็ค" หรือ "สำเนาภาพถ่ายเช็คทั้งหมด" ที่มีการลงนามรับมอบโดยผู้ให้สินเชื่อแต่ละฝ่าย ณ วันที่ทำสัญญานี้ เป็นรายละเอียดส่วนหนึ่งของเอกสารแนบท้ายฉบับนี้ และให้มีผลผูกพันตามกฎหมายเสมือนว่าได้มีการระบุรายละเอียดเช็คทุกฉบับไว้ในสัญญาฉบับนี้โดยละเอียดทุกประการ
              </div>
            </div>

            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">4.</span>
              <div className="flex-1">
                <span className="font-bold">ความรับผิดทางอาญา :</span> ผู้กู้ยืนยันและรับรองว่าเช็คทุกฉบับที่ส่งมอบเป็นเช็คที่ออกโดยชอบด้วยกฎหมาย เพื่อชำระหนี้ที่มีอยู่จริงและบังคับได้ตามกฎหมาย หากเช็คฉบับใดถูกธนาคารปฏิเสธการจ่ายเงินไม่ว่าด้วยเหตุใดๆ ผู้กู้ยอมรับว่าตนมีเจตนาหรืออาจเล็งเห็นผลที่จะไม่ให้มีการใช้เงินตามเช็คไม้นั้น และยินยอมให้ผู้ให้สินเชื่อดำเนินคดีตาม <span className="font-bold underline">พระราชบัญญัติว่าด้วยความผิดอันเกิดจากการใช้เช็ค พ.ศ. 2534</span> และที่แก้ไขเพิ่มเติม รวมถึงความรับผิดทางแพ่งและทางอาญาในส่วนอื่นๆที่เกี่ยวข้องโดยพลัน
              </div>
            </div>

            <div className="flex gap-4 text-justify">
              <span className="shrink-0 w-4">5.</span>
              <div className="flex-1">
                <span className="font-bold">ความเป็นส่วนหนึ่งของสัญญา :</span> ข้อตกลงตามเอกสารแนบท้ายนี้ให้ถือเป็นส่วนหนึ่งของสัญญาให้สินเชื่อฉบับนี้หากความในเอกสารฉบับนี้ขัดหรือแย้งกับสัญญาให้สินเชื่อให้ถือตามข้อความในเอกสารแนบท้ายนี้ในส่วนที่เกี่ยวกับการชำระหนี้ด้วยเช็ค
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-14 grid grid-cols-2 gap-x-12 gap-y-10">
            {/* Lender 1 */}
            <div className="flex flex-col items-center">
              <div className="w-full flex items-baseline gap-1 justify-center">
                <span className="shrink-0 whitespace-nowrap">ลงชื่อ</span>
                <div className="border-b border-dotted border-black w-[200px]"></div>
                <div className="shrink-0 text-[10px] leading-tight flex flex-col items-start translate-y-1">
                  <span>ผู้ให้สินเชื่อฝ่ายที่ 1 </span>
                  <span>/ ผู้รับมอบเช็ค</span>
                </div>
              </div>
              <div className="mt-4 font-bold">( <Highlight>{agileInfo.companyName}</Highlight> )</div>
            </div>

            {/* Borrower */}
            <div className="flex flex-col items-center">
              <div className="w-full flex items-baseline gap-1 justify-center">
                <span className="shrink-0 whitespace-nowrap">ลงชื่อ</span>
                <div className="border-b border-dotted border-black w-[200px]"></div>
                <div className="shrink-0 text-[10px] leading-tight flex flex-col items-start translate-y-1">
                  <span>ผู้กู้ / ผู้ส่ง</span>
                  <span>มอบเช็ค</span>
                </div>
              </div>
              <div className="mt-4 font-bold">( <Highlight>{customerInfo.companyName}</Highlight> )</div>
            </div>

            {/* Lender 2 */}
            <div className="flex flex-col items-center">
              <div className="w-full flex items-baseline gap-1 justify-center">
                <span className="shrink-0 whitespace-nowrap">ลงชื่อ</span>
                <div className="border-b border-dotted border-black w-[200px]"></div>
                <div className="shrink-0 text-[10px] leading-tight flex flex-col items-start translate-y-1">
                  <span>ผู้ให้สินเชื่อฝ่ายที่ 2 </span>
                  <span>/ ผู้รับมอบเช็ค</span>
                </div>
              </div>
              <div className="mt-4 font-bold">( <Highlight>{tkInfo.companyName}</Highlight> )</div>
            </div>
          </div>
        </div>
        {renderPageFooter(33)}
      </div>

      {/* Page 34 (Annex 5: Details of Installments and Calculation) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="flex flex-col items-center text-[12px]">
          <div className="font-bold">เอกสารแนบท้ายหมายเลข 5</div>
          <div className="font-bold underline text-center uppercase">
            รายละเอียดค่างวดแต่ละงวดและวิธีการคำนวณค่างวด
          </div>
        </div>
        {renderPageFooter(34)}
      </div>

      {/* Page 35 (Annex 6: Details of Collateral) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100 font-sans">
        <PageHeader />
        <div className="flex flex-col items-center text-[12px]">
          <div className="font-bold">เอกสารแนบท้ายหมายเลข 6</div>
          <div className="font-bold underline text-center uppercase">
            รายละเอียดเกี่ยวกับหลักประกัน
          </div>
        </div>
        {renderPageFooter(35)}
      </div>
    </div>
  );
}
