export default function Dashboard() {
	return (
		<div className="flex h-full w-full flex-col">
			<div className="flex h-16 w-full items-center justify-between bg-base-200 px-4">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				{/* <Header /> */}
			</div>
			<div className="flex h-full w-full bg-base-100">{/* <ChartGrid /> */}</div>
		</div>
	);
}
