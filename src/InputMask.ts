const _textMaskCore = require('text-mask-core');
const _createTextMaskInputElement = _textMaskCore.createTextMaskInputElement;
const emailMask = require('text-mask-addons').emailMask;
const _conformToMask = _textMaskCore.conformToMask;
const _iban = require('iban');
const LOWERCASE = 'a-zěéęščřžýáíüúůöőćß';
const UPPERCASE = 'A-ZĚŽŠČŘŔĎŤŇÚÁÉÍÝÓŚÄÖÜŮ';
const LETTER = `[0-9${LOWERCASE}${UPPERCASE}]`;

export interface ITextMaskConfig {
    maskType: 'custom' | 'iban' | 'email';
    mask: any;
    guide: boolean;
    placeholderChar: string;
    pipe: any;
    keepCharPositions: boolean;
    showMask: boolean;
    validate: (value: string) => boolean
}

function createValidationRegex(xeeloMask: string) {
    const ret = [];
    let isFixed = false;
    let hadFirstNumber = xeeloMask.match(/^[#\.\,9]+$/) === null; // allow negative numbers in "pure numeric" masks
    const isDecimal = xeeloMask.indexOf('#') > -1 && xeeloMask.indexOf('.') > 0;
    for (var i = 0; i < xeeloMask.length; i++) {
        const char = xeeloMask[i];
        if (char === '[') {
            isFixed = true;
            continue;
        }
        if (char === ']') {
            isFixed = false;
            continue;
        }
        if (isFixed) {
            ret.push(char);
            continue;
        }

        if (char === '9') {
            if (!hadFirstNumber) {
                hadFirstNumber = true;
                ret.push('-?');
            }
            ret.push('\\d');
            continue;
        }
        if (char === '.') {
            isDecimal ? ret.push('\\.?') : ret.push('\\.');
            continue;
        }
        if (char === '#') {
            if (!hadFirstNumber) {
                hadFirstNumber = true;
                ret.push('-?');
            }
            ret.push('\\d?');
            continue;
        }
        if (char === 'a') {
            ret.push(`[${LOWERCASE}]`);
            continue;
        }
        if (char === 'b') {
            ret.push(`[${LOWERCASE}]?`);
            continue;
        }
        if (char === 'A') {
            ret.push(`[${UPPERCASE}]`);
            continue;
        }
        if (char === 'B') {
            ret.push(`[${UPPERCASE}]?`);
            continue;
        }
        if (char === 'w') {
            ret.push(LETTER);
            continue;

        }
        if (char === 'x') {
            ret.push(`(${LETTER})?`);
            continue;
        }
        if (char === '*') {
            ret.push('.+');
            continue;
        }
        if (char === '%') {
            ret.push('.?');
            continue;
        }

        ret.push(char);
    }
    const re = new RegExp(`^${ret.join('')}$`);
    return re;
}


function transformMask(xeeloMask: string, options?: Partial<ITextMaskConfig>): ITextMaskConfig {

    const re = createValidationRegex(xeeloMask);

    const config: ITextMaskConfig = Object.assign({
        maskType: 'custom',
        mask: false,
        guide: false,
        placeholderChar: '_',
        pipe: undefined,
        showMask: false,
        keepCharPositions: false,
        validate: function (value: string): boolean {
            const result = re.test(value);
            // console.log(re, value, result);
            return result;
        }
    }, options);

    config.mask = function (rawValue: string, config: any) {
        const position = config.currentCarretPosition;

        const hasOptionalChars = xeeloMask.match(/[#bBx%]+/) !== null;

        const ret = [];
        let isFixed = false;
        let hadFirstNumber = xeeloMask.match(/^[#\.\,9]+$/) === null; // allow negative numbers in "pure numeric" masks
        for (var i = 0; i < xeeloMask.length; i++) {
            const char = xeeloMask[i];
            if (char === '[') {
                isFixed = true;
                continue;
            }
            if (char === ']') {
                ret.push('[]');
                isFixed = false;
                continue;
            }
            if (isFixed) {
                ret.push(char);
                continue;
            }

            if (char === '9') {
                if (!hadFirstNumber) {
                    hadFirstNumber = true;
                    if (rawValue.length === 0) {
                        ret.push(/-|\d/);
                    } else if (rawValue[0] === '-') {
                        ret.push('-');
                    }
                }
                ret.push(/\d/);
                continue;
            }
            if (char === '#') {
                if (!hadFirstNumber) {
                    hadFirstNumber = true;
                    if (rawValue.length === 0) {
                        ret.push(/-|\d/);
                    } else if (rawValue[0] === '-') {
                        ret.push('-');
                    }
                }
                ret.push(/\d/);
                continue;
            }
            if (char === 'a') {
                ret.push(new RegExp(`[${LOWERCASE}]`));
                continue;
            }
            if (char === 'b') {
                ret.push(new RegExp(`[${LOWERCASE}]`));
                continue;
            }
            if (char === 'A') {
                ret.push(new RegExp(`[${UPPERCASE}]`));
                continue;
            }
            if (char === 'B') {
                ret.push(new RegExp(`[${UPPERCASE}]`));
                continue;
            }
            if (char === 'w') {
                ret.push(new RegExp(`${LETTER}`));
                continue;
            }
            if (char === 'x') {
                ret.push(new RegExp(`${LETTER}`));
                continue;
            }
            if (char === '*') {
                ret.push(/.+/);
                continue;
            }
            if (char === '%') {
                ret.push(/.+/);
                continue;
            }

            ret.push(char);
        }
        return ret;
    };
    return config;
}

export function createTextMaskConfig(inputMask: string, options?: Partial<ITextMaskConfig>): ITextMaskConfig {
    if (inputMask === 'email') {
        const config: ITextMaskConfig = Object.assign({
            maskType: 'email',
            mask: false,
            guide: false,
            placeholderChar: '_',
            pipe: undefined,
            showMask: false,
            keepCharPositions: false,
            validate: (value: string): boolean => {
                const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(value).toLowerCase());
            }
        }, options, emailMask);
        return config;
    }

    if (inputMask === 'iban') {
        const config: ITextMaskConfig = Object.assign({
            maskType: 'iban',
            mask: false,
            guide: false,
            showMask: false,
            placeholderChar: '_',
            pipe: undefined,
            keepCharPositions: false,
            validate: (value: string): boolean => {
                return _iban.isValid(value);
            }
        }, options);
        return config;
    }

    return transformMask(inputMask, options);
}

export { _createTextMaskInputElement as createTextMaskInputElement };
export { _conformToMask as conformToMask };