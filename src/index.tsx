import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from "react-router-dom";
import Container from './Container';
import './index.scss'
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// アプリ終了時にイベントキャッシュを削除
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('eventListCache');
});

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Container />
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorkerRegistration.register();
