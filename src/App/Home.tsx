/* 
Full Path: /src/App/Home.tsx
Last Modified: 2025-03-19 17:30:00
*/

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import LazyMap from './LazyMap';
import Shop from './Shop';
import SearchFeature from './SearchFeature';
import './Home.scss';

type HomeProps = {
  data: Pwamap.ShopData[];
};

const Home: React.FC<HomeProps> = React.memo((props) => {
  const [selectedShop, setSelectedShop] = useState<Pwamap.ShopData | undefined>(undefined);
  const [filteredShops, setFilteredShops] = useState<Pwamap.ShopData[]>([]);

  // 親コンポーネントからのデータを設定（メモ化）
  const memoizedData = useMemo(() => props.data, [props.data]);
  
  useEffect(() => {
    if (memoizedData.length > 0) {
      setFilteredShops(memoizedData);
    }
  }, [memoizedData]);

  // 検索結果を受け取るハンドラ
  const handleSearchResults = useCallback((results: Pwamap.ShopData[]) => {
    setFilteredShops(results);
  }, []);

  // 店舗選択ハンドラ
  const handleSelectShop = useCallback((shop: Pwamap.ShopData) => {
    setSelectedShop(shop);
  }, []);

  // Shop閉じる処理
  const handleCloseShop = useCallback(() => {
    setSelectedShop(undefined);
  }, []);

  // メモ化されたコンポーネント
  const searchFeature = useMemo(() => (
    <SearchFeature 
      data={memoizedData}
      onSelectShop={handleSelectShop}
      onSearchResults={handleSearchResults}
    />
  ), [memoizedData, handleSelectShop, handleSearchResults]);

  const lazyMap = useMemo(() => (
    <LazyMap 
      data={filteredShops} 
      selectedShop={selectedShop}
      onSelectShop={handleSelectShop}
      initialData={memoizedData}
    />
  ), [filteredShops, selectedShop, handleSelectShop, memoizedData]);

  const shopModal = useMemo(() => {
    if (!selectedShop) return null;
    return ReactDOM.createPortal(
      <Shop shop={selectedShop} close={handleCloseShop} />,
      document.getElementById('modal-root') as HTMLElement
    );
  }, [selectedShop, handleCloseShop]);

  return (
    <div className="home">
      {searchFeature}
      {lazyMap}
      {shopModal}
    </div>
  );
});

Home.displayName = 'Home';

export default Home;