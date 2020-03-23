var socket = io.connect('https://tttonline.herokuapp.com');
// var socket = io.connect('http://localhost:3000');

function el(id){
    return document.getElementById(id);
}

if(window.location.href.includes("gameId=")){
    var gameCode = window.location.href.split("gameId=")[1];
    $('#joinGameModal').modal('show');
    el('otherGameCode').value = gameCode;
    el('otherGameCode').disabled="true"
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
    el('myGameUrl').value=window.location.href + "?gameId=" + socket.id;
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

function copyMyCode(id){
    el(id).select();
    el(id).setSelectionRange(0, 99999);
    document.execCommand("copy");
    let theId = "#" + id; 
    $(theId).tooltip('show')

}


document.querySelectorAll('td').forEach(item => {
    item.addEventListener('click', event => {
      console.log(event.target.id)
      if(item.dataset.val!=0){
          alert("Already filled")
      } else{
        data = {
            block: event.target.id,
            jid: localStorage.getItem('joineeId'),
            hostId: localStorage.getItem('hostId'),
            playedBy: localStorage.getItem('myId')
        }
        console.log(data.playedBy)
        socket.emit('move', data)
      }
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

function restart(){
    data = {
        hostId: localStorage.getItem('hostId'),
        jid: localStorage.getItem('joineeId')
    }
    socket.emit('reset', data)
}


// Socket listerners

socket.on('reset', (data) => {
    reset()
})

socket.on('won', data => {
    console.log("================")
    console.log(data)
    console.log("================")
    if(data.wonBy=='x' && localStorage.getItem('myId')==data.hostId){
        console.log("MMMMMMMMMMMMM")
        el('othersChance').style.display="none";
        el('gameWon').classList.remove('d-none')
        el('gameWon').innerHTML="You won <br> <button class='btn btn-md btn-success' onclick='restart()'>⟳ Re-start</button> <br><br><p>After restart, any of the player can take the first chance</p>";
    } else if(data.wonBy=='o' && localStorage.getItem('myId')==data.jid){
        el('othersChance').style.display="none";
        el('gameWon').classList.remove('d-none')
        el('gameWon').innerHTML="You won <br> <button class='btn btn-md btn-success' onclick='restart()'>⟳ Re-start</button> <br><br><p>After restart, any of the player can take the first chance</p>";
    } else{
        el('othersChance').style.display="none";
        el('gameWon').classList.remove('d-none')
        el('gameWon').innerHTML="Other player won <br> <button class='btn btn-md btn-success' onclick='restart()'>⟳ Re-start</button> <br><br><p>After restart, any of the player can take the first chance</p>";
    }


    if(localStorage.getItem('myId')==data.hostId){
        console.log(data)
        el('othersChance').style.display="none";
    } else{
        console.log(data)
        
    }
})

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
        el(data.block).dataset.val='x';
        // if(checkWin('x')){
        //     data.wonBy = 'x';
        //     socket.emit('won', data)
        // } else{
            socket.emit('hostPlayed', data)
        // }
    } else{
        el(data.block).style.backgroundImage='url("o.png")';
        el(data.block).dataset.val='o';
        // if(checkWin('o')){
        //     data.wonBy = 'o';
        //     socket.emit('won', data)
        // } else{
            socket.emit('joineePlayed', data)
        // }
    }
})

socket.on('hostPlayed', (data) => {
    data1 = {}
    if(checkWin('x')){
        data1.wonBy = 'x';
        data1.jid = localStorage.getItem('joineeId')
        data1.hostId = localStorage.getItem('hostId')
        socket.emit('won', data1)
    }
    else if(data == 'ready'){
        el('othersChance').style.display="none";
    }
    else{
        el('othersChance').style.display="block";
        el('overlayMessage').innerHTML="Other player's chance";
    }
})
socket.on('joineePlayed', (data) => {
    if(checkWin('o')){
        data1.wonBy = 'o';
        data1.jid = localStorage.getItem('joineeId')
        data1.hostId = localStorage.getItem('hostId')
        socket.emit('won', data1)
    }else if(data == 'ready'){
        el('othersChance').style.display="none";
    } else{
        el('othersChance').style.display="block";
        el('overlayMessage').innerHTML="<span>Other player's chance</span>";
    }
})


//Misc

    xWins = /xxx......|...xxx...|......xxx|x..x..x..|.x..x..x.|..x..x..x|x...x...x|..x.x.x../;
    oWins = /ooo......|...ooo...|......ooo|o..o..o..|.o..o..o.|..o..o..o|o...o...o|..o.o.o../;
;

function checkWin(player){
   //Getting all data values
   dataValues = []
   document.querySelectorAll('td').forEach(item => {
    dataValues.push(item.dataset.val)
   })
   dvs = dataValues.toString().replace(/\,/g,'')
   if(player=='x'){
       return xWins.test(dvs)
   }else if(player=='o'){
       return oWins.test(dvs)
   }
}

function reset(){
    document.querySelectorAll("td").forEach(item => {
        item.dataset.val = 0;
        item.style.backgroundImage="none";
    })
    el('gameWon').classList.add('d-none');
    if(el('othersChance').style.display!='none'){
        el('othersChance').style.display='none';
    }
}