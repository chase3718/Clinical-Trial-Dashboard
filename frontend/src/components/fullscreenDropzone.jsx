import { useCallback, useState } from 'react';
import Dropzone from 'react-dropzone';
import { FaUpload } from 'react-icons/fa';

export default function FullscreenDropzone({ children }) {
	const [dragging, setDragging] = useState(false);

	const onDrop = useCallback((acceptedFiles) => {
		console.log('Files dropped:', acceptedFiles);
		setDragging(false);
	}, []);
	const onDragEnter = useCallback(() => {
		console.log('Drag Enter');
		setDragging(true);
	}, []);
	const onDragLeave = useCallback(() => {
		console.log('Drag Leave');
		setDragging(false);
	}, []);
	return (
		<Dropzone
			className="h-scren"
			disableClick
			onDrop={onDrop}
			onDragEnter={onDragEnter}
			onDragLeave={onDragLeave}
			multiple={false}
		>
			{({ getRootProps, getInputProps }) => (
				<div
					{...getRootProps({
						onClick: (event) => event.stopPropagation(),
					})}
				>
					<input {...getInputProps()} hidden />
					{dragging ? (
						<>
							<DropMask />
							{children}
						</>
					) : (
						<>{children}</>
					)}
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
				Drop your files here
			</span>
		</div>
	);
}
