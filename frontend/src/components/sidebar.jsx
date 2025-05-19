import { FaChartArea, FaTable } from 'react-icons/fa';
import { FaHouse } from 'react-icons/fa6';

export default function Sidebar() {
	return (
		<aside class="h-screen sticky top-0 overflow-y-auto w-60 py-6 px-2 bg-base-200">
			<a class="btn btn-ghost">
				{/* <img alt="Logo" src="/daisy-components/logo.svg" class="w-6" /> */}
				<h2>Clinical Trial Dashboard</h2>
			</a>

			<ul class="menu px-0">
				<li class="menu-title">Analytics</li>
				<li>
					<a>
						<FaHouse />
						Overview
					</a>
				</li>
				<li>
					<a>
						<FaTable />
						Data
					</a>
				</li>
				<li>
					<a>
						<FaChartArea />
						Reports
					</a>
				</li>
			</ul>
		</aside>
	);
}
