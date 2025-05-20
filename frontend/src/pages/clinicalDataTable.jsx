import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FaFilter } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const statusStyles = {
	Completed: 'badge badge-success',
	'Not yet recruiting': 'badge badge-warning',
	Recruiting: 'badge badge-info',
};
const phaseStyles = {
	'Phase 1': 'badge badge-info',
	'Phase 2': 'badge badge-primary',
	'Phase 3': 'badge badge-success',
	'Phase 4': 'badge badge-accent',
	// Add or adjust as needed
};
// --- Click outside hook ---
function useClickOutside(ref, handler) {
	useEffect(() => {
		const listener = (event) => {
			if (!ref.current || ref.current.contains(event.target)) return;
			handler(event);
		};
		document.addEventListener('mousedown', listener);
		document.addEventListener('touchstart', listener);
		return () => {
			document.removeEventListener('mousedown', listener);
			document.removeEventListener('touchstart', listener);
		};
	}, [ref, handler]);
}

// --- Utility: Auto column widths ---
function getAutoColumnWidths(data, minWidth = 80, maxWidth = 300) {
	if (!data || !data.length) return {};
	const widths = {};
	const sample = data.slice(0, 50);
	Object.keys(data[0]).forEach((col) => {
		let maxLen = (col + '').length;
		sample.forEach((row) => {
			const val = row[col];
			if (val !== undefined && val !== null) {
				maxLen = Math.max(maxLen, (val + '').length);
			}
		});
		widths[col] = Math.min(maxWidth, Math.max(minWidth, maxLen * 10));
	});
	return widths;
}

// --- Utility: Unique values for column ---
function getUniqueValues(data, key) {
	return [...new Set(data.map((row) => row[key]).filter(Boolean))];
}

// --- Multiselect filter dropdown for phase/status ---
function MultiSelectDropdown({ options, value, setValue, stylesMap }) {
	const toggle = (val) => {
		if (value.includes(val)) {
			setValue(value.filter((v) => v !== val));
		} else {
			setValue([...value, val]);
		}
	};
	return (
		<div className="flex flex-col gap-1 w-40">
			{options.length === 0 ? (
				<div className="text-xs opacity-60 px-2 py-4">No options</div>
			) : (
				options.map((val) => (
					<label key={val} className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							className="checkbox checkbox-xs"
							checked={value.includes(val)}
							onChange={() => toggle(val)}
						/>
						<span className={stylesMap?.[val] || 'badge'}>{val}</span>
					</label>
				))
			)}
			<button className="btn btn-xs btn-outline mt-1" onClick={() => setValue([])} type="button">
				Clear
			</button>
		</div>
	);
}

// --- Text search filter for other columns ---
function TextSearchDropdown({ value, setValue }) {
	return (
		<input
			type="text"
			className="input input-sm input-bordered w-full"
			autoFocus
			value={value || ''}
			onChange={(e) => setValue(e.target.value)}
			placeholder="Search…"
		/>
	);
}

// --- Date Range Picker filter ---
function DateRangeDropdown({ value, setValue }) {
	const [start, end] = value || [null, null];
	return (
		<div className="flex flex-col gap-1 w-52">
			<label className="text-xs mb-1">From:</label>
			<DatePicker
				selected={start}
				onChange={(date) => setValue([date, end])}
				selectsStart
				startDate={start}
				endDate={end}
				className="input input-sm input-bordered w-full"
				placeholderText="Start date"
				isClearable
			/>
			<label className="text-xs mt-2 mb-1">To:</label>
			<DatePicker
				selected={end}
				onChange={(date) => setValue([start, date])}
				selectsEnd
				startDate={start}
				endDate={end}
				className="input input-sm input-bordered w-full"
				placeholderText="End date"
				isClearable
			/>
			<button className="btn btn-xs btn-outline mt-2" onClick={() => setValue([null, null])} type="button">
				Clear
			</button>
		</div>
	);
}

