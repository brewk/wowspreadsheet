/**
 * @OnlyCurrentDoc
 */

/* globals appUtils, appSettings, appWowGuildRoster, appWowSl, appBlizzData */

/**
 * function to build global environment
 */
function buildEnv() {
    // build environment
    try {
      this.Settings = appSettings({
        blizzClientId: '',
        blizzClientSecret: '',
        useRaiderIoData: false,
        epicGemIlvl: 120,
        auditIlvl: 100,
        markLegendary: true,
      });
      this.Utils = appUtils({
        settings: this.Settings,
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
      this.WowSl = appWowSl({
        settings: this.Settings,
        utils: this.Utils,
        blizzData: this.BlizzData,
      });
    } catch (error) {
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
      Logger.log(objDotFunc, args);
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
      { name: 'Refresh Gear', functionName: 'refreshGear' },
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
    SpreadsheetApp.getActiveSpreadsheet().getRange(cell).setValue(new Date().toTimeString());
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
    refreshCell('AI4');
  }
  
  /**
   * function used by custom menu to force a refresh
   */
  function refreshProg() {
    refreshCell('AY4');
  }
  
  /**
   * function used by custom menu to force a refresh
   */
  function refreshProf() {
    refreshCell('CQ4');
  }
  
  /**
   * function used by custom menu to force a refresh
   */
  function refreshRep() {
    refreshCell('CS4');
  }
  
  /**
   * function used to debug stuff
   */
  function debug() {
    buildEnv();
    this.BlizzData.getCharData('eu', 'eredar', 'dakof', 'charProfile');
  }
  