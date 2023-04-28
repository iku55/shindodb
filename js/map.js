var map;
var source;
var quake, longitude, latitude;
var stations;

// 地図初期化
const initMap = () => {
    return new Promise((resolve, reject) => {
        console.time('initMap');
        map = new maplibregl.Map({
            container: 'map',
            style: 'styles/blank.json',
            center: [137, 36],
            zoom: 9,
            minZoom: 5,
            maxZoom: 14,
            attributionControl: false
        });
        console.timeEnd('initMap');
        resolve();
    });
}

// 地震取得
const getQuake = () => {
    return new Promise((resolve, reject) => {
        console.time('getQuake');
        fetch(location.hash.split('.')[0].replace('#', '') + '.json').then(res => res.json().then(quakes => {
            quake = quakes.find(d => d.id == location.hash.split('.')[1]);
            var lng = quake.longitude.replace('°', '/').replace('’', '/').split('/');
            var lat = quake.latitude.replace('°', '/').replace('’', '/').split('/');

            longitude = Number(lng[0]) + (Number(lng[1]) / 60);
            latitude = Number(lat[0]) + (Number(lat[1]) / 60);
            console.timeEnd('getQuake');
            resolve();
        }))
    });
}

// ソース取得
const getSources = () => {
    return new Promise((resolve, reject) => {
        console.time('getSources');
        fetch('sources.json').then(res => res.json().then(sources => {
            source = sources.find(d => d.name == location.hash.split('.')[0].replace('#', ''));
            map.addControl(new maplibregl.AttributionControl({
                customAttribution: '<a href="' + source.source.link + '">' + source.source.name + '</a>'
            }));
            console.timeEnd('getSources');
            resolve();
        }))
    });
}

// 震度観測点データ取得
const getStationsData = () => {
    return new Promise((resolve, reject) => {
        console.time('getStationsData');
        getStationData(
            new Date(source.year + '/' + source.month + '/' + quake.days + ' ' + quake.hours + ':' + quake.minutes + ':00+0900')
        ).then(res => res.json().then(data => {
            stations = data;
            console.timeEnd('getStationsData');
            resolve();
        }))
    });
}

// 震央描画
const drawEpicenter = () => {
    return new Promise((resolve, reject) => {
        console.time('drawEpicenter');
        new maplibregl.Marker(makeMarkerIcon('images/epicenter.png', 40, 40, true, null, 70))
            .setLngLat([longitude, latitude])
            .setPopup(
                new maplibregl.Popup({ closeButton: false, className: 'epicenterPopup' })
                    .setHTML('<span uk-icon="icon: clock"></span>時刻<br>' + quake.days + '日' + quake.hours + '時' + quake.minutes + '分ごろ<br><span uk-icon="icon: location"></span>震源<br>' + quake.epicentername + ' 深さ' + quake.depth)
            )
            .addTo(map);
        map.setCenter([longitude, latitude]);
        map.setZoom(7);
        document.getElementById('table-earthquakes').innerHTML = '<tr><td>' + source.year + '/' + source.month + '/' + quake.days + ' ' + quake.hours + ':' + quake.minutes + '</td><td>' + quake.epicentername + '</td><td>' + quake.latitude + '</td><td>' + quake.longitude + '</td><td>' + quake.depth + '</td><td>' + quake.magnitude + '</td></tr>'
        if (quake.earthquakes) {
            for (const q of quake.earthquakes) {
                document.getElementById('table-earthquakes').innerHTML += '<tr><td>' + source.year + '/' + source.month + '/' + q.days + ' ' + q.hours + ':' + q.minutes + '</td><td>' + q.epicentername + '</td><td>' + q.latitude + '</td><td>' + q.longitude + '</td><td>' + q.depth + '</td><td>' + q.magnitude + '</td></tr>'
            }
        }
        console.timeEnd('drawEpicenter');
        resolve();
    });
}

// 観測点描画
const drawPoints = () => {
    return new Promise((resolve, reject) => {
        console.time('drawPoints');
        var intList = {};
        for (const point of Object.entries(quake.int)) {
            var station = stations.find(d => d.name == point[0].replace('＊', ''));
            new maplibregl.Marker(makeMarkerIcon('images/jma/S' + point[1] + '.gif', 20, 20, false, point[0] + '=' + point[1], point[1]*10))
                .setLngLat([station.lon, station.lat])
                .addTo(map);
            if (!intList[station.pref.name]) { intList[station.pref.name] = {} }
            if (!intList[station.pref.name][toIntText(point[1])]) { intList[station.pref.name][toIntText(point[1])] = '' }
            intList[station.pref.name][toIntText(point[1])] += point[0] + '=' + point[1] + '　';
        }
        for (const pref of Object.entries(intList)) {
            for (const int of Object.entries(pref[1])) {
                document.getElementById('table-intensities').innerHTML += '<tr><td>' + pref[0] + '</td><td>' + int[0] + '</td><td>' + int[1] + '</td></tr>'
            }
        }
        console.timeEnd('drawPoints');
        resolve();
    })
}

// サイドボタン設定
const setSideButtons = () => {
    return new Promise((resolve, reject) => {
        console.time('setSideButtons');
        document.getElementById('pdfbtn').setAttribute('href', source.source.link)
        document.getElementById('listbtn').setAttribute('href', 'list.html#' + source.name)
        document.getElementById('dbbtn').setAttribute('href', 'https://www.data.jma.go.jp/svd/eqdb/data/shindo/index.html#' + quake.dbid)
        console.timeEnd('setSideButtons');
    });
}

// アイコンdiv作成
function makeMarkerIcon(img, w, h, cursor, tooltip, zindex) {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url(${img})`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.backgroundSize = '100%';
    if (cursor) { el.style.cursor = 'pointer'; }
    if (tooltip) { el.setAttribute('uk-tooltip', tooltip) }
    el.style.zIndex = zindex;
    return el;
}

// 計測震度から震度階級テキストに変換
function toIntText(int) {
    if (int < 0.5) {
        return '０';
    } else if (int < 1.5) {
        return '１';
    } else if (int < 2.5) {
        return '２';
    } else if (int < 3.5) {
        return '３';
    } else if (int < 4.5) {
        return '４';
    } else if (int < 5.0) {
        return '５弱';
    } else if (int < 5.5) {
        return '５強';
    } else if (int < 6.0) {
        return '６弱';
    } else if (int < 6.5) {
        return '６強';
    } else {
        return '７';
    }
}


//  -----

initMap()
    .then(getQuake)
    .then(getSources)
    .then(getStationsData)
    .then(drawEpicenter)
    .then(drawPoints)
    .then(setSideButtons);