FROM node:24-alpine
WORKDIR /simple-form-generator
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
