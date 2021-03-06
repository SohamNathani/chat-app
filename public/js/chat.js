const socket = io()

// socket.on("countUpdated",(count)=>{
//     console.log("The count has been udpated", count)
// })

// document.querySelector("#increment").addEventListener("click", ()=>{
//     console.log("Clicked")
//     socket.emit("increment")
// })



const $messageForm = document.getElementById("message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocation = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoscroll = () =>{
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far I have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(Math.round(containerHeight - newMessageHeight) <= Math.round(scrollOffset)){
        messages.scrollTop = messages.scrollHeight;
    }

    // console.log(newMessageStyles)
}

socket.on("message",(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})


socket.on("locationMessage",(link)=>{
    // console.log(link)
    const html = Mustache.render(locationTemplate,{
        username: link.username,
        link : link.link,
        createdAt : moment(link.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

socket.on("roomData", ({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})

$messageForm.addEventListener("submit", (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute("disabled", "disabled")
    /////////////

    const message=e.target.elements.message.value
    
    socket.emit("sendMessage", message,(error)=>{
        $messageFormButton.removeAttribute('disabled'),
        $messageFormInput.value=""
        $messageFormInput.focus()
        // console.log(error)
        if(error){
            console.log(error)
        }
    })
})



$sendLocation.addEventListener("click",()=>{
    if(!navigator.geolocation) {
        return  alert("Geolocation is not supported by your browser")
    }

    $sendLocation.setAttribute("disabled", "disabled")

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("sendLocation",{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(delivered)=>{
            $sendLocation.removeAttribute("disabled")
            console.log(delivered)
        })
    })
})

socket.emit("join", {username, room},(error)=>{
    
    if(error){
        alert(error)
        location.href = "/"
    }
    
})