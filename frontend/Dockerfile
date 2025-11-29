FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps && npm install ajv@8 ajv-keywords@5 --legacy-peer-deps

COPY . .

EXPOSE 3000

ENV CI=true
ENV WDS_SOCKET_PORT=0

CMD ["npm", "start"]