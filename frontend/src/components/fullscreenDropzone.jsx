import { useCallback, useState } from 'react';
import Dropzone from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

const ACCEPTED_TYPES = ['.csv', '.xlsx'];

export default function FullscreenDropzone({ children, setData, setSelectedFileId }) {
	const [dragging, setDragging] = useState(false);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const onDrop = useCallback(
		async (acceptedFiles, fileRejections) => {
			setDragging(false);
			setError(null);

			// Handle client-side rejected files
			if (fileRejections.length > 0) {
				setError('Only .csv and .xlsx files are allowed.');
				return;
			}
			if (!acceptedFiles.length) return;

			const file = acceptedFiles[0];

			// Double-check extension
			const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
			if (!ACCEPTED_TYPES.includes(ext)) {
				setError('Only .csv and .xlsx files are allowed.');
				return;
			}

			const formData = new FormData();
			formData.append('file', file);

			setLoading(true);

			try {
				const res = await fetch('/api/files/upload', {
					method: 'POST',
					body: formData,
				});

				if (!res.ok) {
					const err = await res.json();
					throw new Error(err.detail || 'Upload failed');
				}
				const json = await res.json();
				setData(json.data);
				setSelectedFileId(json.id);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		},
		[setData]
	);

	const onDragEnter = useCallback(() => {
		setDragging(true);
	}, []);
	const onDragLeave = useCallback(() => {
		setDragging(false);
	}, []);

	return (
		<Dropzone
			disableClick
			onDrop={onDrop}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			multiple={false}
			accept={{
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
				'text/csv': ['.csv'],
			}}
		>
			{({ getRootProps, getInputProps }) => (
				<div
					{...getRootProps({
						onClick: (event) => event.stopPropagation(),
					})}
				>
					<input {...getInputProps()} hidden />
					{dragging && <DropMask />}
					{loading && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
							<span>Uploading...</span>
						</div>
					)}
					{error && <div className="text-red-500 absolute top-4 left-1/2 -translate-x-1/2">{error}</div>}
					{children}
				</div>
			)}
		</Dropzone>
	);
}

function DropMask() {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 opacity-50">
			<span className="flex flex-col items-center justify-center p-4 text-gray-700 ">
				<FaUpload />
				Drop your .csv or .xlsx file here
			</span>
		</div>
	);
}
