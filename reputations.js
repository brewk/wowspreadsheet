//  Template for this script: https://docs.google.com/spreadsheets/d/1cFGpazdjZvOvZIHepozE0JABLPpYsblohmSRQdtur6k
/* ***********************************
 ***     Copyright (c) 2016 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
 ***
 ***  Want to keep up to date or suggest modifications to this script?
 ***  then hop on over to http://twitter.com/bruk

 ** SHOUT OUTS / THANKS TO CONTRIBUTORS:
 ** /u/InABohx for massive overhauls to the gem system, help with the final part of the legendary quest, tons of other stuff
 ** /u/jethryn for the awesome job getting the new legendary quest milestone IDs
 ** /u/Kiingzy for enchant id numbers which helped greatly with the audit
 ** all the folks on twitter and reddit who have suggested such great features
 ************************************* */


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ IMPORTANT!!! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//    You need to put your api key here, inside the quotes of line 25
//    Request one here: https://dev.battle.net/apps/register
//    Step by step instructions: http://bruk.org/api
/* globals Utilities, UrlFetchApp */
/* exported reputation */

var apikey = "";


function rep(standing)
{

    switch (standing)
    {
        case 0:
            return "Hated";

        case 1:
            return "Hostile";

        case 2:
            return "Unfriendly";

        case 3:
            return "Neutral";

        case 4:
            return "Friendly";

        case 5:
            return "Honored";

        case 6:
            return "Revered";

        case 7:
            return "Exalted";

        default:
            return "ERROR";
    }

}


function reputation(region,toonName,realmName,factions)
{

    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }


    Utilities.sleep(Math.floor((Math.random() * 10000) + 1000)); // This is a random sleepy time so that we dont spam the api and get bonked with an error

    //Getting rid of any sort of pesky no width white spaces we may run into
    toonName = toonName.replace(/[\u200B-\u200D\uFEFF]/g, "");
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");

    region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9

    var toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=reputation&?locale=en_US&apikey="+apikey+"");
    var toon = JSON.parse(toonJSON.toString());

    var repArray = [ ];

    var factionArray = factions.toString().split(",");

    var reputationLength = toon.reputation.length;
    // XXX: Unused variable?
    //var totalFactions = factionArray.length;


    for (var i=0; i<reputationLength; i++)
    {

        for (var j=0; j<10; j++)
        {
            if (toon.reputation[i].id==factionArray[j])
            {
                repArray[j]=rep(toon.reputation[i].standing);
            }

        }
    }


    return repArray;
}
