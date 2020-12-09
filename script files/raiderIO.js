/**
 * @OnlyCurrentDoc
 */

/* globals appSettings, appUtils */

/**
 * The appWowRaiderIO object
 * @param {Object} par The main parameter object.
 * @return {Object} The WowRaiderIO Object.
 */
// eslint-disable-next-line no-unused-vars
function appWowRaiderIO(par) {
  const objectName = 'appWowRaiderIO';
  const currentVersionRaiderIO = 1.0;
  const mySettings = par.settings || appSettings();
  const myUtils = par.utils || appUtils();
  const useRaiderIo = mySettings.getAppSetting('UseRaiderIoData') || false;
  const strRaiderIoNotEnabledError = 'RaiderIO data not enabled in settings';
  const strApiError = 'Error: invalid data received from API';

  /**
   * function to get current m+ affix for specifig region
   * @param {string} region region of where to get affixes for
   * @return {string} comma delimited string containing all current affixes
   */
  function getAffixes(region) {
    if (!useRaiderIo) {
      return strRaiderIoNotEnabledError;
    }

    let affixes = '';

    const fetchUrl = `https://raider.io/api/v1/mythic-plus/affixes?region=${region}&locale=en`;

    let data;
    try {
      data = myUtils.jsonFetch(fetchUrl);
    } catch (e) {
      return `Error getting RaiderIO data (${e.message})`;
    }
    if (data && data.title) {
      affixes = data.title;
    } else {
      return strApiError;
    }

    return affixes;
  }

  /**
   * helper function to parse raiderIO API data for runs
   * @param {any} data JSON object raiderIO API data containing run infos
   * @return {any} output object containing all relevant run infos
   */
  function parseRunData(data) {
    // default value
    const runInfo = {
      mythicLevel: 0,
      dungeon: '-',
      affixes: ['-', '-', '-', '-'],
      numKeystoneUpgrades: 0,
      score: 0,
    };

    if (data && data[0]) {
      const run = data[0];
      runInfo.mythicLevel = run.mythic_level;
      runInfo.dungeon = run.dungeon;
      runInfo.numKeystoneUpgrades = run.num_keystone_upgrades;
      runInfo.score = run.score;

      for (let i = 0; i < run.affixes.length; i++) {
        var affix = run.affixes[i].name;
        runInfo.affixes[i] = affix.substring(0, 3).toUpperCase();
      }
    }

    return runInfo;
  }

  /**
   * function to get all m+ raiderIO data for a toon
   * @param {string} region region of target toon
   * @param {string} realmName realm of target toon
   * @param {string} toonName name of target toon
   * @return {array} toon raiderIO data
   */
  function getFullData(region, realmName, toonName) {
    if (!useRaiderIo) {
      return strRaiderIoNotEnabledError;
    }

    if (!toonName || !realmName) {
      return ' '; // If there's nothing in the column, don't even bother calling the API
    }

    toonName = myUtils.titleCase(toonName);
    const fetchUrl = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realmName}&name=${toonName}&fields=mythic_plus_scores%2Cmythic_plus_recent_runs%2Cmythic_plus_best_runs%2Cmythic_plus_highest_level_runs%2Cmythic_plus_weekly_highest_level_runs`;

    let data;
    try {
      data = myUtils.jsonFetch(fetchUrl);
    } catch (e) {
      return myUtils.initializedArray(31, `Error getting RaiderIO data (${e.message})`);
    }
    if (!data || !data.profile_url) {
      return myUtils.initializedArray(31, strApiError);
    }

    const profile = data.profile_url;
    const thumbnail = data.thumbnail_url;
    const scoreAll = data.mythic_plus_scores.all;

    // parsing data for runs
    const weeklyHighest = parseRunData(data.mythic_plus_weekly_highest_level_runs);
    const recentRun = parseRunData(data.mythic_plus_recent_runs);
    const highestRun = parseRunData(data.mythic_plus_highest_level_runs);
    const bestRun = parseRunData(data.mythic_plus_best_runs);

    const toonInfo = [
      thumbnail,
      profile,
      scoreAll,

      weeklyHighest.mythicLevel,
      weeklyHighest.dungeon,
      weeklyHighest.score,
      weeklyHighest.numKeystoneUpgrades,
      recentRun.mythicLevel,
      recentRun.dungeon,
      ...recentRun.affixes,
      recentRun.score,
      recentRun.numKeystoneUpgrades,
      highestRun.mythicLevel,
      highestRun.dungeon,
      ...highestRun.affixes,
      highestRun.score,
      highestRun.numKeystoneUpgrades,
      bestRun.mythicLevel,
      bestRun.dungeon,
      ...bestRun.affixes,
      bestRun.score,
      bestRun.numKeystoneUpgrades,
    ];

    return toonInfo;
  }

  /**
   * function to get the version of the guild module
   * @return {number} version of guild module
   */
  function verCheckRaiderIO() {
    return currentVersionRaiderIO;
  }

  return Object.freeze({
    objectName,
    getAffixes,
    getFullData,
    verCheckRaiderIO,
  });
}
