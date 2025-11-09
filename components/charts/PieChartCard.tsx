import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../constants';

interface PieChartData {
    name: string;
    value: number;
}

interface PieChartCardProps {
    title: string;
    data: PieChartData[];
}

const PieChartCard: React.FC<PieChartCardProps> = ({ title, data }) => {
    const [showPercent, setShowPercent] = useState(false);
    const total = data.reduce((acc, entry) => acc + entry.value, 0);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value }: any) => {
        // Hide label for very small slices to prevent visual clutter
        if (percent < 0.05) {
            return null;
        }
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold pointer-events-none">
                {showPercent ? `${(percent * 100).toFixed(0)}%` : value}
            </text>
        );
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                <div className="flex items-center text-sm">
                    <span className="mr-2 text-gray-600">Ver:</span>
                    <button onClick={() => setShowPercent(false)} className={`px-2 py-1 rounded-l-md ${!showPercent ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Absoluto</button>
                    <button onClick={() => setShowPercent(true)} className={`px-2 py-1 rounded-r-md ${showPercent ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Porcentaje</button>
                </div>
            </div>
            {data.length > 0 ? (
                <div className="flex-grow min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius="80%"
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number, name: string) => {
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return [`${value} (${percentage}%)`, name];
                            }} />
                            <Legend iconSize={10} verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    No hay datos disponibles.
                </div>
            )}
        </div>
    );
};

export default PieChartCard;