export function thaiBahtText(number: number | string): string {
  if (number === undefined || number === null || number === '') return '';
  
  const numStr = number.toString().replace(/,/g, '');
  const num = parseFloat(numStr);

  if (isNaN(num)) return '';
  if (num === 0) return 'ศูนย์บาทถ้วน';

  const tWords = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const tPos = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

  const convertBlock = (blockStr: string) => {
    let result = '';
    const len = blockStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(blockStr.charAt(i), 10);
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          result += tPos[pos];
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่' + tPos[pos];
        } else if (pos === 0 && digit === 1 && len > 1 && blockStr.slice(0, len-1) !== '0'.repeat(len-1)) {
          result += 'เอ็ด';
        } else {
          result += tWords[digit] + tPos[pos];
        }
      }
    }
    return result;
  };

  const splitStr = num.toFixed(2).split('.');
  const bahtStr = splitStr[0];
  const satangStr = splitStr[1];

  let bahtText = '';
  if (bahtStr === '0') {
    bahtText = 'ศูนย์บาท';
  } else {
    let remaining = bahtStr;
    const chunks = [];
    while (remaining.length > 0) {
      chunks.push(remaining.slice(-6));
      remaining = remaining.slice(0, -6);
    }
    
    for(let i = chunks.length - 1; i >= 0; i--) {
      const chunkText = convertBlock(chunks[i]);
      if (chunkText) {
        bahtText += chunkText;
        if (i > 0) {
          bahtText += 'ล้าน';
        }
      }
    }
    bahtText += 'บาท';
  }

  let satangText = '';
  if (satangStr === '00') {
    satangText = 'ถ้วน';
  } else {
    satangText = convertBlock(satangStr) + 'สตางค์';
  }

  if (numStr.startsWith('-')) {
    return 'ลบ' + bahtText + satangText;
  }

  return bahtText + satangText;
}
