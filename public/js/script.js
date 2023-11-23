// NAVIGATION ======================================================================
const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((navItem, i) => {
    navItem.addEventListener("click", () => {
        navItems.forEach((item, j) => {
            item.className = "nav-item";
    });
    navItem.className = "nav-item active";
    });
});

// EDIT SCHEDULE ======================================================================

let submitBtn= document.getElementById('edit')
console.log(submitBtn)
let editBtn= document.getElementsByClassName('edit')

Array.from(editBtn).forEach(function(element) {
    element.addEventListener('click', function(){
        const form = this.closest('li').querySelector('.hidden')
        form.classList.toggle('hidden')
        submitBtn.classList.remove('hidden')
    })
});


//POPULATE STRETCHING IMAGES ON DASHBOARD

let images = document.getElementsByClassName('stretchToDo')
let imageTagArray = Array.from(images)

let h3TagArray = Array.from(document.getElementsByTagName('h3'))

let hrefArray = Array.from(document.getElementsByClassName('image-routes'))

let imageArray = [["../imgs/cowface.gif", "Cow Face Stretch"], ["../imgs/reverse-pray.gif", "Reverse Prayer Pose"], ["../imgs/standing-arm-lifts.gif", "Standing Arm Lifts"], ["../imgs/standing-arm-swings.gif", "Standing Arm Swings"], ["../imgs/shoulder-rolls.gif", "Shoulder Rolls"], ["../imgs/ear-to-shoulder.gif" ,"Ear to Shoulder"], ["../imgs/cross-arm.gif", "Cross Arm Stretch"]]

let currentStretch = 0

let routeArray = [
    "/cowFaceStretch",
    "/reversePrayerPose",
    "/standingArmLifts",
    "/standingArmSwings",
    "/shoulderRolls",
    "/earToShoulder",
    "/crossArmStretch"
];

function populateContent(imageTagArray, h3TagArray, imageArray, hrefArray, routeArray) {
    if (imageArray.length !== imageTagArray.length || imageArray.length !== h3TagArray.length) {
        console.error("Array lengths do not match.");
        return;
    }

    for (let i = 0; i < imageArray.length; i++) {
        const [imageUrl, imageText] = imageArray[i];

        // Populate the <img> src and alt attributes
        imageTagArray[i].src = imageUrl;
        imageTagArray[i].alt = imageText;
        hrefArray[i].href = routeArray[i]

        // Populate the <h3> text
        h3TagArray[i].textContent = imageText;
    }
}

// Example usage
populateContent(imageTagArray, h3TagArray, imageArray, hrefArray, routeArray);





// GET SCHEDULE INFO FROM DATABASE ======================================================================

fetch('/getStretches')
    .then(response => response.json())
    .then(data => {
    console.log(data)
    console.log(data[0].days)

    //Calculate the difference in time from start time to end time
    let startTime = data[0].startTime
    let endTime = data[0].endTime
    let startHours = parseInt(startTime.split(":")[0]);
    let startMinutes = parseInt(startTime.split(":")[1]);
    let endHours = parseInt(endTime.split(":")[0]);
    let endMinutes = parseInt(endTime.split(":")[1]);
    let startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    let differenceInMinutes = endTotalMinutes - startTotalMinutes;

    //set reminder time

    let reminderInterval

    if (data[0].frequency === 1){
        reminderInterval = differenceInMinutes / 2
        console.log(reminderInterval)
    } else if (data[0].frequency !== 1){
        reminderInterval = differenceInMinutes / data[0].frequency
    }

    
    
// SEND REMINDER TO STRETCH ======================================================================
shouldSendReminder(data[0].days, "01:45", "01:59", 1.5)
function shouldSendReminder(selectedDays, startTime, endTime, reminderInterval) {
        const dayNameToNumber = {
            "Sunday": 0,
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6
        };
    
        const now = new Date();
        const todayNumber = now.getDay();
    
        // Use selectedDays instead of selectedDayNames
        const selectedDayNumbers = selectedDays.map(dayName => dayNameToNumber[dayName]);
        if (!selectedDayNumbers.includes(todayNumber)) {
            return false;
        }
    
        // Parse start and end times
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
    
        // Convert start and end times to Date objects
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);
    
        // Check if current time is within work hours
        if (now >= startDate && now <= endDate) {
            // Schedule reminders
            const workDurationInMinutes = (endDate - startDate) / (60 * 1000); // convert milliseconds to minutes
            console.log(reminderInterval)
            console.log(workDurationInMinutes)
    
            //Set interval for reminders
            return setInterval(() => {

                let popUpDiv = document.querySelector('.popUp')
                popUpDiv.classList.remove('hidden')

                let currentStretchImg = document.querySelector('.popUpStretch')
                currentStretchImg.src = imageArray[currentStretch][0]
                currentStretchImg.alt = imageArray[currentStretch][1]
                currentStretch = (currentStretch+1) % imageArray.length;



                console.log("Time to stretch!");
            }, reminderInterval * 60 * 1000); // convert minutes to milliseconds
        }
    
        return null;
    }
    
})




