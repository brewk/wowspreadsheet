/**
 * @OnlyCurrentDoc
 */

/* globals appUtils */

/**
 * The appSettings Object
 * @param {Object} par The main parameter object.
 * @return {Object} The Settings Object.
 */
function appSettings(par = {}) {
  const objectName = 'appSettings';
  const strAppSettings = 'AppSettings';
  const strStoredToken = 'BlizzAccessToken';
  const strWarcraftLogsKey = 'WarcraftLogsKey';
  const myUtils = par.utils || appUtils();
  const cache = CacheService.getScriptCache();

  /**
   * function to retreive a current app settings value
   * @param {string} varName the name of the app setting value to retreive
   * @return {any} the requested app setting value
   */
  function getAppSetting(varName) {
    const value = cache.get(varName);
    if (value) {
      return value;
    }

    let appSettingsJson = getAppSettingsJson();
    const appSettings = JSON.parse(appSettingsJson);
    if (Object.keys(appSettings).indexOf(varName) < 0) {
      const appSettingsLookup = myUtils.getLookupData('appSettingsLookup');
      const newSetting = appSettingsLookup.find((el) => el.varName === varName);
      if (!newSetting) {
        throw new Error(`App setting ${varName} not found!`);
      }
      appSettings[varName] = newSetting.default;
      appSettingsJson = JSON.stringify(appSettings);
      PropertiesService.getScriptProperties().setProperty(strAppSettings, appSettingsJson);
      cache.put(strAppSettings, appSettingsJson);
    }
    cache.put(varName, appSettings[varName]);
    return appSettings[varName];
  }

  /**
   * helper function to handle stored app settings (JSON string in script properties)
   * @return {string} JSON string representation of app settings
   */
  function getAppSettingsJson() {
    // try to get cache value and return if it already exists
    let appSettingsJson = cache.get(strAppSettings);
    if (appSettingsJson) {
      return appSettingsJson;
    }

    // try to get properties value and return it if it exists (also put it in cache)
    appSettingsJson = PropertiesService.getScriptProperties().getProperty(strAppSettings);
    if (appSettingsJson) {
      cache.put(strAppSettings, appSettingsJson);
      return appSettingsJson;
    }

    // no existing settings found, build them from scratch using remote lookup settings infos (store it in properties and cache)
    const appSettings = {};
    const appSettingsLookup = myUtils.getLookupData('appSettingsLookup');
    appSettingsLookup.forEach((el) => (appSettings[el.varName] = el.default));
    appSettingsJson = JSON.stringify(appSettings);
    PropertiesService.getScriptProperties().setProperty(strAppSettings, appSettingsJson);
    cache.put(strAppSettings, appSettingsJson);
    return appSettingsJson;
  }

  /**
   * function to retrieve current app settings to show on settings sheet
   * @return {array} settings output array to show on settings sheet
   */
  function getAppSettingsForSheet() {
    // get settings infos from remote lookup sheet and sort by id
    const appSettingsLookup = myUtils.getLookupData('appSettingsLookup');
    appSettingsLookup.sort((a, b) => a.id - b.id);
    // header row to show
    const output = [['ID', 'Name', 'Description', 'CurrentValue']];

    // loop over settings infos
    for (let i = 0; i < appSettingsLookup.length; i++) {
      const setting = appSettingsLookup[i];
      // get setting that is currently in use
      const currentValue = getAppSetting(setting.varName);

      // hide sensitive settings if they are not the default value
      if (setting.isSensitive && setting.default != currentValue) {
        setting.default = 'HIDDEN';
      } else {
        // use current value
        setting.default = currentValue;
      }

      // add row to output
      output.push([setting.id, setting.name, setting.description, setting.default]);
    }

    return output;
  }

  /**
   * function to retrieve app settings from settings page
   * @return {string} output message indicating the status of the action
   */
  function saveAppSettingsFromSheet() {
    // read all values from data region around named range (starting point in settings sheet)
    const appSettingsData = SpreadsheetApp.getActiveSpreadsheet()
      .getRangeByName('appSettings')
      .getDataRegion()
      .getValues();

    // strip header and generate index from it
    const header = appSettingsData.shift(); //remove header
    const index = {};
    header.forEach((el, i) => (index[el] = i));
    // get settings infos from remote lookup sheet
    const appSettingsLookup = myUtils.getLookupData('appSettingsLookup');

    // check if number of settings on sheet and on remote lookup sheet match, otherwhise ask for refresh first
    if (appSettingsData.length !== appSettingsLookup.length) {
      return 'Settings mismatch, please refresh sheet and try again';
    }

    // prepare output and create helper variables
    const appSettings = {};
    const validBoolTrues = ['true', 'on', '1'];
    const validBoolFalses = ['false', 'off', '0'];
    const validationErrors = [];
    const changedSettings = [];

    // loop over all settings data from sheet
    for (let i = 0; i < appSettingsData.length; i++) {
      const setting = appSettingsData[i];
      // check if this setting also exists on remote sheet, otherwhise ask for refresh first
      const lookup = appSettingsLookup.find((el) => el.id === parseInt(setting[0]));
      if (!lookup) {
        return 'Settings mismatch, please refresh sheet and try again';
      }

      // read new value and check if it is not empty
      let newValue = setting[index.NewValue];
      if (!newValue || newValue.toString().length === 0) {
        // setting is empty, so instead the existing value will be used
        newValue = getAppSetting(lookup.varName);
      } else {
        // new value detected, mark as changed
        changedSettings.push(lookup.varName);
      }

      // input validation
      switch (lookup.type) {
        case 'bool':
          if (typeof newValue === 'boolean') {
            appSettings[lookup.varName] = newValue;
          } else {
            if (validBoolTrues.indexOf(newValue.toLowerCase()) >= 0) {
              appSettings[lookup.varName] = true;
            } else if (validBoolFalses.indexOf(newValue.toLowerCase()) >= 0) {
              appSettings[lookup.varName] = false;
            } else {
              validationErrors.push(`Invalid bool value for ${lookup.name}`);
              continue;
            }
          }
          break;
        case 'number':
          const value = parseFloat(newValue);
          if (isNaN(value)) {
            validationErrors.push(`Expected a number value for ${lookup.name}`);
            continue;
          }
          appSettings[lookup.varName] = value;
          break;

        default:
          appSettings[lookup.varName] = newValue.trim();
          break;
      }
    }

    // has anything changed at all?
    if (changedSettings.length === 0) {
      return '<- change this cell after providing new values';
    }

    // all validation checks passed?
    if (validationErrors.length > 0) {
      return `Could not store settings because of error(s): ${validationErrors.join(' | ')}`;
    }

    // everything ok, save new values and provide feedback
    const appSettingsJson = JSON.stringify(appSettings);
    PropertiesService.getScriptProperties().setProperty(strAppSettings, appSettingsJson);
    changedSettings.forEach((el) => cache.remove(el));
    cache.put(strAppSettings, appSettingsJson);
    return 'SAVED! Please delete all new values!';
  }

  /**
   * function to retrieve guild roster settings from settings page
   * @return {object} settings object containing all guild roster settings
   */
  function getGuildRosterSettingsFromSheet() {
    // read values from named range (settings sheet)
    const sheetData = SpreadsheetApp.getActiveSpreadsheet().getRangeByName('guildRosterSettings').getValues();

    // prepare output structure
    const settings = {};
    settings.rankBlacklist = [];
    settings.rankWhitelist = [];
    settings.memberBlacklist = [];
    settings.memberWhitelist = [];
    settings.nonGuildMembers = [];

    // loop over settings rows
    for (let i = 0; i < sheetData.length; i++) {
      const row = sheetData[i];

      // check for empty row and stop processing if no more values are detected
      const nonEmptyIndex = row.findIndex((el) => el !== null && el.toString().length > 0);
      if (nonEmptyIndex == -1) {
        // row with all empty values, stopping...
        break;
      }

      // parse all found settings

      const rankBlacklist = parseInt(row[0]);
      if (!isNaN(rankBlacklist)) {
        settings.rankBlacklist.push(rankBlacklist);
      }

      const rankWhitelist = parseInt(row[1]);
      if (!isNaN(rankWhitelist)) {
        settings.rankWhitelist.push(rankWhitelist);
      }

      if (row[2] !== null && row[2].toString().length > 0) {
        settings.memberBlacklist.push(row[2].toLowerCase());
      }

      if (row[3] !== null && row[3].toString().length > 0) {
        settings.memberWhitelist.push(row[3].toLowerCase());
      }

      if (row[4] !== null && row[4].toString().length > 0 && row[5] !== null && row[5].toString().length > 0) {
        settings.nonGuildMembers.push([row[4].toLowerCase(), row[5].toLowerCase(), 99]);
      }
    }

    return settings;
  }

  /**
   * function to retrieve or refresh Blizz access token
   * @param {string} region the region used for Blizz API calls (us/eu)
   * @return {string} Blizz access token
   */
  function getBlizzAccessToken(region) {
    // first try to get token from cache or script properties
    let tokenString = cache.get(strStoredToken);
    if (!tokenString) {
      tokenString = PropertiesService.getScriptProperties().getProperty(strStoredToken);
      if (tokenString) {
        cache.put(strStoredToken, tokenString);
      }
    }
    // check validity
    if (tokenString) {
      const tokenData = JSON.parse(tokenString);
      const validMinutes = (new Date(tokenData.expiry) - new Date()) / (60 * 1000);
      if (validMinutes > 30) {
        return tokenData.token;
      }
    }

    // if no longer valid or missing, refresh token from Blizz API
    const clientId = getAppSetting('BlizzClientId');
    const clientSecret = getAppSetting('BlizzClientSecret');
    if (clientId === '' || clientSecret === '') {
      throw new Error('Error missing client id or client secret');
    }

    const tokenResponse = UrlFetchApp.fetch(`https://${region}.battle.net/oauth/token`, {
      headers: {
        Authorization: `Basic ${Utilities.base64Encode(`${clientId}:${clientSecret}`)}`,
        'Cache-Control': 'max-age=0',
      },
      payload: { grant_type: 'client_credentials' },
    });
    if (tokenResponse.getResponseCode() === 200) {
      // success, store new token and use it
      const token = JSON.parse(tokenResponse.getContentText()).access_token;
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      tokenString = JSON.stringify({ token, expiry });
      PropertiesService.getScriptProperties().setProperty(strStoredToken, tokenString);
      cache.put(strStoredToken, tokenString);
      return token;
    }

    console.error('Error getting Blizzard access token', tokenResponse);
    throw new Error('Error getting an API token. Please visit https://develop.battle.net/ and sign up for an account');
  }

  return Object.freeze({
    objectName,
    getAppSetting,
    getAppSettingsForSheet,
    saveAppSettingsFromSheet,
    getGuildRosterSettingsFromSheet,
    getBlizzAccessToken,
  });
}
