let subURL;
 
 
 window.addEventListener("load", () => {
  const pageId = document.body.id;
  if (pageId === "DBBody") {
    main()
    console.log("test2")
  }
  else if (pageId === "displayBody") {
    const queryString = window.location.search; 
    const urlParams = new URLSearchParams(queryString);
    const tripIndex = urlParams.get('tripIndex'); 
    loadDisplayPage(tripIndex);
  }
});





async function main() {
const response = await fetch("outingData.json");
  const outingObj = await response.json();
  console.log(outingObj);
  document.getElementById('outingSearchForm').addEventListener('submit', event => { 
    event.preventDefault(); // stop page reload
    submitSearch(outingObj);
  } );
}

function presentOuting(num,outingObj) {
     const container = document.getElementById("trip-list");
  const card = document.createElement("div");
  const photoSection =  document.createElement("div");
  const lakePhoto = document.createElement("img");
  lakePhoto.src = `coverPhotos/${outingObj[num].coverImage}`
  lakePhoto.alt = "Group of 12 standing by lake"
  lakePhoto.className = "coverPhotoStyle";
  photoSection.appendChild(lakePhoto)
  photoSection.className = "photoSection";
  card.appendChild(photoSection)
    const infoSection = document.createElement("div");


card.className = "trip-card"; 
infoSection.className = "infoSection";
const date = document.createElement("p");
date.textContent = formatDatePretty(outingObj[num].tripStartDate);
date.className = "styleDate";
// Add child elements
const title = document.createElement("h2");
title.textContent = outingObj[num].tripName;
title.className = "displayTitle";
title.dataset.tripIndex = num;


const tripDuration = document.createElement("p")
tripDuration.textContent = `Trip Duration: ${outingObj[num].tripDuration} day`
if (outingObj[num].tripDuration > 1) {
    tripDuration.textContent = `${tripDuration.textContent}s`
}


// Attach children to the card

infoSection.appendChild(date);
infoSection.appendChild(title);
infoSection.appendChild(tripDuration);
infoSection.appendChild(assembleList(`Activities:`,outingObj[num].activities));
infoSection.appendChild(assembleList(`States Visited:`,outingObj[num].statesVisited));
card.appendChild(infoSection)

// Finally, add the card to the page
container.appendChild(card);
const brElement = document.createElement("br");
container.appendChild(brElement)
 document.querySelectorAll(".displayTitle").forEach(title => {
  title.addEventListener("click", () => {
    window.location.href = `tripDisplay.html?tripIndex=${title.dataset.tripIndex}`;
  });
}); 
}


function formatDatePretty(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const monthName = date.toLocaleString("en-US", { month: "long" });
  const dayNum = date.getDate();
  const suffix =
    (dayNum % 10 === 1 && dayNum !== 11) ? "st" :
    (dayNum % 10 === 2 && dayNum !== 12) ? "nd" :
    (dayNum % 10 === 3 && dayNum !== 13) ? "rd" : "th";

  return `${monthName} ${dayNum}${suffix}, ${year}`;
}

function assembleList(heading,arr) {
const someTxt = document.createElement("p")
if (arr.length == 1) {
    someTxt.textContent = arr[0]
}
 else if (arr.length == 2){
 someTxt.textContent = `${arr[0]} and ${arr[1]}`
 }
else {
    count = 0;
    while(count < arr.length - 1) {
        someTxt.textContent += `${arr[count]}, `
        count++;
    }
    someTxt.textContent += ` and ${arr[count]}`

}
someTxt.textContent = `${heading} ` + someTxt.textContent
return someTxt;
}

function submitSearch(outingObj) {
  const form = document.getElementById("outingSearchForm");
  const formData = new FormData(form);
  const params = new URLSearchParams(formData);
  subURL = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', subURL);
 const queryString = window.location.search; 
  const urlParams = new URLSearchParams(queryString);
let filtered = outingObj;

  // Get all checked activities
  const selectedActivities = urlParams.getAll('activities');
  // Filter the outings
  if(selectedActivities.length >= 1) {
  filtered = outingObj.filter(outing =>
    outing.activities.some(a => selectedActivities.includes(a))
  );
}
 let selectedDateStart = urlParams.get('startDate');
 let selectedDateEnd = urlParams.get('endDate');
 console.log(selectedDateStart);
  console.log(selectedDateEnd);
 if (selectedDateStart == "") {
    selectedDateStart = "0000-00-00"
 }
  if (selectedDateEnd == "") {
    selectedDateEnd = "9999-12-31"
 }
if(selectedDateStart > selectedDateEnd) {
    return;
}
filtered = filtered.filter(outing => {
  const start = outing.tripStartDate;
  const duration = outing.tripDuration;

  if (duration > 1) {
    const end = outing.tripEndDate;
    return [start, selectedDateStart].sort().pop() <= [end, selectedDateEnd].sort().reverse().pop();
    
  } else {
    return (start <= selectedDateEnd && start >= selectedDateStart);
  }
});
let selectedStartRange = urlParams.get('tripLengthStart')
let selectedEndRange = urlParams.get('tripLengthEnd')
let start = -1;
let end = Infinity;
if (selectedStartRange !== "") {
start = Number(selectedStartRange)
}
if (selectedEndRange !== "") {
end = Number(selectedEndRange)
}
if(start > end) {
    return;
}
filtered = filtered.filter(outing =>
(outing.tripDuration <= end && outing.tripDuration >= start)
)

  console.log("Filtered results:", filtered);

const container = document.getElementById("trip-list");
container.innerHTML = ""; //Clear prior results
  // Display results
  for (let i = 0; i < filtered.length; i++) {
    let findOIdx = outingObj.findIndex(outing => outing.tripName === filtered[i].tripName);
    presentOuting(findOIdx,outingObj);
  }
}

async function loadDisplayPage(num) {
    const response = await fetch("outingData.json");
    const outingObj = await response.json();
     const outing = outingObj[num];
     const container = document.getElementById("displayArea");
     const head = document.querySelector(".displayH1")
     head.textContent = outing.tripName
     const coverPhoto = document.createElement("img");
    coverPhoto.src = `coverPhotos/${outingObj[num].coverImage}`
    coverPhoto.alt = "Group of 12 standing by lake"
    coverPhoto.className = "coverPhotoStyle";
    const photoContainer = document.getElementById("displayPhotoDiv");
     photoContainer.appendChild(coverPhoto)
     const displayDateContainer = document.getElementById("displayDate");
     let displayDate;
     if(outingObj[num].tripDuration < 2) {
      displayDate = `${formatDatePretty(outingObj[num].tripStartDate)}`;
     } else {
      displayDate = `${formatDatePretty(outingObj[num].tripStartDate)} to ${formatDatePretty(outingObj[num].tripEndDate)}`
     }
     displayDateContainer.textContent = displayDate;
     const backButton = document.getElementById("backButton");
     backButton.addEventListener("click",() => { 
      window.history.back();

     })
    
}