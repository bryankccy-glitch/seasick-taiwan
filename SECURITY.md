# Security Policy

## Supported version

僅 `main` 分支目前部署的最新版接受安全修正。

## Reporting a vulnerability

請不要在公開 Issue 貼出 API Key、Token、帳密、個資或可直接利用的攻擊細節。請透過 GitHub 的 **Security → Report a vulnerability** 私下回報；在確認與修補完成前不要公開揭露。

## Secret handling

- 所有秘密值只允許存在 GitHub Actions Secrets、Vercel Environment Variables 或受控後端環境變數。
- 不得將秘密值放入前端程式、`public/`、Git 歷史、建置產物或 `NEXT_PUBLIC_*` 變數。
- `.env*`、`.vercel/`、`*.pem`、本機輸出與暫存資料均由忽略規則排除。
- 若秘密值曾被提交，單純刪除檔案不足以處理；必須立即撤銷並輪替該憑證，再清理 Git 歷史。

## Current architecture

GitHub Pages 版本是純靜態網站，不持有伺服器端密鑰。瀏覽器只保存非敏感的偏好、收藏與使用者自行輸入的航海紀錄。未來若加入即時海象服務，應由後端代理驗證輸入、限制請求頻率、設定逾時與快取，並只回傳前端所需欄位。
