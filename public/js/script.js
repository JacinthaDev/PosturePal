// VARIABLE ======================================================================

let reminderInterval
let now = new Date()
let upcoming = []

let countdownInterval

// NAVIGATION ======================================================================

const navItems = document.querySelectorAll(".nav-item")

navItems.forEach((navItem, i) => {
    navItem.addEventListener("click", () => {
        navItems.forEach((item, j) => {
            item.className = "nav-item"
        })
        navItem.className = "nav-item active"
    })
})

// EDIT SCHEDULE ======================================================================

let editBtn = document.getElementsByClassName('edit')
Array.from(editBtn).forEach(function (element) {
    element.addEventListener('click', function () {
        const form = this.closest('li').querySelector('.hidden')
        let submitBtn = document.getElementById('editBtn')
        form.classList.toggle('hidden')
        submitBtn.classList.remove('hidden')
        sessionStorage.clear()
    })
})


// FUNCTION FOR POPULATING STRETCHING IMAGES ON DASHBOARD ======================================================================

const imageTagArray = Array.from(document.getElementsByClassName('stretchToDo'))
const h3TagArray = Array.from(document.getElementsByTagName('h3'))
const hrefArray = Array.from(document.getElementsByClassName('image-routes'))
let imageArray = [
    ["../imgs/cowface.gif", "Cow Face Stretch"],
    ["../imgs/reverse-pray.gif", "Reverse Prayer Pose"],
    ["../imgs/standing-arm-lifts.gif", "Standing Arm Lifts"],
    ["../imgs/standing-arm-swings.gif", "Standing Arm Swings"],
    ["../imgs/shoulder-rolls.gif", "Shoulder Rolls"],
    ["../imgs/ear-to-shoulder.gif", "Ear to Shoulder"],
    ["../imgs/cross-arm.gif", "Cross Arm Stretch"]
]

let routeArray = [
    "/cowFaceStretch",
    "/reversePrayerPose",
    "/standingArmLifts",
    "/standingArmSwings",
    "/shoulderRolls",
    "/earToShoulder",
    "/crossArmStretch"
]

function populateContent(imageTagArray, h3TagArray, imageArray, hrefArray, routeArray) {
    if (imageArray.length !== imageTagArray.length || imageArray.length !== h3TagArray.length) {
        console.error("Array lengths do not match.")
        return
    }

    for (let i = 0; i < imageArray.length; i++) {
        const [imageUrl, imageText] = imageArray[i]
        imageTagArray[i].src = imageUrl
        imageTagArray[i].alt = imageText
        hrefArray[i].href = routeArray[i]
        h3TagArray[i].textContent = imageText
    }
}

populateContent(imageTagArray, h3TagArray, imageArray, hrefArray, routeArray)


// FETCH FOR GETTING STRETCH SCHEDULE INFO FROM DATABASE ======================================================================

