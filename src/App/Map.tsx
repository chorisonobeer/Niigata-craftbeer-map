/** 
 * /src/App/Map.tsx
 * 2025-05-02T10:00+09:00
 * 変更概要: Props型をShopData/EventData両対応に統一し、型エラー修正
 */

import React, { useCallback, useState, useEffect } from "react";
// @ts-ignore
import geojsonExtent from '@mapbox/geojson-extent';
import toGeoJson from './toGeoJson';
import setCluster from './setCluster';

// 共通プロパティ型
export type MapPointBase = {
  index: number;
  緯度: string;
  経度: string;
  [key: string]: any;
};

export type MapProps<T extends MapPointBase = MapPointBase> = {
  data: T[];
  selectedShop?: T;
  onSelectShop: (shop: T) => void;
  initialData?: T[];
  isEventMode?: boolean;
};

// 新潟県中心の座標（初期表示用フォールバック）
const NIIGATA_CENTER: [number, number] = [138.5, 37.9];
const DEFAULT_ZOOM = 8;

const CSS: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
};

const LOADER_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'rgba(255, 255, 255, 0.7)',
  padding: '5px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  zIndex: 1,
};

const hidePoiLayers = (map: any) => {
  const hideLayers = [
    'poi',
    'poi-primary',
    'poi-r0-r9',
    'poi-r10-r24',
    'poi-r25',
    'poi-bus',
    'poi-entrance',
  ];

  for (let i = 0; i < hideLayers.length; i++) {
    const layerId = hideLayers[i];
    map.setLayoutProperty(layerId, 'visibility', 'none');
  }
};

function Map<T extends MapPointBase = MapPointBase>(props: MapProps<T>) {
  const { onSelectShop } = props;
  const mapNode = React.useRef<HTMLDivElement>(null);
  const [mapObject, setMapObject] = React.useState<any>();
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [isLayerInitialized, setIsLayerInitialized] = useState(false);

  // マーカーを更新する関数（setData方式）
  const updateMarkers = useCallback((map: any, data: T[]) => {
    if (!map) return;
    setIsLoadingMarkers(true);
    const geojson = toGeoJson(data);
    if (map.getSource('shops') && isLayerInitialized) {
      map.getSource('shops').setData(geojson);
      setIsLoadingMarkers(false);
      return;
    }
    if (!map.getSource('shops')) {
      map.addSource('shops', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 25,
      });
    }
    if (!isLayerInitialized) {
      map.addLayer({
        id: 'shop-points',
        type: 'circle',
        source: 'shops',
        filter: ['all', ['==', '$type', 'Point']],
        paint: {
          'circle-radius': 13,
          'circle-color': '#FF0000', // TODO: カテゴリ色分けは必要に応じて拡張
          'circle-opacity': 0.4,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-opacity': 1,
        },
      });
      map.addLayer({
        id: 'shop-symbol',
        type: 'symbol',
        source: 'shops',
        filter: ['all', ['==', '$type', 'Point']],
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#FFFFFF',
          'text-halo-width': 2,
        },
        layout: {
          'text-field': "{スポット名}",
          'text-font': ['Noto Sans Regular'],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.5,
          'text-justify': 'auto',
          'text-size': 12,
          'text-anchor': 'top',
          'text-max-width': 12,
          'text-allow-overlap': false,
        },
      });
      const layers = ['shop-points', 'shop-symbol'];
      layers.forEach(layer => {
        map.on('mouseenter', layer, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layer, () => {
          map.getCanvas().style.cursor = '';
        });
        map.on('click', layer, (event: any) => {
          if (!event.features[0].properties.cluster) {
            onSelectShop(event.features[0].properties as T);
          }
        });
      });
      setCluster(map);
      setIsLayerInitialized(true);
    }
    setIsLoadingMarkers(false);
  }, [onSelectShop, isLayerInitialized]);

  useEffect(() => {
    if (!mapObject) return;
    updateMarkers(mapObject, props.data);
  }, [mapObject, props.data, updateMarkers]);

  useEffect(() => {
    if (!mapObject || props.data.length === 0) {
      return;
    }
    const geojson = toGeoJson(props.data);
    const bounds = geojsonExtent(geojson);
    if (bounds) {
      mapObject.fitBounds(bounds, {
        padding: 50
      });
    }
  }, [mapObject, props.data]);

  useEffect(() => {
    if (!mapObject || !props.selectedShop) {
      return;
    }
    const lat = parseFloat(props.selectedShop['緯度']);
    const lng = parseFloat(props.selectedShop['経度']);
    if (lat && lng) {
      mapObject.flyTo({
        center: [lng, lat],
        zoom: 17,
        essential: true
      });
    }
  }, [mapObject, props.selectedShop]);

  useEffect(() => {
    if (!mapNode.current || mapObject) {
      return;
    }
    // @ts-ignore
    const { geolonia } = window;
    const map = new geolonia.Map({
      container: mapNode.current,
      style: 'geolonia/basic',
      center: NIIGATA_CENTER,
      zoom: DEFAULT_ZOOM,
      interactive: true,
      trackResize: true,
    });
    const onMapLoad = () => {
      hidePoiLayers(map);
      setMapObject(map);
      try {
        const geolocateControl = new geolonia.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
            timeout: 2000,
            maximumAge: 0
          },
          trackUserLocation: true,
          showUserLocation: true
        });
        map.addControl(geolocateControl, 'top-right');
        setTimeout(() => {
          geolocateControl.trigger();
        }, 100);
        geolocateControl.on('error', () => {
          console.warn('位置情報の取得に失敗しましたが、地図は使用できます');
        });
      } catch (error) {
        console.warn('位置情報コントロールの初期化に失敗しましたが、地図は使用できます', error);
      }
    };
    const orientationChangeHandler = () => {
      map.resize();
    };
    map.on('load', onMapLoad);
    window.addEventListener('orientationchange', orientationChangeHandler);
    return () => {
      window.removeEventListener('orientationchange', orientationChangeHandler);
      map.off('load', onMapLoad);
    };
  }, [mapObject]);

  return (
    <div style={CSS}>
      {isLoadingMarkers && <div style={LOADER_STYLE}>マーカーを読み込み中...</div>}
      <div
        ref={mapNode}
        style={CSS}
        data-geolocate-control="off"
        data-marker="off"
        data-gesture-handling="on"
        data-loader="off"
      ></div>
    </div>
  );
}

export default Map;