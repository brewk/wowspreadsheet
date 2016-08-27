/* ***********************************
 ***     Copyright (c) 2016 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
 **********************************  */


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ IMPORTANT!!! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//    You need to put your api key here
//    Request one here: https://dev.battle.net/apps/register
//    Step by step instructions: http://bruk.org/api
//   if you have this as part of a combined spreadsheet you can comment it out instead

var apikey = "";


// Returns 3 columns, Ilvl, Wowheadlink, and Item name, last number in output is Average Item Level
//
//    formula usage =transpose((region, toonName, realm))
//
//  Example Template: https://docs.google.com/spreadsheets/d/1Zka57W8mNCCTakmnRnH8Bf-E52hJoxuldwaed003kxc/edit?usp=sharing
//  Spreadsheet layout design by /u/robinnymann
//
// Recommended Formatting:
// Create a Hyperlink to combine the link and item name, then HIDE the two columns used:
//   =hyperlink(URLCOLUMNID, NAMECOLUMNID)
//

/* global UrlFetchApp */
/* exported items */


function items(region, toonName, realm)
{

    var itemName = toonName.replace(/[\u200B-\u200D\uFEFF]/g, "");
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realm = realm.replace(/[\u200B-\u200D\uFEFF]/g, "");


    if (!itemName || itemName== "Charactername" || !region || !realm || realm == "Charactername")
    {
        return "\u2063";  // If there's nothing in the column, don't even bother calling the API
    }


    var itemJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realm+"/"+toonName+"?fields=items&?locale=en_US&apikey="+apikey+"");
    var item = JSON.parse(itemJSON.getContentText());


    var rows = [ ]; //gonna make a cute lil array of arrays to cut down on the calls to the api


    // doing some checking for an offhand to pervent errors
    var offHandId = "\u2063";
    var offHandName = "\u2063";
    var offHandIlvl = "\u2063";


    if ( item.items.offHand)
    {
        offHandId =  "http://wowhead.com/item="+item.items.offHand.id+"";
        offHandName =  item.items.offHand.name;
        offHandIlvl =  item.items.offHand.itemLevel;
    }


    var mainHandId = "\u2063";
    var mainHandName = "\u2063";
    var mainHandIlvl = "\u2063";


    if ( item.items.mainHand)
    {
        mainHandId =  "http://wowhead.com/item="+item.items.mainHand.id+"";
        mainHandName =  item.items.mainHand.name;
        mainHandIlvl =  item.items.mainHand.itemLevel;
    }

    var headId = "\u2063";
    var headName = "\u2063";
    var headIlvl = "\u2063";


    if ( item.items.head)
    {
        headId =  "http://wowhead.com/item="+item.items.head.id+"";
        headName =  item.items.head.name;
        headIlvl =  item.items.head.itemLevel;
    }

    var neckId = "\u2063";
    var neckName = "\u2063";
    var neckIlvl = "\u2063";


    if ( item.items.neck)
    {
        neckId =  "http://wowhead.com/item="+item.items.neck.id+"";
        neckName =  item.items.neck.name;
        neckIlvl =  item.items.neck.itemLevel;
    }

    var shoulderId = "\u2063";
    var shoulderName = "\u2063";
    var shoulderIlvl = "\u2063";


    if ( item.items.shoulder)
    {
        shoulderId =  "http://wowhead.com/item="+item.items.shoulder.id+"";
        shoulderName =  item.items.shoulder.name;
        shoulderIlvl =  item.items.shoulder.itemLevel;
    }


    var backId = "\u2063";
    var backName = "\u2063";
    var backIlvl = "\u2063";


    if ( item.items.back)
    {
        backId =  "http://wowhead.com/item="+item.items.back.id+"";
        backName =  item.items.back.name;
        backIlvl =  item.items.back.itemLevel;
    }

    var chestId = "\u2063";
    var chestName = "\u2063";
    var chestIlvl = "\u2063";


    if ( item.items.chest)
    {
        chestId =  "http://wowhead.com/item="+item.items.chest.id+"";
        chestName =  item.items.chest.name;
        chestIlvl =  item.items.chest.itemLevel;
    }

    var wristId = "\u2063";
    var wristName = "\u2063";
    var wristIlvl = "\u2063";


    if ( item.items.wrist)
    {
        wristId =  "http://wowhead.com/item="+item.items.wrist.id+"";
        wristName =  item.items.wrist.name;
        wristIlvl =  item.items.wrist.itemLevel;
    }

    var handsId = "\u2063";
    var handsName = "\u2063";
    var handsIlvl = "\u2063";


    if ( item.items.hands)
    {
        handsId =  "http://wowhead.com/item="+item.items.hands.id+"";
        handsName =  item.items.hands.name;
        handsIlvl =  item.items.hands.itemLevel;
    }


    var waistId = "\u2063";
    var waistName = "\u2063";
    var waistIlvl = "\u2063";


    if ( item.items.waist)
    {
        waistId =  "http://wowhead.com/item="+item.items.waist.id+"";
        waistName =  item.items.waist.name;
        waistIlvl =  item.items.waist.itemLevel;
    }

    var legsId = "\u2063";
    var legsName = "\u2063";
    var legsIlvl = "\u2063";


    if ( item.items.legs)
    {
        legsId =  "http://wowhead.com/item="+item.items.legs.id+"";
        legsName =  item.items.legs.name;
        legsIlvl =  item.items.legs.itemLevel;
    }

    var feetId = "\u2063";
    var feetName = "\u2063";
    var feetIlvl = "\u2063";


    if ( item.items.feet)
    {
        feetId =  "http://wowhead.com/item="+item.items.feet.id+"";
        feetName =  item.items.feet.name;
        feetIlvl =  item.items.feet.itemLevel;
    }


    var finger1Id = "\u2063";
    var finger1Name = "\u2063";
    var finger1Ilvl = "\u2063";


    if ( item.items.finger1)
    {
        finger1Id =  "http://wowhead.com/item="+item.items.finger1.id+"";
        finger1Name =  item.items.finger1.name;
        finger1Ilvl =  item.items.finger1.itemLevel;
    }


    var finger2Id = "\u2063";
    var finger2Name = "\u2063";
    var finger2Ilvl = "\u2063";


    if ( item.items.finger2)
    {
        finger2Id =  "http://wowhead.com/item="+item.items.finger2.id+"";
        finger2Name =  item.items.finger2.name;
        finger2Ilvl =  item.items.finger2.itemLevel;
    }

    var trinket1Id = "\u2063";
    var trinket1Name = "\u2063";
    var trinket1Ilvl = "\u2063";


    if ( item.items.trinket1)
    {
        trinket1Id =  "http://wowhead.com/item="+item.items.trinket1.id+"";
        trinket1Name =  item.items.trinket1.name;
        trinket1Ilvl =  item.items.trinket1.itemLevel;
    }

    var trinket2Id = "\u2063";
    var trinket2Name = "\u2063";
    var trinket2Ilvl = "\u2063";


    if ( item.items.trinket2)
    {
        trinket2Id =  "http://wowhead.com/item="+item.items.trinket2.id+"";
        trinket2Name =  item.items.trinket2.name;
        trinket2Ilvl =  item.items.trinket2.itemLevel;
    }


    var column0 = [
        mainHandIlvl,
        offHandIlvl,
        headIlvl,
        neckIlvl,
        shoulderIlvl,
        backIlvl,
        chestIlvl,
        wristIlvl,
        handsIlvl,
        waistIlvl,
        legsIlvl,
        feetIlvl,
        finger1Ilvl,
        finger2Ilvl,
        trinket1Ilvl,
        trinket2Ilvl,
        item.items.averageItemLevel
    ];

    rows.push(column0);


    var column1 = [
        mainHandId,
        offHandId,
        headId,
        neckId,
        shoulderId,
        backId,
        chestId,
        wristId,
        handsId,
        waistId,
        legsId,
        feetId,
        finger1Id,
        finger2Id,
        trinket1Id,
        trinket2Id
    ];

    rows.push(column1);


    var column2 = [
        mainHandName,
        offHandName,
        headName,
        neckName,
        shoulderName,
        backName,
        chestName,
        wristName,
        handsName,
        waistName,
        legsName,
        feetName,
        finger1Name,
        finger2Name,
        trinket1Name,
        trinket2Name
    ];

    rows.push(column2);

    return rows;


}
