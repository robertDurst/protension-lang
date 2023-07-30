import { Token } from './tokenize';
import { Program, Block, Function, Assignment, Expression, FunctionCallExpression, BinaryExpression, NumberLiteral, Identifier, Primitive, IntegerNumber, FloatNumber, TopLevelEntity } from './ast';

type ASTNode = Program | 
                Block |
                Assignment |
                Expression |
                BinaryExpression |
                Primitive |
                TopLevelEntity | 
                Function |
                NumberLiteral |
                Identifier;

type ParseReturn<NODE extends ASTNode> = {
    ast: NODE,
    rest: Token[]
}

export function parse(tokens: Token[]) : Program {
    const body : TopLevelEntity[] = [];

    while (tokens.length > 0) {
        const { ast, rest } = parseTopLevel(tokens);
        tokens = rest;
        body.push(ast);
    }

    return { body };
}

function parseTopLevel(tokens: Token[]) : ParseReturn<TopLevelEntity> {
    if (tokens[0].type === 'keyword' && tokens[0].value === 'function') {
        const { ast, rest } = parseFunction(tokens);
        tokens = rest;
        return { ast: {body: ast }, rest };
    } else {
        const { ast, rest } = parseBlock(tokens);
        tokens = rest;
        return { ast: {body: ast }, rest };
    }
}

function parseFunction(tokens: Token[]) : ParseReturn<Function> {
    const { top: __, rest: restFunction } = safeShift(tokens);
    tokens = restFunction;

    const { top, rest } = safeShift(tokens);
    tokens = rest;
    const identifier = top.value;

    const { top: top1, rest: rest1 } = safeShift(tokens);
    tokens = rest1;
   
    if (top1.type !== 'opening_paren') {
        throw new Error(`Expected '(', got ${top1.value}`);
    }

    const functionArguments : string[] = [];

    while (tokens[0].type !== 'closing_paren') {
        const { ast, rest } = parseIdentifier(tokens);
        tokens = rest;
        functionArguments.push(ast.identifier);
    }

    const { top: ___, rest: restClosingParen } = safeShift(tokens);
    tokens = restClosingParen;

    const { top: topColon, rest: restColon } = safeShift(tokens);
    tokens = restColon;
    
    if (topColon.type !== 'colon') {
        throw new Error(`Expected ':', got ${topColon.value}`);
    }

    const blocks: Block[] = []

    while (tokens[0].value !== 'end') {
        const { ast, rest } = parseBlock(tokens);
        tokens = rest;
        blocks.push(ast);
    }

    const { top: topEnd, rest: rest4 } = safeShift(tokens);
    if (topEnd.type !== 'keyword' && topEnd.value !== 'end') {
        throw new Error(`Expected keyword 'end', got ${tokens[0].value}`);
    }

    const functionNode : Function = {
        identifier,
        arguments: functionArguments,
        body: blocks
    };

    return { ast: functionNode, rest: rest4 };
}

function parseBlock(tokens: Token[]) : ParseReturn<Block> {
    let body: Assignment | Expression;

    if (tokens[0].type === 'keyword' && tokens[0].value === 'var') {
        const { ast, rest } = parseAssignment(tokens);
        tokens = rest;
        body = ast;
    } 
    
    else {
        const { ast, rest } = parseExpression(tokens);
        tokens = rest;
        body = ast;
    }

    const block = { body  };

    return {
        ast: block,
        rest: tokens
    };
}

function parseAssignment(tokens: Token[]) : ParseReturn<Assignment> {
    const { top, rest } = safeShift(tokens);
    tokens = rest;

    if (top.type !== 'keyword' || top.value !== 'var') {
        throw new Error(`Expected keyword 'var', got ${top.value}`);
    }

    const { ast: identifier, rest: rest1 } = parseIdentifier(tokens);
    tokens = rest1;

    const { top: top1, rest: rest2 } = safeShift(tokens);
    tokens = rest2;

    if (top1.type !== 'assignment' || top1.value !== '=') {
        throw new Error(`Expected assignment operator '=', got ${top1.value}`);
    }

    const { ast: expression, rest: rest3 } = parseExpression(tokens);
    tokens = rest3;

    const assignment : Assignment = {
        identifier: identifier.identifier,
        expression
    };

    return { ast: assignment, rest: tokens };
}

