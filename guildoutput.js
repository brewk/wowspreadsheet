/* ***********************************
 ***     Copyright (c) 2016 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
   **********************************  */



// Returns entire guild, can be called and used in two ways: 
// 1.) By rank
//    formula usage =transpose(guild(region, realm, guildname))
//
// 2.) By Achievement points (to try to find unique players)
//    formula usage =guild(region, realm, guildname,1)
// example template: https://docs.google.com/spreadsheets/d/1LtPZrrRTpgDE2lDQL2BGSdCEQW4Ub82lmJYarEaTqZ8/edit?usp=sharing
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ IMPORTANT!!! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//    You need to put your api key here
//    Request one here: https://dev.battle.net/apps/register
//    Step by step instructions: http://bruk.org/api
//   if you have this as part of a combined spreadsheet you can comment it out instead

var apikey = "";


function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? -1 : 1;
    }
}




function guild(region,realmName,guildName,opt_sort) {

  if(!guildName || !realmName )
  {
    return "\u2063";  // If there's nothing don't even bother calling the API
  }

//Getting rid of any sort of pesky no width white spaces we may run into
  toonName = guildName.replace(/[\u200B-\u200D\uFEFF]/g, '');
  region = region.replace(/[\u200B-\u200D\uFEFF]/g, '');
  realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  
  
  
 

  var guildJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/guild/"+realmName+"/"+guildName+"?fields=members&?locale=en_US&apikey="+apikey+"");

  var guild = JSON.parse(guildJSON);
  
  var memberTotal = guild.members.length;
  

  
  var membermatrix = [ ];
  
  
  // sort by number of cheevo points
  if(opt_sort)
  {
    for(i=0; i<guild.members.length; i++)
    {
      membermatrix[i] = [guild.members[i].character.achievementPoints, guild.members[i].character.name, guild.members[i].rank];
    }

      membermatrix.sort(sortFunction);  //  membermatrix[].sort(function(a, b){return b-a});
  
  }
  
  //sort by rank
  else
  {
    for(i=0; i<10; i++)
    {
          membermatrix[i] = [];
    }

    for(i=0; i<guild.members.length; i++)
    {
      rank=guild.members[i].rank;
      membermatrix[rank].push(guild.members[i].character.name);
    }
  }

    
  return membermatrix;
  
}
