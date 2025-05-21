import { useState, useCallback, useMemo } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
import SpeedDial from '../components/speedDial';
import Widget from '../components/widget/widget';

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function Dashboard({ data }) {
	const [widgets, setWidgets] = useState([]);
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
			<div className="flex-1 min-h-0 w-full overflow-y-auto px-2 pb-16">
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
		</div>
	);
}
