/* eslint-disable no-unused-vars */
/**
 * @OnlyCurrentDoc
 */

/* globals appUtils, appSettings, appWowRaiderIO, appWowGuildRoster, appWowSl, appBlizzData, appWowWarcraftLogs */

/**
 * function to build global environment
 */
function buildEnv() {
  // build environment
  try {
    this.Utils = appUtils({});
    this.Settings = appSettings({ utils: this.Utils });
    this.RaiderIO = appWowRaiderIO({
      settings: this.Settings,
      utils: this.Utils,
    });
    this.BlizzData = appBlizzData({
      settings: this.Settings,
      utils: this.Utils,
    });
    this.WowGuildRoster = appWowGuildRoster({
      settings: this.Settings,
      utils: this.Utils,
      blizzData: this.BlizzData,
      blacklist: [],
      whitelist: [],
      nonGuild: [],
      rankBlacklist: [],
      rankWhitelist: [],
    });
    this.WowChar = appWowSl({
      settings: this.Settings,
      utils: this.Utils,
      blizzData: this.BlizzData,
      raiderIO: this.RaiderIO,
    });
    this.WowWcl = appWowWarcraftLogs({
      settings: this.Settings,
      utils: this.Utils,
    });
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}

/**
 * wrapper function to call object functions from within sheet cells
 * @param {string} objDotFunc The function name including object/namespace ('Object.Function')
 * @param {array} args The function arguments, variable length
 * @return Function result, variable type.
 */
function appCall(objDotFunc, ...args) {
  if (buildEnv()) {
    console.info(objDotFunc, args);
    const arr = objDotFunc.split('.'); // a string to array with "." as separator
    const obj = arr[0]; // getting object name
    const func = arr[1]; // getting function name
    return this[obj][func].apply(this, args);
  }
  return 'Error building environment';
}

/**
 * onOpen simple trigger
 */
function onOpen() {
  // create menu
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const entries = [
    { name: 'Refresh All', functionName: 'refreshAll' },
    { name: 'Refresh Profile', functionName: 'refreshProfile' },
    { name: 'Refresh Gear', functionName: 'refreshGear' },
    //{ name: 'Refresh Soulbind', functionName: 'refreshSoulbind' },
    { name: 'Refresh Progression', functionName: 'refreshProg' },
    { name: 'Refresh Professions', functionName: 'refreshProf' },
    { name: 'Refresh Reputation', functionName: 'refreshRep' },
  ];
  sheet.addMenu('\u21BB  Refresh all Characters', entries);
}

/**
 * helper function that writes the current time in the provided cell
 * @param {string} cell the cell to update in A1 notation
 */
function refreshCell(cell) {
  let range = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Master Sheet').getRange(cell);
  if (!range.isPartOfMerge()) {
    range.setValue(new Date().toTimeString());
  } else {
    const mergedRanges = range.getMergedRanges();
    mergedRanges.forEach((mergedCell) => {
      mergedCell.setValue(new Date().toTimeString());
    });
  }
  
}

/**
 * function used by custom menu to force a refresh
 */
function refreshAll() {
  refreshCell('A1');
}

/**
 * function used by custom menu to force a refresh
 */
function refreshGear() {
  refreshCell('AH3');
}

/**
 * function used by custom menu to force a refresh
 */
/** function refreshSoulbind() {
  refreshCell('AQ3');
} */

/**
 * function used by custom menu to force a refresh
 */
function refreshProg() {
  refreshCell('BX3');
}

/**
 * function used by custom menu to force a refresh
 */
function refreshProf() {
  refreshCell('CL3');
}

/**
 * function used by custom menu to force a refresh
 */
function refreshRep() {
  refreshCell('CO3');
}

/**
 * function used by custom menu to force a refresh
 */
function refreshProfile() {
  refreshCell('AG3');
}


/**
 * function to create compressed string of data
 * @param {array} data data to compress
 * @returns {string} compressed data
 */
function compress(data) {
  const myUtils = appUtils({});
  return myUtils.zippedStringArray(JSON.stringify(data));
}