// create variable to hold db connection
let db;
// create request variable to act as event listener for the db
const request = indexedDB.open("budget_tracker", 1);

// if new version detected, update
request.onupgradeneeded = function (e) {
  // save reference to db
  const db = e.target.result;
  // create object store
  db.createObjectStore("new_entry", { autoIncrement: true });
};

// when db connects successfully...
request.onsuccess = function (e) {
  // save reference to db
  db = e.target.result;

  // check if app is online
  if (navigator.online) {
    uploadEntry();
  }
};

request.onerror = function (e) {
  console.log(e.target.errorCode);
};

// function for saving records to object store
function saveRecord(record) {
  // open new db transaction with read and write permissions
  const transaction = db.transaction(["new_entry"], "readwrite");

  // access the object store for new entries
  const entryObjectStore = transaction.objectStore("new_entry");

  // add record to store
  entryObjectStore.add(record);
}

// function for uploading records from object store once app connects to internet
function uploadEntry() {
  // open db transaction
  const transaction = db.transaction(["new_entry"], "readwrite");

  // access object store
  const entryObjectStore = transaction.objectStore("new_entry");

  // get all records from object store
  const getAll = entryObjectStore.getAll();

  // wait for getAll to finish successfully
  getAll.onsuccess = function () {
    // check if there any data was retrieved from indexedDB
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          // open another transaction to clear uploaded data from indexedDB
          const transaction = db.transaction(["new_entry"], "readwrite");
          const entryObjectStore = transaction.objectStore("new_entry");
          entryObjectStore.clear();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app to come back online
window.addEventListener("online", uploadEntry);
