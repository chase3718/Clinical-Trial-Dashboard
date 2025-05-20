import React, { memo, useState } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import DashboardChart from '../components/dashboardChart'; // <-- import the new component
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
const MemoDashboardChart = memo(DashboardChart);
// Your widgets config, now supporting all types!
const widgetsConfig = [
	{
		id: 'enrollmentProgress',
		title: 'Enrollment Progress by Study',
		chartType: 'bar',
		layout: { x: 0, y: 0, w: 6, h: 8 },
		dataKeys: [
			{ key: 'currentEnrollment', name: 'Current Enrollment' },
			{ key: 'enrollmentTarget', name: 'Target Enrollment' },
		],
		xAxisKey: 'studyId',
	},
	{
		id: 'statusCountBar',
		title: 'Trials by Status (Bar)',
		chartType: 'bar',
		layout: { x: 6, y: 0, w: 6, h: 8 },
		groupBy: 'status',
		barLabel: 'Trials',
	},
	{
		id: 'statusCountPie',
		title: 'Trials by Status (Pie)',
		chartType: 'pie',
		layout: { x: 0, y: 8, w: 6, h: 8 },
		groupBy: 'status',
	},
	{
		id: 'enrollmentLine',
		title: 'Enrollment Target vs Current (Line)',
		chartType: 'line',
		layout: { x: 6, y: 8, w: 6, h: 8 },
		dataKeys: [
			{ key: 'currentEnrollment', name: 'Current Enrollment' },
			{ key: 'enrollmentTarget', name: 'Target Enrollment' },
		],
		xAxisKey: 'studyId',
	},
	// Add more widgets as needed!
];

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function Dashboard({ data }) {
	const defaultLayout = widgetsConfig.map((w) => ({
		i: w.id,
		...w.layout,
	}));

	const [layout, setLayout] = useState(() => {
		const saved = localStorage.getItem('dashboard-layout');
		return saved ? JSON.parse(saved) : defaultLayout;
	});

	const handleLayoutChange = (newLayout) => {
		setLayout(newLayout);
		localStorage.setItem('dashboard-layout', JSON.stringify(newLayout));
	};

	return (
		<div className="w-full h-[90vh] min-h-0">
			<ResponsiveGridLayout
				className="layout"
				layout={layout}
				cols={12}
				rowHeight={40}
				onLayoutChange={handleLayoutChange}
				draggableHandle=".chart-drag-handle"
				isResizable={true}
				autoSize={true}
				useCSSTransforms={true}
				compactType="vertical"
				preventCollision={false}
			>
				{widgetsConfig.map((widget) => (
					<div key={widget.id}>
						<div className="chart-drag-handle cursor-move h-full">
							<div className="bg-base-200 rounded-xl shadow-md p-2 h-full flex flex-col">
								<h3 className="font-bold mb-2">{widget.title}</h3>
								<div className="flex-1 min-h-0">
									<MemoDashboardChart widget={widget} data={data} />
								</div>
							</div>
						</div>
					</div>
				))}
			</ResponsiveGridLayout>
		</div>
	);
}
