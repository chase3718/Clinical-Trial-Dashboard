import { FaUpload } from 'react-icons/fa';

function ShimmerOverlay() {
	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			<div className="w-full h-full bg-gradient-to-r from-transparent via-base-100/40 to-transparent animate-[shimmer_1.5s_linear_infinite]" />
		</div>
	);
}

function PieSkeleton() {
	return (
		<div className="relative w-full h-full flex justify-center items-center animate-pulse overflow-hidden">
			<div className="relative w-32 h-32">
				<div className="absolute inset-0 rounded-full bg-base-300" />
				<div className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-base-200" />
				<div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-primary/40" />
				<div className="absolute left-1/2 top-1/2 w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-accent/40" />
				<ShimmerOverlay />
			</div>
		</div>
	);
}

function BarSkeleton() {
	return (
		<div className="relative w-full h-full flex justify-center items-end gap-2 px-4 animate-pulse overflow-hidden">
			{[12, 24, 36, 20, 28, 16].map((h, i) => (
				<div key={i} className="bg-base-300 rounded w-6" style={{ height: `${h * 2}%` }} />
			))}
			<ShimmerOverlay />
		</div>
	);
}

function LineSkeleton() {
	return (
		<div className="relative w-full h-full flex justify-center items-center px-4 animate-pulse overflow-hidden">
			<svg width="100%" height="100%" viewBox="0 0 128 64" className="w-full h-full">
				<polyline
					points="0,50 16,40 32,42 48,25 64,30 80,20 96,25 112,15 128,18"
					fill="none"
					stroke="var(--fallback-b1, #e5e6eb)"
					strokeWidth="4"
					strokeDasharray="8,6"
					className="text-base-300"
				/>
				<polyline
					points="0,54 16,47 32,50 48,38 64,46 80,30 96,37 112,21 128,27"
					fill="none"
					stroke="var(--fallback-p, #a991f7)"
					strokeWidth="2"
				/>
			</svg>
			<ShimmerOverlay />
		</div>
	);
}

function AreaSkeleton() {
	return (
		<div className="relative w-full h-full flex justify-center items-center px-4 animate-pulse overflow-hidden">
			<svg width="100%" height="100%" viewBox="0 0 128 64" className="w-full h-full">
				<polygon
					points="0,64 0,45 16,40 32,42 48,25 64,30 80,20 96,25 112,15 128,18 128,64"
					fill="var(--fallback-p, #a991f7)"
					opacity="0.4"
				/>
				<polyline
					points="0,45 16,40 32,42 48,25 64,30 80,20 96,25 112,15 128,18"
					fill="none"
					stroke="var(--fallback-p, #a991f7)"
					strokeWidth="2"
				/>
			</svg>
			<ShimmerOverlay />
		</div>
	);
}

function ScatterSkeleton() {
	return (
		<div className="relative w-full h-full flex justify-center items-center px-4 animate-pulse overflow-hidden">
			<svg width="100%" height="100%" viewBox="0 0 128 64" className="w-full h-full">
				{[8, 24, 40, 56, 72, 88, 104, 120].map((x, i) => (
					<circle key={i} cx={x} cy={30 + 15 * Math.sin(i)} r="4" fill="var(--fallback-a, #f6ad55)" opacity={0.6} />
				))}
			</svg>
			<ShimmerOverlay />
		</div>
	);
}

function RadarSkeleton() {
	return (
		<div className="relative w-full h-full flex justify-center items-center animate-pulse overflow-hidden">
			<div className="relative w-32 h-32 flex items-center justify-center">
				<svg width="128" height="128" viewBox="0 0 128 128">
					<polygon points="64,18 110,54 90,110 38,110 18,54" fill="var(--fallback-a, #f6ad55)" opacity="0.3" />
					<polygon points="64,28 104,58 86,104 42,104 24,58" fill="var(--fallback-p, #a991f7)" opacity="0.5" />
					<polygon points="64,38 98,62 82,98 46,98 30,62" fill="var(--fallback-b1, #e5e6eb)" opacity="0.8" />
				</svg>
				<ShimmerOverlay />
			</div>
		</div>
	);
}

function GenericSkeleton() {
	return (
		<div className="relative w-full h-full flex items-center justify-center bg-base-300 animate-pulse rounded-xl overflow-hidden">
			<span className="text-base-content/50 text-xs">Loading chart...</span>
			<ShimmerOverlay />
		</div>
	);
}

export default function ChartSkeleton({ chartType }) {
	switch (chartType) {
		case 'pie':
			return <PieSkeleton />;
		case 'bar':
			return <BarSkeleton />;
		case 'line':
			return <LineSkeleton />;
		case 'area':
			return <AreaSkeleton />;
		case 'scatter':
			return <ScatterSkeleton />;
		case 'radar':
			return <RadarSkeleton />;
		default:
			return <GenericSkeleton />;
	}
}
