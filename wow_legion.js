/* ToDo:
Verify that the lockout times are actually working for really real

Stuck for now, til API data:
--------------------------------
Artifact Weapon relic info
 World bosses  */

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
//    You need to put your api key here, inside the quotes of line 25
//    Request one here: https://dev.battle.net/apps/register
//    Step by step instructions: http://bruk.org/api
var apikey = "";



// Change this to the threshold you want to start checking for epic gems (ie: if it's 709 anything 710 or above will be checked for epic gems)
var CONST_EPICGEM_ILVL = 860;

// You shouldn't need to change this, but this is threshold item level where gear is checked for enchants and gems
var CONST_AUDIT_ILVL = 599;

// Everything below this, you shouldn't have to edit
//***************************************************************




function wow(region,toonName,realmName) {
  
  if(!toonName || !realmName)
  {
    return " ";  // If there's nothing in the column, don't even bother calling the API
  }
  
  
  
  Utilities.sleep(Math.floor((Math.random() * 10000) + 1000)); // This is a random sleepy time so that we dont spam the api and get bonked with an error
  
  //Getting rid of any sort of pesky no width white spaces we may run into
  toonName = toonName.replace(/[\u200B-\u200D\uFEFF]/g, '');
  region = region.replace(/[\u200B-\u200D\uFEFF]/g, '');
  realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9
  
  var toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=statistics,items,quests,achievements,audit,progression,feed,professions,talents&?locale=en_US&apikey="+apikey+"");
  var toon = JSON.parse(toonJSON.toString());
  
  
  
  var mainspec = "none";
  if(toon.talents[0].spec) //Has no main spec
  {
    if(toon.talents[0].selected ==  true) //our first spec is selected, so we'll assume that's the mainspec since  you're using it
    {
      mainspec = toon.talents[0].spec.name;
    }
    else //it isn't  selected, so it's our secondary spec
    {
      offspec = toon.talents[0].spec.name;
    }
  }
  
  // figuring out what the class is
  var class = 0;
  switch(toon.class)
  {
    case 1:
      class = "Warrior";
    break;
    case 2:
      class = "Paladin";
    break;
    case 3:
      class = "Hunter";
    break;
    case 4:
      class = "Rogue";
    break;
    case 5:
      class = "Priest";
    break;
    case 6:
      class = "DeathKnight";
    break;
    case 7:
      class = "Shaman";
    break;
    case 8:
      class = "Mage";
    break;
    case 9:
      class = "Warlock";
    break;
    case 10:
      class = "Monk";
    break;
    case 11:
      class = "Druid";
    break;
    case 12:
      class = "Demon Hunter";
    break;
    default:
      class = "?";
  }
  
  
  // Time to do some gear audits
  var auditInfo =" ";
  //var missingEnchants = " | Missing Enchants:"
  var boolMissingEnchants = 0;
  // var cheapEnchants = " | Cheap Enchants:"
  var boolCheapGems = 0;
  var boolNonEpicGems = 0;
  var cheapGems = "Cheap Gems:"
  var nonEpicGems = "Non-Epic Gems:"
  
  // I love me some look up tables! These are to check if you have a crappy enchant or gem
  var audit_lookup = {};
  
  //cheap enchants and gems
  
  //ring
  audit_lookup['5423'] =
  audit_lookup['5424'] =
  audit_lookup['5425'] =
  audit_lookup['5426'] =
  //cloak
  audit_lookup['5431'] =
  audit_lookup['5432'] =
  audit_lookup['5433'] =
  //gems
  audit_lookup['130218'] =
  audit_lookup['130217'] =
  audit_lookup['130216'] =
  audit_lookup['130215'] = 0;
  
  //better enchants and gems
  
  //ring
  audit_lookup['5427'] =
  audit_lookup['5428'] =
  audit_lookup['5429'] =
  audit_lookup['5430'] =
  
  //cloak
  audit_lookup['5434'] =
  audit_lookup['5435'] =
  audit_lookup['5436'] =
  
  //gems
  audit_lookup['130219'] =
  audit_lookup['130220'] =
  audit_lookup['130221'] =
  audit_lookup['130222'] =1;
  
  //epic gems
  audit_lookup['127760'] =     //critical
  audit_lookup['127764'] =     //versatility
  audit_lookup['127765'] =     //stamina
  audit_lookup['127763'] =     //multistrike
  audit_lookup['127762'] =     //mastery
  audit_lookup['127761'] = 2;  //haste
  
  
  //neck
  audit_lookup['5437'] = "Claw";
  audit_lookup['5438'] = "Army";
  audit_lookup['5439'] = "Satyr";
  audit_lookup['5889'] = "Hide";
  audit_lookup['5890'] = "Soldier";
  audit_lookup['5891'] = "Ancient";
  
  var thumbnail = "http://"+region+".battle.net/static-render/"+region+"/"+  toon.thumbnail;
  var armory = "http://"+region+".battle.net/wow/en/character/"+realmName+"/"+toonName+"/advanced";
  
  var tier = " ";
  var tier_pieces = [toon.items.head,toon.items.shoulder,toon.items.chest,toon.items.hands,toon.items.legs,toon.items.waist];
  
  var set1 = [];
  var set2 = [];
  
  for (var i = 0; i < tier_pieces.length; i++) {
    if(tier_pieces[i] && tier_pieces[i].tooltipParams.set){
      if(!set1.length)
        set1 = tier_pieces[i].tooltipParams.set;
      if(!set2.length && set1.indexOf(tier_pieces[i].id) ==-1){
        set2 = tier_pieces[i].tooltipParams.set;
      }
    }
  }
  
  if(set2.length){
    tier = set1.length + '/' + set2.length;
    } else {
    tier = set1.length;
  }
  
  var allItems={
    equippedItems:0,
    totalIlvl:0,
    upgrade: {
      total:0,
      current:0
    }
  }
  var enchantableItems=["neck","back","finger1","finger2"]
  var getItemInfo = function (item, slot){
    allItems[slot]={
      ilvl:"\u2063",
      upgrade:"-"
    }
    if (item){
      if (item.tooltipParams.upgrade){
        allItems[slot].upgrade= item.tooltipParams.upgrade.current + "/" + item.tooltipParams.upgrade.total
        allItems.upgrade.total+=item.tooltipParams.upgrade.total
        allItems.upgrade.current+=item.tooltipParams.upgrade.current
      }
      allItems.equippedItems++
      allItems[slot].ilvl = item.itemLevel
      allItems.totalIlvl += item.itemLevel
      if (item.itemLevel > CONST_AUDIT_ILVL){
        if (item.tooltipParams.gem0){
          if (item.itemLevel>CONST_EPICGEM_ILVL){
            if (audit_lookup[item.tooltipParams.gem0]!=2){
              boolNonEpicGems = 1
              nonEpicGems += " "+ slot
            }
          }
          else if (audit_lookup[item.tooltipParams.gem0]==0){
            boolCheapGems = 1
            cheapGems += " " + slot
          }
        }
        if (enchantableItems.indexOf(slot)!=-1){
          allItems[slot].enchant= "None"
          if (slot!="neck"){
            if (item.tooltipParams.enchant){
              var enchantResults = audit_lookup[item.tooltipParams.enchant]
              if (enchantResults == 1){
                allItems[slot].enchant = "Binding"
                } else if (enchantResults == 0){
                allItems[slot].enchant = "Word"
                } else {
                allItems[slot].enchant = "Old"
              }
            }
            } else  {
            if (item.tooltipParams.enchant){
              if(audit_lookup[item.tooltipParams.enchant])
                { allItems[slot].enchant = audit_lookup[item.tooltipParams.enchant] }
              else
                { allItems[slot].enchant = "Old" }
              
            }
          }
        }
      }
    }
  }
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
  ]
  for (var i = 0; i<sortOrder.length;i++){
    getItemInfo(toon.items[sortOrder[i]],sortOrder[i])
  }
  var bruksOCDswap = function (item1,item2){
    if (allItems[item1].ilvl<allItems[item2].ilvl){
      var swapValue = allItems[item1].ilvl
      allItems[item1].ilvl = allItems[item2].ilvl
      allItems[item2].ilvl = swapValue
    }
  }
  bruksOCDswap("finger1","finger2")
  bruksOCDswap("trinket1","trinket2")
  allItems.averageIlvl = allItems.totalIlvl / allItems.equippedItems  
  
  if(toon.audit.emptySockets != 0)
  {
    auditInfo = auditInfo + "Empty Gem Sockets: " + toon.audit.emptySockets;
  }
  
  
  if(boolCheapGems == 1)
    auditInfo = auditInfo + cheapGems;
  
  if(boolNonEpicGems == 1)
    auditInfo = auditInfo + nonEpicGems;
  
  
  
  
   // lock out "Weekly checker"
  var todayStamp =new Date();
  var today = todayStamp.getDay();
  var sinceYesterday  = 0;
  var now = todayStamp.getHours();
  var resetTime = new Date();
  
  var offset = new Date().getTimezoneOffset();
  offset=offset/60;
  
  if(region == "us")
  {
    resetTime.setHours(15-offset,0,0,0)
  }
  else
  {
    resetTime.setHours(7-offset,0,0,0)
  }
  
 

    sinceYesterday = resetTime.getTime();
  
  
  
  //attempt to fix post-midnight pre-reset
  if(now < 15-offset && now > -1 && region == "us") //if it's after midnight but before 11am 
  {
    sinceYesterday-=86400000
  }

   if(now < 7-offset && now > -1 && region == "eu") //if it's after midnight but before 7am 
  {
    sinceYesterday-=86400000
  }

  

  
  

  
  // now we have to figure out how long it's been since tuesday
  var sinceTuesday =new Date();
  
  var reset = region == "eu" ? 3 : 2;  // 2 for tuesday, 3 for wednesday
  
  
  var midnight = new Date();
  midnight.setHours(0,0,0,0);
  
  sinceTuesday = resetTime*1
  
  if(today == reset)  //it IS tuesday!
  {
    //attempt to fix post-midnight pre-reset
    if((now < 7-offset && now > -1 && region == "eu") || (now < 15-offset && now > -1 && region == "us")) //if it's after midnight but before 7am 
    {
      sinceTuesday-=(86400000*7)
    }
  }
  
  if(today > reset) // wednesday (thurs eu) - saturday
    sinceTuesday = sinceTuesday-(today-reset)*86400000
  
  else if(today < reset) // sunday + monday (tues eu)
    sinceTuesday = sinceTuesday-((7+today-reset))*86400000; // this was 6, but to account for EU it was changed to 7-reset to be either 6 or 5 to account for Wednesday resets
  
  
  


  
  
  
  
  
  
  
  var lockout_lookup = {};
  
  
  
  
  //WORLD BOSSES
  
  //not sure if these will have achievement kill ids like previous world bosses, may not be trackable!
  /* lockout_lookup[''] = "Ana-Mouz";
  lockout_lookup[''] = "Calamir";
  lockout_lookup[''] = "Drugon";
  lockout_lookup[''] = "Flotsam";
  lockout_lookup[''] = "Humongris";
  lockout_lookup[''] = "Levantus";
  lockout_lookup[''] = "Nazak";
  lockout_lookup[''] = "Nithogg";,
  lockout_lookup[''] = "Sharthos";
  lockout_lookup[''] = "Soultakers";
  lockout_lookup[''] = "Soultakers";
  lockout_lookup[''] = "Soultakers";
  lockout_lookup[''] = "Withered Jim";*/
  
  
