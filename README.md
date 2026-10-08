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

## 手动部署到服务器

工作流位于 `.github/workflows/deploy.yml`，在 GitHub 手动运行后会安装依赖、构建网站，再通过 SSH + rsync 将 `dist/` 内的文件上传到服务器的网站目录。构建失败时不会开始上传；同一时间仅执行一个部署，已开始的部署会先完成。

在仓库的 **Settings → Secrets and variables → Actions** 中配置：

| 类型 | 名称 | 内容 |
| --- | --- | --- |
| Variable | `DEPLOY_HOST` | 服务器域名或 IPv4 地址 |
| Variable | `DEPLOY_PORT` | SSH 端口；不设置时使用 `22` |
| Variable | `DEPLOY_USER` | SSH 登录用户名，例如 `deploy` |
| Variable | `DEPLOY_PATH` | 网站根目录的绝对路径，例如 `/var/www/cloverta-homepage`；支持字母、数字、点、下划线、横线和斜杠 |
| Secret | `DEPLOY_SSH_KEY` | 用于部署的完整 SSH 私钥，包含头尾两行，且没有密码口令 |
| Secret | `DEPLOY_KNOWN_HOSTS` | 已核对的服务器 SSH 主机公钥记录，即 `known_hosts` 对应行；可包含多行 |
| Variable（可选） | `PUBLIC_HELLOFONT_CSS_URL` | 额外字体的公开 CSS 地址；未设置时使用网站现有字体 |

服务器需要安装 `rsync`，该登录用户需要能创建并写入 `DEPLOY_PATH`。把部署私钥对应的公钥加入该用户的 `~/.ssh/authorized_keys`，并将 Web 服务器的网站根目录设为 `DEPLOY_PATH`。服务器只需提供静态文件，无需安装 Node.js。

主机公钥记录可从已确认过连接的本机 `~/.ssh/known_hosts` 复制，或通过以下命令获取，并与服务器控制台显示的 SSH 主机公钥指纹核对后填入 `DEPLOY_KNOWN_HOSTS`：

```sh
ssh-keyscan -p 22 your-server.example.com
```

使用自定义 SSH 端口时，将上面的 `22` 改为实际端口；保留扫描结果中的 `[主机]:端口` 格式。

将工作流提交并推送至仓库默认分支后，在 **Actions → Build and deploy → Run workflow** 选择要部署的分支并运行。工作流会覆盖网站目录中的同名文件，保留其他文件与旧静态资源，兼容已打开的页面和服务器已有文件。上传使用延迟替换，传输过程中会先保留旧文件，文件传输完成后再替换。本项目无需重启 Web 服务器。

相关说明：[GitHub 手动运行工作流](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)。

## About 页面

`/about/` 可直接访问，正文与样式位于 `src/components/About.astro`，使用本地 Josefin Slab Light 字体；许可证保存在 `public/fonts/JosefinSlab-OFL.txt`。

主页与 About 共用 `Portfolio.astro` 和 `Backgrounds.astro`。About 正文进入时整体从下方滑入，返回时整体向下滑出；两个方向共用同一条 800ms 动画，与标题移动时长一致，以相反方向播放，快速往返时也会从当前位置反向移动。`src/scripts/portfolio.ts` 控制标题、箭头、主页部件与背景的位置动画；背景文字连同渐变区域从桌面主页的 25%–50% 滑至 75%–100%，返回时沿原路径倒放。手机主页已经使用 75%–100% 的背景范围，切换时保持该范围。浏览器前进、后退也会同步页面状态。系统开启减少动态效果时直接切换页面，并停止返回箭头跳跃。
