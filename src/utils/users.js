const users = []

const addUser = ({id, username, room})=>{
    //Clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: "Username and room are required"
        }
    }

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error: "Username is in use"
        }
    }

    const user = {id, username, room}
    users.push(user)
    return { user }

}

const removeUser = (id) =>{
     const index = users.findIndex((user)=> user.id===id)

     if(index !== -1) return users.splice(index,1)[0]
}

const getUser = (id) =>{
    const index = users.find((user)=> user.id === id)
    if(index !== -1) return index
}

const getUsersInRoom = (room) => {
    return users.filter((user)=> user.room === room)
}


// const res = addUser({
//     id: 22,
//     username: "usera",
//     room : "coding"
// })

// console.log(res)

// const removedUser = removeUser(22)

// console.log(removedUser)
// console.log(getUser(22))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}