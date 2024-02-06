# 計測震度データベース
気象庁が作成する[地震・火山月報（防災編）](https://www.data.jma.go.jp/eqev/data/gaikyo/index.html#monthly)のPDFから各地震の観測された計測震度のデータを抜き出したものを表示します。  
[震度データベース](https://www.data.jma.go.jp/svd/eqdb/data/shindo/)への移動や、[震度データベース](https://www.data.jma.go.jp/svd/eqdb/data/shindo/)のURLから地震を検索することができます。
> [!WARNING]  
> PDFからデータを抜き出しているため、情報の抜け落ちや、正確ではない情報が表示される場合があります。  
> このようなデータを確認した場合は[こちら](https://forms.gle/hewkCjRMcgYUGxmH6)か、Issuesから報告をいただけると幸いです。
## データ形式
ソース一覧JSONと月地震一覧JSONに分かれています。
### ソース一覧JSON (source.json)
月地震一覧JSONの一覧です。  
存在確認や、年月からファイルを探したり、[地震・火山月報（防災編）](https://www.data.jma.go.jp/eqev/data/gaikyo/index.html#monthly)のPDFのURLを確認するために使用しています。
```
[
    {
        "path": "202203.json",  #ファイルパス
        "name": "202203",  #ファイル名
        "year": "2022",  #年
        "month": "3",  #月
        "source": {  #出典
            "name": "2022年3月地震・火山月報(防災編)",  #ソース名
            "link": "https://www.data.jma.go.jp/eqev/data/gaikyo/monthly/202203/202203furoku_1.pdf"  #ソースURL
        }
    },
    ...
]
```
### 月地震一覧JSON (xxxxxx.json)
月の地震の一覧です。  
地震一覧や、地図に表示するときに使用しています。
```
[
    {
        "id": "1",  #地震番号
        "days": "1",  #日
        "hours": "07",  #時
        "minutes": "04",  #分
        "epicentername": "北海道東方沖",  #震央地名
        "latitude": "43°37.8’N",  #緯度
        "longitude": "147°48.0’E",  #経度
        "depth": "57km",  #深さ
        "magnitude": "5.1",  #マグニチュード (不明: -.-)
        "int": {
            "標津町北２条＊": "0.6",  #K=観測点名,V=計測震度
            ...
        },
        "dbid": "20220301070441"  #震度データベースのID(ハッシュ部分)
    },
    ...
]
```
## ライセンス
サイトはMITです  
- 地図表示 [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js)
- 地図スタイル [gsi-cyberjapan/gsivectortile-mapbox-gl-js](https://github.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js)
- スタイル [UIkit](https://github.com/uikit/uikit)
- 震度配色(強震モニタ) [ingen084/KyoshinShindoColorMap](https://github.com/ingen084/KyoshinShindoColorMap)をもとに作成, 防災科学技術研究所(NIED)
- 震度配色(気象庁) [気象庁](https://www.jma.go.jp/jma/index.html)をもとに作成
- 震度観測点データ [iku55/jma_int_stations](https://github.com/iku55/jma_int_stations)
- 月地震一覧JSON等 [気象庁](https://www.jma.go.jp/jma/index.html)