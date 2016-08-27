//Use this code to output faction (A for Alliance, H for horde, and N for neutral panda)
//Insert code into the main function, somewhere above the toonInfo array is output (currently line 1125)
// Then add faction, into your array output where you want it to display in your spreadsheet
//
//
//  For example, to have faction show up in the column after character's name, change:
//
// var toonInfo = new Array(
//    class, toon.level, mainspec, offspec, eIlvl,
//
// to:
//
// var toonInfo = new Array(
//    faction, class, toon.level, mainspec, offspec, eIlvl,
//
//
// Make sure you add a new column into your spreadsheet for this, by selecting one of the columns next to where you want it, and selecting either column left, or right, accordingly.
/* globals toon */
/* exported faction */

var faction_lookup = {};

faction_lookup["1"] = faction_lookup["3"] =  faction_lookup["4"] =  faction_lookup["7"] =  faction_lookup["11"] = faction_lookup["22"] = faction_lookup["25"] = "A";
faction_lookup["2"] = faction_lookup["5"] =  faction_lookup["6"] =  faction_lookup["8"] =  faction_lookup["9"] =  faction_lookup["10"] =  faction_lookup["26"] = "H";
faction_lookup["24"] = "N";


var faction = faction_lookup[toon.race];
