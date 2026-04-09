# NPM Token 轮换记录

## 当前 Token

| 字段 | 值 |
|------|-----|
| 创建日期 | 2026-04-09 |
| 过期日期 | 2026-07-08 (90天后) |
| 类型 | Granular Access Token |
| 权限 | Publish: @chime-io/* |
| GitHub Secret | NPM_TOKEN |

## 轮换步骤

1. 访问 https://www.npmjs.com/settings/tokens
2. 点击 "Generate New Token" → "Granular Access Token"
3. 填写信息：
   - Name: `chime-io-ci-2026-q2`
   - Expiration: 90 days
   - Packages and Scopes: 选择 `@chime-io/*`
   - Permissions: Publish
4. 复制 token
5. 更新 GitHub Secret: https://github.com/35iter-cn/chime-io/settings/secrets/actions/NPM_TOKEN
6. 删除旧 token
7. 更新本文件日期

## 历史记录

- 2026-04-09: 首次创建
