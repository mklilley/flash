// See https://github.com/vasanthv/jsonbox for full details of how the
// jsonbox api works

// This function creates a new box ID and came from inspecting
// the index.html code of https://jsonbox.io/
function createUniqueID() {
  var dt = new Date().getTime();
  var uuid = "xxyxxxxxxyxxxxxyxxxx".replace(/[xy]/g, function(c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

// from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
// Used to create a valid api-key
function createUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// This API_BASE is used to make most api requests to create, read, update and
// delete data
const API_BASE = "https://json.lilley.io/flash_";

// This API_BASE_META is being used to test if the service is available
const API_BASE_META = "https://json.lilley.io/_meta/flash_";

// Check to see if the app is already storing data in a jsonbox and if not then
// create a new boxID to be used as such.
let boxID = localStorage.getItem("jsonbox");
if (boxID === null) {
  boxID = createUniqueID();
  localStorage.setItem("jsonbox", boxID);
}

// Check to see if the app has any apiKeys set and if not then attach one
// to the current jsonbox
let apiKey;
let apiKeys = JSON.parse(localStorage.getItem("apiKeys"));
if (apiKeys === null) {
  apiKey = createUUID();
  localStorage.setItem("apiKeys", JSON.stringify({ [boxID]: apiKey }));
} else {
  apiKey = apiKeys[boxID];
}

let API_URL = API_BASE + boxID;
let API_META_URL = API_BASE_META + boxID;

// Box object is composed of:
// id     : The jsonbox ID currently being used
// apiKey : The jsonbox apiKey assigned to the current jsonbox
// status : Function to check whether jsonbox is up and running
// switch : Function to switch the existing jsonbox ID to a new one specified by the user
// create : Function to create a new "document" in the jsonbox
// read   : Function to get data for a specific "document" from the jsonbox or
//          get all documents
// update : Function to update the data for a specific "document" from the jsonbox
// delete : Function to delete a specific "document" from the jsonbox
const box = {
  id: async function() {
    let boxID = localStorage.getItem("jsonbox");
    return boxID;
  },
  apiKey: async function() {
    return apiKey;
  },
  status: async function() {
    const options = {
      method: "GET"
    };

    const response = await fetch(API_META_URL, options).catch(err => {
      console.log(err);
    });

    if ((response || {}).ok) {
      return true;
    } else {
      return false;
    }
  },
  switch: async function(newBoxID, newApiKey) {
    // In case the HTML code doesn't work as expected, lower case and trim user input
    newBoxID = newBoxID.toLowerCase().trim();

    // Check that the user has entered a valid boxID, i.e.
    // 20 character HEX string
    let isHex20 = newBoxID.match("^[0-9a-f]{20}$");
    if (isHex20 !== null) {
      localStorage.setItem("jsonbox", newBoxID);

      API_URL = API_BASE + newBoxID;
      API_META_URL = API_BASE_META + newBoxID;

      // TODO: check validity of newApiKey
      let apiKeys = JSON.parse(localStorage.getItem("apiKeys"));
      apiKeys[newBoxID] = newApiKey ? newApiKey : "";
      localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
      apiKey = apiKeys[newBoxID];

      return true;
    } else {
      return false;
    }
  },
  create: async function(data) {
    const options = {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    };
    if (apiKey) {
      options.headers["X-API-KEY"] = apiKey;
    }

    const response = await fetch(API_URL, options).catch(err => {
      console.log(err);
    });

    if ((response || {}).ok) {
      // if response is ok then echo back the original data including the
      // jsonbox id for the document
      let json = await response.json();
      data.id = json["_id"];
      return data;
    } else {
      return false;
    }
  },
  read: async function(id) {
    const options = {
      method: "GET"
    };
    let response;

    if (id === undefined) {
      response = await fetch(API_URL, options).catch(err => {
        console.log(err);
      });
    } else {
      response = await fetch(API_URL + "/" + id, options).catch(err => {
        console.log(err);
      });
    }

    if ((response || {}).ok) {
      let json = await response.json();

      let allItems = {};

      // Rename the json data "_id" keys to "id"
      json.forEach(item => {
        item.id = item["_id"];
        delete item["_id"];
        // Add the update item to allItems
        allItems[item.id] = item;
      });

      return allItems;
    } else {
      return false;
    }
  },
  update: async function(id, data) {
    const options = {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      method: "PUT"
    };
    if (apiKey) {
      options.headers["X-API-KEY"] = apiKey;
    }

    const response = await fetch(API_URL + "/" + id, options).catch(err => {
      console.log(err);
    });

    if ((response || {}).ok) {
      return response.json();
    } else {
      return false;
    }
  },
  delete: async function(id) {
    const options = {
      method: "DELETE"
    };
    if (apiKey) {
      options.headers = { "X-API-KEY": apiKey };
    }
    let response;

    response = await fetch(API_URL + "/" + id, options).catch(err => {
      console.log(err);
    });

    if ((response || {}).ok) {
      return response.json();
    } else {
      return false;
    }
  }
};

export { box };
