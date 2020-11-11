/**
 * @OnlyCurrentDoc
 */

/* globals appSettings, appUtils, appBlizzData */

/**
 * The appWowGuildRoster object
 * @param {Object} par The main parameter object.
 * @return {Object} The WowGuildRoster Object.
 */
function appWowGuildRoster(par) {
  const objectName = 'appWowGuildRoster';
  const currentVersionGuild = 2.1;
  const mySettings = par.settings || appSettings();
  const myUtils = par.utils || appUtils();
  const myBlizzData = par.blizzData || appBlizzData();
  const blacklist = par.blacklist || [];
  const whitelist = par.whitelist || [];
  const nonGuild = par.nonGuild || [];
  const rankBlacklist = par.rankBlacklist || [];
  const rankWhitelist = par.rankWhitelist || [];

  /**
   * function to fetch guild members and create a list based on provided filters (including global white-/blacklist)
   * @param {string} region guild region
   * @param {string} realmName guild realm
   * @param {string} guildName guild name
   * @param {number} maxRank maximum rank to include in output list
   * @param {number} minLevel minimum level to include in output list
   * @return {array} list of guild members filtered by input criterias (including global white-/blacklist)
   */
  function guildOut(region, realmName, guildName, maxRank, minLevel) {
    if (!guildName || !realmName) {
      return '\u2063'; // If there's nothing don't even bother calling the API
    }
    if (maxRank < 0 || maxRank > 10) {
      return 'Error: check max rank settings';
    }

    // get entire guild member list
    let guild;
    try {
      guild = myBlizzData.getGuildRoster(region, realmName, guildName);
    } catch (e) {
      return e.message;
    }
    if (!guild.members) {
      if (guild.code && guild.detail) {
        return `Blizz message: ${guild.detail} (${guild.code})`;
      }
      return 'Error: invalid data received from API';
    }

    // lowercase everything
    blacklist.map((el) => el.toLowerCase());
    whitelist.map((el) => el.toLowerCase());

    // parse guild member list and prepare output
    const membermatrix = [];
    let arrayPosition = 0;

    for (let i = 0; i < guild.members.length; i++) {
      let whiteListed = false;
      let blackListed = false;

      // check for rank black-/whitelisting
      if (rankBlacklist.indexOf(guild.members[i].rank) > -1) {
        blackListed = true;
      } else if (rankWhitelist.indexOf(guild.members[i].rank) > -1 && guild.members[i].character.level >= minLevel) {
        whiteListed = true;
      }

      // whitelist/blacklist of individual names will override the rank Black/whitelisting
      if (blacklist.indexOf(guild.members[i].character.name.toLowerCase()) > -1) {
        blackListed = true;
      } else if (whitelist.indexOf(guild.members[i].character.name.toLowerCase()) > -1) {
        whiteListed = true;
      }

      // add member if all criterias are passed
      if (
        ((guild.members[i].rank <= maxRank && guild.members[i].character.level >= minLevel) || whiteListed) &&
        !blackListed
      ) {
        membermatrix[arrayPosition] = [
          guild.members[i].character.realm.slug,
          guild.members[i].character.name,
          guild.members[i].rank,
        ];
        arrayPosition += 1;
      }
    }

    // add manual non-guild entries to the roster
    for (let i = 0; i < nonGuild.length; i++) {
      membermatrix[arrayPosition] = [nonGuild[i][0], nonGuild[i][1], 99];
      arrayPosition += 1;
    }

    return membermatrix;
  }

  /**
   * function to get the version of the guild module
   * @return {number} version of guild module
   */
  function verCheckGuild() {
    return currentVersionGuild;
  }

  return Object.freeze({
    objectName,
    guildOut,
    verCheckGuild,
  });
}
