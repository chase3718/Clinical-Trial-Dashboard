import { useCallback, useMemo, useRef } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

export default function DataTable({ data }) {
	const parentRef = useRef(null);

	const columns = useMemo(() => {
		if (!data?.length) return [];
		return Object.keys(data[0]).map((key) => ({
			header: key.charAt(0).toUpperCase() + key.slice(1),
			accessorKey: key,
			cell: (info) =>
				key === 'title' ? <span className="block max-w-xs truncate">{info.getValue()}</span> : info.getValue(),
		}));
	}, [data]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const rows = table.getRowModel().rows;

	const rowHeight = 40;
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: useCallback(() => rowHeight, []),
		overscan: 8,
	});

	if (!data?.length) {
		return <div className="flex items-center justify-center h-32 text-gray-400">No data available.</div>;
	}

	const virtualRows = virtualizer.getVirtualItems();
	const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
	const paddingBottom =
		virtualRows.length > 0 ? virtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1].end || 0) : 0;

	return (
		<div
			ref={parentRef}
			className="relative h-full w-full overflow-auto rounded-xl border border-base-200 bg-base-100 shadow"
			role="region"
			aria-label="Data Table"
		>
			<table className="table table-auto table-zebra min-w-max">
				<thead className="sticky top-0 z-10 bg-base-200">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id} className="px-4 py-2 text-left font-semibold text-base-content">
									{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{paddingTop > 0 && (
						<tr>
							<td style={{ height: `${paddingTop}px` }} colSpan={columns.length} />
						</tr>
					)}
					{virtualRows.map((virtualRow) => {
						const row = rows[virtualRow.index];
						return (
							<tr key={row.id} style={{ height: `${virtualRow.size}px` }}>
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className={cell.column.id === 'title' ? 'px-4 py-2 max-w-xs truncate' : 'px-4 py-2'}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						);
					})}
					{paddingBottom > 0 && (
						<tr>
							<td style={{ height: `${paddingBottom}px` }} colSpan={columns.length} />
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
