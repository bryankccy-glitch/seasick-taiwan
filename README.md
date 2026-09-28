# SeaSick Taiwan

台灣港口與海域導向的暈船風險與最佳出海時間決策平台。使用者可依港口、活動、船型、出海時間與個人敏感度，取得可解釋的相對風險分數、主要影響因子與舒適時段建議。

- Live Demo（Vercel）：<https://seasick-taiwan.vercel.app/>
- Source / Portfolio：<https://github.com/bryankccy-glitch/seasick-taiwan>
- 正式分支：`main`
- 安全政策：[SECURITY.md](./SECURITY.md)

## 本機開發

需求：Node.js `>=22.13.0`

```sh
npm ci
npm run dev
```

正式建置與檢查：

```sh
npm run lint
npm run security:audit
npm run build
```

## 資料與隱私

- 現行 Vercel 版本沒有把秘密 API Key、帳號密碼或伺服器憑證寫入前端。
- 姓名、收藏與航海紀錄只存放在使用者自己的瀏覽器 `localStorage`，目前不會上傳到遠端伺服器。
- 網站目前展示的是可解釋的相對風險決策模型與示範資料，不是醫療診斷，也不能取代中央氣象署公告、航港單位指示或船長判斷。
- 若未來串接需要授權的海象 API，密鑰必須保存在伺服器端環境變數或 GitHub Secrets，前端只呼叫受控的後端代理端點。

## 版本紀錄與回復

每次完成修改都以 Git commit 保存。可從 GitHub 的 **Commits** 查看歷史、比較差異或回復指定版本。

```sh
git log --oneline
git show <commit-id>
git revert <commit-id>
```

建議使用 `git revert` 建立一筆可稽核的撤銷紀錄，不直接刪除既有歷史。正式網站由 Vercel 發布；GitHub 保留原始碼、變更紀錄與可回復的版本歷史。

## 專案範圍

- `app/`：SeaSick Taiwan 操作介面與樣式
- `components/ui/`：實際使用的互動元件
- `lib/ports.ts`：港口、航線與海域資料
- `lib/risk.ts`：可解釋風險權重與時間序列模型
- `lib/taiwan-map.ts`：台灣海岸與港口地圖資料
- `vercel.json`：Vercel 發布設定

## 安全原則

公開前端程式無法安全隱藏密鑰。請勿把 `.env`、Token、私鑰、資料庫連線字串或第三方 API 密鑰寫入 `app/`、`public/` 或任何 `NEXT_PUBLIC_*` 變數。詳細通報與處理方式請見 [SECURITY.md](./SECURITY.md)。
