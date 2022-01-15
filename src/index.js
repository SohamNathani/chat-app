const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")

const {generateMessage, generateLocationMessage} = require("./utils/message")
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,"../public")


app.use(express.static(publicDirectoryPath))

// let count=0

io.on("connection", (socket)=>{
    console.log("New websocket connection")

    socket.on("join", (options, callback)=>{
        const{error, user} = addUser({id:socket.id, ...options})
        
        if(error){
            return callback(error)
        } 

        socket.join(user.room)

        socket.emit("message",generateMessage("Admin", "Welcome"))
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} has logged in`))
        io.to(user.room).emit("roomData",{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on("sendMessage",(message,callback)=>{
        const user = getUser(socket.id)

        if(!user) return callback("User not found")

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity not allowed")
        }

        io.to(user.room).emit("message",generateMessage(user.username, message))
        callback()
    })

    socket.on("sendLocation",(coords, callback)=>{
        const user = getUser(socket.id)
        console.log(coords)
        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback("Location delivered")
    })


    socket.on("disconnect", ()=>{
        // console.log("message", "A user has left")
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left`))

            io.to(user.room).emit("roomData",{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }    
    })

    // socket.emit("countUpdated",count)

    // socket.on("increment",()=>{
    //     count++;
    //     io.emit("countUpdated",count)
    // })

})
// app.get("",(req,res)=>{
//     res.render("index")
// })


server.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})