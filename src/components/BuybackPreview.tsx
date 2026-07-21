import PageHeader from './PageHeader';
import type { BuybackData, CompanyInfo, HirePurchaseData, ContractType } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';
import { formatThaiDate } from '../utils/thaiDate';
import { formatThaiId } from '../utils/formatters';
import { Highlight, GreenHighlight } from './Highlight';
import { formatAddressWithPostalCode } from '../utils/address';
import { CONTRACT_TYPE_LABELS } from '../types/app';

interface Props {
  data: BuybackData;
  agileInfo: CompanyInfo;
  tkInfo: CompanyInfo;
  hpData: HirePurchaseData;
  customerInfo: CompanyInfo;
  mainContractType?: ContractType;
}

export default function BuybackPreview({ data, agileInfo, tkInfo, hpData, customerInfo, mainContractType }: Props) {
  const contractLabel = mainContractType ? CONTRACT_TYPE_LABELS[mainContractType] : 'สัญญาเช่าซื้อ';

  // Strip leading "เลขที่" from address data to prevent duplication
  // since the template text already includes the prefix
  const stripAddressPrefix = (addr: string) =>
    addr?.replace(/^เลขที่\s*/, '') || '';

  const assets = (hpData.assets || []).filter(a => data.selectedAssetIds?.includes(a.id));

  const totalAssetValue = assets.reduce((sum, asset) => {
    const amt = parseFloat(asset.totalAmount.replace(/,/g, '')) || 0;
    return sum + amt;
  }, 0);

  const downPaymentPercentage = parseFloat(data.downPercentage || '0') || 0;
  const downPaymentAmount = totalAssetValue * (downPaymentPercentage / 100);
  const remainingAmount = totalAssetValue - downPaymentAmount;

  const formatRate = (rate: string) => {
    if (!rate) return '';
    // If it's just a number, append %
    if (/^\d+(\.\d+)?$/.test(rate.trim())) {
      return `${rate.trim()}%`;
    }
    // If it doesn't have %, append it
    if (!rate.includes('%')) {
      return `${rate}%`;
    }
    return rate;
  };

  const PAGE2_MAX = 6;
  const SUBSEQUENT_MAX = 8;

  const overflowAssets = assets.length > PAGE2_MAX ? assets.slice(PAGE2_MAX) : [];
  const overflowPagesCount = Math.ceil(overflowAssets.length / SUBSEQUENT_MAX);
  // Total pages = 1 (meta) + 1 (page 2 assets) + overflowPagesCount + 1 (clauses 1-7) + 2 (signatures) + 2 (annexes)
  const totalPages = 2 + overflowPagesCount + 11;

  const renderPageFooter = (page: number) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600 font-sans">
      <div>
        สัญญารับซื้อคืนเลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
      </div>
      <div className="text-gray-400">หน้า {page} จาก {totalPages}</div>
    </div>
  );

  const formattedAmount = (val: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line space-y-8 print:space-y-0 mx-auto">
      {/* Page 1 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="text-center font-bold mb-6 mt-8">
          <h2 className="text-[16px] text-balance px-12">สัญญารับซื้อคืน ({contractLabel})</h2>
          <div className="mt-2 text-[16px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="indent-10">สัญญารับซื้อคืนฉบับนี้ (<b>“สัญญา”</b>) ทำขึ้นที่ บริษัท อาไจล์ แอสเซ็ทส์ จำกัด เมื่อวันที่ <Highlight>{formatThaiDate(data.contractDate)}</Highlight> (<b>“วันที่สัญญามีผลใช้บังคับ”</b>)</div>
          <div>โดยและระหว่าง:</div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-4 text-justify">
            <span className="shrink-0 w-8">1.</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{agileInfo.companyName}</Highlight></span> (โดย<Highlight>{agileInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(agileInfo.address, agileInfo.postalCode))}</Highlight> เลขประจำตัวผู้เสียภาษี <Highlight>{formatThaiId(agileInfo.taxId)}</Highlight> (<b>“บริษัทฝ่ายที่ 1”</b>)
            </div>
          </div>
          <div className="flex gap-4 text-justify">
            <span className="shrink-0 w-8">2.</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{tkInfo.companyName}</Highlight></span> (โดย<Highlight>{tkInfo.directors}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(tkInfo.address, tkInfo.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(tkInfo.taxId)}</Highlight> (<b>“บริษัทฝ่ายที่ 2”</b>)
            </div>
          </div>
          <div className="italic">
            (ซึ่ง 1. และ 2. ต่อไปจะเรียกรวมว่า <b>“บริษัทฯ”</b> ฝ่ายหนึ่ง)
          </div>
          <div id="section-vendor" className="flex gap-4 text-justify">
            <span className="shrink-0 w-8">3.</span>
            <div className="flex-1">
              {data.vendorType === 'shop' ? (
                <>
                  ชื่อร้าน <span className="font-bold"><Highlight>{data.vendorName}</Highlight></span> (โดย <Highlight>{data.vendorDirectors}</Highlight> ผู้ประกอบกิจการ) มีที่อยู่ตามทะเบียนภาษีเลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(data.vendorAddress, data.vendorPostalCode))}</Highlight> เลขประจำตัวผู้เสียภาษี <Highlight>{formatThaiId(data.vendorTaxId)}</Highlight> (<b>“ตัวแทนจำหน่าย”</b>) อีกฝ่ายหนึ่ง
                </>
              ) : data.vendorType === 'person' ? (
                <>
                  <span className="font-bold"><Highlight>{data.vendorName}</Highlight></span> มีที่อยู่ตามทะเบียนภาษีเลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(data.vendorAddress, data.vendorPostalCode))}</Highlight> เลขประจำตัวผู้เสียภาษี <Highlight>{formatThaiId(data.vendorTaxId)}</Highlight> (<b>“ตัวแทนจำหน่าย”</b>) อีกฝ่ายหนึ่ง
                </>
              ) : (
                <>
                  <span className="font-bold"><Highlight>{data.vendorName}</Highlight></span> (โดย <Highlight>{data.vendorDirectors}</Highlight> {data.vendorType === 'partnership' ? 'หุ้นส่วนผู้จัดการผู้มีอำนาจกระทำการ' : 'กรรมการผู้มีอำนาจกระทำการแทนบริษัท'}) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(data.vendorAddress, data.vendorPostalCode))}</Highlight> เลขประจำตัวผู้เสียภาษี <Highlight>{formatThaiId(data.vendorTaxId)}</Highlight> (<b>“ตัวแทนจำหน่าย”</b>) อีกฝ่ายหนึ่ง
                </>
              )}
            </div>
          </div>
          <div className="italic">
            (ซึ่งต่อไปในสัญญานี้แต่ละฝ่ายจะเรียกว่า <b>“คู่สัญญา”</b> และจะเรียกรวมกันว่า <b>“คู่สัญญาทั้งสามฝ่าย”</b>)
          </div>
        </div>

        <div className="mt-4 font-bold">
          ดังนั้น คู่สัญญาจึงได้ตกลงจัดทำสัญญาฉบับนี้ขึ้นภายใต้ข้อตกลงและเงื่อนไขดังต่อไปนี้
        </div>

        {renderPageFooter(1)}
      </div>

      {/* Page 2 (Assets Page 1) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div id="section-buyback-assets" className="space-y-6 mt-8">
          <div>
            <span className="font-bold text-[14px]">1. รายละเอียดของเครื่องจักรและกรรมสิทธิ์ในเครื่องจักร</span>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">1.1.</span>
            <div className="flex-1">
              ตามที่ตัวแทนจำหน่ายได้จำหน่ายและบริษัทฯ ได้ตกลงซื้อเครื่องจักรและอุปกรณ์ดังต่อไปนี้

              <div className="mt-4 space-y-4">
                {assets.slice(0, PAGE2_MAX).map((asset, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="w-16 shrink-0">(1.1.{idx + 1})</span>
                    <div className="flex-1">
                      <Highlight>{asset.name} {asset.description}</Highlight> จำนวน <Highlight>{asset.quantity} {asset.unit}</Highlight> ราคา <Highlight>{formattedAmount(parseFloat(asset.totalAmount.replace(/,/g, '')))} บาท ({thaiBahtText(asset.totalAmount.replace(/,/g, ''))})</Highlight> <GreenHighlight>(รวมภาษีมูลค่าเพิ่ม)</GreenHighlight>
                    </div>
                  </div>
                ))}
              </div>

              {assets.length <= PAGE2_MAX && (
                <>
                  <div className="mt-6 font-bold">
                    <Highlight>รวมเป็นมูลค่าทั้งสิ้น {formattedAmount(totalAssetValue)} บาท ({thaiBahtText(totalAssetValue)})</Highlight> <GreenHighlight>(รวมภาษีมูลค่าเพิ่ม)</GreenHighlight>
                  </div>

                  <div className="mt-6">
                    ซึ่งต่อไปในสัญญาฉบับนี้จะเรียกเครื่องจักรและอุปกรณ์ประกอบในข้อ 1.1 นี้ รวมกันว่า <b>“เครื่องจักร”</b> รายละเอียดปรากฏตาม Quotation / Purchase order sheet เอกสารแนบท้ายหมายเลข 1
                  </div>
                </>
              )}
            </div>
          </div>

          {assets.length <= PAGE2_MAX && (
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">1.2.</span>
              <div className="flex-1">
                คู่สัญญาตกลงกันซื้อขายเครื่องจักรนี้ โดยมีวัตถุประสงค์เพื่อให้บริษัทฯ ให้บริการเช่าซื้อแก่ <Highlight>{customerInfo.companyName}</Highlight> (<b>“ผู้เช่าซื้อ”</b>) ตามสัญญาเช่าซื้อเลขที่ <Highlight>{hpData.contractNo}</Highlight> ฉบับลงวันที่ <Highlight>{formatThaiDate(hpData.contractDate)}</Highlight> ที่ทำขึ้นระหว่างผู้เช่าซื้อกับบริษัทฯ
              </div>
            </div>
          )}
        </div>

        {renderPageFooter(2)}
      </div>

      {/* Overflow Asset Pages */}
      {Array.from({ length: overflowPagesCount }).map((_, pageIdx) => {
        const start = PAGE2_MAX + (pageIdx * SUBSEQUENT_MAX);
        const end = start + SUBSEQUENT_MAX;
        const pageAssets = assets.slice(start, end);
        const isLastPage = pageIdx === overflowPagesCount - 1;

        return (
          <div key={pageIdx} className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
            <PageHeader />
            <div className="mt-8 space-y-4">
              <div className="ml-12 space-y-4">
                {pageAssets.map((asset, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="shrink-0">(1.1.{start + idx + 1})</span>
                    <div className="flex-1">
                      <Highlight>{asset.name} {asset.description}</Highlight> จำนวน <Highlight>{asset.quantity} {asset.unit}</Highlight> ราคา <Highlight>{formattedAmount(parseFloat(asset.totalAmount.replace(/,/g, '')))} บาท ({thaiBahtText(asset.totalAmount.replace(/,/g, ''))})</Highlight> <GreenHighlight>(รวมภาษีมูลค่าเพิ่ม)</GreenHighlight>
                    </div>
                  </div>
                ))}
              </div>

              {isLastPage && (
                <div className="ml-12">
                  <div className="mt-6 font-bold">
                    <Highlight>รวมเป็นมูลค่าทั้งสิ้น {formattedAmount(totalAssetValue)} บาท ({thaiBahtText(totalAssetValue)})</Highlight> <GreenHighlight>(รวมภาษีมูลค่าเพิ่ม)</GreenHighlight>
                  </div>

                  <div className="mt-6">
                    ซึ่งต่อไปในสัญญาฉบับนี้จะเรียกเครื่องจักรและอุปกรณ์ประกอบในข้อ 1.1 นี้ รวมกันว่า <b>“เครื่องจักร”</b> รายละเอียดปรากฏตาม Quotation / Purchase order sheet เอกสารแนบท้ายหมายเลข 1
                  </div>

                  <div className="mt-6 flex gap-4">
                    <span className="w-8 shrink-0">1.2.</span>
                    <div className="flex-1">
                      คู่สัญญาตกลงกันซื้อขายเครื่องจักรนี้ โดยมีวัตถุประสงค์เพื่อให้บริษัทฯ ให้บริการเช่าซื้อแก่ <Highlight>{customerInfo.companyName}</Highlight> (<b>“ผู้เช่าซื้อ”</b>) ตามสัญญาเช่าซื้อเลขที่ <Highlight>{hpData.contractNo}</Highlight> ฉบับลงวันที่ <Highlight>{formatThaiDate(hpData.contractDate)}</Highlight> ที่ทำขึ้นระหว่างผู้เช่าซื้อกับบริษัทฯ
                    </div>
                  </div>
                </div>
              )}
            </div>
            {renderPageFooter(3 + pageIdx)}
          </div>
        );
      })}

      {/* Clauses Page */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div className="mt-8 space-y-6">
          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">1.3.</span>
            <div className="flex-1">
              ตัวแทนจำหน่ายได้รับเงินค่าชำระราคาครั้งแรก <GreenHighlight>(down payment)</GreenHighlight> ในอัตราร้อยละ {Math.round(downPaymentPercentage)} ({thaiBahtText(Math.round(downPaymentPercentage).toString()).replace('บาทถ้วน', '')}) ของราคาเครื่องเครื่องจักร อันมีมูลค่า <Highlight>{formattedAmount(totalAssetValue)} บาท</Highlight> เป็นจำนวนเงิน <Highlight>{formattedAmount(downPaymentAmount)} บาท ({thaiBahtText(downPaymentAmount.toString())})</Highlight> <GreenHighlight>(รวมภาษีมูลค่าเพิ่ม)</GreenHighlight> จาก <Highlight>{customerInfo.companyName}</Highlight> <b>(“ผู้เช่าซื้อ”)</b> ตามสัญญาเช่าซื้อ <Highlight>{hpData.contractNo}</Highlight> ฉบับลงวันที่ <Highlight>{formatThaiDate(hpData.contractDate)}</Highlight> ที่ทำขึ้นระหว่างผู้เช่าซื้อกับบริษัทฯ ซึ่งชำระแทน และ/หรือ ชำระในนามบริษัทฯ ครบถ้วนเรียบร้อยแล้ว รายละเอียดปรากฏตามหนังสือยืนยันการชำระเงินมัดจำ/เงินดาวน์ เอกสารแนบท้ายหมายเลข 2 ทั้งนี้ คู่สัญญาทั้งสามฝ่ายตกลงให้เงินค่าชำระราคาครั้งแรกดังกล่าวนับเป็นส่วนหนึ่งของเงินค่าเครื่องจักรด้วย
            </div>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">1.4.</span>
            <div className="flex-1">
              <b>ณ วันที่ทำสัญญาฉบับนี้ คู่สัญญากตกลงว่าเมื่อบริษัทฯ <Highlight>ชำระเงินค่าเครื่องจักรส่วนที่เหลือเป็นจำนวนทั้งสิ้น {formattedAmount(remainingAmount)} บาท ({thaiBahtText(remainingAmount.toString())})</Highlight> (รวมภาษีมูลค่าเพิ่ม)</b> ให้แก่ตัวแทนจำหน่ายและตัวแทนจำหน่ายได้รับเงินค่าเครื่องจักรส่วนที่เหลือครบถ้วนเรียบร้อยแล้ว กรรมสิทธิ์ในเครื่องจักรตกเป็นของบริษัทฯ <Highlight>ตามสัดส่วนในสัญญาเช่าซื้อ {hpData.contractNo} ฉบับลงวันที่ {formatThaiDate(hpData.contractDate)}</Highlight>
            </div>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">1.5.</span>
            <div className="flex-1">
              คู่สัญญาตกลงว่าให้สัญญารับซื้อคืนฉบับนี้ ถือเป็นหลักประกันภายใต้เงื่อนไขตามข้อ 2.
            </div>
          </div>

          <div className="mt-8">
            <span className="font-bold text-[14px]">2. หน้าที่และความรับผิดชอบของตัวแทนจำหน่าย</span>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">2.1.</span>
            <div className="flex-1">
              ตัวแทนจำหน่ายตกลงว่าในกรณีที่มีเหตุจำเป็นต้องดำเนินการยืดเครื่องจักรจากผู้เช่าซื้อ ตัวแทนจำหน่ายตกลงที่จะรับซื้อเครื่องจักร หรือกระทำการใดอันมีลักษณะเป็นการเข้ารับซื้อเครื่องจักรดังกล่าวในราคาที่ประเมินที่เหมาะสม
            </div>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">2.2.</span>
            <div className="flex-1">
              ตัวแทนจำหน่ายตกลงรับซื้อเครื่องจักรตามข้อตกลงและเงื่อนไขในการรับซื้อเครื่องจักรคืน ดังต่อไปนี้
            </div>
          </div>

          <div className="flex gap-4 ml-12">
            <span className="w-8 shrink-0">(ก)</span>
            <div className="flex-1">
              ในการประเมินราคาซื้อคืนเครื่องจักรให้ใช้เกณฑ์นับจำนวนอายุเป็นรายปี โดยนับตั้งแต่คิดตั้งเสร็จพร้อมรับประกัน เครื่องจักร อุปกรณ์ หรือ สินค้า เป็นหลัก
            </div>
          </div>
        </div>

        {renderPageFooter(3 + overflowPagesCount)}
      </div>

      {/* Page 4 (Rates & Payment) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div className="mt-8 space-y-6">
          <div className="flex gap-4 ml-12">
            <span className="w-8 shrink-0">(ข)</span>
            <div className="flex-1">
              การรับซื้อเครื่องจักรคืน{data.buybackMode === 'newOnly' ? 'มือ 1' : data.buybackMode === 'usedOnly' ? 'มือ 2' : 'ทั้งมือ 1 และ มือ 2'} เครื่องจักร อุปกรณ์ หรือ สินค้า ต้องมีความสมบูรณ์ และมีสภาพพร้อมใช้งานได้ตามระบบปกติ โดยทางตัวแทนจำหน่าย จะเป็นผู้สรุปผลการตรวจสอบ
            </div>
          </div>

          <div className="flex gap-4 ml-12">
            <span className="w-8 shrink-0">(ค)</span>
            <div className="flex-1">
              การรับซื้อคืน{data.buybackMode === 'newOnly' ? 'มือ 1' : data.buybackMode === 'usedOnly' ? 'มือ 2' : 'ทั้งมือ 1 และ มือ 2'} เครื่องจักร อุปกรณ์ หรือ สินค้า จะพิจารณาราคาให้ โดยอ้างอิงจากราคาตามสัญญาของบริษัทฯ เป็นหลัก
            </div>
          </div>

          <div className="flex gap-4 ml-12">
            <span className="w-8 shrink-0">(ง)</span>
            <div className="flex-1 border-black">
              หากตัวแทนจำหน่ายไม่รับซื้อเครื่องจักรคืนหรือไม่ตอบกลับภายในเวลาที่กำหนด ให้ถือว่าตัวแทนจำหน่ายปฏิเสธการซื้อเครื่องจักรคืน
            </div>
          </div>

          <div id="section-buyback-rate" className="text-center py-4">
            <div className="font-bold mb-4">เกณฑ์ราคาการรับซื้อคืน เครื่องจักร อุปกรณ์ หรือ สินค้า ดังนี้</div>
            <table className="mx-auto border-collapse border border-black text-center min-w-[300px]">
              <thead>
                <tr>
                  <th className="border border-black px-4 py-1 bg-yellow-100 print:bg-transparent font-bold">ปี</th>
                  {(data.buybackMode === 'all' || data.buybackMode === 'newOnly') && (
                    <th className="border border-black px-4 py-1 bg-yellow-100 print:bg-transparent font-bold">มือ 1</th>
                  )}
                  {(data.buybackMode === 'all' || data.buybackMode === 'usedOnly') && (
                    <th className="border border-black px-4 py-1 bg-yellow-100 print:bg-transparent font-bold">มือ 2</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.buybackTable && data.buybackTable.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-black px-4 py-1">{row.year}</td>
                    {(data.buybackMode === 'all' || data.buybackMode === 'newOnly') && (
                      <td className="border border-black px-4 py-1">{formatRate(row.newRate)}</td>
                    )}
                    {(data.buybackMode === 'all' || data.buybackMode === 'usedOnly') && (
                      <td className="border border-black px-4 py-1">{formatRate(row.usedRate)}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">(จ)</span>
            <div className="flex-1">
              ในการแจ้งให้ตัวแทนจำหน่ายรับซื้อเครื่องจักรคืนนั้น บริษัทฯ ต้องแจ้งให้ตัวแทนจำหน่ายทราบล่วงหน้าเป็นลายลักษณ์อักษร ไม่น้อยกว่า 60 (หกสิบ) วัน และเมื่อตัวแทนจำหน่ายได้รับการแจ้งดังกล่าวแล้ว ตัวแทนจำหน่ายตกลงรับซื้อเครื่องจักรคืนจากบริษัทฯ ภายใน 60 (หกสิบ) วัน นับแต่วันที่ได้รับแจ้งจากบริษัทฯ
            </div>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">(ฉ)</span>
            <div className="flex-1">
              คู่สัญญาทั้งสามฝ่ายตกลงร่วมกันว่า วิธีการชำระเงินค่าซื้อคืนเครื่องจักร ตัวแทนจำหน่ายตกลงชำระให้แก่บริษัทฯ ณ ภูมิลำเนาของบริษัทฯ ตามที่ระบุไว้ในสัญญานี้ โดยตัวแทนจำหน่ายสามารถชำระด้วยเงินสด เช็ค ด้วยวิธีการโอนเงินเข้าบัญชีของบริษัทฯ <b>ชื่อบัญชี บริษัท อาไจล์ แอสเซ็ทส์ จำกัด ธนาคารกสิกรไทย ประเภทออมทรัพย์ หมายเลขบัญชี 025-3-77662-5</b> หรือด้วยวิธีการอื่นใดที่คู่สัญญากตกลงร่วมกัน และให้ถือว่าบริษัทฯ ได้รับชำระค่ารับซื้อเครื่องจักรคืนเมื่อได้มีการขึ้นเงินและ/หรือ ได้รับชำระเต็มจำนวนจากธนาคารดังกล่าวข้างต้น
            </div>
          </div>
        </div>

        {renderPageFooter(4 + overflowPagesCount)}
      </div>

      {/* Page 5 (Clauses 3-5) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div className="mt-8 space-y-8">
          <div className="flex gap-4">
            <span className="w-8 shrink-0 font-bold">3.</span>
            <div className="flex-1">
              <span className="font-bold">การส่งมอบเครื่องจักร</span>
              <p className="mt-2 text-justify">
                คู่สัญญาทั้งสามฝ่ายตกลงร่วมกันว่าในการส่งมอบเครื่องจักรที่ซื้อคืนนั้น ตัวแทนจำหน่ายตกลงชำระ และรับผิดชอบค่าใช้จ่ายทั้งปวงอันเกิดจากการส่งมอบ ขนย้าย และบรรดาค่าใช้จ่ายอื่นๆ อันเกิดจากการกระทำในลักษณะเดียวกันแต่เพียงผู้เดียว
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0 font-bold">4.</span>
            <div className="flex-1">
              <span className="font-bold">การโอนกรรมสิทธิ์เครื่องจักรที่รับซื้อคืน</span>
              <p className="mt-2 text-justify">
                เมื่อบริษัทฯ ได้รับชำระค่ารับซื้อเครื่องจักรคืนจากตัวแทนจำหน่ายครบถ้วนแล้ว และตัวแทนจำหน่ายได้ปฏิบัติและรักษาบรรดาข้อตกลงและเงื่อนไขทั้งปวงของสัญญาฉบับนี้แล้วอย่างเคร่งครัดให้กรรมสิทธิ์ในเครื่องจักรดังกล่าวตกเป็นของตัวแทนจำหน่ายทันที
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0 font-bold">5.</span>
            <div className="flex-1">
              <span className="font-bold">ประกันภัยเครื่องจักร</span>
              <p className="mt-2 text-justify">
                ในกรณีที่เครื่องจักรที่รับซื้อคืนมีประกันภัย และในวันที่ตัวแทนจำหน่ายรับซื้อเครื่องจักรคืนนั้นเครื่องจักรดังกล่าวยังอยู่ในความคุ้มครอง/ระยะเวลาประกันภัยตามกรมธรรม์ประกันภัย บริษัทฯ ตกลงจะดำเนินการให้บริษัทประกันภัยลงนามสลักหลังกรมธรรม์ประกันภัยระบุให้ตัวแทนจำหน่ายเป็นผู้รับผลประโยชน์ตามกรมธรรม์ประกันภัยแต่เพียงผู้เดียว และส่งมอบต้นฉบับกรมธรรม์ประกันภัยที่ได้รับการสลักหลังแล้วนั้นให้แก่ตัวแทนจำหน่าย โดยให้ตัวแทนจำหน่ายมีสิทธิได้รับเงินและประโยชน์อื่นๆ ทั้งหมดอย่างเต็มที่จากการประกันภัยเครื่องจักร รวมทั้งมีสิทธิเรียกร้องทั้งหมดตามกรมธรรม์ประกันภัยที่ยังมีผลใช้บังคับอยู่ ณ เวลาที่รับซื้อเครื่องคืน ทั้งนี้ ให้ผู้รับประกันภัยส่งมอบเงินและประโยชน์เหล่านั้นให้แก่ตัวแทนจำหน่ายโดยตรง
              </p>
            </div>
          </div>
        </div>

        {renderPageFooter(5 + overflowPagesCount)}
      </div>

      {/* Page 6 (Clause 6) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="w-8 shrink-0 font-bold">6.</span>
            <div className="flex-1">
              <span className="font-bold">เหตุและผลของการผิดนัด</span>
            </div>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">6.1</span>
            <div className="flex-1">
              เมื่อเกิดเหตุการณ์ใดเหตุการณ์หนึ่งดังต่อไปนี้ขึ้น ให้ถือว่าเป็นเหตุผิดนัด

              <div className="mt-4 space-y-4 text-justify">
                <div className="flex gap-4">
                  <span className="w-8 shrink-0">(ก)</span>
                  <div className="flex-1">
                    ตัวแทนจำหน่ายไม่รักษาและปฏิบัติตามข้อตกลงเงื่อนไขข้อผูกพันใดๆ และข้อกำหนดใดๆ อันเป็นหน้าที่ของตนตามที่ระบุไว้ในสัญญานี้
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 shrink-0">(ข)</span>
                  <div className="flex-1">
                    ตัวแทนจำหน่ายปฏิเสธการรับซื้อเครื่องจักรคืนจากบริษัทฯ
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 shrink-0">(ค)</span>
                  <div className="flex-1">
                    ตัวแทนจำหน่ายผิดนัดชำระค่ารับซื้อเครื่องจักรคืนงวดใดงวดหนึ่ง หรือเงินอื่นใดที่จะต้องชำระตามสัญญา (ไม่ว่าจะได้ทวงถามหรือไม่)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 ml-4">
            <span className="w-8 shrink-0">6.2</span>
            <div className="flex-1">
              เมื่อเกิดเหตุผิดนัดข้อใดข้อหนึ่งตามข้อ 6.1 ข้างต้น ให้บริษัทฯ มีสิทธิประการใดประการหนึ่งหรือหลายประการดังต่อไปนี้ทันที

              <div className="mt-4 space-y-4 text-justify">
                <div className="flex gap-4">
                  <span className="w-8 shrink-0">(ก)</span>
                  <div className="flex-1">
                    เรียกร้องให้ตัวแทนจำหน่ายปฏิบัติตามสัญญาให้ถูกต้อง ซึ่งรวมถึงแต่ไม่จำกัดเพียงการชำระค่ารับซื้อเครื่องจักรที่ยังค้างชำระอยู่
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 shrink-0">(ข)</span>
                  <div className="flex-1">
                    เรียกร้องให้ตัวแทนจำหน่ายชำระค่าปรับกรณีผิดนัดชำระเงินใดๆ ตามสัญญานี้ ในอัตราร้อยละ 18 ต่อปี นับแต่วันที่ครบกำหนดชำระเป็นต้นไปจนถึงวันที่ตัวแทนจำหน่ายได้ชำระหนี้ให้แก่บริษัทฯ ครบถ้วน ทั้งนี้อัตราดอกเบี้ยผิดนัดชำระหนี้ หรือดอกเบี้ยผิดนัดตามอัตราที่กฎหมายกำหนด อาจมีการเปลี่ยนแปลงได้ ในกรณีที่มีการเปลี่ยนแปลงกฎหมายที่เกี่ยวข้อง เช่น ประกาศของกระทรวงการคลัง ประกาศของธนาคารแห่งประเทศไทย หรือ ประมวลกฎหมายแพ่งและพาณิชย์ ซึ่งออกบังคับใช้ภายหลังวันที่ทำสัญญานี้ อันเป็นเหตุให้การกำหนดอัตราดอกเบี้ยผิดนัดชำระหนี้ตามกฎหมายต้องเปลี่ยนแปลงไป ตัวแทนจำหน่ายตกลงยินยอมให้อัตราดอกเบี้ยผิดนัดชำระหนี้ตามสัญญาฉบับนี้เป็นไปตามกฎหมายที่เปลี่ยนแปลงไป ไม่ว่าอัตราดอกเบี้ยผิดนัดนั้นจะเพิ่มขึ้นหรือลดลง โดยมิได้รับความยินยอมจาก ตัวแทนจำหน่ายก่อน และให้ถือปฏิบัติเช่นนี้ตลอดไปจนกว่า ตัวแทนจำหน่ายจะชำระหนี้ให้แก่บริษัทฯ จนครบถ้วน
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 shrink-0">(ค)</span>
                  <div className="flex-1">
                    บอกเลิกสัญญาฉบับนี้ได้โดยทันที โดยผลของการบอกเลิกสัญญาเป็นไปตามข้อ 7 ของสัญญานี้
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 shrink-0">(ง)</span>
                  <div className="flex-1">
                    เรียกร้องให้ตัวแทนจำหน่ายรับผิดในค่าเสียหายอื่นๆ (ถ้ามี)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(6 + overflowPagesCount)}
      </div>

      {/* Page 7 (Clauses 7-9) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div className="mt-8 space-y-8 text-justify">
          {/* 7 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 shrink-0 font-bold">7.</span>
              <span className="font-bold">การเลิกสัญญา</span>
            </div>
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">7.1</span>
              <div>
                กรณีที่บริษัทฯ เป็นผู้ใช้สิทธิบอกเลิกสัญญานี้แล้ว ให้บริษัทฯ มีสิทธิดังต่อไปนี้
                <div className="flex gap-4 mt-2">
                  <span className="w-8 shrink-0">(ก)</span>
                  <span>มีสิทธิได้รับชดใช้บรรดาค่าใช้จ่าย ค่าฤชาธรรมเนียม หรือค่าธรรมเนียมทั้งปวงที่เกี่ยวเนื่องกับการดำเนินการทางกฎหมาย การทวงถาม การค้นหา ติดตามตัวแทนจำหน่าย</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">7.2</span>
              <span>ตัวแทนจำหน่ายจะบอกเลิกสัญญาฉบับนี้มิได้ เว้นแต่จะได้รับความยินยอมจากบริษัทฯ</span>
            </div>
          </div>

          {/* 8 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 shrink-0 font-bold">8.</span>
              <span className="font-bold">ความเป็นส่วนหนึ่งของสัญญา</span>
            </div>
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">8.1</span>
              <span>เอกสารประกอบ และ/หรือเอกสารแนบท้ายสัญญานี้ที่ทำขึ้นโดยบริษัทฯหรือในนามของบริษัทฯ โดยตัวแทนจำหน่าย หรือในนามของตัวแทนจำหน่าย ให้ถือเป็นส่วนหนึ่งของสัญญาฉบับนี้เสมือนว่าได้นำมาระบุไว้ครบถ้วนในสัญญาฉบับนี้</span>
            </div>
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">8.2</span>
              <span>หากข้อความใดในเอกสารแนบท้าย และ/หรือ เอกสารประกอบอื่นใดขัดหรือแย้งกับสัญญาฉบับนี้ให้ถือตามสัญญาฉบับนี้</span>
            </div>
          </div>

          {/* 9 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 shrink-0 font-bold">9.</span>
              <span className="font-bold">การบอกกล่าว</span>
            </div>
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">9.1</span>
              <span>การติดต่อหรือบอกกล่าวซึ่งทำขึ้นโดยคู่สัญญาฝ่ายหนึ่งและส่งไปยังคู่สัญญาอีกฝ่ายหนึ่งให้ทำเป็นหนังสือ หากมิได้ระบุไว้เป็นอย่างอื่นอาจส่งโดยทางโทรสารหรือส่งทางไปรษณีย์ หรือให้คนนำไปส่งเองก็ได้ ให้ส่งไปยังคู่สัญญาอีกฝ่ายหนึ่งตามที่อยู่ที่ได้ระบุไว้ข้างต้นของสัญญาฉบับนี้ (เว้นแต่คู่สัญญาฝ่ายใดฝ่ายหนึ่งจะได้แจ้งที่อยู่อื่นใดซึ่งได้มีการระบุ โดยการแจ้งเป็นหนังสือไปยังอีกฝ่ายหนึ่งล่วงหน้า 7 (เจ็ด) วันก่อนส่งคำบอกกล่าว)</span>
            </div>
          </div>
        </div>

        {renderPageFooter(7 + overflowPagesCount)}
      </div>

      {/* Page 8 (Clauses 9.2-10) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div className="mt-8 space-y-8 text-justify">
          {/* 9.2-9.3 */}
          <div className="space-y-4">
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">9.2</span>
              <div className="flex-1">
                การติดต่อหรือคำบอกกล่าวจากบริษัทฯ ไปยังตัวแทนจำหน่ายให้ถือว่าตัวแทนจำหน่ายได้รับโดยถูกต้องแล้ว เมื่อ
                <div className="mt-4 space-y-4 text-justify">
                  <div className="flex gap-4">
                    <span className="w-8 shrink-0">(ก)</span>
                    <div className="flex-1">ในกรณีที่ส่งโดยโทรสาร เมื่อมีการส่ง หรือ</div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-8 shrink-0">(ข)</span>
                    <div className="flex-1">ในกรณีทำเป็นหนังสือ เมื่อส่งไปถึงที่อยู่ของตัวแทนจำหน่ายดังกล่าวไว้ข้างต้นของสัญญาฉบับนี้ หรือเมื่อครบกำหนด 3 (สาม) วัน นับจากวันที่ได้ส่งทางไปรษณีย์พร้อมปิดดวงตราไปรษณียากรถึงตัวแทนจำหน่ายแล้ว และแม้หากว่าส่งให้ไม่ได้เพราะตัวแทนจำหน่ายย้ายที่อยู่ หรือที่อยู่ที่กล่าวนี้เปลี่ยนแปลงไป หรือถูกรื้อถอนไป โดยตัวแทนจำหน่ายไม่ได้แจ้งการย้าย หรือการเปลี่ยนแปลง หรือการรื้อถอนนั้นเป็นหนังสือต่อบริษัทฯ หรือการส่งโทรพิมพ์ หรือโทรสาร หรือจดหมายอิเล็กทรอนิกส์ตามหมายเลขหรือที่อยู่ที่ตัวแทนจำหน่ายแจ้งให้เจ้าของทราบ ให้ถือว่าตัวแทนจำหน่ายได้รับทราบข้อความตามหนังสือ หรือโทรพิมพ์ หรือโทรสาร หรือจดหมายอิเล็กทรอนิกส์นั้น</div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-8 shrink-0">(ค)</span>
                    <div className="flex-1">บริษัทฯ อาจเปลี่ยนแปลงหรือเพิ่มเติมวิธีการส่งบรรดาเอกสาร หรือ บอกกล่าวใดๆไปยังตัวแทนจำหน่ายด้วยวิธีการทางอิเล็กทรอนิกส์ เพื่อทดแทนหรือเพิ่มเติมจากการทำเป็นหนังสือได้โดยการส่งเอกสาร หรือ บอกกล่าวเป็นลายลักษณ์อักษร หรือ เป็นจดหมายอิเล็กทรอนิกส์ตามที่อยู่ Email address ที่ผู้เช่าซื้อได้แจ้งให้เจ้าของทราบ แม้ว่าหนังสือนั้นตัวแทนจำหน่ายจะได้รับหรือไม่ได้รับ หรือถูกตีกลับไม่ว่าด้วยเหตุใดก็ตามให้ถือว่าตัวแทนจำหน่ายได้รับทราบ และถือว่าบริษัทฯ ได้บอกกล่าวโดยชอบด้วยกฎหมายแล้ว</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">9.3</span>
              <div className="flex-1">
                ทั้งนี้ การติดต่อหรือบอกกล่าวจากตัวแทนจำหน่ายไปยังบริษัทฯ จะมีผลสมบูรณ์ต่อเมื่อบริษัทฯ ได้รับทราบแล้วเท่านั้น
              </div>
            </div>
          </div>

          {/* 10 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 shrink-0 font-bold">10.</span>
              <span className="font-bold">การสละสิทธิ</span>
            </div>
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">10.1</span>
              <span>กรณีที่ตัวแทนจำหน่ายผิดนัดหรือผิดสัญญาฉบับนี้ครั้งใด ถ้าบริษัทฯ ยอมผ่อนผันการผิดนัดหรือผิดสัญญาครั้งนั้นๆ ไม่ให้ถือว่าเป็นการผ่อนผันการผิดนัดหรือผิดสัญญาครั้งอื่น</span>
            </div>
            <div className="flex gap-4 ml-4">
              <span className="w-8 shrink-0">10.2</span>
              <span>ความล่าช้าในการใช้สิทธิใดๆ ตามสัญญาฉบับนี้ ของบริษัทฯ ก็ดี ของผู้รับสิทธิจากบริษัทฯ หรือของผู้รับโอนสิทธิจากบริษัทฯ ก็ดี ไม่ถือว่าเป็นการสละสิทธิดังกล่าว ทั้งการใช้สิทธิเพียงครั้งเดียวหรือเพียงบางส่วนก็ไม่เป็นการตัดสิทธิของบริษัทฯ ที่จะใช้สิทธิอื่นๆ หรือสิทธินั้นต่อไปอีก</span>
            </div>
          </div>
        </div>

        {renderPageFooter(8 + overflowPagesCount)}
      </div>

      {/* Page 9 (Clauses 11-13) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div className="mt-8 space-y-8 text-justify">
          {/* 11 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 shrink-0 font-bold">11.</span>
              <span className="font-bold">การแยกต่างหากจากสัญญา</span>
            </div>
            <p>
              ข้อกำหนดต่างๆ ในสัญญาฉบับนี้แต่ละข้อเป็นอิสระต่างหากจากกัน หากข้อสัญญาข้อใดข้อหนึ่งภายใต้สัญญาฉบับนี้ไม่สมบูรณ์ เป็นโมฆะ ขัดต่อกฎหมาย หรือไม่อาจบังคับใช้ได้ตามกฎหมายไม่ว่าในกรณีใดๆ ให้ถือว่าข้อสัญญาหรือข้อกำหนดอื่นๆ ในสัญญาฉบับนี้ ยังคงมีผลใช้บังคับได้ตามกฎหมาย
            </p>
          </div>

          {/* 12 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 shrink-0 font-bold">12.</span>
              <span className="font-bold">การแก้ไขสัญญา</span>
            </div>
            <p>
              สัญญาฉบับนี้ประมวลความเข้าใจทั้งปวงของคู่สัญญาไว้แล้ว และจะเปลี่ยนแปลงหรือแก้ไขมิได้ เว้นแต่การเปลี่ยนแปลงและแก้ไขนั้นได้ทำเป็นลายลักษณ์อักษรลงนามโดยคู่สัญญาทั้งสองฝ่ายตามสัญญาฉบับนี้ และถือเป็นส่วนหนึ่งของสัญญาฉบับนี้
            </p>
          </div>

          {/* 13 */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="w-8 shrink-0 font-bold">13.</span>
              <span className="font-bold">กฎหมายที่ใช้บังคับ</span>
            </div>
            <p>
              คู่สัญญาตกลงกันให้ สัญญาฉบับนี้ตีความและอยู่ภายใต้บังคับตามกฎหมายของประเทศไทย
            </p>
          </div>
        </div>

        {renderPageFooter(9 + overflowPagesCount)}
      </div>

      {/* Page 10 (Signatures) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />

        <div className="mt-8 indent-10 pb-8 border-b border-white">
          เพื่อเป็นหลักฐานในการนี้ คู่สัญญาทั้งสามฝ่ายได้ลงนามในสัญญาฉบับนี้ต่อหน้าพยาน ณ วันที่ซึ่งได้ระบุไว้ในหน้าแรกของสัญญาฉบับนี้
        </div>

        <div className=" border border-black flex min-h-[600px] text-[13px]">
          {/* Column 1: Agile */}
          <div className="w-1/2 border-r border-black p-8 flex flex-col">
            <div className="space-y-6">
              <div className="font-bold underline">บริษัทฝ่ายที่ 1 :</div>
              <div className="font-bold">{agileInfo.companyName}</div>
            </div>

            <div className="flex-1 flex flex-col justify-start space-y-16 pt-12 pb-16">
              {(agileInfo.directors || '').split(/\s*และ\s*/).map((sig, i) => (
                <div key={i} className="flex flex-col items-center w-full pr-8">
                  <div className="border-b border-black w-full h-8"></div>
                  <div className="mt-2 whitespace-nowrap text-center">( {sig} )</div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-left space-y-1">
              <div className="font-bold">ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
              <div className="font-bold">{agileInfo.companyName}</div>
            </div>

            <div className="mt-12">
              <div className="font-bold">พยาน:</div>
              <div className="mt-8 border-b border-black w-full"></div>
              <div className="mt-4 flex justify-center text-[11px] items-center gap-1 w-full px-4">
                ( <span className="border-b border-black flex-1 max-w-[200px] h-4"></span> )
              </div>
            </div>
          </div>

          {/* Column 2: Vendor */}
          <div className="w-1/2 p-8 flex flex-col">
            <div className="space-y-6">
              <div className="font-bold underline">ตัวแทนจำหน่าย :</div>
              <div className="font-bold"><Highlight>{data.vendorName}</Highlight></div>
            </div>

            <div className="flex-1 flex flex-col justify-start space-y-16 pt-12 pb-16">
              {(data.vendorType === 'person' ? [data.vendorName] : (data.vendorDirectors || '').split(/\s*และ\s*/)).map((sig, i) => (
                <div key={i} className="flex flex-col items-center w-full pr-8">
                  <div className="border-b border-black w-full h-8"></div>
                  <div className="mt-2 whitespace-nowrap text-center">( <Highlight>{sig}</Highlight> )</div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-left space-y-1">
              <div className="font-bold">
                ตำแหน่ง: {data.vendorType === 'shop' ? 'ผู้ประกอบกิจการ' : data.vendorType === 'partnership' ? 'หุ้นส่วนผู้จัดการ' : data.vendorType === 'person' ? 'ผู้จำหน่าย' : 'กรรมการผู้มีอำนาจลงนาม'}
              </div>
              <div className="font-bold"><Highlight>{data.vendorName}</Highlight></div>
            </div>

            <div className="mt-12">
              <div className="font-bold">พยาน:</div>
              <div className="mt-8 border-b border-black w-full"></div>
              <div className="mt-4 flex justify-center text-[11px] items-center gap-1 w-full px-4">
                ( <span className="border-b border-black flex-1 max-w-[200px] h-4"></span> )
              </div>
            </div>
          </div>
        </div>

        {renderPageFooter(10 + overflowPagesCount)}
      </div>

      {/* Page 11 (Signatures - Party 2) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none break-before-page">
        <PageHeader />
        <div className="mt-8 border border-black flex min-h-[600px] text-[13px]">
          {/* Column 1: TK (Thitikorn) */}
          <div className="w-1/2 border-r border-black p-8 flex flex-col">
            <div className="space-y-6">
              <div className="font-bold underline">บริษัทฝ่ายที่ 2 :</div>
              <div className="font-bold">{tkInfo.companyName}</div>
            </div>

            <div className="flex-1 flex flex-col justify-start space-y-16 pt-12 pb-16">
              {(tkInfo.directors || '').split(/\s*และ\s*/).map((sig, i) => (
                <div key={i} className="flex flex-col items-center w-full pr-8">
                  <div className="border-b border-black w-full h-8"></div>
                  <div className="mt-2 font-bold whitespace-nowrap text-center">ชื่อ: {sig}</div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-left space-y-1">
              <div className="font-bold">ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
              <div className="font-bold">{tkInfo.companyName}</div>
            </div>

            <div className="mt-12">
              <div className="font-bold">พยาน:</div>
              <div className="mt-8 border-b border-black w-full"></div>
              <div className="mt-4 flex justify-center text-[11px] items-center gap-1 w-full px-4">
                ( <span className="border-b border-black flex-1 max-w-[200px] h-4"></span> )
              </div>
            </div>
          </div>

          {/* Column 2: Empty */}
          <div className="w-1/2 p-8 flex flex-col items-center justify-center">
            {/* Empty per image 795 */}
          </div>
        </div>

        {renderPageFooter(11 + overflowPagesCount)}
      </div>

      {/* Page 12 (Annex 1) */}
      <div className="print-page relative min-h-[1050px] py-10 px-24">
        <PageHeader />

        <div className="text-center mt-2">
          <p className="font-bold underline text-[12px] mb-0.5">เอกสารแนบท้ายหมายเลข 1</p>
          <p className="font-bold underline text-[12px]">Quotation/Purchase order sheet</p>
        </div>

        {renderPageFooter(12 + overflowPagesCount)}
      </div>

      {/* Page 13 (Annex 2) */}
      <div className="print-page relative min-h-[1050px] py-10 px-24 break-before-page">
        <PageHeader />

        <div className="text-center mt-2">
          <p className="font-bold underline text-[12px] mb-0.5">เอกสารแนบท้ายหมายเลข 2</p>
          <p className="font-bold underline text-[12px]">หนังสือยืนยันการชำระเงินมัดจำ/เงินดาวน์</p>
        </div>

        {renderPageFooter(13 + overflowPagesCount)}
      </div>
    </div >
  );
}
