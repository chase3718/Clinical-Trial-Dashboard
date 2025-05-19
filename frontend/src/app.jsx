import Header from './components/header';

import './app.css';
import Dashboard from './pages/dashboard';
import FullscreenDropzone from './components/fullscreenDropzone';
import Sidebar from './components/sidebar';
import DataTable from './pages/dataTable';

import data from './temp/data.js';

function App() {
	return (
		<FullscreenDropzone>
			<div className="flex h-screen w-screen flex-row">
				<Sidebar />
				{/* <Dashboard /> */}
				<DataTable data={data} />
			</div>
		</FullscreenDropzone>
	);
}

export default App;
