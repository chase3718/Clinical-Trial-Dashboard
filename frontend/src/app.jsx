import Header from './components/header';
import './app.css';
import Dashboard from './pages/dashboard';
import FullscreenDropzone from './components/fullscreenDropzone';
// import Sidebar from './components/sidebar';
import DataTable from './pages/clinicalDataTable';
import DATA from './temp/data.js';
import { useState } from 'react';
import { FaChartBar, FaTable } from 'react-icons/fa';

function App() {
	const [data, setData] = useState(() => DATA);
	const [page, setPage] = useState('dashboard'); // "dashboard" | "table"

	return (
		<FullscreenDropzone>
			<div className="flex h-screen w-screen flex-row overflow-hidden bg-base-100">
				{/* <Sidebar /> */}
				{page === 'dashboard' && <Dashboard data={data} />}
				{page === 'table' && <DataTable data={data} />}
				{/* Floating Dock */}
				<div className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
					<button
						className={`btn btn-circle btn-primary shadow-md transition-all duration-150 ${
							page === 'dashboard' ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'bg-base-200 text-base-content'
						}`}
						onClick={() => setPage('dashboard')}
						title="Dashboard"
					>
						<FaChartBar size={22} />
					</button>
					<button
						className={`btn btn-circle btn-primary shadow-md transition-all duration-150 ${
							page === 'table' ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'bg-base-200 text-base-content'
						}`}
						onClick={() => setPage('table')}
						title="Data Table"
					>
						<FaTable size={22} />
					</button>
				</div>
			</div>
		</FullscreenDropzone>
	);
}

export default App;
