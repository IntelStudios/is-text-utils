export interface INumberFormatOptions {
  digitGroupSeparator: string,
  decimalPlaces: number
}

export function formatNumber(value: number, opts: INumberFormatOptions): string {
  opts = opts || { digitGroupSeparator: '', decimalPlaces: 0 };
  const places = opts.decimalPlaces > 0 ? opts.decimalPlaces : 0;
  const separator = opts.digitGroupSeparator || '';
  if (isNaN(value)) {
    return '';
  }
  let valueStr = String(value);
  let index = valueStr.indexOf('.');
  let fractionPart = '';
  let intPart = valueStr;
  if (index > -1) {
    fractionPart = valueStr.substr(index + 1);
    intPart = valueStr.substring(0, index);
  }
  // format integral part
  intPart = intPart.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${separator}`);
  // cut trailing zeros
  if (fractionPart.length > places) {
    fractionPart = fractionPart.substr(0, places);
  }
  // append zeros
  if (fractionPart.length < places) {
    fractionPart += new Array(places - fractionPart.length).fill(0).join('');
  }

  if (fractionPart !== '') {
    fractionPart = `.${fractionPart}`;
  }
  return `${intPart}${fractionPart}`;
}