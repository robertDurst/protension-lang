import { Program, Block, Assignment, Expression, TopLevelEntity, FunctionCallExpression, Function, BinaryExpression, Primitive, NumberLiteral, Identifier, IntegerNumber, FloatNumber, NumberType } from './ast';

// TODO: implement visitor pattern

type NumberTypeAsString = 'float' | 'integer';

export class Runtime {
    stack: any[];
    env: Record<string, number>;

    typecheckContext: Record<string, 'float' | 'integer'>;

    constructor() {
        this.stack = [];
        this.env = {};
        this.typecheckContext = {};
    }

    typecheck(ast: Program) {
        this.typecheckContext = {};

        this.typecheckProgram(ast);
    }

    typecheckProgram(ast: Program) {
        ast.body.forEach((block) => {
            this.typeCheckTopLevelEntity(block);
        });
    }

    typeCheckTopLevelEntity(ast: TopLevelEntity) {
        if ('identifier' in ast.body) {
            this.typecheckFunction(ast.body);
        } else {
            this.typecheckBlock(ast.body);
        }
    }

    typecheckFunction(ast: Function) {
        // TODO: implement
    }

    // Blocks are typed
    typecheckBlock(ast: Block) {
        if ('identifier' in ast.body) {
            this.typecheckAssignment(ast.body);
        } else {
            this.typecheckExpression(ast.body);
        }
    }

    // assignment is type of expression
    typecheckAssignment(ast: Assignment) {
        const { identifier, expression } = ast;
        this.typecheckContext[identifier] = this.typecheckExpression(expression);
    }

    typecheckExpression(ast: Expression): NumberTypeAsString {
        if ('identifier' in ast.body) {
            return this.typecheckFunctionCallExpression(ast.body);
        } else if ('operator' in ast.body) {
            return this.typecheckBinaryExpression(ast.body);
        } else {
            return this.typecheckPrimitive(ast.body);
        }
    }

    typecheckPrimitive(ast: Primitive): NumberTypeAsString {
        if ('number' in ast.primitive) {
            return this.typecheckNumberLiteral(ast.primitive);
        } else {
            return this.typecheckIdentifier(ast.primitive);
        }
    }

    typecheckFunctionCallExpression(ast: FunctionCallExpression): NumberTypeAsString {
        const { identifier, arguments: args } = ast;

        // TODO: actually look up the function
        return 'float';
    }

    typecheckBinaryExpression(ast: BinaryExpression): NumberTypeAsString {
        const { operator, left, right } = ast;

        const leftType: NumberTypeAsString = this.typecheckPrimitive(left);
        const rightType: NumberTypeAsString = this.typecheckExpression(right);

        if (leftType !== rightType) {
            throw new Error(`Type mismatch in typecheckBinaryExpression: ${leftType} and ${rightType}`);
        }

        return leftType;
    }

    typecheckNumberLiteral(ast: NumberLiteral): NumberTypeAsString {
        if ('float' in ast.number) {
            return this.typecheckFloatNumber(ast.number);
        } else {
            return this.typecheckIntegerNumber(ast.number);
        }
    }

    typecheckIntegerNumber(ast: IntegerNumber): NumberTypeAsString {
        return 'integer';
    }

    typecheckFloatNumber(ast: FloatNumber): NumberTypeAsString {
        return 'float';
    }

    typecheckIdentifier(ast: Identifier): NumberTypeAsString {
        return this.typecheckContext[ast.identifier];
    }

    execute(ast: Program) {
        return this.visitProgram(ast);
    }

    run(ast: Program) {
        this.typecheck(ast);
        return this.execute(ast);
    }

    visitProgram(ast: Program) {
        let returnValue: any = 0;
        ast.body.forEach((block) => {
            returnValue = this.visitTopLevelEntity(block);
        });

        return returnValue;
    }

    visitTopLevelEntity(ast: TopLevelEntity) {
        if ('identifier' in ast.body) {
            return this.visitFunction(ast.body);
        } else {
            return this.visitBlock(ast.body);
        }
    }

    visitFunction(ast: Function) {
        // TODO: implement - save function definition
    }

    visitBlock(ast: Block): any {
        if ('identifier' in ast.body) {
            return this.visitAssignment(ast.body);
        } else {
            return this.visitExpression(ast.body);
        }
    }

    visitAssignment(ast: Assignment): boolean {
        const { identifier, expression } = ast;
        const value: number = this.visitExpression(expression);

        // TODO: add check that this is a valid identifier
        this.set(identifier, value);

        return true;
    }

    visitExpression(ast: Expression) : number {
        if ('identifier' in ast.body) {
            return this.visitFunctionCallExpression(ast.body);
        } else if ('operator' in ast.body) {
            return this.visitBinaryExpression(ast.body);
        } else {
            return this.visitPrimitive(ast.body);
        }
    }

    visitPrimitive(ast: Primitive) : number {
        if ('number' in ast.primitive) {
            return this.visitNumberLiteral(ast.primitive);
        } else {
            return this.visitIdentifier(ast.primitive);
        }
    }

    visitFunctionCallExpression(ast: FunctionCallExpression) : number {
        const { identifier, arguments: args } = ast;

        return 10;
    }

    visitBinaryExpression(ast: BinaryExpression) {
        const { operator, left, right } = ast;

        const leftValue : number = this.visitPrimitive(left);
        const rightValue: number = this.visitExpression(right);

        switch (operator) {
            case '+':
                return leftValue + rightValue;
            case '-':
                return leftValue - rightValue;
            default:
                throw new Error(`Unexpected operator ${operator}`);
        }
    }

    visitNumberLiteral(ast: NumberLiteral): number {
        if ('float' in ast.number) {
            return this.visitFloatNumber(ast.number);
        } else {
            return this.visitIntegerNumber(ast.number);
        }
    }

    visitIntegerNumber(ast: IntegerNumber): number {
        return ast.integer;
    }

    visitFloatNumber(ast: FloatNumber): number {
        return ast.float;
    }   

    visitIdentifier(ast: Identifier) : number {
        // TODO: add check that this is a valid identifier
        const lookedUpValue = this.lookup(ast.identifier);
        return lookedUpValue;
    }

    lookup(name: string) : number {
        return this.env[name];
    }

    set(name: string, value: number) {
        this.env[name] = value;
    }
}