
/* ***********************************
 ***     Copyright (c) 2020 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
   **********************************  */


// formula usage =guild(region,realmName,guildName,maxRank,sortMethod,minLevel) 
// max rank is the maximum rank to output, we do this to try avoid too many calls to the api for big guilds with lots of alts
// Accepted sort methods: Level, Rank, CheevoPts, Role, Name


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


// **************** RANK BLACKLIST / WHITE LIST ****************
// If you want a certain rank of players to never or always be shown
// enter their number in the brackets, seperated by commas. Guild Master rank is 0
// Individuals listed in the above white/blacklist section will override rank white/blacklisting

// BLACK LIST: Add number of the rank you don't want to show up
// Usage: var BLACKLIST = [3, 4, 8];

var RANKBLACKLIST = [];

// WHITE LIST: Add number of the rank you want to always show up, even if it would be otherwise filtered out
// Usage: var RANKWHITELIST = [2, 5, 7];

var RANKWHITELIST = [];

// ******************************************************


/*global clientID, jsonFetch, fixNames*/
/*eslint no-undef: "error"*/
/* exported guildOut vercheckGuild*/

var current_versionGuild = 1.2;

function guildOut(region,realmName,guildName,maxRank,sortMethod,minLevel) 
{
  
  
    if (clientID === "")
    {
        return ["Missing client ID, please follow steps here:", "http://bruk.org/api"];
    }
  
    if (!guildName || !realmName )
    {
        return "\u2063";  // If there's nothing don't even bother calling the API
    }
  

    var fix = fixNames(region,realmName,guildName);
    var fetchURL = "https://"+fix.region+".api.blizzard.com/data/wow/guild/"+fix.realmName+"/"+fix.name+"/roster?namespace=profile-"+fix.region+"&locale=en_US&access_token=";
  

    var guild = jsonFetch(fetchURL, fix.region);
    if (guild.length < 100)
    {
        return "API Error";
    }
  
    if (maxRank<0 || maxRank>10)
    {
        return "Error loading API: try refreshing and verify values are typed correctly. Ensure your API key is entered into the script correctly. Errors can also come from loading 100+ characters at a time";
    }
  

    if (!guild.members)
    {
        return "Error: verify your apikey is entered and values are entered correctly";
    }


    var membermatrix = [];
    var arrayPosition = 0;
    var roleSort = ["Warrior","Paladin","Death Knight", "Hunter", "Shaman", "Druid", "Rogue", "Monk", "Demon Hunter", "Mage", "Warlock", "Priest", "Error"];

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
      
      
        if (RANKBLACKLIST.indexOf(guild.members[i].rank) > -1)
        {
            blackListed = true;
        }
        else if (RANKWHITELIST.indexOf(guild.members[i].rank) > -1 && guild.members[i].character.level >= minLevel)
        {
            whiteListed = true;
        }
      
      
        // whitelist/blacklist of individual names will override the rank Black/whitelisting  
        if (BLACKLIST.indexOf(guild.members[i].character.name) > -1)
        {
            blackListed = true;
        }
        else if (WHITELIST.indexOf(guild.members[i].character.name) > -1)
        {
            whiteListed = true;
        }
        
        if (((guild.members[i].rank <= maxRank && guild.members[i].character.level >= minLevel) || whiteListed )&& !blackListed )
        {
            var playerRole = "BlizzError";
            playerRole = classes[guild.members[i].character.playable_class.id];
                     

            membermatrix[arrayPosition] = [guild.members[i].character.realm.slug, guild.members[i].character.name, guild.members[i].rank, guild.members[i].character.achievementPoints, guild.members[i].character.level,  roleSort.indexOf(playerRole), playerRole];
            arrayPosition++;
        }   // ...end of manual code for role
    }
  
    if (NONGUILD[0])
    {
        for (i=0; i<NONGUILD.length; i++)
        {
            // not sure how this got weirded out, but thanks to @mattsmorrison for noticing it!
            membermatrix[arrayPosition] = [NONGUILD[i][0], NONGUILD[i][1], 99, 0, -1,  -1, "NonGuild"];
            arrayPosition++;
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

        case "Class":
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
        membermatrix[i].splice(3,5);
    }

    return membermatrix;
  
}

function vercheckGuild()
{
    return current_versionGuild;
}

//When copy pasting, delete 0Looking at the bottom if it shows up, otherwise it'll cause an error