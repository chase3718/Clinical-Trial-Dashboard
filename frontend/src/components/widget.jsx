import React, { useState, useMemo } from 'react';
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
} from 'recharts';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

const DEFAULT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#fa8072'];

// PIE: sum if valueKey, else count frequency
function preparePieData(data, groupKey, valueKey) {
	if (!groupKey) return [];
	const groups = {};
	data.forEach((item) => {
		const cat = item[groupKey];
		const val = item[valueKey];
		if (cat !== undefined && cat !== null) {
			if (valueKey && typeof val === 'number' && !isNaN(val)) {
				groups[cat] = (groups[cat] || 0) + val;
			} else if (!valueKey) {
				groups[cat] = (groups[cat] || 0) + 1;
			}
		}
	});
	// Sort by value descending, then name alphabetically
	return Object.entries(groups)
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => (b.value === a.value ? String(a.name).localeCompare(String(b.name)) : b.value - a.value));
}

// BAR/LINE: group and sum, or just show frequency if no yKey
function prepareBarGroupedData(data, xKey, yKey) {
	const grouped = {};
	data.forEach((item) => {
		const cat = item[xKey];
		const val = item[yKey];
		if (cat !== undefined && val !== undefined && val !== null) {
			grouped[cat] = (grouped[cat] || 0) + val;
		}
	});
	return Object.entries(grouped).map(([key, value]) => ({
		[xKey]: key,
		[yKey]: value,
	}));
}

function prepareFrequencyData(data, xKey) {
	if (!xKey) return [];
	const freq = {};
	data.forEach((item) => {
		const val = item[xKey];
		if (val !== undefined && val !== null) {
			freq[val] = (freq[val] || 0) + 1;
		}
	});
	return Object.entries(freq).map(([x, count]) => ({
		[xKey]: x,
		frequency: count,
	}));
}

// Sorting helper for X axis (alphanumeric)
function sortDataByX(data, xKey) {
	if (!xKey) return data;
	// Try numeric sort, fallback to alpha
	const allNumeric = data.every((row) => !isNaN(Number(row[xKey])));
	if (allNumeric) {
		return [...data].sort((a, b) => Number(a[xKey]) - Number(b[xKey]));
	}
	return [...data].sort((a, b) => String(a[xKey]).localeCompare(String(b[xKey])));
}

