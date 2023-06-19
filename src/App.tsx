import React from 'react'
import Calculator, { Bit, CalcProcess, expression_to_string } from './calculator/calculator'
import Input from './components/input'
import { Parser } from './calculator/parser'
import Lexer from './calculator/tokenizer'

enum CalculateResultKind {
    Success,
    Error,
}

interface CalculateSuccess {
    kind: CalculateResultKind.Success
    result: Bit
    parsed: string
    expression: string
    processes: CalcProcess[]
}

interface CalculateError {
    kind: CalculateResultKind.Error
    errors: string[]
}

const App: React.FC = () => {
    const [value, setValue] = React.useState<CalculateSuccess | CalculateError | null>(null)

    const constants: Record<string, Bit> = {
        X: Bit.One,
        Y: Bit.Zero,
        Z: Bit.One,
    }

    const callback = (input: string) => {
        const parser = new Parser(new Lexer(input))
        const parsed = parser.parse()

        if (!parsed) {
            setValue({
                kind: CalculateResultKind.Error,
                errors: parser.errors,
            })
        } else {
            const calculator = new Calculator(constants)
            const result = calculator.calculate(parsed)

            if (result === null) {
                setValue({
                    kind: CalculateResultKind.Error,
                    errors: calculator.errors,
                })
            } else {
                setValue({
                    kind: CalculateResultKind.Success,
                    result,
                    parsed: expression_to_string(parsed),
                    expression: expression_to_string(parsed, constants),
                    processes: calculator.calc_processes,
                })
            }
        }

        console.log(value)
    }

    return (
        <div className='flex flex-col content-center justify-center text-center h-screen'>
            <Input
                submit={callback}
                value=''
                textClassNames='border-2 border-gray-400 rounded-lg p-2 m-2'
                submitClassNames='border-2 border-gray-400 rounded-lg p-2 m-2'
            />
            {value &&
                (value.kind === CalculateResultKind.Success ? (
                    <div>
                        <p>Parsed: {value.parsed}</p>
                        <p>Expression: {value.expression}</p>
                        <p>Result: {value.result}</p>
                        <p>Processes:</p>
                        <ul>{value && value.processes.map((process, index) => <li key={index}>{CalcProcess.to_string(process)}</li>)}</ul>
                    </div>
                ) : (
                    <div>
                        <p>Errors:</p>
                        <ul>{value && value.errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
                    </div>
                ))}
        </div>
    )
}

export default App
