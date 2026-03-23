export const formatThaiDate = (dateString: string) => {
  if (!dateString) return '';

  let date = new Date(dateString);
  if (dateString.includes('/')) {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      let year = parseInt(parts[2]);
      if (year > 2500) year -= 543;
      date = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  }

  if (isNaN(date.getTime())) return dateString;

  const days = date.getDate();
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${days} ${month} ${year}`;
};

export const formatThaiDateShort = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear() + 543;
  return `${d}/${m}/${y}`;
};

export const addMonths = (dateString: string, monthsToAdd: number) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + monthsToAdd);
  return newDate.toISOString().split('T')[0];
};
