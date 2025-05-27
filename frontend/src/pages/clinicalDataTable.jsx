import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FaExclamationTriangle, FaFilter } from 'react-icons/fa';
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
};

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

function getUniqueValues(data, key) {
	return [...new Set(data.map((row) => row[key]).filter(Boolean))];
}

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

function dateSortFn(rowA, rowB, columnId) {
	const a = parseDateString(rowA.original[columnId]);
	const b = parseDateString(rowB.original[columnId]);
	if (!a && !b) return 0;
	if (!a) return -1;
	if (!b) return 1;
	return a - b;
}

function EnrollmentStatusMultiSelect({ value = [], setValue }) {
	const statuses = ['No Enrollment', 'On Track', 'At Risk', 'Critical', 'Completed'];
	const toggle = (status) => {
		if (value.includes(status)) {
			setValue(value.filter((v) => v !== status));
		} else {
			setValue([...value, status]);
		}
	};
	const badgeClass = (status) =>
		status === 'No Enrollment'
			? 'badge badge-outline badge-error animate-pulse'
			: status === 'Critical'
			? 'badge badge-error'
			: status === 'At Risk'
			? 'badge badge-warning'
			: status === 'Completed'
			? 'badge badge-success'
			: 'badge badge-info';

	return (
		<div className="flex flex-col gap-1 w-44">
			<label className="text-xs mb-1">Enrollment Status:</label>
			{statuses.map((status) => (
				<label key={status} className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						className="checkbox checkbox-xs"
						checked={value.includes(status)}
						onChange={() => toggle(status)}
					/>
					<span className={badgeClass(status)}>{status}</span>
				</label>
			))}
			<button className="btn btn-xs btn-outline mt-1" onClick={() => setValue([])} type="button">
				Clear
			</button>
		</div>
	);
}

function getEnrollmentStatus(row) {
	const current = Number(row.currentEnrollment);
	const target = Number(row.enrollmentTarget);
	const pct =
		target && !isNaN(target) && Number(target) !== 0
			? Math.min(100, Math.round((Number(current) / Number(target)) * 100))
			: 0;

	const endDate = parseDateString(row.plannedEndDate);
	const now = new Date();
	const monthsToEnd =
		endDate && !isNaN(endDate)
			? (endDate.getFullYear() - now.getFullYear()) * 12 + (endDate.getMonth() - now.getMonth())
			: null;

	if (pct === 0) return 'No Enrollment';
	if (pct >= 100) return 'Completed';
	if (monthsToEnd === null || monthsToEnd > 6) return 'On Track';
	if (monthsToEnd <= 3) return 'Critical';
	if (monthsToEnd <= 6 && pct < 70) return 'At Risk';
	return 'On Track';
}