// START TIMER  ======================================================================
document.querySelector('.stretch').addEventListener('click', function() {
    document.querySelector('.skip').classList.add('hidden')
    document.querySelector('.stretch').classList.add('hidden')
    document.querySelector('.restart').classList.remove('hidden')
    startCountdown(1, 0); // 1 minute and 0 seconds countdown
});

document.querySelector('.restart').addEventListener('click', function() {
    startCountdown(1, 0); // 1 minute and 0 seconds countdown
});




var countdownInterval;




function startCountdown(minutes, seconds) {
    var countdownElement = document.querySelector('.countdown-timer');
    var timesUp = document.querySelector('.timesUp');
    var clear = document.querySelector('.clear');
    var remainingMinutes = minutes;
    var remainingSeconds = seconds;

    clearInterval(countdownInterval); // Clear existing interval
    updateDisplay(remainingMinutes, remainingSeconds);

    countdownInterval = setInterval(function() {
        remainingSeconds -= 1;

        if (remainingSeconds < 0) {
            remainingMinutes -= 1;
            remainingSeconds = 59;
        }

        updateDisplay(remainingMinutes, remainingSeconds);

        if (remainingMinutes <= 0 && remainingSeconds <= 0) {
            clearInterval(countdownInterval);
            timesUp.textContent = "Time's up!";
            countdownElement.textContent = "";
            clear.textContent = "";
            if (confirm("Great job. Click OK to be redirected to the homepage now, or you will be automatically redirected in 3 seconds.")) {
                window.location.href = '/profile'; // Redirect immediately
                popUpDiv.classList.add('hidden')
                document.querySelector('.skip').classList.remove('hidden')
                document.querySelector('.stretch').classList.remove('hidden')
                document.querySelector('.restart').classList.add('hidden')
                updateStreak()
            } else {
                setTimeout(function() {
                    window.location.href = '/profile'; // Redirect after 3 seconds
                    popUpDiv.classList.add('hidden')
                    document.querySelector('.skip').classList.remove('hidden')
                    document.querySelector('.stretch').classList.remove('hidden')
                    document.querySelector('.restart').classList.add('hidden')
                    // updateStreak()
                }, 3000);
            }
        }
    }, 1000);
}

function updateDisplay(minutes, seconds) {
    var formattedSeconds = seconds.toString().padStart(2, '0');
    var formattedMinutes = minutes.toString().padStart(2, '0');
    document.querySelector('.countdown-timer').textContent = formattedSeconds;
    document.querySelector('.countdown').children[0].textContent = formattedMinutes + ':';
}



// UPDATE STREAK ======================================================================

// let please = document.querySelector('.please')

// please.addEventListener('click', updateStreak)

// function updateStreak(){
//     console.log('hi')

//     fetch('/editStreak', {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Success:', data);
//         // Handle success (like redirection or a success message)
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//     });

// }