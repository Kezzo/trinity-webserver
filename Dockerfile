FROM node:9.11.1-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3075
CMD ["npm", "start"]