fetch('/getStretches')
    .then(response => response.json())
    .then(data => {

        // SEND REMINDER TO STRETCH ======================================================================

        //console.log(data[0].days)





        shouldSendReminder(data[0].days, data[0].startTime, data[0].endTime, data[0].frequency)
        function shouldSendReminder(selectedDays, startTime, endTime, numReminders) {
            const dayNameToNumber = {
                "Sunday": 0,
                "Monday": 1,
                "Tuesday": 2,
                "Wednesday": 3,
                "Thursday": 4,
                "Friday": 5,
                "Saturday": 6
            }
            const todayNumber = now.getDay()

            // Change days to corresponding Date object number 
            const selectedDayNumbers = selectedDays.map(dayName => dayNameToNumber[dayName])
            if (!selectedDayNumbers.includes(todayNumber)) { //If today is not a work day
                return false
            }

            // Parse start and end times
            const [startHours, startMinutes] = startTime.split(':').map(Number)
            const [endHours, endMinutes] = endTime.split(':').map(Number)

            // Convert start and end times to Date objects
            const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes)
            const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes)

            // Check if current time is within work hours
            if (now >= startDate && now <= endDate) {

                const workDurationInMinutes = (endDate - startDate) / (60 * 1000) // convert milliseconds to minutes
                const reminderInterval = numReminders === 1 ? workDurationInMinutes / 2 : workDurationInMinutes / numReminders

                sendVariable(reminderInterval)//get the ReminderInterval variable out so other functions can use it
                //console.log(startDate)
                //console.log(upcoming)
                upcoming.forEach((element, index) =>{
                    const timeOfReminder = new Date()
                    const now2 = new Date()
                    timeOfReminder.setHours(upcoming[index][2])
                    timeOfReminder.setMinutes(upcoming[index][3])
                    const msTillReminder =  timeOfReminder.getTime() - now2.getTime()
                
                    const timeOutID = setTimeout(() => {
                        shuffle()
                        askNotificationPermission()
                        const popUpDiv = document.querySelector('.popUp')
                        popUpDiv.classList.remove('hidden')

                    }, msTillReminder)
                    //console.log("setTimeout", timeOfReminder, now2, msTillReminder/1000)
                    //console.log(new Date(now2.getTime() + msTillReminder))
                    upcoming[index][4] = timeOutID
                })

                //Set interval for reminders
                // return setInterval(() => {
                //     shuffle()
                //     const popUpDiv = document.querySelector('.popUp')
                //     popUpDiv.classList.remove('hidden')
                // }, reminderInterval * 60 * 1000) // convert minutes to milliseconds

            }

            return null //No reminders scheduled if not within work hours

        }


        //CALCULATE THE UPCOMING STRETCHES ======================================================================

        function sendVariable(reminderInterval) {
            if (sessionStorage.getItem('upcoming')){
                upcoming = JSON.parse(sessionStorage.getItem('upcoming'));
            } else {
            upcoming = calculateUpcomingStretches(data[0].days, data[0].startTime, data[0].endTime, reminderInterval, data[0].frequency) //needed access to DB info to not repeat code
            }
        }

        function calculateUpcomingStretches(selectedWorkDays, startTime, endTime, frequencyInMins, numStretches) {
            let tempUpcoming = []

            function isWorkday(day) {
                return selectedWorkDays.includes(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day])
            }

            function addStretchesForDay(day) {
                let start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]))
                let end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]))
                let stretchTime = new Date(start)
                //console.log("STRETCH 1" , stretchTime)
                // console.log("STRETCH TIME",stretchTime)
                // console.log("START", start)
                // let frequencyInMs= (end - start)/frequencyInMins
                
                
                // let totalMS = start.getTime() + frequencyInMs
                // console.log('START PLUS', start.getTime() + frequencyInMs)
                // console.log(new Date(totalMS))


                while ((tempUpcoming.length < numStretches) && (stretchTime <= end)) {
                    if ((stretchTime > now) ) {
                        tempUpcoming.push([
                            stretchTime.getDate(),
                            stretchTime.getDay(),
                            stretchTime.getHours(),
                            stretchTime.getMinutes()
                        ])
                    }

                    stretchTime = new Date(stretchTime.getTime() + frequencyInMins * 60000)
                
                }
            }

            if (isWorkday(now.getDay())) {
                addStretchesForDay(now)
            }

            //if (tempUpcoming.length < numStretches) {
              //  now.setDate(now.getDate() + 1)
            //  if (isWorkday(now.getDay())) {
            //         addStretchesForDay(now)
            //     }
            //}
            return tempUpcoming
        }




        updateDisplayOfStretches()
    })














