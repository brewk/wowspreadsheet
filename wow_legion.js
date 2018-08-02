/* ***********************************
 ***     Copyright (c) 2018 bruk
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
//    You need to put your api key here, inside the quotes
//    Request one here: https://dev.battle.net/apps/register
//    Step by step instructions: http://bruk.org/api
var apikey = "";


// Change this to the threshold you want to start checking for epic gems (ie: if it's 709 anything 710 or above will be checked for epic gems)
var CONST_EPICGEM_ILVL = 160;

// You shouldn't need to change this, but this is threshold item level where gear is checked for enchants and gems
var CONST_AUDIT_ILVL = 160;

// Set this to be the minimum iLvl of the current raid's tier gear (helps weed out the tier column noise)
var CONST_TIER_GEAR_ILVL =160;

//If you want total AP gathered displayed next to highest weapon rank, change this to true
var showTotalArtifactPower = false;

//If you want Legendary items to be marked with a + next to item level (use conditional formatting to change their color) change this to true

var markLegendary = false;

//If you want Pantheon Trinkets to be marked with a 'p' next to item level (use conditional formatting to change their color) change this to true
var markPantheon = false;

// Everything below this, you shouldn't have to edit
//***************************************************************
/* globals Utilities, UrlFetchApp, Logger */
/* exported wow, vercheck */

var current_version = 3.4;


function relic(equippedRelic)
{
    var id = equippedRelic.itemId;

    if (id == 140070)
    {
        return "Frost +45 ilvls";
    }

    var bonusLists = "";
    equippedRelic.bonusLists.forEach(function(bonusListNumber)
    {
        bonusLists = bonusLists +  bonusListNumber + ",";
    });
    Utilities.sleep(500);
    var relicDat = "";
    var relicJSON ="";
    {
        try
        {
            relicJSON = UrlFetchApp.fetch("https://us.api.battle.net/wow/item/"+id+"?bl="+bonusLists+"&locale=en_US&apikey="+apikey+"");
            relicDat = JSON.parse(relicJSON.toString());
        }
        catch (e)
        {
            Logger.log("Error Fetching:  "+ e.message);
        }
        Logger.log(relicDat);
    }

    var elementType = relicDat.gemInfo.type.type;

    if (elementType === "WIND") //Fixing a bug on Blizzard's end for the storm relic
    {
        elementType = "STORM";
    }

    var ilvl = relicDat.itemLevel;

   //@Corazu: ilvl is wonky for lower level where they aren't necessarily on increments of 5. 3 rounds down, 8 rounds up
   //the data is collected via item links in game to get the right +ilvl bonus for each ilvl of relic. The data may be incomplete
   //for certain increments that aren't 5, even with the rounding, as there are gaps in between the 5 increments where the +ilvl
   //bonus jumps by more than 1, leaving room for say, a xx8 to be in the middle.
   //At some point for posterity I'll probably come back and fix those cases, but it's a lot of manual work to hand-check all the values
    /*if (ilvl%5!=0)
    {
        var spare = ilvl%10;
        if (spare<=3)
        {
            ilvl-=spare;
        }
        else
        {
            ilvl+=(5-spare);
        }

    }*/

    var relicIlvl = 0;
    if (ilvl<=141)
    {
        relicIlvl = 2; //anything less than this adds 2
    }
    else if (ilvl == 870)
    {
        relicIlvl="22";
    }
    else if (ilvl > 500)
    {
        relicIlvl = "??? item: " + id  + " (" + ilvl + ")";
    }
    else if (ilvl > 255)
    {
        relicIlvl = ">35";
    }
    else
   {
        switch (ilvl)
       {
            case (142): relicIlvl="3"; break;
            case (144): relicIlvl="3"; break;            
            case (145): relicIlvl="3"; break;
            case (147): relicIlvl="4"; break;
            case (148): relicIlvl="4"; break;
            case (149): relicIlvl="5"; break;
            case (156): relicIlvl="7"; break;
            case (158): relicIlvl="7"; break;
            case (160): relicIlvl="8"; break;
            case (161): relicIlvl="8"; break;
            case (162): relicIlvl="8"; break;
            case (164): relicIlvl="9"; break;
            case (166): relicIlvl="9"; break;
            case (168): relicIlvl="10"; break;
            case (167): relicIlvl="10?"; break;
            case (169): relicIlvl="10??"; break;
            case (171): relicIlvl="10???"; break;
            case (170): relicIlvl="11"; break;
            case (172): relicIlvl="11"; break;
            case (176): relicIlvl="12"; break;
            case (173): relicIlvl="12"; break;
            case (174): relicIlvl="12"; break;
            case (175): relicIlvl="12"; break;
            case (178): relicIlvl="13"; break;
            case (180): relicIlvl="13"; break;
            case (182): relicIlvl="14"; break;
            case (183): relicIlvl="15?"; break;
            case (184): relicIlvl="15"; break;
            case (185): relicIlvl="15"; break;
            case (186): relicIlvl="15"; break;
            case (187): relicIlvl="16??"; break;
            case (188): relicIlvl="16"; break;
            case (189): relicIlvl="16??"; break;
            case (190): relicIlvl="16"; break;
            case (191): relicIlvl="16???"; break;
            case (192): relicIlvl="17"; break;
            case (193): relicIlvl="17?"; break;
            case (194): relicIlvl="17"; break;
            case (195): relicIlvl="18"; break;
            case (198): relicIlvl="19"; break;
            case (199): relicIlvl="19?"; break;
            case (200): relicIlvl="20"; break;
            case (201): relicIlvl="20?"; break;
            case (202): relicIlvl="20??"; break;
            case (203): relicIlvl="20"; break;
            case (204): relicIlvl="20"; break;
            case (205): relicIlvl="20"; break;
            case (208): relicIlvl="21"; break;
            case (210): relicIlvl="22"; break;
            case (213): relicIlvl="23"; break;
            case (215): relicIlvl="23"; break;
            case (220): relicIlvl="25"; break;
            case (223): relicIlvl="26"; break;
            case (225): relicIlvl="26"; break;
            case (228): relicIlvl="27"; break;
            case (230): relicIlvl="27"; break;           
            case (235): relicIlvl="29"; break;
            case (240): relicIlvl="30"; break;
            case (243): relicIlvl="31"; break;
            case (245): relicIlvl="32"; break;           
            case (250): relicIlvl="33"; break;
            case (255): relicIlvl="35"; break;
           
            default: relicIlvl="???";
        }
    }
    return elementType+" +"+relicIlvl+" ilvls";
}

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

