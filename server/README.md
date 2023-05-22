will need typescript, ts_node
# Locally in your project.
npm install -D typescript
npm install -D ts-node
# Or globally with TypeScript.
npm install -g typescript
npm install -g ts-node
# Depending on configuration, you may also need these
npm install -D tslib @types/node

```generate a tsconfig.json via the command line?
tsc --init

```install socket.io for websocket, and uuid for generate unique id for each client.
npm install uuid socket.io express

```install types as a save dev for the uuid. socket.io already come with it
npm install --save-dev @types/uuid @types/express

```to run the server 
nodemon