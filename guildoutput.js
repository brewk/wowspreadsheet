// google doc spreadsheet template availible here: http://drive.google.com/previewtemplate?id=1xqMVdgLLZdpRVRz1PiN7Mz_4ghHt0MxIYcBfXYS1phw&mode=public
// really want this to be a standalone page but this was easiest for now


function guild(region,realmName,guildName) {

  if(!guildName || !realmName )
  {
    return "\u2063";  // If there's nothing don't even bother calling the API
  }

//Getting rid of any sort of pesky no width white spaces we may run into
  toonName = guildName.replace(/[\u200B-\u200D\uFEFF]/g, '');
  region = region.replace(/[\u200B-\u200D\uFEFF]/g, '');
  realmName = realmName.replace(/[\u200B-\u200D\uFEFF]/g, '');



  var guildJSON = UrlFetchApp.fetch(""+region+".battle.net/api/wow/guild/"+realmName+"/"+guildName+"?fields=members");

  var guild = JSON.parse(guildJSON);


    var memberTotal = guild.members.length;

  var membermatrix = [ ];


  for(i=0; i<10; i++)
  {
          membermatrix[i] = [];
  }

  for(i=0; i<guild.members.length; i++)
  {


    rank=guild.members[i].rank;



      membermatrix[rank].push(guild.members[i].character.name);
  }


  return membermatrix;

}
