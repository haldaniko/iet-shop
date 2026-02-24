FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Build Next.js app
RUN npm run build

# Next.js runs on port 3000 by default
EXPOSE 3000

CMD ["npm", "run", "start"]
