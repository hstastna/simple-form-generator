FROM node:24-alpine
LABEL service="form-generator"
WORKDIR /simple-form-generator
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && chown -R node:node .next
USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
