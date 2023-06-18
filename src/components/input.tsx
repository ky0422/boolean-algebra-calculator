interface InputProps {
    value: string
    submit: (value: string) => void
}

export default (props: InputProps) => (
    <form
        onSubmit={(e) => {
            e.preventDefault()
            props.submit((e.target as any)[0].value)
        }}
    >
        <input type='text' defaultValue={props.value} />
        <input type='submit' value='Calculate' />
    </form>
)
