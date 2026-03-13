import PageHeader from './PageHeader';
import type { GuaranteeData } from '../types/guarantee';

interface Props {
  data: GuaranteeData;
}

export default function GuaranteePreview({ data }: Props) {
  const Highlight = ({ children }: { children: React.ReactNode }) => (
    <span className="bg-yellow-200 print:bg-transparent px-1 rounded inline break-words">
      {children || '\u00A0'}
    </span>
  );

  const totalPages = 2; // Assuming 2 pages for now like the other contract

  const PageFooter = ({ pageNum }: { pageNum: number }) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
      <div>
        สัญญาค้ำประกัน เลขที่ <span className="bg-yellow-200 print:bg-transparent px-1 rounded">{data.contractNo || '\u00A0'}</span>
      </div>
      <div>
        page {pageNum} of {totalPages}
      </div>
    </div>
  );

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line">
      {/* Page 1 */}
      <div className="print-page relative">
        <PageHeader />

        {/* Hand-written text space (มีคู่สมรส) */}
        <div className="absolute top-12 left-[50%] text-blue-800 font-bold handwriting-simulation opacity-50">
           {/* Space replicating the handwritten text in the image */}
        </div>

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-xl">สัญญาค้ำประกัน</h2>
          <div className="mt-2 text-[14px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          สัญญาค้ำประกัน ("สัญญา") ฉบับนี้ทำขึ้นเพื่อให้มีผลใช้บังคับตั้งแต่วันที่ <Highlight>{data.effectiveDate}</Highlight> (<b>"วันที่สัญญาค้ำประกันมีผลบังคับ"</b>) โดยและระหว่าง
        </div>

        <div className="mb-4 pl-8 -indent-8">
          (1) <b><Highlight>{data.lenderCompany}</Highlight></b> (โดย<Highlight>{data.lenderDirectors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{data.lenderAddress}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{data.lenderTaxId}</Highlight> (<b>"ผู้ให้เช่าซื้อฝ่ายที่ 1"</b>)
        </div>

        <div className="mb-6 pl-8 -indent-8">
          (2) <b><Highlight>{data.borrowerCompany}</Highlight></b> (โดย<Highlight>{data.borrowerDirectors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{data.borrowerAddress}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{data.borrowerTaxId}</Highlight> (<b>"ผู้ให้เช่าซื้อฝ่ายที่ 2"</b>)
        </div>

        <div className="indent-10 mb-6">
          ซึ่ง (1) และ (2) จะเรียกรวมกันว่า <b>"ผู้ให้เช่าซื้อ"</b> ฝ่ายหนึ่ง
        </div>

        <div className="mb-6 pl-8 -indent-8">
          (3) <b><Highlight>{data.guarantorName}</Highlight></b> ผู้ถือบัตรประจำตัวประชาชนเลขที่ <Highlight>{data.guarantorIdCard}</Highlight> มีที่อยู่ตามทะเบียนบ้านเลขที่ <Highlight>{data.guarantorAddress}</Highlight> (<b>"ผู้ค้ำประกัน"</b>) อีกฝ่ายหนึ่ง
        </div>

        <div className="indent-10 mb-4 mt-8">
          ดังนั้น คู่สัญญาจึงได้ตกลงเข้าทำสัญญาฉบับนี้ขึ้นภายใต้ข้อตกลงและเงื่อนไขดังต่อไปนี้
        </div>

        <div className="mb-4 pl-8 -indent-8">
          1. ตามที่ผู้ให้เช่าซื้อและ<b>บริษัท <Highlight>{data.refContractCompany}</Highlight> (“ผู้เช่าซื้อ”)</b> ได้เข้าทำสัญญาเช่าซื้อเลขที่ <Highlight>{data.refContractNo}</Highlight> ลงวันที่ <Highlight>{data.refContractDate}</Highlight> ผู้ค้ำประกันยินยอมเข้าค้ำประกันการชำระหนี้อันครบถ้วนสมบูรณ์ ตรงต่อเวลาและเป็นไปตามข้อกำหนดและเงื่อนไขภายใต้สัญญาเช่าซื้อ โดยมีวงเงินค้ำประกันหนี้ตามสัญญาฉบับนี้รวมกันทั้งสิ้น<b>ไม่เกินจำนวน <Highlight>{data.guaranteeAmountNumber}</Highlight> บาท (<Highlight>{data.guaranteeAmountText}</Highlight>)</b> บวกด้วยดอกเบี้ย ดอกเบี้ยผิดนัด ค่าธรรมเนียม ค่าสินไหมทดแทนซึ่งผู้เช่าซื้อค้างชำระ ค่าเบี้ยประกันภัย ค่าปรับ ค่าใช้จ่ายในการติดตามทวงถาม บังคับชำระหนี้ ตลอดจนค่าภาระติดพันอันเป็นอุปกรณ์แห่งหนี้ของผู้เช่าซื้อและค่าใช้จ่ายอื่นใดตามสัญญาเช่าซื้อให้แก่ผู้ให้เช่าซื้อจนกว่าผู้ให้เช่าซื้อจะได้รับชำระหนี้ภายใต้สัญญาเช่าซื้อจนครบถ้วน
        </div>

        <PageFooter pageNum={1} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 2 */}
      <div className="print-page relative mt-8 print:mt-0">
        <PageHeader />
        
        <div className="mt-8">
           <div className="mb-4 pl-8 -indent-8">
             2. ถ้าผู้เช่าซื้อผิดนัดไม่ชำระหนี้ และ/หรือ ไม่สามารถชำระหนี้ตามสัญญาเช่าซื้อให้ผู้ให้เช่าซื้อไม่ว่าด้วยเหตุใดๆ ก็ตาม หรือกระทำให้ผู้ให้เช่าซื้อไม่ได้รับชำระหนี้อันเกิดจากสัญญาครบถ้วน และตามที่ระบุไว้ในสัญญาเช่าซื้อก็ดี และผู้ให้เช่าซื้อมีหนังสือบอกกล่าวไปยังผู้ค้ำประกันภายใน 60 (หกสิบ) วัน นับแต่วันที่ผู้เช่าซื้อผิดนัดแล้ว ผู้ค้ำประกันตกลงที่จะชำระหนี้อันค้างชำระและถึงกำหนดชำระทั้งสิ้น ซึ่งรวมไปถึงดอกเบี้ย ดอกเบี้ยผิดนัด ค่าธรรมเนียม ค่าสินไหมทดแทนซึ่งผู้เช่าซื้อค้างชำระ ค่าเบี้ยประกันภัย ค่าปรับ ค่าใช้จ่ายในการติดตามทวงถามบังคับชำระหนี้ ตลอดจนค่าภาระติดพันอันเป็นอุปกรณ์แห่งหนี้ของผู้เช่าซื้อ และค่าใช้จ่ายอื่นใดตามสัญญาเช่าซื้อให้แก่ผู้ให้เช่าซื้อจนครบถ้วนทันทีที่ได้รับการบอกกล่าวเป็นหนังสือนั้น หากผู้ค้ำประกันไม่ชำระหนี้และเงินอื่นใดให้ครบถ้วน ผู้ค้ำประกันจะต้องรับผิดในดอกเบี้ยผิดนัดนับแต่วันที่หนี้ถึงกำหนดชำระจนกว่าจะได้ชำระหนี้ทั้งสิ้นให้ครบถ้วน ในอัตราเท่ากับอัตราดอกเบี้ยผิดนัดสูงสุดเท่าที่กฎหมายที่เกี่ยวข้องจะกำหนดให้นำมาใช้บังคับได้แก่หนี้เงิน
           </div>

           <div className="mb-4 pl-8 -indent-8">
             3. สัญญาฉบับนี้มีผลบังคับใช้ตั้งแต่วันที่สัญญาค้ำประกันมีผลบังคับจนกว่าหนี้ใดๆ และทั้งปวงซึ่งผู้เช่าซื้อมีอยู่กับผู้ให้เช่าซื้อภายใต้สัญญาเช่าซื้อจะได้มีการชำระจนครบถ้วนหรือเมื่อหนี้ทั้งหมดภายใต้สัญญาดังกล่าวได้ระงับไป
           </div>

           <div className="mb-4 pl-8 -indent-8">
             4. ผู้ค้ำประกันตกลงสละข้อต่อสู้ตามที่กำหนดไว้ในมาตรา 293, 296, 684, 687 และ 697 แห่งประมวลกฎหมายแพ่งและพาณิชย์
           </div>

           <div className="mb-4 pl-8 -indent-8">
             5. ในกรณีที่ผู้ค้ำประกันเป็นนิติบุคคล ให้ข้อตกลงในข้อ 5 นี้ มีผลบังคับใช้ด้วย กล่าวคือ
             <div className="mt-1 pl-8 -indent-8">
               ก. ผู้ค้ำประกันตกลงเข้าผูกพันตนรับผิดต่อผู้ให้เช่าซื้อในหนี้ของผู้เช่าซื้ออย่างลูกหนี้ร่วม
             </div>
             <div className="mt-1 pl-8 -indent-8">
               ข. ผู้ค้ำประกันตกลงสละข้อต่อสู้ตามที่กำหนดไว้ในมาตรา 688, 689 และ 690 แห่งประมวลกฎหมายแพ่งและ พาณิชย์เป็นการเพิ่มเติมนอกเหนือจากการตกลงสละข้อต่อสู้ตามข้อ 4 ของสัญญานี้
             </div>
           </div>

           <div className="mb-4 pl-8 -indent-8">
             6. เงินจำนวนใดๆ ที่ผู้ค้ำประกันต้องชำระแก่ผู้ให้เช่าซื้อภายใต้หรือตามสัญญานี้จะต้องชำระโดยครบถ้วนโดยไม่ให้มีการหักเงินจำนวนใดๆ ไว้ หรือนำไปหักกลบลบหนี้กับหนี้จำนวนอื่นใดทั้งสิ้น รวมถึงเงินภาษีใดๆ ด้วย เว้นแต่จะได้มีกฎหมายกำหนดไว้เป็นการเฉพาะหรือได้ตกลงกันเป็นอย่างอื่นเป็นลายลักษณ์อักษรระหว่างคู่สัญญาทั้งสามฝ่าย
           </div>

           <div className="mb-4 pl-8 -indent-8">
             7. ภายในขอบเขตของกฎหมาย และ/หรือ กฎระเบียบที่เกี่ยวข้อง ผู้ให้เช่าซื้อมีสิทธิที่จะกระทำการดังต่อไปนี้และผู้ค้ำประกันยินยอมตกลงด้วยกับการกระทำการเช่นว่านี้ ไม่ว่าจะได้มีการแจ้งหรือไม่ได้แจ้งแก่ผู้ค้ำประกันทราบก็ตามและตกลงมิให้ถือเอาการกระทำการเช่นว่านี้ของผู้ให้เช่าซื้อเป็นเหตุปลดเปลื้องความรับผิดชอบของผู้ค้ำประกันตามสัญญานี้ไม่ว่าบางส่วนหรือทั้งหมดเป็นอันขาด ได้แก่
           </div>
        </div>



        <PageFooter pageNum={2} />
      </div>
    </div>
  );
}
