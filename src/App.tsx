import React from 'react'
import Calculator, { Bit, expression_to_string } from './calculator'
import Input from './components/input'
import { Parser } from './parser'
import Lexer from './tokenizer'

const App: React.FC = () => {
    const p_ref = React.useRef<HTMLParagraphElement>(null)
    const constants: Record<string, Bit> = {
        X: Bit.One,
        Y: Bit.Zero,
        Z: Bit.One,
    }

    const callback = (value: string) => {
        console.log(value)
        const parser = new Parser(new Lexer(value))
        const parsed = parser.parse()

        console.log(parser.errors)

        if (!parsed) {
            if (p_ref.current) p_ref.current.innerHTML = 'Invalid expression'
        } else {
            const calculator = new Calculator(constants)
            const result = calculator.calculate(parsed)

            if (p_ref.current) 
            {
                console.log(result)
                p_ref.current.innerHTML = `Expression: ${expression_to_string(parsed)}`
                if (result) p_ref.current.innerHTML += `<br />Result: ${result}`
                else p_ref.current.innerHTML += `<br />Error: ${calculator.errors}`
            }
        }
    }

    return (
        <div>
            <Input submit={callback} value='' />
            <p ref={p_ref}></p>
        </div>
    )
}

export default App