function parseExpression(tokens: Token[]) : ParseReturn<Expression> {
    if (tokens.length == 1 || tokens[1].type === 'assignment' || tokens[1].type === 'keyword' || (tokens[1].type !== 'operator' && tokens[1].type !== 'opening_paren')) {
        const { ast, rest } = parsePrimitive(tokens);
        tokens = rest;
        return { ast: { body: ast }, rest };
    } else if (tokens[1].type === 'opening_paren') {
        const { ast: identifier, rest: rest1 } = parseIdentifier(tokens);
        tokens = rest1;

        const { top: top1, rest: rest2 } = safeShift(tokens);
        tokens = rest2;

        if (top1.type !== 'opening_paren') {
            throw new Error(`Expected '(', got ${top1.value}`);
        }
    
        const functionArguments : Expression[] = [];
    
        while (tokens[0].type !== 'closing_paren') {
            const { ast, rest } = parseExpression(tokens);
            tokens = rest;
            functionArguments.push(ast);
        }
    
        const { top: ___, rest: restClosingParen } = safeShift(tokens);
        tokens = restClosingParen;

        const functionCallExpression : FunctionCallExpression = {
            identifier: identifier.identifier,
            arguments: functionArguments
        }

        return { ast: { body: functionCallExpression }, rest: tokens };
    } else {
        const { ast, rest } = parseBinaryExpression(tokens);
        tokens = rest;
        return { ast: { body: ast }, rest };
    }
}

function parsePrimitive (tokens: Token[]) : ParseReturn<Primitive> {
    const { ast, rest } = tokens[0].type === 'number' ? parseNumberLiteral(tokens) : parseIdentifier(tokens);

    return {
        ast: { primitive: ast },
        rest
    }
}

function parseBinaryExpression(tokens: Token[]) : ParseReturn<BinaryExpression> {
    const left = parsePrimitive(tokens);
    tokens = left.rest;

    const { top, rest } = safeShift(tokens);
    tokens = rest;

    const right = parseExpression(tokens);
    tokens = right.rest;

    const binaryExtression : ASTNode = {
        left: left.ast,
        operator: top.value,
        right: right.ast
    }

    return {
        ast: binaryExtression,
        rest: tokens
    }
}

function parseNumberLiteral(tokens: Token[]) : ParseReturn<NumberLiteral> {
    const { top, rest } = safeShift(tokens);

    let  numberLiteral: NumberLiteral;
    if (top.value.match(/^[0-9]*\.+[0-9]*$/)) {
        const floatValue : number = Number.parseFloat(top.value);
        const floatNumber : FloatNumber = {
            float: floatValue
        }

        numberLiteral = {
            number: floatNumber
        }
    }
    else {
        const numberValue : number = Number.parseInt(top.value);
        const integerNumber : IntegerNumber = {
            integer: numberValue
        }
        numberLiteral = {
            number: integerNumber
        }
    }

    return { ast: numberLiteral, rest };
}

function parseIdentifier(tokens: Token[]) : ParseReturn<Identifier> {
    const { top, rest } = safeShift(tokens);
    const identifier : Identifier = {
        identifier: top.value
    };

    return { ast: identifier, rest };
}

type SafeShiftReturn = (tokens: Token[]) => { top: Token, rest: Token[] };

const safeShift : SafeShiftReturn = (tokens) => {
    if (tokens.length > 0) {
        return { top: tokens[0], rest: tokens.slice(1) };
    }

    throw new Error('Unexpected end of tokens');
}