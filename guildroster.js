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


/* globals UrlFetchApp apikey*/
/* exported guildOut */

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

    var membermatrix = [ ]; 

    var arrayPosition = 0;
    var roleSort = 0;
  
    for (var i=0; i<guild.members.length; i++)
    { 
      //Unfortunately it seems like the character.spec.role is sometimes missing or inaccurate. Leaving this in for later if it gets fixed
       /* if (guild.members[i].rank <= maxRank && guild.members[i].character.level >= minLevel)
       {
            if (guild.members[i].character.spec)
            {
                switch (guild.members[i].character.spec.role)
                {
                    case "TANK":
                        roleSort = 5;
                        break;
                    case "HEALING":
                        roleSort = 4;
                        break;
                    case "DPS":
                        roleSort = 3;
                        break;
                    default:
                        roleSort = 1;
                }
                    
                membermatrix[arrayPosition] = [guild.members[i].character.realm, guild.members[i].character.name, guild.members[i].rank, guild.members[i].character.achievementPoints, guild.members[i].character.level,  roleSort, guild.members[i].character.spec.role];
            }
            else
            {
                membermatrix[arrayPosition] = [guild.members[i].character.realm, guild.members[i].character.name, guild.members[i].rank, guild.members[i].character.achievementPoints, guild.members[i].character.level, 0, "API Error"];    
            } 
            arrayPosition++;            */


        //The "manual" and accurate code for role
        // It's still a touch buggy (seemingly for "stale" characters) but is currently much more accurate than the api
        //You can adjust these numbers to have one role appear first in the list; highest numbers are first
        //You can also change the word for the output, by default I have it set to what it *should* be from the API
        var playerRole = "Error";
        roleSort = 0;
        if (guild.members[i].rank <= maxRank && guild.members[i].character.level >= minLevel)
        {
            if (guild.members[i].character.spec)
            {
                if (["Blood", "Vengeance", "Guardian", "Brewmaster", "Protection"].indexOf(guild.members[i].character.spec.name) > -1)
                {
                    roleSort = 5;
                    playerRole = "TANK";
                }
                else if (["Restoration", "Mistweaver", "Discipline", "Holy"].indexOf(guild.members[i].character.spec.name) > -1)
               {
                    roleSort = 4;
                    playerRole = "HEALING";
                }
                else
                {
                    roleSort = 3;
                    playerRole = "DPS";
                }

                membermatrix[arrayPosition] = [guild.members[i].character.realm, guild.members[i].character.name, guild.members[i].rank, guild.members[i].character.achievementPoints, guild.members[i].character.level,  roleSort, playerRole];
                arrayPosition++;
            }


        }   // ...end of manual code for role
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
                return b[5]-a[5];
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
