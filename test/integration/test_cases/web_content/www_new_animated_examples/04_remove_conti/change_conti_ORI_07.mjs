import { data_8 } from '../../../../test_data/chart_types_eu.mjs';


const testSteps = [
    chart => chart.animate({
        data: data_8,

        config: {
            channels: {
                x: 'Value 3 (+)',
                y: 'Country',
                noop: 'Year',
                color: 'Country'
            },
            title:'Title',
            geometry: 'circle'
        }
    }
),

    chart => chart.animate({
        config: {
            channels: {
                x: 'Year',
                y: 'Value 3 (+)'
            },
            title:'Title',
            orientation: 'horizontal'
        }
    }
),
    chart => chart.feature('tooltip',true)
];

export default testSteps;