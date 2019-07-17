import { describe } from 'mocha';
import { createTextMaskConfig, conformToMask, ITextMaskConfig } from './InputMask';
const { assert } = require('chai');

interface IMaskTest {
    name: string,
    mask: string,
    accept: string[],
    reject: string[],
    valid: string[],
    invalid: string[],
    extra?: () => void
}

describe('Create config', () => {
    it('Should create with defaults', () => {
        const config = createTextMaskConfig('A');
        assert(config.placeholderChar === '_', `Config must be created with default placeholder char`);
    });
    it('Should create IBAN with defaults', () => {
        const config = createTextMaskConfig('iban');
        assert(config.placeholderChar === '_', `Config must be created with default placeholder char`);
    });
    it('Should create EMAIL with defaults', () => {
        const config = createTextMaskConfig('email');
        assert(config.placeholderChar === '_', `Config must be created with default placeholder char`);
    });

    it('Should create with options', () => {
        const config = createTextMaskConfig('A', {placeholderChar: '@'});
        assert(config.placeholderChar === '@', `Config must be created with @ placeholder char`);
    });
    it('Should create IBAN with options', () => {
        const config = createTextMaskConfig('iban', {placeholderChar: '@'});
        assert(config.placeholderChar === '@', `Config must be created with @ placeholder char`);
    });
    it('Should create EMAIL with options', () => {
        const config = createTextMaskConfig('email', {placeholderChar: '@'});
        assert(config.placeholderChar === '@', `Config must be created with @ placeholder char`);
    });        
});

describe('Text masks', () => {

    let config: ITextMaskConfig;

    const setMask = (m: string) => {
        config = createTextMaskConfig(m);
    }


    const accept = (input: string) => {
        if (config.mask) {
            const value = conformToMask(input, config.mask, {}).conformedValue;
            assert(value.indexOf(input) > -1 === true, `INPUT '${input}' must be ACCEPTED (result '${value}')`);
        }
    }

    const value = (output: string) => {
        // expect(component.control.value).toBe(output);
    }


    const reject = (input: string) => {
        if (config.mask) {
            const value = conformToMask(input, config.mask, {}).conformedValue;
            assert(value.indexOf(input) < 0  === true, `INPUT '${input}' must be REJECTED (result '${value}')`);
        }        
    }

    const valid = (input: string) => {
        const result = config.validate(input);
        assert(result === true, `INPUT '${input}' must be VALID`);
    }

    const invalid = (input: string) => {
        const result = config.validate(input);
        assert(result === false, `INPUT '${input}' must be INVALID`);
    }

    const tests: IMaskTest[] = [
        {
            name: 'NUMERIC (mandatory) 9',
            mask: '999',
            accept: ['1', '12', '123'],
            reject: ['x', '1x', '12-', '-1234'],
            valid: ['123', '-123'],
            invalid: ['12', '-12']
        },
        {
            name: 'LETTER lowercase (mandatory) a',
            mask: 'aaa',
            accept: ['a', 'aa', 'aaa','č'],
            reject: ['aaA', 'aaaa','Č'],
            valid: ['abc'],
            invalid: ['12', 'ABC','ČAS'],
            extra: () => {
                setMask('[ABC]aa');
                accept('aa');
                value('ABCaa');
            }
        },
        {
            name: 'LETTER uppercase (mandatory) A',
            mask: 'AAA',
            accept: ['A', 'AA', 'AAA'],
            reject: ['aaA', 'AAAA', 'š','ččč'],
            valid: ['AVB'],
            invalid: ['12','ššš'],
            extra: () => {
                setMask('[QQQ]AA');
                accept('AA');
                value('QQQAA');
            }
        },
        {
            name: 'LETTER uppercase (optional) B',
            mask: 'BBB',
            accept: ['A', 'AA', 'AAA'],
            reject: ['3', 'AAAA'],
            valid: ['A', 'AA', 'AAA'],
            invalid: ['12'],
            extra: () => {
                setMask('[QQQ]AA');
                accept('AA');
                value('QQQAA');
            }
        },
        {
            name: 'ANY CHAR (optional) %',
            mask: '%%%',
            accept: ['A', '3', 'AaA', '#$@'],
            reject: ['SSSS'],
            valid: ['A', 'AA', 'AAA'],
            invalid: []
        },
        {
            name: 'ALPHANUMERIC (optional) x',
            mask: 'xxx',
            accept: ['A', '3', 'AaA'],
            reject: ['SSSS', '#$@'],
            valid: ['A', 'AA', 'AAA'],
            invalid: ['XXXX']
        },
        {
            name: 'iban',
            mask: 'iban',
            accept: ['CZ', 'CZ65 0800 0000 1920 0014 5399'],
            reject: [],
            valid: ['CZ65 0800 0000 1920 0014 5399'],
            invalid: ['CZ']
        },
        {
            name: 'email',
            mask: 'email',
            accept: ['acA'],
            reject: [],
            valid: ['xxx@intelstudios.com'],
            invalid: ['aa@']
        },
        {
            name: 'NUMERIC (optional) #',
            mask: '###',
            accept: ['123', '-123'],
            reject: ['1234'],
            valid: ['1', '12', '123', '-123'],
            invalid: ['1x', '1234']
        },
        {
            name: 'DECIMAL ##.##',
            mask: '##.##',
            accept: ['-99.99', '99.99', '0'],
            reject: ['1234'],
            valid: ['1', '12', '12.3', '-12.3'],
            invalid: ['1x', '12345']
        },
        {
            name: 'ALPHANUMERIC (required) w',
            mask: 'www',
            accept: ['123', 'x12', 'Dxo'],
            reject: ['1234'],
            valid: ['122', '12W', '123', 'Xx2'],
            invalid: ['1', '12345']
        },
        {
            name: 'special chars (ěščřžý)',
            mask: 'www',
            accept: ['šŠž', 'čü', 'ćę'],
            reject: ['1234'],
            valid: ['šŠž', 'čüő', 'ćęü'],
            invalid: ['1', '12345']
        },
        ,
        {
            name: 'special chars',
            mask: 'wwxxxxxxxxxxxx',
            accept: ['legkülönbözőbb', 'čü', 'ćę'],
            reject: [],
            valid: ['legkülönbözőbb', 'ćęŚ'],
            invalid: []
        }
    ];

    tests.forEach((test: IMaskTest) => {
        it(`[${test.name}] behavior`, () => {
            setMask(test.mask);
            test.accept.forEach((str: string) => accept(str));
            test.reject.forEach((str: string) => reject(str));
            test.valid.forEach((str: string) => valid(str));
            test.invalid.forEach((str: string) => invalid(str));
            test.extra && test.extra();
        });
    });
});