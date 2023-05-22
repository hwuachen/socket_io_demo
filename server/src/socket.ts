import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import { callbackify } from 'util';
import { v4 } from 'uuid';

export class ServerSocket {
    //access this socket through static instance.
    public static instance: ServerSocket;
    public io: Server;

    /** Master list of all connected users.
     * A dictionary:
     * key: user id as as a string
     * value: string value socket id which socket io needs to send message to correct clients  */
    public users: { [uid: string]: string };

    //Singleton
    constructor(server: HttpServer) {
        ServerSocket.instance = this;
        this.users = {};
        this.io = new Server(server, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                /**TODO: worry about security later*/ origin: '*'
            }
        });

        // 'connect' Event handler to inject Socket functions
        this.io.on('connect', this.StartListeners);        
        console.info('Socket IO started.');
    }

    /**Create start listeners to handle events for sockets such as send handshake from client */
    StartListeners = (socket: Socket) => {
        console.info('Message socket id received from ' + socket.id);

        /**custom handshakes with frontend here*/
        socket.on('handshake', (callback: (uid: string, users: string[]) => void) => {
            console.info('Handshake received from' + socket.id);

            /**check if this is a reconnection */
            const reconnected = Object.values(this.users).includes(socket.id);

            if (reconnected)
            {
                console.info('This user gas reconnected.')
                const uid = this.GetUidFromSocketId(socket.id);
                const users = Object.values(this.users);

                if (uid){
                    console.info('Sending callback for reconnect ...');
                    callback(uid, users);

                    return;
                }
            }

            /**Generate new user */
            const uid = v4();
            this.users[uid] = socket.id;
            const users = Object.values(this.users);

            console.info('Sending callback for handshake ...');
            callback(uid, users);

            /**Send new users to all connected users */
            this.SendMessage(
                'user_connected',
                users.filter((id) => id !== socket.id), 
                users
            );
        });

        socket.on('disconnect', () => {
            console.info('Disconnect from' + socket.id);

            const uid = this.GetUidFromSocketId(socket.id)

            if (uid){
                delete this.users[uid];
                const users = Object.values(this.users);
                this.SendMessage(
                    'user_disconnected',                     
                    users,
                    uid
                );

            }
        });
    };

    /**
     * Help function to Get Uid From Socket Id 
     * @param id 
     * @returns 
     */
    GetUidFromSocketId = (id: string) => Object.keys(this.users).find((uid) => this.users[uid] === id);

    /**
     * Send message through socket
     * @param name The name of the event, i.e. handshake
     * @param users The list of the socket id's
     * @param payload Any information needed by the user for state 
     */
    SendMessage = (name: string, users: string[], payload? :Object) => {
        console.info('Emitting event: ' + name + ' to ', users);
        users.forEach( id => payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name))
    };
}