// Stat categories
var STATS_RAIDS = 5

// Raid stat sub-categories
var STATS_RAIDS_LEGION = 6
  
  var ActiveWeeks = {}
  var Progress = {}
  var Lockout = {}

// Counters for ...
ActiveWeeks['ENlfr'] = 0
ActiveWeeks['ENnormal'] = 0
ActiveWeeks['ENheroic'] = 0
ActiveWeeks['ENmythic'] = 0
ActiveWeeks['NHlfr'] = 0
ActiveWeeks['NHnormal'] = 0
ActiveWeeks['NHheroic'] = 0
ActiveWeeks['NHmythic'] = 0
ActiveWeeks['Mythic'] = 0
 
// Counters for ...
Progress['ENlfr'] = 0
Progress['ENnormal'] = 0
Progress['ENheroic'] = 0
Progress['ENmythic'] = 0
Progress['NHlfr'] = 0
Progress['NHnormal'] = 0
Progress['NHheroic'] = 0
Progress['NHmythic'] = 0
Progress['Heroic'] = 0
Progress['Mythic'] = 0

//Counters for ...
Lockout['ENlfr'] = 0
Lockout['ENnormal'] = 0
Lockout['ENheroic'] = 0
Lockout['ENmythic'] = 0
Lockout['NHlfr'] = 0
Lockout['NHnormal'] = 0
Lockout['NHheroic'] = 0
Lockout['NHmythic'] = 0
Lockout['Heroic'] = 0
Lockout['Mythic'] = 0


