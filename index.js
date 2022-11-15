const API_PREFIX = "https://api.nobelprize.org/2.1/laureates?limit=900";
let currentCategory = "All"
let currentSort = "Ascending"
let currentCountry = "All"
let currentStartYear = 1901
let currentEndYear = 2022

const app = document.getElementById('app');

const dataStartYear = document.getElementById("start-year");
const dataEndYear = document.getElementById("end-year");
const dataCategory = document.getElementById("category");
const dataCountry = document.getElementById("country");
const dataOrder = document.getElementById("order-select");

const selectors = [dataStartYear, dataEndYear, dataCategory, dataCountry, dataOrder]

const filterByStartYear = function (data, startYear) {
  return data.filter(laureate => laureate.year >= startYear)
};
const filterByEndYear = function (data, endYear) {
  return data.filter(laureate => laureate.year <= endYear)
};
const filterByCategory = function (data, category) {
  if (category === "All") {
    return data
  }
  return data.filter(laureate => laureate.category === category)
};
const filterByCountry = function (data, country) {
  if (country === "All") {
    return data
  }
  return data.filter(laureate => laureate.country === country)
};
const sortByYear = function (data, order) {
  if (order === "Ascending") {
    return data.sort((a, b) => parseInt(a.year) - parseInt(b.year))
  }
  if (order === "Descending") {
    return data.sort((a, b) => parseInt(b.year) - parseInt(a.year))
  }
};



function changeCurrentSettings(idOfSelector, value) {
  switch (idOfSelector) {
    case "start-year":
      currentStartYear = value
      break;
    case "end-year":
      currentEndYear = value
      break;
    case "category":
      currentCategory = value
      break;
    case "country":
      currentCountry = value
      break;
    case "order-select":
      currentSort = value
      break;
    default:
      return;
  }
}
function filterData(data) {
  console.log(data.length, "this is data before")
  data = filterByCountry(data, currentCountry);
  data = filterByCategory(data, currentCategory);
  data = filterByStartYear(data, currentStartYear);
  data = filterByEndYear(data, currentEndYear);
  data = sortByYear(data, currentSort);  
  return data;
}
selectors.forEach(selector => {
  selector.addEventListener("change", async (event) => {
    const value = event.target.value
    changeCurrentSettings(selector.id, value)
    let data = await getData();
    const filteredData = filterData(data)
    console.log(filteredData.length, "this is filtered")

    await renderUI(filteredData);
  })
})


// this is a helper function that wraps fetch for GET requests, and handles errors
async function queryEndpoint(endpoint) {
  let json = null;
  try {
    const response = await fetch(endpoint);
    // console.log(response);
    if (response.status === 200) {
      json = await response.json();
    }
  } catch (err) {
    console.log('api error');
    console.error(err);
  }
  return json;
}

async function getData(filter, sort) {
  const data = await queryEndpoint(API_PREFIX)
  const cleanData = [];
  data.laureates.forEach((element) => {
    try {
      cleanData.push({
        country: element.birth.place.countryNow.en,
        name: element.fullName.en,
        category: element.nobelPrizes[0].category.en,
        year: element.nobelPrizes[0].awardYear,
        desc: element.nobelPrizes[0].motivation.en,
      });
    }
    catch (err) { }
  });
  return cleanData;
}

function clearUI() {
  while (app.firstChild) {
    app.removeChild(app.firstChild);
  }
}

async function renderUI(data) {
  try {
    clearUI();
    data.forEach((element) => {
      try {
        const item = Object.assign(document.createElement("div"), { className: "item" })
        const itemContent = Object.assign(document.createElement("div"), { className: "content" })
        itemContent.innerHTML = `<h2>${element.category}</h2>\
                                 <h3>${element.year} , ${element.name}</h3>\
                                 <h4>${element.country}</h4>\
                                 <h5>${element.desc}</h5>`
        item.appendChild(itemContent);
        app.appendChild(item);

      }
      catch (err) { }
    });
  }
  catch (err) { }
}

const data = await getData();

await renderUI(data);
