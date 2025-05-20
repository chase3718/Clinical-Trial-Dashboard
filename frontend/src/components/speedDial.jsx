import { useState } from 'react';
import { FaPlus, FaChartPie, FaChartBar, FaChartLine } from 'react-icons/fa';

const defaultWidgetConfigs = {
	pie: {
		id: 'New Pie Chart',
		title: 'New Pie Chart',
		chartType: 'pie',
		layout: { x: 0, y: Infinity, w: 6, h: 8 },
		groupKey: 'status',
		valueKey: '', // For count-based by default
	},
	bar: {
		id: 'New Bar Chart',
		title: 'New Bar Chart',
		chartType: 'bar',
		layout: { x: 0, y: Infinity, w: 6, h: 8 },
		xKey: 'phase',
		yKey: 'enrollmentTarget',
		mergeDuplicates: true,
	},
	line: {
		id: 'New Line Chart',
		title: 'New Line Chart',
		chartType: 'line',
		layout: { x: 0, y: Infinity, w: 6, h: 8 },
		xKey: 'startDate', // Use a field from your data (e.g., date string or similar)
		yKey: 'currentEnrollment', // Use a numeric field from your data
		mergeDuplicates: false,
	},
};

export default function SpeedDial({ addWidget }) {
	const [open, setOpen] = useState(false);

	const actions = [
		{
			icon: <FaChartPie />,
			name: 'Add Pie Chart',
			onClick: () => addWidget(defaultWidgetConfigs.pie),
		},
		{
			icon: <FaChartBar />,
			name: 'Add Bar Chart',
			onClick: () => addWidget(defaultWidgetConfigs.bar),
		},
		{
			icon: <FaChartLine />,
			name: 'Add Line Chart',
			onClick: () => addWidget(defaultWidgetConfigs.line),
		},
	];

	return (
		<div className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-2">
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
