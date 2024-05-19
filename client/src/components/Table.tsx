export type TableProps = {
    data: any[]
}

export default function Table({ data }: TableProps) {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        {Object.keys(data[0]).map((columnName) => (
                            <th key={columnName} scope="col" className="px-6 py-3">
                                {columnName}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="odd:bg-white even:bg-slate-50 border-b">
                            {Object.values(row).map((value: any, j) =>
                                j === 0 ? (
                                    <th
                                        scope="row"
                                        key={j}
                                        className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap"
                                    >
                                        {value}
                                    </th>
                                ) : (
                                    <td key={j} className="px-6 py-4">
                                        {value}
                                    </td>
                                )
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