// --- Utility: Parse date string to Date object (handles MM/DD/YYYY or YYYY-MM-DD) ---
function parseDateString(str) {
	if (!str) return null;
	const parts = str.split('/');
	if (parts.length === 3) {
		const [mm, dd, yyyy] = parts;
		return new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
	}
	const d = new Date(str);
	return isNaN(d) ? null : d;
}
function EnrollmentSliderFilter({ value, setValue }) {
	return (
		<div className="flex flex-col gap-1 w-44">
			<label className="text-xs">Min % Enrolled:</label>
			<input
				type="range"
				min={0}
				max={100}
				step={1}
				value={value ?? 0}
				onChange={(e) => setValue(Number(e.target.value))}
				className="range range-primary"
			/>
			<div className="flex justify-between text-xs mt-1">
				<span>0%</span>
				<span>{value ?? 0}%</span>
				<span>100%</span>
			</div>
			<button className="btn btn-xs btn-outline mt-2" onClick={() => setValue(undefined)} type="button">
				Clear
			</button>
		</div>
	);
}

function enrollmentPercentage(row) {
	const current = Number(row.original.currentEnrollment);
	const target = Number(row.original.enrollmentTarget);
	return target ? current / target : 0;
}
function EnrollmentFilterDropdown({ value, setValue }) {
	// value is a number (min percent), e.g. 0.5 for 50%
	return (
		<div className="flex flex-col gap-1 w-40">
			<label className="text-xs">Min % Enrolled:</label>
			<input
				type="number"
				min={0}
				max={100}
				className="input input-sm input-bordered"
				value={value ?? ''}
				onChange={(e) => setValue(e.target.value ? Number(e.target.value) : undefined)}
				placeholder="e.g. 75"
			/>
			<button className="btn btn-xs btn-outline mt-1" onClick={() => setValue(undefined)} type="button">
				Clear
			</button>
		</div>
	);
}

