# Cloverta's Homepage

> [!CAUTION]
> In development

<img width="1582" height="1035" alt="image" src="https://github.com/user-attachments/assets/f7f1178a-22ce-46bf-81d9-85b82804fdf5" />

## 本地开发

```sh
npm install
npm run dev -- --background
```

默认预览地址为 `http://localhost:4321`。后台服务管理：

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

构建静态网站：

```sh
npm run build
```

输出目录为 `dist/`。

## 博客文章列表

About 页面由浏览器在每次打开页面时读取 `https://blog.cloverta.top/en/rss.xml`，不在构建时抓取文章。列表按 RSS 的顺序展示标题和链接，读取失败时显示博客入口。

博客服务器或 CDN 必须为 `/en/rss.xml` 的响应添加以下响应头，允许主页和本地预览跨域读取此公开订阅：

```http
Access-Control-Allow-Origin: *
```

如果博客使用 Nginx，可在处理 RSS 的现有 `location` 配置中加入：

```nginx
add_header Access-Control-Allow-Origin "*" always;
```

配置生效后，如 CDN 已缓存 RSS，需刷新对应缓存，并确认实际返回上述响应头。仅修改主页代码无法解除浏览器的跨域限制。RSS 的更新延迟也取决于博客 CDN 的缓存策略。

