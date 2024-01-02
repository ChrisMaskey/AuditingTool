#stage 1
FROM node:20-alpine as node
WORKDIR /app
COPY . .
RUN npm install --force
CMD ["npm", "run", "build"]

#stage 2
FROM nginx:alpine
ARG name
COPY --from=node /app/dist/auditing-tool/browser /usr/share/nginx/html