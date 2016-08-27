[![Build Status](https://travis-ci.org/brewk/wowspreadsheet.svg?branch=master)](https://travis-ci.org/brewk/wowspreadsheet)
# wowspreadsheet
World of Warcraft character tracking spreadsheet for Google Docs

 ![spreadsheet](http://bruk.org/wow/images/v1.gif "Spreadsheet")
 
[Home Page](http://bruk.org/wow/)
 
**Keeps track of:**
<ul>
 <li>class, level, specs, average equipped item level, slot item level</li>
 <li>audit with number of issues, as well as detailed info about the issues</li>
 <li>lock outs and progression for all WoD raids, heroic dungeons and world bosses</li>
 <li>legendary ring quest progression</li>
 <li>weeks active for Hellfire Citadel raid</li>
 <li>primary profession levels</li>
 </ul>
 
 Main code is within wow.js, you can copy this into a googlespreadsheets script, or copy a template from here:
 ### [Template](http://docs.google.com/spreadsheets/d/1bSLd9wcOqDxbdxK7JDmzi3hAedbNk2VjuQ0CdAAW13E/edit#gid=1114934197)
 

Other sheets
----
The other files contain code for the other sheets.
### [Check the Wiki](https://github.com/brewk/wowspreadsheet/wiki/Other-Spreadsheets) for details!

Contributing
---
To run the automated checks, install `npm`. Then, install the project dependencies:
````sh
npm install
````
Finally, run the test command to check for issues with any changes you have made:
````sh
npm test
````
