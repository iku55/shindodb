var map;
var source;
var quake, longitude, latitude;
var stations;
var popupHTML;

// 地図初期化
const initMap = () => {
    return new Promise((resolve, reject) => {
        console.time('initMap');
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
        const PMTILES_URL = "https://iku55.github.io/eq-pmtiles-test/earthquake_map.pmtiles";
        map = new maplibregl.Map({
            container: 'map',
            center: [137.0, 38.0],
            zoom: 9,
            minZoom: 5,
            maxZoom: 14,
            attributionControl: false,
            style: './styles/style.json'
        });
        if (!document.cookie.includes('icon')) document.cookie = 'icon=jma';
        popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15
        });
        map.on('mousemove', 'points-layer', (e) => {
            if (e.features.length > 0) {
                // カーソルをポインターに変更
                map.getCanvas().style.cursor = 'pointer';

                const coordinates = e.features[0].geometry.coordinates.slice();
                const props = e.features[0].properties;

                if (popupHTML === props.popup) {
                    return;
                }
                popupHTML = props.popup;

                // 座標補正（世界地図がループしている場合）
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                // 表示
                popup.setLngLat(coordinates).setHTML(popupHTML).addTo(map);
            }
        });
        map.on('mouseleave', 'points-layer', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
            popupHTML = null;
        });
        map.on('click', 'epicenter-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new maplibregl.Popup()
                .setLngLat(coordinates)
                .setHTML(e.features[0].properties.popup)
                .addTo(map);
        });
        map.on('mouseenter', 'epicenter-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'epicenter-layer', () => {
            map.getCanvas().style.cursor = '';
        });
        console.timeEnd('initMap');
        resolve();
    });
}

// 画像を読み込む
const loadImages = () => {
    return new Promise((resolve) => {
        console.time('loadImages');
        
        const images = [
            { id: 'epicenter', url: 'images/epicenter.png' },
            { id: 'epicenter_white', url: 'images/epicenter_white.png' }
        ];

        // 震度アイコンのリストを追加
        const iconExt = document.cookie.includes('icon=kmoni') ? '.svg' : '.gif';
        const iconDir = document.cookie.includes('icon=kmoni') ? 'images/kmoni/' : 'images/jma/';
        for (let i = 5; i <= 69; i++) {
            const intStr = (i / 10).toFixed(1);
            images.push({ id: `intensity-${intStr}`, url: `${iconDir}S${intStr}${iconExt}` });
        }

        const promises = images.map(img => {
            return new Promise((res) => {
                // SVGの場合は loadImage ではなく Image オブジェクトを自前で作る
                if (img.url.endsWith('.svg')) {
                    const htmlImg = new Image();
                    htmlImg.onload = () => {
                        if (!map.hasImage(img.id)) map.addImage(img.id, htmlImg);
                        res();
                    };
                    htmlImg.onerror = () => {
                        console.warn(`SVG Load Error: ${img.url}`);
                        res();
                    };
                    htmlImg.src = img.url;
                } else {
                    // PNG/GIF は map.loadImage を使用
                    map.loadImage(img.url)
                        .then(image => {
                            if (!map.hasImage(img.id)) {
                                map.addImage(img.id, image.data);
                            }
                            res();
                        })
                        .catch(err => {
                            console.warn(`Image Load Error: ${img.url}`, err);
                            res();
                        });
                }
            });
        });

        Promise.all(promises).then(() => {
            console.timeEnd('loadImages');
            resolve();
        });
    });
};

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
                customAttribution: 'カラースキーム: '+(document.cookie.includes('icon=kmoni')?'<a href="https://github.com/ingen084/KyoshinShindoColorMap">ingen084/KyoshinShindoColorMap</a>':'気象庁')+' | 震度データ: <a href="' + source.source.link + '">' + source.source.name + '</a>'
            }));
            document.title = source.year+'年'+source.month+'月#'+quake.id+'(最大震度'+toIntText(Object.entries(quake.int)[0][1])+') - 計測震度データベース';
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
        const features = [];
        // 主震源
        features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [longitude, latitude] },
            properties: { 
                icon: 'epicenter',
                zIndex: 71,
                size: 40/491,
                popup: '<span uk-icon="icon: clock"></span>時刻<br>' + quake.days + '日' + quake.hours + '時' + quake.minutes + '分ごろ<br><span uk-icon="icon: location"></span>震源<br>' + quake.epicentername + ' 深さ' + quake.depth
            }
        });
        map.setCenter([longitude, latitude]);
        map.setZoom(7);
        document.getElementById('table-earthquakes').innerHTML = '<tr><td>' + source.year + '/' + source.month + '/' + quake.days + ' ' + quake.hours + ':' + quake.minutes + '</td><td>' + quake.epicentername + '</td><td>' + quake.latitude + '</td><td>' + quake.longitude + '</td><td>' + quake.depth + '</td><td>' + quake.magnitude + '</td></tr>'
        if (quake.earthquakes) {
            for (const q of quake.earthquakes) {
                document.getElementById('table-earthquakes').innerHTML += '<tr><td>' + source.year + '/' + source.month + '/' + q.days + ' ' + q.hours + ':' + q.minutes + '</td><td>' + q.epicentername + '</td><td>' + q.latitude + '</td><td>' + q.longitude + '</td><td>' + q.depth + '</td><td>' + q.magnitude + '</td></tr>'
                
                var lng = q.longitude.replace('°', '/').replace('’', '/').split('/');
                var lat = q.latitude.replace('°', '/').replace('’', '/').split('/');

                lng = Number(lng[0]) + (Number(lng[1]) / 60);
                lat = Number(lat[0]) + (Number(lat[1]) / 60);
                
                features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [lng, lat] },
                    properties: { 
                        icon: 'epicenter_white',
                        zIndex: 70,
                        size: 30/69,
                        popup: '<span uk-icon="icon: clock"></span>時刻<br>' + q.days + '日' + q.hours + '時' + q.minutes + '分ごろ<br><span uk-icon="icon: location"></span>震源<br>' + q.epicentername + ' 深さ' + q.depth
                    }
                });
                console.log(lng, lat, q)
            }
        }
        map.addSource('epicenter-source', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: features }
        });

        map.addLayer({
            id: 'epicenter-layer',
            type: 'symbol',
            source: 'epicenter-source',
            layout: {
                'icon-image': ['get', 'icon'],
                'icon-size': ['get', 'size'],
                'icon-allow-overlap': true
            }
        });
        console.timeEnd('drawEpicenter');
        resolve();
    });
}

