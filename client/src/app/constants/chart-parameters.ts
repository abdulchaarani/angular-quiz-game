import * as agCharts from 'ag-charts-community';

export const TYPE_CATEGORY: agCharts.AgCategoryAxisOptions['type'] = 'category';
export const TYPE_NUMBER: agCharts.AgNumberAxisOptions['type'] = 'number';

export const POSITION_BOTTOM: agCharts.AgBaseCartesianAxisOptions['position'] = 'bottom';
export const POSITION_LEFT: agCharts.AgBaseCartesianAxisOptions['position'] = 'left';

export const TITLE_NUMBER_OF_PLAYERS: agCharts.AgBaseCartesianAxisOptions['title'] = { text: 'Nombre de joueurs' };

export const TYPE_BAR: agCharts.AgBarSeriesOptions['type'] = 'bar';

export const XKEY_GRADE: agCharts.AgBarSeriesOptionsKeys['xKey'] = 'grade';
export const YKEY_COUNT: agCharts.AgBarSeriesOptionsKeys['yKey'] = 'count';

export const YNAME_PLAYERS: agCharts.AgBarSeriesOptionsNames['yName'] = 'Nombre de joueurs';

export const LONG_ANSWER_HISTOGRAM_OPTIONS: agCharts.AgBaseCartesianChartOptions['axes'] = [
    {
        type: TYPE_CATEGORY,
        position: POSITION_BOTTOM,
    },
    {
        type: TYPE_NUMBER,
        position: POSITION_LEFT,
        title: TITLE_NUMBER_OF_PLAYERS,
    },
];

export const LONG_ANSWER_HISTOGRAM_SERIES: agCharts.AgBaseCartesianChartOptions['series'] = [
    {
        type: TYPE_BAR,
        xKey: XKEY_GRADE,
        yKey: YKEY_COUNT,
        yName: YNAME_PLAYERS,
    },
];
