
import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    LineChart, Line, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    AreaChart, Area
} from 'recharts';
import { Domain } from '../../types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 ring-1 ring-black/5">
                <p className="font-bold text-slate-800 mb-2">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <span className="text-slate-500">{p.name}:</span>
                        <span className="font-semibold text-slate-700">{p.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


interface DomainPerformanceChartProps {
    data: { domain: Domain; score: number; target: number }[];
}

export const DomainPerformanceChart: React.FC<DomainPerformanceChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="domain" 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    tickMargin={10}
                />
                <YAxis 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                <Bar dataKey="score" fill="url(#colorScore)" name="Current Score" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="target" fill="url(#colorTarget)" name="Target Benchmark" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const RadarPerformanceChart: React.FC<DomainPerformanceChartProps> = ({ data }) => {
    const radarData = data.map(d => ({
        subject: d.domain,
        A: d.score,
        B: d.target,
        fullMark: 100,
    }));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <Radar name="Current Score" dataKey="A" stroke="#4f46e5" strokeWidth={3} fill="#4f46e5" fillOpacity={0.4} />
                <Radar name="Target Benchmark" dataKey="B" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="#94a3b8" fillOpacity={0.1} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
                <Tooltip content={<CustomTooltip />} />
            </RadarChart>
        </ResponsiveContainer>
    );
};

interface LongitudinalGrowthChartProps {
    data: { name: string, [key: string]: number | string }[];
    lines: { key: string, color: string }[];
    type?: 'line' | 'area' | 'bar';
}

export const LongitudinalGrowthChart: React.FC<LongitudinalGrowthChartProps> = ({ data, lines, type = 'line' }) => {
    const commonProps = {
        data: data,
        margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                         <defs>
                             {lines.map((line, i) => (
                                <linearGradient key={`grad-${i}`} id={`color-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={line.color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
                                </linearGradient>
                             ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />
                        {lines.map(line => (
                            <Area 
                                key={line.key} 
                                type="monotone" 
                                dataKey={line.key} 
                                stroke={line.color} 
                                fillOpacity={1}
                                fill={`url(#color-${line.key})`}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />
                        {lines.map(line => (
                            <Bar 
                                key={line.key} 
                                dataKey={line.key} 
                                fill={line.color} 
                                radius={[4, 4, 0, 0]} 
                            />
                        ))}
                    </BarChart>
                );
            case 'line':
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />
                        {lines.map(line => (
                             <Line 
                                key={line.key} 
                                type="monotone" 
                                dataKey={line.key} 
                                stroke={line.color} 
                                strokeWidth={3} 
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                activeDot={{ r: 6, strokeWidth: 0 }} 
                            />
                        ))}
                    </LineChart>
                );
        }
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            {renderChart()}
        </ResponsiveContainer>
    );
};
