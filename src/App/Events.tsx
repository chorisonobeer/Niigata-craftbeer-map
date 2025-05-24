/** 
 * /src/App/Events.tsx
 * 2025-05-02T10:00+09:00
 * 変更概要: 新規追加 - イベント一覧・詳細ページ
 */

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import config from "../config.json";
import "./Events.scss";
import Map from "./Map";

type EventData = Pwamap.EventData;

const Events: React.FC = () => {
  const [eventList, setEventList] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(config.event_data_url)
      .then((response) => {
        if (!response.ok) throw new Error("イベントデータの取得に失敗しました");
        return response.text();
      })
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            const features = results.data as EventData[];
            console.log("Parsed CSV data:", features); // ★追加
            const nextEventList: EventData[] = [];
            for (let i = 0; i < features.length; i++) {
              const feature = features[i];
              if (!feature["イベント名"] || !feature["開催期間"]) continue;
              const event = { index: i, ...feature };
              nextEventList.push(event);
            }
            setEventList(nextEventList);
            setLoading(false);
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
  }, []);

  const showEventDetail = (event: EventData) => {
    setSelectedEvent(event);
  };

  const closeDetail = () => {
    setSelectedEvent(undefined);
  };

  if (loading) return <div className="events-loading">読み込み中...</div>;
  if (error) return <div className="events-error">{error}</div>;

  return (
    <div className="events-page">
      <h1 className="events-title">イベント一覧</h1>
      <div className="events-list">
        {eventList.length === 0 && <div>イベント情報がありません</div>}
        {eventList.map((event) => (
          <div key={event.index} className="event-card" onClick={() => showEventDetail(event)}>
            <div className="event-card-header">
              <span className="event-name">{event["イベント名"]}</span>
              <span className="event-date">{event["開催期間"]}</span>
            </div>
            <div className="event-place">{event["場所"]}</div>
            <div className="event-description">{event["説明文"]?.slice(0, 60)}...</div>
          </div>
        ))}
      </div>
      {selectedEvent && (
        <div className="event-detail-modal" onClick={closeDetail}>
          <div className="event-detail" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDetail}>×</button>
            <h2>{selectedEvent["イベント名"]}</h2>
            <div className="event-detail-date">{selectedEvent["開催期間"]}</div>
            <div className="event-detail-place">場所: {selectedEvent["場所"] && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent["場所"] as string)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1976d2', fontWeight: 'bold', textDecoration: 'underline' }}
              >{selectedEvent["場所"]}</a>
            )}</div>
            <div className="event-detail-time">開催時間： {selectedEvent["開始/終了時間"]}</div>
            <div className="event-detail-description">{selectedEvent["説明文"]}</div>
            {/* 公式サイト・SNSリンク（説明文の下に追加） */}
            <div className="event-detail-links" style={{ display: 'flex', gap: '16px', margin: '12px 0' }}>
              {selectedEvent["公式サイト"] && (
                <a href={selectedEvent["公式サイト"]} target="_blank" rel="noopener noreferrer" title="公式サイト">
                  <i className="fa fa-home" style={{ fontSize: '22px', color: '#1976d2' }}></i>
                </a>
              )}
              {selectedEvent["Instagram"] && (
                <a href={selectedEvent["Instagram"]} target="_blank" rel="noopener noreferrer" title="Instagram">
                  <i className="fab fa-instagram" style={{ fontSize: '22px', color: '#C13584' }}></i>
                </a>
              )}
              {selectedEvent["Facebook"] && (
                <a href={selectedEvent["Facebook"]} target="_blank" rel="noopener noreferrer" title="Facebook">
                  <i className="fab fa-facebook" style={{ fontSize: '22px', color: '#1877f3' }}></i>
                </a>
              )}
              {selectedEvent["X"] && (
                <a href={selectedEvent["X"]} target="_blank" rel="noopener noreferrer" title="X (旧Twitter)">
                  <i className="fab fa-x-twitter" style={{ fontSize: '22px', color: '#000' }}></i>
                </a>
              )}
            </div>
            <div className="event-detail-organizer">主催: {selectedEvent["主催者名"]}</div>
            <div className="event-detail-tags">タグ: {selectedEvent["タグ"]}</div>
            <div className="event-detail-images">
              {[1,2,3,4,5,6].map(n => {
                const url = selectedEvent[`画像URL${n}` as keyof EventData] as string | undefined;
                return url ? (
                  <img
                    key={n}
                    src={url}
                    alt={`イベント画像${n}`}
                    onClick={() => setImageModalUrl(url)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : null;
              })}
            </div>
            {imageModalUrl && (
              <div className="image-modal" onClick={() => setImageModalUrl(null)}>
                <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                  <img src={imageModalUrl} alt="拡大画像" />
                </div>
              </div>
            )}
            {selectedEvent["緯度"] && selectedEvent["経度"] && (
              <div className="event-detail-map" style={{width: '100%', height: '200px', marginTop: '16px'}}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent["緯度"]},${selectedEvent["経度"]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-route-link"
                  style={{ display: 'block', marginBottom: '8px', color: '#1976d2', fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center' }}
                >ここまでのルート</a>
                <Map
                  data={[{
                    ...selectedEvent,
                    緯度: selectedEvent["緯度"],
                    経度: selectedEvent["経度"],
                    index: selectedEvent.index
                  }]}
                  selectedShop={undefined}
                  onSelectShop={() => {}}
                  isEventMode={true}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;