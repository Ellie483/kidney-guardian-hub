import React, { useState, useEffect, useMemo } from "react";

interface TargetDetails {
    count: number;
    percentage: number;
}

interface TargetsData {
    [key: string]: TargetDetails;
}

interface CellData {
    targets: TargetsData;
    total_count: number;
}

interface PivotRow {
    row: string;
    [key: string]: CellData | string;
}

interface PivotTableProps {
    rowField: string;
    colField: string;
    targetField?: string;
    fieldLabels: { [key: string]: string };
}

const PivotTable: React.FC<PivotTableProps> = ({
    rowField,
    colField,
    targetField = "target",
    fieldLabels
}) => {
    const [pivotData, setPivotData] = useState<PivotRow[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [columns, setColumns] = useState<string[]>([]);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const [view, setView] = useState<"table" | "text">("table");
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
    const [allExpanded, setAllExpanded] = useState<boolean>(false);

    useEffect(() => {
        if (!rowField || !colField) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                params.append("row_field", rowField);
                params.append("col_field", colField);
                if (targetField) params.append("target_field", targetField);

                const response = await fetch(`http://localhost:5000/analysis/cube?${params.toString()}`);
                const result = await response.json();

                if (result.data && result.data.length > 0) {
                    setPivotData(result.data);
                    const firstRow = result.data[0] as PivotRow;
                    const dynamicColumns = Object.keys(firstRow).filter(k => k !== "row");
                    setColumns(dynamicColumns);

                    if (dynamicColumns.length > 0) {
                        const firstColData = firstRow[dynamicColumns[0]] as CellData;
                        setTargetKeys(firstColData?.targets ? Object.keys(firstColData.targets) : []);
                    }
                } else {
                    setPivotData([]);
                    setColumns([]);
                    setTargetKeys([]);
                }
                setLoading(false);
            } catch (e) {
                console.error(e);
                setError(e instanceof Error ? e.message : "Failed to load data");
                setLoading(false);
            }
        };

        fetchData();
    }, [rowField, colField, targetField]);

    const toggleView = () => setView(prev => prev === 'table' ? 'text' : 'table');

    const toggleRow = (row: string) => {
        setExpandedRows(prev => ({ ...prev, [row]: !prev[row] }));
    };

    const toggleAllRows = () => {
        const newExpanded: { [key: string]: boolean } = {};
        if (pivotData) {
            pivotData.forEach(rowData => {
                newExpanded[rowData.row] = !allExpanded;
            });
        }
        setExpandedRows(newExpanded);
        setAllExpanded(!allExpanded);
    };

    const displayValue = (val: string | number) => {
        if (val === 1 || val === "1") return "Yes";
        if (val === 0 || val === "0") return "No";
        return val;
    };

    const grandTotals = useMemo(() => {
        if (!pivotData || pivotData.length === 0) return null;
        const totals: { [key: string]: number } = { total: 0 };
        columns.forEach(col => {
            totals[col] = pivotData.reduce((sum, row) => sum + ((row[col] as CellData)?.total_count || 0), 0);
            totals.total += totals[col];
        });
        return totals;
    }, [pivotData, columns]);

    const renderTable = () => {
        if (!pivotData || pivotData.length === 0) {
            return <div className="text-center p-8 text-gray-500">No data available to display.</div>;
        }

        const totalGrandPatients = grandTotals?.total || 1;

        return (
            <div className="table-container overflow-x-auto max-h-[600px]">
                <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border border-gray-200 p-3 text-left text-sm font-medium text-gray-700">
                                {rowField ? fieldLabels[rowField] : "Row"}
                            </th>
                            {columns.map(col => (
                                <th
                                    key={col}
                                    className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-700"
                                >
                                    {displayValue(col)}
                                </th>
                            ))}
                            <th className="border border-gray-200 p-3 text-center text-sm font-medium text-gray-700">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pivotData.map(rowData => {
                            const rowTotalCount = columns.reduce((sum, col) => sum + ((rowData[col] as CellData)?.total_count || 0), 0);
                            const rowTotalPercentage = (rowTotalCount / totalGrandPatients) * 100;
                            return (
                                <React.Fragment key={rowData.row}>
                                    <tr className="hover:bg-gray-50 transition">
                                        <td className="border border-gray-200 p-3">
                                            <button
                                                className="text-blue-600 hover:underline"
                                                onClick={() => toggleRow(rowData.row)}
                                                title={`Toggle details for ${rowData.row}`}
                                                aria-expanded={expandedRows[rowData.row] || false}
                                            >
                                                {expandedRows[rowData.row] ? "▼" : "▶"} {displayValue(rowData.row)}
                                            </button>
                                        </td>
                                        {columns.map(col => {
                                            const cellCount = ((rowData[col] as CellData)?.total_count || 0);
                                            const cellPercentage = (cellCount / totalGrandPatients) * 100;
                                            return (
                                                <td key={col} className="border border-gray-200 p-3 text-center text-sm" title={`${cellPercentage.toFixed(2)}%`}>
                                                    {cellPercentage.toFixed(2)}% 
                                                </td>
                                            );
                                        })}
                                        <td className="border border-gray-200 p-3 text-center text-sm font-semibold">
                                            {rowTotalPercentage.toFixed(2)}%
                                        </td>
                                    </tr>
                                    {expandedRows[rowData.row] && (
                                        <tr className="sub-table animate-slideDown">
                                            <td colSpan={columns.length + 2} className="border border-gray-200 p-3">
                                                <table className="w-full border-collapse border border-gray-100">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="border border-gray-100 p-2 text-left text-xs font-medium text-gray-600">Target</th>
                                                            {columns.map(col => (
                                                                <th key={col} className="border border-gray-100 p-2 text-center text-xs font-medium text-gray-600">
                                                                    {displayValue(col)}
                                                                </th>
                                                            ))}
                                                            <th className="border border-gray-100 p-2 text-center text-xs font-medium text-gray-600">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {targetKeys.map(target => {
                                                            const targetRowTotal = columns.reduce((sum, col) => sum + (((rowData[col] as CellData)?.targets?.[target]?.count) || 0), 0);
                                                            const totalRowForTarget = rowTotalCount > 0 ? (targetRowTotal / rowTotalCount) * 100 : 0;
                                                            return (
                                                                <tr key={target} className="hover:bg-gray-50">
                                                                    <td className="border border-gray-100 p-2 text-xs capitalize">{target.replace("_", " ")}</td>
                                                                    {columns.map(col => (
                                                                        <td key={col} className="border border-gray-100 p-2 text-center text-xs" title={`${((rowData[col] as CellData)?.targets?.[target]?.percentage || 0).toFixed(2)}%`}>
                                                                            {((rowData[col] as CellData)?.targets?.[target]?.percentage || 0).toFixed(2)}%
                                                                        </td>
                                                                    ))}
                                                                    <td className="border border-gray-100 p-2 text-center text-xs font-semibold">
                                                                        {totalRowForTarget.toFixed(2)}% 
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        <tr className="bg-blue-50 font-semibold">
                            <td className="border border-gray-200 p-3 text-left text-sm">Grand Total</td>
                            {grandTotals && columns.map(col => {
                                const colPercentage = (grandTotals[col] / (grandTotals?.total || 1)) * 100;
                                return <td key={col} className="border border-gray-200 p-3 text-center text-sm">{colPercentage.toFixed(2)}%</td>;
                            })}
                            <td className="border border-gray-200 p-3 text-center text-sm">100.00%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    const renderTextSummary = () => {
        // if (!pivotData || pivotData.length === 0 || columns.length < 2) {
        //     return (
        //         <div className="bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 text-gray-800 text-center">
        //             No data available to generate a summary. Please select both Row and Column fields.
        //         </div>
        //     );
        // }

        const totalGrandPatients = grandTotals?.total || 1;

        const colPercentages: { [key: string]: number } = {};
        columns.forEach(col => {
            colPercentages[col] = ((grandTotals?.[col] || 0) / totalGrandPatients) * 100;
        });

        const rowSummaries = pivotData.map(row => {
            const rowTotalCount = columns.reduce((sum, col) => sum + ((row[col] as CellData)?.total_count || 0), 0);
            let highest: { target: string; col: string; percentage: number } = { target: '', col: '', percentage: 0 };

            targetKeys.forEach(target => {
                columns.forEach(col => {
                    const cellTarget = (row[col] as CellData)?.targets?.[target];
                    if (cellTarget && cellTarget.percentage > highest.percentage) {
                        highest = { target, col, percentage: cellTarget.percentage };
                    }
                });
            });

            return {
                row: row.row,
                highestTarget: highest.target,
                highestCol: highest.col,
                highestPercentage: highest.percentage
            };
        });

        return (
            <div className="bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 text-gray-800 space-y-4">
                <h2 className="text-xl font-semibold mb-3">Pivot Table Summary</h2>

                <p className="text-sm leading-relaxed">
                    The pivot table compares <strong>{fieldLabels[rowField]}</strong> vs <strong>{fieldLabels[colField]}</strong>.
                    Percentages represent the proportion of patients within each category relative to the total patient population.
                </p>

                <div className="space-y-2">
                    {rowSummaries.map((summary, idx) => (
                        <p key={idx} className="text-sm">
                            In the <strong>{displayValue(summary.row)}</strong> group, the highest proportion of patients falls under 
                            <strong> {summary.highestTarget.replace(/_/g, ' ')} </strong> for 
                            <strong> {displayValue(summary.highestCol)} </strong> category (~{summary.highestPercentage.toFixed(2)}% of total patients).
                        </p>
                    ))}
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Column-wise Distribution</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {columns.map(col => (
                            <li key={col}>
                                <strong>{displayValue(col)}</strong> category represents ~{colPercentages[col].toFixed(2)}% of all patients.
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    if (!rowField || !colField) {
        return (
            <div className="text-center p-8 text-gray-500">
                Please select both <strong>Row</strong> and <strong>Column</strong> fields to display the pivot table.
            </div>
        );
    }

    if (loading) return <div className="text-center p-8 text-gray-500">Loading pivot table...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Pivot Table: {fieldLabels[rowField]} vs {fieldLabels[colField]}
                </h1>
                <div className="flex space-x-2">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                        onClick={toggleView}
                        disabled={!rowField || !colField}
                        title={view === 'table' ? "Show text summary" : "Show table view"}
                    >
                        {view === 'table' ? "Show Text Version" : "Show Table Version"}
                    </button>
                    {view === 'table' && (
                        <button
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition disabled:opacity-50"
                            onClick={toggleAllRows}
                            disabled={!rowField || !colField}
                            title={allExpanded ? "Collapse all rows" : "Expand all rows"}
                        >
                            {allExpanded ? "Collapse All" : "Expand All"}
                        </button>
                    )}
                </div>
            </div>
            {view === 'table' ? renderTable() : renderTextSummary()}
        </div>
    );
};

export default PivotTable;
