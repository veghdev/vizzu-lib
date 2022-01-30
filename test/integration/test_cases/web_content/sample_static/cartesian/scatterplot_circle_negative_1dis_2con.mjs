import { data } from '../../../../test_data/chart_types_eu.mjs';

const testSteps = [
    chart => chart.animate({
        data: data,
        config: {
            channels: {
                x: { set: ['Value 6 (+/-)'] },
                y: { set: ['Value 5 (+/-)'] },
                noop: { set: ['Year'] },
                label: { set: ['Year'] }
            },
            title: 'Scatter Plot',
            geometry: 'circle',
            coordSystem: 'cartesian'
        }
    })
];

export default testSteps;