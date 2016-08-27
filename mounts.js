
/* ***********************************
 ***     Copyright (c) 2016 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
 ***
 ***  Want to keep up to date or suggest modifications to this script?
 ***  then hop on over to http://twitter.com/bruk
 ************************************* */


// Outputs Missing Mounts, and if you've killed it on that character
// Example Template: https://docs.google.com/spreadsheets/d/1_biQV4au0x-gXaYd68kP3e5YqdPoW3EWy68Mxuyn1zw/edit?usp=sharing
// Recommeded formatting: Two seperate sheets, one for each function call
// Usage: =mounts(region,toonName,realmName)
// Farm: =transpose(farm(A4,B4,C4,Mounts!E$6:E,$A$1))

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ IMPORTANT!!! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//    You need to put your api key here, inside the quotes of line 25
//    Request one here: https://dev.battle.net/apps/register
//    Step by step instructions: http://bruk.org/api
//   if you have this as part of a combined spreadsheet you can comment it out instead
var apikey = "";


// Everything below this, you shouldn't have to edit
//***************************************************************
/* globals Utilities, UrlFetchApp */
/* exported mounts, farm */


function mounts(region,toonName,realmName)
{

    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }


    Utilities.sleep(Math.floor((Math.random() * 10000) + 1000)); // This is a random sleepy time so that we dont spam the api and get bonked with an error

    //Getting rid of any sort of pesky no width white spaces we may run into
    toonName = toonName.replace(/[\u200B-\u200D\uFEFF]/g, "");
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");

    region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9

    var toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=mounts&?locale=en_US&jsonp=callback&apikey="+apikey+"");

    toonJSON = toonJSON.toString().substring(9);
    toonJSON = toonJSON.substring(0, toonJSON.length - 2);

    var toon = JSON.parse(toonJSON);


    var collected = toon.mounts.numCollected;
    var notcollected = toon.mounts.numNotCollected;


    var mountArray = [ ];
    var raceLookup = [ ];

    //time to get racist

    raceLookup[11] = raceLookup[3] = raceLookup[7] = raceLookup[1] = raceLookup[4] = raceLookup[25] = raceLookup[22] = "a";
    raceLookup[10] = raceLookup[9] = raceLookup[2] = raceLookup[26] = raceLookup[6] = raceLookup[8] = raceLookup[5] = "h";
    var race = [ ];


    for (var i=0; i<collected; i++)
    {
        mountArray[i]=toon.mounts.collected[i].itemId;
        race[i] = raceLookup[toon.race];

    }


    var thumbnail = "http://"+region+".battle.net/static-render/"+region+"/"+  toon.thumbnail;

    var mountadoodledo = [ mountArray, race, thumbnail ];
    return mountadoodledo;
}


