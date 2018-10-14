# Shopping List

Easy to use shopping list with web-sockets, see real-time changes as users add new items or check items off.

Includes a dark-mode (long press the title)

Multiple rooms can be created, enter any slug to create a new room with that name. e.g. `http://localhost:9500/my-new-room`

## Uses

 - ExpressJS
 - MongoDB
 - Socket.IO
 - jQuery
 - Bootstrap 4

## Run with Node

##### Needs a mongo server running

```
git clone https://github.com/beschoenen/shopping-list.git
cd shopping-list
npm install
npm start
```

## Run with Docker

##### Needs a mongo server (or container) running

```
docker pull beschoenen/shopping-list
docker run --name "Shopping List" beschoenen/shopping-list
```
