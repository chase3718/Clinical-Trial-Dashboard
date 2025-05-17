export default function Header() {
	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		try {
			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) throw new Error('Upload failed');

			const data = await res.json();
			console.log('Upload successful:', data);
		} catch (err) {
			console.error('Error uploading file:', err.message);
		}
	};

	return (
		<div className="navbar bg-base-300 shadow-sm">
			<div className="navbar-start">
				<div className="dropdown">
					<div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
						</svg>
					</div>
					<ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
						<li>
							<a>Homepage</a>
						</li>
						<li>
							<a>Portfolio</a>
						</li>
						<li>
							<a>About</a>
						</li>
					</ul>
				</div>
			</div>
			<div className="navbar-end">
				<input
					type="file"
					className="file-input file-input-primary"
					accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
					onChange={handleFileChange}
				/>
			</div>
		</div>
	);
}
