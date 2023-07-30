import { lex } from './lexar';
import { tokenize } from './tokenize';
import { parse } from './parser';
import { Runtime } from './runtime';
import { Program } from './ast';

function compile(program: string) : any {
    const lexons = lex(program);
    const tokens = tokenize(lexons);
    const ast = parse(tokens);

    console.log(ast.body);

    return ast;
}

// TODO: consider lex accounting for side-by-each tokens
const someProgram = `
    var x = 1
    var y = 2 + 3 + 10
    var z = x + y

    function add ( a b ) :
        var c = a + b
        c
    end

    var zPlusTen = add ( z 10 )

    zPlusTen
`;

const simplerProgram = `
    var x = 1
    var y = 2 + 3 + 10
    var z = x + y

    z
`;
const compiledProgram = compile(someProgram);

const runtime = new Runtime().run(compiledProgram);

console.log(runtime);

