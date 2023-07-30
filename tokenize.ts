import { Lexon } from './lexar';

type TokenType = 'number' | 'operator' | 'identifier' | 'colon' | 'keyword' | 'assignment' | 'opening_paren' | 'closing_paren';

export type Token = {
    type: TokenType,
    value: string
}

export function tokenize(lexons: Lexon[]) : Token[] {
    const tokens : Token[] = [];
    const KEYWORDS = ['var', 'function', 'end'];

    lexons.forEach((lexon) => {
        switch (lexon.value) {
            case '+':
            case '-':
                tokens.push({ type: 'operator', value: lexon.value });
                break;
            case '=':
                tokens.push({ type: 'assignment', value: lexon.value });
                break;
            case '(':
                tokens.push({ type: 'opening_paren', value: lexon.value });
                break;
            case ')':
                tokens.push({ type: 'closing_paren', value: lexon.value });
                break;
            case ':':
                tokens.push({ type: 'colon', value: lexon.value });
                break;
            default:
                if (lexon.value.match(/^[0-9]+\.?[0-9]*$/)) {
                    tokens.push({ type: 'number', value: lexon.value });
                }
                else if (lexon.value.match(/^[a-zA-Z]+$/)) {
                    const value = lexon.value;

                    if (KEYWORDS.includes(value)) {
                        tokens.push({ type: 'keyword', value });
                    } else {
                        tokens.push({ type: 'identifier', value: lexon.value });
                    }
                }   
                else {
                    throw new Error(`Unexpected lexon ${lexon.value}`);
                }
            }
        });

    return tokens;
}