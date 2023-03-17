import { data_8 } from '../../../../test_data/chart_types_eu.mjs';


const testSteps = [
    chart => chart.animate({
        data: data_8,

        config: {
            channels: {
                x: 'Year',
                y: 'Value 2 (+)',
                color: 'Country'
            },
            title:'Title',
            geometry: 'line'
        }
    }
),

    chart => chart.animate({
        config: {
            channels: {
                y: ['Value 2 (+)', 'Country']
            },
            title:'Title',
            geometry: 'area',
            split: true
        }
    }
),
    chart => chart.feature('tooltip',true)
];

export default testSteps;