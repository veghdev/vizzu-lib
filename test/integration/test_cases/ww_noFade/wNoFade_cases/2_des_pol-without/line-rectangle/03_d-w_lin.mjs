import { data } from '../../../../../test_data/chart_types_eu.mjs';


const testSteps = [
    chart => chart.animate({
        data: Object.assign(data, {
            filter: record =>
                record.Country == 'Austria' ||
                record.Country == 'Belgium' ||
                record.Country == 'Bulgaria' ||
                record.Country == 'Cyprus' ||
                record.Country == 'Czechia' ||
                record.Country == 'Denmark' ||
                record.Country == 'Estonia' ||
                record.Country == 'Greece' ||
                record.Country == 'Germany' ||
                record.Country == 'Spain' ||
                record.Country == 'Finland' ||
                record.Country == 'France' ||
                record.Country == 'Croatia' ||
               record.Country == 'Hungary'
        }),
        config: {
            channels: {
                x: { set: 'Year' },
                y: { set: 'Value 2 (+)' },
                color: { set: 'Country' }
            },
            title: 'Line Chart',
            geometry: 'line'
        } 
    }),

    chart => chart.animate({
        config: {
            channels: {
                x: { set: 'Year' },
                y: { set: 'Value 1 (+)' },
                color: { set: 'Country' }
            },
            title: 'Change Conti'
        }
    }
    ),

    chart => chart.animate({
        config: {
            channels: {
                x: null,
                y: null,
                noop: { set: 'Year' },
                size: { set: ['Year', 'Value 1 (+)'] }
            },
            title: 'Change Geoms & CoordSys',
            geometry: 'rectangle'
        }
    },
    {
         geometry: {
             delay: 0.5,
             duration: 1.5
         },
         x: {
             delay: 1
         }
     }
    )];

export default testSteps;