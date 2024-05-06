export type TableProps = {
    data: any[]
}

export default function Table({ data }: TableProps) {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                        <tr
                            key={i}
                            className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                        >
                            {Object.values(row).map((value: any, j) =>
                                j === 0 ? (
                                    <th
                                        scope="row"
                                        key={j}
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
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
