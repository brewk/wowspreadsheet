/**
 * @OnlyCurrentDoc
 */

/* globals appSettings, appBlizzData */

/**
 * The appWowGuildRoster object
 * @param {Object} par The main parameter object.
 * @return {Object} The WowGuildRoster Object.
 */
// eslint-disable-next-line no-unused-vars
function appWowGuildRoster(par) {
  const objectName = 'appWowGuildRoster';
  const currentVersionGuild = 2.1;
  const mySettings = par.settings || appSettings();
  const myBlizzData = par.blizzData || appBlizzData();

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

    const guildRosterSettings = mySettings.getGuildRosterSettingsFromSheet();
    // parse guild member list and prepare output
    const membermatrix = [];

    for (let i = 0; i < guild.members.length; i++) {
      const member = guild.members[i];
      let whiteListed = false;
      let blackListed = false;

      // check for rank black-/whitelisting
      if (guildRosterSettings.rankBlacklist.indexOf(member.rank) > -1) {
        blackListed = true;
      } else if (guildRosterSettings.rankWhitelist.indexOf(member.rank) > -1 && member.character.level >= minLevel) {
        whiteListed = true;
      }

      // whitelist/blacklist of individual names will override the rank Black/whitelisting
      if (guildRosterSettings.memberBlacklist.indexOf(member.character.name.toLowerCase()) > -1) {
        blackListed = true;
      } else if (guildRosterSettings.memberWhitelist.indexOf(member.character.name.toLowerCase()) > -1) {
        whiteListed = true;
      }

      // add member if all criterias are passed
      if (
        ((member.rank <= maxRank && member.character.level >= minLevel) || whiteListed) &&
        !blackListed
      ) {
        membermatrix.push([
          member.character.realm.slug,
          member.character.name,
          member.rank,
        ]);
      }
    }

    // return member list together with non-guild members from settings page
    return [...membermatrix, ...guildRosterSettings.nonGuildMembers];
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
