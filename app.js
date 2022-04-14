const express = require("express");
const path = require("path");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
let dataBase = path.join(__dirname, "covid19India.db");
app = express();
app.use(express.json());
let db = null;
const initializeDb = async () => {
  try {
    db = await open({
      filename: dataBase,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running http://localhost:3000 running...");
    });
  } catch (error) {
    console.log(`server error:${error.message}`);
    process.exit(1);
  }
};
initializeDb();

// get request to get  list of all states

app.get("/states/", async (request, response) => {
  let getStatesQuery = `
    SELECT * from state`;
  let states = await db.all(getStatesQuery);
  let result = states.map((each) => {
    let x = {};
    x.stateId = each.state_id;
    x.stateName = each.state_name;
    x.population = each.population;
    return x;
  });
  response.send(result);
});

//get a state based on the state ID

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  let getStateQuery = `
    SELECT * from state
    where state_id = ${stateId};`;
  let stateList = await db.get(getStateQuery);
  let x = {};
  x.stateId = stateList.state_id;
  x.stateName = stateList.state_name;
  x.population = stateList.population;
  response.send(x);
});

// post a new district

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  let postQuery = `
  insert into district 
  (district_name, state_id, cases , cured , active, deaths)
  values 
  ("${districtName}", ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  await db.run(postQuery);
  response.send("District Successfully Added");
});

//get district based on id

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  let getDistrictQuery = `
    SELECT * from district
    where district_id = ${districtId};`;
  let getDistrict = await db.get(getDistrictQuery);
  let x = {};
  x.districtId = getDistrict.district_id;
  x.districtName = getDistrict.district_name;
  x.stateId = getDistrict.state_id;
  x.cases = getDistrict.cases;
  x.cured = getDistrict.cured;
  x.active = getDistrict.active;
  x.deaths = getDistrict.deaths;
  response.send(x);
});

//delete district

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  let deleteQuery = `delete from district 
    where district_id =${districtId};`;
  db.run(deleteQuery);
  response.send("District Removed");
});

//update district

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  let putQuery = `
  update district set  
  
    district_name ="${districtName}" , 
    state_id = ${stateId}, 
    cases =${cases} ,
    cured =${cured} , 
    active = ${active},
    deaths =${deaths}

    where district_id = ${districtId};`;

  await db.run(putQuery);
  response.send("District Details Updated");
});

// get statistics

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  let getReqData = `
    select sum(cases) as totalCases,
    sum(cured) as totalCured,
    sum(active) as totalActive,
    sum(deaths) as totalDeaths 

    from district 

    where state_id = ${stateId};`;

  let stateList = await db.get(getReqData);

  response.send(stateList);
});

// get district

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  let getStatesQuery = `
    select state_name as stateName 
    from 
    state natural join district 
    where 
    district_id=${districtId} 
    ;`;
  let states = await db.get(getStatesQuery);
  response.send(states);
});

module.exports = app;
