import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    AreaChart, Area, ReferenceLine, ReferenceArea, PieChart, Pie, Cell,
    LineChart, Line
} from 'recharts';
import { Domain } from '../../types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const studentNames = payload[0].payload.students as string[] | undefined;
        
        return (
            <div className="bg-white p-5 rounded-[1.5rem] shadow-2xl border border-slate-100 ring-1 ring-black/5 min-w-[220px] max-w-[280px]">
                <p className="font-black text-slate-900 mb-3 border-b border-slate-50 pb-2 tracking-tight">{label || payload[0].name}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm mb-3 last:mb-0">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: p.color || p.fill }}></div>
                        <span className="text-slate-500 font-bold">{p.name}:</span>
                        <span className="font-black text-slate-800">
                            {typeof p.value === 'number' ? (p.unit === '%' ? `${p.value}%` : p.value) : p.value}
                        </span>
                    </div>
                ))}
                
                {studentNames && studentNames.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Student Roster</p>
                        <div className="flex flex-wrap gap-1.5">
                            {studentNames.map((name, idx) => (
                                <span key={idx} className="text-[10px] bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg font-black border border-slate-100 shadow-sm">
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

interface DomainPerformanceChartProps {
    data: { domain: Domain; score: number; target: number }[];
}

export const DomainPerformanceChart: React.FC<DomainPerformanceChartProps> = React.memo(({ data }) => {
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
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <ReferenceArea y1={80} y2={100} fill="#10b981" fillOpacity={0.05} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}}/>
                <Bar dataKey="score" fill="url(#colorScore)" name="Current Score" unit="%" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="target" fill="url(#colorTarget)" name="Target Benchmark" unit="%" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
        </ResponsiveContainer>
    );
});

export const RadarPerformanceChart: React.FC<DomainPerformanceChartProps> = React.memo(({ data }) => {
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
});

export const ProficiencyDistributionChart: React.FC<{ data: { name: string, count: number, color: string, students: string[] }[] }> = React.memo(({ data }) => (
    <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} />
            <Bar dataKey="count" name="Count" radius={[0, 10, 10, 0]} barSize={24}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
));

export const SupportTierChart: React.FC<{ data: { name: string, value: number, color: string, students: string[] }[] }> = React.memo(({ data }) => (
    <ResponsiveContainer width="100%" height={280}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
        </PieChart>
    </ResponsiveContainer>
));

interface LongitudinalGrowthChartProps {
    data: { name: string, [key: string]: number | string | null }[];
    lines: { key: string, color: string }[];
    type?: 'line' | 'area' | 'bar';
    actions?: { date: string, type: string }[];
}

export const LongitudinalGrowthChart: React.FC<LongitudinalGrowthChartProps> = React.memo(({ data, lines, type = 'line', actions = [] }) => {
    const commonProps = {
        data: data,
        margin: { top: 20, right: 20, left: -20, bottom: 0 }
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
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={90} stroke="#4f46e5" strokeDasharray="3 3" label={{ position: 'right', value: 'Outstanding', fill: '#4f46e5', fontSize: 9, fontWeight: 'bold' }} />
                        <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: 'Excellent', fill: '#10b981', fontSize: 9, fontWeight: 'bold' }} />
                        {actions.map((action, idx) => (
                            <ReferenceLine key={idx} x={action.date} stroke="#f59e0b" label={{ position: 'top', value: 'Action', fill: '#f59e0b', fontSize: 9, fontWeight: 'bold' }} />
                        ))}
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />
                        {lines.map(line => (
                            <Area 
                                key={line.key} 
                                type="monotone" 
                                dataKey={line.key} 
                                stroke={line.color} 
                                fillOpacity={1}
                                fill={`url(#color-${line.key})`}
                                unit="%"
                                strokeWidth={3}
                            />
                        ))}
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey={lines[0].key} fill={lines[0].color} radius={[4, 4, 0, 0]} barSize={40} unit="%" />
                    </BarChart>
                );
            case 'line':
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickMargin={10} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceArea y1={80} y2={100} fill="#10b981" fillOpacity={0.05} />
                        {lines.map(line => (
                             <Line 
                                key={line.key} 
                                type="monotone" 
                                dataKey={line.key} 
                                stroke={line.color} 
                                strokeWidth={3} 
                                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                                activeDot={{ r: 6, strokeWidth: 0 }} 
                                unit="%"
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
});