const Widget = ({ widget, data, onUpdate }) => {
	const [editMode, setEditMode] = useState(false);
	const [localConfig, setLocalConfig] = useState(widget);

	const dataKeys = useMemo(
		() =>
			data && data.length > 0
				? Object.keys(data[0]).filter((key) => typeof data[0][key] === 'string' || typeof data[0][key] === 'number')
				: [],
		[data]
	);

	const stringKeys = useMemo(
		() => (data && data.length > 0 ? Object.keys(data[0]).filter((key) => typeof data[0][key] === 'string') : []),
		[data]
	);

	const numericKeys = useMemo(
		() => (data && data.length > 0 ? Object.keys(data[0]).filter((key) => typeof data[0][key] === 'number') : []),
		[data]
	);

	const pieData = useMemo(
		() => (widget.chartType === 'pie' ? preparePieData(data, widget.groupKey, widget.valueKey) : []),
		[data, widget.chartType, widget.groupKey, widget.valueKey]
	);

	const barOrLineData = useMemo(() => {
		let d;
		if ((widget.chartType === 'bar' || widget.chartType === 'line') && widget.xKey) {
			if (!widget.yKey) {
				d = prepareFrequencyData(data, widget.xKey);
			} else if (widget.mergeDuplicates) {
				d = prepareBarGroupedData(data, widget.xKey, widget.yKey);
			} else {
				d = data;
			}
			return sortDataByX(d, widget.xKey);
		}
		return [];
	}, [data, widget.chartType, widget.xKey, widget.yKey, widget.mergeDuplicates]);

	const renderChart = (config) => {
		const { chartType, groupKey, valueKey, xKey, yKey } = config || {};

		switch (chartType) {
			case 'pie': {
				return (
					<ResponsiveContainer width="100%" height={240}>
						<PieChart>
							<Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
								{pieData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
								))}
							</Pie>
							<Tooltip />
							{/* Custom sorted legend */}
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
			case 'bar': {
				return (
					<ResponsiveContainer width="100%" height={240}>
						<BarChart data={barOrLineData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey={xKey} />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey={yKey || 'frequency'} fill={DEFAULT_COLORS[0]} />
						</BarChart>
					</ResponsiveContainer>
				);
			}
			case 'line': {
				const tooManyDots = barOrLineData.length > 20;
				return (
					<ResponsiveContainer width="100%" height={240}>
						<LineChart data={barOrLineData}>
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
						</LineChart>
					</ResponsiveContainer>
				);
			}
			default:
				return <div className="text-center text-sm text-base-content/50 py-12">No chart type selected.</div>;
		}
	};

	const handleSave = () => {
		if (onUpdate) onUpdate(localConfig);
		setEditMode(false);
	};

	return (
		<div className="h-full">
			<div className="bg-base-200 rounded-xl shadow-md h-full flex flex-col relative p-2">
				<div className="flex items-center justify-between mb-2">
					<span className="drag-handle font-bold cursor-move select-none">{widget?.title ?? 'Widget'}</span>
					<button
						className="btn btn-xs btn-ghost"
						onClick={() => {
							setEditMode((v) => !v);
							setLocalConfig(widget);
						}}
						title="Edit Chart"
					>
						<FaEdit />
					</button>
				</div>
				{editMode ? (
					<div className="mb-2 space-y-2">
						<label className="flex flex-col text-sm">
							<span>Chart Title</span>
							<input
								type="text"
								className="input input-sm input-bordered"
								value={localConfig.title}
								onChange={(e) => setLocalConfig({ ...localConfig, title: e.target.value })}
							/>
						</label>
						<label className="flex flex-col text-sm">
							<span>Chart Type</span>
							<select
								className="select select-sm select-bordered"
								value={localConfig.chartType}
								onChange={(e) => setLocalConfig({ ...localConfig, chartType: e.target.value })}
							>
								<option value="pie">Pie</option>
								<option value="bar">Bar</option>
								<option value="line">Line</option>
							</select>
						</label>
						{localConfig.chartType === 'pie' && (
							<>
								<label className="flex flex-col text-sm">
									<span>Group By (Category, e.g. status or phase)</span>
									<select
										className="select select-sm select-bordered"
										value={localConfig.groupKey || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, groupKey: e.target.value })}
									>
										<option value="">--Select--</option>
										{stringKeys.map((key) => (
											<option key={key} value={key}>
												{key}
											</option>
										))}
									</select>
								</label>
								<label className="flex flex-col text-sm">
									<span>Value (Numeric field to sum, optional)</span>
									<select
										className="select select-sm select-bordered"
										value={localConfig.valueKey || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, valueKey: e.target.value })}
									>
										<option value="">(Count Occurrences)</option>
										{numericKeys.map((key) => (
											<option key={key} value={key}>
												{key}
											</option>
										))}
									</select>
									<span className="text-xs mt-1 text-base-content/60">
										If no value is selected, pie slices show frequency counts.
									</span>
								</label>
							</>
						)}
						{(localConfig.chartType === 'bar' || localConfig.chartType === 'line') && (
							<>
								<label className="flex flex-col text-sm">
									<span>X Axis (Category)</span>
									<select
										className="select select-sm select-bordered"
										value={localConfig.xKey || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, xKey: e.target.value })}
									>
										<option value="">--Select--</option>
										{dataKeys.map((key) => (
											<option key={key} value={key}>
												{key}
											</option>
										))}
									</select>
								</label>
								<label className="flex flex-col text-sm">
									<span>Y Axis (Value - Numeric, optional)</span>
									<select
										className="select select-sm select-bordered"
										value={localConfig.yKey || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, yKey: e.target.value })}
									>
										<option value="">(Count Occurrences)</option>
										{numericKeys.map((key) => (
											<option key={key} value={key}>
												{key}
											</option>
										))}
									</select>
									<span className="text-xs mt-1 text-base-content/60">
										If not set, the chart will show the count for each X value.
									</span>
								</label>
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										className="checkbox checkbox-sm"
										checked={!!localConfig.mergeDuplicates}
										onChange={(e) => setLocalConfig({ ...localConfig, mergeDuplicates: e.target.checked })}
									/>
									<span className="text-sm">Merge duplicate X values</span>
								</label>
							</>
						)}
						<div className="flex gap-2 mt-2">
							<button className="btn btn-xs btn-primary" onClick={handleSave} title="Save">
								<FaCheck />
							</button>
							<button className="btn btn-xs btn-ghost" onClick={() => setEditMode(false)} title="Cancel">
								<FaTimes />
							</button>
						</div>
					</div>
				) : widget?.chartType ? (
					renderChart(widget)
				) : (
					<div>No config</div>
				)}
			</div>
		</div>
	);
};

export default React.memo(
	Widget,
	(prevProps, nextProps) =>
		prevProps.widget === nextProps.widget &&
		prevProps.data === nextProps.data &&
		prevProps.onUpdate === nextProps.onUpdate
);
