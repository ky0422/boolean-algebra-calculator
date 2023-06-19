import { BinaryLogicalOperator, LogicalExpression, LogicalExpressionKind, UnaryLogicalOperator } from "./calculator"
import Lexer, { Token, TokenKind } from "./tokenizer"

export class Parser {
    current_token!: Token
    peek_token!: Token
    current_line: number = 0
    current_column: number = 0
    errors: string[] = []

    constructor(public lexer: Lexer) {
        this.next_token()
        this.next_token()
    }

    public parse(): LogicalExpression | null {
        let expression = this.parse_expression(Priority.LOWEST)
        if (!expression) return null

        if (!this.expect_token(TokenKind.EOF)) return null

        return expression
    }

    private next_token() {
        this.current_token = this.peek_token
        this.peek_token = this.lexer.next_token()

        this.current_line = this.peek_token.line
        this.current_column = this.peek_token.column
    }

    private expect_token(kind: TokenKind) {
        if (this.peek_token.kind === kind) {
            this.next_token()
            return true
        }

        this.push_error(`expected next token to be ${kind}, got ${this.peek_token.kind} instead`)
        return false
    }

    private get_priority(kind: TokenKind, n: number): Priority {
        switch (kind) {
            case TokenKind.OR:
                return Priority.OR
            case TokenKind.XOR:
                return Priority.XOR
            case TokenKind.AND:
                return Priority.AND
            case TokenKind.NOT:
                return Priority.NOT
            case TokenKind.LPAREN:
                return Priority.PAREN
            default:
                return Priority.LOWEST
        }
    }

    private push_error(message: string) {
        this.errors.push(`(${this.current_line}:${this.current_column}) ${message}`)
    }

    private parse_expression(priority: Priority): LogicalExpression | null {
        let left = this.parse_prefix()
        if (!left) return null

        while (this.peek_token.kind !== TokenKind.EOF && priority < this.get_priority(this.peek_token.kind, 1)) {
            this.next_token()
            left = this.parse_infix(left)
        }

        return left
    }

    private parse_prefix(): LogicalExpression | null {
        switch (this.current_token.kind) {
            case TokenKind.IDENTIFIER: {
                const result: LogicalExpression = {
                    kind: LogicalExpressionKind.Variable,
                    name: this.current_token.value!,
                }
                return result
            }
            case TokenKind.NOT: {
                this.next_token()
                let expression = this.parse_expression(Priority.NOT)
                if (!expression) return null

                return {
                    kind: LogicalExpressionKind.UnaryOperation,
                    operator: UnaryLogicalOperator.NOT,
                    operand: expression,
                }
            }
            case TokenKind.LPAREN: {
                this.next_token()
                let expression = this.parse_expression(Priority.LOWEST)

                if (!this.expect_token(TokenKind.RPAREN)) return null

                return expression
            }
            default:
                this.push_error(`unknown expression ${this.current_token.kind}`)
                return null
        }
    }

    private parse_infix(left: LogicalExpression | null): LogicalExpression | null {
        if (!left) return null

        let operator
        switch (this.current_token.kind) {
            case TokenKind.AND:
                operator = BinaryLogicalOperator.AND
                break
            case TokenKind.OR:
                operator = BinaryLogicalOperator.OR
                break
            case TokenKind.XOR:
                operator = BinaryLogicalOperator.XOR
                break
            default:
                this.push_error(`unknown operator ${this.current_token.value}`)
                return null
        }

        const priority = this.get_priority(this.current_token.kind, 2)
        this.next_token()

        let right = this.parse_expression(priority)
        if (!right) return null

        return {
            kind: LogicalExpressionKind.BinaryOperation,
            operator,
            left,
            right,
        }
    }
}

export enum Priority {
    LOWEST = 1,
    OR = 2,
    XOR = 3,
    AND = 4,
    NOT = 5,
    PAREN = 6,
}
