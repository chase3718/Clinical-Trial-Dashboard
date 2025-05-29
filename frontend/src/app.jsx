import Header from './components/header';
import './app.css';
import Dashboard from './pages/dashboard';
import FullscreenDropzone from './components/fullscreenDropzone';
import DataTable from './pages/clinicalDataTable';
import DATA from './temp/data.js';
import { useState, useEffect, useCallback } from 'react';
import { FaChartBar, FaTable, FaTrash } from 'react-icons/fa';
import UploadButton from './components/uploadButton.jsx';

function App() {
	const [data, setData] = useState([]);
	const [page, setPage] = useState('dashboard'); // "dashboard" | "table"
	const [availableFiles, setAvailableFiles] = useState([]);
	const [selectedFileId, setSelectedFileId] = useState('');

	// Fetch files on mount and provide a function to refresh
	const fetchFiles = useCallback(async () => {
		try {
			const res = await fetch('/api/files/all');
			if (!res.ok) throw new Error('Failed to fetch files');
			const files = await res.json();
			setAvailableFiles(files);
		} catch (err) {
			console.error('Error fetching files:', err);
			setAvailableFiles([]); // Clear if failed
		}
	}, []);

	// Fetch the data for a selected file
	const fetchFileData = useCallback(async (fileId) => {
		if (!fileId) {
			setData([]);
			return;
		}
		try {
			const res = await fetch(`api/files/data/${fileId}`);
			if (!res.ok) throw new Error('Failed to fetch file data');
			const file = await res.json();
			setData(file.data);
		} catch (err) {
			console.error('Error fetching file data:', err);
			setData([]);
		}
	}, []);

	const deleteFile = useCallback(async () => {
		if (selectedFileId === '') return;
		await fetch(`api/files/delete/${selectedFileId}`);
		setSelectedFileId('');
	}, [selectedFileId]);

	useEffect(() => {
		fetchFiles();
	}, [fetchFiles, data]);

	// When the selected file changes, fetch its data
	useEffect(() => {
		if (selectedFileId !== '') {
			fetchFileData(selectedFileId);
		} else {
			setSelectedFileId('');
			setData([]);
		}
	}, [selectedFileId, fetchFileData]);

	return (
		<FullscreenDropzone setData={setData} setSelectedFileId={selectedFileId}>
			<div className="flex h-screen w-screen flex-row overflow-hidden y-overflow-hidden bg-base-100">
				{/* <Sidebar /> */}
				{page === 'dashboard' && <Dashboard data={data} availableFiles={availableFiles} refreshFiles={fetchFiles} />}
				{page === 'table' && <DataTable data={data} availableFiles={availableFiles} refreshFiles={fetchFiles} />}
				{/* Floating Dock */}
				<div className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 flex gap-3 items-center bg-white/80 px-4 py-2 rounded-xl shadow-lg">
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
					{/* File Select Dropdown */}
					<select
						className="select select-bordered ml-2"
						style={{ minWidth: 180 }}
						value={selectedFileId}
						onChange={(e) => setSelectedFileId(e.target.value)}
					>
						<option value="">Select File...</option>
						{availableFiles.map((f) => (
							<option key={f.id} value={f.id}>
								{f.displayname}
							</option>
						))}
					</select>
					<button className="btn btn-circle btn-error shadow-md transition-all duration-150">
						<FaTrash onClick={deleteFile} />
					</button>
					<UploadButton setData={setData}
	setSelectedFileId={setSelectedFileId}
	refreshFiles={fetchFiles} />
				</div>
			</div>
		</FullscreenDropzone>
	);
}

export default App;
