import { useState } from 'react';
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from 'recharts';
import { FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

const DEFAULT_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#fa8072'];

function preparePieData(data, dataKey) {
	const counts = {};
	data.forEach((item) => {
		const key = item[dataKey];
		if (key !== undefined && key !== null) {
			counts[key] = (counts[key] || 0) + 1;
		}
	});
	return Object.entries(counts).map(([key, value]) => ({
		name: key,
		value,
	}));
}

export default function Widget({ widget, data, onUpdate }) {
	const [editMode, setEditMode] = useState(false);
	const [localConfig, setLocalConfig] = useState(widget);

	// For demo: get all string fields as possible data keys
	const dataKeys =
		data && data.length > 0
			? Object.keys(data[0]).filter((key) => typeof data[0][key] === 'string' || typeof data[0][key] === 'number')
			: [];

	const handleSave = () => {
		if (onUpdate) onUpdate(localConfig);
		setEditMode(false);
	};

	const renderChart = (config) => {
		const { chartType, dataKey } = config || {};

		switch (chartType) {
			case 'pie': {
				const pieData = preparePieData(data, dataKey);
				return (
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
								{pieData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
								))}
							</Pie>
							<Tooltip />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				);
			}
			default:
				return <div className="text-center text-sm text-base-content/50 py-12">No chart type selected.</div>;
		}
	};

	return (
		<div className="chart-drag-handle cursor-move h-full">
			<div className="bg-base-200 rounded-xl shadow-md h-full flex flex-col relative p-2">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-bold">{widget?.title ?? 'Widget'}</h3>
					<button
						className="btn btn-xs btn-ghost"
						onClick={() => {
							setEditMode((v) => !v);
							setLocalConfig(widget); // Reset local config to widget's state when opening
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
								{/* Add more types here */}
							</select>
						</label>
						{localConfig.chartType === 'pie' && (
							<label className="flex flex-col text-sm">
								<span>Group By (Data Key)</span>
								<select
									className="select select-sm select-bordered"
									value={localConfig.dataKey}
									onChange={(e) => setLocalConfig({ ...localConfig, dataKey: e.target.value })}
								>
									{dataKeys.map((key) => (
										<option key={key} value={key}>
											{key}
										</option>
									))}
								</select>
							</label>
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
}
