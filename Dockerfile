# 多階段構建 - 依賴階段
FROM node:16-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 複製 package 文件
COPY package.json package-lock.json* ./
RUN npm ci

# 構建階段
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 構建 Next.js 應用
RUN npm run build

# 生產運行階段
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 自動複製輸出追蹤以縮減映像大小
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5000

ENV PORT 5000

CMD ["node", "server.js"]
