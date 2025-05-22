import { FaBars } from 'react-icons/fa';
import FileUpload from './fileUpload';

export default function Header() {
	return (
		<header className="navbar bg-base-200 shadow-sm">
			<div className="flex-none">
				<div className="drawer"></div>
				<input id="my-drawer" type="checkbox" className="drawer-toggle" />
				<div className="drawer-content">
					<label htmlFor="my-drawer" className="btn btn-primary drawer-button">
						<FaBars />
					</label>
				</div>
				<div className="drawer-side">
					<label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
					<ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
						<li>
							<a>Sidebar Item 1</a>
						</li>
						<li>
							<a>Sidebar Item 2</a>
						</li>
					</ul>
				</div>
			</div>
			<div className="flex-none">
				<a className="btn btn-ghost text-xl">Clinical Trial Dashboard</a>
			</div>
			{/* <div className="flex-none">
				<div className="breadcrumbs">
					<ul>
						<li>
							<a>Dashboard</a>
						</li>
					</ul>
				</div>
			</div> */}
		</header>
	);
}
