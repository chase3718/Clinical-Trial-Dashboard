import React from 'react';

export default function WidgetConfigEditor({
	localConfig,
	setLocalConfig,
	dataKeys,
	stringKeys,
	numericKeys,
	handleSave,
	onCancel,
}) {
	return (
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
					onChange={(e) =>
						setLocalConfig({
							...localConfig,
							widgetType: e.target.value,
						})
					}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									groupKey: e.target.value,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									valueKey: e.target.value,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									xKey: e.target.value,
								})
							}
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
								setLocalConfig({
									...localConfig,
									yKeys: selected,
								});
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									mergeDuplicates: e.target.checked,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									xKey: e.target.value,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									yKey: e.target.value,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									mergeDuplicates: e.target.checked,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									xKey: e.target.value,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									yKey: e.target.value,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									xKey: e.target.value,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									yKey: e.target.value,
								})
							}
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
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									header: e.target.value,
								})
							}
							placeholder="Enter header/title"
						/>
					</label>
					<label className="flex flex-col text-sm">
						<span>Body</span>
						<textarea
							className="textarea textarea-sm textarea-bordered min-h-[60px]"
							value={localConfig.body || ''}
							onChange={(e) =>
								setLocalConfig({
									...localConfig,
									body: e.target.value,
								})
							}
							placeholder="Enter text body"
							rows={4}
						/>
					</label>
				</>
			)}

			<div className="flex gap-2 mt-2">
				<button className="btn btn-xs btn-primary" onClick={handleSave} title="Save">
					Save
				</button>
				<button className="btn btn-xs btn-ghost" onClick={onCancel} title="Cancel">
					Cancel
				</button>
			</div>
		</div>
	);
}
