import React, { useState, useMemo } from 'react';
import { FaEdit, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import {
	preparePieData,
	prepareBarGroupedData,
	prepareFrequencyData,
	sortDataByX,
	hasValidConfig,
} from './configUtils';
import { PieRenderer, BarRenderer, LineRenderer, AreaRenderer, ScatterRenderer, RadarRenderer } from './renderers';
import ChartSkeleton from './chartSkeleton';

const RENDERERS = {
	pie: PieRenderer,
	bar: BarRenderer,
	line: LineRenderer,
	area: AreaRenderer,
	scatter: ScatterRenderer,
	radar: RadarRenderer,
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
		const chartType = config?.chartType;
		if (!hasValidConfig(chartType, config, data)) {
			return <ChartSkeleton chartType={chartType} />;
		}
		const Renderer = RENDERERS[chartType];
		if (!Renderer) return <ChartSkeleton />;

		switch (chartType) {
			case 'pie':
				return <PieRenderer pieData={preparePieData(data, config.groupKey, config.valueKey)} />;
			case 'bar':
			case 'line':
			case 'area': {
				let chartData;
				if (!config.yKey) {
					chartData = prepareFrequencyData(data, config.xKey);
				} else if (config.mergeDuplicates && chartType !== 'radar') {
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
			default:
				return <ChartSkeleton chartType={chartType} />;
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
								value={localConfig.chartType}
								onChange={(e) => setLocalConfig({ ...localConfig, chartType: e.target.value })}
							>
								<option value="pie">Pie</option>
								<option value="bar">Bar</option>
								<option value="line">Line</option>
								<option value="area">Area</option>
								<option value="scatter">Scatter</option>
								<option value="radar">Radar</option>
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
						{['bar', 'line', 'area'].includes(localConfig.chartType) && (
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
						{localConfig.chartType === 'scatter' && (
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
						{localConfig.chartType === 'radar' && (
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
					<div className="flex-1 min-h-0">{widget?.chartType ? renderChart(widget) : <ChartSkeleton />}</div>
				)}
			</div>
		</div>
	);
}