// Warlords of Dreanor Dungeons
var dungeons = [
  
{id: 1, difficulty: 'Heroic'},
{id: 2, difficulty: 'Mythic'},
{id: 4, difficulty: 'Heroic'},
{id: 5, difficulty: 'Mythic'},
{id: 7, difficulty: 'Heroic'},
{id: 8, difficulty: 'Mythic'},
{id: 10, difficulty: 'Heroic'},
{id: 11, difficulty: 'Mythic'},
{id: 14, difficulty: 'Heroic'},
{id: 15, difficulty: 'Heroic'},
{id: 16, difficulty: 'Mythic'},
{id: 17, difficulty: 'Mythic'},
{id: 19, difficulty: 'Heroic'},
{id: 20, difficulty: 'Mythic'},
{id: 22, difficulty: 'Heroic'},
{id: 23, difficulty: 'Mythic'},
{id: 25, difficulty: 'Heroic'},
{id: 26, difficulty: 'Mythic'},
{id: 27, difficulty: 'Mythic'},
{id: 28, difficulty: 'Mythic'},
{id: 29, difficulty: 'ENlfr'},
{id: 30, difficulty: 'ENnormal'},
{id: 31, difficulty: 'ENheroic'},
{id: 32, difficulty: 'ENmythic'},
{id: 33, difficulty: 'ENlfr'},
{id: 34, difficulty: 'ENnormal'},
{id: 35, difficulty: 'ENheroic'},
{id: 36, difficulty: 'ENmythic'},
{id: 37, difficulty: 'ENlfr'},
{id: 38, difficulty: 'ENnormal'},
{id: 39, difficulty: 'ENheroic'},
{id: 40, difficulty: 'ENmythic'},
{id: 41, difficulty: 'ENlfr'},
{id: 42, difficulty: 'ENnormal'},
{id: 43, difficulty: 'ENheroic'},
{id: 44, difficulty: 'ENmythic'},
{id: 45, difficulty: 'ENlfr'},
{id: 46, difficulty: 'ENnormal'},
{id: 47, difficulty: 'ENheroic'},
{id: 48, difficulty: 'ENmythic'},
{id: 49, difficulty: 'ENlfr'},
{id: 50, difficulty: 'ENnormal'},
{id: 51, difficulty: 'ENheroic'},
{id: 52, difficulty: 'ENmythic'},
{id: 53, difficulty: 'ENlfr'},
{id: 54, difficulty: 'ENnormal'},
{id: 55, difficulty: 'ENheroic'},
{id: 56, difficulty: 'ENmythic'},
{id: 57, difficulty: 'NHlfr'},
{id: 58, difficulty: 'NHnormal'},
{id: 59, difficulty: 'NHheroic'},
{id: 60, difficulty: 'NHmythic'},
{id: 61, difficulty: 'NHlfr'},
{id: 62, difficulty: 'NHnormal'},
{id: 63, difficulty: 'NHheroic'},
{id: 64, difficulty: 'NHmythic'},
{id: 65, difficulty: 'NHlfr'},
{id: 66, difficulty: 'NHnormal'},
{id: 67, difficulty: 'NHheroic'},
{id: 68, difficulty: 'NHmythic'},
{id: 69, difficulty: 'NHlfr'},
{id: 70, difficulty: 'NHnormal'},
{id: 71, difficulty: 'NHheroic'},
{id: 72, difficulty: 'NHmythic'},
{id: 73, difficulty: 'NHlfr'},
{id: 74, difficulty: 'NHnormal'},
{id: 75, difficulty: 'NHheroic'},
{id: 76, difficulty: 'NHmythic'},
{id: 77, difficulty: 'NHlfr'},
{id: 78, difficulty: 'NHnormal'},
{id: 79, difficulty: 'NHheroic'},
{id: 80, difficulty: 'NHmythic'},
{id: 81, difficulty: 'NHlfr'},
{id: 82, difficulty: 'NHnormal'},
{id: 83, difficulty: 'NHheroic'},
{id: 84, difficulty: 'NHmythic'},
{id: 85, difficulty: 'NHlfr'},
{id: 86, difficulty: 'NHnormal'},
{id: 87, difficulty: 'NHheroic'},
{id: 88, difficulty: 'NHmythic'},
{id: 89, difficulty: 'NHlfr'},
{id: 90, difficulty: 'NHnormal'},
{id: 91, difficulty: 'NHheroic'},
{id: 92, difficulty: 'NHmythic'},
{id: 93, difficulty: 'NHlfr'},
{id: 94, difficulty: 'NHnormal'},
{id: 95, difficulty: 'NHheroic'},
{id: 96, difficulty: 'NHmythic'},



];

