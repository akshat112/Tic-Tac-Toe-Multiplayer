var socket = io.connect('http://localhost:3000');

function el(id){
    return document.getElementById(id);
}

var startBtn = el("start-game"),
    joinBtn = el("join-game"),
    myGameCode = el('myGameCode'),
    startPlay = el('startPlay'),
    hostName = el('hostName'),
    joineeName = el('joineeName'),
    otherGameCode = el('otherGameCode'),
    joinPlay = el('joinPlay'),
    a1 = el('a1'),
    a2 = el('a2'),
    a3 = el('a3'),
    b1 = el('b1'),
    b2 = el('b2'),
    b3 = el('b3'),
    c1 = el('c1'),  
    c2 = el('c2'),
    c3 = el('c3');

// Event Listeners

startBtn.addEventListener('click', (event) => {
    myGameCode.value = socket.id;
})

startPlay.addEventListener('click', () => {
    if(hostName.value == ''){
        hostName.classList.add("is-invalid")
        return;
    }
    else if(hostName.classList.contains('is-invalid')){
        hostName.classList.remove('is-invalid')
        hostName.classList.add('is-valid')
    } else{
        hostName.classList.add('is-valid')
    }
    startPlay.innerHTML = "Waiting for other player to join.."
    startPlay.disabled = true;    
})

joinPlay.addEventListener('click', () => {
    joineeStarted(socket)
})

function copyMyCode(){
    myGameCode.select();
    myGameCode.setSelectionRange(0, 99999);
    document.execCommand("copy");
    $('#myGameCode').tooltip('show')

}


// Socket functions

function hostStarted(inp){
    // console.log(inp)
    let data = {
        name: hostName.value,
        sid: socket.id,
        jid: inp.sid,
        jname: inp.name
    }
    socket.emit('hostStarted', data)
}

function joineeStarted(){
    let data = {
        name: joineeName.value,
        sid: socket.id,
        hostId: otherGameCode.value
    }
    console.log(data)
    socket.emit('joineeStarted', data)
}


// Socket direct

socket.on('joineeStarted', (data) => {
    el('playingWith').innerHTML += data.name;
    $('#startGameModal').modal('hide')
    el('initial-controls').classList.add('d-none')
    el('playing').classList.remove('d-none')
    hostStarted(data)
})

socket.on('hostData', (data) => {
    el('playingWith').innerHTML += data.name;
    $('#joinGameModal').modal('hide')
    el('initial-controls').classList.add('d-none')
    el('playing').classList.remove('d-none')
})