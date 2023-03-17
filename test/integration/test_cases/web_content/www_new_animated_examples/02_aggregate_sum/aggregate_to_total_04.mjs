import { data_8 } from '../../../../test_data/chart_types_eu.mjs';


const testSteps = [
    chart => chart.animate({
        data: data_8,

        config: {
            channels: {
                x: 'Year',
                y: ['Country', 'Value 2 (+)'],
                color: 'Country'
            },
            title:'Title'
        }
    }
),

    chart => chart.animate({
        config: {
            channels: {
                x: null,
                y: 'Value 2 (+)',
                color: null,
                label: 'Value 2 (+)'
            },
            title:'Title'
        }
    }
 ),
    chart => chart.feature('tooltip',true)
];

export default testSteps;