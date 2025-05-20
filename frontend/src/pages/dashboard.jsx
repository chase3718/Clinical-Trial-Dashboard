import { useState } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import SpeedDial from '../components/speedDial';
import Widget from '../components/widget';

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function Dashboard({ data }) {
	const [widgets, setWidgets] = useState([]);
	// Derive layout from widgets
	const layout = widgets.map((widget) => widget.layout);

	// Called by react-grid-layout on drag/resize/position change
	const onLayoutChange = (newLayout) => {
		// Map layout positions back to widgets by id
		setWidgets((prevWidgets) =>
			prevWidgets.map((widget) => {
				const layoutItem = newLayout.find((item) => item.i === widget.id);
				return layoutItem ? { ...widget, layout: { ...layoutItem } } : widget;
			})
		);
	};

	const addWidget = (widgetConfig) => {
		const id = String(Date.now());
		const layout = {
			...(widgetConfig.layout || { x: 0, y: 0, w: 3, h: 2 }),
			i: id,
		};
		setWidgets([
			...widgets,
			{
				...widgetConfig,
				id,
				layout,
			},
		]);
	};

	return (
		<div className="w-full h-full">
			<ResponsiveGridLayout
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
			>
				{widgets.map((widget) => (
					<div key={widget.id}>
						<Widget widget={widget} data={data} />
					</div>
				))}
			</ResponsiveGridLayout>
			<SpeedDial addWidget={addWidget} />
		</div>
	);
}
