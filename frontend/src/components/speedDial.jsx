import { useState } from 'react';
import { FaPlus, FaChartPie, FaChartBar, FaChartLine, FaChartArea, FaDotCircle, FaBullseye } from 'react-icons/fa';

const defaultWidgetConfigs = {
	pie: {
		id: 'New Pie Chart',
		title: 'New Pie Chart',
		chartType: 'pie',
		layout: { x: 0, y: Infinity, w: 3, h: 8 },
		groupKey: '',
		valueKey: '',
	},
	bar: {
		id: 'New Bar Chart',
		title: 'New Bar Chart',
		chartType: 'bar',
		layout: { x: 0, y: Infinity, w: 3, h: 8 },
		xKey: '',
		yKeys: [],
		mergeDuplicates: true,
	},
	line: {
		id: 'New Line Chart',
		title: 'New Line Chart',
		chartType: 'line',
		layout: { x: 0, y: Infinity, w: 3, h: 8 },
		xKey: '',
		yKey: '',
		mergeDuplicates: false,
	},
	area: {
		id: 'New Area Chart',
		title: 'New Area Chart',
		chartType: 'area',
		layout: { x: 0, y: Infinity, w: 3, h: 8 },
		xKey: '',
		yKey: '',
		mergeDuplicates: true,
	},
	scatter: {
		id: 'New Scatter Chart',
		title: 'New Scatter Chart',
		chartType: 'scatter',
		layout: { x: 0, y: Infinity, w: 3, h: 8 },
		xKey: '',
		yKey: '',
	},
	radar: {
		id: 'New Radar Chart',
		title: 'New Radar Chart',
		chartType: 'radar',
		layout: { x: 0, y: Infinity, w: 3, h: 8 },
		xKey: '',
		yKey: '',
	},
};

export default function SpeedDial({ addWidget }) {
	const [open, setOpen] = useState(false);

	const actions = [
		{
			icon: <FaChartPie />,
			name: 'Add Pie Chart',
			onClick: () => addWidget({ ...defaultWidgetConfigs.pie, id: String(Date.now()) }),
		},
		{
			icon: <FaChartBar />,
			name: 'Add Bar Chart',
			onClick: () => addWidget({ ...defaultWidgetConfigs.bar, id: String(Date.now()) }),
		},
		{
			icon: <FaChartLine />,
			name: 'Add Line Chart',
			onClick: () => addWidget({ ...defaultWidgetConfigs.line, id: String(Date.now()) }),
		},
		{
			icon: <FaChartArea />,
			name: 'Add Area Chart',
			onClick: () => addWidget({ ...defaultWidgetConfigs.area, id: String(Date.now()) }),
		},
		{
			icon: <FaDotCircle />,
			name: 'Add Scatter Chart',
			onClick: () => addWidget({ ...defaultWidgetConfigs.scatter, id: String(Date.now()) }),
		},
		{
			icon: <FaBullseye />,
			name: 'Add Radar Chart',
			onClick: () => addWidget({ ...defaultWidgetConfigs.radar, id: String(Date.now()) }),
		},
	];

	return (
		<div className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-2">
			{/* Speed Dial Actions */}
			<div
				className={`flex flex-col items-end space-y-2 transition-all duration-300 ${
					open ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'
				}`}
			>
				{actions.map((action) => (
					<button
						key={action.name}
						onClick={() => {
							action.onClick();
							setOpen(false);
						}}
						className="btn btn-circle btn-sm bg-base-200 shadow-md hover:bg-primary hover:text-white transition"
					>
						<span className="sr-only">{action.name}</span>
						{action.icon}
					</button>
				))}
			</div>
			{/* Main FAB */}
			<button
				className="btn btn-circle btn-primary text-white shadow-lg transition hover:scale-110"
				onClick={() => setOpen((v) => !v)}
				aria-label="Speed dial"
			>
				<FaPlus className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
			</button>
		</div>
	);
}
