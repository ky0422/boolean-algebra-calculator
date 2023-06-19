interface InputProps {
    value: string
    submit: (value: string) => void
    textClassNames?: string
    submitClassNames?: string
}

export default (props: InputProps) => (
    <form
        onSubmit={(e) => {
            e.preventDefault()
            props.submit((e.target as any)[0].value)
        }}
    >
        <input type='text' defaultValue={props.value} className={props.textClassNames} />
        <input type='submit' value='Calculate' className={props.submitClassNames} />
    </form>
)
