const express = require('express')
const app = express()
const socket = require('socket.io')

app.use(express.static('public'));

const server = app.listen(process.env.PORT || 3000, () => {
    console.log("Server started")
})

const io = socket(server)

io.on('connection', function(socket){
    socket.emit('conSuccess', socket.id)

    socket.on('hostStarted', (data) => {
        //console.log(data)
        data.chance=1;
        socket.to(data.jid).emit('hostData', data);
        
    })

    socket.on('joineeStarted', (data) => {
        socket.to(data.hostId).emit('joineeStarted', data);

    })

    socket.on('chance', (data) => {
        console.log(data)
        io.to(data.jid).to(data.sid).emit('chance', data)
    })

    socket.on('move', (data) => {
        console.log(data)
        io.to(data.hostId).to(data.jid).emit('move', data)
    })

    socket.on('hostPlayed', (data) => {
        io.to(data.jid).emit('hostPlayed', 'ready')
        io.to(data.hostId).emit('hostPlayed', 'notReady')
        console.log(data.hostId)
    })
    socket.on('joineePlayed', (data) => {
        io.to(data.hostId).emit('joineePlayed', 'ready')
        io.to(data.jid).emit('joineePlayed', 'notReady')
    })
    socket.on('won', (data) => {
        console.log(data)
        io.to(data.hostId).to(data.jid).emit('won',data)
    })
    socket.on('reset', (data) => {
        io.to(data.hostId).to(data.jid).emit('reset','reset')
    })
    socket.on('end', (data) => {
        io.to(data.hostId).to(data.jid).emit('end','end')
    })

    socket.on('checkAvailable', (data) => {
        if(io.sockets.server.eio.clients[data] !== undefined){
            data = {
                status: 'available',
                gc: data
            }
            socket.emit('checkAvailable', data)
        } else{
            data = {
                status: 'notavailable',
                gc: data
            }
            socket.emit('checkAvailable', data)
        }
    })

    socket.on('someoneLeft', data => {
        socket.to(data.otherId).emit('someoneLeft', 'left');
    })
})