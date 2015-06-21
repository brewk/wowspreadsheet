
//  spreadsheet template for this code avalible here:
// http://drive.google.com/previewtemplate?id=1Zka57W8mNCCTakmnRnH8Bf-E52hJoxuldwaed003kxc&mode=public


/* ***********************************
 ***     Copyright (c) 2015 bruk
 *** This script is free software; you can redistribute it and/or modify
 *** it under the terms of the GNU General Public License as published by
 *** the Free Software Foundation; either version 3 of the License, or
 *** (at your option) any later version.
 ***
 ***  Want to keep up to date or suggest modifications to this script?
 ***  then hop on over to http://twitter.com/bruk
 ***  more info at: http://bruk.org/wow

 ** SHOUT OUTS / THANKS TO CONTRIBUTORS:
//  Spreadsheet layout design by /u/robinnymann


************************************** */

function items(region, toonName, realm)
{

  toonName = toonName.replace(/[\u200B-\u200D\uFEFF]/g, '');
  region = region.replace(/[\u200B-\u200D\uFEFF]/g, '');
  realm = realm.replace(/[\u200B-\u200D\uFEFF]/g, '');


    if(!toonName || toonName== 'Charactername' || !region || !realm || realm == 'Charactername')
  {
    return "\u2063";  // If there's nothing in the column, don't even bother calling the API
  }





    var toonJSON = UrlFetchApp.fetch(""+region+".battle.net/api/wow/character/"+realm+"/"+toonName+"?fields=items");
  var toon = JSON.parse(toonJSON.getContentText());



  var rows = [ ]; //gonna make a cute lil array of arrays to cut down on the calls to the api




    // doing some checking for an offhand to pervent errors
  var offHandId = "\u2063";
  var offHandName = "\u2063";
  var offHandIlvl = "\u2063";



  if( toon.items.offHand){

      offHandId =  'http://wowhead.com/item='+toon.items.offHand.id+''
      offHandName =  toon.items.offHand.name
      offHandIlvl =  toon.items.offHand.itemLevel;
    }


  var mainHandId = "\u2063";
  var mainHandName = "\u2063";
  var mainHandIlvl = "\u2063";



  if( toon.items.mainHand){

      mainHandId =  'http://wowhead.com/item='+toon.items.mainHand.id+''
      mainHandName =  toon.items.mainHand.name
      mainHandIlvl =  toon.items.mainHand.itemLevel;
    }

  var headId = "\u2063";
  var headName = "\u2063";
  var headIlvl = "\u2063";



  if( toon.items.head){

      headId =  'http://wowhead.com/item='+toon.items.head.id+''
      headName =  toon.items.head.name
      headIlvl =  toon.items.head.itemLevel;
    }

    var neckId = "\u2063";
  var neckName = "\u2063";
  var neckIlvl = "\u2063";



  if( toon.items.neck){

      neckId =  'http://wowneck.com/item='+toon.items.neck.id+''
      neckName =  toon.items.neck.name
      neckIlvl =  toon.items.neck.itemLevel;
    }

    var shoulderId = "\u2063";
  var shoulderName = "\u2063";
  var shoulderIlvl = "\u2063";



  if( toon.items.shoulder){

      shoulderId =  'http://wowshoulder.com/item='+toon.items.shoulder.id+''
      shoulderName =  toon.items.shoulder.name
      shoulderIlvl =  toon.items.shoulder.itemLevel;
    }


  var backId = "\u2063";
  var backName = "\u2063";
  var backIlvl = "\u2063";



  if( toon.items.back){

      backId =  'http://wowback.com/item='+toon.items.back.id+''
      backName =  toon.items.back.name
      backIlvl =  toon.items.back.itemLevel;
    }

  var chestId = "\u2063";
  var chestName = "\u2063";
  var chestIlvl = "\u2063";



  if( toon.items.chest){

      chestId =  'http://wowchest.com/item='+toon.items.chest.id+''
      chestName =  toon.items.chest.name
      chestIlvl =  toon.items.chest.itemLevel;
    }

   var wristId = "\u2063";
  var wristName = "\u2063";
  var wristIlvl = "\u2063";



  if( toon.items.wrist){

      wristId =  'http://wowwrist.com/item='+toon.items.wrist.id+''
      wristName =  toon.items.wrist.name
      wristIlvl =  toon.items.wrist.itemLevel;
    }

    var handsId = "\u2063";
  var handsName = "\u2063";
  var handsIlvl = "\u2063";



  if( toon.items.hands){

      handsId =  'http://wowhands.com/item='+toon.items.hands.id+''
      handsName =  toon.items.hands.name
      handsIlvl =  toon.items.hands.itemLevel;
    }


    var waistId = "\u2063";
  var waistName = "\u2063";
  var waistIlvl = "\u2063";



  if( toon.items.waist){

      waistId =  'http://wowwaist.com/item='+toon.items.waist.id+''
      waistName =  toon.items.waist.name
      waistIlvl =  toon.items.waist.itemLevel;
    }

    var legsId = "\u2063";
  var legsName = "\u2063";
  var legsIlvl = "\u2063";



  if( toon.items.legs){

      legsId =  'http://wowlegs.com/item='+toon.items.legs.id+''
      legsName =  toon.items.legs.name
      legsIlvl =  toon.items.legs.itemLevel;
    }

    var feetId = "\u2063";
  var feetName = "\u2063";
  var feetIlvl = "\u2063";



  if( toon.items.feet){

      feetId =  'http://wowfeet.com/item='+toon.items.feet.id+''
      feetName =  toon.items.feet.name
      feetIlvl =  toon.items.feet.itemLevel;
    }


    var finger1Id = "\u2063";
  var finger1Name = "\u2063";
  var finger1Ilvl = "\u2063";



  if( toon.items.finger1){

      finger1Id =  'http://wowfinger1.com/item='+toon.items.finger1.id+''
      finger1Name =  toon.items.finger1.name
      finger1Ilvl =  toon.items.finger1.itemLevel;
    }


    var finger2Id = "\u2063";
  var finger2Name = "\u2063";
  var finger2Ilvl = "\u2063";



  if( toon.items.finger2){

      finger2Id =  'http://wowfinger2.com/item='+toon.items.finger2.id+''
      finger2Name =  toon.items.finger2.name
      finger2Ilvl =  toon.items.finger2.itemLevel;
    }

    var trinket1Id = "\u2063";
  var trinket1Name = "\u2063";
  var trinket1Ilvl = "\u2063";



  if( toon.items.trinket1){

      trinket1Id =  'http://wowtrinket1.com/item='+toon.items.trinket1.id+''
      trinket1Name =  toon.items.trinket1.name
      trinket1Ilvl =  toon.items.trinket1.itemLevel;
    }

    var trinket2Id = "\u2063";
  var trinket2Name = "\u2063";
  var trinket2Ilvl = "\u2063";



  if( toon.items.trinket2){

      trinket2Id =  'http://wowtrinket2.com/item='+toon.items.trinket2.id+''
      trinket2Name =  toon.items.trinket2.name
      trinket2Ilvl =  toon.items.trinket2.itemLevel;
    }




     var column0 = new Array(

     mainHandIlvl,
     offHandIlvl,
     headIlvl,
     neckIlvl,
     shoulderIlvl,
     backIlvl,
     chestIlvl,
     wristIlvl,
     handsIlvl,
     waistIlvl,
     legsIlvl,
     feetIlvl,
     finger1Ilvl,
     finger2Ilvl,
     trinket1Ilvl,
     trinket2Ilvl,
     toon.items.averageItemLevel



  )
  rows.push(column0);


     var column1 = new Array(
     mainHandId,
     offHandId,
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
     trinket2Id



  )

  rows.push(column1);


   var column2 = new Array(

     mainHandName,
     offHandName,
     headName,
     neckName,
     shoulderName,
     backName,
     chestName,
     wristName,
     handsName,
     waistName,
     legsName,
     feetName,
     finger1Name,
     finger2Name,
     trinket1Name,
     trinket2Name


     )
    rows.push(column2);

 return rows;


}
