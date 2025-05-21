import { FaChartArea, FaTable } from 'react-icons/fa';
import { FaHouse } from 'react-icons/fa6';

export default function Sidebar() {
	return (
		<aside className="h-screen sticky top-0 overflow-y-auto  py-6 px-2 bg-base-200 min-w-[240px] z-0">
			<a className="btn btn-ghost">{/* <img alt="Logo" src="/daisy-components/logo.svg" className="w-6" /> */}</a>

			<ul className="menu px-0">
				<li>
					<a>
						<FaChartArea />
					</a>
				</li>
				<li>
					<a>
						<FaTable />
					</a>
				</li>
			</ul>
		</aside>
	);
}
