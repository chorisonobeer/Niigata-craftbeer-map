/** 
 * /src/App/LazyMap.tsx
 * 2025-01-20T10:00+09:00
 * 変更概要: 新規追加 - 地図コンポーネントの遅延読み込み対応
 */

import React, { Suspense } from 'react';
import { MapProps, MapPointBase } from './Map';

// 地図コンポーネントを遅延読み込み
const Map = React.lazy(() => import('./Map'));

// ローディング用のスケルトンコンポーネント
const MapSkeleton: React.FC = () => (
  <div 
    style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      minHeight: '400px'
    }}
  >
    <div 
      style={{
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}
    >
      <div 
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 10px'
        }}
      />
      地図を読み込み中...
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// 遅延読み込み対応のMapコンポーネント
function LazyMap<T extends MapPointBase = MapPointBase>(props: MapProps<T>) {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <Map {...props} />
    </Suspense>
  );
}

export default LazyMap;
export type { MapProps, MapPointBase };