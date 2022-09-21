import { data } from '../../../test_data/chart_types_eu.mjs';

const testSteps = [
    chart => chart.animate(
        {
            data: data,
            config:
            {
                channels:
                {
                    y: { set: ['Value 2 (+)', 'Joy factors'] },
                    x: { set: 'Year' },
                    color: { set: 'Joy factors' },
//                    label: { attach: 'Value 2 (+)' }
                },
                title: 'Splitted Column Chart',
                split: true
            },
            style: {
                plot: {
                    paddingLeft: '1.2em',
                    yAxis: {
                        label: {
                           paddingRight: '0.8em'
                        }
                    },
                    xAxis: {
                        label: { paddingTop: '0.8em' }
                    }
                }
            }
        }
    ),

    chart => chart.feature('tooltip',true)
];

export default testSteps;