for (var i = 0, len = dungeons.length; i < len; i++)
{
    dungeon_id = dungeons[i]['id'];
    difficulty = dungeons[i]['difficulty'];

    stats = toon.statistics.subCategories[STATS_RAIDS].subCategories[STATS_RAIDS_LEGION].statistics[dungeon_id];

    if (stats.quantity > 0)
    {
        Progress[difficulty]++;

        if (stats.quantity > ActiveWeeks[difficulty])
        {
            ActiveWeeks[difficulty] = stats.quantity;
        }

        if(difficulty == 'Heroic' && stats.lastUpdated > sinceYesterday)
        {
          Lockout['Heroic']++;
        }
        else if(difficulty != 'Heroic' && stats.lastUpdated > sinceTuesday)
        {

          Lockout[difficulty]++;
        }
    }
}


  var profession1 = "none";
  if(toon.professions.primary[0]) {
    profession1 = toon.professions.primary[0].rank + " " + toon.professions.primary[0].name;
  }
  var profession2 = "none";
  if(toon.professions.primary[1]) {
    profession2 =  toon.professions.primary[1].rank + " " + toon.professions.primary[1].name;
  }
   
  
  var upgradePercent = "-";
  
  if(allItems.upgrade.total > 0)
    upgradePercent = Math.round(allItems.upgrade.current/allItems.upgrade.total*100) + "%";
  
  var toonInfo = new Array(
    
    class,
    toon.level,
    mainspec,
    allItems.averageIlvl,
    upgradePercent,
    tier,
    "x","x","x",
    
    auditInfo,    
    
    Lockout['ENlfr']+"/7",
    Lockout['ENnormal']+"/7",
    Lockout['ENheroic']+"/7",
    Lockout['ENmythic'] +"/7",
    
    Progress['ENlfr'] +"/7 ["+ActiveWeeks['ENlfr']+"]",
    Progress['ENnormal'] +"/7 ["+ActiveWeeks['ENnormal']+"]",
    Progress['ENheroic'] +"/7  ["+ActiveWeeks['ENheroic']+"]",
    Progress['ENmythic'] +"/7  ["+ActiveWeeks['ENmythic']+"]",
    
    Lockout['NHlfr']+"/10",
    Lockout['NHnormal']+"/10",
    Lockout['NHheroic']+"/10",
    Lockout['NHmythic']+"/10",

    Progress['NHlfr'] +"/10 ["+ActiveWeeks['NHlfr']+"]",
    Progress['NHnormal']+"/10 ["+ActiveWeeks['NHnormal']+"]",
    Progress['NHheroic']+"/10 ["+ActiveWeeks['NHheroic']+"]",
    Progress['NHmythic']+"/10 ["+ActiveWeeks['NHmythic']+"]",
 
    Lockout['Heroic']+"/8",
    Progress['Heroic']+"/8",
    
    Lockout['Mythic']+"/10",
    Progress['Mythic'] +"/10 [" + ActiveWeeks['Mythic'] + "]",
    
    
    profession1, profession2, thumbnail, armory
  )
  
  var possision = 6
  for (var i = 0; i<sortOrder.length;i++){
    toonInfo.splice(possision,0,allItems[sortOrder[i]].ilvl)
    toonInfo.splice(possision+28+i,0,allItems[sortOrder[i]].upgrade)
    possision++
  }
  possision+=3;
  for (var i = 0; i < enchantableItems.length;i++){
    toonInfo.splice(possision,0,allItems[enchantableItems[i]].enchant)
    possision++
  }
  return toonInfo;
}
