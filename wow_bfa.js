/* ***********************************
 ***     Copyright (c) 2018 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
 ***
 ************************************* */

// For more info, help, or to contribute: http://bruk.org/wow 


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ IMPORTANT!!! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//    You need to put your api key here, inside the quotes
//    Request one here: https://dev.battle.net/apps/register
//    Step by step instructions: http://bruk.org/api
var apikey = "";

// Change this to the threshold you want to start checking for epic gems (ie: if it's 349 anything 350 or above will be checked for epic gems)
var CONST_EPICGEM_ILVL = 350;

// This is threshold item level where gear is checked for enchants and gems
var CONST_AUDIT_ILVL = 309;

//If you want to list the uncompleted Mythic dungeons instead of the completed Mythics, change this from false to true

var listMissing = false;

// Option to include data from raider.io

var raiderIO = false;

//If you want Legendary items to be marked with a + next to item level (use conditional formatting to change their color) change this to true

var markLegendary = true;


// Everything below this, you shouldn't have to edit
//***************************************************************
/* globals Utilities, UrlFetchApp */
/* exported wow, vercheck */

var current_version = 4.02;

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
    toonName = toonName.replace(/\s/g, "");
    region = region.replace(/\s/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");

    region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9

    var options={ muteHttpExceptions:true };
    var toon = "";

    var  toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=reputation,statistics,items,quests,achievements,audit,progression,feed,professions,talents&?locale=en_US&apikey="+apikey+"", options);
    toon = JSON.parse(toonJSON.toString());

    if (toon.detail || toon.status)
    {
        return "API Error, check if your API key is entered properly and that the API is working, check character on Armory to see if it loads";
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
    var classes = {
        1:"Warrior", 
        2:"Paladin",
        3:"Hunter",
        4:"Rogue",
        5:"Priest",
        6:"DeathKnight",
        7:"Shaman",
        8:"Mage",
        9:"Warlock",
        10:"Monk",
        11:"Druid",
        12:"Demon Hunter"
    };
    var toon_class = classes[toon.class];

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
        { value: 0, stat: "%XP" },
        { value: 0, stat: "%Move" },
        { value: 0, stat: "Str" },
        { value: 0, stat: "Agi" },
        { value: 0, stat: "Int" },
        { value: 0, stat: "OLD GEMS" },
    ];


    // I love me some look up tables! These are to check if you have a crappy enchant or gem
    var audit_lookup = {};

    //uncommon gems
    audit_lookup["153710"] =
        audit_lookup["153711"] =
        audit_lookup["153712"] =
        audit_lookup["153713"] = 
        audit_lookup["153714"] =     //XP    
        audit_lookup["153715"] =0;  // +Movement


    //rare gems
    audit_lookup["154126"] =
        audit_lookup["154127"] =
        audit_lookup["154128"] =
        audit_lookup["154129"] =  1;  

    //unique epic gems
    audit_lookup["153707"] =         //strengh
        audit_lookup["153708"] =     //agility
        audit_lookup["153709"] = 2; //Int

    //ring
    audit_lookup["5942"] = "Pact +37C";
    audit_lookup["5943"] = "Pact +37H";
    audit_lookup["5944"] = "Pact +37M";
    audit_lookup["5945"] = "Pact +37V";
    audit_lookup["5938"] = "Seal +27C";
    audit_lookup["5939"] = "Seal +27H";
    audit_lookup["5940"] = "Seal +27M";
    audit_lookup["5941"] = "Seal +27V";


    //weapons
    audit_lookup["5946"] = "Coastal Surge";
    audit_lookup["5948"] = "Siphoning";
    audit_lookup["5949"] = "Torrent of Elements";
    audit_lookup["5950"] = "Gale-Force";
    audit_lookup["5962"] = "Versatile Nav";    
    audit_lookup["5963"] = "Quick Nav";
    audit_lookup["5964"] = "Masterful Nav";
    audit_lookup["5965"] = "Deadly Nav";
    audit_lookup["5966"] = "Stalwart Nav";

    //scopes
    audit_lookup["5955"] = "Crow's Nest Scope";
    audit_lookup["5956"] = "Monelite Scope";
    audit_lookup["5957"] = "Incendiary Ammo";
    audit_lookup["5958"] = "Frost-Laced Ammo";

    audit_lookup["3847"] = "(DK)Stoneskin Gargoyle";
    audit_lookup["3368"] = "(DK)Fallen Crusader";
    audit_lookup["3366"] = "(DK)Lichbane";
    audit_lookup["3367"] = "(DK)Spellshattering";
    audit_lookup["3595"] = "(DK)Spellbreaking";
    audit_lookup["3370"] = "(DK)Razorice";


  //shoulder - Leaving Legion ones in incase they are still useful to have in BfA
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
    audit_lookup["5932"] = "Herb";
    audit_lookup["5933"] = "Mine";
    audit_lookup["5934"] = "Skin";
    audit_lookup["5935"] = "Survey";
    audit_lookup["5937"] = "Crafting";

    var thumbnail = "http://render-"+region+".worldofwarcraft.com/character/"+  toon.thumbnail;
    var armory = "http://"+region+".battle.net/wow/en/character/"+realmName+"/"+toonName+"/";

    var allItems={
        equippedItems:0,
        totalIlvl:0,
        upgrade: {
            total:0,
            current:0
        }
    };

    // Azerite Info
    var heartOfAzeroth = "-";
  
  //thanks to github user bloodrash for this function
    function numberWithCommas(x)
    {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    if (toon.items.neck)
    {
        if (toon.items.neck.quality===6)
        {
            heartOfAzeroth = toon.items.neck.azeriteItem.azeriteLevel + " (" + numberWithCommas(toon.items.neck.azeriteItem.azeriteExperience) + " / " + numberWithCommas(toon.items.neck.azeriteItem.azeriteExperienceRemaining) + ")";
        }
    }


    var enchantableItems=["mainHand","offHand","finger1","finger2","hands"];
    var azeriteItems=["head","shoulder","chest"];


    var getItemInfo = function (item, slot)
    {
        allItems[slot] = {
            ilvl:"\u2063",
            power:"",
            enchant:""
        };

        if (enchantableItems.indexOf(slot)!=-1) //this is to form the array properly later
        {
            allItems[slot].enchant = " ";
        }

        if (item)
        {
            allItems.equippedItems++;
            allItems[slot].ilvl = item.itemLevel;
            allItems.totalIlvl += item.itemLevel;
            if (item.quality === 5 && markLegendary)
            {
                allItems[slot].ilvl = allItems[slot].ilvl + "+";  // * can be any character you want, use it for your conditional
            }

            if (item.itemLevel > CONST_AUDIT_ILVL)
            {
                if (item.tooltipParams.gem0&&item.quality!=6) // don't check artifacts in case people are still using those!
                { 

                   //if statement set up in descending order for gem IDs
                    if (item.tooltipParams.gem0 > 154125) //rare 
                   {
                        gemStats[item.tooltipParams.gem0-154126].value = gemStats[item.tooltipParams.gem0-154126].value+40;
                    }
                    else if (item.tooltipParams.gem0 > 153714) // +move 
                    {
                        gemStats[item.tooltipParams.gem0-153715+4].value = gemStats[item.tooltipParams.gem0-153715+4].value+3;                        
                    }
                    else if (item.tooltipParams.gem0 > 153713) // xp 
                    {
                        gemStats[item.tooltipParams.gem0-153714+4].value = gemStats[item.tooltipParams.gem0-153714+4].value+5;                        
                    }
                    else if (item.tooltipParams.gem0 > 153709) //uncommon
                   {
                        gemStats[item.tooltipParams.gem0-153710].value = gemStats[item.tooltipParams.gem0-153710].value+30;
                    }
                    else if (item.tooltipParams.gem0 > 153706) //unique epic
                   {
                        gemStats[item.tooltipParams.gem0-153707+6].value = gemStats [item.tooltipParams.gem0-153707+6].value+40;
                    }
                    else
                    {
                        gemStats[9].value = gemStats[9].value + 1;
                    }

                    if (item.itemLevel>CONST_EPICGEM_ILVL)
                    {
                        if (audit_lookup[item.tooltipParams.gem0] != 2)  
                        {
                            gemAudit[2].bool = 1;
                            gemAudit[2].issue += " "+ slot;
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
                  

                    totalGems[audit_lookup[item.tooltipParams.gem0]]++;
                }

                if (enchantableItems.indexOf(slot)!=-1)
                {
                    if (slot=="offHand" && !toon.items.offHand.weaponInfo)
                    {
                        allItems[slot].enchant = ""; //this is just here to make lint happy, wish i could just stick a ; at the end of that if
                    }
                    else
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

           //unfortunately it doesn't seem like there's any valuable info in the tooltip params even though azerite power appears there
            if (azeriteItems.indexOf(slot)!=-1)
            {
                allItems[slot].power= "-";
                if (item.azeriteEmpoweredItem)
                {
                    if (item.azeriteEmpoweredItem.azeritePowers[0])
                    {
                        allItems[slot].power=0;
                        for (j=0; j<item.azeriteEmpoweredItem.azeritePowers.length; j++)
                        {
                            if (item.azeriteEmpoweredItem.azeritePowers[j].spellId > 0)
                            {
                                allItems[slot].power = allItems[slot].power+1;
                            }
                        }
                        if (allItems[slot].ilvl > 339)
                        {
                            allItems[slot].power = allItems[slot].power + "/4 unlocked";
                        }
                        else
                        {
                            allItems[slot].power = allItems[slot].power + "/3 unlocked";
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


    var bruksOCDswap = function (item1,item2)
    {
        if (allItems[item1].ilvl<allItems[item2].ilvl || allItems[item2].ilvl =="265+" ||  allItems[item2].ilvl =="240+" )
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
    var CURRENT_XPAC = 7;
    var raidInstancesSortOrder = [];
    var raidDifficultySortOrder = ["Raid Finder", "Normal", "Heroic", "Mythic"];
    for (i = 21; i <= 21; i++) // legion raids up to ToS increase 38 if new raid comes
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
    for (var instanceNumber in toon.statistics.subCategories[5].subCategories[CURRENT_XPAC].statistics)
    {
        var instanceBoss = toon.statistics.subCategories[5].subCategories[CURRENT_XPAC].statistics[instanceNumber];
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


    //code for displaying missing mythics instead of completed, needs updating of more mythics are added
    var missingMythics ="Missing: ";

    // remove the undefined if 0 completed, or the "Missing: " if all completed (increment this if more dungeons added)
    if (!displayInfo.dungeon.Mythic.details || displayInfo.dungeon.Mythic.lockout ==10)
    {
        displayInfo.dungeon.Mythic.details = "";
        missingMythics = "";
    }

    else if (listMissing == true)
    {
        var mythicList = ["ATA", "FRE", "KR", "SotS", "SoB", "ToS", "TM", "TU", "TD", "WM"];  //add abbrvs to list if more are added
        for (i=0; i<mythicList.length; i++)
        {
            var n=displayInfo.dungeon.Mythic.details.search(mythicList[i]);
            if (n==-1)
            {
                missingMythics = missingMythics + mythicList[i] + " ";
            }
        }
        displayInfo.dungeon.Mythic.details = missingMythics;
    }

    var worldBosses = [52196, 52163, 52169, 52181, 52157, 52166];
    var worldBossKill = " ";

    for (i=0; i < toon.quests.length; i++)
    {
        if (worldBosses.indexOf(toon.quests[i]) > -1)
        {
            worldBossKill = "\u2713"; //unicode checkmark
            break;
        }
    } 

    var profession1 = "none";
    var profession2 = "none";
    var prof1Icon = "none";
    var prof2Icon = "none";
    var proftemp = "0";

    var prof1array = ["-", "-", "-", "-", "-", "-", "-", "-"];
    var prof2array = ["-", "-", "-", "-", "-", "-", "-", "-"];

  
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
                prof1array[prof_lookup[proftemp[0]]]= "\u2713";
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
                prof2array[prof_lookup[proftemp[0]]]= "\u2713";
            }
            else
            {
                prof2array[prof_lookup[proftemp[0]]]= toon.professions.primary[i].rank;
            }
        }
    }

    profession1 = profession1 + " " + prof1array;
    profession2 = profession2 + " " + prof2array;

// IDs for mythic+ were provied by @matdemy on twitter and this post: http://us.battle.net/forums/en/bnet/topic/20752275890
    var mythicPlus = "";
    for (i=0; i<toon.achievements.criteria.length; i++)
    {
        switch (toon.achievements.criteria[i])
        {
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


    var reps = [
        { "id":2164, "text":"" },//Champions of Azeroth
        { "id":2163, "text":"" },//Tortollan Seekers
        // alliance factions
        { "id":2160, "text":"" },//Proudmoore Admiralty
        { "id":2161, "text":"" },//Order of Embers
        { "id":2162, "text":"" },//Storm's Wake
        { "id":2159, "text":"" },//7th Legion
        // horde factions
        { "id":2103, "text":"" },//Zandalari Empire
        { "id":2156, "text":"" },//Talanji's Expedition
        { "id":2158, "text":"" },//Voldunai
        { "id":2157, "text":"" },//The Honorbound
    ];

    var repStanding = {
        0:"Hated",
        1:"Hostile", 
        2:"Unfriendly",
        3:"Neutral",
        4:"Friendly",
        5:"Honored",
        6:"Revered",
        7:"Exalted",
    };


    var x = 0;
    var reputations = []; //our output array
    for (i = 0; i<toon.reputation.length; i++)
    {

        for (var j = 0; j < reps.length; j++)
        {
            if (toon.reputation[i].id == reps[j].id && toon.reputation[i].standing > 2)
            {
                reputations.push(toon.reputation[i].name + " - " + repStanding[toon.reputation[i].standing] + " " + toon.reputation[i].value + "/" + toon.reputation[i].max);
                x=x+1;
            }
        }
    }


     // Preforming the outputs so they're easier to move around in the output array
    var heroicLockouts = displayInfo.dungeon.Heroic.lockout + "/" + displayInfo.dungeon.Heroic.instanceLength;
    var heroicProgress = displayInfo.dungeon.Heroic.progress + "/" + displayInfo.dungeon.Heroic.instanceLength + " (" + displayInfo.dungeon.Heroic.kills + ")";
    var mythicLockouts = displayInfo.dungeon.Mythic.lockout + "/" + displayInfo.dungeon.Mythic.instanceLength + " " +  displayInfo.dungeon.Mythic.details;
    var mythicProgress = displayInfo.dungeon.Mythic.progress + "/" + displayInfo.dungeon.Mythic.instanceLength + " (" + displayInfo.dungeon.Mythic.kills + ") ";// + mythicPlus,


    //output arrays
    var gearIlvl= [];
    var azeritePower = [];
    var enchants = [];

    for (i = 0; i<sortOrder.length; i++)
    {
        gearIlvl[i] = allItems[sortOrder[i]].ilvl;
        if (allItems[sortOrder[i]].power)
        {
            azeritePower.push(allItems[sortOrder[i]].power);
        }
        if (i < enchantableItems.length)
        {
            enchants.push(allItems[enchantableItems[i]].enchant);
        }

    }

    var raidArray=[];

    for (i = 0; i < raidInstancesSortOrder.length; i++)
    {
        for (var k = 0; k < raidDifficultySortOrder.length; k++)
        {
            var cellInfo = displayInfo.raid[raidInstancesSortOrder[i]][raidDifficultySortOrder[k]];
            raidArray[ i*8+k] = cellInfo.lockout + "/" + cellInfo.instanceLength;
        }
        for (k = 0; k < raidDifficultySortOrder.length; k++)
        {
            var secondCellInfo = displayInfo.raid[raidInstancesSortOrder[i]][raidDifficultySortOrder[k]];
            raidArray[i*8+k+4] = secondCellInfo.progress + "/" + secondCellInfo.instanceLength + " [" + secondCellInfo.activeWeeks + "] (" + secondCellInfo.kills + ")";
        }
    }


    if (raiderIO == true)
    {
        var raiderJSON = UrlFetchApp.fetch("https://raider.io/api/v1/characters/profile?region="+region+"&realm="+realmName+"&name="+toonName+"&fields=mythic_plus_highest_level_runs,mythic_plus_scores,mythic_plus_weekly_highest_level_runs", options);
        var raider = JSON.parse(raiderJSON.toString());

        if (!raider.statusCode)
        {
            if (raider.mythic_plus_weekly_highest_level_runs[0])
            {
                mythicLockouts = mythicLockouts + " weekly highest M+: " + raider.mythic_plus_weekly_highest_level_runs[0].mythic_level;
            }
            if (raider.mythic_plus_highest_level_runs[0])
            {
                mythicProgress = mythicProgress + " highest BfA M+: " + raider.mythic_plus_highest_level_runs[0].mythic_level;
            }
            if (raider.mythic_plus_scores)
            {
                mythicProgress = mythicProgress + " Score: " + raider.mythic_plus_scores.all;
            }
        }
    }

    var toonInfo = [

        toon_class,
        toon.level,
        mainspec,
        allItems.averageIlvl,
      
        gearIlvl,

        heartOfAzeroth,
        azeritePower,
        enchants,
        auditInfo,

        worldBossKill,      
        raidArray,
        heroicLockouts,
        heroicProgress, 
        mythicLockouts,
        mythicProgress,
        

        profession1, profession2, thumbnail, armory, reputations

    ];


    function flatten(input) 
    {
        var flatter = [];
        for (i =0; i < input.length; i++)
        {
            if (Array.isArray(input[i])) 
            {
                for (j=0; j<input[i].length; j++)
                {
                    flatter.push(input[i][j]);
                }
            }
            else
            {
                flatter.push(input[i]);  
            }
        }
        return flatter;
    }

    toonInfo = flatten(toonInfo);
    return toonInfo;
}

function vercheck()
{
    return current_version;
}
