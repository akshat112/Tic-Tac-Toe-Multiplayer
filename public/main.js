var socket = io.connect('http://localhost:3000');


function el(id){
    return document.getElementById(id);
}

var startBtn = el("start-game"),
    joinBtn = el("join-game"),
    myGameCode = el('myGameCode'),
    a1 = el('a1'),
    a2 = el('a2'),
    a3 = el('a3'),
    b1 = el('b1'),
    b2 = el('b2'),
    b3 = el('b3'),
    c1 = el('c1'),  
    c2 = el('c2'),
    c3 = el('c3');

startBtn.addEventListener('click', (event) => {
    myGameCode.value = socket.id;
})

function copyMyCode(){
    myGameCode.select();
    myGameCode.setSelectionRange(0, 99999);
    document.execCommand("copy");
}
