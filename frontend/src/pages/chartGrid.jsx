import GridLayout from 'react-grid-layout';
import data from '../temp/data.js';
import ChartBuilder from '../components/chartBuilder.jsx';
import Bar from '../components/charts/bar.jsx';

const Charts = {
	Bar: Bar,
};

export default function ChartGrid() {
	const layout = [{ i: 'a', x: 0, y: 0, w: 10, h: 10 }];
	return (
		<div className="flex h-full w-full bg-base-100">
			<GridLayout className="layout" layout={layout} cols={20} rowHeight={30} width={1200}>
				{reports.map((report) => {
					const ChartComponent = Charts[report.type];
					return (
						<div className="flex h-full w-full items-center justify-center bg-base-200" key={report.key}>
							<ChartComponent key={report.key} data={data} />
						</div>
					);
				})}
			</GridLayout>
		</div>
	);
}

const reports = [
	{
		key: 'a',
		type: 'Bar',
	},
];
