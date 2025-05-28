/* 
Full Path: /src/App.tsx
Last Modified: 2025-02-28 17:45:00
*/

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Papa from 'papaparse';
import { GeolocationProvider } from './context/GeolocationContext';
import Home from './App/Home';
import List from './App/List';
import Category from './App/Category';
import Images from './App/Images';
import AboutUs from './App/AboutUs';
import Events from './App/Events';
import Tabbar from './App/Tabbar';
import LazyMap from './App/LazyMap';
import config from "./config.json";
import './App.scss';

const App: React.FC = React.memo(() => {
  const [shopList, setShopList] = useState<Pwamap.ShopData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedShop, setSelectedShop] = useState<Pwamap.ShopData | undefined>(undefined);
  const [filteredShops, setFilteredShops] = useState<Pwamap.ShopData[]>([]);
  const location = useLocation();

  const sortShopList = useCallback((shopList: Pwamap.ShopData[]) => {
    return new Promise<Pwamap.ShopData[]>((resolve) => {
      const sortedList = shopList.sort((item1, item2) => {
        return Date.parse(item2['タイムスタンプ']) - Date.parse(item1['タイムスタンプ']);
      });
      resolve(sortedList);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const cacheKey = "shopListCache";
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setShopList(parsed);
        setLoading(false);
        // バックグラウンドで最新データ取得
        fetch(config.data_url)
          .then((response) => {
            if (!response.ok) throw new Error("データの取得に失敗しました");
            return response.text();
          })
          .then((data) => {
            Papa.parse(data, {
              header: true,
              complete: (results) => {
                const features = results.data;
                const nextShopList: Pwamap.ShopData[] = [];
                for (let i = 0; i < features.length; i++) {
                  const feature = features[i] as Pwamap.ShopData;
                  if (!feature['緯度'] || !feature['経度'] || !feature['スポット名']) continue;
                  if (!feature['緯度'].match(/^[0-9]+(\.[0-9]+)?$/)) continue;
                  if (!feature['経度'].match(/^[0-9]+(\.[0-9]+)?$/)) continue;
                  const shop = { index: i, ...feature };
                  nextShopList.push(shop);
                }
                sortShopList(nextShopList).then((sortedShopList) => {
                  if (JSON.stringify(parsed) !== JSON.stringify(sortedShopList)) {
                    setShopList(sortedShopList);
                    sessionStorage.setItem(cacheKey, JSON.stringify(sortedShopList));
                  }
                });
              },
              error: () => {
                setError("CSVパースエラー");
                setLoading(false);
              }
            });
          })
          .catch((e) => {
            setError(e.message);
            setLoading(false);
          });
        return;
      } catch (e) {
        // パース失敗時は通常フロー
      }
    }
    // キャッシュなし時は通常取得
    fetch(config.data_url)
      .then((response) => {
        if (!response.ok) throw new Error("データの取得に失敗しました");
        return response.text();
      })
      .then((data) => {
        Papa.parse(data, {
          header: true,
          complete: (results) => {
            const features = results.data;
            const nextShopList: Pwamap.ShopData[] = [];
            for (let i = 0; i < features.length; i++) {
              const feature = features[i] as Pwamap.ShopData;
              if (!feature['緯度'] || !feature['経度'] || !feature['スポット名']) continue;
              if (!feature['緯度'].match(/^[0-9]+(\.[0-9]+)?$/)) continue;
              if (!feature['経度'].match(/^[0-9]+(\.[0-9]+)?$/)) continue;
              const shop = { index: i, ...feature };
              nextShopList.push(shop);
            }
            sortShopList(nextShopList).then((sortedShopList) => {
              setShopList(sortedShopList);
              sessionStorage.setItem(cacheKey, JSON.stringify(sortedShopList));
              setLoading(false);
            });
          },
          error: () => {
            setError("CSVパースエラー");
            setLoading(false);
          }
        });
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [sortShopList]);

  // 店舗選択ハンドラ
  const handleSelectShop = useCallback((shop: Pwamap.ShopData) => {
    setSelectedShop(shop);
  }, []);

  // 検索結果を受け取るハンドラ
  const handleSearchResults = useCallback((results: Pwamap.ShopData[]) => {
    setFilteredShops(results);
  }, []);

  // データが更新されたときにフィルタリング結果も更新
  useEffect(() => {
    if (shopList.length > 0) {
      setFilteredShops(shopList);
    }
  }, [shopList]);

  // 永続化されたMapコンポーネント
  const persistentMap = useMemo(() => {
    const isHomePage = location.pathname === '/';
    return (
      <LazyMap 
        data={filteredShops} 
        selectedShop={selectedShop}
        onSelectShop={handleSelectShop}
        initialData={shopList}
        style={{ 
          display: isHomePage ? 'block' : 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'calc(100% - 50px)',
          zIndex: isHomePage ? 1 : -1,
          pointerEvents: isHomePage ? 'auto' : 'none'
        }}
      />
    );
  }, [filteredShops, selectedShop, handleSelectShop, shopList, location.pathname]);

  // メモ化されたルートコンポーネント
  const routes = useMemo(() => (
    <Routes>
      <Route path="/" element={
        <Home 
          data={shopList} 
          selectedShop={selectedShop}
          onSelectShop={handleSelectShop}
          onSearchResults={handleSearchResults}
        />
      } />
      <Route path="/list" element={<List data={shopList} />} />
      <Route path="/category" element={<Category data={shopList} />} />
      <Route path="/images" element={<Images data={shopList} />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/events" element={<Events />} />
    </Routes>
  ), [shopList, selectedShop, handleSelectShop, handleSearchResults]);

  if (loading) return <div className="app-loading">読み込み中...</div>;
  if (error) return <div className="app-error">{error}</div>;

  return (
    <GeolocationProvider>
      <div className="app">
        <div className="app-body">
          {routes}
        </div>
        {persistentMap}
        <div id="modal-root"></div>
        <div className="app-footer">
          <Tabbar />
        </div>
      </div>
    </GeolocationProvider>
  );
});

App.displayName = 'App';

export default App;
