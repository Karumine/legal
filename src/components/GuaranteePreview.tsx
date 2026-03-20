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

  const totalPages = data.isMarried ? 10 : 9;

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
      <div className="print-page relative">
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

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 3 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="mt-8">
          {/* Continuation of clause 7 sub-items */}
          <div className="mb-4 pl-16 -indent-8">
            ก. ผ่อนเวลาชำระหนี้หรือขยายระยะเวลาการชำระหนี้ตามสัญญาเช่าซื้อให้แก่ผู้เช่าซื้อ
          </div>

          <div className="mb-4 pl-16 -indent-8">
            ข. ปลดหนี้หรือยินยอมให้พ้นความรับผิดไม่ว่าบางส่วนหรือทั้งหมดแก่ผู้ค้ำประกันรายอื่นๆ หรือบุคคลใดๆ ก็ตาม ซึ่งต้องหรืออาจต้องรับผิดในหนี้เงินส่วนใดๆ หรือทั้งปวงของผู้เช่าซื้อที่มีต่อผู้ให้เช่าซื้อ (เพื่อมิให้เป็นที่สงสัย ให้รวมถึงหนี้หรือความรับผิดของผู้ค้ำประกันเองภายใต้สัญญาอื่นด้วย) ซึ่งรวมถึงแต่ไม่จำกัดเพียงการปลดจำนอง จำนำ หรือหลักประกันอื่นใดไม่ว่าบางส่วนหรือทั้งหมดอันผู้ให้เช่าซื้อได้รับไว้เป็นหลักประกันเพื่อการชำระหนี้ใดๆ ภายใต้สัญญาเช่าซื้อและ/หรือ
          </div>

          <div className="mb-4 pl-16 -indent-8">
            ค. ได้มาซึ่งหลักประกัน การค้ำประกัน ข้อตกลงรับผิดชดใช้ค่าเสียหายโดยประการใดๆ เป็นการเพิ่มเติม จากบุคคลใดๆ ก็ตามเพื่อหรือเกี่ยวกับการชำระหนี้ใดๆ ภายใต้สัญญาเช่าซื้อ
          </div>

          <div className="mb-4 pl-8 -indent-8">
            8. สัญญาฉบับนี้เป็นการค้ำประกันเพิ่มเติม และย่อมไม่ส่งผลกระทบใดๆ แก่หลักประกัน การค้ำประกัน ข้อตกลงรับผิดชดใช้ค่าเสียหาย สิทธิ หรือการเยียวยาใดๆ ที่ผู้ให้เช่าซื้อมีอยู่หรือได้รับมา
          </div>

          <div className="mb-4 pl-8 -indent-8">
            9. สัญญาฉบับนี้ย่อมมีผลเนื่อต่อไปอย่างสมบูรณ์ภายใต้กฎหมายที่บังคับใช้ แม้ว่าผู้เช่าซื้อ และ/หรือ ผู้ให้เช่าซื้อจะได้เข้าสู่กระบวนการชำระบัญชี ล้มละลาย หรือตกเป็นบุคคลไร้ความสามารถ
          </div>

          <div className="mb-4 pl-8 -indent-8">
            10. การเลิกสัญญาฉบับนี้ย่อมทำได้แต่โดยการตกลงเลิกสัญญาเป็นลายลักษณ์อักษร โดยผู้ให้เช่าซื้อเท่านั้น เว้นแต่สัญญานี้จะได้สิ้นสุดลงเนื่องจากหนี้ใดๆ และทั้งปวงซึ่งผู้เช่าซื้อมีอยู่กับผู้ให้เช่าซื้อภายใต้สัญญาเช่าซื้อจะได้มีการชำระจนครบถ้วนหรือเมื่อหนี้ทั้งหมดภายใต้สัญญาเช่าซื้อได้ระงับไป ในกรณีที่ผู้ให้เช่าซื้อได้ตกลงเลิกสัญญาเป็นลายลักษณ์อักษร โดยผู้ค้ำประกันย่อมมิอาจยังคงต้องรับผิดในหนี้ใดๆ และทั้งปวงซึ่งผู้เช่าซื้อมีอยู่กับผู้ให้เช่าซื้อภายใต้สัญญาเช่าซื้อ จนถึงวันที่ได้มีการเลิกสัญญานี้ ทั้งนี้ ตามข้อกำหนดและเงื่อนไขของสัญญานี้
          </div>

          <div className="mb-4 pl-8 -indent-8">
            11. ผู้ค้ำประกันขอรับรองและรับประกันว่า
            <div className="mt-1 pl-8 -indent-8">
              ก. สัญญาฉบับนี้เป็นเอกสารที่สมบูรณ์ ถูกต้อง มีผลผูกพัน และใช้บังคับกับผู้ค้ำประกันได้ตามข้อกำหนดของสัญญาฉบับนี้
            </div>
            <div className="mt-1 pl-8 -indent-8">
              ข. ผู้ค้ำประกันมีอำนาจและคุณสมบัติตามกฎหมายที่บังคับใช้ทุกประการ ในการเข้าทำสัญญาฉบับนี้ และดำเนินการต่างๆ ตามที่ระบุไว้ หรือที่ผู้ค้ำประกันต้องทำภายใต้สัญญานี้
            </div>
            <div className="mt-1 pl-8 -indent-8">
              ค. ผู้ค้ำประกันไม่ได้ดำเนินการทางกฎหมายหรือเริ่มกระบวนการที่เกี่ยวข้องใดๆ ในการเลิกบริษัท ปรับโครงสร้างหนี้ แต่งตั้งผู้พิทักษ์ทรัพย์ พื้นฟูกิจการ หรือการดำเนินการใดๆ ที่คล้ายกันอันเกี่ยวข้องกับผู้ค้ำประกัน หรือทรัพย์สินหรือรายได้ใดๆ ของผู้ค้ำประกัน
            </div>
            <div className="mt-1 pl-8 -indent-8">
              ง. ในการเข้าทำสัญญานี้ การใช้สิทธิ และการดำเนินการต่างๆ ภายใต้สัญญานี้ของผู้ค้ำประกัน
            </div>
          </div>
        </div>

        <PageFooter pageNum={3} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 4 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="mt-8">
          {/* Continuation of clause 11 ง sub-items */}
          <div className="mb-4 pl-24 -indent-8">
            (1) ไม่เป็นการขัดต่อกฎหมาย กฎระเบียบ ข้อบังคับ หรือการได้รับมอบอำนาจใดๆ ของผู้ค้ำประกัน
          </div>

          <div className="mb-4 pl-24 -indent-8">
            (2) ไม่เป็นการละเมิดหรือขัดต่อสัญญาหรือหนี้ที่ผูกพันใดๆ ของผู้ค้ำประกัน หรือซึ่งมีอยู่เหนือทรัพย์สินหรือรายได้ของผู้ค้ำประกัน
          </div>

          <div className="mb-4 pl-24 -indent-8">
            (3) ไม่ทำให้ภาระหนี้ที่ผู้ค้ำประกันมีอยู่ ภายใต้สัญญาใดๆ ของผู้ค้ำประกันต้องการปฏิบัติหรือชำระก่อนกำหนดเดิม หรือถูกยกเลิกเพิกถอน
          </div>

          <div className="mb-4 pl-24 -indent-8">
            (4) ไม่ก่อให้เกิดการกระทำหรือเหตุใดๆ อันจะทำให้เกิดการผิดนัด การชำระหนี้ก่อนกำหนด การผิดสัญญา หรือการยกเลิกเพิกถอนซึ่งสัญญาใดๆ ที่ผู้ค้ำประกันเป็นคู่สัญญาอยู่ หรือมีภาระหน้าที่อยู่
          </div>

          <div className="mb-4 pl-24 -indent-8">
            (5) ไม่มีการฟ้องร้องคดี การดำเนินคดี อนุญาโตตุลาการ หรือการดำเนินกระบวนการทางศาลหรือทางปกครองใดๆ อยู่แก่ผู้ค้ำประกัน ทรัพย์สินของผู้ค้ำประกัน หรือรายได้ของผู้ค้ำประกัน
          </div>

          <div className="mb-4 pl-16 -indent-8">
            จ. ผู้ค้ำประกันได้ปฏิบัติตามกฎหมายที่บังคับใช้ทุกประการในการดำเนินธุรกิจของตน
          </div>

          <div className="mb-4 pl-16 -indent-8">
            ฉ. ไม่มีเหตุใดๆ ที่อาจคาดหมายได้ว่าผู้ค้ำประกันจะไม่สามารถชำระหนี้ของตนได้ เมื่อหนี้นั้นถึงกำหนดชำระ
          </div>

          <div className="mb-4 pl-8 -indent-8">
            12. ผู้ให้เช่าซื้อมีสิทธิที่จะ โอนสิทธิของตนภายใต้สัญญานี้ให้แก่บุคคลใดๆ ก็ได้โดยไม่ต้องบอกกล่าวหรือขอความยินยอมจากผู้ค้ำประกันหรือผู้เช่าซื้อ ส่วนหน้าที่ของผู้ค้ำประกันภายใต้สัญญานี้ย่อมมีผลผูกพันผู้แทนตามกฎหมายของผู้ค้ำประกันรวมถึงเจ้าหน้าที่กรงานพิทักษ์ทรัพย์ด้วย โดยหน้าที่ของผู้ค้ำประกันภายใต้สัญญานี้ไม่สามารถโอนแก่บุคคลได้ เว้นแต่จะได้รับความยินยอมล่วงหน้าเป็นลายลักษณ์อักษรจากผู้ให้เช่าซื้อ
          </div>

          <div className="mb-4 pl-8 -indent-8">
            13. ผู้ค้ำประกันตกลงและยอมรับว่าในกรณีที่ผู้ให้เช่าซื้อไม่ได้ใช้หรือความล่าช้าของผู้ให้เช่าซื้อในการใช้สิทธิ อำนาจหรือประโยชน์ใดภายใต้สัญญานี้ ไม่ถือเป็นการสละสิทธิในเรื่องดังกล่าว และการใช้สิทธิแต่เพียงบางส่วน หรือการใช้สิทธิโดยบอกทวง ย่อมไม่เป็นการตัดสิทธิผู้ให้เช่าซื้อในอันที่จะใช้สิทธิอื่นๆ หรือสิทธิเดิมนั้นอีก
          </div>

          <div className="mb-4 pl-8 -indent-8">
            14. การแก้ไขสัญญานี้ การสละสิทธิ์ ให้กระทำเป็นลายลักษณ์อักษร หรือให้ความยินยอมใดๆ ภายใต้สัญญานี้ จะต้องเป็นการตกลงร่วมกันระหว่างผู้สัญญาทั้งสามฝ่ายเป็นลายลักษณ์อักษร (เว้นแต่สัญญาฉบับนี้จะกำหนดไว้เป็นอย่างอื่น)
          </div>

          <div className="mb-4 pl-8 -indent-8">
            15. การติดต่อหรือบอกกล่าวซึ่งทำขึ้น โดยคู่สัญญาฝ่ายหนึ่งและส่งไปยังคู่สัญญาอีกฝ่ายหนึ่งให้ทำเป็นหนังสือ หากมิได้ระบุไว้เป็นอย่างอื่นอาจส่งโดยทางไปรษณีย์ ทางไปรษณีย์อิเล็กทรอนิกส์ หรือให้คนนำไปส่งเองก็ดี ให้ส่งไปยังคู่สัญญาอีกฝ่ายหนึ่ง ตามที่อยู่หรือหมายเลขที่ได้ระบุไว้ในข้อนี้ (เว้นแต่คู่สัญญาฝ่ายใดฝ่ายหนึ่งจะได้แจ้งที่อยู่อื่นใดซึ่งได้มีการระบุ โดยการแจ้งเป็นหนังสือไปยังอีกฝ่ายหนึ่งล่วงหน้า 7 (เจ็ด) วันก่อนส่งคำบอกกล่าว)
          </div>
        </div>

        <PageFooter pageNum={4} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 5 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="mt-8">
          {/* Contact details section */}
          <div className="mb-4">
            <div>ในกรณีของผู้ค้ำประกัน: <Highlight>{data.guarantorName}</Highlight></div>
            <div>ที่อยู่: <Highlight>{data.guarantorAddress}</Highlight></div>
          </div>

          <div className="mb-4">
            <div>ในกรณีของผู้ให้เช่าซื้อฝ่ายที่ 1: <Highlight>{data.lenderCompany}</Highlight></div>
            <div>ที่อยู่: <Highlight>{data.lenderAddress}</Highlight> รหัสไปรษณีย์ 10270</div>
            <div>หมายเลขโทรศัพท์: 098-283-7700</div>
          </div>

          <div className="mb-6">
            <div>ในกรณีของผู้ให้เช่าซื้อฝ่ายที่ 2: <Highlight>{data.borrowerCompany}</Highlight></div>
            <div>ที่อยู่: <Highlight>{data.borrowerAddress}</Highlight> รหัสไปรษณีย์ 10240</div>
            <div>หมายเลขโทรศัพท์: 02-310-7000</div>
          </div>

          <div className="mb-4 pl-8 -indent-8">
            16. การติดต่อหรือคำบอกกล่าวจากผู้ให้เช่าซื้อไปยังผู้ค้ำประกัน ให้ถือว่าผู้ค้ำประกันได้รับโดยถูกต้องแล้ว เมื่อ
            <div className="mt-1 pl-8 -indent-8">
              ก. ในกรณีที่ส่งโดยไปรษณีย์ เมื่อมีการส่ง หรือ
            </div>
            <div className="mt-1 pl-8 -indent-8">
              ข. ในกรณีที่ทำเป็นหนังสือ เมื่อส่งไปถึงที่อยู่ของผู้ค้ำประกันดังกล่าวไว้ในข้อ 16 ของสัญญาฉบับนี้ หรือเมื่อครบกำหนด 3 (สาม) วัน นับจากวันที่ได้ส่งทางไปรษณีย์พร้อมปิดซองตราไปรษณีย์ถึงผู้ค้ำประกันแล้ว และแม้หากว่าส่งให้ไม่ได้เพราะผู้ค้ำประกันย้ายที่อยู่ หรือที่อยู่ที่กล่าวนี้เปลี่ยนแปลงไป หรือถูกรื้อถอนไป โดยผู้ค้ำประกันไม่ได้แจ้งการย้าย หรือการเปลี่ยนแปล หรือการรื้อถอนนั้นเป็นหนังสือต่อผู้ให้เช่าซื้อ หรือการส่งโทรพิมพ์ หรือโทรสาร หรือจดหมายอิเล็กทรอนิกส์ตามหมายเลขหรือที่อยู่ที่ผู้ค้ำประกันแจ้ง ให้ผู้ให้เช่าซื้อทราบ ให้ถือว่าผู้ค้ำประกันได้รับทราบข้อความตามหนังสือ หรือโทรพิมพ์ หรือโทรสาร หรือจดหมายอิเล็กทรอนิกส์นั้นแล้ว
            </div>
          </div>

          <div className="mb-4 pl-8 -indent-8">
            17. ทั้งนี้ การติดต่อหรือบอกกล่าวจากผู้เช่าซื้อไปยังผู้ให้เช่าซื้อ จะมีผลสมบูรณ์ต่อเมื่อผู้ให้เช่าซื้อได้รับทราบแล้วเท่านั้น
          </div>

          <div className="mb-4 pl-8 -indent-8">
            18. หากข้อสัญญาหรือข้อกำหนดข้อใดข้อหนึ่งภายใต้สัญญานี้ไม่สมบูรณ์ เป็นโมฆะ ขัดต่อกฎหมาย หรือไม่อาจบังคับได้ตามกฎหมาย ไม่ว่าในกรณีใดๆ ให้ถือว่าข้อสัญญาหรือข้อกำหนดอื่นในสัญญานี้ ยังคงมีผลใช้บังคับได้ตามกฎหมาย
          </div>
        </div>

        <PageFooter pageNum={5} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 6 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="mt-8">
          <div className="mb-4 pl-8 -indent-8">
            19. ข้อสัญญาในสัญญานี้ที่ต้องห้าม หรือมิอาจใช้บังคับได้ในเขตอำนาจศาลใด ให้ถือว่าสัญญานั้นต้องห้าม หรือมิอาจใช้บังคับได้เฉพาะในเขตอำนาจศาลนั้นเท่านั้น นอกจากนี้ การต้องห้าม หรือมิอาจใช้บังคับได้ดังกล่าวจะไม่เป็นเหตุให้ความสมบูรณ์ของข้อสัญญาข้ออื่นต้องเสื่อมเสียตามไปด้วย และมิให้ถือว่าข้อสัญญาข้อที่ต้องห้ามหรือมิอาจใช้บังคับได้นั้นจะถูกต้องห้าม หรือมิอาจใช้บังคับได้ในเขตอำนาจศาลอื่นๆ ตามไปด้วย ผู้ค้ำประกันสละสิทธิ (เพียงเท่าที่กฎหมายอนุญาตให้ทำได้) ในการบังคับใช้บทบัญญัติของกฎหมายซึ่งเป็นเหตุให้ข้อสัญญาใดๆ ของสัญญานี้เป็นอันต้องห้าม หรือมิอาจใช้บังคับได้
          </div>

          <div className="mb-4 pl-8 -indent-8">
            20. ให้สัญญานี้อยู่ภายใต้บังคับและตีความตามกฎหมายไทย โดยให้ศาลไทยเป็นศาลอันมีเขตอำนาจแก้กรณี
          </div>
        </div>

        <PageFooter pageNum={6} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 7 - Signature Page 1 */}
      <div className="print-page relative">
        <PageHeader />

        <div className="mt-4">
          <div className="indent-10 mb-6">
            สัญญาฉบับนี้ทำขึ้นมา 3 (สาม) ฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านข้อความในสัญญาและเข้าใจในสัญญาเพื่อเป็นหลักฐานในการทำสัญญานี้ คู่สัญญาจึงลงนามในสัญญาฉบับนี้ต่อหน้าพยาน ณ วันที่ซึ่งได้ระบุไว้ในหน้าแรกของสัญญาฉบับนี้
          </div>

          <div className="border border-black text-[12px]">
            <div className="grid grid-cols-2 divide-x divide-black">
              {/* Left: Lender 1 */}
              <div className="p-4 flex flex-col min-h-[400px]">
                <div className="flex-1 pt-1 space-y-12">
                  <div className="font-bold mb-2 text-[13px]">
                    <div>ผู้ให้เช่าซื้อฝ่ายที่ 1 :</div>
                    <Highlight>{data.lenderCompany}</Highlight>
                  </div>
                  
                  {data.lenderDirectors.split(/\s*และ\s*/).map((sig, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="border-b border-black w-full h-12"></div>
                      <div className="flex gap-2">
                        <span>ชื่อ:</span>
                        <div className="flex-1">{sig.trim()}</div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <div className="font-bold">ตำแหน่ง:</div>
                    <div className="text-center">
                      <div>กรรมการผู้มีอำนาจลงนาม</div>
                      <div><Highlight>{data.lenderCompany}</Highlight></div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 space-y-4">
                  <div className="font-bold">พยาน:</div>
                  <div className="flex flex-col items-center">
                    <div className="border-b border-black w-[80%] h-12 mb-1"></div>
                    <div className="text-center">(<span className="inline-block w-[150px]"></span>)</div>
                  </div>
                </div>
              </div>

              {/* Right: Guarantor */}
              <div className="p-4 flex flex-col min-h-[400px]">
                <div className="flex-1 pt-1 space-y-12">
                  <div className="font-bold mb-2 text-[13px]">
                    <div>ผู้ค้ำประกัน :</div>
                    <Highlight>{data.guarantorName}</Highlight>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="border-b border-black w-full h-12"></div>
                    <div className="flex gap-2">
                      <span>ชื่อ:</span>
                      <div className="flex-1">
                        <Highlight>{data.guarantorName}</Highlight>
                      </div>
                    </div>
                  </div>
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
      <div className="print-page relative">
        <PageHeader />
        
        <div className="mt-8 border border-black text-[12px]">
          <div className="grid grid-cols-2 divide-x divide-black">
            <div className="p-4 min-h-[400px] flex flex-col">
              <div className="flex-1 mt-2 space-y-12">
                <div className="font-bold mb-2 text-[13px]">
                  <div>ผู้ให้เช่าซื้อฝ่ายที่ 2 :</div>
                  <Highlight>{data.borrowerCompany}</Highlight>
                </div>
                {data.borrowerDirectors.split(/\s*และ\s*/).map((sig, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="border-b border-black w-full h-12"></div>
                    <div className="flex gap-2">
                      <span>ชื่อ:</span>
                      <div className="flex-1">{sig.trim()}</div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4">
                  <div className="font-bold">ตำแหน่ง:</div>
                  <div className="text-center">
                    <div>กรรมการผู้มีอำนาจลงนาม</div>
                    <div><Highlight>{data.borrowerCompany}</Highlight></div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 space-y-4">
                <div className="font-bold">พยาน:</div>
                <div className="flex flex-col items-center">
                  <div className="border-b border-black w-[80%] h-12 mb-1"></div>
                  <div className="text-center">(<span className="inline-block w-[150px]"></span>)</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 flex flex-col min-h-[400px]">
            </div>
          </div>
        </div>

        <PageFooter pageNum={8} />
      </div>

      {/* Page Break for Print */}
      <div className="hidden print:block page-break"></div>

      {/* Page 9 - Status Confirmation */}
      <div className="print-page relative">
        <PageHeader />

        <div className="mt-8 px-8">
          <div className="text-center font-bold mb-8 mt-16">
            <h2 className="text-[16px]">หนังสือยืนยันสถานภาพและให้ความยินยอมของคู่สมรส</h2>
          </div>

          <div className="text-right mb-6 pr-4">
            เขียนที่ บริษัท อาไจล์ แอสเซ็ทส์ จำกัด
          </div>

          <div className="text-center mb-12">
            วันที่ <Highlight>{data.effectiveDate}</Highlight>
          </div>

          <div className="indent-10 mb-16 leading-[2.2]">
            ข้าพเจ้า <Highlight>{data.guarantorName}</Highlight> ผู้ถือบัตรประจำตัวประชาชนเลขที่ <Highlight>{data.guarantorIdCard}</Highlight> มีที่อยู่ตามทะเบียนบ้านเลขที่ <Highlight>{data.guarantorAddress}</Highlight> ("ผู้ค้ำประกัน") ขอยืนยันว่าในขณะที่ข้าพเจ้าทำนิติกรรมใดๆ กับบริษัทฯ ข้าพเจ้าไม่เป็นบุคคลล้มละลาย หรือถูกศาลพิทักษ์ทรัพย์เด็ดขาด หรือพิทักษ์ทรัพย์ชั่วคราว และข้าพเจ้าขอรับรองว่าข้าพเจ้า <span className="font-bold underline">{data.isMarried ? 'ได้' : 'มิได้'}</span> ทำการสมรสโดยจดทะเบียน
          </div>

          <div className="flex flex-col items-center gap-12 mt-24">
            <div className="flex flex-col items-center">
              <div className="flex items-end justify-center w-[450px]">
                <span className="w-16 whitespace-nowrap">ลงชื่อ</span>
                <div className="border-b border-black border-dashed flex-1 mx-2"></div>
                <span className="w-24 whitespace-nowrap">ผู้ค้ำประกัน</span>
              </div>
              <div className="mt-2">( <Highlight>{data.guarantorName}</Highlight> )</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-end justify-center w-[450px]">
                <span className="w-16 whitespace-nowrap">ลงชื่อ</span>
                <div className="border-b border-black border-dashed flex-1 mx-2"></div>
                <span className="w-24 whitespace-nowrap">พยาน</span>
              </div>
              <div className="mt-2 text-transparent select-none">( xxxxxxxxxxxxxxxxx )</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-end justify-center w-[450px]">
                <span className="w-16 whitespace-nowrap">ลงชื่อ</span>
                <div className="border-b border-black border-dashed flex-1 mx-2"></div>
                <span className="w-24 whitespace-nowrap">พยาน</span>
              </div>
              <div className="mt-2 text-transparent select-none">( xxxxxxxxxxxxxxxxx )</div>
            </div>
          </div>
        </div>

        <PageFooter pageNum={9} />
      </div>

      {data.isMarried && (
        <>
          {/* Page Break for Print */}
          <div className="hidden print:block page-break"></div>

          {/* Page 10 - Spousal Consent */}
          <div className="print-page relative">
            <PageHeader />

            <div className="mt-8 px-8">
              <div className="text-center font-bold mb-8 mt-16">
                <h2 className="text-[16px]">หนังสือยินยอมให้คู่สมรสทำนิติกรรม</h2>
              </div>

              <div className="text-right mb-6 pr-4">
                เขียนที่ บริษัท อาไจล์ แอสเซ็ทส์ จำกัด
              </div>

              <div className="text-center mb-12">
                วันที่ <Highlight>{data.effectiveDate}</Highlight>
              </div>

              <div className="leading-[2.2]">
                <div className="indent-10">
                  โดยหนังสือฉบับนี้ข้าพเจ้า <Highlight>{data.spouseName}</Highlight> มีที่อยู่ตามทะเบียนบ้านเลขที่ <Highlight>{data.spouseAddress}</Highlight> ซึ่งเป็นสามี/ภริยา ของ <Highlight>{data.guarantorName}</Highlight>
                </div>
                <div className="indent-10">
                  ขอให้ความยินยอมโดยหนังสือนี้ว่าให้ <Highlight>{data.guarantorName}</Highlight> สามี/ภริยา ของข้าพเจ้าทำนิติกรรม เป็นผู้ค้ำประกันการชำระหนี้ของบริษัท <Highlight>{data.refContractCompany}</Highlight> รวมถึงนิติกรรมต่างๆ กับบริษัท อาไจล์ แอสเซ็ทส์ จำกัด ได้
                </div>
                <div className="indent-10">
                  การใดที่สามี/ภริยา ของข้าพเจ้าได้กระทำไป ข้าพเจ้าขอร่วมรับผิดในนิติกรรมนั้นเสมือนหนึ่งข้าพเจ้าได้กระทำเองทุกประการ
                </div>
                <div className="indent-10 mb-16">
                  เพื่อเป็นหลักฐาน จึงได้ลงลายมือชื่อไว้เป็นสำคัญต่อหน้าพยาน
                </div>
              </div>

              <div className="flex flex-col items-center gap-12 mt-20">
                <div className="flex flex-col items-center">
                  <div className="flex items-end justify-center w-[500px]">
                    <span className="w-16 whitespace-nowrap">ลงชื่อ</span>
                    <div className="border-b border-black border-dashed flex-1 mx-2"></div>
                    <span className="whitespace-nowrap">สามี/ภริยา ผู้ให้ความยินยอม</span>
                  </div>
                  <div className="mt-2">( <Highlight>{data.spouseName}</Highlight> )</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-end justify-center w-[500px]">
                    <span className="w-16 whitespace-nowrap">ลงชื่อ</span>
                    <div className="border-b border-black border-dashed flex-1 mx-2"></div>
                    <span className="whitespace-nowrap">พยาน</span>
                  </div>
                  <div className="mt-2 text-transparent select-none">( xxxxxxxxxxxxxxxx )</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-end justify-center w-[500px]">
                    <span className="w-16 whitespace-nowrap">ลงชื่อ</span>
                    <div className="border-b border-black border-dashed flex-1 mx-2"></div>
                    <span className="whitespace-nowrap">พยาน</span>
                  </div>
                  <div className="mt-2 text-transparent select-none">( xxxxxxxxxxxxxxxx )</div>
                </div>
              </div>
            </div>

            <PageFooter pageNum={10} />
          </div>
        </>
      )}
    </div>
  );
}
