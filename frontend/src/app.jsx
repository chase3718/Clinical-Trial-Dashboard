import Header from './components/header';

import './app.css';
import Dashboard from './pages/dashboard';
import FullscreenDropzone from './components/fullscreenDropzone';
import Sidebar from './components/sidebar';
import DataTable from './pages/clinicalDataTable';

import DATA from './temp/data.js';
import { useState } from 'react';

function App() {
	const [data, setData] = useState(() => DATA);
	return (
		<FullscreenDropzone>
			<div className="flex h-screen w-screen flex-row overflow-hidden bg-base-100">
				<Sidebar />
				{/* <Dashboard /> */}
				<DataTable data={data} />
			</div>
		</FullscreenDropzone>
	);
}

export default App;
