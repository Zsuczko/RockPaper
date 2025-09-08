const { WebSocketServer } = require('ws')
const http = require('http')
const uuidv4 = require('uuid').v4
const url = require('url')


const server = http.createServer()
const wsServer = new WebSocketServer({server})

const port = 8000


const connections = {}
const users = {}


const onMessage = (bytes, uuid) =>{
    const message = JSON.parse(bytes.toString())
    const userTo = message.userTo
    const playerToUuid = Object.keys(users).find(x=> users[x].username==userTo)


    if(message.ask) {

        const connection = connections[playerToUuid]
        connection.send(JSON.stringify({
            user: users[uuid].username,
            ask: true
        }))
    }

    else {
        const hand = message.hand
        users[uuid].hand = hand
        users[playerToUuid].from = users[uuid].username
        users[playerToUuid].receiveHand = hand

        if(users[playerToUuid].receiveHand !="" && users[playerToUuid].hand !=""){
            const playerConnection = connections[playerToUuid]
            const connection = connections[uuid]
            playerConnection.send(JSON.stringify(users[playerToUuid]))
            connection.send(JSON.stringify(users[uuid]))


            users[playerToUuid].from = ""
            users[playerToUuid].hand = ""
            users[playerToUuid].receiveHand = ""

            
            users[uuid].from = ""
            users[uuid].hand = ""
            users[uuid].receiveHand = ""
        }
    }
    console.log("jo")
}

const broadcastAllUsername = ()=>{
    
    const usernames = []
    Object.keys(users).forEach(x=>usernames.push(users[x].username))
    
    Object.keys(connections).forEach(key =>{
        const connection = connections[key]
        connection.send(JSON.stringify(usernames))  
    })

    // console.log(usernames)
}

wsServer.on('connection', (connection, request)=>{
    console.log("Connected")
    const {username} = url.parse(request.url, true).query
    const uuid = uuidv4()

    const already = Object.keys(users).find(x=>users[x].username == username)

    if(!already){
        connections[uuid] = connection

        users[uuid] = {
            username,
            from:"",
            hand:"",
            receiveHand:""
        }
    }

    else {
        console.log("Already logged in")
    }


    broadcastAllUsername()

    console.log(users)
    connection.on('message', message => onMessage(message, uuid))
})

server.listen(port, ()=>{
    console.log("Server is listening at port", port)
})