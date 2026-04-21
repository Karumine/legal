import React from 'react';
import PageHeader from './PageHeader';
import type { GuaranteeData } from '../types/guarantee';
import { formatThaiDate } from '../utils/thaiDate';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import { formatThaiId, formatPhoneNumber } from '../utils/formatters';
import { formatAddressWithPostalCode } from '../utils/address';
import { Highlight } from './Highlight';

interface Props {
  data: GuaranteeData;
}

export default function GuaranteePreview({ data }: Props) {

  // Strip leading "เลขที่" from address data to prevent duplication
  // since the template text already includes the prefix
  const stripAddressPrefix = (addr: string) =>
    addr?.replace(/^เลขที่\s*/, '') || '';

  const totalPages = 8 + data.guarantors.reduce((sum, g) => {
    if (g.type === 'company' || g.type === 'partnership') return sum;
    return sum + (g.isMarried ? 2 : 1);
  }, 0);

  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
      <div>
        สัญญาค้ำประกัน เลขที่ {data.contractNo}
      </div>
      <div>
        หน้า {pageNum} จาก {totalPages}
      </div>
    </div>
  );

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line space-y-8 print:space-y-0 mx-auto">
      {/* Page 1 */}
      <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
        <PageHeader />

        {/* Hand-written text space (มีคู่สมรส) */}
        <div className="absolute top-12 left-[50%] text-blue-800 font-bold handwriting-simulation opacity-50">
          {/* Space replicating the handwritten text in the image */}
        </div>

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-[16px]">สัญญาค้ำประกัน</h2>
          <div className="mt-2 text-[16px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          สัญญาค้ำประกัน <b>("สัญญา")</b> ฉบับนี้ทำขึ้นเพื่อให้มีผลใช้บังคับตั้งแต่วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight> (<b>"วันที่สัญญาค้ำประกันมีผลบังคับ"</b>) โดยและระหว่าง
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-2 text-justify">
            <span className="shrink-0 w-6">(1)</span>
            <div className="flex-1">
              <b><Highlight>{data.lenderCompany}</Highlight></b> (โดย<Highlight>{data.lenderDirectors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(data.lenderAddress, data.lenderPostalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(data.lenderTaxId)}</Highlight> (<b>"ผู้ให้เช่าซื้อฝ่ายที่ 1"</b>)
            </div>
          </div>

          <div className="flex gap-2 text-justify">
            <span className="shrink-0 w-6">(2)</span>
            <div className="flex-1">
              <b><Highlight>{data.borrowerCompany}</Highlight></b> (โดย<Highlight>{data.borrowerDirectors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(data.borrowerAddress, data.borrowerPostalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(data.borrowerTaxId)}</Highlight> (<b>"ผู้ให้เช่าซื้อฝ่ายที่ 2"</b>)
            </div>
          </div>

          <div className="indent-10 mb-6">
            ซึ่ง (1) และ (2) จะเรียกรวมกันว่า <b>"ผู้ให้เช่าซื้อ"</b> ฝ่ายหนึ่ง
          </div>

          {data.guarantors.map((guarantor, idx) => {
            const isCorporate = guarantor.type === 'company' || guarantor.type === 'partnership';

            return (
              <div key={idx} className="flex gap-2 text-justify">
                <span className="shrink-0 w-6">({idx + 3})</span>
                <div className="flex-1">
                  {isCorporate ? (
                    <>
                      <b><Highlight>{guarantor.name}</Highlight></b> (โดย<Highlight>{guarantor.directors}</Highlight> {guarantor.type === 'partnership' ? 'หุ้นส่วนผู้จัดการผู้มีอำนาจกระทำการ' : 'กรรมการผู้มีอำนาจกระทำการแทนบริษัท'}) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(guarantor.address, guarantor.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(guarantor.idCard)}</Highlight> (<b>"ผู้ค้ำประกันคนที่ {idx + 1}"</b>) {idx === data.guarantors.length - 1 && 'อีกฝ่ายหนึ่ง'}
                    </>
                  ) : (
                    <>
                      <b><Highlight>{guarantor.name}</Highlight></b> ผู้ถือบัตรประจำตัวประชาชนเลขที่ <Highlight>{formatThaiId(guarantor.idCard)}</Highlight> มีที่อยู่ตามทะเบียนบ้านเลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(guarantor.address, guarantor.postalCode))}</Highlight> (<b>"ผู้ค้ำประกันคนที่ {idx + 1}"</b>) {idx === data.guarantors.length - 1 && 'อีกฝ่ายหนึ่ง'}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="font-bold mb-4 mt-8">
          ดังนั้น คู่สัญญาจึงได้ตกลงเข้าทำสัญญาฉบับนี้ขึ้นภายใต้ข้อตกลงและเงื่อนไขดังต่อไปนี้
        </div>

        <div className="flex gap-2 text-justify mb-4">
          <span className="shrink-0 w-6">1.</span>
          <div className="flex-1">
            ตามที่ผู้ให้เช่าซื้อและ<b><Highlight>{data.refContractCompany}</Highlight> (“ลูกหนี้”)</b> ได้เข้าทำ{data.refContracts.map((ref, idx) => (
              <span key={idx}>
                {idx > 0 && (idx === data.refContracts.length - 1 ? ' และ' : ', ')} {CONTRACT_TYPE_LABELS[ref.type as keyof typeof CONTRACT_TYPE_LABELS]}เลขที่ <Highlight>{ref.no}</Highlight> ฉบับลงวันที่ <Highlight>{formatThaiDate(ref.date)}</Highlight>
              </span>
            ))} ผู้ค้ำประกันยินยอมเข้าค้ำประกันการชำระหนี้อันครบถ้วนสมบูรณ์ ตรงต่อเวลาและเป็นไปตามข้อกำหนดและเงื่อนไขภายใต้สัญญาดังกล่าว โดยมีวงเงินค้ำประกันหนี้ตามสัญญาฉบับนี้ <b>รวมกันทั้งสิ้นไม่เกินจำนวน <Highlight>{data.guaranteeAmountNumber}</Highlight> บาท (<Highlight>{data.guaranteeAmountText}</Highlight>)</b> บวกด้วยดอกเบี้ย ดอกเบี้ยผิดนัด ค่าธรรมเนียม ค่าสินไหมทดแทนซึ่งลูกหนี้ค้างชำระ ค่าเบี้ยประกันภัย ค่าปรับ ค่าใช้จ่ายในการติดตามทวงถาม บังคับชำระหนี้ ตลอดจนค่าภาระติดพันอันเป็นอุปกรณ์แห่งหนี้ของลูกหนี้ และค่าใช้จ่ายอื่นใดตามสัญญาดังกล่าวให้แก่ผู้ให้เช่าซื้อจนกว่าผู้ให้เช่าซื้อจะได้รับชำระหนี้ภายใต้สัญญาดังกล่าวจนครบถ้วน
          </div>
        </div>

        <PageFooter pageNum={1} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 2 */}
      <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
        <PageHeader />

        <div className="mt-8">
          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">2.</span>
            <div className="flex-1">
              ถ้าลูกหนี้ผิดนัดไม่ชำระหนี้ และ/หรือ ไม่สามารถชำระหนี้ตามสัญญาดังกล่าวให้ผู้ให้เช่าซื้อไม่ว่าด้วยเหตุใดๆ ก็ตาม หรือกระทำให้ผู้ให้เช่าซื้อไม่ได้รับชำระหนี้อันเกิดจากสัญญาครบถ้วน และตามที่ระบุไว้ในสัญญาดังกล่าวก็ดี และผู้ให้เช่าซื้อมีหนังสือบอกกล่าวไปยังผู้ค้ำประกันภายใน 60 (หกสิบ) วัน นับแต่วันที่ลูกหนี้ผิดนัดแล้ว ผู้ค้ำประกันตกลงที่จะชำระหนี้อันค้างชำระและถึงกำหนดชำระทั้งสิ้น ซึ่งรวมไปถึงดอกเบี้ย ดอกเบี้ยผิดนัด ค่าธรรมเนียม ค่าสินไหมทดแทนซึ่งลูกหนี้ค้างชำระ ค่าเบี้ยประกันภัย ค่าปรับ ค่าใช้จ่ายในการติดตามทวงถามบังคับชำระหนี้ ตลอดจนค่าภาระติดพันอันเป็นอุปกรณ์แห่งหนี้ของลูกหนี้ และค่าใช้จ่ายอื่นใดตามสัญญาดังกล่าวให้แก่ผู้ให้เช่าซื้อจนครบถ้วนทันทีที่ได้รับการบอกกล่าวเป็นหนังสือนั้น หากผู้ค้ำประกันไม่ชำระหนี้และเงินอื่นใดให้ครบถ้วน ผู้ค้ำประกันจะต้องรับผิดในดอกเบี้ยผิดนัดนับแต่วันที่หนี้ถึงกำหนดชำระจนกว่าจะได้ชำระหนี้ทั้งสิ้นให้ครบถ้วน ในอัตราเท่ากับอัตราดอกเบี้ยผิดนัดสูงสุดเท่าที่กฎหมายที่เกี่ยวข้องจะกำหนดให้นำมาใช้บังคับได้แก่หนี้เงิน
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">3.</span>
            <div className="flex-1">
              สัญญาฉบับนี้มีผลบังคับใช้ตั้งแต่วันที่สัญญาค้ำประกันมีผลบังคับจนกว่าหนี้ใดๆ และทั้งปวงซึ่งลูกหนี้มีอยู่กับผู้ให้เช่าซื้อภายใต้สัญญาดังกล่าวจะได้มีการชำระจนครบถ้วนหรือเมื่อหนี้ทั้งหมดภายใต้สัญญาดังกล่าวได้ระงับไป
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">4.</span>
            <div className="flex-1">
              ผู้ค้ำประกันตกลงสละข้อต่อสู้ตามที่กำหนดไว้ในมาตรา 293, 296, 684, 687 และ 697 แห่งประมวลกฎหมายแพ่งและพาณิชย์
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">5.</span>
            <div className="flex-1">
              ในกรณีที่ผู้ค้ำประกันเป็นนิติบุคคล ให้ข้อตกลงในข้อ 5 นี้ มีผลบังคับใช้ด้วย กล่าวคือ
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ก.</span>
                  <div className="flex-1">ผู้ค้ำประกันตกลงเข้าผูกพันตนรับผิดต่อผู้ให้เช่าซื้อในหนี้ของลูกหนี้อย่างลูกหนี้ร่วม</div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ข.</span>
                  <div className="flex-1">ผู้ค้ำประกันตกลงสละข้อต่อสู้ตามที่กำหนดไว้ในมาตรา 688, 689 และ 690 แห่งประมวลกฎหมายแพ่งและ พาณิชย์เป็นการเพิ่มเติมนอกเหนือจากการตกลงสละข้อต่อสู้ตามข้อ 4 ของสัญญานี้</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">6.</span>
            <div className="flex-1">
              เงินจำนวนใดๆ ที่ผู้ค้ำประกันต้องชำระแก่ผู้ให้เช่าซื้อภายใต้หรือตามสัญญานี้จะต้องชำระโดยครบถ้วนโดยไม่ให้มีการหักเงินจำนวนใดๆ ไว้ หรือนำไปหักกลบลบหนี้กับหนี้จำนวนอื่นใดทั้งสิ้น รวมถึงเงินภาษีใดๆ ด้วย เว้นแต่จะได้มีกฎหมายกำหนดไว้เป็นการเฉพาะหรือได้ตกลงกันเป็นอย่างอื่นเป็นลายลักษณ์อักษรระหว่างคู่สัญญาทั้งสามฝ่าย
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">7.</span>
            <div className="flex-1">
              ภายในขอบเขตของกฎหมาย และ/หรือ กฎระเบียบที่เกี่ยวข้อง ผู้ให้เช่าซื้อมีสิทธิที่จะกระทำการดังต่อไปนี้และผู้ค้ำประกันยินยอมตกลงด้วยกับการกระทำการเช่นว่านี้ ไม่ว่าจะได้มีการแจ้งหรือไม่ได้แจ้งแก่ผู้ค้ำประกันทราบก็ตามและตกลงมิให้ถือเอาการกระทำการเช่นว่านี้ของผู้ให้เช่าซื้อเป็นเหตุปลดเปลื้องความรับผิดชอบของผู้ค้ำประกันตามสัญญานี้ไม่ว่าบางส่วนหรือทั้งหมดเป็นอันขาด ได้แก่
            </div>
          </div>
        </div>

        <PageFooter pageNum={2} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 3 */}
      <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
        <PageHeader />

        <div className="mt-8 text-justify">
          <div className="flex gap-2 mb-4">
            <span className="shrink-0 w-6 opacity-0">7.</span>
            <div className="flex-1">
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ก.</span>
                  <div className="flex-1">ผ่อนเวลาชำระหนี้หรือขยายระยะเวลาการชำระหนี้ตามสัญญาดังกล่าวให้แก่ลูกหนี้</div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ข.</span>
                  <div className="flex-1">ปลดหนี้หรือยินยอมให้พ้นความรับผิดไม่ว่าบางส่วนหรือทั้งหมดแก่ผู้ค้ำประกันรายอื่นๆ หรือบุคคลใดๆ ก็ตาม ซึ่งต้องหรืออาจต้องรับผิดในหนี้เงินส่วนใดๆ หรือทั้งปวงของลูกหนี้ที่มีต่อผู้ให้เช่าซื้อ (เพื่อมิให้เป็นที่สงสัย ให้รวมถึงหนี้หรือความรับผิดของผู้ค้ำประกันเองภายใต้สัญญาอื่นด้วย) ซึ่งรวมถึงแต่ไม่จำกัดเพียงการปลดจำนอง จำนำ หรือหลักประกันอื่นใดไม่ว่าบางส่วนหรือทั้งหมดอันผู้ให้เช่าซื้อได้รับไว้เป็นหลักประกันเพื่อการชำระหนี้ใดๆ ภายใต้สัญญาเช่าซื้อ และ/หรือ สัญญาให้สินเชื่อ</div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ค.</span>
                  <div className="flex-1">ได้มาซึ่งหลักประกัน การค้ำประกัน ข้อตกลงรับผิดชดใช้ค่าเสียหายโดยประการใดๆ เป็นการเพิ่มเติม จากบุคคลใดๆ ก็ตามเพื่อหรือเกี่ยวกับการชำระหนี้ใดๆ ภายใต้สัญญาเช่าซื้อ และ/หรือ สัญญาให้สินเชื่อ</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">8.</span>
            <div className="flex-1">
              สัญญาฉบับนี้เป็นการค้ำประกันเพิ่มเติม และย่อมไม่ส่งผลกระทบใดๆ แก่หลักประกัน การค้ำประกัน ข้อตกลงรับผิดชดใช้ค่าเสียหาย สิทธิ หรือการเยียวยาใดๆ ที่ผู้ให้เช่าซื้อมีอยู่หรือได้รับมา
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">9.</span>
            <div className="flex-1">
              สัญญาฉบับนี้ย่อมมีผลเนื่อต่อไปอย่างสมบูรณ์ภายใต้กฎหมายที่บังคับใช้ แม้ว่าลูกหนี้ และ/หรือ ผู้ให้เช่าซื้อจะได้เข้าสู่กระบวนการชำระบัญชี ล้มละลาย หรือตกเป็นบุคคลไร้ความสามารถ
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">10.</span>
            <div className="flex-1">
              การเลิกสัญญาฉบับนี้ย่อมทำได้แต่โดยการตกลงเลิกสัญญาเป็นลายลักษณ์อักษร โดยผู้ให้เช่าซื้อเท่านั้น เว้นแต่สัญญานี้จะได้สิ้นสุดลงเนื่องจากหนี้ใดๆ และทั้งปวงซึ่งลูกหนี้มีอยู่กับผู้ให้เช่าซื้อภายใต้สัญญาเช่าซื้อ และ/หรือ สัญญาให้สินเชื่อ จะได้มีการชำระจนครบถ้วนหรือเมื่อหนี้ทั้งหมดภายใต้สัญญาได้ระงับไป ในกรณีที่ผู้ให้เช่าซื้อได้ตกลงเลิกสัญญาเป็นลายลักษณ์อักษร โดยผู้ค้ำประกันย่อมมิอาจยังคงต้องรับผิดในหนี้ใดๆ และทั้งปวงซึ่งลูกหนี้มีอยู่กับผู้ให้เช่าซื้อภายใต้สัญญาเช่าซื้อ และ/หรือ สัญญาให้สินเชื่อ จนถึงวันที่ได้มีการเลิกสัญญานี้ ทั้งนี้ ตามข้อกำหนดและเงื่อนไขของสัญญานี้
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">11.</span>
            <div className="flex-1">
              ผู้ค้ำประกันขอรับรองและรับประกันว่า
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ก.</span>
                  <div className="flex-1">สัญญาฉบับนี้เป็นเอกสารที่สมบูรณ์ ถูกต้อง มีผลผูกพัน และใช้บังคับกับผู้ค้ำประกันได้ตามข้อกำหนดของสัญญาฉบับนี้</div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ข.</span>
                  <div className="flex-1">ผู้ค้ำประกันมีอำนาจและคุณสมบัติตามกฎหมายที่บังคับใช้ทุกประการ ในการเข้าทำสัญญาฉบับนี้ และดำเนินการต่างๆ ตามที่ระบุไว้ หรือที่ผู้ค้ำประกันต้องทำภายใต้สัญญานี้</div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ค.</span>
                  <div className="flex-1">ผู้ค้ำประกันไม่ได้ดำเนินการทางกฎหมายหรือเริ่มกระบวนการที่เกี่ยวข้องใดๆ ในการเลิกบริษัท ปรับโครงสร้างหนี้ แต่งตั้งผู้พิทักษ์ทรัพย์ พื้นฟูกิจการ หรือการดำเนินการใดๆ ที่คล้ายกันอันเกี่ยวข้องกับผู้ค้ำประกัน หรือทรัพย์สินหรือรายได้ใดๆ ของผู้ค้ำประกัน</div>
                </div>
                <div className="flex gap-2 text-justify mb-4">
                  <span className="shrink-0 w-6">ง.</span>
                  <div className="flex-1">ในการเข้าทำสัญญานี้ การใช้สิทธิ และการดำเนินการต่างๆ ภายใต้สัญญานี้ของผู้ค้ำประกัน</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={3} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 4 */}
      <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
        <PageHeader />

        <div className="mt-8">
          {/* Continuation of clause 11 ง sub-items */}
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(1)</span>
              <div className="flex-1">ไม่เป็นการขัดต่อกฎหมาย กฎระเบียบ ข้อบังคับ หรือการได้รับมอบอำนาจใดๆ ของผู้ค้ำประกัน</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(2)</span>
              <div className="flex-1">ไม่เป็นการละเมิดหรือขัดต่อสัญญาหรือหนี้ที่ผูกพันใดๆ ของผู้ค้ำประกัน หรือซึ่งมีอยู่เหนือทรัพย์สินหรือรายได้ของผู้ค้ำประกัน</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(3)</span>
              <div className="flex-1">ไม่ทำให้ภาระหนี้ที่ผู้ค้ำประกันมีอยู่ ภายใต้สัญญาใดๆ ของผู้ค้ำประกันต้องการปฏิบัติหรือชำระก่อนกำหนดเดิม หรือถูกยกเลิกเพิกถอน</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(4)</span>
              <div className="flex-1">ไม่ก่อให้เกิดการกระทำหรือเหตุใดๆ อันจะทำให้เกิดการผิดนัด การชำระหนี้ก่อนกำหนด การผิดสัญญา หรือการยกเลิกเพิกถอนซึ่งสัญญาใดๆ ที่ผู้ค้ำประกันเป็นคู่สัญญาอยู่ หรือมีภาระหน้าที่อยู่</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-8">(5)</span>
              <div className="flex-1">ไม่มีการฟ้องร้องคดี การดำเนินคดี อนุญาโตตุลาการ หรือการดำเนินกระบวนการทางศาลหรือทางปกครองใดๆ อยู่แก่ผู้ค้ำประกัน ทรัพย์สินของผู้ค้ำประกัน หรือรายได้ของผู้ค้ำประกัน</div>
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <div className="flex gap-2">
              <span className="shrink-0 w-6">จ.</span>
              <div className="flex-1">ผู้ค้ำประกันได้ปฏิบัติตามกฎหมายที่บังคับใช้ทุกประการในการดำเนินธุรกิจของตน</div>
            </div>
            <div className="flex gap-2">
              <span className="shrink-0 w-6 mb-4">ฉ.</span>
              <div className="flex-1">ไม่มีเหตุใดๆ ที่อาจคาดหมายได้ว่าผู้ค้ำประกันจะไม่สามารถชำระหนี้ของตนได้ เมื่อหนี้นั้นถึงกำหนดชำระ</div>
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">12.</span>
            <div className="flex-1">
              ผู้ให้เช่าซื้อมีสิทธิที่จะ โอนสิทธิของตนภายใต้สัญญานี้ให้แก่บุคคลใดๆ ก็ได้โดยไม่ต้องบอกกล่าวหรือขอความยินยอมจากผู้ค้ำประกันหรือลูกหนี้ ส่วนหน้าที่ของผู้ค้ำประกันภายใต้สัญญานี้ย่อมมีผลผูกพันผู้แทนตามกฎหมายของผู้ค้ำประกันรวมถึงเจ้าหน้าที่กรงานพิทักษ์ทรัพย์ด้วย โดยหน้าที่ของผู้ค้ำประกันภายใต้สัญญานี้ไม่สามารถโอนแก่บุคคลได้ เว้นแต่จะได้รับความยินยอมล่วงหน้าเป็นลายลักษณ์อักษรจากผู้ให้เช่าซื้อ
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">13.</span>
            <div className="flex-1">
              ผู้ค้ำประกันตกลงและยอมรับว่าในกรณีที่ผู้ให้เช่าซื้อไม่ได้ใช้หรือความล่าช้าของผู้ให้เช่าซื้อในการใช้สิทธิ อำนาจหรือประโยชน์ใดภายใต้สัญญานี้ ไม่ถือเป็นการสละสิทธิในเรื่องดังกล่าว และการใช้สิทธิแต่เพียงบางส่วน หรือการใช้สิทธิโดยบอกทวง ย่อมไม่เป็นการตัดสิทธิผู้ให้เช่าซื้อในอันที่จะใช้สิทธิอื่นๆ หรือสิทธิเดิมนั้นอีก
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">14.</span>
            <div className="flex-1">
              การแก้ไขสัญญานี้ การสละสิทธิ์ ให้กระทำเป็นลายลักษณ์อักษร หรือให้ความยินยอมใดๆ ภายใต้สัญญานี้ จะต้องเป็นการตกลงร่วมกันระหว่างผู้สัญญาทั้งสามฝ่ายเป็นลายลักษณ์อักษร (เว้นแต่สัญญาฉบับนี้จะกำหนดไว้เป็นอย่างอื่น)
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">15.</span>
            <div className="flex-1">
              การติดต่อหรือบอกกล่าวซึ่งทำขึ้น โดยคู่สัญญาฝ่ายหนึ่งและส่งไปยังคู่สัญญาอีกฝ่ายหนึ่งให้ทำเป็นหนังสือ หากมิได้ระบุไว้เป็นอย่างอื่นอาจส่งโดยทางไปรษณีย์ ทางไปรษณีย์อิเล็กทรอนิกส์ หรือให้คนนำไปส่งเองก็ดี ให้ส่งไปยังคู่สัญญาอีกฝ่ายหนึ่ง ตามที่อยู่หรือหมายเลขที่ได้ระบุไว้ในข้อนี้ (เว้นแต่คู่สัญญาฝ่ายใดฝ่ายหนึ่งจะได้แจ้งที่อยู่อื่นใดซึ่งได้มีการระบุ โดยการแจ้งเป็นหนังสือไปยังอีกฝ่ายหนึ่งล่วงหน้า 7 (เจ็ด) วันก่อนส่งคำบอกกล่าว)
            </div>
          </div>
        </div>

        <PageFooter pageNum={4} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 5 */}
      <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
        <PageHeader />

        <div className="mt-8">
          <div className="mb-4 space-y-4">
            {data.guarantors.map((guarantor, idx) => (
              <div key={idx}>
                <div className="font-bold mb-1">ในกรณีของผู้ค้ำประกัน:</div>
                <div><Highlight>{guarantor.name}</Highlight></div>
                <div>ที่อยู่: เลขที่ <Highlight>{stripAddressPrefix(guarantor.address)}</Highlight></div>
                <div>หมายเลขโทรศัพท์: <Highlight>{formatPhoneNumber(guarantor.phone) || '-'}</Highlight></div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="font-bold mb-1 ">ในกรณีของผู้ให้เช่าซื้อฝ่ายที่ 1:</div>
            <div><Highlight>{data.lenderCompany}</Highlight></div>
            <div>ที่อยู่: เลขที่ <Highlight>{stripAddressPrefix(data.lenderAddress)}</Highlight> รหัสไปรษณีย์ 10270</div>
            <div>หมายเลขโทรศัพท์: <Highlight>{formatPhoneNumber(data.lenderPhone)}</Highlight></div>
          </div>

          <div className="mb-4">
            <div className="font-bold mb-1 ">ในกรณีของผู้ให้เช่าซื้อฝ่ายที่ 2:</div>
            <div><Highlight>{data.borrowerCompany}</Highlight></div>
            <div>ที่อยู่: เลขที่ <Highlight>{stripAddressPrefix(data.borrowerAddress)}</Highlight> รหัสไปรษณีย์ 10240</div>
            <div>หมายเลขโทรศัพท์: <Highlight>{formatPhoneNumber(data.borrowerPhone)}</Highlight></div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">16.</span>
            <div className="flex-1">
              การติดต่อหรือคำบอกกล่าวจากผู้ให้เช่าซื้อไปยังผู้ค้ำประกัน ให้ถือว่าผู้ค้ำประกันได้รับโดยถูกต้องแล้ว เมื่อ
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ก.</span>
                  <div className="flex-1">ในกรณีที่ส่งโดยไปรษณีย์ เมื่อมีการส่ง หรือ</div>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-6">ข.</span>
                  <div className="flex-1">ในกรณีที่ทำเป็นหนังสือ เมื่อส่งไปถึงที่อยู่ของผู้ค้ำประกันดังกล่าวไว้ในข้อ 16 ของสัญญาฉบับนี้ หรือเมื่อครบกำหนด 3 (สาม) วัน นับจากวันที่ได้ส่งทางไปรษณีย์พร้อมปิดซองตราไปรษณีย์ถึงผู้ค้ำประกันแล้ว และแม้หากว่าส่งให้ไม่ได้เพราะผู้ค้ำประกันย้ายที่อยู่ หรือที่อยู่ที่กล่าวนี้เปลี่ยนแปลงไป หรือถูกรื้อถอนไป โดยผู้ค้ำประกันไม่ได้แจ้งการย้าย หรือการเปลี่ยนแปล หรือการรื้อถอนนั้นเป็นหนังสือต่อผู้ให้เช่าซื้อ หรือการส่งโทรพิมพ์ หรือโทรสาร หรือจดหมายอิเล็กทรอนิกส์ตามหมายเลขหรือที่อยู่ที่ผู้ค้ำประกันแจ้ง ให้ผู้ให้เช่าซื้อทราบ ให้ถือว่าผู้ค้ำประกันได้รับทราบข้อความตามหนังสือ หรือโทรพิมพ์ หรือโทรสาร หรือจดหมายอิเล็กทรอนิกส์นั้นแล้ว</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">17.</span>
            <div className="flex-1">
              ทั้งนี้ การติดต่อหรือบอกกล่าวจากลูกหนี้ไปยังผู้ให้เช่าซื้อ จะมีผลสมบูรณ์ต่อเมื่อผู้ให้เช่าซื้อได้รับทราบแล้วเท่านั้น
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">18.</span>
            <div className="flex-1">
              หากข้อสัญญาหรือข้อกำหนดข้อใดข้อหนึ่งภายใต้สัญญานี้ไม่สมบูรณ์ เป็นโมฆะ ขัดต่อกฎหมาย หรือไม่อาจบังคับได้ตามกฎหมาย ไม่ว่าในกรณีใดๆ ให้ถือว่าข้อสัญญาหรือข้อกำหนดอื่นในสัญญานี้ ยังคงมีผลใช้บังคับได้ตามกฎหมาย
            </div>
          </div>
        </div>

        <PageFooter pageNum={5} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 6 */}
      <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
        <PageHeader />

        <div className="mt-8">
          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">19.</span>
            <div className="flex-1">
              ข้อสัญญาในสัญญานี้ที่ต้องห้าม หรือมิอาจใช้บังคับได้ในเขตอำนาจศาลใด ให้ถือว่าสัญญานั้นต้องห้าม หรือมิอาจใช้บังคับได้เฉพาะในเขตอำนาจศาลนั้นเท่านั้น นอกจากนี้ การต้องห้าม หรือมิอาจใช้บังคับได้ดังกล่าวจะไม่เป็นเหตุให้ความสมบูรณ์ของข้อสัญญาข้ออื่นต้องเสื่อมเสียตามไปด้วย และมิให้ถือว่าข้อสัญญาข้อที่ต้องห้ามหรือมิอาจใช้บังคับได้นั้นจะถูกต้องห้าม หรือมิอาจใช้บังคับได้ในเขตอำนาจศาลอื่นๆ ตามไปด้วย ผู้ค้ำประกันสละสิทธิ (เพียงเท่าที่กฎหมายอนุญาตให้ทำได้) ในการบังคับใช้บทบัญญัติของกฎหมายซึ่งเป็นเหตุให้ข้อสัญญาใดๆ ของสัญญานี้เป็นอันต้องห้าม หรือมิอาจใช้บังคับได้
            </div>
          </div>

          <div className="flex gap-2 text-justify mb-4">
            <span className="shrink-0 w-6">20.</span>
            <div className="flex-1">
              ให้สัญญานี้อยู่ภายใต้บังคับและตีความตามกฎหมายไทย โดยให้ศาลไทยเป็นศาลอันมีเขตอำนาจแก้กรณี
            </div>
          </div>
        </div>

        <PageFooter pageNum={6} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 7 - Signature Page 1 */}
      <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
        <PageHeader />

        <div className="mt-4">
          <div className="indent-10 mb-6">
            สัญญาฉบับนี้ทำขึ้นมา 3 (สาม) ฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านข้อความในสัญญาและเข้าใจในสัญญาเพื่อเป็นหลักฐานในการทำสัญญานี้ คู่สัญญาจึงลงนามในสัญญาฉบับนี้ต่อหน้าพยาน ณ วันที่ซึ่งได้ระบุไว้ในหน้าแรกของสัญญาฉบับนี้
          </div>

          <div className="border border-black text-[13px] font-bold">
            <div className="grid grid-cols-2 divide-x divide-black">
              {/* Left: Lender 1 */}
              <div className="p-6 flex flex-col min-h-[600px]">
                <div className="flex-1 pt-4 space-y-16">
                  <div className="font-bold text-[13px] text-left h-[50px] flex flex-col justify-center">
                    <div>ผู้ให้เช่าซื้อฝ่ายที่ 1 :</div>
                    <Highlight>{data.lenderCompany}</Highlight>
                  </div>

                  <div className="space-y-12">
                    {data.lenderDirectors.split(/\s*และ\s*/).map((sig, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="border-b border-black w-full h-8"></div>
                        <div className="text-center w-full">
                          ชื่อ: <Highlight>{sig.trim()}</Highlight>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-left">
                    <div className="font-bold">ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                    <div className="font-bold"><Highlight>{data.lenderCompany}</Highlight></div>
                  </div>
                </div>

                <div className="mt-auto pt-8 space-y-4">
                  <div>พยาน:</div>
                  <div className="border-b border-black w-full h-8"></div>
                  <div className="flex justify-between px-4">
                    <span>(</span>
                    <span className="flex-1 border-b border-black mx-4 mb-1"></span>
                    <span>)</span>
                  </div>
                </div>
              </div>

              {/* Right: Guarantor */}
              <div className="p-6 flex flex-col min-h-[600px]">
                <div className="flex-1 pt-4 space-y-16">
                  {data.guarantors.map((guarantor, idx) => {
                    const isCorporate = guarantor.type === 'company' || guarantor.type === 'partnership';
                    const signatories = guarantor.directors?.split(/\s*และ\s*|,\s*/) || [guarantor.name];

                    return (
                      <div key={idx} className="space-y-16 pb-8 border-b border-gray-100 last:border-0">
                        <div className="font-bold text-[13px] text-left h-[50px] flex flex-col justify-center">
                          <div>ผู้ค้ำประกันคนที่ {idx + 1} :</div>
                          <Highlight>{guarantor.name}</Highlight>
                        </div>

                        {isCorporate ? (
                          <div className="space-y-12">
                            {signatories.map((sig, sIdx) => (
                              <div key={sIdx} className="space-y-2">
                                <div className="border-b border-black w-full h-8"></div>
                                <div className="text-center w-full">
                                  ( ชื่อ: <Highlight>{sig.trim()}</Highlight> )
                                </div>
                              </div>
                            ))}
                            <div className="text-left">
                              <div className="font-bold">ตำแหน่ง: {guarantor.type === 'partnership' ? 'หุ้นส่วนผู้จัดการ' : 'กรรมการผู้มีอำนาจลงนาม'}</div>
                              <div className="font-bold"><Highlight>{guarantor.name}</Highlight></div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="border-b border-black w-full h-8"></div>
                            <div className="text-center w-full">
                              ( ชื่อ: <Highlight>{guarantor.name}</Highlight> )
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-auto pt-8 space-y-4">
                  <div className="font-bold">พยาน:</div>
                  <div className="flex flex-col items-center">
                    <div className="border-b border-black w-[80%] h-12 mb-1"></div>
                    <div className="text-center">(<span className="inline-block w-[150px]"></span>)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={7} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 8 - Signature Page 2 (Lessor 2) */}
      <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
        <PageHeader />

        <div className="mt-8 border border-black text-[13px] font-bold">
          <div className="grid grid-cols-2 divide-x divide-black">
            <div className="p-6 min-h-[600px] flex flex-col">
              <div className="flex-1 mt-4 space-y-16">
                <div className="font-bold text-[13px] text-left h-[50px] flex flex-col justify-center">
                  <div>ผู้ให้เช่าซื้อฝ่ายที่ 2:</div>
                  <Highlight>{data.borrowerCompany}</Highlight>
                </div>
                <div className="space-y-12">
                  {data.borrowerDirectors.split(/\s*และ\s*/).map((sig, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="border-b border-black w-full h-8"></div>
                      <div className="text-center w-full">
                        ชื่อ: <Highlight>{sig.trim()}</Highlight>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 text-left">
                    <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                    <div className="font-bold"><Highlight>{data.borrowerCompany}</Highlight></div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 space-y-4">
                <div>พยาน:</div>
                <div className="border-b border-black w-full h-8"></div>
                <div className="flex justify-between px-4">
                  <span>(</span>
                  <span className="flex-1 border-b border-black mx-4 mb-1"></span>
                  <span>)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Empty */}
            <div className="p-4 space-y-12">
            </div>
          </div>
        </div>

        <PageFooter pageNum={8} />
      </div>

      {/* Individual Status Confirmation and Consent Pages */}
      {data.guarantors.filter(g => g.type === 'person' || !g.type).map((guarantor, idx) => (
        <React.Fragment key={idx}>
          {/* Page Break for Print */}
          <div className="hidden print:block page-break"></div>

          {/* Status Confirmation Page */}
          <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
            <PageHeader />

            <div className="mt-8">
              <div className="text-center font-bold mb-8 mt-4">
                <h2 className="text-[13px]">หนังสือยืนยันสถานภาพและให้ความยินยอมของคู่สมรส</h2>
              </div>

              <div className="text-end mb-6 pr-4">
                เขียนที่ บริษัท อาไจล์ แอสเซ็ทส์ จำกัด
              </div>

              <div className="text-center mb-12">
                วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight>
              </div>

              <div className="indent-10 mb-8 leading-[1.8]">
                ข้าพเจ้า <Highlight>{guarantor.name}</Highlight> ผู้ถือบัตรประจำตัวประชาชนเลขที่ <Highlight>{formatThaiId(guarantor.idCard)}</Highlight> มีที่อยู่ตามทะเบียนบ้านเลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(guarantor.address, guarantor.postalCode))}</Highlight> ("ผู้ค้ำประกัน") ขอยืนยันว่าในขณะที่ข้าพเจ้าทำนิติกรรมใดๆ กับบริษัทฯ ข้าพเจ้าไม่เป็นบุคคลล้มละลาย หรือถูกศาลพิทักษ์ทรัพย์เด็ดขาด หรือพิทักษ์ทรัพย์ชั่วคราว และข้าพเจ้าขอรับรองว่าข้าพเจ้า <span className="font-bold underline">{guarantor.isMarried ? 'ได้' : 'มิได้'}</span> ทำการสมรสโดยจดทะเบียน
              </div>

              <div className="flex flex-col items-center gap-16 mt-32">
                {/* Guarantor Signature Row */}
                <div className="flex flex-col items-center">
                  <div className="flex items-end w-fit">
                    <span className="w-32 text-right whitespace-nowrap">ลงชื่อ</span>
                    <div className="border-b border-black border-dotted w-72 mx-1 mb-[2px]"></div>
                    <span className="w-32 text-left whitespace-nowrap">ผู้ค้ำประกัน</span>
                  </div>
                  <div className="mt-4">( <Highlight>{guarantor.name}</Highlight> )</div>
                </div>

                {/* Witness 1 Signature Row */}
                <div className="flex flex-col items-center">
                  <div className="flex items-end w-fit">
                    <span className="w-32 text-right whitespace-nowrap">ลงชื่อ</span>
                    <div className="border-b border-black border-dotted w-72 mx-1 mb-[2px]"></div>
                    <span className="w-32 text-left whitespace-nowrap">พยาน</span>
                  </div>
                  <div className="mt-4 text-center w-full">(........................................................)</div>
                </div>

                {/* Witness 2 Signature Row */}
                <div className="flex flex-col items-center">
                  <div className="flex items-end w-fit">
                    <span className="w-32 text-right whitespace-nowrap">ลงชื่อ</span>
                    <div className="border-b border-black border-dotted w-72 mx-1 mb-[2px]"></div>
                    <span className="w-32 text-left whitespace-nowrap">พยาน</span>
                  </div>
                  <div className="mt-4 text-center w-full">(........................................................)</div>
                </div>
              </div>
            </div>

            <PageFooter pageNum={totalPages - data.guarantors.filter(g => g.type === 'person' || !g.type).slice(data.guarantors.filter(g => g.type === 'person' || !g.type).indexOf(guarantor)).reduce((sum, g) => sum + (g.isMarried ? 2 : 1), 0) + 1} />
          </div>

          {guarantor.isMarried && (
            <>
              {/* Page Break for Print */}
              <div className="hidden print:block page-break"></div>

              {/* Spousal Consent Page */}
              <div className="print-page relative bg-white shadow-lg print:shadow-none min-h-[1050px] p-24">
                <PageHeader />

                <div className="mt-8">
                  <div className="text-center font-bold mb-8 mt-4">
                    <h2 className="text-[13px]">หนังสือยินยอมให้คู่สมรสทำนิติกรรม</h2>
                  </div>

                  <div className="text-end mb-6 pr-4">
                    เขียนที่ บริษัท อาไจล์ แอสเซ็ทส์ จำกัด
                  </div>

                  <div className="text-center mb-12">
                    วันที่ <Highlight>{formatThaiDate(data.effectiveDate)}</Highlight>
                  </div>

                  <div className="leading-[1.8]">
                    <div className="indent-10">
                      โดยหนังสือฉบับนี้ข้าพเจ้า <Highlight>{guarantor.spouseName}</Highlight> เลขประจำตัวประชาชน <Highlight>{formatThaiId(guarantor.spouseIdCard)}</Highlight> มีที่อยู่ตามทะเบียนบ้านเลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(guarantor.spouseAddress, guarantor.spousePostalCode))}</Highlight> ซึ่งเป็นสามี/ภริยา ของ <Highlight>{guarantor.name}</Highlight>
                    </div>
                    <div className="indent-10">
                      ขอให้ความยินยอมโดยหนังสือนี้ว่าให้ <Highlight>{guarantor.name}</Highlight> สามี/ภริยา ของข้าพเจ้าทำนิติกรรม เป็นผู้ค้ำประกันการชำระหนี้ของบริษัท <Highlight>{data.refContractCompany}</Highlight> รวมถึงนิติกรรมต่างๆ กับ<Highlight>บริษัท อาไจล์ แอสเซ็ทส์ จำกัด และ บริษัท ฐิติกร จำกัด (มหาชน)</Highlight> ได้
                    </div>
                    <div className="indent-10">
                      การใดที่สามี/ภริยา ของข้าพเจ้าได้กระทำไป ข้าพเจ้าขอร่วมรับผิดในนิติกรรมนั้นเสมือนหนึ่งข้าพเจ้าได้กระทำเองทุกประการ
                    </div>
                    <div className="indent-10 mb-16">
                      เพื่อเป็นหลักฐาน จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-16 mt-32">
                    {/* Spouse Signature Row */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-end w-fit">
                        <span className="w-56 text-right whitespace-nowrap">ลงชื่อ</span>
                        <div className="border-b border-black border-dotted w-72 mx-1 mb-[2px]"></div>
                        <span className="w-56 text-left whitespace-nowrap text-[11px]">สามี/ภริยา ผู้ให้ความยินยอม</span>
                      </div>
                      <div className="mt-4">( <Highlight>{guarantor.spouseName}</Highlight> )</div>
                    </div>

                    {/* Witness 1 Signature Row */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-end w-fit">
                        <span className="w-56 text-right whitespace-nowrap">ลงชื่อ</span>
                        <div className="border-b border-black border-dotted w-72 mx-1 mb-[2px]"></div>
                        <span className="w-56 text-left whitespace-nowrap">พยาน</span>
                      </div>
                      <div className="mt-4 text-center w-full">(........................................................)</div>
                    </div>

                    {/* Witness 2 Signature Row */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-end w-fit">
                        <span className="w-56 text-right whitespace-nowrap">ลงชื่อ</span>
                        <div className="border-b border-black border-dotted w-72 mx-1 mb-[2px]"></div>
                        <span className="w-56 text-left whitespace-nowrap">พยาน</span>
                      </div>
                      <div className="mt-4 text-center w-full">(........................................................)</div>
                    </div>
                  </div>
                </div>

                <PageFooter pageNum={totalPages - data.guarantors.filter(g => g.type === 'person' || !g.type).slice(data.guarantors.filter(g => g.type === 'person' || !g.type).indexOf(guarantor)).reduce((sum, g) => sum + (g.isMarried ? 2 : 1), 0) + 2} />
              </div>
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