// --- Main Table Component ---
export default function ClinicalDataTable({ data }) {
	const [phaseFilter, setPhaseFilter] = useState([]);
	const [statusFilter, setStatusFilter] = useState([]);
	const [columnFilters, setColumnFilters] = useState({});
	const [dateFilters, setDateFilters] = useState({
		startDate: [null, null],
		plannedEndDate: [null, null],
	});
	const [sorting, setSorting] = useState([]);
	const [openFilterFor, setOpenFilterFor] = useState(null);
	const [dropdownAlignment, setDropdownAlignment] = useState({});
	const buttonRefs = useRef({});
	const dropdownRefs = useRef({});

	const phaseOptions = useMemo(() => getUniqueValues(data, 'phase'), [data]);
	const statusOptions = useMemo(() => getUniqueValues(data, 'status'), [data]);

	const filteredData = useMemo(() => {
		return data.filter((row) => {
			const phasePass = phaseFilter.length === 0 || phaseFilter.includes(row.phase);
			const statusPass = statusFilter.length === 0 || statusFilter.includes(row.status);
			let columnPass = true;
			Object.entries(columnFilters).forEach(([key, filterValue]) => {
				if (key === 'enrollment') {
					// Special case for enrollment: filterValue is a number (min percent)
					const current = Number(row.currentEnrollment);
					const target = Number(row.enrollmentTarget);
					const pct = target ? (current / target) * 100 : 0;
					if (typeof filterValue === 'number' && !isNaN(filterValue)) {
						columnPass = columnPass && pct >= filterValue;
					}
				} else if (filterValue && row[key] !== undefined && row[key] !== null) {
					columnPass = columnPass && row[key].toString().toLowerCase().includes(filterValue.toString().toLowerCase());
				}
			});
			let startDatePass = true;
			let plannedEndDatePass = true;
			const [startFrom, startTo] = dateFilters.startDate || [null, null];
			const [endFrom, endTo] = dateFilters.plannedEndDate || [null, null];
			const rowStart = parseDateString(row.startDate);
			const rowEnd = parseDateString(row.plannedEndDate);

			if (startFrom && rowStart && rowStart < startFrom) startDatePass = false;
			if (startTo && rowStart && rowStart > startTo) startDatePass = false;

			if (endFrom && rowEnd && rowEnd < endFrom) plannedEndDatePass = false;
			if (endTo && rowEnd && rowEnd > endTo) plannedEndDatePass = false;

			return phasePass && statusPass && columnPass && startDatePass && plannedEndDatePass;
		});
	}, [data, phaseFilter, statusFilter, columnFilters, dateFilters]);

	const autoWidths = useMemo(() => getAutoColumnWidths(data), [data]);
	const columns = useMemo(
		() => [
			{ accessorKey: 'studyId', header: 'Study ID', size: autoWidths['studyId'] },
			{ accessorKey: 'title', header: 'Title', size: autoWidths['title'] },
			{
				accessorKey: 'phase',
				header: 'Phase',
				size: autoWidths['phase'],
				cell: ({ getValue }) => {
					const value = getValue();
					const badgeClass = phaseStyles[value] || 'badge';
					return <span className={badgeClass}>{value}</span>;
				},
			},
			{
				accessorKey: 'status',
				header: 'Status',
				size: autoWidths['status'],
				cell: ({ getValue }) => {
					const value = getValue();
					const badgeClass = statusStyles[value] || 'badge';
					return <span className={badgeClass}>{value}</span>;
				},
			},
			{
				accessorKey: 'enrollment',
				header: 'Enrollment',
				size: Math.max(autoWidths['enrollmentTarget'] || 100, autoWidths['currentEnrollment'] || 100),
				enableSorting: true,
				enableColumnFilter: true,
				sortingFn: (rowA, rowB) => {
					const a = enrollmentPercentage(rowA);
					const b = enrollmentPercentage(rowB);
					return a === b ? 0 : a > b ? 1 : -1;
				},
				filterFn: (row, _columnId, filterValue) => {
					// filterValue is a number, minimum percentage (0-100)
					const current = Number(row.original.currentEnrollment);
					const target = Number(row.original.enrollmentTarget);
					const pct = target ? (current / target) * 100 : 0;
					if (typeof filterValue !== 'number' || isNaN(filterValue)) return true;
					return pct >= filterValue;
				},
				cell: ({ row }) => {
					const current = row.original.currentEnrollment;
					const target = row.original.enrollmentTarget;
					const pct =
						target && !isNaN(target) && Number(target) !== 0
							? Math.min(100, Math.round((Number(current) / Number(target)) * 100))
							: 0;
					return (
						<div className="flex flex-col items-start w-full">
							<div className="w-full bg-base-200 rounded h-3 relative overflow-hidden">
								<div className="bg-primary h-3 rounded transition-all duration-300" style={{ width: `${pct}%` }} />
							</div>
							<div className="text-xs mt-1">
								{current} / {target} ({pct}%)
							</div>
						</div>
					);
				},
			},
			{ accessorKey: 'startDate', header: 'Start Date', size: autoWidths['startDate'] },
			{ accessorKey: 'plannedEndDate', header: 'Planned End Date', size: autoWidths['plannedEndDate'] },
		],
		[autoWidths]
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		columnResizeDirection: 'ltr',
		enableColumnResizing: true,
		columnResizeMode: 'onChange', // live resizing
		defaultColumn: {
			minSize: 80,
			maxSize: 300,
			size: 150, // or whatever default you want
			enableResizing: true, // this enables resizing by default for all
		},
	});

	const parentRef = useRef();
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 56, // or 48, 60, etc. Try 56px or 60px if your content is taller
		overscan: 8,
	});

	useClickOutside({ current: openFilterFor ? dropdownRefs.current[openFilterFor] : null }, () =>
		setOpenFilterFor(null)
	);

	const renderHeaderFilter = (header) => {
		const key = header.column.id;
		if (key === 'phase') {
			return (
				<MultiSelectDropdown
					options={phaseOptions}
					value={phaseFilter}
					setValue={setPhaseFilter}
					stylesMap={phaseStyles}
				/>
			);
		}
		if (key === 'status') {
			return (
				<MultiSelectDropdown
					options={statusOptions}
					value={statusFilter}
					setValue={setStatusFilter}
					stylesMap={statusStyles}
				/>
			);
		}
		if (key === 'startDate' || key === 'plannedEndDate') {
			return (
				<DateRangeDropdown value={dateFilters[key]} setValue={(val) => setDateFilters((f) => ({ ...f, [key]: val }))} />
			);
		}
		if (key === 'enrollment') {
			return (
				<EnrollmentSliderFilter
					value={columnFilters['enrollment']}
					setValue={(val) => {
						setColumnFilters((old) => {
							const updated = { ...old };
							if (val === undefined) {
								delete updated['enrollment'];
							} else {
								updated['enrollment'] = val;
							}
							return updated;
						});
					}}
				/>
			);
		}
		return (
			<TextSearchDropdown
				value={columnFilters[key] || ''}
				setValue={(val) => setColumnFilters((f) => ({ ...f, [key]: val }))}
			/>
		);
	};

	return (
		<div className="w-full h-full flex flex-col overflow-hidden rounded-2xl shadow bg-base-100">
			<div ref={parentRef} className="overflow-auto grow" style={{ height: '100%' }}>
				<table className="table table-zebra w-full table-fixed select-none" style={{ tableLayout: 'fixed' }}>
					<thead className="z-10">
						<tr>
							{table.getHeaderGroups()[0].headers.map((header) => {
								const key = header.column.id;
								return (
									<th
										key={header.id}
										style={{
											width: header.getSize(),
											minWidth: 80,
											maxWidth: 300,
											position: 'sticky',
											top: 0,
											zIndex: 10,
											background: 'rgba(245,245,245,0.98)', // fallback for custom themes
											// Or try: background: '#e5e7eb', (which is Tailwind bg-gray-200)
										}}
										className="bg-base-200 border-b border-base-300 select-none sticky top-0 z-10 shadow-sm"
									>
										<div className="flex items-center gap-1">
											<span onClick={header.column.getToggleSortingHandler()} className="cursor-pointer">
												{flexRender(header.column.columnDef.header, header.getContext())}
												{header.column.getIsSorted() === 'asc'
													? '↑'
													: header.column.getIsSorted() === 'desc'
													? '↓'
													: ''}
											</span>
											<div className="flex items-center gap-1 h-full w-full">
												<button
													ref={(el) => (buttonRefs.current[header.id] = el)}
													className="ml-1 btn btn-xs btn-ghost"
													tabIndex={-1}
													onClick={(e) => {
														e.stopPropagation();
														setOpenFilterFor(openFilterFor === header.id ? null : header.id);
														if (buttonRefs.current[header.id]) {
															const rect = buttonRefs.current[header.id].getBoundingClientRect();
															const dropdownWidth = key === 'startDate' || key === 'plannedEndDate' ? 220 : 180;
															const tableRight = window.innerWidth;
															const willOverflow = rect.left + dropdownWidth > tableRight - 16;
															setDropdownAlignment((a) => ({
																...a,
																[header.id]: willOverflow ? 'right' : 'left',
															}));
														}
													}}
												>
													<FaFilter size={12} />
												</button>

												{openFilterFor === header.id && (
													<div
														ref={(el) => (dropdownRefs.current[header.id] = el)}
														className={`
															absolute z-50 card card-compact bg-base-200 p-2 shadow-md
															${dropdownAlignment[header.id] === 'right' ? 'right-0 left-auto' : 'left-0'}
														`}
														style={{ minWidth: key === 'startDate' || key === 'plannedEndDate' ? 220 : 180, top: 49 }}
													>
														{renderHeaderFilter(header)}
													</div>
												)}
												{header.column.getCanResize() && (
													<div
														onMouseDown={header.getResizeHandler()}
														onTouchStart={header.getResizeHandler()}
														className="absolute top-0 right-0 h-full w-2 cursor-col-resize z-20 select-none"
														style={{ userSelect: 'none' }}
													/>
												)}
											</div>
										</div>
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody style={{ position: 'relative' }}>
						<tr style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
							<td style={{ padding: 0, border: 'none' }} colSpan={columns.length}>
								<div
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
									}}
								>
									{rowVirtualizer.getVirtualItems().map((virtualRow) => {
										const row = rows[virtualRow.index];
										return (
											<tr
												key={row.id}
												className="w-full min-h-14" // min-h-14 = 56px
												style={{
													position: 'absolute',
													top: 0,
													left: 0,
													transform: `translateY(${virtualRow.start}px)`,
													width: '100%',
													display: 'table',
													tableLayout: 'fixed',
													height: '56px', // also explicitly set height
												}}
											>
												{row.getVisibleCells().map((cell) => (
													<td
														key={cell.id}
														style={{
															width: cell.column.getSize(),
															minWidth: 80,
															maxWidth: 300,
														}}
														className="truncate"
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</td>
												))}
											</tr>
										);
									})}
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
