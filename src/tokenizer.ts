// X AND (Y OR (Z XOR (NOT A)))
export enum TokenKind {
    LPAREN = "(",
    RPAREN = ")",
    AND = "AND",
    OR = "OR",
    XOR = "XOR",
    NOT = "NOT",
    IDENTIFIER = "IDENTIFIER",
    EOF = "EOF",
    ILLEGAL = "ILLEGAL",
}

export interface Token {
    kind: TokenKind
    value?: string
    line: number
    column: number
}

const string_to_token_kind = (str: string): TokenKind => {
    switch (str.toUpperCase()) {
        case "AND":
            return TokenKind.AND
        case "OR":
            return TokenKind.OR
        case "XOR":
            return TokenKind.XOR
        case "NOT":
            return TokenKind.NOT
        default:
            return TokenKind.IDENTIFIER
    }
}

export default class Lexer {
    private position: number = 0
    private read_position: number = 0
    private char: string = ""

    public line: number = 1
    public column: number = 0

    constructor(public input: string) {
        this.read_char()
    }

    private read_char() {
        if (this.read_position >= this.input.length) this.char = "\0"
        else this.char = this.input[this.read_position]

        this.position = this.read_position
        this.read_position += 1

        this.column += 1
    }

    private skip_whitespace() {
        while (this.char === " " || this.char === "\t" || this.char === "\n" || this.char === "\r") {
            if (this.char === "\n") {
                this.line += 1
                this.column = 0
            }
            this.read_char()
        }
    }

    private read_identifier(): string {
        const position = this.position
        while (this.char.match(/[a-zA-Z]/)) this.read_char()

        return this.input.substring(position, this.position)
    }

    next_token(): Token {
        this.skip_whitespace()

        const token: Token = {
            kind: TokenKind.EOF,
            line: this.line,
            column: this.column,
        }

        switch (this.char) {
            case "(":
                token.kind = TokenKind.LPAREN
                break
            case ")":
                token.kind = TokenKind.RPAREN
                break
            case "\0":
                token.kind = TokenKind.EOF
                break
            default:
                if (this.char.match(/[a-zA-Z]/)) {
                    const identifier = this.read_identifier()
                    token.column = this.column - 1
                    token.line = this.line
                    token.kind = string_to_token_kind(identifier)
                    token.value = identifier

                    return token
                }

                token.kind = TokenKind.ILLEGAL
                break
        }

        this.read_char()

        return token
    }
}
