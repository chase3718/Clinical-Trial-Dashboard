import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

export default function FileUpload() {
	const onDrop = useCallback((acceptedFiles) => {
		// Do something with the files
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

	return (
		<div className="btn" {...getRootProps()}>
			<input {...getInputProps()} />
			{isDragActive ? <p>Drop the files here ...</p> : <FaUpload />}
		</div>
	);
}
