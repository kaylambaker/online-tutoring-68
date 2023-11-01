const fixedSelectClass="rounded-md block w-full px-3 py-2 border-0 border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm "

export default function FormSelect({
    labelText,
    value,
    options,
    isRequired=false,
    id,
    name,
    customClass,
    changeHandler
}){
    return(
        <div className="flex flex-col pb-4">
            <label className="text-sm font-medium">{labelText}</label>
            <select 
                value={value}
                id={id}
                name={name}
                required={isRequired}
                className={fixedSelectClass+customClass}
                onChange={changeHandler}
            >
                {
                    options.map((option)=>
                        <option key={`${id}-${option.value}`} value={option.value}>{option.label}</option>
                    )
                }
            </select>
        </div>
    )
}