///oldddd

        
    //     shouldSendReminder(data[0].days, data[0].startTime, data[0].endTime, data[0].frequency)
    //     function shouldSendReminder(selectedDays, startTime, endTime, numReminders) {
    //         const dayNameToNumber = {
    //             "Sunday": 0,
    //             "Monday": 1,
    //             "Tuesday": 2,
    //             "Wednesday": 3,
    //             "Thursday": 4,
    //             "Friday": 5,
    //             "Saturday": 6
    //         }
    //         const todayNumber = now.getDay()

    //         // Change days to corresponding Date object number 
    //         const selectedDayNumbers = selectedDays.map(dayName => dayNameToNumber[dayName])
    //         if (!selectedDayNumbers.includes(todayNumber)) { //If today is not a work day
    //             return false
    //         }

    //         // Parse start and end times
    //         const [startHours, startMinutes] = startTime.split(':').map(Number)
    //         const [endHours, endMinutes] = endTime.split(':').map(Number)

    //         // Convert start and end times to Date objects
    //         const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes)
    //         const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes)

    //         // Check if current time is within work hours
    //         if (now >= startDate && now <= endDate) {

    //             const workDurationInMinutes = (endDate - startDate) / (60 * 1000) // convert milliseconds to minutes
    //             const reminderInterval = numReminders === 1 ? workDurationInMinutes / 2 : workDurationInMinutes / numReminders

    //             sendVariable(reminderInterval)//get the ReminderInterval variable out so other functions can use it


    //             upcoming.forEach((element, index) =>{
    //                 let now3 = new Date()
    //                 const timeOfReminder = new Date()
    //                 const now = new Date()
    //                 timeOfReminder.setHours(upcoming[index][2])
    //                 timeOfReminder.setMinutes(upcoming[index][3])
    //                 const msTillReminder =  timeOfReminder.getTime() - now.getTime()
    //                 const timeOutID = setTimeout(() => {
    //                     shuffle()
    //                     const popUpDiv = document.querySelector('.popUp')
    //                     popUpDiv.classList.remove('hidden')

    //                 }, msTillReminder)
    //                 upcoming[index][4] = timeOutID
    //             }

    //             )

    //         }

    //         return null //No reminders scheduled if not within work hours

    //     }


    //     //CALCULATE THE UPCOMING STRETCHES ======================================================================

    //     function sendVariable(reminderInterval) {

    //         if (sessionStorage.getItem('upcoming') !== null && JSON.parse(sessionStorage.getItem('upcoming')).length > 0){
    //             console.log(JSON.parse(sessionStorage.getItem('upcoming')))
    //             console.log('yes')
    //             upcoming = JSON.parse(sessionStorage.getItem('upcoming'))
    //         } else {
    //             console.log('no')
    //         upcoming = calculateUpcomingStretches(data[0].days, data[0].startTime, data[0].endTime, reminderInterval, data[0].frequency) //needed access to DB info to not repeat code  
    //     }
    //     }

    //     function calculateUpcomingStretches(selectedWorkDays, startTime, endTime, frequencyInMins, numStretches) {
    //         let tempUpcoming = []

    //         function isWorkday(day) {
    //             return selectedWorkDays.includes(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day])
    //         }

    //         function addStretchesForDay(day) {
    //             let start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]))
    //             let end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]))
    //             let stretchTime = new Date(Math.max(start, now))

    //             while (tempUpcoming.length < numStretches + 1  &&stretchTime <= end) {
    //                 if (stretchTime > now) {
    //                     tempUpcoming.push([
    //                         stretchTime.getDate(),
    //                         stretchTime.getDay(),
    //                         stretchTime.getHours(),
    //                         stretchTime.getMinutes()
    //                     ])
    //                 }
    //                 console.log(tempUpcoming)
    //                 stretchTime = new Date(stretchTime.getTime() + frequencyInMins * 60000)
    //             }
    //         }
    //         console.log(now)
    //         if (isWorkday(now.getDay())) {
    //             addStretchesForDay(now)
    //         }
    //         // if (tempUpcoming.length < numStretches) {
    //         //     now.setDate(now.getDate() + 1)

    //             if (isWorkday(now.getDay())) {
    //                 addStretchesForDay(now)
    //             }
    //         // }
    //         sessionStorage.setItem('calculatedUpcomingStretches', JSON.stringify(tempUpcoming))
    //         return tempUpcoming
    //     }
    //     updateDisplayOfStretches()
    // })


    function hasTimePassed() {
        let upcoming2 = JSON.parse(sessionStorage.getItem('upcoming'))
        if (!upcoming2 || upcoming2.length === 0) {
            return false;
        }

        let hour = upcoming2[0][2];
        let minute = upcoming2[0][3];
    
        if (now.getHours() >= hour && now.getMinutes() >= minute) {
            upcoming2.shift();
            sessionStorage.setItem('upcoming', JSON.stringify(upcoming2));
            return true;
        }
    
        return false;
    }
    
    hasTimePassed()
    




 //POPULATE UPCOMING STRETCHES DIV ON THE DASHBOARD ======================================================================


function updateDisplayOfStretches() {
    const nextStretchesDivs = document.getElementsByClassName('day-and-activity')
    Array.from(nextStretchesDivs).forEach(function (element, index) {
        let data = upcoming[index]
        let h1 = element.querySelector('.day h1')
        let p = element.querySelector('.day p')
        let h2 = element.querySelector('.activity h2')

        if (index < upcoming.length) {
            let hours = data[2]
            let minutes = data[3]
            let ampm = hours >= 12 ? 'PM' : 'AM'
            hours = hours % 12
            hours = hours ? hours : 12
            minutes = minutes < 10 ? '0' + minutes : minutes

            
            h1.innerText = `${data[0]}`
            p.innerText = `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][data[1]]}`
            h2.innerText = `${hours}:${minutes} ${ampm}`
        } else{

            element.remove()

        }
    })
}

