export default function FormGroupCheckbox({
    labelText,
    value,
    options,
    isRequired=false,
    id,
    name,
    customClass
}){
    return(
        <div className="flex flex-col pb-4">
            <label className="text-sm font-medium">{labelText}</label>
            <fieldset className="grid grid-cols-3 gap-3 rounded-md border p-2 border-gray-300">
                {
                    options.map((option, index)=>
                        <div key={index} className="flex gap-1 place-items-center">
                            <input
                                type='checkbox'
                                id={`${id}-${index}`}
                                name={option.name}
                                value={option.value}
                            />
                            <label htmlFor={`${id}-${index}`} className="text-sm font-medium">{option.lableText}</label>
                        </div>

                        )
                }
            </fieldset>
        </div>
    )
}