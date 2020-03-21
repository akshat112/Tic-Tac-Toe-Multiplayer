const express = require('express')
const app = express()
const socket = require('socket.io')

app.use(express.static('public'));

const server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server started")
})

const io = socket(server)

io.on('connection', function(socket){
    console.log("Client connected")

    socket.on('hostStarted', (data) => {
        console.log(data)
        socket.to(data.jid).emit('hostData', data);
        
    })

    socket.on('joineeStarted', (data) => {
        socket.to(data.hostId).emit('joineeStarted', data);

    })
})