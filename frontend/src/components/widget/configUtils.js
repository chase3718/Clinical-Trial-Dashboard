// configUtils.js

// Pie, bar, line, area, radar chart data helpers
export function preparePieData(data, groupKey, valueKey) {
	if (!groupKey) return [];
	const groups = {};
	data.forEach((item) => {
		const cat = item[groupKey];
		const val = item[valueKey];
		if (cat !== undefined && cat !== null) {
			if (valueKey && typeof val === 'number' && !isNaN(val)) {
				groups[cat] = (groups[cat] || 0) + val;
			} else if (!valueKey) {
				groups[cat] = (groups[cat] || 0) + 1;
			}
		}
	});
	return Object.entries(groups)
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => (b.value === a.value ? String(a.name).localeCompare(String(b.name)) : b.value - a.value));
}

export function prepareBarGroupedData(data, xKey, yKey) {
	const grouped = {};
	data.forEach((item) => {
		const cat = item[xKey];
		const val = item[yKey];
		if (cat !== undefined && val !== undefined && val !== null) {
			grouped[cat] = (grouped[cat] || 0) + val;
		}
	});
	return Object.entries(grouped).map(([key, value]) => ({
		[xKey]: key,
		[yKey]: value,
	}));
}

export function prepareFrequencyData(data, xKey) {
	if (!xKey) return [];
	const freq = {};
	data.forEach((item) => {
		const val = item[xKey];
		if (val !== undefined && val !== null) {
			freq[val] = (freq[val] || 0) + 1;
		}
	});
	return Object.entries(freq).map(([x, count]) => ({
		[xKey]: x,
		frequency: count,
	}));
}

export function sortDataByX(data, xKey) {
	if (!xKey) return data;
	const allNumeric = data.every((row) => !isNaN(Number(row[xKey])));
	if (allNumeric) {
		return [...data].sort((a, b) => Number(a[xKey]) - Number(b[xKey]));
	}
	return [...data].sort((a, b) => String(a[xKey]).localeCompare(String(b[xKey])));
}

// Is there enough config/data to render a real chart?
export function hasValidConfig(chartType, config, data) {
	if (!data || data.length === 0) return false;
	switch (chartType) {
		case 'pie':
			return !!config.groupKey;
		case 'bar':
		case 'line':
		case 'area':
		case 'radar':
			return !!config.xKey;
		case 'scatter':
			return !!config.xKey && !!config.yKey;
		case 'text':
			return !!config.body;
		default:
			return false;
	}
}
