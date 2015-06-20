
/* ***********************************
 ***     Copyright (c) 2015 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
 ***
 ***  Want to keep up to date or suggest modifications to this script?
 ***  then hop on over to http://twitter.com/bruk

 ** SHOUT OUTS / THANKS TO CONTRIBUTORS:
 ** /u/jethryn for the awesome job getting the new legendary quest milestone IDs
 ** /u/Kiingzy for enchant id numbers which helped greatly with the audit
 ** all the folks on twitter and reddit who have suggested such great features

 ************************************* */
//
//      Basic Instructions
//  1.) Timezones
//       If you copied this spreadsheet, it will likely have also copied the timezone settings
//       You will need to change the timezone settings to fit your server's time zone in order to make the rest timers work properly
//
//       In Google Docs, click File > Spreadsheet Settings... and select your timezone from the drop down
//
//
//
//  2.) Variables
//       There are some variables below that you need to change
//
//


//your api key, request one here:
// https://dev.battle.net/apps/register

var apikey = "y8xfmj9mctbxcer2fgebtfub4gzzdaun";




// Added in this variable to easily fix if you're having problems with the time of the daily dungeon resets being flakey
// Just set it to a positive or negative number to get it to what you need. Positive numbers if the reset is happening
// too soon, negative number if it's happening too late.

var offset = 0;

// Everything below this, you shouldn't have to edit
//***************************************************************










var key = "?locale=en_US&jsonp=callback&apikey=" + apikey




/* for reference, here's each items id number

'0' = "Head";
'1' = "Neck";
'2' = "Shoulder";'
'3' = "Shirt";
'4' = "Chest";
'5' = "Waist";'
'6' = "Legs";
'7' = "Feet";
'8' = "Wrist";'
'9' = "Hands";
'10' = "Finger1";
'11' = "Finger2";'
'12' = "Trinket1";
'13' = "Trinket2";
'14' = "Back";'
'15' = "MainHand";
'16' = "SecondaryHand";
'17' = "Ranged";'
'18' = "Tabard";'


 */



