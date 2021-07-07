const socket =io ()

//Element
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//option
const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //New message element 
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) =>{
    console.log(message.url)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomdata', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
        e.preventDefault()
        $messageFormButton.setAttribute('disaled', 'disabled')
        //disable
        const Cmessage = e.target.elements.message.value

        socket.emit('sendMessage', Cmessage, (error) => {
         //enable
         $messageFormButton.removeAttribute('disabled')
         $messageFormInput.value = ''
         $messageFormInput.focus()
            if(error) {
               return console.log(error)
           }
           console.log('Message delivered')
        })
})

$sendLocation.addEventListener('click', ()=> {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by Your browser...')
    }

    $sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () =>{
                $sendLocation.removeAttribute('disabled')
                console.log('Location Shared..')
            })
    })
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
// socket.on('countUpdated', (count)=> {
//     console.log('The count is Updated.', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })


