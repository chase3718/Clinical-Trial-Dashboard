import React, { useMemo } from 'react';
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	CartesianGrid,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF7891', '#82ca9d', '#8884d8'];

function groupAndCount(data, groupKey) {
	const grouped = {};
	data.forEach((row) => {
		const value = row[groupKey] || 'Unknown';
		grouped[value] = (grouped[value] || 0) + 1;
	});
	return Object.entries(grouped).map(([key, count]) => ({ [groupKey]: key, count }));
}

export default function DashboardChart({ widget, data }) {
	// Memoize aggregated data
	const groupedData = useMemo(() => {
		if ((widget.chartType === 'bar' || widget.chartType === 'pie') && widget.groupBy) {
			return groupAndCount(data, widget.groupBy);
		}
		return null;
	}, [widget, data]);

	// Only pass the data needed to each chart
	if (widget.chartType === 'bar' && widget.dataKeys && widget.xAxisKey) {
		return (
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={widget.xAxisKey} />
					<YAxis />
					<Tooltip />
					<Legend />
					{widget.dataKeys.map(({ key, name }, idx) => (
						<Bar key={key} dataKey={key} name={name} fill={COLORS[idx % COLORS.length]} />
					))}
				</BarChart>
			</ResponsiveContainer>
		);
	}

	if (widget.chartType === 'bar' && widget.groupBy && groupedData) {
		return (
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={groupedData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={widget.groupBy} />
					<YAxis allowDecimals={false} />
					<Tooltip />
					<Legend />
					<Bar dataKey="count" name={widget.barLabel || 'Count'} fill={COLORS[0]} />
				</BarChart>
			</ResponsiveContainer>
		);
	}

	if (widget.chartType === 'line' && widget.dataKeys && widget.xAxisKey) {
		return (
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey={widget.xAxisKey} />
					<YAxis />
					<Tooltip />
					<Legend />
					{widget.dataKeys.map(({ key, name }, idx) => (
						<Line key={key} type="monotone" dataKey={key} name={name} stroke={COLORS[idx % COLORS.length]} />
					))}
				</LineChart>
			</ResponsiveContainer>
		);
	}

	if (widget.chartType === 'pie' && widget.groupBy && groupedData) {
		return (
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Tooltip />
					<Legend />
					<Pie data={groupedData} dataKey="count" nameKey={widget.groupBy} cx="50%" cy="50%" outerRadius="80%" label>
						{groupedData.map((entry, idx) => (
							<Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
						))}
					</Pie>
				</PieChart>
			</ResponsiveContainer>
		);
	}

	return <div>Unknown or unsupported chart type: {widget.chartType}</div>;
}
