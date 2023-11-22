const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((navItem, i) => {
    navItem.addEventListener("click", () => {
        navItems.forEach((item, j) => {
            item.className = "nav-item";
    });
    navItem.className = "nav-item active";
    });
});

//allow user to edit time

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

// submitBtn.addEventListener('click', hideBtn)

// function hideBtn(){
//     submitBtn.classList.add('hidden')
// }

//Stretching Images and stretch reminders

let images = document.getElementsByClassName('stretchToDo')
let imageTagArray = Array.from(images)

let h3TagArray = Array.from(document.getElementsByTagName('h3'))
console.log(h3TagArray)

let imageArray = [["../imgs/cowface.gif", "Cow Face Stretch"], ["../imgs/reverse-pray.gif", "Reverse Prayer Pose"], ["../imgs/standing-arm-lifts.gif", "Standing Arm Lifts"], ["../imgs/standing-arm-swings.gif", "Standing Arm Swings"], ["../imgs/shoulder-rolls.gif", "Shoulder Rolls"], ["../imgs/ear-to-shoulder.gif" ,"Ear to Shoulder"], ["../imgs/cross-arm.gif", "Cross Arm Stretch"]]

function populateContent(imageTagArray, h3TagArray, imageArray) {
    if (imageArray.length !== imageTagArray.length || imageArray.length !== h3TagArray.length) {
        console.error("Array lengths do not match.");
        return;
    }

    for (let i = 0; i < imageArray.length; i++) {
        const [imageUrl, imageText] = imageArray[i];

        // Populate the <img> src and alt attributes
        imageTagArray[i].src = imageUrl;
        imageTagArray[i].alt = imageText;

        // Populate the <h3> text
        h3TagArray[i].textContent = imageText;
    }
}

// Example usage
populateContent(imageTagArray, h3TagArray, imageArray);






//Fetch schedule from DB

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

    
    shouldSendReminder(data[0].days, "23:45", "23:59", 1)

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
                console.log("Time to stretch!");
            }, reminderInterval * 60 * 1000); // convert minutes to milliseconds
        }
    
        return null;
    }
    
})