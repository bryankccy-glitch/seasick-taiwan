# SeaSick Taiwan

台灣港口與海域導向的暈船風險與最佳出海時間決策平台。使用者可依港口、活動、船型、出海時間與個人敏感度，取得可解釋的相對風險分數、主要影響因子與舒適時段建議。

- Website（Vercel）：<https://seasick-taiwan-github.vercel.app/>
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
npm run typecheck
npm test
npm run security:audit
npm run build
```

## 最新整合功能

- 台灣 13 個港口的互動地圖、搜尋與港口／海域對應。
- Open-Meteo 24h／72h 海況預報、即時刷新狀態與最佳出海時點。
- 可解釋的暈船相對風險分數、波高／風速／週期與個人航程條件。
- SeaSick AI 可依目前或問題中指定的港口、日期、預報時段與個人條件回答，並支援跨港比較；付費模型不可用時仍有規則式免費解讀。
- 結果曲線可切換暈船風險、浪高與風速；資料與互動狀態皆保留缺值，不用展示數值補齊。
- 深海／晨光雙主題、中英切換、收藏港口與航海紀錄。
- Supabase 姓名＋密碼註冊／登入；名稱正規化後不可重複。
- 收藏、航海紀錄、語言與最後港口依使用者帳號同步。

## 資料與隱私

- Supabase URL、secret key 與登入簽章密鑰只存在 Vercel 伺服器環境變數，不會進入前端 bundle 或 Git。
- 密碼只保存 bcrypt 雜湊，不保存或回傳明文；Session 使用 `HttpOnly`、`SameSite=Lax`、正式環境 `Secure` Cookie。
- 收藏港口、航海紀錄、語言與最後港口存放在 Supabase，並以伺服器驗證的使用者 ID 隔離。
- Supabase 表格啟用 RLS，`anon` 與 `authenticated` 沒有直接讀寫權限；只有後端 `service_role` 能呼叫受控 RPC。
- 24h / 72h 海況來自 Open-Meteo 公開預報 API；缺漏與失敗不使用模擬資料補值。暈船分數是本站依預報與航程計算的相對指數，不是官方指數或機率。
- 任何需要授權的 API 密鑰都必須留在伺服器端環境變數；前端只呼叫受控的後端端點。

## 帳號與 Supabase

- `/api/auth/register`：建立唯一姓名帳號並寫入密碼雜湊與初始狀態。
- `/api/auth/login`、`/api/auth/logout`、`/api/auth/me`：登入、登出與 Session 驗證。
- `/api/state`：同步收藏、航海紀錄與偏好設定。
- `supabase/migrations/`：帳號、狀態、使用事件、RLS 與原子 RPC schema。
- 伺服器需要 `SUPABASE_URL`、`SUPABASE_SECRET_KEY`、`AUTH_SECRET`；不得使用 `NEXT_PUBLIC_*` 保存秘密值。

## 海況 API

- `/api/marine` 在伺服器端取得海況與風場，快取 10 分鐘。
- 核心值會經單位、連續 72 小時時間軸與合理範圍檢查；不合理或不完整資料直接標示無法取得。
- 目前支援地圖上已有座標的 13 個港口；其他港口顯示無預報。潮汐與信心百分比尚無資料。
- Open-Meteo 免費端點限非商業用途；商業營運需使用付費方案。
- 此 API 需要 Next.js 伺服器，請部署至 Vercel；GitHub Pages 無法提供動態 API。
- GitHub 保存正式 `main` 原始碼與版本紀錄；公開站由 Vercel 執行 Next.js server routes。
- 資料處理與缺值策略見 [docs/marine-forecast.md](docs/marine-forecast.md)。

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
- `components/auth-screen.tsx`：登入／註冊介面
- `lib/ports.ts`：港口、航線與海域資料
- `lib/risk.ts`：可解釋風險權重與時間序列模型
- `lib/ocean-assistant*.ts`：結構化海況 context、免費規則解讀與安全的模型提示詞
- `lib/taiwan-map.ts`：台灣海岸與港口地圖資料
- `lib/server/`：Session、Supabase 存取、安全檢查與狀態驗證
- `supabase/migrations/`：資料表、RLS 與 RPC migration
- `vercel.json`：Vercel 發布設定

## 安全原則

公開前端程式無法安全隱藏密鑰。請勿把 `.env`、Token、私鑰、資料庫連線字串或第三方 API 密鑰寫入 `app/`、`public/` 或任何 `NEXT_PUBLIC_*` 變數。詳細通報與處理方式請見 [SECURITY.md](./SECURITY.md)。
