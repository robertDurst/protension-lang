// GRAMMAR
// program                ::= toplevelEntity[]
// toplevelEntity         ::= function | block
// function               ::= 'function' identifier '(' functionArguments ')' block
// functionArguments      ::= identifier[]
// block                  ::= assignment block | expression
// assignment             ::= 'var' identifier '=' expression
// expression             ::= functionCallExpression | binaryExpression | primitive
// functionCallExpression ::= identifier '(' expression[] ')'
// binaryExpression       ::= primitive operator expression
// operator               ::= '+' | '-' | '*' | '/'
// primitive              ::= number | identifier
// number                 ::= [0-9]+
// identifier             ::= [a-zA-Z]+

export type Program = { body: TopLevelEntity[] };

export type TopLevelEntity = { body: Function | Block };
export type Function = { identifier: string, arguments: string[], body: Block[] };

export type Block = { body: Assignment | Expression };
export type Assignment = { identifier: string, expression: Expression };
export type Expression = { body: FunctionCallExpression | BinaryExpression | Primitive };
export type BinaryExpression = { operator: string, left: Primitive, right: Expression };
export type Primitive = { primitive: NumberLiteral | Identifier };
export type NumberLiteral = { number: NumberType };

export type NumberType = FloatNumber | IntegerNumber;

export type FloatNumber = { float: number };
export type IntegerNumber = { integer: number };

export type Identifier = { identifier: string };

export type FunctionCallExpression = { identifier: string, arguments: Expression[] };
