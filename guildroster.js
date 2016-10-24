/* ***********************************
 ***     Copyright (c) 2016 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
   **********************************  */


// formula usage =guild(region,realmName,guildName,maxRank,sortMethod,minLevel) 
// max rank is the maximum rank to output, we do this to try avoid too many calls to the api for big guilds with lots of alts
// Accepted sort methods: Level, Rank, CheevoPts, Role, Name

// enter your api key here:
// if you have this as part of a combined spreadsheet you can comment this line out
// var apikey = "";


// **************** BLACKLIST / WHITELIST ****************
//   You can put these variables into a seperate .gs script file to facilitate updating your script in the future

// BLACK LIST: Add player names who you don't want to show up
// Usage: var BLACKLIST = ["Name1", "Name2", "Name3"];

var BLACKLIST = [];


// WHITE LIST: Add player names who you want to ALWAYS show up no matter the filter
// Usage: var WHITELIST = ["Name1", "Name2", "Name3"];

var WHITELIST = [];


// Non-Guild WHITELIST: These are players not in your guild
// Because they will not be in your guild's API they cannot be sorted properly and will appear at the bottom of the list
// Usage: var NONGUILD = [["Realm", "Character"], ["Realm", "Character"]];

var NONGUILD = [];


// ******************************************************


/* globals UrlFetchApp apikey*/
/* exported guildOut vercheckGuild*/

var current_versionGuild = 1.021;

function guildOut(region,realmName,guildName,maxRank,sortMethod,minLevel) 
{
  
    if (!guildName || !realmName )
    {
        return "\u2063";  // If there's nothing don't even bother calling the API
    }

    if (!apikey)
    {
        return "Error: No API key entered. Please visit http://dev.battle.net/ to obtain one. Instructions availible at http://bruk.org/wow";
    }

    //Getting rid of any sort of pesky no width white spaces we may run into
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");
  
    if (maxRank<0 || maxRank>10)
    {
        return "Error loading API: try refreshing and verify values are typed correctly. Ensure your API key is entered into the script correctly. Errors can also come from loading 100+ characters at a time";
    }

    var options={ muteHttpExceptions:true };
    var guildJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/guild/"+realmName+"/"+guildName+"?fields=members&?locale=en_US&apikey="+apikey+"", options);

    var guild = JSON.parse(guildJSON);

    if (!guild.members)
    {
        return "Error: verify your apikey is entered and values are entered correctly";
    }

    var membermatrix = []; 
    var roleSort = ["Tank","Healer","Ranged","Melee"];//this is the order it is going to get sorted by. Swap thise around if you want it in another order

    
    var roles = {
    Tank: ["Blood","Protection","Guardian","Brewmaster","Vengeance"],
    Healer: ["Restoration", "Holy", "Discipline", "Mistweaver"],
    Ranged: ["Elemental","Beast Mastery","Marksmanship","Balance","Affliction","Demonology","Destruction","Arcane","Fire","Frost","Shadow"],
    Melee: ["Retribution","Frost","Unholy","Arms","Fury","Survival","Enhancement","Feral","Windwalker","Outlaw","Assassination","Subtlety","Havoc"]
    };//forst dks and frost mages needs its own check
    var classes = [//this is for detemening what playerclass the variable class refers to. Needed when we want to check if frost refers to DK or Mage.
    "Error",
    "Warrior",
    "Paladin",
    "Hunter",
    "Rogue",
    "Priest",
    "Death Knight",
    "Shaman",
    "Mage",
    "Warlock",
    "Monk",
    "Druid",
    "Demon Hunter",
    ];
    
    for (var i=0; i<guild.members.length; i++)
    { 

        //The "manual" and more accurate code for role
        //It's still a touch buggy (seemingly for "stale" characters) but is currently much more accurate than the api
        var whiteListed = false;
        var blackListed = false;
        
        if (BLACKLIST.indexOf(guild.members[i].character.name) > -1)
        {
            blackListed = true;
        }
        else if (WHITELIST.indexOf(guild.members[i].character.name) > -1)
        {
            whiteListed = true;
        }
        
        if (((guild.members[i].rank <= maxRank && guild.members[i].character.level >= minLevel) || whiteListed)&& !blackListed)
        {
            var playerRole = "Api Error";
            if (guild.members[i].character.spec)
            {
                for (var role in roles)
                {
                    if (guild.members[i].character.spec.name=="Frost")
                    {
                        playerRole = guild.members[i].class=="Mage"? "Ranged": "Melee";
                    }
                    else if (roles[role].indexOf(guild.members[i].character.spec.name) != -1)
                    {
                        playerRole = role;
                    }
                }
            }
            membermatrix.push(guild.members[i].character.realm, guild.members[i].character.name, guild.members[i].rank, guild.members[i].character.achievementPoints, guild.members[i].character.level, roleSort.indexOf(playerRole), playerRole);
        }   // ...end of manual code for role
    }
  
    if (NONGUILD[0])
    {
        for (i=0; i<NONGUILD.length; i++)
        {
            membermatrix.push([NONGUILD[i][0], NONGUILD[i][1], 11, 0, 0, roleSort.length+1, "NonGuild"]);
        }
    }
  
    switch (sortMethod)
    {
        case "Level":  
            membermatrix.sort(function(a,b) 
            {
                return b[4]-a[4];
            });
            break;
      
        case "Rank":
            membermatrix.sort(function(a,b) 
            {
                return a[2]-b[2];
            });
            break;

        case "CheevoPts":
            membermatrix.sort(function(a,b) 
            {
                return (b[3] < a[3]) ? -1 : 1;
            });
            break;

        case "Name":
            membermatrix.sort(function(a,b) 
            {
                return (a[1] < b[1]) ? -1 : 1;
            });
            break;

        case "Role":
            membermatrix.sort(function(a,b) 
           {
               if (a[5] === -1)
               {
                   a = roleSort.length;
               } 
               if (b[5] === -1)
               {
                   b = roleSort.length;
               } 
               return a[5]-b[5];
            });
            break;
        default: 
            break;

    }
   
  
    for (i = 0 ; i < membermatrix.length ; i++)
    {
        membermatrix[i].splice(2,4);
    }

    return membermatrix;
  
}

function vercheckGuild()
{
    return current_versionGuild;
}

//When copy pasting, delete 0Looking at the bottom if it shows up, otherwise it'll cause an error
