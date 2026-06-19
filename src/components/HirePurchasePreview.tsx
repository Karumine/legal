import PageHeader from './PageHeader';
import type { HirePurchaseData, CompanyInfo, CollateralAsset, GuarantorData, ContractType } from '../types/app';
import { CONTRACT_TYPE_LABELS } from '../types/app';
import { thaiBahtText } from '../utils/thaiBahtText';
import { thaiNumberText } from '../utils/thaiNumberText';
import { formatThaiDate } from '../utils/thaiDate';
import { formatThaiId, getAuthorizedSignatoryText } from '../utils/formatters';
import { formatAddressWithPostalCode } from '../utils/address';
import { Highlight, GreenHighlight } from './Highlight';

interface Props {
  data: HirePurchaseData;
  customerInfo: CompanyInfo;
  guarantors?: GuarantorData[];
  type?: ContractType;
}


export default function HirePurchasePreview({ data, customerInfo, guarantors = [], type = 'hirePurchase' }: Props) {

  // Strip leading "เลขที่" from address data to prevent duplication
  // since the template text already includes the prefix
  const stripAddressPrefix = (addr: string) =>
    addr?.replace(/^เลขที่\s*/, '') || '';
  const firstPageMax = 3;
  const integratedPageMax = 3;
  const subsequentPageMax = 6;
  const assetCount = data.assets?.length || 0;

  const isLargeList = assetCount >= 7;

  const collateralAssetsCount = (data.collateralAssets || []).length;
  const isDedicatedCollateral = collateralAssetsCount >= 5;
  const isIntegratedCollateral = collateralAssetsCount === 4;
  const hasCollateral = collateralAssetsCount > 0;
  const collateralOffset = isDedicatedCollateral ? 2 : (hasCollateral ? 1 : 0);
  const firstPageCollateralCount = collateralAssetsCount >= 8 ? collateralAssetsCount - 3 : (isDedicatedCollateral ? 4 : (isIntegratedCollateral ? 3 : undefined));

  const integratedAssetsCount = (!isLargeList && assetCount > firstPageMax)
    ? Math.min(assetCount - firstPageMax, integratedPageMax)
    : 0;
  const dedicatedOverflowAssetsCount = assetCount > firstPageMax ? assetCount - firstPageMax - integratedAssetsCount : 0;

  const dedicatedOverflowAssets = dedicatedOverflowAssetsCount > 0 ? data.assets!.slice(firstPageMax, firstPageMax + dedicatedOverflowAssetsCount) : [];
  const integratedAssets = integratedAssetsCount > 0 ? data.assets!.slice(assetCount - integratedAssetsCount) : [];

  const overflowPagesCount = Math.ceil(dedicatedOverflowAssets.length / subsequentPageMax);

  const totalPages = 25 + overflowPagesCount + collateralOffset;

  const renderPageFooter = (pageNum: number) => (
    <div className="absolute bottom-4 left-0 right-0 px-24 flex justify-between items-end text-[10px] text-gray-600">
      <div>
        {CONTRACT_TYPE_LABELS[type]} เลขที่ <Highlight>{data.contractNo || '\u00A0'}</Highlight>
      </div>
      <div>
        หน้า {pageNum} จาก {totalPages}
      </div>
    </div>
  );

  const totalAmount = data.assets?.reduce((sum, asset) => sum + (parseFloat(asset.totalAmount.replace(/,/g, '')) || 0), 0) || 0;
  const totalAmountFormatted = totalAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const totalAmountThai = thaiBahtText(totalAmountFormatted);


  const formatCurrency = (value: string | number) => {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return value.toString();
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatCurrencyNoZeroDecimals = (value: string | number) => {
    if (!value) return '';
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    if (isNaN(num)) return value.toString();
    if (num % 1 !== 0) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return num.toLocaleString('en-US');
  };

  const downPaymentAmount = formatCurrencyNoZeroDecimals(data.downPayment);
  const downPaymentAmountThai = data.downPayment ? thaiBahtText(data.downPayment.replace(/,/g, '')) : '';

  const remainingAmount = formatCurrencyNoZeroDecimals(data.remainingAmount);
  const remainingAmountThai = data.remainingAmount ? thaiBahtText(data.remainingAmount.replace(/,/g, '')) : '';

  const installmentAmountText = formatCurrencyNoZeroDecimals(data.installmentAmount);
  const installmentAmountThai = data.installmentAmount ? thaiBahtText(data.installmentAmount.replace(/,/g, '')) : '';

  const stampDutyText = formatCurrencyNoZeroDecimals(data.stampDuty);
  const stampDutyThai = data.stampDuty ? thaiBahtText(data.stampDuty.replace(/,/g, '')) : '';

  const totalCheques = (parseInt(data.chequesPerInstallment || '0') * parseInt(data.installments || '0')).toString();
  const insurancePremiumFormatted = formatCurrencyNoZeroDecimals(data.insurancePremium);
  const insurancePremiumThai = data.insurancePremium ? thaiBahtText(data.insurancePremium.replace(/,/g, '')) : '';

  const collateralValueFormatted = formatCurrencyNoZeroDecimals(data.collateralValue);
  const collateralValueThai = data.collateralValue ? thaiBahtText(data.collateralValue.replace(/,/g, '')) : '';

  const renderSignatureGroup = (role: string, entityName: string, signatories: string, align: 'left' | 'right' = 'left') => {
    const namesArray = (signatories || '').split(/\s*และ\s*/).filter(name => name.trim());
    const combinedNames = namesArray.join(' และ ');
    return (
      <div className={`flex ${align === 'left' ? 'justify-start' : 'justify-end'} w-full`}>
        <div className="flex flex-col">
          <div className="flex items-end">
            <div className="w-[230px] border-b border-black h-6"></div>
            <div className="ml-2 whitespace-nowrap text-[11px] font-bold">
              {role.replace(':', '')}
            </div>
          </div>
          <div className="w-[230px] mt-2 text-center text-[10px] leading-tight space-y-0.5">
            <div>( {combinedNames || '............................................................'} )</div>
            <div>กรรมการผู้มีอำนาจกระทำการ</div>
            <div className="font-bold">{entityName}</div>
          </div>
        </div>
      </div>
    );
  };

  const getThaiIndex = (idx: number) => {
    const thaiLetters = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'น', 'บ', 'ป', 'ผ', 'ฝ', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ'];
    return thaiLetters[idx] || (idx + 1).toString();
  };

  const renderCollateralAsset = (asset: CollateralAsset, idx: number) => (
    <div key={idx} className="flex gap-4">
      <span className="w-8 shrink-0 whitespace-nowrap">({getThaiIndex(idx)})</span>
      <div className="flex-1">
        {asset.type === 'land' && asset.landDetails && (
          <div>
            <span className="font-bold">การจำนองที่ดิน :</span> {asset.landDetails.landType === 'building' ? 'ที่ดินพร้อมสิ่งปลูกสร้าง' : 'ที่ดินเปล่า'} โฉนดที่ดินเลขที่ <Highlight>{asset.landDetails.deedNo}</Highlight> เล่ม <Highlight>{asset.landDetails.volume}</Highlight> หน้า <Highlight>{asset.landDetails.page}</Highlight> ระวาง <Highlight>{asset.landDetails.mapSheet}</Highlight> เลขที่ดิน <Highlight>{asset.landDetails.landNo}</Highlight> หน้าสำรวจ <Highlight>{asset.landDetails.surveyNo}</Highlight> {asset.landDetails.province === 'กรุงเทพมหานคร' ? 'แขวง' : 'ตำบล'} <Highlight>{asset.landDetails.subDistrict}</Highlight> {asset.landDetails.province === 'กรุงเทพมหานคร' ? 'เขต' : 'อำเภอ'} <Highlight>{asset.landDetails.district}</Highlight> จังหวัด <Highlight>{asset.landDetails.province}</Highlight> อันเป็นทรัพย์สินที่ไม่มีภาระผูกพันของ <Highlight>{asset.landDetails.owner}</Highlight> รายละเอียดปรากฏตาม <b><u>เอกสารแนบท้ายหมายเลข 6</u></b>
          </div>
        )}
        {asset.type === 'cash' && (
          <div>
            <span className="font-bold">เงินสด :</span> เงินสดจำนวน <Highlight>{formatCurrency(asset.cashAmount || '0')}</Highlight> บาท
          </div>
        )}
        {asset.type === 'machinery' && (
          <div className="text-justify">
            <span className="font-bold">จำนำเครื่องจักร :</span> เครื่องจักร <Highlight>{asset.machineName}</Highlight>{' '}
            {asset.machineModel && <span className="italic text-gray-700">({asset.machineModel})</span>}{' '}
            จำนวน <Highlight>{asset.machineQuantity}</Highlight> <Highlight>{asset.machineUnit || 'ชุด'}</Highlight>{' '}
            ราคา <Highlight>{asset.machinePrice}</Highlight> บาท{' '}
            อันเป็นทรัพย์สินที่ไม่มีภาระผูกพันของ <Highlight>{asset.machineOwner}</Highlight>{' '}
            รายละเอียดปรากฏตาม <span className="font-bold"><u>เอกสารแนบท้ายหมายเลข 6</u></span>
          </div>
        )}
        {asset.type === 'carPledge' && asset.carPledgeDetails && (
          <div>
            <span className="font-bold">จำนำรถ :</span> รถยนต์ยี่ห้อ <Highlight>{asset.carPledgeDetails.brand}</Highlight> รุ่น <Highlight>{asset.carPledgeDetails.model}</Highlight> ทะเบียนเลขที่ <Highlight>{asset.carPledgeDetails.plateNo}</Highlight> จังหวัด <Highlight>{asset.carPledgeDetails.province}</Highlight> เลขตัวถัง <Highlight>{asset.carPledgeDetails.chassisNo}</Highlight> เลขเครื่องยนต์ <Highlight>{asset.carPledgeDetails.engineNo}</Highlight> สี <Highlight>{asset.carPledgeDetails.color}</Highlight> โดยมี <Highlight>{asset.carPledgeDetails.owner}</Highlight> เป็นผู้ถือกรรมสิทธิ์
          </div>
        )}
        {asset.type === 'stockPledge' && asset.stockPledgeDetails && (
          <div>
            <span className="font-bold">จำนำหุ้น :</span> หุ้นของบริษัท <Highlight>{asset.stockPledgeDetails.companyName}</Highlight> ตามใบถือหุ้นเลขที่ <Highlight>{asset.stockPledgeDetails.certificateNo}</Highlight> จำนวน <Highlight>{asset.stockPledgeDetails.quantity}</Highlight> หุ้น มูลค่าหุ้นละ <Highlight>{asset.stockPledgeDetails.parValue}</Highlight> บาท รวมมูลค่า <Highlight>{asset.stockPledgeDetails.totalValue}</Highlight> บาท โดยมี <Highlight>{asset.stockPledgeDetails.owner}</Highlight> เป็นผู้ถือหุ้น
          </div>
        )}
      </div>
    </div>
  );

  const renderTotalSummary = () => (
    <div className="mt-4 font-bold">
      รวมเป็นมูลค่าทั้งสิ้น <Highlight>{totalAmountFormatted}</Highlight> บาท (<Highlight>{totalAmountThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม)
    </div>
  );

  return (
    <div className="text-gray-900 font-sans leading-[1.8] text-[13px] text-justify tracking-normal whitespace-pre-line space-y-8 print:space-y-0 mx-auto">
      {/* Page 1 */}
      <div data-section-id="hp-general" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none border-b border-gray-100">
        <PageHeader />

        <div className="text-center font-bold mb-6 mt-4">
          <h2 className="text-[16px]">
            {type === 'hirePurchase' && "สัญญาเช่าซื้อ (Hire Purchase Agreement)"}
            {type === 'hirePurchaseBack' && "สัญญาเช่าซื้อกลับ (Hire Purchase Back Agreement)"}
            {type !== 'hirePurchase' && type !== 'hirePurchaseBack' && CONTRACT_TYPE_LABELS[type]}
          </h2>
          <div className="mt-2 text-[16px]">
            สัญญาเลขที่ <Highlight>{data.contractNo}</Highlight>
          </div>
        </div>

        <div className="indent-10 mb-6">
          สัญญาเช่าซื้อ <b>(“สัญญา”)</b> ฉบับนี้ ทำขึ้นที่ บริษัท อาไจล์ แอสเซ็ทส์ จำกัด เมื่อวันที่ <Highlight>{formatThaiDate(data.contractDate)}</Highlight> โดยและระหว่าง:
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-2 text-justify">
            <span className="shrink-0 w-8">1.</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{data.lessor1.name}</Highlight></span> (โดย<Highlight>{data.lessor1Signatories}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(data.lessor1.address, data.lessor1.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(data.lessor1.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้เช่าซื้อฝ่ายที่ 1”</b>)
            </div>
          </div>
          <div className="flex gap-2 text-justify">
            <span className="shrink-0 w-8">2.</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{data.lessor2.name}</Highlight></span> (โดย<Highlight>{data.lessor2Signatories}</Highlight> กรรมการผู้มีอำนาจกระทำการแทนบริษัท) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(data.lessor2.address, data.lessor2.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(data.lessor2.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้ให้เช่าซื้อฝ่ายที่ 2”</b>)
            </div>
          </div>
          <div className="pl-6">
            (ซึ่ง 1. และ 2. ต่อไปจะเรียกรวมกันว่า <b>“ผู้ให้เช่าซื้อ”</b>) และ
          </div>
          <div className="flex gap-2 text-justify">
            <span className="shrink-0 w-8">3.</span>
            <div className="flex-1">
              <span className="font-bold"><Highlight>{customerInfo.companyName}</Highlight></span> (โดย<Highlight>{customerInfo.directors || data.lesseeSignatories}</Highlight> {getAuthorizedSignatoryText(customerInfo)}) มีสำนักงานจดทะเบียนตั้งอยู่เลขที่ <Highlight>{stripAddressPrefix(formatAddressWithPostalCode(customerInfo.address, customerInfo.postalCode))}</Highlight> ทะเบียนนิติบุคคลเลขที่ <Highlight>{formatThaiId(customerInfo.taxId)}</Highlight> (ซึ่งต่อไปในสัญญานี้เรียกว่า <b>“ผู้เช่าซื้อ”</b>)
            </div>
          </div>
        </div>

        <div className="font-bold mb-4">โดยที่</div>
        <div className="space-y-3 mb-6">
          <div className="flex gap-4">
            <span className="w-8 shrink-0 whitespace-nowrap">ก.</span>
            <div className="flex-1">ผู้เช่าซื้อมีความประสงค์จะเช่าซื้อทรัพย์สินจากผู้ให้เช่าซื้อ</div>
          </div>
          <div className="flex gap-4">
            <span className="w-8 shrink-0 whitespace-nowrap">ข.</span>
            <div className="flex-1">ผู้ให้เช่าซื้อตกลงจะให้เช่าซื้อทรัพย์สินแก่ผู้เช่าซื้อตามเงื่อนไขและข้อกำหนดที่ระบุไว้ในสัญญาฉบับนี้</div>
          </div>
        </div>

        {renderPageFooter(1)}
      </div>

      {/* Page 2 */}
      <div data-section-id="hp-assets" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />

        <div className="space-y-4 mb-6 mt-4">
          <div className="flex gap-4">
            <span className="w-8 shrink-0 whitespace-nowrap">ค.</span>
            <div className="flex-1">ผู้ให้เช่าซื้อฝ่ายที่ 1 ประสงค์จะทำหน้าที่เป็นตัวแทนของผู้ให้เช่าซื้อในการติดต่อประสานงานกับผู้เช่าซื้อเพื่อประโยชน์ในการปฏิบัติหน้าที่ตามสัญญาฉบับนี้ (<b>“ตัวแทนเช่าซื้อ”</b>)</div>
          </div>
          <div className="flex gap-4">
            <span className="w-8 shrink-0 whitespace-nowrap">ง.</span>
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
                  <Highlight>{data.lessor1.proportion}</Highlight> ({thaiNumberText(data.lessor1.proportion)})
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2">ผู้ให้เช่าซื้อฝ่ายที่ 2</td>
                <td className="border border-black p-2 font-bold">
                  <Highlight>{data.lessor2.proportion}</Highlight> ({thaiNumberText(data.lessor2.proportion)})
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-6">
          <div className="font-bold mb-2">2. รายละเอียดของทรัพย์สินที่เช่าซื้อ</div>
          <div className="flex gap-4 mb-2">
            <span className="w-8 shrink-0">2.1</span>
            <div className="flex-1">ผู้ให้เช่าซื้อตกลงให้เช่าซื้อ และผู้เช่าซื้อตกลงเช่าซื้อเครื่องจักรและอุปกรณ์ประกอบ ดังต่อไปนี้</div>
          </div>
          <div className="space-y-4 pl-8">
            {data.assets?.slice(0, firstPageMax).map((asset, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="w-12 shrink-0 whitespace-nowrap">(2.1.{idx + 1})</span>
                <div className="flex-1">
                  <span>
                    <Highlight>{asset.name}</Highlight> <Highlight>{asset.description}</Highlight> จำนวน <Highlight>{asset.quantity}</Highlight> <Highlight>{asset.unit}</Highlight> ราคา <Highlight>{asset.totalAmount}</Highlight> บาท <Highlight>({thaiBahtText(asset.totalAmount)})</Highlight> <span>(รวมภาษีมูลค่าเพิ่ม)</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          {(!data.assets || data.assets.length <= firstPageMax) && renderTotalSummary()}
        </div>

        {renderPageFooter(2)}
      </div>

      {/* Overflow Asset Pages (if needed) */}
      {overflowPagesCount > 0 && Array.from({ length: overflowPagesCount }).map((_, pageIndex) => {
        const startIndex = pageIndex * subsequentPageMax;
        const endIndex = startIndex + subsequentPageMax;
        const pageAssets = dedicatedOverflowAssets.slice(startIndex, endIndex);
        const currentPageNum = 3 + pageIndex;

        return (
          <div key={`overflow-page-${pageIndex}`} className="print-page relative min-h-[1050px] p-24">
            <PageHeader />
            <div className="mt-8 space-y-4 pl-8">
              {pageAssets.map((asset, idx) => {
                const globalIdx = firstPageMax + startIndex + idx;
                return (
                  <div key={globalIdx} className="flex gap-2">
                    <span className="w-12 shrink-0 whitespace-nowrap">(2.1.{globalIdx + 1})</span>
                    <div className="flex-1">
                      <span>
                        <Highlight>{asset.name}</Highlight> <Highlight>{asset.description}</Highlight> จำนวน <Highlight>{asset.quantity}</Highlight> <Highlight>{asset.unit}</Highlight> ราคา <Highlight>{asset.totalAmount}</Highlight> บาท <Highlight>({thaiBahtText(asset.totalAmount)})</Highlight> <span>(รวมภาษีมูลค่าเพิ่ม)</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {pageIndex === overflowPagesCount - 1 && integratedAssetsCount === 0 && renderTotalSummary()}
            {renderPageFooter(currentPageNum)}
          </div>
        );
      })}

      {/* Contract Sections Page 1 */}
      <div data-section-id="hp-purpose" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />

        {integratedAssets.length > 0 && (
          <div className="space-y-4 pl-8 mb-6 mt-6">
            {integratedAssets.map((asset, idx) => {
              const globalIdx = assetCount - integratedAssets.length + idx;
              return (
                <div key={globalIdx} className="flex gap-2">
                  <span className="w-12 shrink-0 whitespace-nowrap">(2.1.{globalIdx + 1})</span>
                  <div className="flex-1">
                    <span>
                      <Highlight>{asset.name}</Highlight> <Highlight>{asset.description}</Highlight> จำนวน <Highlight>{asset.quantity}</Highlight> <Highlight>{asset.unit}</Highlight> ราคา <Highlight>{asset.totalAmount}</Highlight> บาท <Highlight>({thaiBahtText(asset.totalAmount)})</Highlight> <span>(รวมภาษีมูลค่าเพิ่ม)</span>
                    </span>
                  </div>
                </div>
              );
            })}
            {renderTotalSummary()}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div>
            ซึ่งเครื่องจักรและอุปกรณ์ประกอบในข้อ 2.1 ต่อไปนี้จะเรียกรวมว่า (<b>“ทรัพย์สินที่เช่าซื้อ”</b>) และผู้ให้เช่าซื้อตกลงให้เช่าซื้อทรัพย์สินที่เช่าซื้อตามสัดส่วนกรรมสิทธิ์รวมที่กำหนดไว้ในข้อ 1. ของสัญญาฉบับนี้
          </div>

          <div className="flex gap-4" data-section-id="hp-purpose">
            <span className="w-8 shrink-0">2.2</span>
            <div className="flex-1">
              ผู้เช่าซื้อตกลงเช่าซื้อทรัพย์สินไปเพื่อใช้ในการประกอบกิจการเกี่ยวกับ <Highlight>{data.businessPurpose}</Highlight> เท่านั้น ณ <Highlight>{data.installationLocation}</Highlight> <b>(“สถานที่ตั้ง”)</b> แต่หากภายหลังจากที่เข้าทำสัญญาฉบับนี้ ในกรณีที่ผู้เช่าซื้อจำเป็นต้องทำการเคลื่อนย้ายทรัพย์สินที่เช่าซื้อจากสถานที่ตั้งเดิมที่เคยแจ้งไว้ตามสัญญาฉบับนี้ ผู้เช่าซื้อจะต้องได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้เช่าซื้อก่อนการเคลื่อนย้ายทรัพย์สินที่เช่าซื้อออกจากสถานที่ตั้งเดิม
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">2.3</span>
            <div className="flex-1">
              การเช่าซื้อทรัพย์สินที่เช่าซื้อ <b>(ตามสภาพ)</b> ผู้เช่าซื้อตกลง ยินยอม และรับทราบว่าผู้ให้เช่าซื้อ <u>มิได้</u>ให้คำรับรองแต่อย่างหนึ่งอย่างใดไม่ว่าทางตรง ทางอ้อม หรือโดยปริยาย เกี่ยวกับความเสียหายและความชำรุดบกพร่องของทรัพย์สินที่เช่าซื้อ และผู้ให้เช่าซื้อ <u>มิได้</u>ให้การรับประกันใด ๆ ในเรื่องสภาพของทรัพย์สินที่เช่าซื้อดังกล่าวและผู้เช่าซื้อตกลงจะไม่ใช้สิทธิเรียกร้องใด ๆ สำหรับความชำรุดบกพร่องของทรัพย์สินที่เช่าซื้อ หรือการถูกรอนสิทธิจากทรัพย์สินที่เช่าซื้อที่เกิดขึ้นหรือปรากฏขึ้นภายหลังจากวันที่ผู้เช่าซื้อรับมอบและตรวจสอบทรัพย์สินที่เช่าซื้อ รวมทั้งไม่มีสิทธิในการยึดหน่วงหรือระงับการชำระค่าเช่าซื้อหรือเงินอื่นใดที่จะต้องชำระให้แก่ผู้ให้เช่าซื้อจนกว่าจะครบถ้วนตามจำนวนที่ระบุในสัญญาฉบับนี้
            </div>
          </div>

          <div className="pt-4">
            <div className="font-bold mb-4">3. ค่าเช่าซื้อ การชำระค่าเช่าซื้อ และค่าใช้จ่ายอื่น ๆ</div>
            <div className="flex gap-4">
              <span className="w-8 shrink-0">3.1</span>
              <div className="flex-1">
                <b>ผู้เช่าซื้อตกลงชำระค่าเช่าซื้อในราคา <Highlight>{totalAmountFormatted}</Highlight> บาท (<Highlight>{totalAmountThai}</Highlight>) (“ค่าเช่าซื้อ”)</b> ให้แก่ผู้ให้เช่าซื้อตามสัดส่วนที่ระบุในข้อ 1. และตามรายละเอียดที่ระบุในข้อ 3.2 ของสัญญาฉบับนี้
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(3 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 2 (3.2 and 3.3) */}
      <div data-section-id="hp-financials" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4" data-section-id="hp-financials">
            <span className="w-8 shrink-0">3.2</span>
            <div className="flex-1 space-y-4">
              <div className="underline">การชำระค่าเช่าซื้อ</div>
              {type !== 'hirePurchaseBack' && (
                <div className="flex gap-4">
                  <span className="w-8 shrink-0 whitespace-nowrap">(ก)</span>
                  <div className="flex-1">
                    ผู้เช่าซื้อตกลงชำระเงินค่าเช่าซื้อครั้งแรก <b>(Down Payment) (“เงินดาวน์”) ในอัตราร้อยละ <Highlight>{data.downPaymentPercentage} ({thaiBahtText(data.downPaymentPercentage || '0').replace('บาทถ้วน', '').trim()})</Highlight> ของราคาทรัพย์สินที่เช่าซื้อ คิดเป็นเงินจำนวน <Highlight>{downPaymentAmount}</Highlight> บาท (<Highlight>{downPaymentAmountThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม)</b> ในวันที่เข้าทำสัญญาฉบับนี้ โดยคู่สัญญาทั้งสามฝ่ายตกลงให้เงินดาวน์ดังกล่าวเป็นส่วนหนึ่งของเงินค่าเช่าซื้อ
                    {data.hasCustomGreenText !== false && data.customGreenText && (
                      <div className="mt-4">
                        <GreenHighlight>{data.customGreenText}</GreenHighlight>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">{type === 'hirePurchaseBack' ? '(ก)' : '(ข)'}</span>
                <div className="flex-1">
                  ผู้เช่าซื้อตกลงชำระเงินค่าเช่าซื้อ{type === 'hirePurchaseBack' ? 'เป็นงวด' : 'ที่เหลือทั้งหมด (จำนวนค่าเช่าซื้อที่หักด้วยเงินดาวน์)'} ให้แก่ผู้ให้เช่าซื้อ<b>เป็นจำนวนเงินทั้งสิ้น <Highlight>{remainingAmount}</Highlight> บาท (<Highlight>{remainingAmountThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม) โดยคิดดอกเบี้ย<Highlight>{(data.interestType === 'แบบคงที่' ? 'แบบคงที่ (Flat Interest Rate)' : 'แบบลดต้นลดดอก (Effective Interest Rate)')}</Highlight> ที่อัตราร้อยละ <Highlight>{data.interestRate}</Highlight> ต่อปี โดยผ่อนชำระค่าเช่าซื้อเป็นงวด งวดละ <Highlight>{installmentAmountText}</Highlight> บาท (<Highlight>{installmentAmountThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม)</b> (โดยแต่ละงวดเรียกว่า <b>“ค่างวดการเช่าซื้อ”</b>)
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">{type === 'hirePurchaseBack' ? '(ข)' : '(ค)'}</span>
                <div className="flex-1">
                  <b>ผู้เช่าซื้อตกลงจะชำระค่างวดการเช่าซื้อให้แก่ผู้ให้เช่าซื้อ งวดแรกภายในวันที่ <Highlight>{formatThaiDate(data.firstInstallmentDate)}</Highlight></b> และจะชำระค่าเช่าซื้อแต่ละงวดให้แก่ผู้ให้เช่าซื้อ ภายในวันที่ <Highlight>{data.paymentDay}</Highlight> ของทุกเดือน จนกว่าจะชำระค่างวดการเช่าซื้อให้แก่ผู้ให้เช่าซื้อครบถ้วนตามจำนวน รวมทั้งสิ้น <Highlight>{data.installments}</Highlight> งวด <b>โดยงวดสุดท้าย กำหนดชำระภายในวันที่ <Highlight>{formatThaiDate(data.lastInstallmentDate)}</Highlight></b>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4" data-section-id="hp-stamp-duty">
            <span className="w-8 shrink-0">3.3</span>
            <div className="flex-1 space-y-4">
              <div className="underline">ค่าอากรแสตมป์</div>
              <div>
                <b>ผู้เช่าซื้อมีหน้าที่ต้องชำระค่าอากรแสตมป์สำหรับการทำสัญญาฉบับนี้ <Highlight>เป็นจำนวนทั้งสิ้น {stampDutyText} บาท ({stampDutyThai})</Highlight> โดยตกลงชำระ ณ วันที่ทำสัญญาฉบับนี้</b> และมีหน้าที่ต้องชำระค่าภาษีอากรอื่น ๆ
                ในทำนองเดียวกันที่เกี่ยวข้องกับสัญญาฉบับนี้ แต่เพียงผู้เดียว (เว้นแต่ ค่าอากรแสตมป์ และค่าภาษีอากรอื่น ๆ ที่เกี่ยวข้องกับหนังสือโอนสิทธิ และ/หรือ หน้าที่ (หากมี)) และหากผู้ให้เช่าซื้อได้ชำระค่าอากรแสตมป์ หรือค่าภาษีอากรอื่น ๆ ไปแทนผู้เช่าซื้ออันเนื่องมาจากการที่ผู้เช่าซื้อชำระล่าช้าหรือไม่ชำระเงินค่าอากรดังกล่าว ผู้เช่าซื้อต้องชดใช้เงินจำนวนดังกล่าวคืนให้แก่ผู้ให้เช่าซื้อเต็มจำนวน

              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(4 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 3 (3.4 to 3.7) */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="w-8 shrink-0">3.4</span>
            <div className="flex-1 space-y-2">
              <div className="underline">ค่าบริการอันเกี่ยวข้องกับสัญญาฉบับนี้</div>
              <div>
                <b>ผู้เช่าซื้อตกลงและยินยอมชำระค่าบริการในการจดทะเบียน และ/หรือจดจำนองทรัพย์สินหลักประกันกับหน่วยงานราชการที่เกี่ยวข้อง</b> และค่าบริการในการจดทะเบียนกรรมสิทธิ์เครื่องจักร (ถ้ามี) หรือค่าใช้จ่ายอื่น ๆ ให้แก่ผู้ให้เช่าซื้อ โดยตกลงชำระ ณ วันที่ทำสัญญาฉบับนี้
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">3.5</span>
            <div className="flex-1 space-y-2">
              <div className="underline">ค่าธรรมเนียมการจดทะเบียนหลักประกัน หรือ กรรมสิทธิ์เครื่องจักร</div>
              <div>
                ผู้เช่าซื้อตกลงยินยอมรับผิดชอบบรรดาค่าธรรมเนียมและค่าใช้จ่ายอื่นใดเกี่ยวกับการจดทะเบียนจำนองทรัพย์สินหลักประกัน หรือ จดทะเบียนกรรมสิทธิ์เครื่องจักร (ถ้ามี)
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">3.6</span>
            <div className="flex-1">
              ผู้เช่าซื้อตกลงยินยอมให้ผู้ให้เช่าซื้อนำเงินที่ได้รับชำระในแต่ละงวดตามสัดส่วนในข้อ 1. นำไปหักหรือรับชำระหนี้ส่วนใด ก่อน-หลัง ได้ตามเงื่อนไขที่ผู้ให้เช่าซื้อกำหนดไว้ และผู้เช่าซื้อยินยอมให้ผู้ให้เช่าซื้อทั้งสองฝ่ายทำการปรับปรุงบัญชี และ/หรือ รายการรับชำระหนี้ได้ โดยผู้เช่าซื้อตกลงให้เป็นดุลยพินิจของผู้ให้เช่าซื้อ
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">3.7</span>
            <div className="flex-1">
              กรณีที่มีค่าใช้จ่ายอันเกิดจากการที่เช็คสั่งจ่ายล่วงหน้าเพื่อชำระหนี้ ไม่อาจขึ้นเงินได้ไม่ว่ากรณีใดก็ตาม และ/หรือ ในกรณีที่มีค่าธรรมเนียมในการเรียกเก็บเช็คข้ามเขต และ/หรือ กรณีอื่น ๆ ที่ก่อให้เกิดค่าใช้จ่ายอันเกี่ยวกับเช็คสั่งจ่ายล่วงหน้าโดยมิใช่ความผิดของผู้ให้เช่าซื้อ ผู้เช่าซื้อตกลงชำระให้แก่ผู้ให้เช่าซื้อทั้งสองฝ่ายในสัดส่วนตามข้อ 1. ของสัญญาฉบับนี้ ภายในระยะเวลาที่ผู้ให้เช่าซื้อกำหนด
            </div>
          </div>
        </div>
        {renderPageFooter(5 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 4 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="font-bold mb-4">4. วิธีการชำระเงิน</div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">4.1</span>
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
            <span className="w-8 shrink-0">4.2</span>
            <div className="flex-1">
              {data.clause4_2Text}
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">4.3</span>
            <div className="flex-1">
              ในกรณีที่ผู้เช่าซื้อประสงค์จะชำระหนี้ด้วยวิธีการอื่นใด และ/หรือ เนื่องจากมีเหตุผิดนัดชำระ ชำระเบี้ยปรับค่าใช้จ่ายอื่นใดที่เกี่ยวข้องกับสัญญาฉบับนี้ ให้ผู้เช่าซื้อดำเนินการชำระผ่านบัญชีธนาคาร <b>ชื่อบัญชี บริษัท อาไจล์ แอสเซ็ทส์ จำกัด ธนาคารกสิกรไทย ประเภทออมทรัพย์ หมายเลขบัญชี 025-3-77662-5</b>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">4.4</span>
            <div className="flex-1">
              คู่สัญญาทั้งสามฝ่ายตกลงว่าถ้าวันครบกำหนดชำระเงินใด ๆ มิใช่วันทำการ ก็ให้เงินจำนวนนั้น ๆ ถึงกำหนดชำระในวันทำการ ก่อนวันถึงกำหนดชำระนั้น
            </div>
          </div>
        </div>
        {renderPageFooter(6 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 5 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="font-bold mb-4">5. หน้าที่และความรับผิดชอบของผู้เช่าซื้อ</div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">5.1</span>
            <div className="flex-1 space-y-4">
              <div className="underline">การใช้ทรัพย์สินที่เช่าซื้อ</div>
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">(ก)</span>
                <div className="flex-1">
                  ผู้เช่าซื้อจะใช้สอยทรัพย์สินที่เช่าซื้อสำหรับตนเอง หรือในธุรกิจของผู้เช่าซื้อและ ณ สถานที่ที่ระบุไว้ในข้อ 2.2 ของสัญญาฉบับนี้เท่านั้น ด้วยความระมัดระวังในระดับวิญญูชนที่พึงใช้สำหรับทรัพย์สินประเภทนั้น ๆ ทั้งนี้ ห้ามมิให้ผู้เช่าซื้อใช้ และ/หรือ ยินยอมให้บุคคลอื่นใช้ ให้เช่าช่วง จำนำ จำนอง ยักย้าย เคลื่อนที่หรือกระทำการอย่างหนึ่งอย่างใดต่อทรัพย์สินที่เช่าซื้อโดยมิได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้เช่าซื้อทุกกรณี
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">(ข)</span>
                <div className="flex-1">
                  ผู้เช่าซื้อจะดูแลรักษาทรัพย์สินที่เช่าซื้อให้อยู่ในสภาพเรียบร้อยใช้งานได้ดี ในระดับวิญญูชนที่พึงใช้ในการดูแลรักษาทรัพย์สินของตน และจัดให้มีการซ่อมแซมที่ดี รวมถึงการบำรุงรักษาทรัพย์สินตามกำหนดระยะเวลาในการบำรุงรักษาด้วย ผู้เช่าซื้อตกลงแจ้งให้ตัวแทนผู้ให้เช่าซื้อทราบเป็นลายลักษณ์อักษรโดยทันที ถ้าทรัพย์สินไม่สามารถใช้งานได้ตามปกติ หรือเกิดความเสียหายหรือสูญหาย หรือถูกทำลาย หรือผู้เช่าซื้อไม่ได้ใช้ทรัพย์สินเป็นระยะเวลาเกินกว่า 30 (สามสิบ) วัน
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">(ค)</span>
                <div className="flex-1">
                  <div>ผู้เช่าซื้อจะไม่เปลี่ยนแปลงสภาพ ดัดแปลง แก้ไข หรือต่อเติมทรัพย์สินที่เช่าซื้อ อุปกรณ์ หรืออะไหล่ หรือส่วนหนึ่งส่วนใดของทรัพย์สินด้วยประการใด ๆ เว้นแต่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้ให้เช่าซื้อ</div>
                  <div className="mt-4">ทั้งนี้ ในกรณีที่ผู้เช่าซื้อฝ่าฝืน ไม่ว่าการฝ่าฝืนนั้นจะก่อให้เกิดความเสียหาย หรือทำให้การรับประกันของทรัพย์สินสิ้นสุลงหรือไม่ก็ตาม ผู้ให้เช่าซื้อ และ/หรือ ตัวแทนเช่าซื้อมีสิทธิดำเนินการดังต่อไปนี้</div>
                  <div className="mt-4 space-y-1">
                    <div className="flex gap-4">
                      <span className="w-8 shrink-0 whitespace-nowrap">(1)</span>
                      <div className="flex-1">เรียกร้องให้ผู้เช่าซื้อดัดแปลงกลับคืนสู่สภาพเดิมด้วยค่าใช้จ่ายของผู้เช่าซื้อเองทันที</div>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-8 shrink-0 whitespace-nowrap">(2)</span>
                      <div className="flex-1">บรรดาส่วนควบ อุปกรณ์ หรือส่วนต่อเติมใด ๆ ที่ผู้เช่าซื้อได้ทำขึ้น ให้ตกเป็นกรรมสิทธิ์ของผู้ให้เช่าซื้อทันทีโดยไม่มีค่าชดเชย เว้นแต่ผู้ให้เช่าซื้อจะสั่งให้รื้อถอนออก</div>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-8 shrink-0 whitespace-nowrap">(3)</span>
                      <div className="flex-1">เรียกร้องค่าเสียหาย ค่าขาดประโยชน์ หรือค่าใช้จ่ายใด ๆ ทั้งสิ้นที่เกิดขึ้นในปัจจุบันและอนาคต อันเนื่องมาจากการฝ่าฝืนหรือการสิ้นสุดของการรับประกันดังกล่าว</div>
                    </div>
                    <div className="flex gap-4">
                      <span className="w-8 shrink-0 whitespace-nowrap">(4)</span>
                      <div className="flex-1">บอกเลิกสัญญาฉบับนี้ได้ทันทีตามข้อ 9. ของสัญญาฉบับนี้</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(7 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 6 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="w-8 shrink-0">5.2</span>
            <div className="flex-1 space-y-2">
              <div className="underline">ค่าใช้จ่ายและค่าธรรมเนียม</div>
              <div>
                ผู้เช่าซื้อตกลงชำระและรับผิดชอบค่าใช้จ่ายทั้งปวง และ/หรือ การดำเนินการอย่างหนึ่งอย่างใดหรือหลายอย่างอันเกี่ยวกับทรัพย์สินที่เช่าซื้อตามรายละเอียดและข้อกำหนดที่ผู้ให้เช่าซื้อกำหนดไว้อย่างเคร่งครัด
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">5.3</span>
            <div className="flex-1 space-y-2">
              <div className="underline">การเข้าถึงข้อมูลการใช้งานและการตรวจสอบสภาพของทรัพย์สิน</div>
              <div>
                ผู้เช่าซื้อยินยอมและอนุญาตให้ตัวแทนเช่าซื้อ ผู้ให้เช่าซื้อ ตัวแทน หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งโดยชอบจากตัวแทนเช่าซื้อหรือผู้ให้เช่าซื้อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งจากผู้ผลิตทรัพย์สินที่เช่าซื้อ หรือ ตัวแทนจำหน่าย ให้มีสิทธิเข้าถึงข้อมูลการใช้งานทรัพย์สินที่เช่าซื้อในการใช้งานและการบำรุงรักษา เพื่อให้สามารถตรวจสอบประสิทธิภาพของทรัพย์สินที่เช่าซื้อได้ในระหว่างที่สัญญาฉบับนี้มีผลบังคับใช้ ทั้งนี้ ไม่ว่าการเข้าถึงข้อมูลดังกล่าวจะกระทำผ่านทางระบบออนไลน์ หรือทางการติดต่อสื่อสารใด ๆ ทั้งสิ้น หากตัวแทนเช่าซื้อหรือผู้ให้เช่าซื้อตรวจพบว่าทรัพย์สินหรือส่วนหนึ่งส่วนใดของทรัพย์สินที่เช่าซื้อ เสียหาย ชำรุด หรืออยู่ในสภาพที่ไม่เหมาะสมแก่การใช้งาน ตัวแทนเช่าซื้อจะดำเนินการแจ้งเป็นลายลักษณ์อักษรไปยังผู้เช่าซื้อเพื่อให้ทราบเรื่องดังกล่าว และให้ดำเนินการซ่อมแซมทรัพย์สินในการนี้ ผู้เช่าซื้อตกลงที่จะทำการซ่อมแซมทรัพย์สินให้กลับคืนสู่สภาพที่ดีและเหมาะสมในการใช้งานได้อย่างมีประสิทธิภาพ โดยค่าใช้จ่ายทั้งหมดให้ถือเป็นหน้าที่ของผู้เช่าซื้อเอง
              </div>
          </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">5.4</span>
            <div className="flex-1 space-y-2">
              <div className="underline">การให้ความยินยอมเปิดเผยข้อมูล</div>
              <div>
                ผู้เช่าซื้อตกลงให้ความยินยอมเปิดเผยข้อมูลโดยชอบด้วยกฎหมายแก่ตัวแทนเช่าซื้อ ผู้ให้เช่าซื้อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งโดยชอบจากตัวแทนเช่าซื้อหรือผู้ให้เช่าซื้อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งจากผู้ผลิตทรัพย์สินที่เช่าซื้อ หรือ ตัวแทนจำหน่าย ในการเข้าถึง รวบรวม ตรวจสอบ และบันทึกข้อมูลดังต่อไปนี้ตลอดอายุสัญญาเช่าซื้อฉบับนี้
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(8 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 7 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="w-8 shrink-0 opacity-0">5.4</span>
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <div className="flex gap-4">
                  <span className="w-8 shrink-0 whitespace-nowrap">(ก)</span>
                  <div className="flex-1">ข้อมูลการผลิต : ปริมาณการผลิต ชั่วโมงการทำงานของเครื่องจักร แผนการบำรุงรักษาเครื่องจักรประจำวัน และ/หรือ ประจำเดือน และ/หรือ นำส่งรูปถ่ายเครื่องจักร และ/หรือ วิธีโอกาสการทำงานของเครื่องจักร</div>
                </div>
                <div className="flex gap-4">
                  <span className="w-8 shrink-0 whitespace-nowrap">(ข)</span>
                  <div className="flex-1">ข้อมูลรายได้ : รายงานยอดขาย, บัญชีรายรับ-รายจ่ายเกี่ยวข้องกับการใช้ทรัพย์สินที่เช่าซื้อ, สำเนาใบกำกับภาษี/ใบเสร็จรับเงิน และข้อมูลทางการเงินอื่นที่แสดงถึงรายได้ที่เกิดจากการประกอบกิจการของผู้เช่าซื้อ</div>
                </div>
              </div>
              <div>
                ทั้งนี้ ผู้เช่าซื้อยินยอมจัดส่งข้อมูลตามข้อ 5.4 ให้แก่ผู้ให้เช่าซื้อ และ/หรือ ตัวแทน โดยวิธีการดังต่อไปนี้
              </div>
              <div className="space-y-1">
                <div className="flex gap-4">
                  <span className="w-12 shrink-0 whitespace-nowrap">5.4.1.</span>
                  <div className="flex-1">จัดส่งรายงานสรุปยอดขายและยอดการผลิตเป็นไฟล์รูปภาพ และ/หรือ ตามที่ตัวแทนเช่าซื้อร้องขอ</div>
                </div>
                <div className="flex gap-4">
                  <span className="w-12 shrink-0 whitespace-nowrap">5.4.2.</span>
                  <div className="flex-1">ผู้เช่าซื้อยินยอมให้ผู้ให้เช่าซื้อหรือตัวแทนเช่าซื้อเชื่อมต่อระบบดึงข้อมูลอัตโนมัติ (API หรือระบบ Cloud ของเครื่องจักร) หากมี</div>
                </div>
                <div className="flex gap-4">
                  <span className="w-12 shrink-0 whitespace-nowrap">5.4.3.</span>
                  <div className="flex-1">ผู้เช่าซื้อยินยอม/ให้ตัวแทนเช่าซื้อ ผู้ให้เช่าซื้อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้ง โดยชอบจากตัวแทนเช่าซื้อหรือผู้ให้เช่าซื้อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งจากผู้ผลิตทรัพย์สินที่เช่าซื้อ หรือ ตัวแทนจำหน่ายเข้าตรวจเยี่ยมสถานที่ตั้งของทรัพย์สินเพื่อตรวจสอบข้อมูลการผลิตจริง โดยจะแจ้งล่วงหน้าไม่น้อยกว่า 3 วันทำการ</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="w-8 shrink-0">5.5</span>
            <div className="flex-1 space-y-2">
              <div className="underline">การรับประกันและการบริการบำรุงรักษาทรัพย์สิน โดยผู้ผลิต</div>
              <div>
                การรับประกันและการบริการบำรุงรักษาทรัพย์สินที่เช่าซื้อ ให้เป็นไปตามเงื่อนไขที่ผู้ผลิตทรัพย์สินที่เช่าซื้อกำหนดไว้ทุกประการ
              </div>
            </div>
          </div>

        </div>
        {renderPageFooter(9 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 7 - Section 6 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4" data-section-id="hp-insurance">
            <span className="w-8 shrink-0">5.6</span>
            <div className="flex-1 space-y-2">
              <div className="underline">การประกันภัยทรัพย์สิน</div>
              <div>
                ตลอดอายุของสัญญาฉบับนี้ ผู้เช่าซื้อตกลงจะทำประกันภัยทรัพย์สินกับบริษัทประกันภัยที่ผู้ให้เช่าซื้อยอมรับ<b>โดยเงื่อนไขการเอาประกันภัยจะเป็นไปตามที่ผู้ให้เช่าซื้อกำหนด และผู้เช่าซื้อตกลงชำระค่าเบี้ยประกันภัยเป็นรายปี จำนวนเงิน <Highlight>{insurancePremiumFormatted}</Highlight> บาท (<Highlight>{insurancePremiumThai}</Highlight>) (รวมภาษีมูลค่าเพิ่ม)</b> ด้วยวิธีการสั่งจ่ายเช็คล่วงหน้าในนามผู้ให้เช่าซื้อฝ่ายที่ 1 ให้ครบถ้วนตามจำนวนปีของอายุสัญญา และมอบไว้ให้แก่ผู้ให้เช่าซื้อฝ่ายที่ 1 ณ วันที่ทำสัญญาฉบับนี้ เพื่อให้ผู้ให้เช่าซื้อฝ่ายที่ 1 เป็นผู้ดำเนินการชำระเบี้ยประกันภัยให้แก่บริษัทประกันภัยแทนผู้เช่าซื้อ โดยหากเบี้ยประกันภัยที่จ่ายจริงต่ำกว่ายอดเงินตามเช็ค ผู้ให้เช่าซื้อจะคืนเงินส่วนเกินให้ แต่หากเบี้ยประกันภัยที่จ่ายจริงสูงกว่ายอดเงินตามเช็ค ผู้เช่าซื้อตกลงชำระส่วนที่ขาดเพิ่มทันทีภายใน 7 วัน นับจากวันที่ได้รับแจ้ง ผู้ให้เช่าซื้อมีสิทธิเข้าชำระค่าเบี้ยประกันภัยแทนไปก่อนเพื่อให้ความคุ้มครองมีผลต่อเนื่อง และให้ถือว่าเงินจำนวนที่ได้สำรองจ่ายไปนั้นเป็นหนี้ที่มีอยู่จริงและบังคับได้ตามกฎหมายซึ่งผู้เช่าซื้อต้องมีหน้าที่ชำระคืนทันที ทั้งนี้ ในกรณีที่ธนาคารปฏิเสธการจ่ายเงินตามเช็คฉบับใดฉบับหนึ่ง ผู้เช่าซื้อตกลงให้ผู้ให้เช่าซื้อทรงไว้ซึ่งสิทธิในการดำเนินคดีกับผู้เช่าซื้อจนกว่าคดีจะถึงที่สุดในทางแพ่งและทางอาญาที่เกี่ยวข้องจากการที่ธนาคารปฏิเสธการจ่ายเงินตามเช็คดังกล่าว
              </div>
            </div>
          </div>

          <div className="flex gap-4 font-bold">
            <span className="">6.</span>
            <span className="">หลักประกัน</span>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">6.1</span>
            <div className="flex-1">
              ในวันที่เข้าทำสัญญาฉบับนี้และตลอดระยะเวลาของสัญญาฉบับนี้ ผู้เช่าซื้อตกลงจัดหาหลักประกันให้แก่ผู้ให้เช่าซื้อ โดยมูลค่าของหลักประกัน ภายใต้เงื่อนไขที่กำหนดในข้อ 6. ของสัญญาฉบับนี้จะต้องมีมูลค่ารวมกันไม่น้อยกว่า <Highlight>{collateralValueFormatted}</Highlight> บาท (<Highlight>{collateralValueThai}</Highlight>) หรือตามที่ผู้ให้เช่าซื้อเห็นสมควร
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">6.2</span>
            <div className="flex-1 space-y-2">
              <div>ในการทำสัญญาเช่าซื้อฉบับนี้ ผู้เช่าซื้อได้ตกลงทำสัญญาค้ำประกันโดยบุคคลภายนอก (“บุคคลค้ำประกัน”)</div>
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">(ก)</span>
                <div>
                  <span className="font-bold">สัญญาค้ำประกันโดยบุคคลภายนอก:</span> <Highlight>{(guarantors || []).filter(g => g.guarantorName.trim()).map((g, i) => `${i + 1}. ${g.guarantorName}`).join(' ')}</Highlight> โดยผู้ค้ำประกันอาจเป็นบุคคลธรรมดาหรือนิติบุคคลซึ่งไม่มีหนี้สินล้นพ้นตัว มีแหล่งรายได้ชัดเจนและมีคุณสมบัติอื่น ๆ ตามที่ผู้ให้เช่าซื้อกำหนด โดยผู้ให้เช่าซื้อขอสงวนสิทธิในการใช้ดุลยพินิจฝ่ายเดียวในการพิจารณาคุณสมบัติในการเลือกบุคคลผู้เป็นผู้ค้ำประกัน เพื่อเข้าค้ำประกันแทนหรือเพิ่มเติม เพื่อค้ำประกันหนี้สินใด ๆ ภายใต้หรือที่เกี่ยวข้องกับสัญญาฉบับนี้
                </div>
              </div>
            </div>
          </div>

        </div>
        {renderPageFooter(10 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 9 (6.3 and 6.4) */}
      <div data-section-id="hp-collateral" className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="w-8 shrink-0">6.3</span>
            <div className="flex-1 space-y-4">
              <div>ผู้เช่าซื้อตกลงว่าบรรดาทรัพย์สินดังต่อไปนี้ <b>(“ทรัพย์สินหลักประกัน”)</b> เป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้เช่าซื้อที่มีต่อผู้ให้เช่าซื้อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า</div>

              {/* Strictly show items up to limit if the list continues elsewhere */}
              {(data.collateralAssets || []).slice(0, firstPageCollateralCount).map((asset, idx) => renderCollateralAsset(asset, idx))}

              {/* Show summary text ONLY if there is no overflow */}
              {(data.collateralAssets || []).length > 0 && !isDedicatedCollateral && !isIntegratedCollateral && (
                <div className="mt-4 text-justify">
                  นอกจากนี้ ผู้ให้เช่าซื้อมีสิทธิกำหนดให้ผู้เช่าซื้อจัดหาหลักประกันประเภทอื่น ๆ ตามที่ผู้ให้เช่าซื้อเห็นสมควรมาเป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้เช่าซื้อที่มีต่อผู้ให้เช่าซื้อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า
                </div>
              )}
            </div>
          </div>

          {/* Integrated collateral overflow if exactly 4 items exist */}
          {isIntegratedCollateral && (
            <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100 italic">
              <span className="opacity-0 w-8 shrink-0">6.3</span>
              <div className="flex-1 space-y-4">
                {(data.collateralAssets || []).slice(3).map((asset, idx) => renderCollateralAsset(asset, idx + 3))}
                <div className="mt-4 text-justify">
                  นอกจากนี้ ผู้ให้เช่าซื้อมีสิทธิกำหนดให้ผู้เช่าซื้อจัดหาหลักประกันประเภทอื่น ๆ ตามที่ผู้ให้เช่าซื้อเห็นสมควรมาเป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้เช่าซื้อที่มีต่อผู้ให้เช่าซื้อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า
                </div>
              </div>
            </div>
          )}

          {!isDedicatedCollateral && (
            <>
              <div className="flex gap-4">
                <span className="w-8 shrink-0">6.4</span>
                <div className="flex-1 text-justify">
                  คู่สัญญาทั้งสามฝ่ายตกลงว่าสิทธิของผู้ให้เช่าซื้อเหนือทรัพย์สินที่เป็นหลักประกันตามข้อ 6.3 ของสัญญาฉบับนี้ นั้น เป็นไปตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้
                </div>
              </div>

              {!isIntegratedCollateral && (
                <div className="flex gap-4">
                  <span className="w-8 shrink-0">6.5</span>
                  <div className="flex-1 text-justify">
                    ในกรณีที่ทรัพย์สินหลักประกันเป็นที่ดิน และ/หรือ สิ่งปลูกสร้าง และ/หรือ เครื่องจักร และ/หรือหลักประกันอื่น ผู้เช่าซื้อตกลงจะดำเนินการประเมินมูลค่าของทรัพย์สินหลักประกันดังกล่าวโดยหน่วยงานที่เชื่อถือได้และเป็นที่ยอมรับของผู้ให้เช่าซื้อ <b>(“ผู้ประเมินมูลค่าทรัพย์สิน”)</b> และผู้เช่าซื้อจะดำเนินการให้ผู้ประเมินมูลค่าทรัพย์สินทบทวนมูลค่าทรัพย์สินหลักประกันทุก 4 ปี นับแต่วันที่ของสัญญาฉบับนี้ และ/หรือให้เป็นดุลยพินิจของผู้ให้เช่าซื้อ
                  </div>
                </div>
              )}

              {!hasCollateral && (
                <>
                  <div className="flex gap-4">
                    <span className="w-8 shrink-0">6.6</span>
                    <div className="flex-1 text-justify">
                      ในกรณีที่ทรัพย์สินหลักประกันเป็นสิ่งปลูกสร้าง และ/หรือ เครื่องจักร ผู้เช่าซื้อตกลงจัดให้มีการทำประกันภัยทรัพย์สินบนสิ่งปลูกสร้าง และ/หรือ เครื่องจักรที่เป็นทรัพย์สินหลักประกันกับบริษัทประกันภัยที่ผู้ให้เช่าซื้อยอมรับ ตลอดระยะเวลาจนกว่าผู้เช่าซื้อจะชำระหนี้ตามสัญญาฉบับนี้จนครบถ้วน โดยผู้เช่าซื้อจะเป็นผู้ชำระเบี้ยประกันและค่าใช้จ่าย และให้ผู้ให้เช่าซื้อเป็นผู้รับผลประโยชน์ตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <span className="w-8 shrink-0">6.7</span>
                    <div className="flex-1 space-y-4">
                      <div>
                        ผู้เช่าซื้อตกลงว่าหากมูลค่าทรัพย์สินหลักประกันลดลงน้อยกว่ามูลค่าตามที่ระบุในข้อ 6.1 ของสัญญาฉบับนี้ ผู้เช่าซื้อจะนำทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกันจนครบมูลค่าตามที่ระบุในข้อ 6.1 ของสัญญาฉบับนี้ ภายใน 30 (สามสิบ) วัน นับจากวันที่ผู้เช่าซื้อได้รับแจ้งจากผู้ให้เช่าซื้อ
                      </div>
                      <div>
                        หากผู้เช่าซื้อประสงค์จะขอขยายระยะเวลาการหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ผู้เช่าซื้อจะต้องแจ้งให้ตัวแทนเช่าซื้อทราบเป็นลายลักษณ์อักษรล่วงหน้าก่อนครบกำหนดในวรรคแรกไม่น้อยกว่า 7 (เจ็ด) วัน และหากผู้ให้เช่าซื้อตกลงยินยอมให้ขยายระยะเวลาในการหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ให้ถือว่าผู้ให้เช่าซื้อยินยอมให้ขยายระยะเวลาเฉพาะคราวดังกล่าวเท่านั้น ทั้งนี้ ระยะเวลา หรือ การยินยอมดังกล่าวให้เป็นดุลยพินิจของผู้ให้เช่าซื้อ
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        {renderPageFooter(11 + overflowPagesCount)}
      </div>

      {/* Contract Sections Page 10 - Dedicated Overflow for Section 6.3 (Triggered at 5+ items) */}
      {
        isDedicatedCollateral && (
          <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
            <PageHeader />
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <span className="opacity-0 w-8 shrink-0">6.3</span>
                <div className="flex-1 space-y-4">
                  {(data.collateralAssets || [])
                    .slice(firstPageCollateralCount)
                    .map((asset, idx) => renderCollateralAsset(asset, idx + (firstPageCollateralCount || 4)))}

                  <div className="mt-4 text-justify">
                    นอกจากนี้ ผู้ให้เช่าซื้อมีสิทธิกำหนดให้ผู้เช่าซื้อจัดหาหลักประกันประเภทอื่น ๆ ตามที่ผู้ให้เช่าซื้อเห็นสมควรมาเป็นหลักประกันหนี้ และ/หรือ ภาระใด ๆ ทั้งหมดของผู้เช่าซื้อที่มีต่อผู้ให้เช่าซื้อ ทั้งที่มีอยู่แล้วในขณะนี้ และ/หรือ จะมีต่อไปในภายหน้า
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 shrink-0">6.4</span>
                <div className="flex-1 text-justify">
                  คู่สัญญาทั้งสามฝ่ายตกลงว่าสิทธิของผู้ให้เช่าซื้อเหนือทรัพย์สินที่เป็นหลักประกันตามข้อ 6.3 ของสัญญาฉบับนี้ นั้น เป็นไปตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้
                </div>
              </div>

              <div className="flex gap-4">
                <span className="w-8 shrink-0">6.5</span>
                <div className="flex-1 text-justify">
                  ในกรณีที่ทรัพย์สินหลักประกันเป็นที่ดิน และ/หรือ สิ่งปลูกสร้าง และ/หรือ เครื่องจักร และ/หรือหลักประกันอื่น ผู้เช่าซื้อตกลงจะดำเนินการประเมินมูลค่าของทรัพย์สินหลักประกันดังกล่าวโดยหน่วยงานที่เชื่อถือได้และเป็นที่ยอมรับของผู้ให้เช่าซื้อ <b>(“ผู้ประเมินมูลค่าทรัพย์สิน”)</b> และผู้เช่าซื้อจะดำเนินการให้ผู้ประเมินมูลค่าทรัพย์สินทบทวนมูลค่าทรัพย์สินหลักประกันทุก 4 ปี นับแต่วันที่ของสัญญาฉบับนี้ และ/หรือให้เป็นดุลยพินิจของผู้ให้เช่าซื้อ
                </div>
              </div>
            </div>
            {renderPageFooter(12 + overflowPagesCount)}
          </div>
        )
      }

      {/* Contract Sections Page - New Page for Collateral > 0 (6.6, 6.7, 6.8) */}
      {hasCollateral && (
        <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
          <PageHeader />
          <div className="mt-8 space-y-6">
            {isIntegratedCollateral && (
              <div className="flex gap-4">
                <span className="w-8 shrink-0">6.5</span>
                <div className="flex-1 text-justify">
                  ในกรณีที่ทรัพย์สินหลักประกันเป็นที่ดิน และ/หรือ สิ่งปลูกสร้าง และ/หรือ เครื่องจักร และ/หรือหลักประกันอื่น ผู้เช่าซื้อตกลงจะดำเนินการประเมินมูลค่าของทรัพย์สินหลักประกันดังกล่าวโดยหน่วยงานที่เชื่อถือได้และเป็นที่ยอมรับของผู้ให้เช่าซื้อ <b>(“ผู้ประเมินมูลค่าทรัพย์สิน”)</b> และผู้เช่าซื้อจะดำเนินการให้ผู้ประเมินมูลค่าทรัพย์สินทบทวนมูลค่าทรัพย์สินหลักประกันทุก 4 ปี นับแต่วันที่ของสัญญาฉบับนี้ และ/หรือให้เป็นดุลยพินิจของผู้ให้เช่าซื้อ
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <span className="w-8 shrink-0">6.6</span>
              <div className="flex-1 text-justify">
                ในกรณีที่ทรัพย์สินหลักประกันเป็นสิ่งปลูกสร้าง และ/หรือ เครื่องจักร ผู้เช่าซื้อตกลงจัดให้มีการทำประกันภัยทรัพย์สินบนสิ่งปลูกสร้าง และ/หรือ เครื่องจักรที่เป็นทรัพย์สินหลักประกันกับบริษัทประกันภัยที่ผู้ให้เช่าซื้อยอมรับ ตลอดระยะเวลาจนกว่าผู้เช่าซื้อจะชำระหนี้ตามสัญญาฉบับนี้จนครบถ้วน โดยผู้เช่าซื้อจะเป็นผู้ชำระเบี้ยประกันและค่าใช้จ่าย และให้ผู้ให้เช่าซื้อเป็นผู้รับผลประโยชน์ตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-8 shrink-0">6.7</span>
              <div className="flex-1 space-y-4">
                <div>
                  ผู้เช่าซื้อตกลงว่าหากมูลค่าทรัพย์สินหลักประกันลดลงน้อยกว่ามูลค่าตามที่ระบุในข้อ 6.1 ของสัญญาฉบับนี้ ผู้เช่าซื้อจะนำทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกันจนครบมูลค่าตามที่ระบุในข้อ 6.1 ของสัญญาฉบับนี้ ภายใน 30 (สามสิบ) วัน นับจากวันที่ผู้เช่าซื้อได้รับแจ้งจากผู้ให้เช่าซื้อ
                </div>
                <div>
                  หากผู้เช่าซื้อประสงค์จะขอขยายระยะเวลาการหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ผู้เช่าซื้อจะต้องแจ้งให้ตัวแทนเช่าซื้อทราบเป็นลายลักษณ์อักษรล่วงหน้าก่อนครบกำหนดในวรรคแรกไม่น้อยกว่า 7 (เจ็ด) วัน และหากผู้ให้เช่าซื้อตกลงยินยอมให้ขยายระยะเวลาในการหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ให้ถือว่าผู้ให้เช่าซื้อยินยอมให้ขยายระยะเวลาเฉพาะคราวดังกล่าวเท่านั้น ทั้งนี้ ระยะเวลา หรือ การยินยอมดังกล่าวให้เป็นดุลยพินิจของผู้ให้เช่าซื้อ
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-8 shrink-0">6.8</span>
              <div className="flex-1">
                โดยไม่คำนึงถึงข้อ 6.1 ของสัญญาฉบับนี้ ผู้เช่าซื้อตกลงว่าในกรณีที่ผู้ให้เช่าซื้อได้ร้องขอให้ผู้เช่าซื้อจัดหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ผู้เช่าซื้อตกลงจัดหาทรัพย์สินเพิ่มเติมแก่ผู้ให้เช่าซื้อภายใน 1 (หนึ่ง) เดือน นับจากวันที่ผู้ให้เช่าซื้อร้องขอ ทั้งนี้ ผู้ให้เช่าซื้อตกลงว่าจะไม่ใช้สิทธิในข้อนี้โดยไม่มีเหตุอันสมควร
              </div>
            </div>
          </div>
          {renderPageFooter(12 + overflowPagesCount + (isDedicatedCollateral ? 1 : 0))}
        </div>
      )}

      {/* Contract Sections Page 10 - Sections 6.8-6.12 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          {!hasCollateral && (
            <div className="flex gap-4">
              <span className="w-8 shrink-0">6.8</span>
              <div className="flex-1">
                โดยไม่คำนึงถึงข้อ 6.1 ของสัญญาฉบับนี้ ผู้เช่าซื้อตกลงว่าในกรณีที่ผู้ให้เช่าซื้อได้ร้องขอให้ผู้เช่าซื้อจัดหาทรัพย์สินเพิ่มเติมมาเป็นทรัพย์สินหลักประกัน ผู้เช่าซื้อตกลงจัดหาทรัพย์สินเพิ่มเติมแก่ผู้ให้เช่าซื้อภายใน 1 (หนึ่ง) เดือน นับจากวันที่ผู้ให้เช่าซื้อร้องขอ ทั้งนี้ ผู้ให้เช่าซื้อตกลงว่าจะไม่ใช้สิทธิในข้อนี้โดยไม่มีเหตุอันสมควร
              </div>
            </div>
          )}


          <div className="flex gap-4">
            <span className="w-8 shrink-0">6.9</span>
            <div className="flex-1">
              ผู้เช่าซื้อตกลงเป็นผู้รับผิดชอบในค่าธรรมเนียม ค่าจดทะเบียน ค่าภาษีอากร อากรแสตมป์ การประเมินมูลค่าทรัพย์สิน หรือค่าใช้จ่ายอื่นใดอันเกี่ยวข้องกับสัญญาหรือเอกสารที่เกี่ยวข้องกับทรัพย์สินหลักประกัน หรือการให้หลักประกันใด ๆ ตามที่ระบุในข้อ 6.3 ของสัญญาฉบับนี้ แต่เพียงผู้เดียว
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">6.10</span>
            <div className="flex-1">
              ภายหลังจากที่ผู้เช่าซื้อได้ปฏิบัติหน้าที่ตามสัญญาฉบับนี้เสร็จสิ้นแล้ว ผู้ให้เช่าซื้อตกลงจะดำเนินการตามที่จำเป็นเพื่อส่งคืนหลักประกันดังกล่าวแก่ผู้เช่าซื้อ ภายใน 1 (หนึ่ง) เดือน หลังจากที่ผู้เช่าซื้อได้ปฏิบัติหน้าที่ตามสัญญานี้เสร็จสิ้นดังกล่าว
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">6.11</span>
            <div className="flex-1">
              ในกรณีที่ผู้เช่าซื้อมีการนำทรัพย์สินหลักประกันมาเป็นหลักประกันให้แก่ผู้ให้เช่าซื้อ ถ้าผู้ให้เช่าซื้อบังคับหลักประกันไม่ว่าจะด้วยวิธีการขายทอดตลาดแล้ว ได้เงินสุทธิไม่พอชำระหนี้ หรือเอาทรัพย์สินหลักประกันหลุดเป็นสิทธิและราคาทรัพย์สินหลักประกันนั้นต่ำกว่าจำนวนหนี้อยู่เท่าใด ผู้เช่าซื้อยอมรับชำระหนี้ที่ขาดจำนวนนั้นจากทรัพย์สินอื่นของผู้เช่าซื้อให้แก่ผู้ให้เช่าซื้อตามสัดส่วนที่ระบุในข้อ 1. ของสัญญาฉบับนี้ จนครบถ้วน
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-8 shrink-0">6.12</span>
            <div className="flex-1">
              กรณีที่มีเครื่องจักรเป็นทรัพย์สินหลักประกัน ผู้เช่าซื้อยินยอมและอนุญาตให้ผู้ให้เช่าซื้อฝ่ายใดฝ่ายหนึ่ง ตัวแทนหรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งโดยชอบจากผู้ให้เช่าซื้อ หรือผู้เชี่ยวชาญที่ได้รับการแต่งตั้งจากผู้ผลิตทรัพย์สินหรือตัวแทนจำหน่ายทรัพย์สินที่ใช้เป็นหลักประกัน ให้มีสิทธิเข้าถึงข้อมูลการใช้งานทรัพย์สินหลักประกันทั้งในการใช้งานและการบำรุงรักษา เพื่อให้สามารถตรวจสอบประสิทธิภาพของทรัพย์สินหลักประกันได้ในระหว่างที่สัญญาฉบับนี้มีผลบังคับใช้ ทั้งนี้ ไม่ว่าการเข้าถึงข้อมูลดังกล่าวจะกระทำผ่านทางระบบออนไลน์ หรือทางการติดต่อสื่อสารใด ๆ ทั้งนี้ หากผู้ให้เช่าซื้อฝ่ายใดฝ่ายหนึ่งตรวจพบว่า ทรัพย์สินหรือส่วนหนึ่งส่วนใดของทรัพย์สินเสียหาย ชำรุด หรืออยู่ในสภาพที่ไม่เหมาะสมแก่การใช้งาน ตัวแทนเช่าซื้อจะดำเนินการแจ้งเป็นลายลักษณ์อักษรไปยังผู้เช่าซื้อเพื่อให้ทราบเรื่องดังกล่าว และให้ดำเนินการซ่อมแซมทรัพย์สินในการนี้ ผู้เช่าซื้อตกลงที่จะทำการซ่อมแซมทรัพย์สินหลักประกันให้กลับคืนสู่สภาพที่ดีและเหมาะสมในการใช้งานได้อย่างมีประสิทธิภาพ ภายในระยะเวลาที่ผู้ให้เช่าซื้อกำหนด โดยค่าใช้จ่ายทั้งหมดให้ถือเป็นหน้าที่ของผู้เช่าซื้อแต่เพียงผู้เดียว
            </div>
          </div>
        </div>
        {renderPageFooter(12 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Contract Sections Page 11 - Sections 7, 8, 9 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-8">
          <div className="space-y-4">
            <div className="font-bold">7. การโอนกรรมสิทธิ์ให้แก่ผู้เช่าซื้อ</div>
            <div className="indent-8 text-justify">
              เมื่อผู้เช่าซื้อได้ชำระเงินค่าเช่าซื้อ และค่าใช้จ่ายอื่นๆ ที่ผู้ให้เช่าซื้อเรียกเก็บได้ตามสัญญานี้จนครบถ้วน ผู้ให้เช่าซื้อตกลงให้กรรมสิทธิ์ในทรัพย์สินที่เช่าซื้อเป็นของผู้เช่าซื้อทันที โดยผู้เช่าซื้อตกลงชำระค่าธรรมเนียมการโอน ทะเบียนทรัพย์สินที่เช่าซื้อให้แก่หน่วยงานราชการที่เกี่ยวข้อง (ถ้ามี) ภาษีมูลค่าเพิ่ม และภาษีอากรที่เกี่ยวข้อง
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">8. การผิดนัดชำระหนี้</div>
            <div className="indent-8 text-justify">
              หากผู้เช่าซื้อผิดนัดชำระหนี้ตามสัญญาฉบับนี้ <b>ผู้เช่าซื้อยินยอมและตกลงชำระค่าปรับกรณีผิดนัดชำระเงินใดๆ ตามสัญญาฉบับนี้ ในอัตราร้อยละ 18 (สิบแปด) ต่อปี</b> บนจำนวนต้นเงินงวดที่ผิดนัดชำระ นับแต่วันที่ครบกำหนดชำระหนี้นั้น ๆ เป็นต้นไปจนถึงวันที่ผู้เช่าซื้อได้ชำระหนี้ค้างชำระจนครบถ้วน ทั้งนี้ อัตราดอกเบี้ยผิดนัดชำระหนี้ผู้เช่าซื้อตกลงยินยอมชำระอัตราดอกเบี้ยผิดนัดดังกล่าวตามที่ผู้ให้เช่าซื้อกำหนด และไม่ว่าอัตราดอกเบี้ยผิดนัดนั้นจะเพิ่มขึ้นหรือลดลง ผู้ให้เช่าซื้อทั้งสองฝ่ายไม่ต้องบอกกล่าวผู้เช่าซื้อล่วงหน้า และมิต้องได้รับความยินยอมจากผู้เช่าซื้อก่อน โดยคู่สัญญาทั้งสามฝ่ายถือปฏิบัติเช่นนี้ตลอดไป จนกว่าผู้เช่าซื้อจะชำระค่างวดเช่าซื้อแก่ผู้ให้เช่าซื้อจนครบถ้วน
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">9. การบอกเลิกสัญญา</div>
            <div className="flex gap-4">
              <span className="w-8 shrink-0">9.1.</span>
              <div className="flex-1 text-justify">
                กรณีหากผู้เช่าซื้อผิดนัดไม่ชำระค่าเช่าซื้องวดหนึ่งงวดใด หรือไม่ปฏิบัติตามเงื่อนไขและรายละเอียดที่กำหนดไว้ในสัญญาฉบับนี้ และ/หรือ สัญญาและเอกสารอื่นใดที่เกี่ยวข้องกับทรัพย์สินหลักประกันหรือไม่ปฏิบัติตามข้อกำหนดของผู้ให้เช่าซื้อทั้งหมดหรือแต่เพียงบางส่วน เป็นเหตุให้ผู้ให้เช่าซื้อได้รับความเสียหาย ผู้ให้เช่าซื้อมีสิทธิบอกเลิกสัญญาได้ ภายใต้บทบัญญัติตามกฎหมาย โดยเมื่อมีการเลิกสัญญาฉบับนี้ ผู้ให้เช่าซื้อตกลงว่าบรรดาเงินที่ผู้เช่าซื้อได้ชำระมาแล้วแต่ก่อนให้ริบเป็นของผู้ให้เช่าซื้อ และผู้ให้เช่าซื้อมีสิทธิที่จะกลับเข้าครองทรัพย์สินที่เช่าซื้อได้
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(13 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Contract Sections Page 12 - Sections 9.2, 10 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-6">
          <div className="flex gap-4">
            <span className="w-8 shrink-0">9.2.</span>
            <div className="flex-1 text-justify">
              ผู้ให้เช่าซื้อทั้งสองฝ่ายมีสิทธิได้รับชดใช้บรรดาค่าใช้จ่าย ค่าฤชาธรรมเนียม หรือค่าธรรมเนียมทั้งปวงที่เกี่ยวข้องกับการดำเนินการทางกฎหมาย การทวงถาม การค้นหา ติดตามตัวผู้เช่าซื้อ หรือทรัพย์สิน และการติดตามเอาทรัพย์สินคืนมาจากการครอบครองของผู้เช่าซื้อ หรือบุคคล ห้างร้าน หรือบริษัทอื่นใด
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">10. การบอกกล่าว</div>
            <div className="indent-8 text-justify">
              การติดต่อหรือบอกกล่าวซึ่งทำขึ้นโดยคู่สัญญาฝ่ายหนึ่งและส่งไปยังคู่สัญญาอีกฝ่ายหนึ่ง ให้ทำเป็นหนังสือหากมิได้ระบุไว้เป็นอย่างอื่นอาจส่งโดยทางโทรสารหรือส่งทางไปรษณีย์ หรือให้คนนำไปส่งเองก็ดี ให้ส่งไปยังคู่สัญญาทุกฝ่ายตามที่อยู่ที่ได้ระบุไว้ข้างต้นของสัญญาฉบับนี้ และให้ถือว่าหนังสือบอกกล่าวนั้นได้ส่งโดยชอบแล้วเมื่อได้ดำเนินการดังต่อไปนี้
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">(ก)</span>
                <div className="flex-1">ในกรณีที่ส่งโดยบุคคล (By Hand) ให้มีผลเมื่อได้จัดส่งหนังสือบอกกล่าว</div>
              </div>
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">(ข)</span>
                <div className="flex-1">ในกรณีที่ส่งทางไปรษณีย์ลงทะเบียน ให้มีผลภายในวันที่กำหนดในใบตอบรับทางไปรษณีย์หรือใบรับที่เป็นลายลักษณ์อักษรอื่น</div>
              </div>
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">(ค)</span>
                <div className="flex-1">ในกรณีที่ส่งทางโทรสาร ให้มีผลเมื่อครบกำหนด 1 (หนึ่ง) วัน นับแต่วันที่ส่งหนังสือบอกกล่าว</div>
              </div>
              <div className="flex gap-4">
                <span className="w-8 shrink-0 whitespace-nowrap">(ง)</span>
                <div className="flex-1">ในกรณีที่ส่งทางอิเล็กทรอนิกส์ ให้มีผลในวันถัดไป</div>
              </div>
            </div>

            <div className="indent-8 text-justify mt-6">
              หนังสือบอกกล่าวหรือหนังสือติดต่อใด ๆ ที่ได้กระทำขึ้นตามข้อกำหนดดังกล่าวข้างต้น แต่หากในการส่งหนังสือบอกกล่าวหรือหนังสือติดต่อใด ๆ มิใช่วันทำการ หรือการส่งโดยบุคคลนั้นได้รับเมื่อเลิกเวลาทำการแล้ว ในสถานที่ที่ได้รับเอกสารดังกล่าว ให้ถือว่าได้ส่งโดยชอบในวันทำการของสถานที่นั้นในวันถัดไป
            </div>

            <div className="indent-8 text-justify">
              หากคู่สัญญาฝ่ายหนึ่งฝ่ายใดต้องการเปลี่ยนสถานที่อยู่ คู่สัญญาฝ่ายนั้นต้องแจ้งให้คู่สัญญาอีกฝ่ายทราบล่วงหน้าเป็นลายลักษณ์อักษรไม่น้อยกว่า 5 (ห้า) วันทำการก่อนวันที่ย้ายหรือเปลี่ยนแปลงสถานที่อยู่ ในกรณีเช่นนี้คู่สัญญาฝ่ายที่ได้รับแจ้งการเปลี่ยนแปลงสถานที่อยู่จะส่งคำบอกกล่าวให้แก่คู่สัญญาฝ่ายที่แจ้งเปลี่ยนแปลงสถานที่อยู่ตามรายละเอียดที่ได้รับแจ้งดังกล่าว
            </div>
          </div>
        </div>
        {renderPageFooter(14 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Contract Sections Page 13 - Sections 11, 12, 13, 14 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-8">
          <div className="space-y-4">
            <div className="font-bold">11. การโอนสิทธิ และ/หรือ หน้าที่</div>
            <div className="indent-8 text-justify">
              ผู้ให้เช่าซื้อมีสิทธิอย่างเต็มที่ที่จะจำหน่าย จ่ายโอน สิทธิ และ/หรือ หน้าที่ มอบ จำนำ ก่อภาระผูกพัน นำไปวางประกัน หรือจำหน่ายโดยการอื่น ซึ่งส่วนหนึ่งส่วนใดหรือทั้งหมดของสิทธิ กรรมสิทธิ์ และผลประโยชน์ของผู้ให้เช่าซื้อตามสัญญาฉบับนี้และเอกสารที่เกี่ยวข้องกับหลักประกัน และให้บุคคลผู้รับโอนสิทธิ และ/หรือ หน้าที่สามารถรับไปทั้งสิทธิ และ/หรือ หน้าที่ตามสัญญาฉบับนี้และเอกสาร ทั้งนี้ ผู้ให้เช่าซื้อที่ประสงค์จะโอนสิทธิ และ/หรือ หน้าที่ควรมีหนังสือบอกกล่าวไปยังผู้เช่าซื้อภายใน 30 (สามสิบ) วัน นับแต่วันที่มีการโอนสิทธิ และ/หรือ หน้าที่
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">12. การใช้สิทธิ</div>
            <div className="indent-8 text-justify">
              การที่คู่สัญญาฝ่ายใดฝ่ายหนึ่งไม่ใช้สิทธิหรือล่าช้าในการใช้สิทธิใด ๆ ภายใต้สัญญาฉบับนี้ มิให้ถือว่าการไม่ใช้สิทธิหรือการล่าช้าดังกล่าวเป็นการสละสิทธิของคู่สัญญาฝ่ายนั้น
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">13. การแยกต่างหากของสัญญา</div>
            <div className="indent-8 text-justify">
              ข้อกำหนดต่าง ๆ ในสัญญาฉบับนี้แต่ละข้อเป็นอิสระต่างหากจากกัน หากข้อสัญญาข้อใดข้อหนึ่งภายใต้สัญญาฉบับนี้ไม่สมบูรณ์ เป็นโมฆะ ขัดต่อกฎหมาย หรือไม่อาจบังคับใช้ได้ตามกฎหมายไม่ว่าในกรณีใด ๆ ให้ถือว่าข้อสัญญาหรือข้อกำหนดอื่น ๆ ในสัญญาฉบับนี้ ยังคงมีผลใช้บังคับได้ตามกฎหมาย
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">14. ต้นฉบับหรือตัวจริง บรรดาสรรพเอกสารที่เกี่ยวกับการทำสัญญานี้</div>
            <div className="indent-8 text-justify">
              บรรดาต้นฉบับหรือสำเนาเอกสารใด ที่เกี่ยวกับการทำสัญญาเช่าซื้อฉบับนี้ทั้งที่มีอยู่ก่อนหรือในขณะที่ทำสัญญาฉบับนี้ หรือที่อาจจะเกิดขึ้นในภายหลังโดยความตกลงและยินยอมของคู่สัญญาทั้งสามฝ่าย รวมตลอดถึงเอกสารแนบท้ายสัญญาฉบับนี้ (ถ้ามี) คู่สัญญาทั้งสามฝ่ายตกลงให้ถือเอาเอกสารทั้งหมดที่เกี่ยวข้องเป็นส่วนหนึ่งและเป็นสาระสำคัญของสัญญาเช่าซื้อฉบับนี้ด้วยทุกประการ
            </div>
          </div>
        </div>
        {renderPageFooter(15 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Contract Sections Page 14 - Sections 15, 16 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 space-y-8">
          <div className="space-y-4">
            <div className="font-bold">15. การแก้ไขสัญญา</div>
            <div className="indent-8 text-justify">
              รายละเอียดในสัญญาฉบับนี้ คู่สัญญาฝ่ายใดฝ่ายหนึ่งจะเปลี่ยนแปลงหรือแก้ไขโดยไม่ได้รับการยินยอมเป็นลายลักษณ์อักษรจากคู่สัญญาอีกฝ่ายมิได้ เว้นแต่การเปลี่ยนแปลงและแก้ไขนั้น จะได้ทำเป็นลายลักษณ์อักษร และลงนามโดยคู่สัญญาทั้งสามฝ่ายตามสัญญาฉบับนี้ และให้ถือว่าการแก้ไขสัญญาดังกล่าวเป็นส่วนหนึ่งของสัญญาฉบับนี้
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-bold">16. กฎหมายที่ใช้บังคับ</div>
            <div className="indent-8 text-justify">
              สัญญาฉบับนี้ให้ใช้บังคับและตีความตามกฎหมายไทย ข้อพิพาท ข้อโต้แย้ง หรือสิทธิเรียกร้องใด ๆ ที่เกิดจากหรือที่เกี่ยวกับสัญญาฉบับนี้ซึ่งไม่สามารถตกลงกันได้ระหว่างคู่สัญญาให้นำเสนอต่อศาลไทยที่มีเขตอำนาจ
            </div>
          </div>

          <div className="text-center mt-12 font-bold italic text-gray-600">
            (คู่สัญญาลงนามในหน้าถัดไป)
          </div>
        </div>
        {renderPageFooter(16 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Signature Page 1 - Lessor 1 & Purchaser */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-8 text-justify leading-relaxed">
          สัญญาฉบับนี้ทำขึ้นมา 3 (สาม) ฉบับ มีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านข้อความและเข้าใจในสัญญาเพื่อเป็นหลักฐานในการทำสัญญานี้ คู่สัญญาจึงลงนามในสัญญาฉบับนี้ต่อหน้าพยาน ณ วันที่ซึ่งได้ระบุไว้ในหน้าแรกของสัญญาฉบับนี้
        </div>

        <div className="mt-8 grid grid-cols-2 border border-black min-h-[600px] font-bold">
          {/* Left Column: Lessor 1 */}
          <div className="border-r border-black p-4 flex flex-col h-full">
            <div className="space-y-12">
              <div className="font-bold underline text-left">ผู้ให้เช่าซื้อฝ่ายที่ 1:</div>
              <div className="font-bold text-left">{data.lessor1.name}</div>

              <div className="pt-8 space-y-12">
                {data.lessor1Signatories.split(/\s*และ\s*/).map((sig, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="border-b border-black w-full h-8"></div>
                    <div className="text-center w-full">
                      ( <Highlight>{sig.trim()}</Highlight> )
                    </div>
                  </div>
                ))}

                <div className="pt-4 text-left">
                  <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                  <div className="mt-2">{data.lessor1.name}</div>
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

          <div className="p-4 flex flex-col h-full">
            <div className="space-y-12">
              <div className="font-bold underline text-left">ผู้เช่าซื้อ:</div>
              <div className="font-bold text-left">
                <Highlight>{customerInfo.companyName}</Highlight>
              </div>

              <div className="pt-8 space-y-12">
                {(customerInfo.directors || '').split(/\s*และ\s*/).map((sig, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="border-b border-black w-full h-8"></div>
                    <div className="text-center w-full">
                      ( <Highlight>{sig.trim()}</Highlight> )
                    </div>
                  </div>
                ))}

                <div className="pt-4 text-left">
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
              <div className="flex justify-between px-4">
                <span>(</span>
                <span className="flex-1 border-b border-black mx-4 mb-1"></span>
                <span>)</span>
              </div>
            </div>
          </div>
        </div>
        {renderPageFooter(17 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Signature Page 2 - Lessor 2 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />

        <div className="mt-8 grid grid-cols-2 border border-black min-h-[600px] font-bold">

          {/* Left Column: Lessor 2 */}
          <div className="border-r border-black p-4 flex flex-col h-full">
            <div className="flex-1 mt-4 space-y-16">
              <div className="font-bold text-[13px] text-left h-[50px] flex flex-col justify-center">
                <div>ผู้ให้เช่าซื้อฝ่ายที่ 2:</div>
                <Highlight>{data.lessor2.name}</Highlight>
              </div>
              <div className="pt-8 space-y-12">
                {data.lessor2Signatories.split(/\s*และ\s*/).map((sig, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="border-b border-black w-full h-8"></div>
                    <div className="text-center w-full">
                      ( <Highlight>{sig.trim()}</Highlight> )
                    </div>
                  </div>
                ))}

                <div className="pt-4 text-left">
                  <div>ตำแหน่ง: กรรมการผู้มีอำนาจลงนาม</div>
                  <div className="mt-2">{data.lessor2.name}</div>
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
        {renderPageFooter(18 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Annex Page 1 - Image 9 */}
      <div className="print-page relative min-h-[1050px] py-10 px-24">
        <PageHeader />
        <div className="mt-2 flex flex-col items-center justify-center space-y-0.5">
          <div className="text-[12px] font-bold underline">เอกสารแนบท้ายหมายเลข 1</div>
          <div className="text-[12px] font-bold underline">ทรัพย์สินที่เช่าซื้อ</div>
        </div>
        {renderPageFooter(19 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Annex Page 2 - Image 10 */}
      <div className="print-page relative min-h-[1050px] py-10 px-24">
        <PageHeader />
        <div className="mt-2 flex flex-col items-center justify-center space-y-0.5 text-center">
          <div className="text-[12px] font-bold underline">เอกสารแนบท้ายหมายเลข 2</div>
          <div className="text-[12px] font-bold underline">รายละเอียดค่าเช่าซื้อแต่ละงวดและวิธีการคำนวณค่างวดการเช่าซื้อ</div>
        </div>
        {renderPageFooter(20 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Annex Page 3 - Image 11 */}
      <div className="print-page relative min-h-[1050px] py-10 px-24">
        <PageHeader />
        <div className="mt-2 flex flex-col items-center justify-center space-y-0.5">
          <div className="text-[12px] font-bold underline">เอกสารแนบท้ายหมายเลข 3</div>
          <div className="text-[12px] font-bold underline">รายละเอียดการส่งมอบเครื่องจักร</div>
        </div>
        {renderPageFooter(21 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Annex Page 4 - Image 14 */}
      <div className="print-page relative min-h-[1050px] p-24 bg-white shadow-lg print:shadow-none">
        <PageHeader />
        <div className="mt-4 flex flex-col items-center justify-center space-y-1 mb-4">
          <div className="text-[12px] font-bold underline">เอกสารแนบท้ายหมายเลข 4</div>
          <div className="text-[12px] font-bold underline text-center">ข้อตกลงและหลักฐานการส่งมอบเช็คสั่งจ่ายล่วงหน้า สำหรับการชำระเงินต้นพร้อมดอกเบี้ย</div>
        </div>

        <div className="mb-4 text-justify">
          เอกสารฉบับนี้เป็นส่วนหนึ่งของสัญญาเช่าซื้อเลขที่ <Highlight>{data.contractNo} ลงวันที่ {formatThaiDate(data.contractDate)}</Highlight> โดยคู่สัญญาทุกฝ่ายตกลงและยืนยัน ดังนี้
        </div>

        <div className="space-y-4 mb-6 text-justify">
          <div className="flex gap-2">
            <span className="shrink-0 w-4">1.</span>
            <div className="flex-1">
              การส่งมอบเช็ค : ผู้เช่าซื้อตกลงส่งมอบเช็คสั่งจ่ายล่วงหน้า สำหรับการชำระค่าเช่าซื้อให้แก่<span className="underline">ผู้ให้เช่าซื้อ</span> จำนวนทั้งสิ้น <Highlight>{totalCheques} ฉบับ</Highlight> เพื่อเป็นการชำระค่างวดเช่าซื้อ (<Highlight>งวดที่ 1 ถึง งวดที่ {data.installments}</Highlight>) โดยแบ่งชำระเป็นงวด งวดละ {data.chequesPerInstallment} ฉบับ ให้แก่ผู้ให้เช่าซื้อแต่ละฝ่าย ณ วันที่ทำสัญญาฉบับนี้เป็นที่เรียบร้อยแล้ว รายละเอียดปรากฏตามสำเนาเช็คสั่งจ่ายล่วงหน้าที่แนบบัดนี้
            </div>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 w-4">2.</span>
            <div className="flex-1">
              รายละเอียดการชำระ : เช็คแต่ละฉบับจะถูกสั่งจ่ายในนามผู้ให้เช่าซื้อแต่ละฝ่าย โดยระบุจำนวนเงินและวันที่ครบกำหนดชำระในแต่ละงวดให้สอดคล้องกับ <span className="underline">"รายละเอียดค่าเช่าซื้อแต่ละงวดและวิธีการคำนวณค่างวดการเช่าซื้อ"</span> ตามเอกสารแนบท้ายหมายเลข 2 ของสัญญาเช่าซื้อฉบับนี้
            </div>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 w-4">3.</span>
            <div className="flex-1">
              การยืนยันรายละเอียดและสำเนาภาพถ่ายเช็ค : คู่สัญญาทุกฝ่ายตกลงให้ถือว่า "ใบรับเช็ค" หรือ "สำเนาภาพถ่ายเช็คทั้งหมด" ที่มีการลงนามรับมอบโดยผู้ให้เช่าซื้อแต่ละฝ่าย ณ วันที่ทำสัญญานี้ เป็นรายละเอียดส่วนหนึ่งของเอกสารแนบท้ายฉบับนี้ และให้มีผลผูกพันตามกฎหมายเสมือนว่าได้มีการระบุรายละเอียดเช็คทุกฉบับไว้ในสัญญาฉบับนี้โดยละเอียดทุกประการ
            </div>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 w-4">4.</span>
            <div className="flex-1">
              ความรับผิดทางอาญา : ผู้เช่าซื้อยืนยันและรับรองว่าเช็คทุกฉบับที่ส่งมอบเป็นเช็คที่ออกโดยชอบด้วยกฎหมายเพื่อชำระหนี้ที่มีอยู่จริงและบังคับได้ตามกฎหมาย หากเช็คฉบับใดถูกธนาคารปฏิเสธการจ่ายเงินไม่ว่าด้วยเหตุใดๆ ผู้เช่าซื้อยอมรับว่าตนมีเจตนาหรืออาจเล็งเห็นผลที่จะไม่ให้มีการใช้เงินตามเช็คนั้น และยินยอมให้ผู้ให้เช่าซื้อดำเนินคดีตาม <span className="underline">พระราชบัญญัติว่าด้วยความผิดอันเกิดจากการใช้เช็ค พ.ศ. 2534</span> และที่แก้ไขเพิ่มเติม รวมถึงความรับผิดทางแพ่งและทางอาญาในส่วนอื่นๆ ที่เกี่ยวข้องโดยพลัน
            </div>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 w-4">5.</span>
            <div className="flex-1">
              ความเป็นส่วนหนึ่งของสัญญา : ข้อตกลงตามเอกสารแนบท้ายนี้ให้ถือเป็นส่วนหนึ่งของสัญญาเช่าซื้อฉบับนี้ หากความในเอกสารฉบับนี้ขัดหรือแย้งกับสัญญาเช่าซื้อให้ถือตามข้อความในเอกสารแนบท้ายนี้ในส่วนที่เกี่ยวกับการชำระหนี้ด้วยเช็ค
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-16 gap-y-6 mt-12">
          <div className="space-y-6">
            <div className="pb-6">
              <div className="flex items-end gap-2">
                <span className="w-8">ลงชื่อ</span>
                <div className="border-b border-black border-dotted flex-1 h-6 relative">
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-[11px] text-center">
                    ( {data.lessor1.name} )
                  </div>
                </div>
                <span className="whitespace-nowrap text-[11px] w-[100px]" >ผู้ให้เช่าซื้อฝ่ายที่ 1 / ผู้รับเช็ค</span>
              </div>
            </div>

            <div className="pb-6">
              <div className="flex items-end gap-2">
                <span className="w-8">ลงชื่อ</span>
                <div className="border-b border-black border-dotted flex-1 h-6 relative">
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-[11px] text-center">
                    ( {data.lessor2.name} )
                  </div>
                </div>
                <span className="whitespace-nowrap text-[11px] w-[100px]">ผู้ให้เช่าซื้อฝ่ายที่ 2 / ผู้รับเช็ค</span>
              </div>
            </div>
          </div>

          <div className="pb-6 self-start">
            <div className="flex items-end gap-2">
              <span className="w-8">ลงชื่อ</span>
              <div className="border-b border-black border-dotted flex-1 h-6 relative">
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-[11px] text-center">
                  ( <Highlight>{customerInfo.companyName}</Highlight> )
                </div>
              </div>
              <span className="whitespace-nowrap text-[11px] w-[100px]">ผู้เช่าซื้อ/ผู้ส่งมอบเช็ค</span>
            </div>
          </div>
        </div>

        {renderPageFooter(22 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Annex Page 5 - Debt Collection Fees */}
      <div className="print-page relative min-h-[1050px] py-6 px-24">
        <PageHeader />
        <div className="mt-2 flex flex-col items-center justify-center space-y-0.5 mb-1.5">
          <div className="text-[12px] font-bold underline">เอกสารแนบท้ายหมายเลข 5</div>
          <div className="text-[12px] font-bold underline text-center">
            รายละเอียดเกี่ยวกับการติดตามทวงถาม และค่าใช้จ่ายที่เกี่ยวกับงานกฎหมายดำเนินคดี
          </div>
          <div className="text-[12px] font-bold underline text-center">
            ประกาศอัตราดอกเบี้ย ค่าปรับ ค่าบริการ ค่าธรรมเนียมใดๆ และค่าใช้จ่ายอันเกิดจากสัญญาตามที่จ่ายไปจริง
          </div>
          <div className="text-[12px] font-bold text-center">
            มีผลบังคับใช้ตั้งแต่วันที่ 1 กรกฎาคม 2564 เป็นต้นไป
          </div>
        </div>

        {/* Table 1 */}
        <table className="w-full border-collapse border border-black text-[12px] mb-1.5">
          <thead>
            <tr className="bg-gray-100 print:bg-transparent text-left">
              <th colSpan={2} className="border border-black p-1 ">1. ค่าธรรมเนียมในการติดตามทวงถามหนี้</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1">1.1 กรณีค้างชำระหนี้หนึ่งงวด</td>
              <td className="border border-black p-1">ไม่เกิน 50 บาท / รอบการทวงถามหนี้</td>
            </tr>
            <tr>
              <td className="border border-black p-1">1.2 กรณีค้างชำระเกินหนึ่งงวด</td>
              <td className="border border-black p-1">ไม่เกิน 100 บาท / รอบการทวงถามหนี้</td>
            </tr>
            <tr>
              <td className="border border-black p-1">1.3 ลำดับการตัดชำระหนี้</td>
              <td className="border border-black p-1 text-justify">
                <span className="underline font-bold text-blue-800 italic">เงินที่ลูกหนี้ชำระเข้ามาจะถูกนำไปตัดชำระตามลำดับ ดังนี้</span><br />
                (1) ค่าธรรมเนียม (2) ดอกเบี้ย (3) เงินต้นของงวดหนี้ที่ค้างชำระนานที่สุดก่อน
              </td>
            </tr>
          </tbody>
        </table>

        {/* Table 2 */}
        <table className="w-full border-collapse border border-black text-[12px] mb-1.5">
          <thead>
            <tr className="bg-gray-100 print:bg-transparent text-left">
              <th colSpan={2} className="border border-black p-1">2. ค่าดำเนินการทางกฎหมาย</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1">2.1 ค่าใช้จ่ายอันเกี่ยวกับการฟ้องร้องดำเนินคดี</td>
              <td className="border border-black p-1">ตามอัตราที่บริษัทฯได้ชำระไปจริง</td>
            </tr>
            <tr>
              <td className="border border-black p-1">2.2 ค่าธรรมเนียมศาล</td>
              <td className="border border-black p-1">ตามอัตราที่หน่วยงานราชการนั้นกำหนด หรือ ตามที่กฎหมายกำหนด</td>
            </tr>
            <tr>
              <td className="border border-black p-1">2.3 ค่าใช้จ่ายในการบังคับคดี</td>
              <td className="border border-black p-1">ตามอัตราที่หน่วยงานราชการนั้นกำหนด หรือ ตามที่กฎหมายกำหนด</td>
            </tr>
            <tr>
              <td className="border border-black p-1 whitespace-nowrap">2.4 ค่าธรรมเนียมในการติดต่อหน่วยงานอื่นๆ</td>
              <td className="border border-black p-0">
                <div className="p-1 border-b border-black">กรณีที่เป็นหน่วยงานราชการ : ตามอัตราที่หน่วยงานราชการนั้นกำหนด</div>
                <div className="p-1">กรณีที่เป็นหน่วยงานเอกชน : ตามอัตราที่หน่วยงานนั้นกำหนด</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Example Title */}
        <div className="text-center mt-4 mb-1">
          <span className="text-[12px] font-bold underline italic">ตัวอย่างการคำนวณค่าธรรมเนียมในการติดตามทวงถามหนี้</span>
        </div>

        {/* Table 3 */}
        <table className="w-full border-collapse border border-black text-[12px] text-center mb-4">
          <thead>
            <tr className="bg-gray-200 print:bg-transparent">
              <th className="border border-black p-1 text-left"></th>
              <th className="border border-black p-1">งวดที่ 1<br />(ม.ค.)</th>
              <th className="border border-black p-1">งวดที่ 2<br />(ก.พ.)</th>
              <th className="border border-black p-1">งวดที่ 3<br />(มี.ค.)</th>
              <th className="border border-black p-1">งวดที่ 4<br />(เม.ย.)</th>
              <th className="border border-black p-1">รวม</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1 text-left font-bold">กรณีที่ไม่มีการชำระหนี้เพิ่มเติม</td>
              <td className="border border-black p-1">50 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1 font-bold bg-gray-100 print:bg-transparent">350 บาท</td>
            </tr>
            <tr>
              <td className="border-x border-black p-1 text-left font-bold">กรณีที่มีการชำระหนี้เพิ่มเติม</td>
              <td className="border-x border-black p-1"></td>
              <td className="border-x border-black p-1"></td>
              <td className="border-x border-black p-1"></td>
              <td className="border-x border-black p-1"></td>
              <td className="border-x border-black p-1 bg-gray-100 print:bg-transparent"></td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-left pl-4 whitespace-normal leading-tight">
                - เงินที่ชำระเข้ามาสามารถนำไปตัดชำระค่าธรรมเนียมใน<br />การทวงถามของงวดที่ 1 ได้
              </td>
              <td className="border border-black p-1 line-through">50 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1 font-bold bg-gray-100 print:bg-transparent">300 บาท</td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-left pl-4 whitespace-normal leading-tight">
                - เงินที่ชำระเข้ามาสามารถนำไปตัดชำระค่าธรรมเนียมใน<br />การทวงถามของงวดที่ 1 และ งวดที่ 2 ได้ แต่ยังคงค้างเงิน<br />ต้นงวดที่ 2
              </td>
              <td className="border border-black p-1 line-through">50 บาท</td>
              <td className="border border-black p-1 line-through">100 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1 font-bold bg-gray-100 print:bg-transparent">200 บาท</td>
            </tr>
          </tbody>
        </table>

        {renderPageFooter(23 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Annex Page 5 (Cont.) - Consent & Signatures */}
      <div className="print-page relative min-h-[1050px] py-10 px-24">
        <PageHeader />

        {/* Table 4 - Mixed Payment Example */}
        <table className="w-full border-collapse border border-black text-[12px] text-center mt-12 mb-12">
          <thead>
            <tr className="bg-gray-200 print:bg-transparent">
              <th className="border border-black p-1 text-left"></th>
              <th className="border border-black p-1">งวดที่ 1<br />(ม.ค.)</th>
              <th className="border border-black p-1">งวดที่ 2<br />(ก.พ.)</th>
              <th className="border border-black p-1">งวดที่ 3<br />(มี.ค.)</th>
              <th className="border border-black p-1">งวดที่ 4<br />(เม.ย.)</th>
              <th className="border border-black p-1">รวม</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1 text-left pl-2 whitespace-normal leading-tight h-auto py-4">
                - เงินที่ชำระเข้ามาสามารถนำไปตัดชำระค่าธรรมเนียมใน<br />
                การทวงถามของงวดที่ 1 และ งวดที่ 2 ได้ และ<br />
                สามารถนำเงินส่วนที่เหลือไปตัดเงินต้นงวดที่ 1 และ 2<br />
                ทั้งหมด
              </td>
              <td className="border border-black p-1 line-through">50 บาท</td>
              <td className="border border-black p-1 line-through">100 บาท</td>
              <td className="border border-black p-1">50 บาท</td>
              <td className="border border-black p-1">100 บาท</td>
              <td className="border border-black p-1 font-bold bg-gray-100 print:bg-transparent">150 บาท</td>
            </tr>
          </tbody>
        </table>

        {/* Notes & Consent Section */}
        <div className="text-[12px] leading-relaxed mb-8">
          <p className="mb-6">
            <span className="font-bold underline italic">หมายเหตุ</span><br />
            อัตราค่าบริการต่างๆ ค่าติดตามทวงถาม และค่าใช้จ่ายที่เกี่ยวกับงานกฎหมายดำเนินคดีสามารถเปลี่ยนแปลงได้ ในกรณีที่มีการเปลี่ยนแปลงกฎหมายที่เกี่ยวข้อง ผู้เช่าซื้อรับทราบและตกลงให้ค่าติดตามทวงถามและค่าใช้จ่ายที่เกี่ยวกับงานกฎหมายดำเนินคดีตามสัญญาฉบับนี้เป็นไปตามกฎหมายที่เปลี่ยนแปลงไป โดยมิต้องได้รับความยินยอมจากผู้เช่าซื้อก่อน
          </p>
          <p className="indent-12 text-justify">
            ข้าพเจ้าในฐานะผู้เช่าซื้อได้รับทราบและตกลงยินยอมให้ผู้ให้สินเชื่อคิดค่าบริการสำหรับการติดตามทวงถาม และค่าใช้จ่ายที่เกี่ยวกับงานกฎหมายดำเนินคดี สำหรับกรณีที่ผู้เช่าซื้อได้ผิดนัดชำระหนี้ตามสัญญาเช่าซื้อฉบับนี้
          </p>
        </div>

        {/* Signature Box */}
        <div className="mt-20 flex flex-col space-y-16">
          <div className="flex justify-between w-full">
            {renderSignatureGroup("ผู้ให้เช่าซื้อฝ่ายที่ 1", data.lessor1.name, data.lessor1Signatories, "left")}
            {renderSignatureGroup("ผู้เช่าซื้อ", customerInfo.companyName, customerInfo.directors || data.lesseeSignatories, "right")}
          </div>
          <div className="w-full">
            {renderSignatureGroup("ผู้ให้เช่าซื้อฝ่ายที่ 2", data.lessor2.name, data.lessor2Signatories, "left")}
          </div>
        </div>

        {renderPageFooter(24 + overflowPagesCount + collateralOffset)}
      </div>

      {/* Annex Page 6 - Collateral Details */}
      <div className="print-page relative min-h-[1050px] py-10 px-24">
        <PageHeader />

        <div className="text-center mt-2">
          <p className="font-bold underline text-[12px] mb-0.5">เอกสารแนบท้ายหมายเลข 6</p>
          <p className="font-bold underline text-[12px]">รายละเอียดเกี่ยวกับหลักประกันการเช่าซื้อ</p>
        </div>

        {renderPageFooter(25 + overflowPagesCount + collateralOffset)}
      </div>
    </div >
  );
}

