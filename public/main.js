var socket = io.connect('http://172.20.10.8:3000');

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
    joinPlay = el('joinPlay'); 

// Initializers
el('overlayMessage').innerHTML="Start or join a game";
socket.on('conSuccess', (id) => {
    localStorage.setItem("myId", id);
})

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


document.querySelectorAll('td').forEach(item => {
    item.addEventListener('click', event => {
      console.log(event.target.id)
    //   el(event.target.id).style.backgroundImage='url("x.png")';
      data = {
          block: event.target.id,
          jid: localStorage.getItem('joineeId'),
          hostId: localStorage.getItem('hostId'),
          playedBy: localStorage.getItem('myId')
      }
      console.log(data.playedBy)
      socket.emit('move', data)
    })
  })


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
        hostId: otherGameCode.value,
        jid: socket.id
    }
    localStorage.setItem('hostId', otherGameCode.value);
    localStorage.setItem('joineeId', socket.id)
    console.log(data)
    socket.emit('joineeStarted', data)
}



function chanceOf(data){
    socket.emit('chance', data)
}


// Socket direct

socket.on('chance', (data) => {
    if(localStorage.getItem('myId')==data.sid){
        console.log(data)
        el('othersChance').style.display="none";
    } else{
        console.log(data)
        el('othersChance').style.display="block";
        el('othersChance').innerHTML="Other player's chance";
    }
})

socket.on('joineeStarted', (data) => {
    el('playingWith').innerHTML += data.name;
    $('#startGameModal').modal('hide')
    el('initial-controls').classList.add('d-none')
    el('playing').classList.remove('d-none')
    localStorage.setItem("hostId", localStorage.getItem("myId"))
    localStorage.setItem("joineeId", data.jid)
    hostStarted(data)
})

socket.on('hostData', (data) => {
    el('playingWith').innerHTML += data.name;
    $('#joinGameModal').modal('hide')
    el('initial-controls').classList.add('d-none')
    el('playing').classList.remove('d-none')
    chanceOf(data)
})

socket.on('move', (data) => {
    if(data.playedBy == localStorage.getItem('hostId')){
        el(data.block).style.backgroundImage='url("x.png")';
        socket.emit('hostPlayed', data)
    } else{
        el(data.block).style.backgroundImage='url("o.png")';
        socket.emit('joineePlayed', data)
    }
})

socket.on('hostPlayed', (data) => {
    if(data == 'ready'){
        el('othersChance').style.display="none";
    } else{
        el('othersChance').style.display="block";
        el('othersChance').innerHTML="Other player's chance";
    }
})
socket.on('joineePlayed', (data) => {
    if(data == 'ready'){
        el('othersChance').style.display="none";
    } else{
        el('othersChance').style.display="block";
        el('othersChance').innerHTML="Other player's chance";
    }
})