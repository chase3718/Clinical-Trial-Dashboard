import React, { useState, useMemo } from 'react';
import { FaEdit, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
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

		console.log('type', widgetType);

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
					// Merge/stack data for each selected yKey
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
				console.log('render');
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
		<div className="h-full min-h-[200px]">
			<div className="bg-base-200 rounded-xl shadow-md h-full flex flex-col relative p-2">
				<div className="flex items-center justify-between mb-2">
					<span className="drag-handle font-bold cursor-move select-none">{widget?.title ?? 'Widget'}</span>
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
				</div>
				{editMode ? (
					<div className="mb-2 space-y-2 overflow-y-auto max-h-[400px]">
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
								value={localConfig.widgetType}
								onChange={(e) => setLocalConfig({ ...localConfig, widgetType: e.target.value })}
							>
								<option value="pie">Pie</option>
								<option value="bar">Bar</option>
								<option value="line">Line</option>
								<option value="area">Area</option>
								<option value="scatter">Scatter</option>
								<option value="radar">Radar</option>
								<option value="text">Text</option>
							</select>
						</label>
						{localConfig.widgetType === 'pie' && (
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
						{localConfig.widgetType === 'bar' && (
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
									<span>Y Axis Fields (Stacked Bars)</span>
									<select
										className="select select-sm select-bordered"
										multiple
										value={localConfig.yKeys || []}
										onChange={(e) => {
											const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
											setLocalConfig({ ...localConfig, yKeys: selected });
										}}
										style={{ minHeight: '4rem' }}
									>
										{numericKeys.map((key) => (
											<option key={key} value={key}>
												{key}
											</option>
										))}
									</select>
									<span className="text-xs mt-1 text-base-content/60">
										Select one or more numeric fields to stack. If none selected, chart will show frequency.
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
						{['line', 'area'].includes(localConfig.widgetType) && (
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
						{localConfig.widgetType === 'scatter' && (
							<>
								<label className="flex flex-col text-sm">
									<span>X Axis (Numeric)</span>
									<select
										className="select select-sm select-bordered"
										value={localConfig.xKey || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, xKey: e.target.value })}
									>
										<option value="">--Select--</option>
										{numericKeys.map((key) => (
											<option key={key} value={key}>
												{key}
											</option>
										))}
									</select>
								</label>
								<label className="flex flex-col text-sm">
									<span>Y Axis (Numeric)</span>
									<select
										className="select select-sm select-bordered"
										value={localConfig.yKey || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, yKey: e.target.value })}
									>
										<option value="">--Select--</option>
										{numericKeys.map((key) => (
											<option key={key} value={key}>
												{key}
											</option>
										))}
									</select>
								</label>
							</>
						)}
						{localConfig.widgetType === 'radar' && (
							<>
								<label className="flex flex-col text-sm">
									<span>Category (X Axis, string)</span>
									<select
										className="select select-sm select-bordered"
										value={localConfig.xKey || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, xKey: e.target.value })}
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
									<span>Value (Y Axis, numeric)</span>
									<select
										className="select select-sm select-bordered"
										value={localConfig.yKey || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, yKey: e.target.value })}
									>
										<option value="">--Select--</option>
										{numericKeys.map((key) => (
											<option key={key} value={key}>
												{key}
											</option>
										))}
									</select>
								</label>
							</>
						)}
						{localConfig.widgetType === 'text' && (
							<>
								<label className="flex flex-col text-sm mb-2">
									<span>Header</span>
									<input
										type="text"
										className="input input-sm input-bordered"
										value={localConfig.header || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, header: e.target.value })}
										placeholder="Enter header/title"
									/>
								</label>
								<label className="flex flex-col text-sm">
									<span>Body</span>
									<textarea
										className="textarea textarea-sm textarea-bordered min-h-[60px]"
										value={localConfig.body || ''}
										onChange={(e) => setLocalConfig({ ...localConfig, body: e.target.value })}
										placeholder="Enter text body"
										rows={4}
									/>
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
				) : (
					<div className="flex-1 min-h-0">
						{/* {widget?.widgetType ? renderChart(widget) : <ChartSkeleton />} */}
						{renderChart(widget)}
						{console.log(widget)}
					</div>
				)}
			</div>
		</div>
	);
}
