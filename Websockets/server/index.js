const { WebSocketServer } = require('ws')
const http = require('http')
const uuidv4 = require('uuid').v4
const url = require('url')
const { json } = require('stream/consumers')


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

    else if(message.accept){

        connections[playerToUuid].send(JSON.stringify({
            challenger: users[uuid].username,
            challenged:true
        }))

        // console.log(users[uui])
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
            console.log(users[uuid])
            console.log(users[playerToUuid])

            // users[playerToUuid].from = ""
            // users[playerToUuid].hand = ""
            // users[playerToUuid].receiveHand = ""

            
            // users[uuid].from = ""
            // users[uuid].hand = ""
            // users[uuid].receiveHand = ""
        }
        else{
            connections[uuid].send(JSON.stringify({
                sentHand:true
            }))

            connections[playerToUuid].send(JSON.stringify({
                gotHand:true
            }))
            console.log(users[uuid])
            console.log(users[playerToUuid])
        }
    }
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

const onClose =(uuid)=>{
    delete connections[uuid]
    delete users[uuid]
    broadcastAllUsername()

    console.log("closed")
}

wsServer.on('connection', (connection, request)=>{
    // console.log("Connected")
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
        connection.send(JSON.stringify({error: "You're already logged in"}))
    }


    broadcastAllUsername()

    // console.log(users)
    connection.on('message', message => onMessage(message, uuid))
    connection.on('close', ()=>{onClose(uuid)})
})

server.listen(port, ()=>{
    console.log("Server is listening at port", port)
})