// 観測点描画
const drawPoints = () => {
    return new Promise((resolve, reject) => {
        console.time('drawPoints');
        const features = [];
        var intList = {};
        for (const point of Object.entries(quake.int)) {
            var station = stations.find(d => d.name == point[0].replace('＊', '').replace(/\(旧[０１２３４５６７８９]*\)/, ''));
            if (!station) {
                console.log('観測点 "'+point[0]+'" の詳細情報を確認できませんでした');
                document.getElementById('modalbody').innerHTML = '<div class="uk-alert-danger" uk-alert><p>'+'観測点 "'+point[0]+'" の詳細情報を確認できなかったため、表示していません。</p></div>'+document.getElementById('modalbody').innerHTML;
                continue;
            }

            features.push({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [station.lon, station.lat] },
                properties: { 
                    icon: 'intensity-'+point[1],
                    zIndex: point[1]*10,
                    size: 20/50,
                    popup: point[0] + '=' + point[1]
                }
            });
            if (!intList[station.pref.name]) { intList[station.pref.name] = {} }
            if (!intList[station.pref.name][toIntText(point[1])]) { intList[station.pref.name][toIntText(point[1])] = '' }
            intList[station.pref.name][toIntText(point[1])] += point[0] + '=' + point[1] + '　';
        }
        for (const pref of Object.entries(intList)) {
            for (const int of Object.entries(pref[1])) {
                document.getElementById('table-intensities').innerHTML += '<tr><td>' + pref[0] + '</td><td>' + toIntLabel(int[0]) + '</td><td>' + int[1] + '</td></tr>'
            }
        }
        map.addSource('points-source', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: features }
        });

        map.addLayer({
            id: 'points-layer',
            type: 'symbol',
            source: 'points-source',
            layout: {
                'icon-image': ['get', 'icon'],
                'icon-size': ['get', 'size'],
                'symbol-sort-key': ['get', 'zIndex'],
                'icon-allow-overlap': true
            }
        }, 'epicenter-layer');
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
        resolve()
    });
}

// 震度観測点データ取得
const getNotes = () => {
    return new Promise((resolve, reject) => {
        console.time('getNotes');
        fetch('notes.json').then(res => res.json().then(data => {
            if (data.notes[quake.dbid]) {
                const note = data.notes[quake.dbid];
                document.getElementById('notes').innerHTML = `<div uk-alert>
                <h3><span class="uk-text-small uk-text-muted">補足情報</span> ${note.title?note.title:''}</h3>
                <p>${note.content}</p>
                ${note.links.map(a => {return `<a href="${a[1]}" target="_blank">${a[0]}</a>`}).join('<br>')}
            </div>
                `
            }
            resolve();
        }))
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

function toIntLabel(int) {
    if (int == '０') {return '<span class="uk-label">震度０</span>';
    } else if (int == '１') {return '<span class="uk-label" style="background: #f2f2ff; color: black;">震度１</span>';
    } else if (int == '２') {return '<span class="uk-label" style="background: #00aaff; color: black;">震度２</span>';
    } else if (int == '３') {return '<span class="uk-label" style="background: #0041ff; color: white;">震度３</span>';
    } else if (int == '４') {return '<span class="uk-label" style="background: #fae696; color: black;">震度４</span>';
    } else if (int == '５弱') {return '<span class="uk-label" style="background: #ffe600; color: black;">震度５弱</span>';
    } else if (int == '５強') {return '<span class="uk-label" style="background: #ff9900; color: black;">震度５強</span>';
    } else if (int == '６弱') {return '<span class="uk-label" style="background: #ff2800; color: white;">震度６弱</span>';
    } else if (int == '６強') {return '<span class="uk-label" style="background: #a50021; color: white;">震度６強</span>';
    } else  {return '<span class="uk-label" style="background: #b40068; color: white;">震度７</span>';
    }
}


//  -----

initMap()
    .then(() => {
        // 地図のスタイルロード完了を待ってから画像を読み込む
        return new Promise(resolve => {
            if (map.loaded()) resolve();
            else map.once('load', resolve);
        });
    })
    .then(loadImages)
    .then(getQuake)
    .then(getSources)
    .then(getStationsData)
    .then(drawEpicenter)
    .then(drawPoints)
    .then(setSideButtons)
    .then(getNotes)
    .then(() => {
        gtag('event', 'view_earthquake', {
            earthquake_id: quake.dbid,
            send_to: 'G-GRQELX997W'
        });
    });