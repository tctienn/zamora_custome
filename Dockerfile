FROM node:lts-alpine as build
WORKDIR /app

# Set NODE_OPTIONS globally
ENV NODE_OPTIONS="--max-old-space-size=8192"

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run type-check
RUN npm run build-only

FROM nginx:stable-perl as production-stage
WORKDIR /app
COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
