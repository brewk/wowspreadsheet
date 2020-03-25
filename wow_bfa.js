/* ***********************************
 ***     Copyright (c) 2020 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
 ***
 ************************************* */

// For more info, help, or to contribute: http://bruk.org/wow 


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ IMPORTANT!!! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//    You need to put your Client ID and client Secret below, inside the quotes
//    Sign up and obtain them here: https://develop.battle.net/
//   Step by step instructions: http://bruk.org/api

var clientID = "";

var clientSecret = "";

// Change this to the threshold you want to start checking for epic gems (ie: if it's 349 anything 350 or above will be checked for epic gems)
var CONST_EPICGEM_ILVL = 350;

// This is threshold item level where gear is checked for enchants and gems
var CONST_AUDIT_ILVL = 309;

//If you want to list the uncompleted Mythic dungeons instead of the completed Mythics, change this from false to true

var listMissing = false;

// Option to include data from raider.io

var raiderIO = false;

// Option to display selected Azerite Essences
// this will display the equipped essence traits and their levels, you will need to add 4 columns AFTER your azerite gear and before your enchants to display these
 
var essencesOn = false; 

/* Advanced User Feature: Warcraft Logs best performance average percentile output for normal/heroic/mythic (current tier only)
   you'll need a warcraftlogs API key, which you can find here:
     https://www.warcraftlogs.com/profile
   at the bottom of the page, marked as public key. 
   Make sure you define an Application Name in the box above the keys
   you will need to add in this line to the output array:

    warcraftLogs,

  The output array starts at around line 1080 and begins with this line: 
      var toonInfo = [

  insert warcraftLogs, where you'd like them to appear in the output
  You'll then need to add THREE columns to your sheet where you want that info to be, and label them accordingly (normal, heroic, mythic) */

// put your warcraft api key here
var warcraftlogskey = "";


//If you want Legendary items to be marked with a + next to item level (use conditional formatting to change their color) change this to true

var markLegendary = true;

//display cloak's rank on output
var showCloakRank = true;

//mark gear if it's corrupted
var markCorruption = false;

// Everything below this, you shouldn't have to edit
//***************************************************************
/* globals Utilities, UrlFetchApp, PropertiesService */
/* exported wow, vercheck, warcraftLogs */
/*eslint no-unused-vars: 0*/


var warcraftLogs = ["No WarcaftLog API key", ":(", ":("];

var current_version = 4.5;

var options={ muteHttpExceptions:true };

function wow(region,toonName,realmName)
{
    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }
  
    if (clientID === "")
    {
        return ["Missing ID", "go here:", "http://bruk.org/api"];
    }

    var fix = fixNames(region,realmName,toonName);
    Utilities.sleep(Math.floor((Math.random() * 10000) + 1000)); // This is a random sleepy time so that we dont spam the api and get bonked with an error

    var scriptProperties = PropertiesService.getScriptProperties();
    var token = scriptProperties.getProperty("STORED_TOKEN");

    function wlogs ()
    {
        if (!toonName || !realmName)
        {
            return " ";  // If there's nothing in the column, don't even bother calling the API
        }
        if (!warcraftlogskey)
        {
            return "Error: No API key entered. Please visit https://www.warcraftlogs.com/profile to obtain one.";
        }

        toonName = toonName.replace(/\s/g, "");
        region = region.replace(/\s/g, "");
        realmName = realmName.replace("'", "");   //remove 's
        realmName = realmName.replace(/\s/g, "-");   //replace space with -

        var logs = "-";

        var fetchLogs = UrlFetchApp.fetch("https://www.warcraftlogs.com/v1/rankings/character/"+toonName+"/"+realmName+"/"+region+"?metric=dps&timeframe=historical&api_key="+warcraftlogskey+"", options);
        logs = JSON.parse(fetchLogs.toString());

        if (!logs[0])
        {
            var errorArray = ["No logs", " ", ""];
            return errorArray;
        }

        //check to see if the most recent log was a healing one.. if so, we're going to REALLY HOPE this is a full time healer
        else if (logs[0].spec == "Restoration" || logs[0].spec == "Mistweaver" || logs[0].spec == "Holy" || logs[0].spec == "Discipline")
        {
            fetchLogs = UrlFetchApp.fetch("https://www.warcraftlogs.com/v1/rankings/character/"+toonName+"/"+realmName+"/"+region+"?metric=hps&timeframe=historical&api_key="+warcraftlogskey+"", options);
            logs = JSON.parse(fetchLogs.toString());
        }


        if (logs.class || logs.status)
        {
            return "API Error, check if your API key is entered properly and that the API is working, check character on Armory to see if it loads";
        }

        var difficultyCounter = [0, 0, 0, 0, 0, 0];
        var difficultySums = [0, 0, 0, 0, 0, 0];

        for (var i=0; i<logs.length; i++)
        {
            if (logs[i].difficulty < 6)
            {
                difficultyCounter[logs[i].difficulty] = difficultyCounter[logs[i].difficulty]+1;
                difficultySums[logs[i].difficulty] = difficultySums[logs[i].difficulty] + logs[i].percentile;
            }
        }

        //this is to prevent /0 and making an icky output
        for (i=0; i<difficultyCounter.length; i++)
        {
            if (difficultyCounter[i] == 0)
            {
                difficultyCounter[i] = 1;
            }
        }

        var logInfo = [
            difficultySums[3]/difficultyCounter[3],
            difficultySums[4]/difficultyCounter[4],
            difficultySums[5]/difficultyCounter[5]
        ];
        return logInfo;
    }

    if (warcraftlogskey)
    {
        warcraftLogs = wlogs(region,realmName,toonName);
    }

    var toonInfo = [
        char(fix.region,fix.realmName,fix.name), 
        equipment(fix.region,fix.realmName,fix.name),
        quest(fix.region,fix.realmName,fix.name),
        raidsDungeons(fix.region,fix.realmName,fix.name),
        "Currently Not working", "Thanks Blizz",
        avatar(fix.region,fix.realmName,fix.name),
        rep(fix.region,fix.realmName,fix.name),
    ];

    toonInfo = flatten(toonInfo);
    return toonInfo;
}


