---
slug: react-router
title: "React Router 核心指南"
date: 2026-04-21T06:36:46.891526+00:00
authors: [liwen]
tags: [React]
sidebar_label: "React Router 核心指南"

description: "核心組件介紹 HashRouter：路由的容器。 Routes：路由的「總機」，用來包裹所有的路徑設定。 Route：定義單一對應關係，例如：/orders 對應到 OrderList 組件。 Link：取代傳統的 標籤，點擊時不會重新整理網頁。 useParams：用來抓取網址上的參數（例如：/o..."
keywords: [React, Router, 核心指南, learning, hexschool, react-basics]
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
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: '#2c3e50', color: 'white', padding: '1rem' }}>
        <nav>
          <Link to="/" style={linkStyle}>首頁</Link>
          <Link to="/product" style={linkStyle}>產品</Link>
          <Link to="/about" style={linkStyle}>關於</Link>
        </nav>
      </header>

      <main style={{ flex: 1, padding: '20px' }}>
        {/* 💡 子頁面會被渲染在這裡 */}
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', padding: '10px', background: '#eee' }}>
        ERP System © 2026
      </footer>
    </div>
  );
};

const linkStyle = { color: 'white', marginRight: '15px', textDecoration: 'none' };

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
  {
    path: "/",
    element: <Layout />, // 最外層的殼
    children: [
      {
        index: true, // 預設路徑 (網址為 / 時)
        element: <Home />
      },
      {
        path: "about",
        element: <About />
      },
      {
        path: "product",
        element: <Product />
      },
      {
        path: "*",
        element: <h3>🚫 找不到頁面</h3>
      }
    ]
  }
];

export default routes;
```

3. `App.js` (主進入點)
```javascript
import React from 'react';
import { HashRouter, useRoutes } from 'react-router-dom';
import routes from './router'; // 匯入剛剛的陣列

// 建立一個渲染路由的組件
function RenderRoutes() {
  const element = useRoutes(routes); // 根據當前網址匹配 routes 陣列
  return element;
}

function App() {
  return (
    <HashRouter>
      <RenderRoutes />
    </HashRouter>
  );
}

export default App;
```

## 常用的路由 Hooks
1. `useParams` (抓取變數)
用於從網址取得 ID（如：修改訂單、查看細節）。
```javascript
const { id } = useParams();
// 範例：網址是 /product/A001，則 id 為 "A001"
```
2. `useNavigate` (程式跳轉)
用於功能邏輯完成後跳轉頁面。
```javascript
const navigate = useNavigate();

const handleSave = () => {
  // ... 存檔 API 邏輯
  navigate('/product'); // 存檔成功後自動回列表頁
};
```
2-1. 返回上一頁：當使用者在編輯頁點選「取消」時：
```javascript
navigate(-1);
```
2-2. 防止回到登入頁：登入成功跳轉到首頁時，使用 `replace: true` 覆蓋歷史紀錄，防止使用者按後退鍵又回到登入畫面：
```javascript
navigate("/", { replace: true });
```
    
3. `useRoutes` (啟動路由)
在 App.js 中將陣列物件轉換為可渲染的組件。
```javascript
import { useRoutes } from 'react-router-dom';
import routes from './router';

function App() {
  const element = useRoutes(routes);
  return element;
}
```

## 進階實戰技巧
1. 麵包屑導航 (Breadcrumbs)
利用 `useLocation` 自動解析當前路徑，產生導覽路徑。這在層級很深的系統中非常實用。
```javascript
import { useLocation, Link } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  // 將路徑拆解，例如 "/product/edit" -> ["product", "edit"]
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
      <Link to="/">首頁</Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return last ? (
          <span key={to}> / {value}</span>
        ) : (
          <span key={to}> / <Link to={to}>{value}</Link></span>
        );
      })}
    </nav>
  );
};
```
- 放置位置：建議放在 `Layout.js` 的 `<main>` 標籤內，並置於 `<Outlet />` 之上。

2. 路由守衛 (Private Route)
用於攔截未登入的使用者，防止直接透過網址進入。

建立守衛組件
```javascript
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // 實務上會從 localStorage 或 RTK 取得登入狀態
  const token = localStorage.getItem('erp_token'); 
  return token ? children : <Navigate to="/login" replace />;
};
```

在 `router.js` 中包裹需要權限的頁面
```javascript
{
  path: "product",
  element: <PrivateRoute><Product /></PrivateRoute>
}
```