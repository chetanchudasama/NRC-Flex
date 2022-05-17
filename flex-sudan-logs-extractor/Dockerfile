FROM node:14.15.1-alpine3.12
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY src ./src
RUN ls -a
RUN npm install
RUN npm run build

FROM node:14.15.1-alpine3.12
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json ./
COPY package-lock.json ./
RUN npm install --only=production
COPY --from=0 /usr/src/app/build ./build
ENTRYPOINT [ "node", "./build/index.js" ]
