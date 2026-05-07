---
slug: react-router
title: "React Router 核心指南"
date: 2026-04-21T06:36:46.891526+00:00
authors: [liwen]
tags: [React, 技術]
---

## 核心組件介紹
- HashRouter：路由的容器。
- Routes：路由的「總機」，用來包裹所有的路徑設定。
- Route：定義單一對應關係，例如：/orders 對應到 OrderList 組件。
- Link：取代傳統的 `<a>` 標籤，點擊時不會重新整理網頁。
- useParams：用來抓取網址上的參數（例如：/order/A101 裡的 A101）。

## 完整範例說明
完整的模組化範例，分為三個檔案：佈局 (Layout)、路由表 (Router) 以及 主入口 (App)。
1. `Layout.js` (定義外殼與 Outlet)
這個檔案負責定義 `Header`、`Footer` 以及子頁面出現的位置。
```javascript
import React from 'react';
import &#123; Outlet, Link &#125; from 'react-router-dom';

const Layout = () => &#123;
  return (
    <div style=&#123;&#123; display: 'flex', flexDirection: 'column', minHeight: '100vh' &#125;&#125;>
      <header style=&#123;&#123; background: '#2c3e50', color: 'white', padding: '1rem' &#125;&#125;>
        <nav>
          <Link to="/" style=&#123;linkStyle&#125;>首頁</Link>
          <Link to="/product" style=&#123;linkStyle&#125;>產品</Link>
          <Link to="/about" style=&#123;linkStyle&#125;>關於</Link>
        </nav>
      </header>

      <main style=&#123;&#123; flex: 1, padding: '20px' &#125;&#125;>
        &#123;/* 💡 子頁面會被渲染在這裡 */&#125;
        <Outlet />
      </main>

      <footer style=&#123;&#123; textAlign: 'center', padding: '10px', background: '#eee' &#125;&#125;>
        ERP System © 2026
      </footer>
    </div>
  );
&#125;;

const linkStyle = &#123; color: 'white', marginRight: '15px', textDecoration: 'none' &#125;;

export default Layout;
```

2. `router.js` (路由設定檔)
用物件陣列來定義路徑關係。
```javascript
import React from 'react';
import Layout from './Layout';
// 假設這些組件都已經寫好了
const Home = () => <h3>🏠 歡迎回來</h3>;
const About = () => <h3>ℹ️ 關於我們</h3>;
const Product = () => <h3>📦 產品清單</h3>;

const routes = [
  &#123;
    path: "/",
    element: <Layout />, // 最外層的殼
    children: [
      &#123;
        index: true, // 預設路徑 (網址為 / 時)
        element: <Home />
      &#125;,
      &#123;
        path: "about",
        element: <About />
      &#125;,
      &#123;
        path: "product",
        element: <Product />
      &#125;,
      &#123;
        path: "*",
        element: <h3>🚫 找不到頁面</h3>
      &#125;
    ]
  &#125;
];

export default routes;
```

3. `App.js` (主進入點)
```javascript
import React from 'react';
import &#123; HashRouter, useRoutes &#125; from 'react-router-dom';
import routes from './router'; // 匯入剛剛的陣列

// 建立一個渲染路由的組件
function RenderRoutes() &#123;
  const element = useRoutes(routes); // 根據當前網址匹配 routes 陣列
  return element;
&#125;

function App() &#123;
  return (
    <HashRouter>
      <RenderRoutes />
    </HashRouter>
  );
&#125;

export default App;
```

## 常用的路由 Hooks
1. `useParams` (抓取變數)
用於從網址取得 ID（如：修改訂單、查看細節）。
```javascript
const &#123; id &#125; = useParams();
// 範例：網址是 /product/A001，則 id 為 "A001"
```
2. `useNavigate` (程式跳轉)
用於功能邏輯完成後跳轉頁面。
```javascript
const navigate = useNavigate();

const handleSave = () => &#123;
  // ... 存檔 API 邏輯
  navigate('/product'); // 存檔成功後自動回列表頁
&#125;;
```
2-1. 返回上一頁：當使用者在編輯頁點選「取消」時：
```javascript
navigate(-1);
```
2-2. 防止回到登入頁：登入成功跳轉到首頁時，使用 `replace: true` 覆蓋歷史紀錄，防止使用者按後退鍵又回到登入畫面：
```javascript
navigate("/", &#123; replace: true &#125;);
```
    
3. `useRoutes` (啟動路由)
在 App.js 中將陣列物件轉換為可渲染的組件。
```javascript
import &#123; useRoutes &#125; from 'react-router-dom';
import routes from './router';

function App() &#123;
  const element = useRoutes(routes);
  return element;
&#125;
```

## 進階實戰技巧
1. 麵包屑導航 (Breadcrumbs)
利用 `useLocation` 自動解析當前路徑，產生導覽路徑。這在層級很深的系統中非常實用。
```javascript
import &#123; useLocation, Link &#125; from 'react-router-dom';

const Breadcrumbs = () => &#123;
  const location = useLocation();
  // 將路徑拆解，例如 "/product/edit" -> ["product", "edit"]
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav style=&#123;&#123; marginBottom: '1rem', fontSize: '0.9rem', color: '#666' &#125;&#125;>
      <Link to="/">首頁</Link>
      &#123;pathnames.map((value, index) => &#123;
        const last = index === pathnames.length - 1;
        const to = `/$&#123;pathnames.slice(0, index + 1).join('/')&#125;`;

        return last ? (
          <span key=&#123;to&#125;> / &#123;value&#125;</span>
        ) : (
          <span key=&#123;to&#125;> / <Link to=&#123;to&#125;>&#123;value&#125;</Link></span>
        );
      &#125;)&#125;
    </nav>
  );
&#125;;
```
- 放置位置：建議放在 `Layout.js` 的 `<main>` 標籤內，並置於 `<Outlet />` 之上。

2. 路由守衛 (Private Route)
用於攔截未登入的使用者，防止直接透過網址進入。

建立守衛組件
```javascript
import &#123; Navigate &#125; from 'react-router-dom';

const PrivateRoute = (&#123; children &#125;) => &#123;
  // 實務上會從 localStorage 或 RTK 取得登入狀態
  const token = localStorage.getItem('erp_token'); 
  return token ? children : <Navigate to="/login" replace />;
&#125;;
```

在 `router.js` 中包裹需要權限的頁面
```javascript
&#123;
  path: "product",
  element: <PrivateRoute><Product /></PrivateRoute>
&#125;
```
