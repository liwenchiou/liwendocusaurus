---
slug: react-cdn-usage
title: "直接在 HTML 中使用 React (CDN 版)"
date: 2026-04-21T06:36:45.243399+00:00
authors: [liwen]
tags: [React, 技術]
---

# 直接在 HTML 中使用 React
1. 在 `<head>` 中引入 CDN
```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

2. `<body>` 中加入 `root`
```html
<div id="root"></div>
```

3. 在 `</body>` 前增加 `<script></script>` 區塊
```html
<script type="text/babel">
    // React 邏輯寫在這裡
</script>
```

4. 在 script 中快樂的寫 React
```html
<script type="text/babel">
    const { useState } = React;

    function MyComponent() {
        const [status, setStatus] = useState("正在學習 React");

        return (
            <div>
                <h1>狀態：{status}</h1>
                <button onClick={() => setStatus("已經學會了！")}>
                    點我更新
                </button>
            </div>
        );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<MyComponent />);
</script>
```
