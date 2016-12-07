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
//    You need to put your api key here, inside the quotes
//    Request one here: https://dev.battle.net/apps/register
//    Step by step instructions: http://bruk.org/api
var apikey = "";


// Change this to the threshold you want to start checking for epic gems (ie: if it's 709 anything 710 or above will be checked for epic gems)
var CONST_EPICGEM_ILVL = 860;

// You shouldn't need to change this, but this is threshold item level where gear is checked for enchants and gems
var CONST_AUDIT_ILVL = 599;

//If you want total AP gathered displayed next to highest weapon rank, change this to true
var showTotalArtifactPower = false;

// Everything below this, you shouldn't have to edit
//***************************************************************
/* globals Utilities, UrlFetchApp */
/* exported wow, vercheck */

var current_version = 3.14;


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
    var relicJSON = UrlFetchApp.fetch("https://us.api.battle.net/wow/item/"+id+"?bl="+bonusLists+"&locale=en_US&apikey="+apikey+"");
    var relicDat = JSON.parse(relicJSON.toString());
  
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
    if (ilvl%5!=0)
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

    }

    var relicIlvl = 0;
    if (ilvl<=690)
    {
        relicIlvl = 2; //anything less than this adds 2
    }
    else
   {
        switch (ilvl)
       {
            case (695): relicIlvl="3"; break;
            case (700): relicIlvl="4"; break;
            case (705): relicIlvl="5"; break;
            case (710): relicIlvl="7"; break;
            case (715): relicIlvl="8"; break;
            case (720): relicIlvl="9"; break;
            case (725): relicIlvl="10"; break;
            case (730): relicIlvl="12"; break;
            case (735): relicIlvl="13"; break;
            case (740): relicIlvl="14"; break;
            case (745): relicIlvl="15"; break;
            case (750): relicIlvl="17"; break;
            case (755): relicIlvl="18"; break;
            case (760): relicIlvl="19"; break;
            case (765): relicIlvl="21"; break;
            case (770): relicIlvl="22"; break;
            case (775): relicIlvl="23"; break;
            case (780): relicIlvl="24"; break;
            case (785): relicIlvl="26"; break;
            case (790): relicIlvl="27"; break;
            case (795): relicIlvl="28"; break;
            case (800): relicIlvl="29"; break;
            case (805): relicIlvl="31"; break;
            case (810): relicIlvl="32"; break;
            case (815): relicIlvl="33"; break;
            case (820): relicIlvl="35"; break;
            case (825): relicIlvl="36"; break;
            case (830): relicIlvl="37"; break;
            case (835): relicIlvl="39"; break;
            case (840): relicIlvl="40"; break;
            case (845): relicIlvl="42"; break;
            case (850): relicIlvl="43"; break;
            case (855): relicIlvl="45"; break;
            case (860): relicIlvl="46"; break;
            case (865): relicIlvl="48"; break;
            case (870): relicIlvl="49"; break;
            case (875): relicIlvl="51"; break;
            case (880): relicIlvl="52"; break;
            case (885): relicIlvl="53"; break;
            case (890): relicIlvl="55"; break;
            case (895): relicIlvl="56"; break;
            case (900): relicIlvl="58"; break;
            case (905): relicIlvl="59"; break;
            case (910): relicIlvl="61"; break;
            case (915): relicIlvl="62"; break;
            case (920): relicIlvl="64"; break;
            case (925): relicIlvl="65"; break;
            default: relicIlvl="65+";
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
    var toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=reputation,statistics,items,quests,achievements,audit,progression,feed,professions,talents&?locale=en_US&apikey="+apikey+"", options);
    var toon = JSON.parse(toonJSON.toString());
  
    if (!toon.name)
    {
        return "Error loading API: try refreshing and verify values are typed correctly. Ensure your API key is entered into the script correctly. Errors can also come from loading 100+ characters at a time";
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

    var totalGems = [0, 0, 0];

    var gemAudit = [
        { bool: 0, issue: " Old:" },    
        { bool: 0, issue: " Cheap:" },
        { bool: 0, issue: " No Epic Gems" },    // this was a list of non-epic gems, when they weren't unique
        { bool: 0, issue: " Mixed Gems" }  
    ];

    var gemStats = [
        { value: 0, stat: "Crit" },
        { value: 0, stat: "Haste" },
        { value: 0, stat: "Vers" },
        { value: 0, stat: "Mast" },
        { value: 0, stat: "Str" },
        { value: 0, stat: "Agi" },
        { value: 0, stat: "Int" }
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

    //neck
    audit_lookup["5437"] = "Claw";
    audit_lookup["5438"] = "Army";
    audit_lookup["5439"] = "Satyr";
    audit_lookup["5889"] = "Hide";
    audit_lookup["5890"] = "Soldier";
    audit_lookup["5891"] = "Ancient";
  
  //shoulder
    audit_lookup["5440"] = "Scavenger (cloth)";
    audit_lookup["5441"] = "Gemfinder";
    audit_lookup["5442"] = "Harvester (herbs/fish)";
    audit_lookup["5443"] = "Butcher (leather/meat)";
    audit_lookup["5882"] = "Manaseeker (enchant)";
    audit_lookup["5881"] = "Salvager (ore/armor)";
    audit_lookup["5883"] = "Bloodhunter (Blood)";
  
  //gloves
    audit_lookup["5444"] = "Herb";
    audit_lookup["5445"] = "Mine";
    audit_lookup["5446"] = "Skin";
    audit_lookup["5447"] = "Survey";

    var thumbnail = "http://"+region+".battle.net/static-render/"+region+"/"+  toon.thumbnail;
    var armory = "http://"+region+".battle.net/wow/en/character/"+realmName+"/"+toonName+"/advanced";

    var tier = " ";
    var tier_pieces = [toon.items.head,toon.items.shoulder,toon.items.chest,toon.items.hands,toon.items.legs,toon.items.waist];

    var set1 = [];
    var set2 = [];

    var gemMatch = 0; //check if our rare/uncommon gems match

    for (i = 0; i < tier_pieces.length; i++)
    {
        if (tier_pieces[i] && tier_pieces[i].tooltipParams.set)
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
            var obliterum = 8; //current cap for obliterum upgrades
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

            if (item.itemLevel > CONST_AUDIT_ILVL)
            {
                if (item.tooltipParams.gem0&&slot!="mainHand"&&slot!="offHand")
                {
                    if (item.tooltipParams.gem0 > 130245) //(epic) I think this could be beautified/simplifed, basically it adds to the stat value for each quality
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
                   
                   //Mixed Gems - if a gem is not epic, check if it has the same stat type, if so, then copy it into gemMatch to compare it to the next one
                    if (audit_lookup[item.tooltipParams.gem0] != 2 && (gemMatch == 0 || gemMatch === item.tooltipParams.gem0 || gemMatch === item.tooltipParams.gem0+4 || gemMatch === item.tooltipParams.gem0-4))
                    {
                        gemMatch = item.tooltipParams.gem0;      
                    }
                    else if (audit_lookup[item.tooltipParams.gem0] != 2 && audit_lookup[item.tooltipParams.gem0] > -1)
                    {
                        gemAudit[3].bool = 1; // if we fail to pass the above if, the stats don't match on our gems
                    }
                  
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


    if (totalGems[0]+totalGems[1]+totalGems[2]>0) //gems exist!
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
      
        if (totalGems[2] > 0)
        {
            auditInfo = auditInfo + " Epic:" + totalGems[2];   
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

    // Stat categories
    var STATS_RAIDS = 5;

    // Raid stat sub-categories
    var STATS_RAIDS_LEGION = 6;

    // Counters
    var totalDone = {
        "Heroic": 0,
        "Mythic": 0
    };

    var ActiveWeeks = {
        "ENlfr":    0,
        "ENnormal": 0,
        "ENheroic": 0,
        "ENmythic": 0,
        "TVlfr":    0,
        "TVnormal": 0,
        "TVheroic": 0,
        "TVmythic": 0,
        "NHlfr":    0,
        "NHnormal": 0,
        "NHheroic": 0,
        "NHmythic": 0,
        "Mythic":   0
    };

    var Progress = {
        "ENlfr":    0,
        "ENnormal": 0,
        "ENheroic": 0,
        "ENmythic": 0,
        "TVlfr":    0,
        "TVnormal": 0,
        "TVheroic": 0,
        "TVmythic": 0,
        "NHlfr":    0,
        "NHnormal": 0,
        "NHheroic": 0,
        "NHmythic": 0,
        "Heroic":   0,
        "Mythic":   0
    };

    var Lockout = {
        "ENlfr":    0,
        "ENnormal": 0,
        "ENheroic": 0,
        "ENmythic": 0,
        "TVlfr":    0,
        "TVnormal": 0,
        "TVheroic": 0,
        "TVmythic": 0,
        "NHlfr":    0,
        "NHnormal": 0,
        "NHheroic": 0,
        "NHmythic": 0,
        "Heroic":   0,
        "Mythic":   0
    };

    var dungeons = [
        { id: 1, difficulty: "Heroic" },
        { id: 2, difficulty: "Mythic", name: "EoA" },  //Eye of Azshara
        { id: 4, difficulty: "Heroic" },
        { id: 5, difficulty: "Mythic", name: "DT" },  //Darkheart Thicket
        { id: 7, difficulty: "Heroic" },
        { id: 8, difficulty: "Mythic", name:  "NT" },  //Neltharion's Lair
        { id: 10, difficulty: "Heroic" },
        { id: 11, difficulty: "Mythic", name:  "HoV" }, //Halls of Valor
        { id: 14, difficulty: "Heroic" },
        { id: 15, difficulty: "Heroic" },
        { id: 16, difficulty: "Mythic", name:  "VH" }, //Violet Hold
        { id: 17, difficulty: "Mythic", name:  "VH" }, //Violet Hold
        { id: 19, difficulty: "Heroic" },
        { id: 20, difficulty: "Mythic", name:  "VotW" }, //Vault of the Wardens
        { id: 22, difficulty: "Heroic" },
        { id: 23, difficulty: "Mythic", name:  "BRH" }, //Black Rook Hold
        { id: 25, difficulty: "Heroic" },
        { id: 26, difficulty: "Mythic", name:  "MoS" }, //Maw of Souls
        { id: 27, difficulty: "Mythic", name: "Arc" }, //Arcway
        { id: 28, difficulty: "Mythic", name:  "CoS" }, //Court of Stars
        { id: 29, difficulty: "Mythic", name:  "RtK" }, //Return to Karazhan
        { id: 30, difficulty: "ENlfr" },
        { id: 31, difficulty: "ENnormal" },
        { id: 32, difficulty: "ENheroic" },
        { id: 33, difficulty: "ENmythic" },
        { id: 34, difficulty: "ENlfr" },
        { id: 35, difficulty: "ENnormal" },
        { id: 36, difficulty: "ENheroic" },
        { id: 37, difficulty: "ENmythic" },
        { id: 38, difficulty: "ENlfr" },
        { id: 39, difficulty: "ENnormal" },
        { id: 40, difficulty: "ENheroic" },
        { id: 41, difficulty: "ENmythic" },
        { id: 42, difficulty: "ENlfr" },
        { id: 43, difficulty: "ENnormal" },
        { id: 44, difficulty: "ENheroic" },
        { id: 45, difficulty: "ENmythic" },
        { id: 46, difficulty: "ENlfr" },
        { id: 47, difficulty: "ENnormal" },
        { id: 48, difficulty: "ENheroic" },
        { id: 49, difficulty: "ENmythic" },
        { id: 50, difficulty: "ENlfr" },
        { id: 51, difficulty: "ENnormal" },
        { id: 52, difficulty: "ENheroic" },
        { id: 53, difficulty: "ENmythic" },
        { id: 54, difficulty: "ENlfr" },
        { id: 55, difficulty: "ENnormal" },
        { id: 56, difficulty: "ENheroic" },
        { id: 57, difficulty: "ENmythic" },
        { id: 58, difficulty: "TVlfr" },
        { id: 59, difficulty: "TVnormal" },
        { id: 60, difficulty: "TVheroic" },
        { id: 61, difficulty: "TVmythic" },
        { id: 62, difficulty: "TVlfr" },
        { id: 63, difficulty: "TVnormal" },
        { id: 64, difficulty: "TVheroic" },
        { id: 65, difficulty: "TVmythic" },
        { id: 66, difficulty: "TVlfr" },
        { id: 67, difficulty: "TVnormal" },
        { id: 68, difficulty: "TVheroic" },
        { id: 69, difficulty: "TVmythic" },
        { id: 70, difficulty: "NHlfr" },
        { id: 71, difficulty: "NHnormal" },
        { id: 72, difficulty: "NHheroic" },
        { id: 73, difficulty: "NHmythic" },
        { id: 74, difficulty: "NHlfr" },
        { id: 75, difficulty: "NHnormal" },
        { id: 76, difficulty: "NHheroic" },
        { id: 77, difficulty: "NHmythic" },
        { id: 78, difficulty: "NHlfr" },
        { id: 79, difficulty: "NHnormal" },
        { id: 80, difficulty: "NHheroic" },
        { id: 81, difficulty: "NHmythic" },
        { id: 82, difficulty: "NHlfr" },
        { id: 83, difficulty: "NHnormal" },
        { id: 84, difficulty: "NHheroic" },
        { id: 85, difficulty: "NHmythic" },
        { id: 86, difficulty: "NHlfr" },
        { id: 87, difficulty: "NHnormal" },
        { id: 88, difficulty: "NHheroic" },
        { id: 89, difficulty: "NHmythic" },
        { id: 90, difficulty: "NHlfr" },
        { id: 91, difficulty: "NHnormal" },
        { id: 92, difficulty: "NHheroic" },
        { id: 93, difficulty: "NHmythic" },
        { id: 94, difficulty: "NHlfr" },
        { id: 95, difficulty: "NHnormal" },
        { id: 96, difficulty: "NHheroic" },
        { id: 97, difficulty: "NHmythic" },
        { id: 98, difficulty: "NHlfr" },
        { id: 99, difficulty: "NHnormal" },
        { id: 100, difficulty: "NHheroic" },
        { id: 101, difficulty: "NHmythic" },
        { id: 102, difficulty: "NHlfr" },
        { id: 103, difficulty: "NHnormal" },
        { id: 104, difficulty: "NHheroic" },
        { id: 105, difficulty: "NHmythic" },
        { id: 106, difficulty: "NHlfr" },
        { id: 107, difficulty: "NHnormal" },
        { id: 108, difficulty: "NHheroic" },
        { id: 109, difficulty: "NHmythic" }
    ];

    var num_dungeons = dungeons.length;
    var mythicDetails = ""; 

    for (i = 0; i < num_dungeons; i++)
    {
        var dungeon_id = dungeons[i].id;
        var difficulty = dungeons[i].difficulty;

        var stats = toon.statistics.subCategories[STATS_RAIDS].subCategories[STATS_RAIDS_LEGION].statistics[dungeon_id];

        if (stats.quantity > 0)
        {
            Progress[difficulty]++;

            if (stats.quantity > ActiveWeeks[difficulty])
            {
                ActiveWeeks[difficulty] = stats.quantity;
            }

            if (difficulty == "Heroic" && stats.lastUpdated > sinceYesterday)
            {
                Lockout.Heroic++;
            }
            else if (difficulty != "Heroic" && stats.lastUpdated > sinceTuesday)
            {
                Lockout[difficulty]++;
           
                if (difficulty === "Mythic")
                {
                    if (mythicDetails)
                    {
                        mythicDetails = mythicDetails + ", ";
                    }
                
                    mythicDetails = mythicDetails + dungeons[i].name;
                }
            }                            
            //Find total quantity done for Heroics and mythics
            if (difficulty == "Heroic" || difficulty == "Mythic")
            {
                totalDone[difficulty] =  totalDone[difficulty]+stats.quantity;
            }
        }
    }

    //There are two possible end bosses for Violet Hold, factor this in when calculating the progress tally
    if (toon.statistics.subCategories[5].subCategories[6].statistics[14].quantity > 0 && toon.statistics.subCategories[5].subCategories[6].statistics[15].quantity > 0)
    {
        Progress.Heroic--;
    }
    if (toon.statistics.subCategories[5].subCategories[6].statistics[16].quantity > 0 && toon.statistics.subCategories[5].subCategories[6].statistics[17].quantity > 0)
    {
        Progress.Mythic--;
    }


    var profession1 = "none";
    if (toon.professions.primary[0])
    {
        profession1 = toon.professions.primary[0].rank + " " + toon.professions.primary[0].name;
    }
    var profession2 = "none";
    if (toon.professions.primary[1])
    {
        profession2 =  toon.professions.primary[1].rank + " " + toon.professions.primary[1].name;
    }


    var upgradePercent = "-";

    if (allItems.upgrade.total > 0)
    {
        upgradePercent = Math.round(allItems.upgrade.current/allItems.upgrade.total*100) + "%";
    }

    var artifactRank = "x";
    var artifactRelics = [];
    var relicItems = ["mainHand","offHand"];

    for (i = 0; i < relicItems.length; i++)
    {
       // var k = relicItems[i] unused?
        if (toon.items[relicItems[i]])
        {
            var relicItem = toon.items[relicItems[i]];
            if (relicItem.quality === 6)
            {
                artifactRank = 0;
                relicItem.relics.forEach(function(relicGem) 
                {
                    artifactRelics.push(relic(relicGem));
                });
            }
        }
    }


    for (i=0; i<toon.achievements.criteria.length; i++)
    {
        if (toon.achievements.criteria[i] == "29395")
        {
            artifactRank = toon.achievements.criteriaQuantity[i];
        }
    }


// IDs for mythic+ were provied by @matdemy on twitter and this post: http://us.battle.net/forums/en/bnet/topic/20752275890
    var mythicPlus = "";
    for (i=0; i<toon.achievements.criteria.length; i++)
    {
        switch (toon.achievements.criteria[i])
        {
            case (30103):
                if (showTotalArtifactPower)
               {
                    artifactRank = artifactRank + " | AP: " +  toon.achievements.criteriaQuantity[i];
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
  
    var nightfallen = rep(toon.reputation[28].standing);
    nightfallen = "Nightfallen - " + nightfallen + " " + toon.reputation[28].value + "/" + toon.reputation[28].max;
    
    if (toon.reputation[28].id != 1859) // horde
    {
        nightfallen = "Sorry Horde, Blizz needs to fix this";
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

        Lockout.ENlfr    + "/7",
        Lockout.ENnormal + "/7",
        Lockout.ENheroic + "/7",
        Lockout.ENmythic + "/7",

        Progress.ENlfr    + "/7 [" + ActiveWeeks.ENlfr    + "]",
        Progress.ENnormal + "/7 [" + ActiveWeeks.ENnormal + "]",
        Progress.ENheroic + "/7 [" + ActiveWeeks.ENheroic + "]",
        Progress.ENmythic + "/7 [" + ActiveWeeks.ENmythic + "]",

        Lockout.TVlfr    + "/3",
        Lockout.TVnormal + "/3",
        Lockout.TVheroic + "/3",
        Lockout.TVmythic + "/3",

        Progress.TVlfr    + "/3 [" + ActiveWeeks.TVlfr    + "]",
        Progress.TVnormal + "/3 [" + ActiveWeeks.TVnormal + "]",
        Progress.TVheroic + "/3 [" + ActiveWeeks.TVheroic + "]",
        Progress.TVmythic + "/3 [" + ActiveWeeks.TVmythic + "]",

        Lockout.NHlfr    + "/10",
        Lockout.NHnormal + "/10",
        Lockout.NHheroic + "/10",
        Lockout.NHmythic + "/10",

        Progress.NHlfr    + "/10 [" +ActiveWeeks.NHlfr    +"]",
        Progress.NHnormal + "/10 [" +ActiveWeeks.NHnormal +"]",
        Progress.NHheroic + "/10 [" +ActiveWeeks.NHheroic +"]",
        Progress.NHmythic + "/10 [" +ActiveWeeks.NHmythic +"]",

        Lockout.Heroic  + "/8",
        Progress.Heroic + "/8 (" + totalDone.Heroic + ")",

        Lockout.Mythic  + "/11 " + mythicDetails,
        Progress.Mythic + "/11 [" + ActiveWeeks.Mythic + "] (" + totalDone.Mythic + ") " + mythicPlus,

        profession1, profession2, thumbnail, armory, 
        allItems[enchantableItems[4]].enchant, allItems[enchantableItems[5]].enchant,
        nightfallen, 
    ];

    var possision = 6;
    for (i = 0; i<sortOrder.length;i++)
    {
        toonInfo.splice(possision,0,allItems[sortOrder[i]].ilvl);
        toonInfo.splice(possision+36+i,0,allItems[sortOrder[i]].upgrade);
        possision++;
    }
    possision+=4;
    for (i = 0; i < enchantableItems.length-2;i++)
    {
        toonInfo.splice(possision,0,allItems[enchantableItems[i]].enchant);
        possision++;
    }
    return toonInfo;
}

function vercheck()
{
    return current_version;
}

//When copy pasting, delete 0Looking at the bottom if it shows up, otherwise it'll cause an error