function farm(region, realmName, toonName, list)
{

    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }


    Utilities.sleep(Math.floor((Math.random() * 10000) + 1000)); // This is a random sleepy time so that we dont spam the api and get bonked with an error

    //Getting rid of any sort of pesky no width white spaces we may run into
    toonName = toonName.replace(/[\u200B-\u200D\uFEFF]/g, "");
    region = region.replace(/[\u200B-\u200D\uFEFF]/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");

    region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9

    var toonJSON = UrlFetchApp.fetch("https://"+region+".api.battle.net/wow/character/"+realmName+"/"+toonName+"?fields=feed,statistics&?locale=en_US&jsonp=callback&apikey="+apikey+"");

    toonJSON = toonJSON.toString().substring(9);
    toonJSON = toonJSON.substring(0, toonJSON.length - 2);

    var toon = JSON.parse(toonJSON);


    var size = list.length;


    // Lookup table stuff
    var mounts_lookup = {};
    //initiate
    mounts_lookup["32458"] = mounts_lookup["43952"] = mounts_lookup["43953"] = mounts_lookup["43959"] = mounts_lookup["43959"] = mounts_lookup["43959"] = mounts_lookup["43959"] = mounts_lookup["44083"] = mounts_lookup["44083"] = mounts_lookup["44083"] = mounts_lookup["44083"] = mounts_lookup["45693"] = mounts_lookup["50818"] = mounts_lookup["49636"] = mounts_lookup["63041"] = mounts_lookup["71665"] = mounts_lookup["69224"] = mounts_lookup["78919"] = mounts_lookup["77067"] = mounts_lookup["77069"] = mounts_lookup["87771"] = mounts_lookup["89783"] = mounts_lookup["95057"] = mounts_lookup["94228"] = mounts_lookup["87777"] = mounts_lookup["93666"] = mounts_lookup["95059"] = mounts_lookup["104253"] = mounts_lookup["116771"] = mounts_lookup["116660"] = mounts_lookup["123890"] = mounts_lookup["35513"] = mounts_lookup["30480"] = mounts_lookup["32768"] = mounts_lookup["44151"] = mounts_lookup["68823"] = mounts_lookup["68824"] = new Object();


    //lockout period in days
    mounts_lookup["30480"].time = mounts_lookup["32458"].time = mounts_lookup["43952"].time = mounts_lookup["43953"].time = mounts_lookup["43959"].time = mounts_lookup["43959"].time = mounts_lookup["43959"].time = mounts_lookup["43959"].time = mounts_lookup["44083"].time = mounts_lookup["44083"].time = mounts_lookup["44083"].time = mounts_lookup["44083"].time = mounts_lookup["45693"].time = mounts_lookup["50818"].time = mounts_lookup["49636"].time = mounts_lookup["63041"].time = mounts_lookup["71665"].time = mounts_lookup["69224"].time = mounts_lookup["78919"].time = mounts_lookup["77067"].time = mounts_lookup["77069"].time = mounts_lookup["87771"].time = mounts_lookup["89783"].time = mounts_lookup["95057"].time = mounts_lookup["94228"].time = mounts_lookup["87777"].time = mounts_lookup["93666"].time = mounts_lookup["95059"].time = mounts_lookup["104253"].time = mounts_lookup["116771"].time = mounts_lookup["116660"].time = mounts_lookup["123890"].time = 7;
    mounts_lookup["35513"].time = mounts_lookup["32768"].time = mounts_lookup["44151"].time = mounts_lookup["68823"].time = mounts_lookup["68824"].time = 1;


    var boss_lookup = {};


    boss_lookup["1082"] = 35513; // "Kael'thas Sunstrider Magister's Terrace Heroic"
    boss_lookup["696"] = 32458; // "Kael'thas Sunstrider Tempest Keep"
    boss_lookup["653"] = 32768; // Talon King Ikiss (incase dingdong forgot to loot anzu)


    boss_lookup["622"] = boss_lookup["623"] = 43952; //malygos, SPECIAL CASE, azure and blue drakes


    //HORDE ID FOR THIS MOUNT: 44083 SPECIAL CASE, two ids for same mount
    boss_lookup["1722"] = boss_lookup["1721"] = 43959; // "Archavon Vault of Archavon"
    boss_lookup["3136"] = boss_lookup["3137"] = 43959; // "Emalon Vault of Archavon"
    boss_lookup["3836"] = boss_lookup["3837"] = 43959; // "Koralon Vault of Archavon"
    boss_lookup["4585"] = boss_lookup["4586"] = 43959; // "Toravon Vault of Archavon"


    boss_lookup["2883"] = 45693; // "Yogg-Saron  Ulduar 25m Zero Watchers"
    boss_lookup["4576"] = 50818; // "The Lich King 25m Heroic"
    boss_lookup["4396"] = boss_lookup["4397"] = 49636; // "Onyxia  Onyxia's Layer"
    boss_lookup["5577"] = boss_lookup["5576"] = 63041; // "Al'AkirThrone of the Four Winds"
    boss_lookup["5970"] = boss_lookup["5971"] = 71665; // "Alysrazor Firelands"
    boss_lookup["5977"] = boss_lookup["5976"] = 69224; // "Ragnaros Firelands"
    boss_lookup["6161"] = boss_lookup["6162"] = 78919; // "Ultraxion  Dragon Soul"
    boss_lookup["6167"] = 77067; // "Madness of Deathwing Dragon Soul"
    boss_lookup["6168"] = 77069; // "Madness of Deathwing Dragon Soul Heroic"
    boss_lookup["6989"] = 87771; // Sha of Anger
    boss_lookup["6990"] = 89783; // Galleon
    boss_lookup["8146"] = 95057; // Nalak
    boss_lookup["8147"] = 94228; // Oondasta
    boss_lookup["6798"] = boss_lookup["6797"] = boss_lookup["7924"] = boss_lookup["7923"] = 87777; // Elegon
    boss_lookup["8149"] = boss_lookup["8150"] = boss_lookup["8151"] = boss_lookup["8152"] = 93666; // Horridon
    boss_lookup["8169"] = boss_lookup["8172"] = boss_lookup["8170"] = boss_lookup["8171"] = 95059; // Ji-Kun
    boss_lookup["8637"] = boss_lookup["8638"] = 104253; // "Garrosh Hellscream Seige of Orgrimmar Mythic"
    boss_lookup["9279"] = 116771; // Rukhmar
    boss_lookup["9365"] = 116660; // "Blackhand Blackroc Foundry Mythic"
    boss_lookup["10252"] = 123890; // "Archimonde Hellfire Citadel Mythic"


    var loot_lookup = {};
    loot_lookup["37377"] = loot_lookup["37379"] = loot_lookup["37389"] = loot_lookup["37384"] = 44151; //skadi the ruthless
    loot_lookup["32778"] = loot_lookup["32769"] = loot_lookup["32781"] = loot_lookup["32779"] = loot_lookup["32780"] = 32768; //anzu
    loot_lookup["69605"] = loot_lookup["60609"] = loot_lookup["69608"] = loot_lookup["69606"] = loot_lookup["69607"] = 68823; // mandokir
    loot_lookup["69610"] = loot_lookup["69612"] = loot_lookup["69613"] = loot_lookup["69614"] = loot_lookup["69611"] = 68824; // kilnara
    loot_lookup["28453"] = loot_lookup["28505"] = loot_lookup["28508"] = loot_lookup["28506"] = loot_lookup["28477"] = loot_lookup["28454"] = loot_lookup["28504"] = loot_lookup["28509"] = loot_lookup["28507"] = loot_lookup["28510"] = loot_lookup["28502"] = loot_lookup["28503"] = 30480; //attumen

    //obtain true size of array

    var output = [];
    var arrayPos = [];

    for (var i = 0; i < size; i++)
    {
        if (list[i] > 0)
        {
            if (list[i] == 44083)
            {
                list[i] = 43959;
            }

            mounts_lookup[list[i]].check = "1";
            arrayPos[list[i]] = i;

            output[i] = 0;
        }
        else
        {
            size = i;
            break;
        }
    }


    // check if we can even do lich king
    if (toon.statistics.subCategories[5].subCategories[2].statistics[191].quantity < 1 && toon.statistics.subCategories[5].subCategories[2].statistics[192].quantity < 1)
    {
        output[arrayPos[50818]]= "not attuned";
    }


    // lock out "Weekly checker"
    var todayStamp = new Date();
    var today = todayStamp.getDay();

    // now we have to figure out how long it's been since tuesday
    var sinceTuesday = 0;


    var midnight = new Date();
    midnight.setHours(0, 0, 0, 0);

    if (today == 2) //it IS tuesday!
        sinceTuesday = todayStamp - midnight + 32400;

    else if (today > 2) // wednesday - saturday
        sinceTuesday = (today - 1) * 86400000;

    else if (today < 2) // sunday + monday
        sinceTuesday = (today + 6) * 86400000;


    // now we have to figure out how long it's been since yesterday's reset


    var sinceYesterday = 0;


    var now = todayStamp.getHours();

    var resetTime = new Date();

    var hrm = resetTime.getDate();


    resetTime.setHours(9, 0, 0, 0);
    sinceYesterday = resetTime;

    if (now < 10  && now > -1) //if it's after midnight but before 10am

    {
        sinceYesterday.setDate(hrm - 1);
    }


    var someDate = sinceYesterday.getTime(); //not sure if this is needed to convert to epoch

    /*

       var lockout_lookup = {};
       var lockout_counters = [];


       var type = 0;
       var cheevoID = 0;*/


    for (var i = 0; i < 50; i++)
    {
        if (todayStamp - toon.feed[i].timestamp > sinceTuesday)
        {
            i = 51;
        }

        if (toon.feed[i] || i < 51)
        {
            //loot routine
            if (loot_lookup[toon.feed[i].itemId]) //we're looking for this id for some boss
            {

                if (mounts_lookup[loot_lookup[toon.feed[i].itemId]].time == 1)
                {
                    if (toon.feed[i].timestamp > sinceYesterday)
                    {
                        output[arrayPos[loot_lookup[toon.feed[i].itemId]]] = "\u2714";
                    }
                }
                else
                {
                    output[arrayPos[loot_lookup[toon.feed[i].itemId]]] = "\u2714";
                }
            }

            //boss kill routine
            if (toon.feed[i].achievement)
            {
                if (mounts_lookup[boss_lookup[toon.feed[i].achievement.id]])
                {
                    //malygos
                    if (toon.feed[i].achievement.id == 622 || toon.feed[i].achievement.id == 623)
                    {
                        output[arrayPos[43952]] = "\u2714";
                        output[arrayPos[43953]] = "\u2714";
                    }

                    //heroic madness
                    else if (toon.feed[i].achievement.id == 6168)
                    {
                        output[arrayPos[77067]] = "\u2714";
                        output[arrayPos[77069]] = "\u2714";
                    }


                    //heroic MgT or Seth halls end boss
                    else if (toon.feed[i].achievement.id == 1082 || toon.feed[i].achievement.id == 653 )
                    {

                        if (toon.feed[i].timestamp > sinceYesterday)
                        {
                            output[arrayPos[boss_lookup[toon.feed[i].achievement.id]]] = "\u2714";
                        }
                    }


                    else
                    {
                        output[arrayPos[boss_lookup[toon.feed[i].achievement.id]]] = "\u2714";
                    }


                }
            }


        }
    }

    return output;
}
