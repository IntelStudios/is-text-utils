import { describe } from 'mocha';
import { createTextMaskConfig, conformToMask, ITextMaskConfig } from './InputMask';
import { INumberFormatOptions, formatNumber } from './numberFormat';
const { assert } = require('chai');

interface INumberFormatTest {
  num: number,
  result: string,
  config: INumberFormatOptions,
}

describe('Number format', () => {
  const configInt: INumberFormatOptions = { decimalPlaces: 0, digitGroupSeparator: ',' };
  const config9Places: INumberFormatOptions = { decimalPlaces: 9, digitGroupSeparator: ',' };
  const config2Places: INumberFormatOptions = { decimalPlaces: 2, digitGroupSeparator: ',' };
  const config2PlacesSpace: INumberFormatOptions = { decimalPlaces: 2, digitGroupSeparator: ' ' };
  const tests: INumberFormatTest[] = [
    {
      num: -12.22222,
      result: '-12',
      config: configInt
    },
    {
      num: 1000,
      result: '1,000',
      config: configInt
    },    
    {
      num: NaN,
      result: '',
      config: configInt
    },
    {
      num: 1234.9999,
      result: '1,234.99',
      config: config2Places
    },
    {
      num: -1234,
      result: '-1,234.00',
      config: config2Places
    },
    ,
    {
      num: 123123123,
      result: '123 123 123.00',
      config: config2PlacesSpace
    },
    {
      num: 0.111222333444555,
      result: '0.111222333',
      config: config9Places
    },
    {
      num: 111222333,
      result: '111,222,333.000000000',
      config: config9Places
    }
  ];



  tests.forEach((test: INumberFormatTest) => {
    it(`[${test.num}] => [${test.result}]`, () => {
      const result = formatNumber(test.num, test.config);
      assert(result === test.result, `Number '${test.num}' must be formatted as '${test.result}' but was '${result}'`);
    });
  });
});