function wow(region,toonName,realmName) {

  if(!toonName || !realmName)
  {
    return "\u2063";  // If there's nothing in the column, don't even bother calling the API
  }



  Utilities.sleep(Math.floor((Math.random() * 10000) + 1000)); // This is a random sleepy time so that we dont spam the api and get bonked with an error


  var toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=items,quests,achievements,audit,progression,feed,professions,talents&"+key+"");


  toonJSON = toonJSON.toString().substring(9);
  toonJSON = toonJSON.substring(0, toonJSON.length - 2);
  toonInfo =  toonJSON;
  var toon = JSON.parse(toonJSON);



  var mainspec = "none";
  var offspec = "none";


  if(toon.talents[0].selected == true) //our first spec is selected, so we'll assume that's the mainspec since you're using it
  {
    mainspec = toon.talents[0].spec.name;
  }
  else //it isn't selected, so it's our secondary spec
  {
    offspec = toon.talents[0].spec.name;
  }


  if(toon.talents[1].spec) //if we have dual spec
  {
    if(toon.talents[1].selected == true) //our second spec is selected, so we'll assume that's the mainspec since you're using it
    {
      mainspec = toon.talents[1].spec.name;
    }
    else //it isn't selected, so it's our secondary spec
    {
      offspec = toon.talents[1].spec.name;
    }
  }


  // figuring out what the class is
  var class = 0;

  if(toon.class == "1")  { class = "Warrior"; }
  else if(toon.class == "2")  { class = "Paladin"; }
  else if(toon.class == "3")  { class = "Hunter"; }
  else if(toon.class == "4")  { class = "Rogue"; }
  else if(toon.class == "5")  {class = "Priest"; }
  else if(toon.class == "6")  {class = "DeathKnight";}
  else if(toon.class == "7")  {class = "Shaman";}
  else if(toon.class == "8")  {class = "Mage";}
  else if(toon.class == "9")  {class = "Warlock";}
  else if(toon.class == "10")  {class = "Monk"}
  else if(toon.class == "11")  {class = "Druid" }
  else  {class == "Broken"}








  //  Gear checking code
  var equippedItems = 0; // we're going to need this later to calculate the average item level



  // Time to do some gear audits
  var totalAudit = 0;
  var auditInfo ="\u2063";
  var missingEnchants = " | Missing Enchants:"
  var boolMissingEnchants = 0;
  var cheapEnchants = " | Cheap Enchants:"
  var boolCheapEnchants = 0;
  var boolCheapGems = 0;
  var cheapGems = " | Cheap Gems:"


  // I love me some look up tables! These are to check if you have a crappy enchant or gem
  var audit_lookup = {};



  //cheap enchants and gems
  audit_lookup['4443'] =  //"!!Elemental force";
  audit_lookup['4441'] =  //"!!Windsong";
  audit_lookup['4445'] =  //"!!Colossus";
  audit_lookup['4442'] =  //"!!Jade spirit";
  audit_lookup['4444'] =  //"!! Dancing steel";
  audit_lookup['4446'] =  //"!!Rivers song";
  audit_lookup['4699'] = //lord blastington's scope of crap
  audit_lookup['5285'] =
  audit_lookup['5299'] =
  audit_lookup['5302'] =
  audit_lookup['5284'] =
  audit_lookup['5281'] =
  audit_lookup['5301'] =
  audit_lookup['5293'] =
  audit_lookup['5298'] =
  audit_lookup['5300'] =
  audit_lookup['5294'] =
  audit_lookup['5297'] =
  audit_lookup['5295'] =
  audit_lookup['5292'] =
  audit_lookup['5303'] =
  audit_lookup['5304'] =
  audit_lookup['115807'] =
  audit_lookup['115808'] =
  audit_lookup['115806'] =
  audit_lookup['115805'] =
  audit_lookup['115804'] = 0;


  //expensive enchants and gems

  audit_lookup['5327'] =
  audit_lookup['5317'] =
  audit_lookup['5312'] =
  audit_lookup['5320'] =
  audit_lookup['5313'] =
  audit_lookup['5310'] =
  audit_lookup['5326'] =
  audit_lookup['5324'] =
  audit_lookup['5319'] =
  audit_lookup['5314'] =
  audit_lookup['5311'] =
  audit_lookup['5318'] =
  audit_lookup['5321'] =
  audit_lookup['5325'] =
  audit_lookup['5328'] =
  audit_lookup['115809'] =
  audit_lookup['115811'] =
  audit_lookup['115812'] =
  audit_lookup['115813'] =
  audit_lookup['115815'] = 1;


  //let's sneak in those weapon enchant names into that same array, why not?
  audit_lookup['5383'] =  "Hemets";
  audit_lookup['5276'] =  "Megawatt";
  audit_lookup['5275'] =  "Oglethorpes";
  audit_lookup['5336'] =  "Blackrock";
  audit_lookup['5335'] =  "Shadowmoon";
  audit_lookup['5334'] =  "Frostwolf";
  audit_lookup['5331'] =  "Shattered Hand";
  audit_lookup['5330'] =  "Thunderlord";
  audit_lookup['5337'] =  "Warsong";
  audit_lookup['5384'] =  "Bleeding Hollow";

  audit_lookup['3847'] =  "(DK)stoneskin gargoyle";
  audit_lookup['3368'] =  "(DK)fallen crusader";
  audit_lookup['3366'] =  "(DK)lichbane";
  audit_lookup['3367'] =  "(DK)spellshattering";
  audit_lookup['3595'] =  "(DK)spellbreaking";
  audit_lookup['3370'] =  "(DK)razorice";



  var eIlvl = 0;









  var mainHandId = "\u2063";
  //check if there's even anything in the slot first
  if( toon.items.mainHand){
    equippedItems++;
    mainHandId = toon.items.mainHand.itemLevel;
    eIlvl = eIlvl +  mainHandId;

    if(toon.items.mainHand.itemLevel > 599)
    {
      if(toon.items.mainHand.tooltipParams.gem0 && audit_lookup[toon.items.mainHand.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " weapon";
        totalAudit++;
      }

      if (toon.items.mainHand.tooltipParams.enchant)
      {
        if(audit_lookup[toon.items.mainHand.tooltipParams.enchant]==0)
        {
          boolCheapEnchants = 1;
          cheapEnchants = cheapEnchants + " weapon";
          totalAudit++;
        }
        else
        {
          auditInfo = "MH Ench: " + audit_lookup[toon.items.mainHand.tooltipParams.enchant];
        }
      }
      else
      {
        boolMissingEnchants = 1;
        missingEnchants = missingEnchants + " weapon";
        totalAudit++;
      }

    }
  }



  var offHandId = "\u2063";
  if( toon.items.offHand){
    equippedItems++;
    offHandId =  toon.items.offHand.itemLevel;   // now that we know there's gear there, set the id to the ilvl
    eIlvl = eIlvl + offHandId;
    // the off hand is very fricken "special" so it's gonna be clunky statements here.. what if it's a shield, what if it doesn't exist? who knows!


    if(toon.items.offHand.itemLevel > 599)
    {
      if(toon.items.offHand.tooltipParams.gem0 && audit_lookup[toon.items.offHand.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " offhand";
        totalAudit++;
      }

      if(toon.items.offHand.weaponInfo) // it's a weapon, not a shield or doodad
      {
        if (toon.items.offHand.tooltipParams.enchant)
        {
          if(audit_lookup[toon.items.offHand.tooltipParams.enchant]==0)
          {
            boolCheapEnchants = 1;
            cheapEnchants = cheapEnchants + " offhand";
            totalAudit++;
          }
          else
          {
            auditInfo = auditInfo + " OH Ench: " + audit_lookup[toon.items.offHand.tooltipParams.enchant];
          }
        }
        else
        {
          boolMissingEnchants = 1;
          missingEnchants = missingEnchants + " offhand";
          totalAudit++;
        }
      }

    }
  }

  var headId = "\u2063";
  if( toon.items.head){
    equippedItems++;
    headId = toon.items.head.itemLevel;
    eIlvl = eIlvl + headId;

    if(toon.items.head.itemLevel > 599)
    {
      if(toon.items.head.tooltipParams.gem0 && audit_lookup[toon.items.head.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " head";
        totalAudit++;
      }
    }
  }

  var neckId = "\u2063";
  if( toon.items.neck){
    equippedItems++;
    neckId = toon.items.neck.itemLevel;
    eIlvl = eIlvl + neckId;


    if(toon.items.neck.itemLevel > 599)
    {
      if(toon.items.neck.tooltipParams.gem0 && audit_lookup[toon.items.neck.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " neck";
        totalAudit++;
      }
      if (toon.items.neck.tooltipParams.enchant)
      {
        if(audit_lookup[toon.items.neck.tooltipParams.enchant]!=1)
        {
          boolCheapEnchants = 1;
          cheapEnchants = cheapEnchants + " neck";
          totalAudit++;
        }
      }
      else
      {
        boolMissingEnchants = 1;
        missingEnchants = missingEnchants + " neck";
        totalAudit++;
      }

    }
  }

  var shoulderId = "\u2063";
  if( toon.items.shoulder){
    equippedItems++;
    shoulderId = toon.items.shoulder.itemLevel;
    eIlvl = eIlvl + shoulderId;
    if(toon.items.shoulder.itemLevel > 599)
    {
      if(toon.items.shoulder.tooltipParams.gem0 && audit_lookup[toon.items.shoulder.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " shoulder";
        totalAudit++;
      }
    }
  }


  var backId = "\u2063";
  if( toon.items.back){
    equippedItems++;
    backId = toon.items.back.itemLevel;
    eIlvl = eIlvl + backId;

    if(toon.items.back.itemLevel > 599)
    {
      if(toon.items.back.tooltipParams.gem0 && audit_lookup[toon.items.back.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " back";
        totalAudit++;
      }
      if (toon.items.back.tooltipParams.enchant)
      {
        if(audit_lookup[toon.items.back.tooltipParams.enchant]!=1)
        {
          boolCheapEnchants = 1;
          cheapEnchants = cheapEnchants + " back";
          totalAudit++;
        }
      }
      else
      {
        boolMissingEnchants = 1;
        missingEnchants = missingEnchants + " back";
        totalAudit++;
      }

    }

  }

  var chestId = "\u2063";
  if( toon.items.chest){
    equippedItems++;
    chestId = toon.items.chest.itemLevel;
    eIlvl = eIlvl + chestId;
    if(toon.items.chest.itemLevel > 599)
    {
      if(toon.items.chest.tooltipParams.gem0 && audit_lookup[toon.items.chest.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " chest";
        totalAudit++;
      }
    }
  }



  var wristId = "\u2063";
  if( toon.items.wrist){
    equippedItems++;
    wristId = toon.items.wrist.itemLevel;
    eIlvl = eIlvl + wristId;
    if(toon.items.wrist.itemLevel > 599)
    {
      if(toon.items.wrist.tooltipParams.gem0 && audit_lookup[toon.items.wrist.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " wrist";
        totalAudit++;
      }
    }
  }

  var handsId = "\u2063";
  if( toon.items.hands){
    equippedItems++;
    handsId = toon.items.hands.itemLevel;
    eIlvl = eIlvl + handsId;
    if(toon.items.hands.itemLevel > 599)
    {
      if(toon.items.hands.tooltipParams.gem0 && audit_lookup[toon.items.hands.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " hands";
        totalAudit++;
      }
    }
  }


  var waistId = "\u2063";
  if( toon.items.waist){
    equippedItems++;
    waistId = toon.items.waist.itemLevel;
    eIlvl = eIlvl + waistId;
    if(toon.items.waist.itemLevel > 599)
    {
      if(toon.items.waist.tooltipParams.gem0 && audit_lookup[toon.items.waist.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " waist";
        totalAudit++;
      }
    }
  }

  var legsId = "\u2063";
  if( toon.items.legs){
    equippedItems++;
    legsId = toon.items.legs.itemLevel;
    eIlvl = eIlvl + legsId;
    if(toon.items.legs.itemLevel > 599)
    {
      if(toon.items.legs.tooltipParams.gem0 && audit_lookup[toon.items.legs.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " legs";
        totalAudit++;
      }
    }
  }

  var feetId = "\u2063";
  if( toon.items.feet){
    equippedItems++;
    feetId = toon.items.feet.itemLevel;
    eIlvl = eIlvl + feetId;
    if(toon.items.feet.itemLevel > 599)
    {
      if(toon.items.feet.tooltipParams.gem0 && audit_lookup[toon.items.feet.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " feet";
        totalAudit++;
      }
    }
  }


  var finger1Id = "\u2063";
  if( toon.items.finger1){
    equippedItems++;
    finger1Id = toon.items.finger1.itemLevel;
    eIlvl = eIlvl + finger1Id;



    if(toon.items.finger1.itemLevel > 599)
    {
      if (toon.items.finger1.tooltipParams.enchant)
      {
        if(toon.items.finger1.tooltipParams.gem0 && audit_lookup[toon.items.finger1.tooltipParams.gem0]!=1)
        {
          boolCheapGems = 1;
          cheapGems = cheapGems + " finger1";
          totalAudit++;
        }
        if(audit_lookup[toon.items.finger1.tooltipParams.enchant]!=1)
        {
          boolCheapEnchants = 1;
          cheapEnchants = cheapEnchants + " ring1";
          totalAudit++;
        }
      }
      else
      {
        boolMissingEnchants = 1;
        missingEnchants = missingEnchants + " ring1";
        totalAudit++;
      }

    }
  }


  var finger2Id = "\u2063";
  if( toon.items.finger2){
    equippedItems++;
    finger2Id = toon.items.finger2.itemLevel;
    eIlvl = eIlvl + finger2Id;

    if(toon.items.finger2.itemLevel > 599)
    {
      if(toon.items.finger2.itemLevel > 599)
      {
        if(toon.items.finger2.tooltipParams.gem0 && audit_lookup[toon.items.finger2.tooltipParams.gem0]!=1)
        {
          boolCheapGems = 1;
          cheapGems = cheapGems + " finger2";
          totalAudit++;
        }
        if (toon.items.finger2.tooltipParams.enchant)
        {
          if(audit_lookup[toon.items.finger2.tooltipParams.enchant]!=1)
          {
            boolCheapEnchants = 1;
            cheapEnchants = cheapEnchants + " ring2";
            totalAudit++;
          }
        }
        else
        {
          boolMissingEnchants = 1;
          missingEnchants = missingEnchants + " ring2";
          totalAudit++;
        }

      }

    }
  }

  // I have OCD, I want the higher Ilvl ring to ALWAYS be in the first column
var tempSwitch;
if(finger2Id>finger1Id)
{
 tempSwitch = finger1Id;
  finger1Id = finger2Id;
  finger2Id = tempSwitch;
}




  var trinket1Id = "\u2063";
  if( toon.items.trinket1){
    equippedItems++;
    var trinket1Id =  toon.items.trinket1.itemLevel;
    eIlvl = eIlvl + trinket1Id;
    if(toon.items.trinket1.itemLevel > 599)
    {
      if(toon.items.trinket1.tooltipParams.gem0 && audit_lookup[toon.items.trinket1.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " trinket1";
        totalAudit++;
      }
    }
  }

  var trinket2Id = "\u2063";
  if( toon.items.trinket2){
    equippedItems++;
    var trinket2Id =  toon.items.trinket2.itemLevel;
    eIlvl = eIlvl + trinket2Id;
    if(toon.items.trinket2.itemLevel > 599)
    {
      if(toon.items.trinket2.tooltipParams.gem0 && audit_lookup[toon.items.trinket2.tooltipParams.gem0]!=1)
      {
        boolCheapGems = 1;
        cheapGems = cheapGems + " trinket2";
        totalAudit++;
      }
    }
  }


  // I have OCD, I want the higher level trinket in the first slot even if you didn't put it there
  if(trinket2Id>trinket1Id)
{
 tempSwitch = trinket1Id;
  trinket1Id = trinket2Id;
  trinket2Id = tempSwitch;
}

eIlvl = (eIlvl / equippedItems);


  if(boolMissingEnchants == 1)
      auditInfo = auditInfo + missingEnchants;
  if(boolCheapEnchants == 1)
    auditInfo = auditInfo + cheapEnchants;
  if(boolCheapGems == 1)
  auditInfo = auditInfo + cheapGems;


  if(toon.audit.emptySockets != 0)
  {
    totalAudit = totalAudit+toon.audit.emptySockets;
    auditInfo = auditInfo + " | Empty Sockets: " + toon.audit.emptySockets;
  }

  if(toon.audit.emptyGlyphSlots != "0")
  {
     totalAudit = totalAudit+toon.audit.emptyGlyphSlots;
     auditInfo = auditInfo + " | Empty Glyphs: " + toon.audit.emptyGlyphSlots;
  }



  // LFR, normal, heroic progress
  var HMLFRprogress = 0;
  var HMNormprogress = 0;
  var HMHeroicprogress = 0;
  var HMMythicprogress = 0;

  var BFLFRprogress = 0;
  var BFNormprogress = 0;
  var BFHeroicprogress = 0;
  var BFMythicprogress = 0;

  var HFCLFRprogress = 0;
  var HFCNormprogress = 0;
  var HFCHeroicprogress = 0;
  var HFCMythicprogress = 0;
  var LFRActiveWeeks = 0;
  var NormActiveWeeks = 0;
  var HeroicActiveWeeks = 0;
  var MythicActiveWeeks = 0;



//progression.raids[33].bosses[9].lfrKills
if(toon.progression.raids[34])
{
  for (i= 0; i < 13; i++)
  {

          if(toon.progression.raids[34].bosses[i].lfrKills != 0)
          {
            HFCLFRprogress++;
            if(toon.progression.raids[34].bosses[i].lfrKills > LFRActiveWeeks)
            { LFRActiveWeeks = toon.progression.raids[34].bosses[i].lfrKills }
          }
          if(toon.progression.raids[34].bosses[i].normalKills != 0)
          {
            HFCNormprogress++;
            if(toon.progression.raids[34].bosses[i].normalKills > NormActiveWeeks)
            { NormActiveWeeks = toon.progression.raids[34].bosses[i].normalKills }
          }
          if(toon.progression.raids[34].bosses[i].heroicKills != 0)
          {
            HFCHeroicprogress++;
            if(toon.progression.raids[34].bosses[i].heroicKills > HeroicActiveWeeks)
            { NormActiveWeeks = toon.progression.raids[34].bosses[i].heroicKills }
          }
          if(toon.progression.raids[34].bosses[i].mythicKills != 0)
          {
            HFCMythicprogress++;
            if(toon.progression.raids[34].bosses[i].mythicKills > MythicActiveWeeks)
            { MythicActiveWeeks = toon.progression.raids[34].bosses[i].mythicKills }
          }

  }
}


HFCLFRprogress = HFCLFRprogress + "/13 [" + LFRActiveWeeks + "]";
HFCNormprogress = HFCNormprogress + "/13 [" + NormActiveWeeks + "]";
HFCHeroicprogress = HFCHeroicprogress + "/13 [" + HeroicActiveWeeks + "]";
HFCMythicprogress = HFCMythicprogress  + "/13 [" + MythicActiveWeeks +"]";



  if(toon.progression.raids[32])
  {
    for (i= 0; i < 7; i++)
    {

      if(toon.progression.raids[32].bosses[i].lfrKills != 0)
      {

        HMLFRprogress++;
      }
      if(toon.progression.raids[32].bosses[i].normalKills != 0)
      {
        HMNormprogress++;
      }
      if(toon.progression.raids[32].bosses[i].heroicKills != 0)
      {
        HMHeroicprogress++;
      }
      if(toon.progression.raids[32].bosses[i].mythicKills != 0)
      {
        HMMythicprogress++;
      }


    }


    for (i= 0; i < 10; i++)
    {
      if(toon.progression.raids[33].bosses[i].lfrKills != 0)
      {
        BFLFRprogress++;
      }
      if(toon.progression.raids[33].bosses[i].normalKills != 0)
      {
        BFNormprogress++;
      }
      if(toon.progression.raids[33].bosses[i].heroicKills != 0)
      {
        BFHeroicprogress++;
      }
      if(toon.progression.raids[33].bosses[i].mythicKills != 0)
      {
        BFMythicprogress++;
      }


    }
  }



  var LFRprogress = ""+HMLFRprogress+"/7 "+BFLFRprogress+"/10";
  var normalProgress = ""+HMNormprogress+"/7 "+BFNormprogress+"/10";
  var  heroicRaidProgress = ""+HMHeroicprogress+"/7 "+BFHeroicprogress+"/10";
  var mythicProgress = ""+HMMythicprogress+"/7 "+BFMythicprogress+"/10";



  var heroicsProg = 0; // unfortunately this is account wide



  var stuff =toon.achievements.achievementsCompleted.length;
  var things = 0;

  for(i=0; i<stuff; i++)
  {
    if(toon.achievements.achievementsCompleted[i] ==	'9046'	) { heroicsProg++; }
    if(toon.achievements.achievementsCompleted[i] ==	'9049'	) { heroicsProg++; }
    if(toon.achievements.achievementsCompleted[i] ==	'9053'	) { heroicsProg++; }
    if(toon.achievements.achievementsCompleted[i] ==	'9054'	) { heroicsProg++; }
    if(toon.achievements.achievementsCompleted[i] ==	'9047'	) { heroicsProg++; }
    if(toon.achievements.achievementsCompleted[i] ==	'8844'	) { heroicsProg++; }
    if(toon.achievements.achievementsCompleted[i] ==	'9052'	) { heroicsProg++; }
    if(toon.achievements.achievementsCompleted[i] ==	'9055'	) { heroicsProg++; }

  }

  heroicsProg= heroicsProg + "/8";



  // lock out "Weekly checker"
  var todayStamp =new Date();
  var today = todayStamp.getDay();

  // now we have to figure out how long it's been since tuesday
  var sinceTuesday = 0;


  var midnight = new Date();
  midnight.setHours(0,0,0,0);

  if(today == 2)  //it IS tuesday!
    sinceTuesday = todayStamp - midnight;

  else  if(today > 2) // wednesday - saturday
    sinceTuesday = (today-1)*86400000;

  else if(today < 2) // sunday + monday
    sinceTuesday = (today+6)*86400000;




  // now we have to figure out how long it's been since yesterday's reset


  var sinceYesterday  = 0;


  var now = todayStamp.getHours();

  var resetTime = new Date();

  var hrm = resetTime.getDate();




  resetTime.setHours(9+offset,0,0,0);
  sinceYesterday = resetTime;

  if(now < 10+offset && now > -1) //if it's after midnight but before 10am

  {
    sinceYesterday.setDate(hrm-1)
  }



  someDate = sinceYesterday.getTime();  //not sure if this is needed to convert to epoch



  var lockout_lookup = {};


  // HCF ID order: Hellfire Assault, Iron Reaver, Kormrok
  //Hellfire High Council, Kilrogg, Gorefiend
  //Shadow-Lord Iskar, Socrethar the Eternal, Tyrant Velhari
  //Fel Lord Zakuun, Xhul’horac, Mannoroth
  //Archimonde

  //LFR
  lockout_lookup['10201'] = lockout_lookup['10205'] = lockout_lookup['10209'] = lockout_lookup['10213'] = lockout_lookup['10217'] = lockout_lookup['10221'] = lockout_lookup['10225'] = lockout_lookup['10229'] =
  lockout_lookup['10241'] = lockout_lookup['10233'] = lockout_lookup['10237'] = lockout_lookup['10245'] = lockout_lookup['10249'] = "HFCLFR";

  //NORMAL
  lockout_lookup['10202'] = lockout_lookup['10206'] = lockout_lookup['10210'] = lockout_lookup['10214'] = lockout_lookup['10218'] = lockout_lookup['10222'] = lockout_lookup['10226'] =
  lockout_lookup['10230'] = lockout_lookup['10242'] = lockout_lookup['10234'] = lockout_lookup['10238'] = lockout_lookup['10246'] = lockout_lookup['10250'] = "HFCNorm";


  //HEROIC
  lockout_lookup['10203'] = lockout_lookup['10207'] = lockout_lookup['10211'] = lockout_lookup['10215'] = lockout_lookup['10219'] = lockout_lookup['10223'] = lockout_lookup['10227'] =
  lockout_lookup['10231'] = lockout_lookup['10243'] = lockout_lookup['10235'] = lockout_lookup['10239'] = lockout_lookup['10247'] = lockout_lookup['10251'] = "HFCHeroic";

  //MYTHIC
  lockout_lookup['10204'] = lockout_lookup['10208'] = lockout_lookup['10212'] = lockout_lookup['10216'] = lockout_lookup['10220'] = lockout_lookup['10224'] = lockout_lookup['10228'] =
  lockout_lookup['10232'] = lockout_lookup['10244'] = lockout_lookup['10236'] = lockout_lookup['10240'] = lockout_lookup['10248'] = lockout_lookup['10252'] = "HFCMythic";



// Highmaul and BRF

  lockout_lookup['9286'] = lockout_lookup['9280'] = lockout_lookup['9301'] = lockout_lookup['9306'] = lockout_lookup['9290'] = lockout_lookup['9295'] = lockout_lookup['9312'] = "HMLFR";

  lockout_lookup['9362'] = lockout_lookup['9334'] = lockout_lookup['9330'] = lockout_lookup['9339'] = lockout_lookup['9343'] = lockout_lookup['9324'] = lockout_lookup['9316'] = lockout_lookup['9354'] = lockout_lookup['9320'] = lockout_lookup['9358'] = "BFLFR";

  lockout_lookup['9287'] = lockout_lookup['9282'] = lockout_lookup['9302'] = lockout_lookup['9308'] = lockout_lookup['9292'] = lockout_lookup['9297'] = lockout_lookup['9313'] =  "HMNorm";

  lockout_lookup['9363'] = lockout_lookup['9336'] = lockout_lookup['9331'] = lockout_lookup['9340'] = lockout_lookup['9349'] = lockout_lookup['9327'] = lockout_lookup['9317'] = lockout_lookup['9355'] = lockout_lookup['9321'] = lockout_lookup['9359'] = "BFNorm";

  lockout_lookup['9288'] = lockout_lookup['9284'] = lockout_lookup['9303'] = lockout_lookup['9310'] = lockout_lookup['9293'] = lockout_lookup['9298'] = lockout_lookup['9314'] = "HMHeroic";

  lockout_lookup['9364'] = lockout_lookup['9337'] = lockout_lookup['9332'] = lockout_lookup['9341'] = lockout_lookup['9351'] = lockout_lookup['9328'] = lockout_lookup['9318'] = lockout_lookup['9356'] = lockout_lookup['9322'] = lockout_lookup['9360'] = "BFHeroic";

  lockout_lookup['9289'] = lockout_lookup['9285'] = lockout_lookup['9304'] = lockout_lookup['9311'] = lockout_lookup['9294'] = lockout_lookup['9300'] = lockout_lookup['9315'] = "HMMythic";

  lockout_lookup['9365'] = lockout_lookup['9338'] = lockout_lookup['9333'] = lockout_lookup['9342'] = lockout_lookup['9353'] = lockout_lookup['9329'] = lockout_lookup['9319'] = lockout_lookup['9357'] = lockout_lookup['9323'] = lockout_lookup['9361'] = "BFMythic";

  lockout_lookup['9272'] = lockout_lookup['9276'] = lockout_lookup['9274'] = lockout_lookup['9268'] = lockout_lookup['9267'] = lockout_lookup['9263'] = lockout_lookup['9261'] = lockout_lookup['9259'] = "heroic";

  lockout_lookup['9277'] = "drov";
  lockout_lookup['9279'] = "rukhmar";
  lockout_lookup['9278'] = "tarlna";


    var legendary = ".";
  var quests = ['No Progress',0,0,0,0,0,0,0,0,0,0];


  var stuff =toon.quests.length;
  var things = 0;
  var cores = 0;

  for(i=0; i<stuff; i++)
  {
    if(toon.quests[i] == 39000)
    {
          quests[8] = "???";   // yet to be determined
    }

    if(toon.quests[i] == 37841)
    {
    quests[7] = "Tome of Chaos";
    }

    if(toon.quests[i] == 37837)
    {
      quests[6] = "Build Shipyard";
    }

    if(toon.quests[i] == 36006)
    {
      quests[5] = "Elemental Runes";
    }

    else if (toon.quests[i] == 36004) //Power Unleashed
    {
      quests[4] = "Abrogator Stones";
    }
    else if (toon.quests[i] == 35993 )    //Tackling Teron'gor
    {
      quests[3]= "Nagrand";
    }

    //35990 35991 35992 all core quests

    else if (toon.quests[i] == 35990 ||  toon.quests[i] == 35991 || toon.quests[i] == 35992)
    {
      cores++;
    }



    else if (toon.quests[i] ==  35989 )
    {
      quests[2] = "Cores";
    }
    else if (toon.quests[i] == 36157 )
    {
      quests[1] = "Skyreach";
    }
  }

  if(cores == 3)
  {
    quests[2] = "Auchindoun";
  }




  for(i=9; i> -1; i--)
  {
    if(quests[i] != 0)
    {
      legendary = quests[i];
      break;
    }
  }







  var lockout_counters = {
    'HFCLFR' : 0,
    'HFCNorm' : 0,
    'HFCHeroic' : 0,
    'HFCMythic' : 0,
    'HMLFR' : 0,
    'BFLFR' : 0,
    'HMNorm' : 0,
    'BFNorm' : 0,
    'HMHeroic' : 0,
    'BFHeroic' : 0,
    'HMMythic' : 0,
    'BFMythic' : 0,
    'tarlna' : 0,
    'rukhmar' : 0,
    'drov' : 0,
    'heroic' : 0
  }

  var type = 0;
  var cheevoID = 0;


  for(i=0; i<50; i++)
  {
    if(todayStamp - toon.feed[i].timestamp  > sinceTuesday)
    {
      i = 51;
    }

    if(toon.feed[i] || i < 51)
    {
      if (toon.feed[i].achievement)
      {
        if (toon.feed[i].achievement.id)
        {


          cheevoID = toon.feed[i].achievement.id;
          type = lockout_lookup[cheevoID];
          if(type =="heroic")
          {
            if(toon.feed[i].timestamp  > sinceYesterday)
            {

              lockout_counters[type]++;
            }

          }
          else
            lockout_counters[type]++;
        }
      }
    }

  }

  var heroicLocks = 0;
  for(i = 0; i>8; i++)
  {
    heroicLocks =  heroicLocks+heroicDungeons[i]
  }

  var worldBoss = 0;

  if(lockout_counters['drov'] > 0)
  {
    worldBoss = "D:\u2714 ";  // pretty lil checkmark :>
  }
  else
    worldBoss = "D:- ";


  if(lockout_counters['rukhmar'] > 0)
  {
    worldBoss = worldBoss + "R:\u2714 ";  // pretty lil checkmark :>

  }
  else
    worldBoss =  worldBoss +"R:- ";


  if(lockout_counters['tarlna'] > 0)
  {
    worldBoss =  worldBoss + "T:\u2714 ";  // pretty lil checkmark :>

  }
  else
    worldBoss =  worldBoss +"T:- ";

  var profession1 = "none";

  if(toon.professions.primary[0]) {
    profession1 = toon.professions.primary[0].rank + " " + toon.professions.primary[0].name;
  }

  var profession2 = "none";
  if(toon.professions.primary[1]) {
    profession2 =  toon.professions.primary[1].rank + " " + toon.professions.primary[1].name;
  }



  var toonInfo = new Array(

    class, toon.level, mainspec, offspec, eIlvl,
    headId,
    neckId,
    shoulderId,
    backId,
    chestId,
    wristId,
    handsId,
    waistId,
    legsId,
    feetId,
    finger1Id,
    finger2Id,
    trinket1Id,
    trinket2Id,
    mainHandId,
    offHandId,
    totalAudit,
    lockout_counters['HFCLFR']+"/13",
    lockout_counters['HFCNorm']+"/13",
    lockout_counters['HFCHeroic']+"/13",
    lockout_counters['HFCMythic']+"/13",

    HFCLFRprogress, HFCNormprogress, HFCHeroicprogress, HFCMythicprogress,

    legendary,

    lockout_counters['heroic']+"/8 ",

    lockout_counters['HMLFR']+"/7 " +lockout_counters['BFLFR']+"/10 ",
    lockout_counters['HMNorm']+"/7 " +lockout_counters['BFNorm']+"/10 ",
    lockout_counters['HMHeroic']+"/7 " +lockout_counters['BFHeroic']+"/10 ",
    lockout_counters['HMMythic']+"/7 " +lockout_counters['BFMythic']+"/10 ",
    worldBoss,
    heroicsProg, LFRprogress, normalProgress, heroicRaidProgress, mythicProgress,

    profession1, profession2, auditInfo


  )

  return toonInfo;
}
