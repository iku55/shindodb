/*  気象庁ホームページより作成(CC BY 4.0)  */

function getStationData(date) {
    if (date.getTime() >= new Date('2023-03-16T03:00:00.000Z').getTime()) {
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