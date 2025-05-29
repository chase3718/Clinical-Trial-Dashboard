import { useCallback, useState } from 'react';
import Dropzone from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

const ACCEPTED_TYPES = ['.csv', '.xlsx'];

export default function UploadButton({ setData, setSelectedFileId, refreshFiles }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const onDrop = useCallback(
		async (acceptedFiles, fileRejections) => {
			setError(null);

			if (fileRejections.length > 0) {
				setError('Only .csv and .xlsx files are allowed.');
				return;
			}
			if (!acceptedFiles.length) return;

			const file = acceptedFiles[0];

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
				refreshFiles?.();
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		},
		[setData, setSelectedFileId, refreshFiles]
	);

	return (
		<Dropzone
			onDrop={onDrop}
			multiple={false}
			noDrag
			accept={{
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
				'text/csv': ['.csv'],
			}}
		>
			{({ getRootProps, getInputProps }) => (
				<div {...getRootProps()} className="relative">
					<input {...getInputProps()} />
					<button className="btn btn-circle btn-success flex items-center justify-center" disabled={loading}>
						{loading ? (
							<span className="loading loading-spinner"></span>
						) : (
							<FaUpload />
						)}
					</button>
					{error && (
						<div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs text-red-500 bg-white shadow px-2 py-1 rounded">
							{error}
						</div>
					)}
				</div>
			)}
		</Dropzone>
	);
}
