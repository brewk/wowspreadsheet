
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


// **** Outputs Detailed Pet information
// *** Example template: https://docs.google.com/spreadsheets/d/1yf3s3yLpHbdomLuKELr79w-azTLVnBwGJ1Uhegs1M1o/edit?usp=sharing
// **** usage: =transpose(pets(region,toonName,realmName))
// **** Coulumn Outputs:
// * Collected, Fav Need Upgrade, Num Favs to Level, Fav Lvls Needed, Total WildPets
// * Missing Rares (nonwild)
// * Missing Rare (Wild Caught)
// * Missing Max Level (nonwild)
// * Missing Max Level (wild caught)
// * Missing Pets
// * Missing Pet Source


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ IMPORTANT!!! ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//    You need to put your Client ID and client Secret below, inside the quotes
//    Sign up and obtain them here: https://develop.battle.net/
//   Step by step instructions: http://bruk.org/api

var clientID = "";

var clientSecret = "";


// Everything below this, you shouldn't have to edit
//***************************************************************
/* globals Utilities, UrlFetchApp, PropertiesService */
/* exported pets */


function pets(region,toonName,realmName)
{
    if (!toonName || !realmName)
    {
        return " ";  // If there's nothing in the column, don't even bother calling the API
    }

    var scriptProperties = PropertiesService.getScriptProperties();
    var token = scriptProperties.getProperty("STORED_TOKEN");

    //Getting rid of any sort of pesky no width white spaces we may run into
    toonName = toonName.replace(/\s/g, "");
    region = region.replace(/\s/g, "");
    realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, "");

    region = region.toLowerCase(); // if we don't do this, it screws up the avatar display 9_9

    var options={ muteHttpExceptions:true };
    var toon = "";

    var  toonJSON = UrlFetchApp.fetch("https://"+region+".api.blizzard.com/wow/character/"+realmName+"/"+toonName+"?fields=pets&?locale=en_US&access_token="+token+"", options);

    if (!token || toonJSON.toString().length === 0)
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
        toonJSON = UrlFetchApp.fetch("https://"+region+".api.blizzard.com/wow/character/"+realmName+"/"+toonName+"?fields=pets&?locale=en_US&access_token="+token+"", options);
        
        if (!token)
        {
            return "Error getting an API token. Please visit https://develop.battle.net/ and sign up for an account";
        }
    }

    toon = JSON.parse(toonJSON.toString());


    //Init all the curds!


    var needUpgrade = 0;
    var needLevel = 0;
    var levels = 0;
    var battlePet = 0;
    var petBattleArray = [ ];
    var i =0;

    var stuff =toon.pets.numCollected;


    //Lets go through that json array
    for (i=0; i<stuff; i++)
    {

        //first we'll sort out some favorite stuff, may not be handy for some people, but favorites are one of my favorite things
        //for keeping my pets sorted
        if (toon.pets.collected[i].isFavorite === true)
        {
            if (toon.pets.collected[i].qualityId != 3)
            {
                needUpgrade++;
            }
            if (toon.pets.collected[i].stats.level != 25)
            {
                needLevel++;
                levels = levels + (25 - toon.pets.collected[i].stats.level);
            }

        }


        //Because there can be duplicates, check if the pet already exists in our table
        //if it doesn't exist, then it must be the best version we've found so far, so initilize quality and levels
        if (!petBattleArray[toon.pets.collected[i].creatureId])
        {
            petBattleArray[toon.pets.collected[i].creatureId] = {};
            petBattleArray[toon.pets.collected[i].creatureId].quality = toon.pets.collected[i].qualityId;
            petBattleArray[toon.pets.collected[i].creatureId].name = toon.pets.collected[i].creatureName;
            petBattleArray[toon.pets.collected[i].creatureId].level = toon.pets.collected[i].stats.level;


            //check if it's a wild caught battle pet
            if (toon.pets.collected[i].itemId> 1)
            {
                petBattleArray[toon.pets.collected[i].creatureId].wild = "0";
            }
            else
            {
                petBattleArray[toon.pets.collected[i].creatureId].wild = "1";
            }


        }

        //so we DO have this pet already.. well we better see if it's the best quality or best leveled one
        else
        {
            if (petBattleArray[toon.pets.collected[i].creatureId].quality < toon.pets.collected[i].petQualityId )
            {
                petBattleArray[toon.pets.collected[i].creatureId].quality = toon.pets.collected[i].petQualityId;
            }

            if (petBattleArray[toon.pets.collected[i].creatureId].level < toon.pets.collected[i].creatureId.level)
            {
                petBattleArray[toon.pets.collected[i].creatureId].level = toon.pets.collected[i].level;
            }

        }


        //check if it's a wild pet, and if so increase the number of wild caught pets in or "favorite's table"
        if (toon.pets.collected[i].spellId == "0")
        {
            battlePet++;
        }
    }


    //really got lazy here with the array and counter names here


    //the lengh of this array can be fricken massive since it's based on the pets' ids (80k+)
    var arrayCounter = petBattleArray.length;


    var smallArrayAll = [ ]; // this is for finding what we're missing, it gets outputted into a secret hidden array
    var ticktock5 = 0;

    var smallArrayQ = [ ];   //quality
    var ticktock3 = 0;

    var smallArrayL = [ ];   // level
    var ticktock4 = 0;

    var smallArrayQW = [ ]; //quality wilds
    var ticktock = 0;

    var smallArrayLW = [ ]; //level wilds
    var ticktock2 = 0;


    //this will be used to store our string that represents the quality of the pet in the output
    var quality = 0;


    // FEL-PUP FIXER UP

    if (petBattleArray[91823])
    {
        petBattleArray[91823].wild = "0";
    }


    for (i=0; i<arrayCounter; i++)
    {

        if (petBattleArray[i])
        {
            smallArrayAll[ticktock5] = i;
            ticktock5++;

            if (petBattleArray[i].quality === 0)
            {
                quality = "(p) ";
            }
            else if (petBattleArray[i].quality == 1)
            {
                quality = "(c) ";
            }

            else if (petBattleArray[i].quality == 2)
            {
                quality = "(u) ";
            }


            if (petBattleArray[i].quality<3)
            {
                if (petBattleArray[i].wild>0)
                {


                    smallArrayQW[ticktock]= quality + petBattleArray[i].name;
                    ticktock++;
                }
                else
                {
                    smallArrayQ[ticktock3]=  quality + petBattleArray[i].name;
                    ticktock3++;
                }
            }


            if (petBattleArray[i].level<25)
            {


                if (petBattleArray[i].wild>0)
                {
                    smallArrayLW[ticktock2]= "(" + petBattleArray[i].level + ") " + petBattleArray[i].name;
                    ticktock2++;
                }
                else
                {
                    smallArrayL[ticktock4]= "(" + petBattleArray[i].level + ") " +  petBattleArray[i].name;
                    ticktock4++;
                }
            }

        }
    }

    var thumbnail = "http://render-"+region+".worldofwarcraft.com/character/" +  toon.thumbnail;


    var numbersArray = [ toon.pets.numCollected, needUpgrade, needLevel, levels, battlePet ];
    var wordsArray = [ "Collected", "Fav Need Upgrade", "Num Favs to Level", "Fav Lvls Needed", "Total WildPets" ];

    var petInfo = [
        wordsArray,
        numbersArray,
        smallArrayQ,
        smallArrayQW,
        smallArrayL,
        smallArrayLW,
        smallArrayAll,
        thumbnail
    ];

    return  petInfo;
    //   return;
}
