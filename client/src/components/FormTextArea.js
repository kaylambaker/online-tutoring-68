const fixedInputClass="rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm "

export default function FormTextArea({
    labelText,
    value,
    type,
    placeholder,
    isRequired=false,
    id,
    name,
    rows=5,
    cols=5,
    customClass
}){
    return(
        <div className="flex flex-col pb-4">
            <label className="text-sm font-medium">{labelText}</label>
            <textarea 
                value={value}
                id={id}
                name={name}
                type={type}
                required={isRequired}
                placeholder={placeholder}
                className={fixedInputClass+customClass}
                rows={rows}
                cols={cols}
            />
        </div>
    )
}