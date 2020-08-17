let Peer = require('simple-peer')
let socket = io()
//selects video tag from html
const video =document.querySelector('video')
let client = {}

// get stream
// get user permission for Camera(video) and Microphone(Audio) usage
navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(stream => {
        socket.emit('NewClient')
        video.srcObject = stream
        video.play()

        //used to initialize a peer or a client
        function InitPeer(type){
            let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false})
            peer.on('stream',function(stream){
                CreateVideo(stream)
            })
            peer.on('close', function(){
                document.getElementById("peerVideo").remove();
                peer.destroy()
            })
            return peer
        }

        //for peer of type init 
        function MakePeer(){
           client.gotAnswer = false
           let peer = InitPeer('init')
           peer.on('signal', function(data){
               if(!client.gotAnswer){
                   socket.emit('Offer', data)
               }
           })
           client.peer = peer 
        }

        //for peer of tytpe notinit
        function FrontAnswer(){
            let peer = InitPeer('notInit')
            peer.on('signal',(data)=>{
                socket.emit('Answer', data)
            })
            peer.signal(offer)
        }

        function SignalAnswer(answer){
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        }

        function CreateVideo(stream){
            let video = document.createElement('video')
            video.id = 'peerVideo'
            video.srcObject = stream
            video.class = "embed-reponsive-item"
            document.querySelector('#peerDiv').appendChild(video)
            video.play()
        }

        function SessionActive(){
            document.write('Session Active. Please come back later. Sorry for the inconvienece.')
        }

        socket.on('BackOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
    })
    .catch(err => document.write(err))


