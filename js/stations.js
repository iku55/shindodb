function getStationData(date) {
    if (date.getTime() >= new Date('2024-11-21T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20241121.json');
    } else if (date.getTime() >= new Date('2024-07-18T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20240718.json');
    } else if (date.getTime() >= new Date('2024-03-14T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20240314.json');
    } else if (date.getTime() >= new Date('2024-01-10T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20240110.json');
    } else if (date.getTime() >= new Date('2023-07-13T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20230713.json');
    } else if (date.getTime() >= new Date('2023-03-16T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20230316.json');
    } else if (date.getTime() >= new Date('2022-11-24T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20221124.json');
    } else if (date.getTime() >= new Date('2022-07-21T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20220721.json');
    } else if (date.getTime() >= new Date('2022-02-24T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20220224.json');
    } else if (date.getTime() >= new Date('2021-10-28T03:00:00.000Z').getTime()) {
        return fetch('https://raw.githubusercontent.com/iku55/jma_int_stations/main/history/20211028.json');
    }
}