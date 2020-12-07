[![Build Status](https://travis-ci.org/brewk/wowspreadsheet.svg?branch=master)](https://travis-ci.org/brewk/wowspreadsheet)
# wowspreadsheet
World of Warcraft character tracking spreadsheet for Google Docs

 ![spreadsheet](https://bruk.org/wow/images/v2.png "Spreadsheet")
 
[Home Page](http://bruk.org/wow/)
 
**Keeps track of:**
<ul>
 <li>class, level, specs, average equipped item level, slot item level</li>
 <li>audit with number of issues, as well as detailed info about the issues</li>
 <li>lock outs and progression for all raids, heroic and mythic dungeons</li>
 <li>weeks active for raids</li>
 <li>primary profession levels</li>
 <li>reputations</li>
 </ul>
 
 Main code is within wow.js, you can copy this into a googlespreadsheets script, or copy a template from here:
 ### [Template](https://docs.google.com/spreadsheets/u/2/d/1y1__KqE5XpPQLFxQKhPM8v1d5WffpbqPXsb9LhPzGYg/template/preview?usp=drive_web&ouid=%7BuserId%7D )
 

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

