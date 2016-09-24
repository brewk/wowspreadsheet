/* ***********************************
 ***     Copyright (c) 2015 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
   **********************************  */


// formula usage =guild(region, realm, guildname, outputMethod)
// outputMethod should be 0 or 1
// method 0 = output by rank
// method 1 = output by achievement points, to find alts

// enter your api key here:
// if you have this as part of a combined spreadsheet you can comment this line out
var apikey = "";


function sortFunction(a, b) 
{
    if (a[0] === b[0]) 
    {
        return 0;
    }
    else {
        return (a[0] > b[0]) ? -1 : 1;
    }
}

function guildOut(region,realmName,guildName,outputMethod) 
{
  
    if (!guildName || !realmName )
    {
        return "\u2063";  // If there's nothing don't even bother calling the API
    }

//Getting rid of any sort of pesky no width white spaces we may run into
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");
  
    if (outputMethod != 0 && outputMethod != 1)
    {
        return "Invalid outputMethod, please select 0 for rank output, or 1 for alt finder";
    }
  
    var guildJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/guild/"+realmName+"/"+guildName+"?fields=members&?locale=en_US&apikey="+apikey+"");

    var guild = JSON.parse(guildJSON);

    var membermatrix = [ ]; 
    var rank = 0;
  
    if (outputMethod === 1)
   {
        for (var i=0; i<guild.members.length; i++)
       {
            membermatrix[i] = [guild.members[i].character.achievementPoints, guild.members[i].character.name, guild.members[i].rank];
        }
        membermatrix.sort(sortFunction);
    }
    else
    {
        for (i=0; i<10; i++)
        {
            membermatrix[i] = [];
        }

        for (i=0; i<guild.members.length; i++)
       {
            rank=guild.members[i].rank;
            membermatrix[rank].push(guild.members[i].character.name);
        }
    }

    return membermatrix;
  
}
