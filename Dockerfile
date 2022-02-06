from node:16.09.0-0ubuntu1
workdir /usr/src/app
add package.json /usr/src/app/package.json
run npm install
add . /usr/src/app
expose 8080
CMD ["npm", "run", "start"]

