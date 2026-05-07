---
slug: swiper-tutorial
title: "Swiper 簡單應用：打造流暢的輪播效果"
date: 2026-04-21T06:36:44.094863+00:00
authors: [liwen]
tags: [React]
---

# Swiper 簡單應用

## 引用
```html
<!-- Swiper CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">

<!-- Swiper JS -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
```

## 基本 HTML 架構
```html
<div class="swiper">
    <!-- Additional required wrapper -->
    <div class="swiper-wrapper">
      <!-- Slides 輪播內容放這-->
        <div class="swiper-slide"></div>
        <div class="swiper-slide"></div>
        <div class="swiper-slide"></div>
        <div class="swiper-slide"></div>
        <div class="swiper-slide"></div>
    </div>
    
    <!-- If we need pagination 分頁點-->
    <div class="swiper-pagination"></div>

    <!-- If we need navigation buttons 左右按鈕 -->
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>

    <!-- If we need scrollbar 進度條-->
    <div class="swiper-scrollbar"></div>
</div>
```

## CSS
```css
.swiper-slide {
  height: auto;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## JavaScript
```javascript
const swiper = new Swiper(".swiper", {
  // 間距 24px
  spaceBetween: 24,
  pagination: {
    el: ".swiper-pagination"
  },
  // 左右箭頭
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  },
  // 一次呈現三個
  slidesPerView: 3,
  // 滾動條
  scrollbar: {
    el: ".swiper-scrollbar"
  },
  autoplay: true,

  // 響應式設定（類似 Bootstrap 的斷點）
  breakpoints: {
    // 0px 以上（手機）
    0: {
      slidesPerView: 1
    },
    // 768px 以上（平板）
    768: {
      slidesPerView: 2
    },
    // 992px 以上（桌機）
    992: {
      slidesPerView: 3
    }
  }
});
```
