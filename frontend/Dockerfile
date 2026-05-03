FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
RUN rm -rf node_modules package-lock.json && npm install --legacy-peer-deps --os=linux --cpu=x64 --libc=musl
COPY . .
RUN npm install @rollup/rollup-linux-x64-musl --save-optional --legacy-peer-deps && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
