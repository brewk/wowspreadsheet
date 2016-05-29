
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
var CONST_EPICGEM_ILVL = 709;

// You shouldn't need to change this, but this is threshold item level where gear is checked for enchants and gems
var CONST_AUDIT_ILVL = 599;

// if you're having problems with your spreadsheet not matching your realms time zone, adjust this per hour (use negative numbers if needed)
var offset = 0;

// Everything below this, you shouldn't have to edit
//***************************************************************

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
    return " ";  // If there's nothing in the column, don't even bother calling the API
  }
  
  
  
  Utilities.sleep(Math.floor((Math.random() * 10000) + 1000)); // This is a random sleepy time so that we dont spam the api and get bonked with an error
  
  //Getting rid of any sort of pesky no width white spaces we may run into
  toonName = toonName.replace(/[\u200B-\u200D\uFEFF]/g, '');
  region = region.replace(/[\u200B-\u200D\uFEFF]/g, '');
  realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9
  
  var toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=items,quests,achievements,audit,progression,feed,professions,talents&?locale=en_US&apikey="+apikey+"");
  var toon = JSON.parse(toonJSON.toString());
 
  
  
  var mainspec = "none";
  var offspec = "none";
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
    
  
  // Time to do some gear audits
  var totalAudit = 0;
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
  audit_lookup['115803'] =     //critical
  audit_lookup['115807'] =     //versatility
  audit_lookup['115808'] =     //stamina
  audit_lookup['115806'] =     //multistrike
  audit_lookup['115805'] =     //mastery
  audit_lookup['115804'] = 0;  //haste
  
  
  //better enchants and gems
  
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
  audit_lookup['127414'] =     //eye of rukhmar (crit)
  audit_lookup['127415'] =     //eye of anzu (haste)
  audit_lookup['127416'] =     //eye of sethe (mastery)
  audit_lookup['115809'] =     //critical
  audit_lookup['115811'] =     //haste
  audit_lookup['115812'] =     //mastery
  audit_lookup['115813'] =     //multistrike
  audit_lookup['115814'] =     //versatility
  audit_lookup['115815'] = 1;  //stamina
  
  //epic gems
  audit_lookup['127760'] =     //critical
  audit_lookup['127764'] =     //versatility
  audit_lookup['127765'] =     //stamina
  audit_lookup['127763'] =     //multistrike
  audit_lookup['127762'] =     //mastery
  audit_lookup['127761'] = 2;  //haste
  
  
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
  
  audit_lookup['3847'] =  "(DK)Stoneskin Gargoyle";
  audit_lookup['3368'] =  "(DK)Fallen Crusader";
  audit_lookup['3366'] =  "(DK)Lichbane";
  audit_lookup['3367'] =  "(DK)Spellshattering";
  audit_lookup['3595'] =  "(DK)Spellbreaking";
  audit_lookup['3370'] =  "(DK)Razorice";
  
  var thumbnail = "http://"+region+".battle.net/static-render/"+region+"/"+  toon.thumbnail;
  var armory = "http://"+region+".battle.net/wow/en/character/"+realmName+"/"+toonName+"/advanced";
  
  var tier = " ";
  var tier_pieces = [toon.items.head,toon.items.shoulder,toon.items.chest,toon.items.hands,toon.items.legs];
  
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
	var enchantableItems=["mainHand","offHand","neck","back","finger1","finger2"]
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
							totalAudit++
						}
					}
					else if (audit_lookup[item.tooltipParams.gem0]==0){
						boolCheapGems = 1
						cheapGems += " " + slot
						totalAudit++
					}
				}
				if (enchantableItems.indexOf(slot)!=-1){
					allItems[slot].enchant= "None"
					if (slot!="offHand"&&slot!="mainHand"){
						if (item.tooltipParams.enchant){
							var enchantResults = audit_lookup[item.tooltipParams.enchant]
							if (enchantResults == 1){
								allItems[slot].enchant = "Gift"
							} else if (enchantResults == 0){
								allItems[slot].enchant = "Breath"
							} else {
								allItems[slot].enchant = "Unknown"
							}							
						}
					} else if (item.weaponInfo) {
						if (item.tooltipParams.enchant){
							allItems[slot].enchant = audit_lookup[item.tooltipParams.enchant]
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
		"offHand"//fix7.0? depends on how Artifact works
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
	/*
	Values that have to be changed:
	eIlvl -> allItems.totalIlvl fixed
	[slot]Id -> allItems[slot].ilvl fixed
	equippedItems -> allItems.equippedItems fixed
	[slot]Enchants -> allItems[slot].enchant fixed
 	*/

  /* if(boolMissingEnchants == 1)
  auditInfo = auditInfo + missingEnchants;
  if(boolCheapEnchants == 1)
     auditInfo = auditInfo + cheapEnchants;*/
  
  
  if(toon.audit.emptySockets != 0)
  {
    totalAudit += toon.audit.emptySockets;
    auditInfo = auditInfo + "Empty Gem Sockets: " + toon.audit.emptySockets;
  }
  
  
  if(boolCheapGems == 1)
    auditInfo = auditInfo + cheapGems;
  
  if(boolNonEpicGems == 1)
  {
    auditInfo = auditInfo + nonEpicGems;
  }
  
  
  
  
  var missingGlyphs = "\u2063";
  if(toon.audit.emptyGlyphSlots > 1)
  {
    totalAudit = totalAudit+toon.audit.emptyGlyphSlots;
    missingGlyphs = toon.audit.emptyGlyphSlots;
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
          {  HeroicActiveWeeks = toon.progression.raids[34].bosses[i].heroicKills }
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
  var reset = region == "eu" ? 3 : 2;  // 2 for tuesday, 3 for wednesday

  
  var midnight = new Date();
  midnight.setHours(0,0,0,0);
  
  if(today == reset)  //it IS tuesday!
    sinceTuesday = todayStamp - midnight + 3240;
  
  else  if(today > reset) // wednesday - saturday
    sinceTuesday = (today-1)*86400000;
  
  else if(today < reset) // sunday + monday
    sinceTuesday = (today+(8-reset))*86400000; // this was 6, but to account for EU it was changed to 8-reset to be either 6 or 5 to account for Wednesday resets

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
  lockout_lookup['10200'] = "kazzak";
  
  
  var legendary = ".";
  var quests = ['No Progress',0,0,0,0,0,0,0,0,0,0];
  
  
  var stuff =toon.quests.length;
  var cores = 0;
  
  for(i=0; i<stuff; i++)
  {
    if(toon.quests[i] == 37839 || toon.quests[i] == 37840 )
    {
      quests[9] = "Done";
    }
    
    
    if(toon.quests[i] == 39697)  // have finished getting sea chart
    {
      quests[8] = "Tomes of Chaos";
    }
    
    
    if(toon.quests[i] == 39057) // have built the level 2 shipyard
    {
      quests[7] = "Draenic Sea Chart";
    }
    
    
    
    if(toon.quests[i] == 37837)
    {
      quests[6] = "Build Shipyard 2";
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
    'kazzak': 0,
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
          else{
            lockout_counters[type]++;
		  }
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
  
  
  if(lockout_counters['kazzak'] > 0)
  {
    worldBoss = "K:\u2714 ";  // pretty lil checkmark :>
    
  }
  else
    worldBoss =  "K:- ";
  
  
  if(lockout_counters['rukhmar'] > 0)
  {
    worldBoss = worldBoss + "R:\u2714 ";  // pretty lil checkmark :>
    
  }
  else
    worldBoss =  worldBoss +"R:- ";
  
  
  if(lockout_counters['drov'] > 0)
  {
    worldBoss = worldBoss + "D:\u2714 ";  // pretty lil checkmark :>
  }
  else
    worldBoss = worldBoss + "D:- ";
  
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
  
  
  var upgradePercent = Math.round(allItems.upgrade.current/allItems.upgrade.total*100) + "%";
  
  var toonInfo = new Array(
    
    class, 
	toon.level, 
	mainspec, 
	offspec, 
	allItems.averageIlvl, 
	upgradePercent, 
	tier,
    totalAudit,
    lockout_counters['HFCLFR']+"/13",
    lockout_counters['HFCNorm']+"/13",
    lockout_counters['HFCHeroic']+"/13",
    lockout_counters['HFCMythic']+"/13",
    
    HFCLFRprogress, HFCNormprogress, HFCHeroicprogress, HFCMythicprogress,
    
    legendary,
    
    worldBoss,
    
    lockout_counters['heroic']+"/8 ",
    
    lockout_counters['HMLFR']+"/7 " +lockout_counters['BFLFR']+"/10 ",
    lockout_counters['HMNorm']+"/7 " +lockout_counters['BFNorm']+"/10 ",
    lockout_counters['HMHeroic']+"/7 " +lockout_counters['BFHeroic']+"/10 ",
    lockout_counters['HMMythic']+"/7 " +lockout_counters['BFMythic']+"/10 ",
    
    heroicsProg, LFRprogress, normalProgress, heroicRaidProgress, mythicProgress,
    
    profession1, profession2, missingGlyphs, auditInfo, thumbnail, armory
  )
  	var possision = 7
	for (var i = 0; i<sortOrder.length;i++){
		toonInfo.splice(possision,0,allItems[sortOrder[i]].ilvl)
		toonInfo.splice(possision+28+i,0,allItems[sortOrder[i]].upgrade)
		possision++
	}
	for (var i = 0; i < enchantableItems.length;i++){
		toonInfo.splice(possision,0,allItems[enchantableItems[i]].enchant)
		possision++
	}
  return toonInfo;
}
