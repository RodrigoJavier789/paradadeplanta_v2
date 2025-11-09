import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../constants';

interface BarChartData {
    name: string;
    value: number;
}

interface BarChartCardProps {
    title: string;
    data: BarChartData[];
}

const BarChartCard: React.FC<BarChartCardProps> = ({ title, data }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            {data.length > 0 ? (
                <div className="flex-grow min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                width={150}
                                tick={{ fontSize: 12 }} 
                                interval={0}
                            />
                            <Tooltip formatter={(value: number) => [value, 'Cantidad']} />
                            <Bar dataKey="value" fill={CHART_COLORS[1]} name="Cantidad" />
                        </BarChart>
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

export default BarChartCard;