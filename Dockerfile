# 使用 Node 20 官方镜像
FROM node:20-slim

# 安装 tsx
RUN npm install -g tsx

WORKDIR /app

# 复制依赖配置文件
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/package.json
COPY packages/server/package.json packages/server/package.json
COPY apps/web-console/package.json apps/web-console/package.json

# 安装依赖
RUN npm install

# 复制源码
COPY . .

# 编译 @dzg/core（server 需要在 node_modules 中引用其 dist/）
RUN cd packages/core && npx tsc --outDir dist --skipLibCheck && cd ../..

# 暴露端口
EXPOSE 4000

# 启动
CMD ["npx", "tsx", "packages/server/src/lite-main.ts"]
