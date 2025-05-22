import React, { useState, useMemo } from 'react';
import { FaEdit, FaTrash, FaArrowsAlt, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import {
	preparePieData,
	prepareBarGroupedData,
	prepareFrequencyData,
	sortDataByX,
	hasValidConfig,
} from './configUtils';
import {
	AreaRenderer,
	BarRenderer,
	LineRenderer,
	PieRenderer,
	RadarRenderer,
	ScatterRenderer,
	TextRenderer,
} from './renderers';
import ChartSkeleton from './chartSkeleton';
import WidgetConfigEditor from './widgetConfigEditor';

const RENDERERS = {
	pie: PieRenderer,
	bar: BarRenderer,
	line: LineRenderer,
	area: AreaRenderer,
	scatter: ScatterRenderer,
	radar: RadarRenderer,
	text: TextRenderer,
};

export default function Widget({ widget, data, onUpdate, onDelete }) {
	const [editMode, setEditMode] = useState(false);
	const [localConfig, setLocalConfig] = useState(widget);
	const [showHeader, setShowHeader] = useState(false);

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

	const renderChart = (config) => {
		const widgetType = config?.widgetType;
		if (!hasValidConfig(widgetType, config, data)) {
			return <ChartSkeleton widgetType={widgetType} />;
		}
		const Renderer = RENDERERS[widgetType];
		if (!Renderer) return <ChartSkeleton />;

		switch (widgetType) {
			case 'pie':
				return <PieRenderer pieData={preparePieData(data, config.groupKey, config.valueKey)} />;
			case 'bar': {
				let chartData;
				let yKeys =
					Array.isArray(config.yKeys) && config.yKeys.length > 0 ? config.yKeys : config.yKey ? [config.yKey] : [];

				if (yKeys.length === 0) {
					chartData = prepareFrequencyData(data, config.xKey);
					yKeys = ['frequency'];
				} else if (config.mergeDuplicates) {
					chartData = [];
					const groups = {};
					data.forEach((item) => {
						const xVal = item[config.xKey];
						if (!groups[xVal]) groups[xVal] = { [config.xKey]: xVal };
						yKeys.forEach((yKey) => {
							groups[xVal][yKey] = (groups[xVal][yKey] || 0) + (item[yKey] || 0);
						});
					});
					chartData = Object.values(groups);
				} else {
					chartData = data;
				}
				chartData = sortDataByX(chartData, config.xKey);
				return <BarRenderer chartData={chartData} xKey={config.xKey} yKeys={yKeys} />;
			}
			case 'line':
			case 'area': {
				let chartData;
				if (!config.yKey) {
					chartData = prepareFrequencyData(data, config.xKey);
				} else if (config.mergeDuplicates && widgetType !== 'radar') {
					chartData = prepareBarGroupedData(data, config.xKey, config.yKey);
				} else {
					chartData = data;
				}
				chartData = sortDataByX(chartData, config.xKey);
				return <Renderer chartData={chartData} xKey={config.xKey} yKey={config.yKey} />;
			}
			case 'scatter':
				return <ScatterRenderer data={data} xKey={config.xKey} yKey={config.yKey} />;
			case 'radar': {
				const radarData = prepareBarGroupedData(data, config.xKey, config.yKey);
				return <RadarRenderer radarData={radarData} xKey={config.xKey} yKey={config.yKey} />;
			}
			case 'text': {
				return <TextRenderer header={config.header} body={config.body} />;
			}
			default:
				return <ChartSkeleton widgetType={widgetType} />;
		}
	};

	const handleSave = () => {
		if (onUpdate) onUpdate(localConfig);
		setEditMode(false);
	};

	return (
		<div className="h-full min-h-fit w-full">
			<div className="bg-base-200 rounded-xl shadow-md h-full flex flex-col relative p-2">
				{/* TOGGLE BUTTON */}
				<button
					className="btn btn-xs btn-ghost absolute right-2 top-2 z-10"
					onClick={() => setShowHeader((s) => !s)}
					title={showHeader ? 'Hide header' : 'Show header'}
					style={{ padding: 0 }}
				>
					{showHeader ? <FaChevronUp /> : <FaChevronDown />}
				</button>

				{/* HEADER (toggleable) */}

				<div className="flex items-center justify-between mb-2 mr-4">
					{/* {showHeader && <FaArrowsAlt className="drag-handle font-bold cursor-move select-none" />} */}
					<span className="drag-handle cursor-move font-bold select-none">
						{widget.title ? widget.title : <FaArrowsAlt />}
					</span>
					{showHeader && (
						<div className="flex gap-1">
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
							<button
								className="btn btn-xs btn-ghost"
								onClick={() => onDelete && onDelete(widget.id)}
								title="Delete Widget"
							>
								<FaTrash />
							</button>
						</div>
					)}
				</div>

				{/* BODY */}
				{editMode ? (
					<WidgetConfigEditor
						localConfig={localConfig}
						setLocalConfig={setLocalConfig}
						dataKeys={dataKeys}
						stringKeys={stringKeys}
						numericKeys={numericKeys}
						handleSave={handleSave}
						onCancel={() => setEditMode(false)}
					/>
				) : (
					<div className="flex-1 min-h-0">{renderChart(widget)}</div>
				)}
			</div>
		</div>
	);
}
