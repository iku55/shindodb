/**
 * Utility functions for the Seismic Intensity Database
 * 計測震度データベース用ユーティリティ関数
 */

/**
 * Convert measured seismic intensity value to seismic intensity class text
 * 計測震度から震度階級テキストに変換
 * @param {number|string} int - The measured seismic intensity value
 * @returns {string} The seismic intensity class in Japanese (e.g., '５弱')
 */
function intensityToClassText(int) {
    const intensity = Number(int);
    if (intensity < 0.5) {
        return '０';
    } else if (intensity < 1.5) {
        return '１';
    } else if (intensity < 2.5) {
        return '２';
    } else if (intensity < 3.5) {
        return '３';
    } else if (intensity < 4.5) {
        return '４';
    } else if (intensity < 5.0) {
        return '５弱';
    } else if (intensity < 5.5) {
        return '５強';
    } else if (intensity < 6.0) {
        return '６弱';
    } else if (intensity < 6.5) {
        return '６強';
    } else {
        return '７';
    }
}

/**
 * Convert seismic intensity class text to HTML label element
 * 震度階級テキストをHTMLラベル要素に変換
 * @param {string} classText - The seismic intensity class text (e.g., '５弱')
 * @returns {string} HTML string with styled label
 */
function intensityToLabel(classText) {
    const styles = {
        '０': { background: '', color: '', text: '震度０' },
        '１': { background: '#f2f2ff', color: 'black', text: '震度１' },
        '２': { background: '#00aaff', color: 'black', text: '震度２' },
        '３': { background: '#0041ff', color: 'white', text: '震度３' },
        '４': { background: '#fae696', color: 'black', text: '震度４' },
        '５弱': { background: '#ffe600', color: 'black', text: '震度５弱' },
        '５強': { background: '#ff9900', color: 'black', text: '震度５強' },
        '６弱': { background: '#ff2800', color: 'white', text: '震度６弱' },
        '６強': { background: '#a50021', color: 'white', text: '震度６強' },
        '７': { background: '#b40068', color: 'white', text: '震度７' }
    };

    const style = styles[classText] || styles['７'];
    
    if (classText === '０') {
        return '<span class="uk-label">' + style.text + '</span>';
    }
    return '<span class="uk-label" style="background: ' + style.background + '; color: ' + style.color + ';">' + style.text + '</span>';
}

/**
 * Convert measured seismic intensity value directly to HTML label
 * 計測震度値を直接HTMLラベルに変換
 * @param {number|string} int - The measured seismic intensity value
 * @returns {string} HTML string with styled label
 */
function intensityValueToLabel(int) {
    return intensityToLabel(intensityToClassText(int));
}

/**
 * Parse coordinate string in degrees and minutes format to decimal degrees
 * 度分形式の座標文字列を十進度に変換
 * @param {string} coordStr - Coordinate string (e.g., "35°30.5'N")
 * @returns {number} Decimal degrees value
 */
function parseCoordinate(coordStr) {
    const parts = coordStr.replace('\u00b0', '/').replace('\u2019', '/').split('/');
    return Number(parts[0]) + (Number(parts[1]) / 60);
}

/**
 * Parse latitude string to decimal degrees
 * 緯度文字列を十進度に変換
 * @param {string} latStr - Latitude string (e.g., "35°30.5'N")
 * @returns {number} Decimal degrees value
 */
function parseLatitude(latStr) {
    return parseCoordinate(latStr);
}

/**
 * Parse longitude string to decimal degrees
 * 経度文字列を十進度に変換
 * @param {string} lngStr - Longitude string (e.g., "135°30.5'E")
 * @returns {number} Decimal degrees value
 */
function parseLongitude(lngStr) {
    return parseCoordinate(lngStr);
}

/**
 * Format earthquake date and time from quake data
 * 地震データから日時を整形
 * @param {Object} source - Source data with year and month
 * @param {Object} quake - Earthquake data with days, hours, minutes
 * @returns {string} Formatted date string (e.g., "2024/11/30 09:52")
 */
function formatEarthquakeDateTime(source, quake) {
    return source.year + '/' + source.month + '/' + quake.days + ' ' + quake.hours + ':' + quake.minutes;
}

/**
 * Format earthquake date and time as short format
 * 地震データから日時を短い形式で整形
 * @param {Object} quake - Earthquake data with days, hours, minutes
 * @returns {string} Formatted short date string (e.g., "30日09時52分")
 */
function formatEarthquakeDateTimeShort(quake) {
    return quake.days + '日' + quake.hours + '時' + quake.minutes + '分';
}

/**
 * Create Date object from earthquake data
 * 地震データからDateオブジェクトを作成
 * @param {Object} source - Source data with year and month
 * @param {Object} quake - Earthquake data with days, hours, minutes
 * @returns {Date} Date object in JST timezone
 */
function createEarthquakeDate(source, quake) {
    return new Date(
        source.year + '/' + source.month + '/' + quake.days + ' ' + 
        quake.hours + ':' + quake.minutes + ':00+0900'
    );
}

/**
 * Get the maximum seismic intensity from earthquake intensity data
 * 地震の震度データから最大計測震度を取得
 * @param {Object} intData - Object with station names as keys and intensity values
 * @returns {number|null} Maximum intensity value or null if no data
 */
function getMaxIntensity(intData) {
    if (!intData || Object.keys(intData).length === 0) {
        return null;
    }
    const values = Object.values(intData).map(Number);
    return Math.max(...values);
}

/**
 * Get the station with maximum seismic intensity
 * 最大計測震度の観測点を取得
 * @param {Object} intData - Object with station names as keys and intensity values
 * @returns {Object|null} Object with station name and intensity, or null if no data
 */
