//You can add a refresh button to your spreadsheet by going to the script editor and selecting File > New > Script File and pasting this in
//Alternatively, just paste this at the bottom of the base code
//
//You will need to add $A$1 to your function call, for example, for row 3, the call would be  =wow(A3,C3,B3,$A$1)
//Click and drag the bottom right corner of the edited function call to the rest of the column to quickly change the rest of them
//
//Cell A1 will contain the current date and time. Clicking the Refresh button causes the date to update, which is what causes the values to update.
//Because it is editing a cell, Google docs will ask you for permission to allow it to do so. Don't be afraid. It's just updating the time.
//It is recommended to change this cell to white text so that it's magical properties are ignored
//
//
//
// These two functions were taken from:
// http://stackoverflow.com/questions/9022984/google-apps-script-to-summarise-data-not-updating/9023954#9023954
function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Clicky clicky!",
    functionName : "refreshLastUpdate"
  }];
  sheet.addMenu("? Refresh all Characters", entries);
};

function refreshLastUpdate() {
  SpreadsheetApp.getActiveSpreadsheet().getRange('A1').setValue(new Date().toTimeString());
}

