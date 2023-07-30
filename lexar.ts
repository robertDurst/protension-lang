export type Lexon = { value: string }

export function lex(program: string) : Lexon[] {
    const lexons : Lexon[] = [];

    program.split(' ').forEach((value) => {
        if (value.trim() === '') {
            return;
        }
        lexons.push({ value: value.trim() });
    });

    return lexons;
}