function enrollmentPercentage(row) {
	const current = Number(row.original.currentEnrollment);
	const target = Number(row.original.enrollmentTarget);
	return target ? current / target : 0;
}

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
					const status = getEnrollmentStatus(row);
					if (Array.isArray(filterValue) && filterValue.length > 0 && !filterValue.includes(status)) {
						columnPass = false;
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

	const columns = useMemo(
		() => [
			{ accessorKey: 'studyId', header: 'Study ID', size: 120, minSize: 80, maxSize: 180 },
			{ accessorKey: 'title', header: 'Title', size: 240, minSize: 120, maxSize: 360 },
			{
				accessorKey: 'phase',
				header: 'Phase',
				size: 120,
				minSize: 80,
				maxSize: 180,
				cell: ({ getValue }) => {
					const value = getValue();
					const badgeClass = phaseStyles[value] || 'badge';
					return <span className={badgeClass}>{value}</span>;
				},
			},
			{
				accessorKey: 'status',
				header: 'Status',
				size: 140,
				minSize: 100,
				maxSize: 180,
				cell: ({ getValue }) => {
					const value = getValue();
					const badgeClass = statusStyles[value] || 'badge';
					return <span className={badgeClass}>{value}</span>;
				},
			},
			{
				accessorKey: 'enrollment',
				header: 'Enrollment',
				size: 220,
				minSize: 160,
				maxSize: 300,
				enableSorting: true,
				enableColumnFilter: true,
				sortingFn: (rowA, rowB) => {
					const a = enrollmentPercentage(rowA);
					const b = enrollmentPercentage(rowB);
					return a === b ? 0 : a > b ? 1 : -1;
				},
				cell: ({ row }) => {
					const current = Number(row.original.currentEnrollment);
					const target = Number(row.original.enrollmentTarget);
					const pct =
						target && !isNaN(target) && Number(target) !== 0
							? Math.min(100, Math.round((Number(current) / Number(target)) * 100))
							: 0;

					const endDate = parseDateString(row.original.plannedEndDate);
					const now = new Date();
					const monthsToEnd =
						endDate && !isNaN(endDate)
							? (endDate.getFullYear() - now.getFullYear()) * 12 + (endDate.getMonth() - now.getMonth())
							: null;

					let status = '';
					let badgeClass = '';
					let badgeIcon = null;
					let badgeTooltip = '';
					let deepRed = false;
					let veryLowDot = null;

					if (pct === 0) {
						status = 'No Enrollment';
						deepRed = true;
						badgeClass = 'badge bg-red-700 text-white font-medium flex items-center gap-1';
						badgeIcon = <FaExclamationTriangle className="text-white" />;
						badgeTooltip = 'No participants enrolled yet!';
					} else if (pct >= 100) {
						status = 'Completed';
						badgeClass = 'badge badge-success';
						badgeTooltip = 'Enrollment complete!';
					} else if (monthsToEnd === null || monthsToEnd > 6) {
						status = 'On Track';
						badgeClass = 'badge badge-info';
						badgeTooltip = 'Enrollment is progressing as expected.';
						if (pct < 10) {
							veryLowDot = (
								<span
									className="indicator-item indicator-end w-2 h-2 rounded-full bg-red-500"
									title="Very low enrollment (<10%)"
									style={{ right: '-4px', top: '-4px', pointerEvents: 'auto' }}
								/>
							);
						}
					} else if (monthsToEnd <= 3) {
						status = 'Critical';
						deepRed = true;
						badgeClass = 'badge bg-red-700 text-white font-medium flex items-center gap-1';
						badgeIcon = <FaExclamationTriangle className="text-white" />;
						badgeTooltip = 'Trial is ending soon and not fully enrolled!';
					} else if (monthsToEnd <= 6 && pct < 70) {
						status = 'At Risk';
						badgeClass = 'badge badge-warning flex items-center gap-1';
						badgeIcon = <FaExclamationTriangle className="text-warning" />;
						badgeTooltip = 'Enrollment is behind schedule!';
					} else {
						status = 'On Track';
						badgeClass = 'badge badge-info';
						badgeTooltip = 'Enrollment is progressing as expected.';
					}

					let barColor = deepRed
						? 'bg-red-700'
						: status === 'At Risk'
						? 'bg-yellow-400'
						: status === 'Completed'
						? 'bg-green-600'
						: 'bg-sky-600';

					return (
						<div className="flex items-center gap-2 w-full">
							{/* Status badge with indicator for "very low" */}
							<div title={badgeTooltip} className="indicator">
								<span className={badgeClass}>
									{badgeIcon}
									{status}
								</span>
								{veryLowDot}
							</div>
							{/* Progress bar and details */}
							<div className="flex-1 flex flex-col min-w-0">
								<div className={`w-full rounded h-3 relative overflow-hidden`}>
									<div
										className={`${barColor} h-3 rounded transition-all duration-300`}
										style={{
											width: pct === 0 ? '100%' : `${pct}%`,
											opacity: pct === 0 ? 0.5 : 1,
										}}
									/>
								</div>
								<div className="text-xs mt-1 flex items-center">
									{current} / {target} ({pct}%)
								</div>
							</div>
						</div>
					);
				},
			},
			{
				accessorKey: 'startDate',
				header: 'Start Date',
				size: 130,
				minSize: 100,
				maxSize: 180,
				sortingFn: (rowA, rowB, columnId) => dateSortFn(rowA, rowB, columnId),
			},
			{
				accessorKey: 'plannedEndDate',
				header: 'Planned End Date',
				size: 150,
				minSize: 100,
				maxSize: 200,
				sortingFn: (rowA, rowB, columnId) => dateSortFn(rowA, rowB, columnId),
			},
		],
		[]
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		columnResizeDirection: 'ltr', // <-- this is important!
		columnResizeMode: 'onChange', // <-- this is important!
		defaultColumn: {
			minSize: 80,
			maxSize: 400,
			size: 150,
			enableResizing: true,
		},
	});

	const parentRef = useRef();
	const rows = table.getRowModel().rows;
	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 56,
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
				<EnrollmentStatusMultiSelect
					value={columnFilters['enrollment'] || []}
					setValue={(val) => {
						setColumnFilters((old) => {
							const updated = { ...old };
							if (!val || val.length === 0) {
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
			<div ref={parentRef} className="overflow-auto grow" style={{ height: '100%', minWidth: 880 }}>
				<table
					className="table table-zebra table-lg w-full table-fixed select-none"
					style={{ tableLayout: 'fixed', minWidth: 880 }}
				>
					<thead>
						<tr>
							{table.getHeaderGroups()[0].headers.map((header) => {
								const key = header.column.id;
								return (
									<th
										key={header.id}
										style={{
											width: header.getSize(),
											minWidth: header.column.columnDef.minSize,
											maxWidth: header.column.columnDef.maxSize,
										// 	position: 'sticky',
										// 	top: 0,
										// 	zIndex: 10,
										// 	background: 'rgba(245,245,245,0.98)',
										}}
										className={`
											bg-base-200 border-b border-base-300 sticky top-0 z-10 shadow font-medium text-sm px-4 py-2 group
											${header.column.getIsSorted() ? 'bg-primary text-base-content' : ''}
										`}
									>
										<div className="flex items-center gap-1 relative">
											<span onClick={header.column.getToggleSortingHandler()} className="cursor-pointer select-none">
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
											</div>
											{header.column.getCanResize() && (
												<div
													onMouseDown={header.getResizeHandler()}
													onTouchStart={header.getResizeHandler()}
													className="absolute top-0 right-0 h-full w-3 cursor-col-resize z-40 bg-transparent group-hover:bg-primary/10 transition"
													style={{
														userSelect: 'none',
														borderRight: '2px solid #93c5fd',
														marginRight: '-1.5px',
														width: 12,
													}}
												/>
											)}
										</div>
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody style={{ position: 'relative' }}>
						{rows.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="text-center py-12 text-base-content/70">
									No data found.
								</td>
							</tr>
						) : (
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
													className="w-full min-h-14 even:bg-base-100 odd:bg-base-200 hover:bg-primary/10 transition-colors group"
													style={{
														position: 'absolute',
														top: 0,
														left: 0,
														transform: `translateY(${virtualRow.start}px)`,
														width: '100%',
														display: 'table',
														tableLayout: 'fixed',
														height: '56px',
													}}
												>
													{row.getVisibleCells().map((cell) => (
														<td
															key={cell.id}
															className="px-4 py-2 truncate group-hover:bg-base-300 transition-colors"
															style={{
																width: cell.column.getSize(),
																minWidth: cell.column.columnDef.minSize,
																maxWidth: cell.column.columnDef.maxSize,
																maxHeight: 60,
															}}
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
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
