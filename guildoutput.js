/* ***********************************
 ***     Copyright (c) 2019 bruk
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





// formula usage =guildRoster(region, realm, guildname, outputMethod)
// example: =guildRoster("us","bloodscalp","Heart Attack", 0)
// outputMethod should be 0 or 1
// method 0 = output by rank
// method 1 = output by achievement points, to find alts

// enter your api key here:
// if you have this as part of a combined spreadsheet you can comment this line out
var clientID = "";

var clientSecret = "";



/* globals Utilities, UrlFetchApp, PropertiesService */
/* exported guildRoster */

function sortFunction(a, b) 
{
    if (a[0] === b[0]) 
    {
        return 0;
    }
    else 
    {
        return (a[0] > b[0]) ? -1 : 1;
    }
}

function guildRoster(region,realmName,guildName,outputMethod) 
{
  
    var scriptProperties = PropertiesService.getScriptProperties();
    var token = scriptProperties.getProperty("STORED_TOKEN");
  
    if (!guildName || !realmName )
    {
        return "\u2063";  // If there's nothing don't even bother calling the API
    }

//Getting rid of any sort of pesky no width white spaces we may run into
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");
    region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9
    if (outputMethod != 0 && outputMethod != 1)
    {
        return "Invalid outputMethod, please select 0 for rank output, or 1 for alt finder";
    }
  
    if (!guildName || !realmName )
    {
        return "\u2063";  // If there's nothing don't even bother calling the API
    }

    var options={ muteHttpExceptions:true };
    var guildJSON = UrlFetchApp.fetch("https://"+region+".api.blizzard.com/wow/guild/"+realmName+"/"+guildName+"?fields=members&?locale=en_US&access_token="+token+"", options);

    if (!token || guildJSON.toString().length === 0)
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
        guildJSON = UrlFetchApp.fetch("https://"+region+".api.blizzard.com/wow/guild/"+realmName+"/"+guildName+"?fields=members&?locale=en_US&access_token="+token+"", options);
        if (!token)
        {
            return "Error getting an API token. Please visit https://develop.battle.net/ and sign up for an account";
        }
    }
    
    
    //Getting rid of any sort of pesky no width white spaces we may run into
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");
  
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