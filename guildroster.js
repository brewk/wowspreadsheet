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

//Getting rid of any sort of pesky no width white spaces we may run into
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");
  
    if (maxRank<0 || maxRank>10)
    {
        return "Please enter a valid Max Rank. Be careful not to load too many characters at once, you may get locked out of the api";
    }
  
    var guildJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/guild/"+realmName+"/"+guildName+"?fields=members&?locale=en_US&apikey="+apikey+"");

    var guild = JSON.parse(guildJSON);

    var membermatrix = [ ]; 

    var arrayPosition = 0;
    var roleSort = 0;
  
    for (var i=0; i<guild.members.length; i++)
    { 
        if (guild.members[i].rank <= maxRank && guild.members[i].character.level >= minLevel)
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
                    
                membermatrix[arrayPosition] = [realmName, guild.members[i].character.name, guild.members[i].rank, guild.members[i].character.achievementPoints, guild.members[i].character.level,  roleSort, guild.members[i].character.spec.role];
            }
            else
            {
                membermatrix[arrayPosition] = [realmName, guild.members[i].character.name, guild.members[i].rank, guild.members[i].character.achievementPoints, guild.members[i].character.level, 0, "API Error"];    
            } 
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
