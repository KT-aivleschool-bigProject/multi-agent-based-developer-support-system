FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build   # dist/

FROM node:20-alpine
RUN npm i -g serve
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["serve","-s","dist","-l","8080"]
