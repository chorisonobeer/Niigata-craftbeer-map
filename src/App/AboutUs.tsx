/** 
 * /src/App/AboutUs.tsx
 * 2025-05-02T10:00+09:00
 * 変更概要: 新潟クラフトビールマップ向けに全面リライト
 */
import React, { useEffect, useState } from 'react';
import './AboutUs.scss';
import config from '../config.json';
import { FaPlus } from 'react-icons/fa';

// スポンサー企業情報の型定義
type Sponsor = {
  name: string;
  imageUrl: string;
  linkUrl: string;
};

// スポンサー企業のダミーデータ
const sponsors: Sponsor[] = [
  { name: 'ダミースポンサー1', imageUrl: '/sponsors/dummy1.png', linkUrl: '#' },
  { name: 'ダミースポンサー2', imageUrl: '/sponsors/dummy2.png', linkUrl: '#' },
  { name: 'ダミースポンサー3', imageUrl: '/sponsors/dummy3.png', linkUrl: '#' },
  { name: 'ダミースポンサー4', imageUrl: '/sponsors/dummy4.png', linkUrl: '#' },
  { name: 'ダミースポンサー5', imageUrl: '/sponsors/dummy5.png', linkUrl: '#' },
  { name: 'ダミースポンサー6', imageUrl: '/sponsors/dummy6.png', linkUrl: '#' },
];

const Content = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const clickHandler = () => {
    if (config.form_url) {
      window.location.href = config.form_url;
    }
  };

  return (
    <div className="about-us">
      <div className={`hero-image ${isVisible ? 'visible' : ''}`}> 
        <div className="hero-content">
          <h1>NIIGATA CRAFT BEER MAP</h1>
          <p>新潟のクラフトビールを、もっと身近に、もっと楽しく。</p>
          <img src="/dummy-hero.jpg" alt="新潟クラフトビールイメージ" style={{width: '100%', maxWidth: 480, margin: '24px auto 0', borderRadius: 12}} />
        </div>
      </div>
      <div className="container">
        <h2>このマップについて</h2>
        <p>
          「NIIGATA CRAFT BEER MAP」は、新潟県内のクラフトビールが飲めるお店・買えるお店を一目で探せるデジタルマップです。<br />
          新潟の豊かな自然と職人の情熱が生み出すクラフトビールの魅力を、もっと多くの人に知ってほしい。<br />
          そんな想いからこのマップは生まれました。
        </p>
        <p>
          <strong>どこで飲める？どこで買える？</strong>——そんな疑問をすぐに解決！<br />
          地元の方も、観光で訪れた方も、新潟のクラフトビールを気軽に楽しめるお店やショップを簡単に見つけられます。
        </p>
        <p>
          新潟のクラフトビール文化を、みんなで盛り上げましょう！
        </p>

        <h2>マップの使い方</h2>
        <p>このマップでは以下の方法でお店やショップを探せます：</p>
        <ul>
          <li><strong>ホーム画面</strong>：地図上でビアバーや販売店の位置を確認。マーカーをタップすると詳細が表示されます。</li>
          <li><strong>一覧画面</strong>：すべてのお店・ショップをリスト形式で表示。現在地からの距離順にも並びます。</li>
          <li><strong>写真から探す</strong>：お店やビールの写真を一覧でチェック。気になる写真から詳細へ。</li>
          <li><strong>検索機能</strong>：キーワードやカテゴリで絞り込み検索が可能です。</li>
        </ul>
        <p>
          各店舗ページでは、営業時間、定休日、住所、写真、取扱ビールの情報などを確認できます。
          また、電話や公式サイトへのリンクから直接問い合わせ・予約も可能です。
        </p>

        <h2>スポンサー</h2>
        <p>本マップは以下のスポンサー様のご支援により運営されています。</p>
        <div className="sponsors-grid">
          {sponsors.map((sponsor, index) => (
            <div key={index} className="sponsor-item">
              <a href={sponsor.linkUrl} target="_blank" rel="noopener noreferrer">
                <img 
                  src={sponsor.imageUrl} 
                  alt={sponsor.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/sponsors/placeholder.png';
                  }}
                />
                <span className="sponsor-name">{sponsor.name}</span>
              </a>
            </div>
          ))}
        </div>

        <h2>運営メッセージ</h2>
        <p>
          新潟のクラフトビールを愛するすべての人へ。<br />
          このマップが、あなたの「新しい一杯」との出会いのきっかけになれば幸いです。<br />
          みんなで新潟のクラフトビール文化を盛り上げていきましょう！
        </p>

        {config.form_url ? (
          <>
            <h2>掲載・データ更新について</h2>
            <p>掲載情報の追加・修正をご希望の方は、下の「 + 」ボタンからフォームにご入力ください。</p>
            <div className="goto-form">
              <button>
                <FaPlus color="#FFFFFF" onClick={clickHandler} />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Content;