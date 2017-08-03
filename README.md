![Cahat logo](https://cdn.rawgit.com/dgrcode/chat-back/master/cathat.svg)

# CAHAT
A distributed chat service


## How to use it

### Dependencies

To use cahat you need to have [Node](https://nodejs.org/en/), [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/en/docs/install) and [MongoDB](https://www.mongodb.com/download-center#community)


### Instructions

Once you have the dependencies installed, it should be really easy to get a server running.

**TL;DR**
```js
git clone https://github.com/dgrcode/chat-back.git
cd chat-back
npm install
npm start
```

**Detailed version**
The steps to follow are

1. Clone this repo. With a terminal, go to the folder where you want to keep your files, and then run this command:
    ```
    git clone https://github.com/dgrcode/chat-back.git
    ```

2. Install the project dependencies with the command:
    ```js
    // if you're using npm
    npm install

    // if you're using yarn
    yarn install
    ```
3. **[optional]** Create a `.env` file whit one or more of the following options:
    - **PORT**: is the port where the WebSocket server will be listening. It defaults to _4000_
    - **NAME**: is the name that the server will send to its clients. It defaults to _"No name"_

4. Run the database and the server. There is script can be used to check if your directory is ready to store the data, start the database, and run the server. You just have to run the command:
    ```js
    // if you're using npm
    npm start

    // if you're using yarn
    yarn install
    ```

5. At this point the server is running, but remember when stopping it to stop the database, which was running in a background process. To ease the process there is a script that does that. You just have to run:
    ```js
    // if you're using npm
    npm run kill

    // if you're using yarn
    yarn kill
    ```


## :no_entry: Disclaimer :no_entry:

This project doesn't implement any security measure. Therefore, **any data transmitted through this chat service could be compromised**


## Motivation

This project was created during my batch at the [Recurse Center](https://www.recurse.com). My main goal for doing this project was to learn about:
 - React
 - Redux
 - MongoDB
 - WebSockets
 - Node
 - Progressive Web Apps
 - React Native
 - WebRTC

## Work In Progress

So far this project implements the core functionalities of a chat, but eventually I'd like to add new features as:
 - Video chat
 - Private messaging
 - Maybe? A main backend service acting as DNS, and storing the relations between users and servers. WebSocket servers could voluntarily sign up into that main backend, or be kept in private