//puts all names/realms/guilds in a standard form
function fixNames(reg,realm,toon)
{
    reg = reg.replace(/\s/g, "").toLowerCase();
    realm = realm.replace(/[\u200B-\u200D\uFEFF']/g, "").replace(/\s/g, "-").toLowerCase();
    toon = toon.toLowerCase().replace(/\s/g, "-");
    if (realm == "arak-arahm" || realm =="azjol-nerub" ||realm == "король-лич")
    {
        realm = realm.replace("-", "");
    }

    return {
        region: reg,
        realmName: realm, 
        name: toon,
    };
}


function flatten(input) 
{
    var flatter = [];
    for (var i =0; i < input.length; i++)
    {
        if (Array.isArray(input[i])) 
        {
            for (var j=0; j<input[i].length; j++)
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

function jsonFetch(URL, region)
{

    var scriptProperties = PropertiesService.getScriptProperties();
    var token = scriptProperties.getProperty("STORED_TOKEN");

    URL = URL + token;

    var profileJSON = UrlFetchApp.fetch(URL, options);


    if (!token || profileJSON.toString().length === 0)
    {
        var oauth_response = UrlFetchApp.fetch("https://"+region+".battle.net/oauth/token", {
            "headers" : {
                "Authorization": "Basic " + Utilities.base64Encode(clientID + ":" + clientSecret),
                "Cache-Control": "max-age=0"
            },
            "payload" : { "grant_type": "client_credentials" }
        });

        token = JSON.parse(oauth_response.toString()).access_token;

      
        scriptProperties.setProperty("STORED_TOKEN", token);
        profileJSON = UrlFetchApp.fetch(URL, options);    

        if (!token)
        {
            return "Error getting an API token. Please visit https://develop.battle.net/ and sign up for an account";
        }
    }

    if (profileJSON.length < 100) // try again, just in case?
    {
        profileJSON = UrlFetchApp.fetch(URL, options);
    }

    var parsedJson = JSON.parse(profileJSON.toString());
    return parsedJson;
}


function quest(region,realmName,toonName)
{
  
    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }


    var fetchURL = "https://"+region+".api.blizzard.com/profile/wow/character/"+realmName+"/"+toonName+"/quests/completed?namespace=profile-"+region+"&locale=en_US&access_token=";

    var quests = jsonFetch(fetchURL, region);
    if (quests.length < 100)
    {
        return "API Error";
    }

    var emissary_lookup = [];
    emissary_lookup[50562]="💎CoA";
    emissary_lookup[50598]="🏯ZE";
    emissary_lookup[50599]="⚓PA";
    emissary_lookup[50600]="🔥OoE";
    emissary_lookup[50601]="🌄SW";
    emissary_lookup[50602]="🐸TE";
    emissary_lookup[50603]="🏜️V";
    emissary_lookup[50604]="🐢TS";
    emissary_lookup[50605]="💙AWE";
    emissary_lookup[50606]="❤️HWE";
    emissary_lookup[56120]="🦈️‍️UnS";
    emissary_lookup[56119]="🐟WA";
    emissary_lookup[57157]="🐪Uldum";
    emissary_lookup[56308]="🐜Uldum";
    emissary_lookup[55350]="😾Uldum";
    emissary_lookup[56064]="🐼Vale";
    emissary_lookup[57008]="👹Vale";
    emissary_lookup[57728]="🐜Vale";
    emissary_lookup[58168]="Vision";   //vision
    emissary_lookup[58155]="Vision";   //vision
    emissary_lookup[58151]="Vision";   //vision
    emissary_lookup[58167]="Vision";   //vision
    emissary_lookup[58156]="Vision";   //vision

    var worldBosses = [52196, 52163, 52169, 52181, 52157, 52166];          
    var emsComplete = "";
    var worldBossKill = "";
    var warfront = "";
    var islandExpeditions = "";

    for (var i=0; i < quests.quests.length; i++)
    {
        if (worldBosses.indexOf(quests.quests[i].id) > -1)
        {
            worldBossKill = worldBossKill + "🌏 Weekly: \u2713 "; //unicode checkmark
        }
        if (emissary_lookup[quests.quests[i].id])
        {
            emsComplete = emsComplete + emissary_lookup[quests.quests[i].id] + "\u2713 "; //unicode checkmark
        }

        if (quests.quests[i].id == 56057)
        {
            worldBossKill = worldBossKill + "🦑Soulbinder: \u2713 "; 
        }
        if (quests.quests[i].id == 56056)
        {
            worldBossKill = worldBossKill + "🐛Terror: \u2713 "; 
        }

        if (quests.quests[i].id == 56057)
        {
            worldBossKill = worldBossKill + "👑Empress: \u2713 "; 
        }

        if (quests.quests[i].id == 55466)
        {
            worldBossKill = worldBossKill + "🐞Vuk'laz: \u2713 "; 
        }

        if (quests.quests[i].id == 54895 || quests.quests[i].id == 54896)
        {
            worldBossKill = worldBossKill + "🌳 Ivus : \u2713 "; 
        }
        if (quests.quests[i].id == 52847 || quests.quests[i].id == 52848)
        {
            worldBossKill = worldBossKill + "⚙️ Tank: \u2713 "; 
        }
        if (quests.quests[i].id == 53414 || quests.quests[i].id == 53416)
        {
            warfront = warfront + "🏰 Stormgarde: \u2713 ";
        }


        if (quests.quests[i].id == 56136 || quests.quests[i].id == 56136)
        {
            warfront = warfront + "🏯 Heroic-Storm: \u2713 ";
        }

        if (quests.quests[i].id == 57959 || quests.quests[i].id == 57960)
        {
            warfront = warfront + "🌚 Heroic-Dark: \u2713 ";
        }


        if (quests.quests[i].id == 53955 || quests.quests[i].id == 53992)
        {
            warfront = warfront + "🌘 Darkshore: \u2713 ";
        }

        if (quests.quests[i].id == 53435 || quests.quests[i].id == 53436)
        {
            islandExpeditions = "\u2713 ";
        }

    } 

    // return [worldBossKill, warfront, emsComplete, islandExpeditions];


    //by default we're only returning worldBossKills, you can use the above comment as an example of if you'd like more
    return worldBossKill;
  
}


function raidsDungeons(region,realmName,toonName)
{
  
  
    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }


    var fetchURL = "https://"+region+".api.blizzard.com/profile/wow/character/"+realmName+"/"+toonName+"/encounters/raids?namespace=profile-"+region+"&locale=en_US&access_token=";

    var progression = jsonFetch(fetchURL, region);
    if (progression.length < 100 || progression.code)
    {
        var errorMessage = [];
        for (var i=0; i<44; i++)
        {
            errorMessage.push("Api Error");
        }
        return errorMessage;
    }

    fetchURL = "https://"+region+".api.blizzard.com/profile/wow/character/"+realmName+"/"+toonName+"/encounters/dungeons?namespace=profile-"+region+"&locale=en_US&access_token=";
    var dungeons = jsonFetch(fetchURL, region);


    if (dungeons.length < 100 || dungeons.code)
    {
        errorMessage = [];
        for (i=0; i<44; i++)
        {
            errorMessage.push("Api Error");
        }
        return errorMessage;
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

    // Due to changes in the API this now has to be updated everytime a raid is added

    var currentXPACNAME = "Battle for Azeroth";
  
    var raidList = [
        { 
            name: "Uldir", id: 1031, bosses: 8, weeks: 0, total: 0 
        },
        { 
            name: "Battle of Dazar'alor", id: 1176, bosses: 9, weeks: 0, total: 0 
        },
        { 
            name: "Crucible of Storms", id: 1177, bosses: 2, weeks: 0, total: 0 
        },
        { 
            name: "The Eternal Palace", id: 1179, bosses: 8, weeks: 0, total: 0 
        },
        { 
            name: "Ny'alotha, the Waking City", id: 1180, bosses: 12, weeks: 0, total: 0 
        }
    ];
  
    var modes = {};
    modes.LFR = 0;
    modes.NORMAL = 1;
    modes.HEROIC =2;
    modes.MYTHIC =3;
  
  
    var progressionOut = [];

    var last = 0;
    if (progression.expansions)
    {
        last = progression.expansions.length-1; //the last xpansion in the api's array
    }

    var j = 0; // used to keep our place in the output array
    var k = 0; // used to keep place in the API array

    for (i=0; i < raidList.length; i++)
    {
    //by default zero everything out
        progressionOut[j] = 
        progressionOut[j+1] = 
        progressionOut[j+2] = 
        progressionOut[j+3] = 
        progressionOut[j+4] = 
        progressionOut[j+5] = 
        progressionOut[j+6] = 
        progressionOut[j+7] = 0 + "/" + raidList[i].bosses;
      
    
        //check if we have actually done any raids, if they're in this xpac, if they're the raid we're looking for
        if (progression.expansions && progression.expansions[last].expansion.name == currentXPACNAME &&  progression.expansions[last].instances[k] && progression.expansions[last].instances[k].instance.id == raidList[i].id && progression.expansions[last].instances[k].modes)
        {
            for (var l = 0; l<progression.expansions[last].instances[k].modes.length; l++)
            {
                progressionOut[j+modes[progression.expansions[last].instances[k].modes[l].difficulty.type]] = progressionOut[j+modes[progression.expansions[last].instances[k].modes[l].difficulty.type]+4] = 0;
                for (var m = 0; m< progression.expansions[last].instances[k].modes[l].progress.encounters.length; m++)
                {   
                    raidList[i].total = raidList[i].total + progression.expansions[last].instances[k].modes[l].progress.encounters[m].completed_count;
                    if (progression.expansions[last].instances[k].modes[l].progress.encounters[m].completed_count > raidList[i].weeks)
                    {
                        raidList[i].weeks = progression.expansions[last].instances[k].modes[l].progress.encounters[m].completed_count;
                    }
                    if (progression.expansions[last].instances[k].modes[l].progress.encounters[m].last_kill_timestamp > sinceTuesday)
                    {
                        progressionOut[j+modes[progression.expansions[last].instances[k].modes[l].difficulty.type]] = progressionOut[j+modes[progression.expansions[last].instances[k].modes[l].difficulty.type]] + 1;
                    }
                }
                progressionOut[j+modes[progression.expansions[last].instances[k].modes[l].difficulty.type]] = progressionOut[j+modes[progression.expansions[last].instances[k].modes[l].difficulty.type]] + "/" + raidList[i].bosses;
                progressionOut[j+modes[progression.expansions[last].instances[k].modes[l].difficulty.type]+4] = progression.expansions[last].instances[k].modes[l].progress.completed_count + "/" + raidList[i].bosses + " [" + raidList[i].weeks + "] ("+ raidList[i].total + ")";
            
                //reset these for next mode
                raidList[i].weeks =0;
                raidList[i].total = 0;
            }
            k++; //increment this only because we actually found the raid in the api
        }
        j=j+8;
    }
  
    var mDungeonLockout = 0;
    var mDungeonProgress = 0;
    var mTotal = 0;
    var hDungeonLockout = 0;
    var hDungeonProgress = 0;
    var hTotal = 0;
  
    last = 0;
    if (dungeons.expansions)
    {
        last = dungeons.expansions.length-1; //the last xpansion in the api's array
    }  
    if (dungeons.expansions && dungeons.expansions[last].expansion.name == currentXPACNAME &&  dungeons.expansions[last].instances[0])
    {
        for (i = 0; i < dungeons.expansions[last].instances.length; i++)
        {
            for (j=0; j < dungeons.expansions[last].instances[i].modes.length; j++)
            {
                if (dungeons.expansions[last].instances[i].modes[j].difficulty.type == "HEROIC")
                {
                    hDungeonProgress = hDungeonProgress + 1;
                    hTotal = hTotal + dungeons.expansions[last].instances[i].modes[j].progress.encounters[0].completed_count;
                    if (dungeons.expansions[last].instances[i].modes[j].progress.encounters[0].last_kill_timestamp > sinceYesterday)
                    {
                        hDungeonLockout = hDungeonLockout + 1;
                    }

                }
                else if (dungeons.expansions[last].instances[i].modes[j].difficulty.type == "MYTHIC")
                {
                    mDungeonProgress = mDungeonProgress + 1;
                    mTotal = mTotal + dungeons.expansions[last].instances[i].modes[j].progress.encounters[0].completed_count;

                    if (dungeons.expansions[last].instances[i].modes[j].progress.encounters[0].last_kill_timestamp > sinceTuesday)
                    {
                        mDungeonLockout = mDungeonLockout + 1;
                    }

                }
            }
        }
    }

    if (raiderIO == true)
    {
        var raiderJSON = UrlFetchApp.fetch("https://raider.io/api/v1/characters/profile?region="+region+"&realm="+realmName+"&name="+toonName.toUpperCase()+"&fields=mythic_plus_highest_level_runs,mythic_plus_scores,mythic_plus_weekly_highest_level_runs", options);
        var raider = JSON.parse(raiderJSON.toString());

        if (!raider.statusCode)
        {
            if (raider.mythic_plus_weekly_highest_level_runs[0])
            {
                mDungeonLockout = mDungeonLockout + "/11 weekly highest M+: " + raider.mythic_plus_weekly_highest_level_runs[0].mythic_level;
            }
            if (raider.mythic_plus_highest_level_runs[0])
            {
                mDungeonProgress = mDungeonProgress + "/11 highest BfA M+: " + raider.mythic_plus_highest_level_runs[0].mythic_level;
            }
            if (raider.mythic_plus_scores)
            {
                mDungeonProgress = mDungeonProgress + " Score: " + raider.mythic_plus_scores.all;
            }
        }
        progressionOut.push(hDungeonLockout+"/11", hDungeonProgress+"/11 ("+hTotal+")", mDungeonLockout,  mDungeonProgress+" ("+mTotal+")");
    }
    else
    {
        progressionOut.push(hDungeonLockout+"/11", hDungeonProgress+"/11 ("+hTotal+")", mDungeonLockout+"/11",  mDungeonProgress+"/11 ("+mTotal+")");
    }

    return progressionOut;
}


function equipment(region,realmName,toonName) 
{
    
    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }


    var fetchURL = "https://"+region+".api.blizzard.com/profile/wow/character/"+realmName+"/"+toonName+"/equipment?namespace=profile-"+region+"&locale=en_US&access_token=";

    var gear = jsonFetch(fetchURL, region);
    if (gear.length < 100)
    {
        return "API Error";
    }


    // Time to do some gear audits
    var auditInfo ="";

    var totalGems = [0, 0, 0, 0];
    var emptySockets = 0;
    var socketArray = [];

    var gemAudit = [
        { bool: 0, issue: "Old:" },
        { bool: 0, issue: "Cheap:" },
        { bool: 0, issue: "No Leviathan" },
        { bool: 0, issue: "Missing Epic:" },
        { bool: 0, issue: "Missing Trinket Punchcard" }
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
      
    var gemArray= [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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

    // NEW epic gems
    audit_lookup["168639"] =      //crit
      audit_lookup["168640"] =  //mastery
      audit_lookup["168641"] =   //haste
      audit_lookup["168642"] = 3;  //vers


    // NEW unique epic gems
    audit_lookup["168636"] =    //strength
      audit_lookup["168637"] = //agility
      audit_lookup["168638"] = 2; //int

    // new rare gem (ugh.. thanks)
    audit_lookup["169220"] = 1; //+movement


    //Punch Cards
    audit_lookup["167556"] =
      audit_lookup["167672"] =
      audit_lookup["167677"] =
      audit_lookup["167689"] =
      audit_lookup["167693"] =
      audit_lookup["168435"] =
      audit_lookup["168631"] =
      audit_lookup["168632"] =
      audit_lookup["168633"] =
      audit_lookup["168648"] =
      audit_lookup["168657"] =
      audit_lookup["168671"] =
      audit_lookup["168741"] =
      audit_lookup["168742"] =
      audit_lookup["168743"] =
      audit_lookup["168744"] =
      audit_lookup["168745"] =
      audit_lookup["168746"] =
      audit_lookup["168747"] =
      audit_lookup["168748"] =
      audit_lookup["168749"] =
      audit_lookup["168750"] =
      audit_lookup["168751"] =
      audit_lookup["168752"] =
      audit_lookup["168756"] =
      audit_lookup["168785"] =
      audit_lookup["168798"] =
      audit_lookup["168800"] =
      audit_lookup["168909"] =
      audit_lookup["168910"] =
      audit_lookup["168912"] =
      audit_lookup["168913"] =
      audit_lookup["170507"] =
      audit_lookup["170508"] =
      audit_lookup["170509"] =
      audit_lookup["170510"] = 6;


    //ring
    audit_lookup["5942"] = "Pact +40C";
    audit_lookup["5943"] = "Pact +40H";
    audit_lookup["5944"] = "Pact +40M";
    audit_lookup["5945"] = "Pact +40V";
    audit_lookup["5938"] = "Seal +30C";
    audit_lookup["5939"] = "Seal +30H";
    audit_lookup["5940"] = "Seal +30M";
    audit_lookup["5941"] = "Seal +30V";
    audit_lookup["6108"] = "Acrd +60C";
    audit_lookup["6109"] = "Acrd +60H";
    audit_lookup["6110"] = "Acrd +60M";
    audit_lookup["6111"] = "Acrd +60V";

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
    audit_lookup["6148"] = "Force *";
    audit_lookup["6112"] = "Machinist";
    audit_lookup["6150"] = "Naga Hide";
    audit_lookup["6149"] = "Ocean Resto";

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

    var sortOrder = {};
    sortOrder.HEAD =0;
    sortOrder.NECK =1;
    sortOrder.SHOULDER =2;
    sortOrder.BACK =3;
    sortOrder.CHEST =4;
    sortOrder.WRIST =5;
    sortOrder.HANDS =6;
    sortOrder.WAIST =7;
    sortOrder.LEGS =8;
    sortOrder.FEET =9;
    sortOrder.FINGER_1 =10;
    sortOrder.FINGER_2 =11;
    sortOrder.TRINKET_1 =12;
    sortOrder.TRINKET_2 =13;
    sortOrder.MAIN_HAND =14;
    sortOrder.OFF_HAND =15;

    // Azerite Info
    var heartOfAzeroth = 0;
    
    //thanks to github user bloodrash for this function
    function numberWithCommas(x)
    {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var enchantOrder = {}; 
    enchantOrder.MAIN_HAND = 0;
    enchantOrder.OFF_HAND = 1;
    enchantOrder.FINGER_1 = 2;
    enchantOrder.FINGER_2 = 3;
    enchantOrder.HANDS = 4;

    var enchants = ["", "", "", "", ""];
    var enchantableItems=["MAIN_HAND","OFF_HAND","FINGER_1","FINGER_2","HANDS"];
    var azeriteItems=["HEAD","SHOULDER","CHEST"];
    var azeritePower = [];
    var selectedPowers = [];
    var azCount = 0;
    var testArray = [];
    var averageIlvl = 0;
    var essences = [ "-", "-", "-", "-"];
    var cloakRank = "";
    
    var statsArray = [];
    var totalStats = [0, 0, 0, 0, 0, 0, 0, 0];
    var statOrder = [];
    statOrder.STAMINA = 0;
    statOrder.STRENGTH = 1;
    statOrder.AGILITY = 1;
    statOrder.INTELLECT = 1;
    statOrder.CRIT_RATING = 2;
    statOrder.HASTE_RATING = 3;
    statOrder.MASTERY_RATING = 4;
    statOrder.VERSATILITY = 5;
    statOrder.CORRUPTION = 6;
    statOrder.CORRUPTION_RESISTANCE = 7;

    function lowerCaseAllWordsExceptFirstLetters(string) 
    {
        return string.replace(/\w\S*/g, function (word) 
        {
            return word.charAt(0) + word.slice(1).toLowerCase();
        });
    }

    for (var i = 0; i < gear.equipped_items.length; i++)
    {
      
      
        if (gear.equipped_items[i].slot.type != "TABARD" && gear.equipped_items[i].slot.type != "SHIRT")
        {
            testArray[sortOrder[gear.equipped_items[i].slot.type]] = gear.equipped_items[i].level.value;
            averageIlvl = averageIlvl + gear.equipped_items[i].level.value;
        }
      
        //gear stats
        statsArray[sortOrder[gear.equipped_items[i].slot.type]] = "";
      
        statsArray[sortOrder[gear.equipped_items[i].slot.type]] = gear.equipped_items[i].name + "\n";
        if (gear.equipped_items[i].name_description)
        {
            statsArray[sortOrder[gear.equipped_items[i].slot.type]] = statsArray[sortOrder[gear.equipped_items[i].slot.type]] + gear.equipped_items[i].name_description.display_string + " ";
        }
        statsArray[sortOrder[gear.equipped_items[i].slot.type]]  = statsArray[sortOrder[gear.equipped_items[i].slot.type]] + lowerCaseAllWordsExceptFirstLetters(gear.equipped_items[i].slot.type)  + "\n";
        if  (gear.equipped_items[i].stats)
        {
            for (var j=0; j < gear.equipped_items[i].stats.length; j++)
            {
                if (gear.equipped_items[i].stats[j] && !gear.equipped_items[i].stats[j].is_negated) //negation occurs when gear has multiple primaries and only one is active
                {
                    if (markCorruption && gear.equipped_items[i].stats[j].type.type == "CORRUPTION")
                    {
                        testArray[sortOrder[gear.equipped_items[i].slot.type]] =  testArray[sortOrder[gear.equipped_items[i].slot.type]] + "c";
                    }
                    statsArray[sortOrder[gear.equipped_items[i].slot.type]] = statsArray[sortOrder[gear.equipped_items[i].slot.type]] + gear.equipped_items[i].stats[j].type.type.replace("_RATING", "") + " = " + gear.equipped_items[i].stats[j].value + "\n";
                    totalStats[statOrder[gear.equipped_items[i].stats[j].type.type]] =  totalStats[statOrder[gear.equipped_items[i].stats[j].type.type]] + gear.equipped_items[i].stats[j].value;
                }
            }
            if (gear.equipped_items[i].spells)
            {
                statsArray[sortOrder[gear.equipped_items[i].slot.type]] = statsArray[sortOrder[gear.equipped_items[i].slot.type]] + "\n" + gear.equipped_items[i].spells[0].description;
            }
        }


        //Enchant Checks
        if (enchantableItems.indexOf(gear.equipped_items[i].slot.type)!=-1 &&  gear.equipped_items[i].level.value >= CONST_AUDIT_ILVL)
        {
            enchants[enchantOrder[gear.equipped_items[i].slot.type]] = "None";
            if (gear.equipped_items[i].slot.type == "OFF_HAND" && !(gear.equipped_items[i].inventory_type.type == "TWOHWEAPON" || gear.equipped_items[i].inventory_type.type =="WEAPON")) // ignore non-weapon offhands
            {
                enchants[enchantOrder[gear.equipped_items[i].slot.type]] = "";
            }
            else
            {
                if (gear.equipped_items[i].enchantments)
                {
                    if (audit_lookup[gear.equipped_items[i].enchantments[0].enchantment_id])
                    {
                        enchants[enchantOrder[gear.equipped_items[i].slot.type]] = audit_lookup[gear.equipped_items[i].enchantments[0].enchantment_id];
                    
                        //this bit adds our stats to the stat boost array for the inspect/compare sheet
                        if (gear.equipped_items[i].inventory_type.type == "FINGER")
                        { 
                            var enchantStat = audit_lookup[gear.equipped_items[i].enchantments[0].enchantment_id].split("+");
                            enchantStat = enchantStat[1].split("0");
                            if (enchantStat[1] == "V")
                            {
                                gemArray[2] = gemArray[2] + enchantStat[0]*10;
                            }

                            else if (enchantStat[1] == "C")
                            {
                                gemArray[0] = gemArray[0] + enchantStat[0]*10;
                            }
                            else if (enchantStat[1] == "M")
                            {
                                gemArray[3] = gemArray[3] + enchantStat[0]*10;
                            }
                            else if (enchantStat[1] == "v")
                            {
                                gemArray[2] = gemArray[2] + enchantStat[0]*10;
                            }
                        }
                    }
                    else
                    {
                        enchants[enchantOrder[gear.equipped_items[i].slot.type]] = "Old";
                    }
                }
            }
        }


        //azerite item stuff and things
        if (azeriteItems.indexOf(gear.equipped_items[i].slot.type)!=-1)
        {
            azeritePower[azCount] = 0;
            selectedPowers[azCount] = "";
            if (gear.equipped_items[i].azerite_details)  // failing this means they're not wearing azerite empowered gear
            {
                for (j=0; j<gear.equipped_items[i].azerite_details.selected_powers.length; j++)
                {
                    azeritePower[azCount] = azeritePower[azCount] + 1;
                    if (gear.equipped_items[i].azerite_details.selected_powers[j].spell_tooltip)
                    {
                        selectedPowers[azCount] = gear.equipped_items[i].azerite_details.selected_powers[j].spell_tooltip.spell.name + "\n" + selectedPowers[azCount];
                    }
                }

                azeritePower[azCount] = azeritePower[azCount] + "/" + gear.equipped_items[i].azerite_details.selected_powers.length;
            }

            azCount=azCount+1;
        }

        if (gear.equipped_items[i].slot.type == "NECK" && gear.equipped_items[i].name == "Heart of Azeroth")
        {
            heartOfAzeroth = gear.equipped_items[i].azerite_details.level.value + Math.round(gear.equipped_items[i].azerite_details.percentage_to_next_level* 100)/100;
          
          
            //HoA essences
          
            if (gear.equipped_items[i].azerite_details.level.value>= 35 && gear.equipped_items[i].azerite_details.selected_essences)
            {
                for (j=0; j<gear.equipped_items[i].azerite_details.selected_essences.length; j++)
                {
                    if (gear.equipped_items[i].azerite_details.selected_essences)
                    {
                        if (gear.equipped_items[i].azerite_details.selected_essences[j].rank) // if there's no rank there's no reason to continue
                        {
                            var resistCheck = gear.equipped_items[i].azerite_details.selected_essences[j].passive_spell_tooltip.description.indexOf("Corruption Resistance increased by 10.");
                            if (resistCheck > -1)
                            {
                                totalStats[7] += 10;
                            }
                            var shortName = function (str1)
                            {
                                str1 = str1.replace("the ","").replace("of ","").replace("Essence ","").replace("The ","");
                                var split_names = str1.trim().split(" ");
                                if (split_names.length > 1) 
                                {
                                    var moreWords = split_names[0];
                                    for (var k =1; k<split_names.length; k++)
                                    { 
                                        moreWords = moreWords + split_names[k].charAt(0);
                                    }
                                    return moreWords;
                                }
                                return split_names[0];
                            };
                
                
                            essences[j] = shortName(gear.equipped_items[i].azerite_details.selected_essences[j].essence.name) + "(" + gear.equipped_items[i].azerite_details.selected_essences[j].rank + ")";
                        }
                    }
                }
            }
        
        }
      
        if (gear.equipped_items[i].quality.type == "LEGENDARY")
        {
            if (markLegendary)
            {
                testArray[sortOrder[gear.equipped_items[i].slot.type]] = testArray[sortOrder[gear.equipped_items[i].slot.type]] + "+";
            }
        
            if (gear.equipped_items[i].name =="Ashjra'kamas, Shroud of Resolve")
            {
                cloakRank = gear.equipped_items[i].name_description.display_string;
                if (showCloakRank)
                {
                    testArray[sortOrder[gear.equipped_items[i].slot.type]] = testArray[sortOrder[gear.equipped_items[i].slot.type]] + gear.equipped_items[i].name_description.display_string.replace("Rank ", " r");
                }
            }
        }

        //first we have to make sure they're not wearing a tabard, and mark it if it is
        var tabard = false;
        if (gear.equipped_items[i+1])
        {
            if (gear.equipped_items[i+1].slot.type == "TABARD")
            {
                tabard = true;
            }
        }

        if (gear.equipped_items[i].slot.type == "MAIN_HAND" && gear.equipped_items[i].inventory_type.name != "One-Hand")
        {
            if ((!gear.equipped_items[i+1] || tabard))
            {
                averageIlvl = averageIlvl + gear.equipped_items[i].level.value;
            }
        }
      
        // gem audit stuff.. oh boy!   
        if (gear.equipped_items[i].item.id == 167555) //some temporary punch card stuff, not sure how robust this'll be
        {
            if (!gear.equipped_items[i].sockets[2].item)   //it's always (99% of the time) that last blue punch card that's missing 
            {
                gemAudit[4].bool = 1;
            }
        }
        
        else if (gear.equipped_items[i].level.value > CONST_AUDIT_ILVL && gear.equipped_items[i].sockets)
        {
          
            for (j=0; j<gear.equipped_items[i].sockets.length; j++)
            {
            
                if (gear.equipped_items[i].sockets[j].socket_type.type=="PRISMATIC" && gear.equipped_items[i].quality.type!="ARTIFACT") // don't check artifacts in case people are still using those!
                {
              
                    if (!gear.equipped_items[i].sockets[j].item) 
                    {
                        emptySockets= emptySockets + 1;
                        socketArray.push(" " + gear.equipped_items[i].slot.type);
                    }
              
                    //if statement set up in descending order for gem IDs
                    //new bfa gems
                    else
                    {
                        if (gear.equipped_items[i].sockets[j].item.id > 169219) //new rare
                        {
                            gemStats[5].value = gemStats[5].value+5;
                        }
                    
                        //new epics, thanks for putting stats in a different order again!
                        else if (gear.equipped_items[i].sockets[j].item.id === 168639)
                        {
                            gemStats[0].value = gemStats[0].value+60;
                        }
                        else if (gear.equipped_items[i].sockets[j].item.id === 168640) 
                        {
                            gemStats[3].value = gemStats[3].value+60;
                        }
                        else if (gear.equipped_items[i].sockets[j].item.id === 168641) 
                        {
                            gemStats[1].value = gemStats[1].value+60;
                        }
                        else if (gear.equipped_items[i].sockets[j].item.id === 168642) 
                        {
                            gemStats[2].value = gemStats[2].value+60;
                        }
                        else if (gear.equipped_items[i].sockets[j].item.id > 168635) //NEW unique epic
                        {
                            gemStats[gear.equipped_items[i].sockets[j].item.id-168636+6].value = gemStats[gear.equipped_items[i].sockets[j].item.id-168636+6].value+120;
                        }
                        // older bfa gems
                        
                        else if (gear.equipped_items[i].sockets[j].item.id > 154125) //rare
                        {
                            gemStats[gear.equipped_items[i].sockets[j].item.id-154126].value = gemStats[gear.equipped_items[i].sockets[j].item.id-154126].value+40;
                        }
                        else if (gear.equipped_items[i].sockets[j].item.id > 153714) // +move 
                        {
                            gemStats[5].value = gemStats[5].value+3;                      
                        }
                        else if (gear.equipped_items[i].sockets[j].item.id > 153713) // xp 
                        {
                            gemStats[4].value = gemStats[4].value+5;                     
                        }
                        else if (gear.equipped_items[i].sockets[j].item.id > 153709) //uncommon
                        {
                            gemStats[gear.equipped_items[i].sockets[j].item.id-153710].value = gemStats[gear.equipped_items[i].sockets[j].item.id-153710].value+30;
                        }
                        else if (gear.equipped_items[i].sockets[j].item.id > 153706) //unique epic (kraken)
                        {
                            gemStats[gear.equipped_items[i].sockets[j].item.id-153707+6].value = gemStats[gear.equipped_items[i].sockets[j].item.id-153707+6].value+40;
                        }
                        else
                        {
                            gemStats[9].value = gemStats[9].value + 1;
                        }
                        
                        if (audit_lookup[gear.equipped_items[i].sockets[j].item.id] !=2 && audit_lookup[gear.equipped_items[i].sockets[j].item.id] != 3)
                        {
                            if (gear.equipped_items[i].level.value>CONST_EPICGEM_ILVL)
                            {
                                gemAudit[2].bool = 1;
                                gemAudit[3].bool = 1;
                                gemAudit[3].issue += " "+ gear.equipped_items[i].slot.type;
                            }
                        }
                        
                        else if (audit_lookup[gear.equipped_items[i].sockets[j].item.id] === 0)
                        {
                            gemAudit[1].bool = 1;
                            gemAudit[1].issue += " " + gear.equipped_items[i].slot.type;
                        }
                        else if (audit_lookup[gear.equipped_items[i].sockets[j].item.id] != 1 && audit_lookup[gear.equipped_items[i].sockets[j].item.id] !=2 && audit_lookup[gear.equipped_items[i].sockets[j].item.id] != 3)
                        {
                            gemAudit[0].bool = 1;
                            gemAudit[0].issue += " " + gear.equipped_items[i].slot.type;
                          
                        }
                        
                        totalGems[audit_lookup[gear.equipped_items[i].sockets[j].item.id]]++;
                    }
                }
              
            }
        }   
    }
    
    
    //preserve the array length in cases of 2-handers or weird nudity
    while (testArray.length <16)
    {
        testArray.push("");
        statsArray.push("");
    }
    
    
    averageIlvl = averageIlvl/16;
  
     
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
            gemAudit[2] = 0;

        }

        for (i=0; i<gemStats.length; i++)
        {
            if (gemStats[i].value > 0)
            {
                auditInfo = auditInfo + " +" + gemStats[i].value + gemStats[i].stat;
                gemArray[i] = gemArray[i] + gemStats[i].value; //for testing: + gemStats[i].stat;
            }
        }

    }
    

    for (i=0; i<gemAudit.length; i++)
    {
        if (gemAudit[i].bool > 0)
        {
            if (auditInfo.length > 1) //make things a bit more legible
            {
                auditInfo = auditInfo + ", ";
            }
            auditInfo = auditInfo + gemAudit[i].issue;
        }
    }

    if (emptySockets > 0)
    {
        auditInfo = auditInfo + " Empty Sockets (" + emptySockets + "-" + socketArray + ")";
    }

  
    if (essencesOn)
    {
        return flatten([averageIlvl,  testArray, heartOfAzeroth, azeritePower, essences, enchants, auditInfo, totalStats[6]-totalStats[7]]);
    }
    else
    {
        return flatten([averageIlvl,  testArray, heartOfAzeroth, azeritePower, enchants, auditInfo, totalStats[6]-totalStats[7]]);
    }
    
}

function char(region,realmName,toonName)
{

    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }

    var fetchURL = "https://"+region+".api.blizzard.com/profile/wow/character/"+realmName+"/"+toonName+"?namespace=profile-"+region+"&locale=en_US&access_token=";
    var profile = jsonFetch(fetchURL, region);
    if (profile.length < 100)
    {
        return "API Error";
    }

  
    var logout = new Date(0);
    logout.setUTCSeconds(profile.last_login_timestamp/1000);

    var title = "";
    var guild = "";

    if (profile.active_title)
    {
        title = profile.active_title.name;
    }

    if (profile.guild)
    {
        guild = profile.guild.name;
    }

    if (profile.character_class.name=="Death Knight" && profile.active_spec.name =="Frost")
    {
        profile.active_spec.name ="Frost ";  //adding this space will make the sheet able to tell frost mages and frost DKs apart, so we can assign melee/ranged
    }

    var mediaArray = [
        profile.character_class.name,
        profile.level,
        profile.active_spec.name,
        /* profile.equipped_item_level,
        logout,
        profile.achievement_points,
        title,
        guild,
        profile.race.name,
        profile.gender.name,
        profile.faction.name,*/

    ];
    return mediaArray;

}

  
function avatar(region,realmName,toonName)
{
  
    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }

    var fetchURL = "https://"+region+".api.blizzard.com/profile/wow/character/"+realmName+"/"+toonName+"/character-media?namespace=profile-"+region+"&locale=en_US&access_token=";
    var media = jsonFetch(fetchURL, region);
    if (media.length < 100)
    {
        return "API Error";
    }

    return [
        media.avatar_url,
        //  media.bust_url,
        //   media.render_url,
        "https://worldofwarcraft.com/en-"+region+"/character/"+region+"/"+realmName+"/"+toonName

    ];
}


function rep(region,realmName,toonName)
{
  
    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }

    var fetchURL = "https://"+region+".api.blizzard.com/profile/wow/character/"+realmName+"/"+toonName+"/reputations?namespace=profile-"+region+"&locale=en_US&access_token=";
    var reputations = jsonFetch(fetchURL, region);
    if (reputations.length < 100)
    {
        return "API Error";
    }


    var reps = [
        { "id":2164, "text":"" },//Champions of Azeroth
        { "id":2163, "text":"" },//Tortollan Seekers
        { "id":2391, "text":"" },//Rustbolt Resistance
        // alliance factions
        { "id":2160, "text":"" },//Proudmoore Admiralty
        { "id":2161, "text":"" },//Order of Embers
        { "id":2162, "text":"" },//Storm's Wake
        { "id":2159, "text":"" },//7th Legion
        { "id":2400, "text":"" },//Waveblade Ankoan
        // horde factions
        { "id":2103, "text":"" },//Zandalari Empire
        { "id":2156, "text":"" },//Talanji's Expedition
        { "id":2158, "text":"" },//Voldunai
        { "id":2157, "text":"" },//The Honorbound
        { "id":2373, "text":"" },//Unshackled
        { "id":2415, "text":"" },//Rajani
        { "id":2417, "text":"" },//Uldum

    ];
      
    var repArray = []; //our output array


    for (var i = 0; i<reputations.reputations.length; i++)
    {
        for (var j = 0; j < reps.length; j++)
        {
            if (reputations.reputations[i].faction.id == reps[j].id)
            {   
                if (reputations.reputations[i].paragon)
                {
                    if (reputations.reputations[i].paragon.value/reputations.reputations[i].paragon.max == 1)
                    {
                        repArray.push(reputations.reputations[i].faction.name + " - Paragon ✅" + reputations.reputations[i].paragon.value + "/" + reputations.reputations[i].paragon.max);
                    }
                    else
                    {
                        repArray.push(reputations.reputations[i].faction.name + " - Paragon " + reputations.reputations[i].paragon.value + "/" + reputations.reputations[i].paragon.max);
                    }
                }
                else
                {
                    repArray.push(reputations.reputations[i].faction.name + " - " + reputations.reputations[i].standing.name + " " + reputations.reputations[i].standing.value + "/" + reputations.reputations[i].standing.max);
                }

            }
        }
    }
    //keep the array the proper size, so that if we haven't met a faction our columns are still nice (also reps are broken for dark iron and maghar, blizz plz fix)
    while (repArray.length < 10) //adjust this int if more reputations are added
    {
        repArray.push("");
    }
    return repArray;

}


function vercheck()
{
    return current_version;
}
