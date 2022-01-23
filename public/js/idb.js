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
    // uploadEntry();
  }
};

request.onerror = function (e) {
    console.log(e.target.errorCode);
}