function getMaxIntensityStation(intData) {
    if (!intData || Object.keys(intData).length === 0) {
        return null;
    }
    
    let maxStation = null;
    let maxValue = -Infinity;
    
    for (const [station, value] of Object.entries(intData)) {
        const numValue = Number(value);
        if (numValue > maxValue) {
            maxValue = numValue;
            maxStation = station;
        }
    }
    
    return { station: maxStation, intensity: maxValue };
}

/**
 * Filter earthquakes by minimum intensity
 * 最小震度で地震をフィルタリング
 * @param {Array} quakes - Array of earthquake objects
 * @param {number} minIntensity - Minimum intensity value
 * @returns {Array} Filtered array of earthquakes
 */
function filterByMinIntensity(quakes, minIntensity) {
    return quakes.filter(function(quake) {
        if (!quake.int || Object.keys(quake.int).length === 0) {
            return false;
        }
        const maxInt = getMaxIntensity(quake.int);
        return maxInt >= minIntensity;
    });
}

/**
 * Filter earthquakes by region name
 * 地域名で地震をフィルタリング
 * @param {Array} quakes - Array of earthquake objects
 * @param {string} regionName - Region name to search for (partial match)
 * @returns {Array} Filtered array of earthquakes
 */
function filterByRegion(quakes, regionName) {
    return quakes.filter(function(quake) {
        return quake.epicentername && quake.epicentername.includes(regionName);
    });
}

/**
 * Sort earthquakes by date (newest first)
 * 地震を日付順（新しい順）にソート
 * @param {Array} quakes - Array of earthquake objects
 * @returns {Array} Sorted array of earthquakes
 */
function sortByDateDesc(quakes) {
    return [...quakes].sort(function(a, b) {
        const dateA = a.days + a.hours + a.minutes;
        const dateB = b.days + b.hours + b.minutes;
        return dateB.localeCompare(dateA);
    });
}

/**
 * Sort earthquakes by maximum intensity (highest first)
 * 地震を最大震度順（強い順）にソート
 * @param {Array} quakes - Array of earthquake objects
 * @returns {Array} Sorted array of earthquakes
 */
function sortByIntensityDesc(quakes) {
    return [...quakes].sort(function(a, b) {
        const maxA = a.maxInt || getMaxIntensity(a.int) || 0;
        const maxB = b.maxInt || getMaxIntensity(b.int) || 0;
        return maxB - maxA;
    });
}

/**
 * Count stations by intensity class
 * 震度階級別に観測点数をカウント
 * @param {Object} intData - Object with station names as keys and intensity values
 * @returns {Object} Object with intensity class as keys and count as values
 */
function countStationsByIntensity(intData) {
    const counts = {};
    
    for (const value of Object.values(intData)) {
        const classText = intensityToClassText(value);
        counts[classText] = (counts[classText] || 0) + 1;
    }
    
    return counts;
}

/**
 * Generate JMA earthquake database URL
 * 気象庁震度データベースURLを生成
 * @param {string} dbid - Database ID (e.g., "20241130095228")
 * @returns {string} Full URL to JMA seismic database
 */
function generateJmaDbUrl(dbid) {
    return 'https://www.data.jma.go.jp/svd/eqdb/data/shindo/index.html#' + dbid;
}

/**
 * Generate view page URL for a specific earthquake
 * 地震詳細ページのURLを生成
 * @param {string} sourceName - Source name (e.g., "202411")
 * @param {string|number} quakeId - Earthquake ID
 * @returns {string} View page URL
 */
function generateViewUrl(sourceName, quakeId) {
    return 'view.html#' + sourceName + '.' + quakeId;
}

/**
 * Clean station name by removing markers
 * 観測点名からマーカーを削除してクリーンにする
 * @param {string} stationName - Station name (e.g., "輪島市鳳至町＊")
 * @returns {string} Cleaned station name
 */
function cleanStationName(stationName) {
    return stationName
        .replace('＊', '')
        .replace(/\(旧[０１２３４５６７８９]*\)/, '');
}

/**
 * Calculate earthquake statistics for a list of earthquakes
 * 地震リストの統計を計算
 * @param {Array} quakes - Array of earthquake objects
 * @returns {Object} Statistics object
 */
function calculateEarthquakeStats(quakes) {
    if (!quakes || quakes.length === 0) {
        return {
            total: 0,
            maxIntensity: null,
            avgMagnitude: null,
            intensityDistribution: {}
        };
    }
    
    let totalMagnitude = 0;
    let magnitudeCount = 0;
    let maxInt = -Infinity;
    const intensityDistribution = {};
    
    for (const quake of quakes) {
        // Magnitude calculation
        if (quake.magnitude && quake.magnitude !== '-.-') {
            totalMagnitude += Number(quake.magnitude);
            magnitudeCount++;
        }
        
        // Max intensity
        const quakeMaxInt = quake.maxInt || getMaxIntensity(quake.int);
        if (quakeMaxInt !== null && quakeMaxInt > maxInt) {
            maxInt = quakeMaxInt;
        }
        
        // Intensity distribution
        if (quakeMaxInt !== null) {
            const classText = intensityToClassText(quakeMaxInt);
            intensityDistribution[classText] = (intensityDistribution[classText] || 0) + 1;
        }
    }
    
    return {
        total: quakes.length,
        maxIntensity: maxInt === -Infinity ? null : maxInt,
        avgMagnitude: magnitudeCount > 0 ? (totalMagnitude / magnitudeCount).toFixed(1) : null,
        intensityDistribution: intensityDistribution
    };
}