//thanks to github user bloodrash for this function
function numberWithCommas(x)
{
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function wow(region,toonName,realmName)
{

    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }

    if (!apikey)
    {
        return "Error: No API key entered. Please visit http://dev.battle.net/ to obtain one. Instructions availible at http://bruk.org/wow";
    }


    Utilities.sleep(Math.floor((Math.random() * 10000) + 1000)); // This is a random sleepy time so that we dont spam the api and get bonked with an error

    //Getting rid of any sort of pesky no width white spaces we may run into
    toonName = toonName.replace(/[\u200B-\u200D\uFEFF]/g, "");
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");

    region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9

    var options={ muteHttpExceptions:true };
    var toon = "";

    while (!toon.name)  //try again because of these frequent timeouts
    {
        try
        {
            var  toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=reputation,statistics,items,quests,achievements,audit,progression,feed,professions,talents&?locale=en_US&apikey="+apikey+"", options);
            toon = JSON.parse(toonJSON.toString());
        }
        catch (e)
        {
            Logger.log("Error Fetching:  "+ e.message);
        }
        Logger.log(toonJSON);
    }

    var mainspec = "none";
    for (var i = 0; i < 4; i++)
    {
        if (toon.talents[i].selected === true)
        {
            mainspec=toon.talents[i].spec.name;
        }
    }

    // figuring out what the class is
    var toon_class = 0;

    switch (toon.class)
    {
        case 1:
            toon_class = "Warrior";
            break;
        case 2:
            toon_class = "Paladin";
            break;
        case 3:
            toon_class = "Hunter";
            break;
        case 4:
            toon_class = "Rogue";
            break;
        case 5:
            toon_class = "Priest";
            break;
        case 6:
            toon_class = "DeathKnight";
            break;
        case 7:
            toon_class = "Shaman";
            break;
        case 8:
            toon_class = "Mage";
            break;
        case 9:
            toon_class = "Warlock";
            break;
        case 10:
            toon_class = "Monk";
            break;
        case 11:
            toon_class = "Druid";
            break;
        case 12:
            toon_class = "Demon Hunter";
            break;
        default:
            toon_class = "?";
    }


    // Time to do some gear audits
    var auditInfo ="";

    var totalGems = [0, 0, 0, 0];

    var gemAudit = [
        { bool: 0, issue: " Old:" },
        { bool: 0, issue: " Cheap:" },
        { bool: 0, issue: " No Prime Stat Epic" },    // this was a list of non-epic gems, when they weren't unique
        { bool: 0, issue: " Mixed Gems" }
    ];

    var gemStats = [
        { value: 0, stat: "Crit" },
        { value: 0, stat: "Haste" },
        { value: 0, stat: "Vers" },
        { value: 0, stat: "Mast" },
        { value: 0, stat: "Str" },
        { value: 0, stat: "Agi" },
        { value: 0, stat: "Int" },
        { value: 0, stat: "Crit" },  //look, this is gonna be weird.. but it's for the new epic gems which are weirdly numbered and different from previous order
        { value: 0, stat: "-" },
        { value: 0, stat: "-" },
        { value: 0, stat: "Haste" },
        { value: 0, stat: "Mast" },
        { value: 0, stat: "Vers" },
    ];


    // I love me some look up tables! These are to check if you have a crappy enchant or gem
    var audit_lookup = {};

    //cheap enchants and gems

    //ring
    audit_lookup["5423"] = "Word +150C";
    audit_lookup["5424"] = "Word +150H";
    audit_lookup["5425"] = "Word +150M";
    audit_lookup["5426"] = "Word +150V";
    //cloak
    audit_lookup["5431"] = "Word +150S";
    audit_lookup["5432"] = "Word +150A";
    audit_lookup["5433"] = "Word +150I";
    //gems
    audit_lookup["130218"] =
        audit_lookup["130217"] =
        audit_lookup["130216"] =
        audit_lookup["130215"] = 0;

    //better enchants and gems

    //ring
    audit_lookup["5427"] = "Binding +200C";
    audit_lookup["5428"] = "Binding +200H";
    audit_lookup["5429"] = "Binding +200M";
    audit_lookup["5430"] = "Binding +200V";

        //cloak
    audit_lookup["5434"] = "Binding +200S";
    audit_lookup["5435"] = "Binding +200A";
    audit_lookup["5436"] = "Binding +200I";

        //gems
    audit_lookup["130219"] =
        audit_lookup["130220"] =
        audit_lookup["130221"] =
        audit_lookup["130222"] =1;

    //epic gems
    audit_lookup["130246"] =         //strengh
        audit_lookup["130247"] =     //agility
        audit_lookup["130248"] =  2; //Int

    // NEW epic gems
    audit_lookup["151580"] =
        audit_lookup["151583"] =
        audit_lookup["151584"] =
        audit_lookup["151585"] = 3;

    //neck
    audit_lookup["5437"] = "Claw";
    audit_lookup["5438"] = "Army";
    audit_lookup["5439"] = "Satyr";
    audit_lookup["5889"] = "Hide";
    audit_lookup["5890"] = "Soldier";
    audit_lookup["5891"] = "Priestess";


    audit_lookup["5895"] = "Master";
    audit_lookup["5896"] = "Versatile";
    audit_lookup["5897"] = "Quick";
    audit_lookup["5898"] = "Deadly";


  //shoulder
    audit_lookup["5440"] = "Scavenger (cloth)";
    audit_lookup["5441"] = "Gemfinder";
    audit_lookup["5442"] = "Harvester (herbs/fish)";
    audit_lookup["5443"] = "Butcher (leather/meat)";
    audit_lookup["5882"] = "Manaseeker (enchant)";
    audit_lookup["5881"] = "Salvager (ore/armor)";
    audit_lookup["5883"] = "Bloodhunter (Blood)";
    audit_lookup["5900"] = "Zookeeper (Pet)";
    audit_lookup["5888"] = "Netherdrift";
    audit_lookup["5899"] = "Builder (Engineer)";


  //gloves
    audit_lookup["5444"] = "Herb";
    audit_lookup["5445"] = "Mine";
    audit_lookup["5446"] = "Skin";
    audit_lookup["5447"] = "Survey";

    var thumbnail = "http://render-"+region+".worldofwarcraft.com/character/"+  toon.thumbnail;
    var armory = "http://"+region+".battle.net/wow/en/character/"+realmName+"/"+toonName+"/";

    var tier = " ";
    var tier_pieces = [toon.items.head,toon.items.shoulder,toon.items.chest,toon.items.hands,toon.items.legs,toon.items.back];

    var set1 = [];
    var set2 = [];

    //var gemMatch = 0; //check if our rare/uncommon gems match

    for (i = 0; i < tier_pieces.length; i++)
    {
        if (tier_pieces[i] && tier_pieces[i].tooltipParams.set && tier_pieces[i].itemLevel >= CONST_TIER_GEAR_ILVL)
        {
            if (!set1.length)
            {
                set1 = tier_pieces[i].tooltipParams.set;
            }

            if (!set2.length && set1.indexOf(tier_pieces[i].id) ==-1)
            {
                set2 = tier_pieces[i].tooltipParams.set;
            }
        }
    }

    if (set2.length)
    {
        tier = set1.length + "/" + set2.length;
    }
    else
    {
        tier = set1.length;
    }

    var allItems={
        equippedItems:0,
        totalIlvl:0,
        upgrade: {
            total:0,
            current:0
        }
    };
    var enchantableItems=["neck","back","finger1","finger2","hands","shoulder"];
    var getItemInfo = function (item, slot)
    {
        allItems[slot] = {
            ilvl:"\u2063",
            upgrade:"-"
        };

        if (item)
        {
            if (item.tooltipParams.upgrade)
            {
                allItems[slot].upgrade= item.tooltipParams.upgrade.current + "/" + item.tooltipParams.upgrade.total;
                allItems.upgrade.total+=item.tooltipParams.upgrade.total;
                allItems.upgrade.current+=item.tooltipParams.upgrade.current;
            }

            //crafted gear upgrade stuff
            var obliterum = 11; //current cap for obliterum upgrades
            var craftedUpgrade = -1;

            for (var j = 0; j < item.bonusLists.length; j++)
            {
                switch (item.bonusLists[j])
                {
                    case 596:
                        craftedUpgrade = 0;
                        break;
                    case 597:
                        craftedUpgrade = 1;
                        break;
                    case 598:
                        craftedUpgrade = 2;
                        break;
                    case 599:
                        craftedUpgrade = 3;
                        break;
                    case 666:
                        craftedUpgrade = 4;
                        break;
                    case 667:
                        craftedUpgrade = 5;
                        break;
                    case 668:
                        craftedUpgrade = 6;
                        break;
                    case 669:
                        craftedUpgrade = 7;
                        break;
                    case 670:
                        craftedUpgrade = 8;
                        break;
                    case 671:
                        craftedUpgrade = 9;
                        break;
                    case 672:
                        craftedUpgrade = 10;
                        break;
                    default:
                        craftedUpgrade = "-";

                }
            }

            if (craftedUpgrade > -1)
            {
                allItems[slot].upgrade= craftedUpgrade + "/" + obliterum;
                allItems.upgrade.total+=obliterum;
                allItems.upgrade.current+=craftedUpgrade;
            }

            allItems.equippedItems++;
            allItems[slot].ilvl = item.itemLevel;
            allItems.totalIlvl += item.itemLevel;

            //temporary workaround for armory still returning wrong ilvl (895 instead of 910) for legion legendaries
            //provided by @lifeguttter
            //modified to use bonuslist for 940 instead of 910
            /*if (item.quality == 5)
            {
                if (item.bonusLists[0] == 3529)
                {
                    allItems[slot].ilvl = 940;
                    // allItems.totalIlvl += 30;  Believe this line was not needed, it was causing ilvl to be too high
                }
            }*/

            if (item.quality === 5 && markLegendary)
            {
                allItems[slot].ilvl = allItems[slot].ilvl + "+";  // * can be any character you want, use it for your conditional
            }

            if ((item.id === 154172 || item.id === 154176 || item.id === 154175 || item.id === 154177 || item.id === 154174 || item.id === 154173 || item.id === 147002 ) && markPantheon)
            {
                allItems[slot].ilvl = allItems[slot].ilvl + "p";  // * can be any character you want, use it for your conditional
            }

            if (item.itemLevel > CONST_AUDIT_ILVL)
            {
                if (item.tooltipParams.gem0&&slot!="mainHand"&&slot!="offHand")
                {
                    if (item.tooltipParams.gem0 > 151579)  // new epic gems
                   {
                        gemStats[item.tooltipParams.gem0-151580+7].value = gemStats[item.tooltipParams.gem0-151580+7].value+200;
                    }
                    else if (item.tooltipParams.gem0 > 130245) //(epic) I think this could be beautified/simplifed, basically it adds to the stat value for each quality
                   {
                        gemStats[item.tooltipParams.gem0-130246+4].value = gemStats[item.tooltipParams.gem0-130246+4].value+200;
                    }
                    else if (item.tooltipParams.gem0 > 130218) //(rare)
                   {
                        gemStats[item.tooltipParams.gem0-130219].value = gemStats[item.tooltipParams.gem0-130219].value+150;
                    }
                    else if (item.tooltipParams.gem0 > 130214) //(uncommon)
                   {
                        gemStats[item.tooltipParams.gem0-130215].value = gemStats [item.tooltipParams.gem0-130215].value+100;
                    }

                    if (item.itemLevel>CONST_EPICGEM_ILVL)
                    {
                        if (audit_lookup[item.tooltipParams.gem0] == 2)  //this was set to != when epic gems weren't unique
                        {
                            gemAudit[2].bool = 0;
                            //gemAudit[2].bool = 1;
                            //gemAudit[2].issue += " "+ slot;
                        }
                    }

                    else if (audit_lookup[item.tooltipParams.gem0] === 0)
                    {
                        gemAudit[1].bool = 1;
                        gemAudit[1].issue += " " + slot;
                    }
                    else if (audit_lookup[item.tooltipParams.gem0] != 1)
                    {
                        gemAudit[0].bool = 1;
                        gemAudit[0].issue += " " + slot;

                    }

                  /* //Mixed Gems - if a gem is not epic, check if it has the same stat type, if so, then copy it into gemMatch to compare it to the next one
                    if (audit_lookup[item.tooltipParams.gem0] != 2 && (gemMatch == 0 || gemMatch === item.tooltipParams.gem0 || gemMatch === item.tooltipParams.gem0+4 || gemMatch === item.tooltipParams.gem0-4))
                    {
                        gemMatch = item.tooltipParams.gem0;
                    }
                    else if (audit_lookup[item.tooltipParams.gem0] != 2 && audit_lookup[item.tooltipParams.gem0] > -1)
                    {
                        gemAudit[3].bool = 1; // if we fail to pass the above if, the stats don't match on our gems
                    }*/

                    totalGems[audit_lookup[item.tooltipParams.gem0]]++;
                }

                if (enchantableItems.indexOf(slot)!=-1)
                {
                    allItems[slot].enchant= "None";
                    if (item.tooltipParams.enchant)
                    {
                        if (audit_lookup[item.tooltipParams.enchant])
                        {
                            allItems[slot].enchant = audit_lookup[item.tooltipParams.enchant];
                        }
                        else
                        {
                            allItems[slot].enchant = "Old";
                        }
                    }
                }
            }
        }
    };

    var sortOrder = [
        "head",
        "neck",
        "shoulder",
        "back",
        "chest",
        "wrist",
        "hands",
        "waist",
        "legs",
        "feet",
        "finger1",
        "finger2",
        "trinket1",
        "trinket2",
        "mainHand",
        "offHand"
    ];

    for (i = 0; i < sortOrder.length; i++)
    {
        getItemInfo(toon.items[sortOrder[i]],sortOrder[i]);
    }


   //always put the higher level trinket/ring on the leftier column
    var bruksOCDswap = function (item1,item2)
    {
        if (allItems[item1].ilvl<allItems[item2].ilvl)
        {
            var swapValue = allItems[item1].ilvl;
            allItems[item1].ilvl = allItems[item2].ilvl;
            allItems[item2].ilvl = swapValue;
        }
    };

    bruksOCDswap("finger1","finger2");
    bruksOCDswap("trinket1","trinket2");

    // /u/orange_gauss supplied this for fixing the double weight of 2handers
    if (allItems.offHand.ilvl == "\u2063" )
   {
        allItems.totalIlvl += allItems.mainHand.ilvl;
        allItems.equippedItems += 1;
    }

    allItems.averageIlvl = allItems.totalIlvl / allItems.equippedItems;

    //fall back to max unequipped ilvl if they're currently partially nude
    if (isNaN(allItems.averageIlvl))
    {
        allItems.averageIlvl = toon.items.averageItemLevel;
    }

    if (toon.audit.emptySockets !== 0)
    {
        auditInfo = auditInfo + "Empty Gem Sockets: " + toon.audit.emptySockets + " ";
    }


    if (totalGems[0]+totalGems[1]+totalGems[2]+totalGems[3]>0) //gems exist!
    {
        auditInfo = auditInfo + "Gems" ;

        if (totalGems[0] > 0)
        {
            auditInfo = auditInfo + " UnCom:" + totalGems[0];
        }

        if (totalGems[1] > 0)
        {
            auditInfo = auditInfo + " Rare:" + totalGems[1];
        }

        if (totalGems[3] > 0)
        {
            auditInfo = auditInfo + " Epic:" + totalGems[3];
        }

        if (totalGems[2] > 0)
        {
            auditInfo = auditInfo + " PrimeEpic:" + totalGems[2];
        }

        for (i=0; i<gemStats.length; i++)
        {
            if (gemStats[i].value > 0)
            {
                auditInfo = auditInfo + " +" + gemStats[i].value + gemStats[i].stat + " ";
            }
        }

    }

    for (i=0; i<gemAudit.length; i++)
    {
        if (gemAudit[i].bool > 0)
        {
            auditInfo = auditInfo + gemAudit[i].issue;
        }
    }


    // lock out "Weekly checker"
    var todayStamp =new Date();
    var today = todayStamp.getDay();
    var sinceYesterday  = 0;
    var now = todayStamp.getHours();
    var resetTime = new Date();

    var offset = new Date().getTimezoneOffset();
    offset=offset/60;

    if (region == "us")
    {
        resetTime.setHours(15-offset,0,0,0);
    }
    else
    {
        resetTime.setHours(7-offset,0,0,0);
    }


    sinceYesterday = resetTime.getTime();


    //attempt to fix post-midnight pre-reset
    if (now < 15-offset && now > -1 && region == "us") //if it's after midnight but before 11am
    {
        sinceYesterday-=86400000;
    }

    if (now < 7-offset && now > -1 && region == "eu") //if it's after midnight but before 7am
    {
        sinceYesterday-=86400000;
    }


    // now we have to figure out how long it's been since tuesday
    var sinceTuesday =new Date();

    var reset = region == "eu" ? 3 : 2;  // 2 for tuesday, 3 for wednesday

    var midnight = new Date();
    midnight.setHours(0,0,0,0);

    sinceTuesday = resetTime*1;

    if (today == reset)  //it IS tuesday!
    {
        //attempt to fix post-midnight pre-reset
        if ((now < 7-offset && now > -1 && region == "eu") || (now < 15-offset && now > -1 && region == "us")) //if it's after midnight but before 7am
        {
            sinceTuesday-=(86400000*7);
        }
    }

    if (today > reset)
    {
        // wednesday (thurs eu) - saturday
        sinceTuesday = sinceTuesday-(today-reset)*86400000;
    }

    else if (today < reset)
    {
        // sunday + monday (tues eu)
        sinceTuesday = sinceTuesday-((7+today-reset))*86400000; // this was 6, but to account for EU it was changed to 7-reset to be either 6 or 5 to account for Wednesday resets
    }

    // Raid stat sub-categories
    var STATS_RAIDS_LEGION = 6;
    var raidInstancesSortOrder = [];
    var raidDifficultySortOrder = ["Raid Finder", "Normal", "Heroic", "Mythic"];
    for (i = 35; i <= 39; i++) // legion raids up to ToS increase 38 if new raid comes
    {
        raidInstancesSortOrder.push(toon.progression.raids[i].name);
    }
    var instanceDetails = { "dungeons":{},"raids":{} };
    for (i in raidInstancesSortOrder)
    {
        instanceDetails.raids[raidInstancesSortOrder[i]] = {};
    }
    var getShortInstanceName = function (inputString)
    {
        var split = inputString.split(" ");
        if (split.length !== 1)
        {
            var retstring = "";
            for (i in split)
            {
                retstring = retstring + split[i].slice(0, 1);
            }
            return retstring;
        }
        else
        {
            return split[0].slice(0,3).toUpperCase();
        }
    };
    var getRaidAndBossName = function(inputString)
    {
        var info = "";

        //attempt to get boss name, raid, and difficulty by splitting based on this string
        if (inputString.indexOf("defeats") !== -1)
        {
            info = inputString.split(" defeats (");
        }
        else if (inputString.indexOf("redemptions") !== -1)
        {
            info = inputString.split(" redemptions (");
        }
        else if (inputString.indexOf("defenses") !== -1)
        {
            info = inputString.split(" defenses (");
        }
        else
        {
            info = inputString.split(" kills (");
        }
        var bossName = info.shift(); // first we get boss name
        info = info[0].split(" ");
        var difficultyName = "";
        var nameForInstance = "";
        if (info[0] === "Raid")
        {
            difficultyName = info.shift() + " " +  info.shift(); // Raid Finder
            nameForInstance = info.join(" ").slice(0, -1); // rest is the name and we remove the last ")"
        }
        else if (info[0] !== "Return")
        {
            difficultyName = info.shift(); // first info is what difficultie we have
            nameForInstance = info.join(" ").slice(0, -1); // rest is the name and we remove the last ")"
        }
        else // this should only be Return to Karazhan
        {
            difficultyName = "Mythic";
            nameForInstance = info.join(" ").slice(0, -1); // rest is the name and we remove the last ")"
        }
        return [bossName, nameForInstance, difficultyName];
    };
    for (var instanceNumber in toon.statistics.subCategories[5].subCategories[STATS_RAIDS_LEGION].statistics)
    {
        var instanceBoss = toon.statistics.subCategories[5].subCategories[STATS_RAIDS_LEGION].statistics[instanceNumber];
        var instanceReturns = getRaidAndBossName(instanceBoss.name);
        var bossName = instanceReturns[0];
        var nameOfInstance = instanceReturns[1];
        var difficultyName = instanceReturns[2];
        var typeOfInstance = "Dungeon";
        for (var raid in raidInstancesSortOrder)// this is needed this as "the" is missing from instances.
        {
            if (raidInstancesSortOrder[raid].indexOf(nameOfInstance) !== -1)
            {
                nameOfInstance = raidInstancesSortOrder[raid];
                typeOfInstance = "Raid";
            }
        }
        var thisInstance = typeOfInstance === "Raid" ? instanceDetails.raids : instanceDetails.dungeons;
        thisInstance[nameOfInstance] = thisInstance[nameOfInstance] || {};
        thisInstance[nameOfInstance][difficultyName] = thisInstance[nameOfInstance][difficultyName] || {};
        thisInstance[nameOfInstance][difficultyName].bosses = thisInstance[nameOfInstance][difficultyName].bosses || {};

        var infoForBoss = { "kills": instanceBoss.quantity };
        if (typeOfInstance === "Dungeon" && difficultyName === "Heroic")
        {
            infoForBoss.lockout = instanceBoss.lastUpdated > sinceYesterday;
        }
        else if (typeOfInstance !== "Dungeon" || difficultyName !== "Normal")// everything except normal dungeons
        {
            infoForBoss.lockout = instanceBoss.lastUpdated > sinceTuesday;
        }
        if (nameOfInstance.indexOf("Violet Hold")===-1)
        {
            thisInstance[nameOfInstance][difficultyName].bosses[bossName] = infoForBoss;
        }
        else
        {
            var oldInfo = thisInstance[nameOfInstance][difficultyName].bosses["Violet Hold End Boss"] || {};
            if (oldInfo.kills)
            {
                infoForBoss.kills += oldInfo.kills;
                infoForBoss.lockout = infoForBoss.lockout || oldInfo.lockout; // since 0 is false and 1 is true this will work.
            }
            thisInstance[nameOfInstance][difficultyName].bosses["Violet Hold End Boss"] = infoForBoss;
        }
        thisInstance[nameOfInstance][difficultyName].kills = thisInstance[nameOfInstance][difficultyName].kills || 0;
        thisInstance[nameOfInstance][difficultyName].kills += instanceBoss.quantity;
    }
    var displayInfo = { "raid": {}, "dungeon": {} };
    for (var instanceType in instanceDetails)
    {
        var instances = instanceDetails[instanceType];
        var infoOnDifficulty = {};
        for (var instanceName in instances)
        {
            var instance = instances[instanceName];
            if (instanceType === "raids") // for dungeons we take lockout for all instances, for raid we do it for each instance.
            {
                infoOnDifficulty = {};
            }
            for (var difficulty in instance)
            {
                infoOnDifficulty[difficulty] = infoOnDifficulty[difficulty] || {
                    "activeWeeks":0, "lockout":0, "instanceLength": 0, "progress": 0, "kills": 0
                };
                var thisDifficulty = infoOnDifficulty[difficulty];
                var bosses = instance[difficulty].bosses;
                for (var boss in bosses)
                {
                    var bossInfo = bosses[boss];
                    thisDifficulty.activeWeeks = Math.max(thisDifficulty.activeWeeks, bossInfo.kills);
                    thisDifficulty.instanceLength++;
                    thisDifficulty.kills += bossInfo.kills;
                    thisDifficulty.progress += bossInfo.kills === 0 ? 0 : 1;
                    thisDifficulty.lockout += bossInfo.lockout ? 1 : 0;
                    if (instanceType === "dungeons" && difficulty === "Mythic" && bossInfo.lockout)
                    {
                        thisDifficulty.details = thisDifficulty.details ? thisDifficulty.details + ", " + getShortInstanceName(instanceName) : getShortInstanceName(instanceName);
                    }
                }
            }
            if (instanceType === "raids")
            {
                displayInfo.raid[instanceName] = infoOnDifficulty;
            }
        }
        if (instanceType === "dungeons")
        {
            displayInfo.dungeon = infoOnDifficulty;
        }
    }

    var profession1 = "none";
    var profession2 = "none";
    var prof1Icon = "none";
    var prof2Icon = "none";
    var proftemp = "0";

    var prof1array = ["-", "-", "-", "-", "-", "-", "-"];
    var prof2array = ["-", "-", "-", "-", "-", "-", "-"];

  
    var prof_lookup = {};
  
    prof_lookup.Kul = 7;
    prof_lookup.Zandalari = 7;
    prof_lookup.Legion = 6;
    prof_lookup.Draenor = 5;
    prof_lookup.Pandaria = 4;
    prof_lookup.Cataclysm = 3;
    prof_lookup.Northrend = 2;
    prof_lookup.Outland = 1;
    prof_lookup[0] = 0;

    for ( i = 0; i < toon.professions.primary.length; i++)
    {     
      
        if (prof1Icon == "none" || prof1Icon == toon.professions.primary[i].icon)
        {
            prof1Icon = toon.professions.primary[i].icon;
            if (toon.professions.primary[i].id < 900)
            {
                profession1 = toon.professions.primary[i].name;
                proftemp[0] = 0;
            }
            else
            {
                proftemp = toon.professions.primary[i].name.split(" ");
            }
        
            if (toon.professions.primary[i].rank >= toon.professions.primary[i].max)
            {
                prof1array[prof_lookup[proftemp[0]]]= "\u2713"
            }
            else
            {
                prof1array[prof_lookup[proftemp[0]]]= toon.professions.primary[i].rank;
            }
        }
        
        else if (prof2Icon == "none" || prof2Icon == toon.professions.primary[i].icon)
        {
            prof2Icon = toon.professions.primary[i].icon;
            if (toon.professions.primary[i].id < 900)
            {
                profession2 = toon.professions.primary[i].name;
                proftemp[0] = 0;
            }
            else
            {
                proftemp = toon.professions.primary[i].name.split(" ");
            }
            if (toon.professions.primary[i].rank >= toon.professions.primary[i].max)
            {
            	prof2array[prof_lookup[proftemp[0]]]= "\u2713"
            }
            else
            {
            	prof2array[prof_lookup[proftemp[0]]]= toon.professions.primary[i].rank;
            }
        }
    }

    profession1 = profession1 + " " + prof1array;
    profession2 = profession2 + " " + prof2array;
      

    var upgradePercent = "-";

    if (allItems.upgrade.total > 0)
    {
        upgradePercent = Math.round(allItems.upgrade.current/allItems.upgrade.total*100) + "%";
    }

    var artifactRank = "x";
    var artifactRelics = [];
    var relicItems = ["mainHand","offHand"];
    var relicCount = 0;

    for (i = 0; i < relicItems.length; i++)
    {
       // var k = relicItems[i] unused?
        if (toon.items[relicItems[i]])
        {
            var relicItem = toon.items[relicItems[i]];
            if (relicItem.quality > 4)
            {
                artifactRank = 0;
                relicItem.relics.forEach(function(relicGem)
                {
                    artifactRelics.push(relic(relicGem));
                    relicCount++;
                });
            }
        }
    }

    if (toon.items.mainHand && toon.items.mainHand.quality == 6)
    {
        if (toon.items.mainHand.artifactTraits[1])
        {
            if (toon.items.mainHand.artifactTraits[0])
            {
                for (i=0; i<toon.items.mainHand.artifactTraits.length; i++)
                {
                    artifactRank = artifactRank + toon.items.mainHand.artifactTraits[i].rank;
                }
                artifactRank = artifactRank - relicCount;
            }

            else if (toon.items.offHand.artifactTraits[1])
            {
               if (toon.items.offHand.artifactTraits[0])
               {
                   for (i=0; i<toon.items.offHand.artifactTraits.length; i++)
                   {
                       artifactRank = artifactRank + toon.items.offHand.artifactTraits[i].rank;
                   }
                   artifactRank = artifactRank - relicCount;
               }
           }
           else
           {
               artifactRank = 0;
           }
       }
   }


    // this was the previous method for calculating artifactRank
    /*for (i=0; i<toon.achievements.criteria.length; i++)
    {
        if (toon.achievements.criteria[i] == "29395")
        {
            artifactRank = toon.achievements.criteriaQuantity[i];
        }
    }*/


// IDs for mythic+ were provied by @matdemy on twitter and this post: http://us.battle.net/forums/en/bnet/topic/20752275890
    var mythicPlus = "";
    for (i=0; i<toon.achievements.criteria.length; i++)
    {
        switch (toon.achievements.criteria[i])
        {
            case (30103):
                if (showTotalArtifactPower)
                {
                    artifactRank = artifactRank + " | AP: " + numberWithCommas(toon.achievements.criteriaQuantity[i]);
                }
                break;

            case (31466):
                if (showTotalArtifactPower)
                {
                    artifactRank = artifactRank + " | AK: " +  toon.achievements.criteriaQuantity[i];
                }
                break;

            case (33096):
                mythicPlus = mythicPlus + "m+2: " + toon.achievements.criteriaQuantity[i];
                break;

            case (33097):
                mythicPlus = mythicPlus + " m+5: " + toon.achievements.criteriaQuantity[i];
                break;

            case (33098):
                mythicPlus = mythicPlus + " m+10: " + toon.achievements.criteriaQuantity[i];
                break;

            case (32028):
                mythicPlus = mythicPlus + " m+15: " + toon.achievements.criteriaQuantity[i];
                break;

            default:
                break;
        }
    }

    for (i = artifactRelics.length; i < 3; i++)
    {
        artifactRelics.push("x");
    }

    var reps = [
        { "id":1859, "text":"" },//Nightfallen
        { "id":2165, "text":"" },//Army of the Light
        { "id":2170, "text":"" },//Argussian Reach
    ];
    for (i = 0; i<toon.reputation.length; i++)
    {
        for (var j = 0; j < reps.length; j++)
        {
            if (toon.reputation[i].id == reps[j].id)
            {
                reps[j].text = toon.reputation[i].name + " - " + rep(toon.reputation[i].standing) + " " + toon.reputation[i].value + "/" + toon.reputation[i].max;
            }
        }
    }

    var toonInfo = [

        toon_class,
        toon.level,
        mainspec,
        allItems.averageIlvl,
        upgradePercent,
        tier,

        artifactRank,
        artifactRelics[0], artifactRelics[1], artifactRelics[2],
        auditInfo,

        displayInfo.dungeon.Heroic.lockout + "/" + displayInfo.dungeon.Heroic.instanceLength,
        displayInfo.dungeon.Heroic.progress + "/" + displayInfo.dungeon.Heroic.instanceLength + " (" + displayInfo.dungeon.Heroic.kills + ")",

        displayInfo.dungeon.Mythic.lockout + "/" + displayInfo.dungeon.Mythic.instanceLength + " " +  displayInfo.dungeon.Mythic.details,
        displayInfo.dungeon.Mythic.progress + "/" + displayInfo.dungeon.Mythic.instanceLength + " [" + displayInfo.dungeon.Mythic.activeWeeks + "] (" + displayInfo.dungeon.Mythic.kills + ") " + mythicPlus,

        profession1, profession2, thumbnail, armory,
        allItems[enchantableItems[4]].enchant, allItems[enchantableItems[5]].enchant,
    ];

    var Position = 6;
    for (i = 0; i<sortOrder.length;i++)
    {
        toonInfo.splice(Position,0,allItems[sortOrder[i]].ilvl);
        toonInfo.splice(Position+12+i,0,allItems[sortOrder[i]].upgrade);
        Position++;
    }
    Position+=4;
    for (i = 0; i < enchantableItems.length-2;i++)
    {
        toonInfo.splice(Position,0,allItems[enchantableItems[i]].enchant);
        Position++;
    }

    var instanceInfoPosition = 31;
    for (i = 0; i < raidInstancesSortOrder.length; i++)
    {
        for (var k = 0; k < raidDifficultySortOrder.length; k++)
        {
            var cellInfo = displayInfo.raid[raidInstancesSortOrder[i]][raidDifficultySortOrder[k]];
            toonInfo.splice(instanceInfoPosition+i*8+k, 0, cellInfo.lockout + "/" + cellInfo.instanceLength);
        }
        for (k = 0; k < raidDifficultySortOrder.length; k++)
        {
            var secondCellInfo = displayInfo.raid[raidInstancesSortOrder[i]][raidDifficultySortOrder[k]];
            toonInfo.splice(instanceInfoPosition+i*8+k+4, 0, secondCellInfo.progress + "/" + secondCellInfo.instanceLength + " [" + secondCellInfo.activeWeeks + "] (" + secondCellInfo.kills + ")");
        }
    }
    for (i = 0; i < reps.length; i++)
    {
        toonInfo.push(reps[i].text);
    }
    return toonInfo;
}

function vercheck()
{
    return current_version;
}