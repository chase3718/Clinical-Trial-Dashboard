import { useState, useCallback, useMemo } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import SpeedDial from '../components/speedDial';
import Widget from '../components/widget/widget';

const ResponsiveGridLayout = WidthProvider(GridLayout);

const defaultDashboardWidgets = [
	{
		header: 'Clinical Trial Dashboard',
		body: '',
		widgetType: 'text',
		layout: {
			w: 4,
			h: 2,
			x: 0,
			y: 0,
			i: '50c0cc0e-a91b-40ce-ae3b-2af077eeb200',
			moved: false,
			static: false,
		},
		id: '50c0cc0e-a91b-40ce-ae3b-2af077eeb200',
	},
	{
		id: 'acc38eec-b63e-492a-8188-8c8a2dac8ea0',
		title: 'Distribution by Trial Phase',
		widgetType: 'bar',
		layout: {
			w: 4,
			h: 11,
			x: 0,
			y: 2,
			i: 'acc38eec-b63e-492a-8188-8c8a2dac8ea0',
			moved: false,
			static: false,
		},
		groupKey: 'phase',
		valueKey: '',
		xKey: 'phase',
	},
	{
		id: '1c10585d-e78c-4755-89d0-4b0240b85a7f',
		title: 'Status Breakdown',
		widgetType: 'pie',
		layout: {
			w: 4,
			h: 7,
			x: 4,
			y: 0,
			i: '1c10585d-e78c-4755-89d0-4b0240b85a7f',
			moved: false,
			static: false,
		},
		groupKey: 'status',
		valueKey: '',
	},
	{
		id: '69574a7e-f2ce-4a1e-9e1b-00f5209d5ff6',
		title: 'Number of Trials by Start Date',
		widgetType: 'line',
		layout: {
			w: 12,
			h: 8,
			x: 0,
			y: 13,
			i: '69574a7e-f2ce-4a1e-9e1b-00f5209d5ff6',
			moved: false,
			static: false,
		},
		xKey: 'startDate',
		yKey: '',
		mergeDuplicates: true,
	},
	{
		id: '03813e0f-4c2f-4bd4-baeb-142e8355564b',
		title: 'Enrollment Completion by Start Date',
		widgetType: 'bar',
		layout: {
			w: 8,
			h: 6,
			x: 4,
			y: 7,
			i: '03813e0f-4c2f-4bd4-baeb-142e8355564b',
			moved: false,
			static: false,
		},
		xKey: 'startDate',
		yKeys: ['enrollmentTarget', 'currentEnrollment'],
		mergeDuplicates: true,
	},
	{
		id: '26cb7a5c-886d-4172-ad01-15e224a95ce0',
		title: '',
		widgetType: 'text',
		layout: {
			w: 4,
			h: 7,
			x: 8,
			y: 0,
			i: '26cb7a5c-886d-4172-ad01-15e224a95ce0',
			moved: false,
			static: false,
		},
		xKey: '',
		yKey: '',
		header: 'How to use this dashboard',
		body: 'Drag and drop or select a file from the bottom to display some data. Move Charts around by their headers/move icon, and resize them with the tab on the bottom right of each widget. Click the chevron on the top right to modify a widget. Use the dock at the bottom to switch between dashboard and table view.',
	},
];

export default function Dashboard({ data }) {
	const [widgets, setWidgets] = useState(() => defaultDashboardWidgets);
	const layout = useMemo(() => widgets.map((widget) => widget.layout), [widgets]);

	const onLayoutChange = useCallback((newLayout) => {
		setWidgets((prevWidgets) =>
			prevWidgets.map((widget) => {
				const layoutItem = newLayout.find((item) => item.i === widget.id);
				if (layoutItem && JSON.stringify(widget.layout) !== JSON.stringify(layoutItem)) {
					return { ...widget, layout: { ...layoutItem } };
				}
				return widget;
			})
		);
	}, []);

	const addWidget = useCallback((widgetConfig) => {
		const id =
			typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
		const layout = {
			...(widgetConfig.layout || { x: 0, y: 0, w: 3, h: 2 }),
			i: id,
		};
		setWidgets((prevWidgets) => [
			...prevWidgets,
			{
				...widgetConfig,
				id,
				layout,
			},
		]);
	}, []);

	const removeWidget = useCallback((id) => {
		setWidgets((prev) => prev.filter((w) => w.id !== id));
	}, []);

	const handleUpdateWidget = useCallback((id, updatedConfig) => {
		setWidgets((prevWidgets) =>
			prevWidgets.map((widget) => (widget.id === id ? { ...widget, ...updatedConfig } : widget))
		);
	}, []);

	return (
		<div className="w-full h-full max-h-screen flex flex-col relative">
			{/* The scrollable area for the dashboard grid */}
			<div className="flex-1 h-full min-h-screen w-full overflow-y-auto px-2 pb-16">
				<ResponsiveGridLayout
					height="100%"
					className="layout"
					cols={12}
					rowHeight={40}
					isResizable
					autoSize
					layout={layout}
					useCSSTransforms
					compactType="vertical"
					preventCollision={false}
					onLayoutChange={onLayoutChange}
					draggableHandle=".drag-handle"
				>
					{widgets.map((widget) => (
						<div key={widget.id} className="h-full">
							<Widget
								widget={widget}
								data={data}
								onUpdate={(updatedConfig) => handleUpdateWidget(widget.id, updatedConfig)}
								onDelete={removeWidget}
							/>
						</div>
					))}
				</ResponsiveGridLayout>
			</div>
			<SpeedDial addWidget={addWidget} />
			<button
				className="fixed bottom-8 left-8 z-50 flex flex-col items-end space-y-2"
				onClick={() => console.log(widgets)}
			>
				Print Conf
			</button>
		</div>
	);
}