//SKIP STRETCH ======================================================================

let skipBtn = document.querySelector('.skip')
skipBtn.addEventListener('click', function () {
    skippedStretches()
})

Array.from(document.getElementsByClassName('upcomingSkip')).forEach(function (element, index) {
    element.addEventListener('click', function () {
        clearTimeout(upcoming[index][4])
        upcoming.splice(Number(element.dataset.number), 1)
        sessionStorage.setItem('upcoming', JSON.stringify(upcoming))
        updateDisplayOfStretches()
        skippedStretches()
    })
})


//START UPCOMING STRETCH ======================================================================

Array.from(document.getElementsByClassName('upcomingStretch')).forEach(function (element, index) {
    element.addEventListener('click', function () {
        clearTimeout(upcoming[index][4])
        upcoming.splice(Number(element.dataset.number), 1)
        sessionStorage.setItem('upcoming', JSON.stringify(upcoming))
        updateDisplayOfStretches()
        shuffle()
        const popUpDiv = document.querySelector('.popUp')
        popUpDiv.classList.remove('hidden')
    })
})


// START TIMER  ======================================================================
document.querySelector('.stretch').addEventListener('click', function () {
    document.querySelector('.skip').classList.add('hidden')
    document.querySelector('.stretch').classList.add('hidden')
    document.querySelector('.restart').classList.remove('hidden')
    startCountdown()
})

document.querySelector('.restart').addEventListener('click', function () {
    startCountdown()
})

function startCountdown() {
    const countdownElement = document.querySelector('.countdown-timer')
    const timesUp = document.querySelector('.timesUp')
    const clear = document.querySelector('.clear')
    let remainingSeconds = 10

    clearInterval(countdownInterval)
    updateDisplay(0, remainingSeconds)

    countdownInterval = setInterval(function () {
        remainingSeconds -= 1

        updateDisplay(0, remainingSeconds)

        if (remainingSeconds <= 0) {
            clearInterval(countdownInterval)
            timesUp.textContent = "Time's up!"
            countdownElement.textContent = ""
            clear.textContent = ""

            let image = document.querySelector('.popUpStretch')
            image.src = "../imgs/stretch.png"
            image.style.width = "50%"


            let heading = document.querySelector('.stretch-image-container h2')
            heading.textContent = 'Thanks for stretching!'
            document.querySelector('.restart').classList.add('hidden')
            document.querySelector('.exit').classList.remove('hidden')
            document.querySelector('.exit').addEventListener('click', function () {
                updateStreak().then(() => window.location.reload())
                document.querySelector('.popUpStretch').src = ''
                document.querySelector('.popUpStretch').alt = ''

            })


            let countdown = document.querySelector('.countdown')
            countdown.innerHTML = ''
        }
    }, 1000)
}

function updateDisplay(minutes, seconds) {
    let formattedSeconds = seconds.toString().padStart(2, '0')
    document.querySelector('.countdown-timer').textContent = formattedSeconds
}

//SHUFFLE THE IMAGES ======================================================================

function shuffle() {
    let storedValue = sessionStorage.getItem('imageArray')
    let imageArray2 = storedValue !== null ? JSON.parse(storedValue) : imageArray
    let item = imageArray2.shift()
    imageArray2.push(item)
    document.querySelector('.popUpStretch').src = `${imageArray2[0][0]}`
    document.querySelector('.popUpStretch').alt = `${imageArray2[0][1]}`
    sessionStorage.setItem('imageArray', JSON.stringify(imageArray2))
}

// UPDATE STREAK ======================================================================

function updateStreak() {
    return fetch('/profile/editStreak', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

function skippedStretches() {
    fetch('/profile/skipped', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(() => {

            window.location.reload()
        })

}





// Notification.requestPermission().then(permission => {
//     if (permission === 'granted') {
//         console.log(permission)
//         // new Notification("Test Notification", {
//         //     body: "This is a test!",
//         //     icon: "../imgs/stretch.png"
//         // });
//     }
// });


document.querySelector('.hi').addEventListener('click', askNotificationPermission)

function askNotificationPermission() {
    // Function to handle the permission result
    function handlePermission(permission) {
        if (permission === "granted") {
            const text = `HEY! It's time to stretch`;
            const img = "../imgs/stretch.png";
            // Create a notification here after permission is granted
            const notification = new Notification("PosturePal", { body: text, icon: img });
            console.log(notification)
        }
    }

    if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
    } else {
        Notification.requestPermission().then(handlePermission);
    }
}


