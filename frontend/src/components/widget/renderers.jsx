import React from 'react';
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	LineChart,
	Line,
	AreaChart,
	Area,
	ScatterChart,
	Scatter,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
	Brush,
} from 'recharts';

// The same default colors you use elsewhere
export const DEFAULT_COLORS = [
	'#8884d8',
	'#82ca9d',
	'#ffc658',
	'#ff8042',
	'#8dd1e1',
	'#a4de6c',
	'#d0ed57',
	'#fa8072',
	'#a28be2',
	'#60d394',
	'#ee6055',
];

// PIE
export function PieRenderer({ pieData }) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<PieChart>
				<Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label>
					{pieData.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
					))}
				</Pie>
				<Tooltip />
				<Legend
					payload={pieData.map((entry, index) => ({
						id: entry.name,
						type: 'square',
						value: `${entry.name} (${entry.value})`,
						color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
					}))}
				/>
			</PieChart>
		</ResponsiveContainer>
	);
}

// BAR
export function BarRenderer({ chartData, xKey, yKeys }) {
	// yKeys: array of field names to stack
	if (!yKeys || yKeys.length === 0) return null;

	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey={xKey} />
				<YAxis />
				<Tooltip />
				<Legend />
				{yKeys.map((yKey, idx) => (
					<Bar
						key={yKey}
						dataKey={yKey}
						stackId="stack"
						fill={DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
						name={yKey}
					/>
				))}
				<Brush dataKey={xKey} height={20} stroke={DEFAULT_COLORS[0]} />
			</BarChart>
		</ResponsiveContainer>
	);
}

export function LineRenderer({ chartData, xKey, yKey }) {
	const tooManyDots = chartData.length > 20;
	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey={xKey} />
				<YAxis />
				<Tooltip />
				<Legend />
				<Line
					type="monotone"
					dataKey={yKey || 'frequency'}
					stroke={DEFAULT_COLORS[1]}
					dot={tooManyDots ? false : true}
					activeDot={tooManyDots ? false : { r: 7 }}
				/>
				<Brush dataKey={xKey} height={20} stroke={DEFAULT_COLORS[1]} />
			</LineChart>
		</ResponsiveContainer>
	);
}

//AREA
export function AreaRenderer({ chartData, xKey, yKey }) {
	const tooManyDots = chartData.length > 20;
	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey={xKey} />
				<YAxis />
				<Tooltip />
				<Legend />
				<Area
					type="monotone"
					dataKey={yKey || 'frequency'}
					stroke={DEFAULT_COLORS[2]}
					fill={DEFAULT_COLORS[2]}
					dot={tooManyDots ? false : true}
					activeDot={tooManyDots ? false : { r: 7 }}
				/>
				<Brush dataKey={xKey} height={20} stroke={DEFAULT_COLORS[2]} />
			</AreaChart>
		</ResponsiveContainer>
	);
}

// SCATTER
export function ScatterRenderer({ data, xKey, yKey }) {
	const hasX = xKey && typeof data?.[0]?.[xKey] === 'number';
	const hasY = yKey && typeof data?.[0]?.[yKey] === 'number';
	return (
		<ResponsiveContainer width="100%" height="100%">
			<ScatterChart>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey={hasX ? xKey : undefined} name={xKey} type="number" />
				<YAxis dataKey={hasY ? yKey : undefined} name={yKey} type="number" />
				<Tooltip cursor={{ strokeDasharray: '3 3' }} />
				<Scatter name={yKey || 'value'} data={hasX && hasY ? data : []} fill={DEFAULT_COLORS[3]} />
			</ScatterChart>
		</ResponsiveContainer>
	);
}

// RADAR
export function RadarRenderer({ radarData, xKey, yKey }) {
	return (
		<ResponsiveContainer width="100%" height="100%">
			<RadarChart data={radarData}>
				<PolarGrid />
				<PolarAngleAxis dataKey={xKey} />
				<PolarRadiusAxis />
				<Radar name={yKey} dataKey={yKey} stroke={DEFAULT_COLORS[4]} fill={DEFAULT_COLORS[4]} fillOpacity={0.5} />
				<Legend />
			</RadarChart>
		</ResponsiveContainer>
	);
}
