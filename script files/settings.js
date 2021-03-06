/**
 * @OnlyCurrentDoc
 */

/* globals appUtils */

/**
 * The appSettings Object
 * @param {Object} par The main parameter object.
 * @return {Object} The Settings Object.
 */
// eslint-disable-next-line no-unused-vars
function appSettings(par = {}) {
  const objectName = 'appSettings';
  const strAppSettings = 'AppSettings';
  const strBlizzToken = 'BlizzAccessToken';
  const strWclToken = 'WclAccessToken';
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
    const currentAppSettings = JSON.parse(appSettingsJson);
    if (Object.keys(currentAppSettings).indexOf(varName) < 0) {
      const appSettingsLookup = myUtils.getLookupData('appSettingsLookup');
      const newSetting = appSettingsLookup.find((el) => el.varName === varName);
      if (!newSetting) {
        throw new Error(`App setting ${varName} not found!`);
      }
      currentAppSettings[varName] = newSetting.default;
      appSettingsJson = JSON.stringify(currentAppSettings);
      PropertiesService.getScriptProperties().setProperty(strAppSettings, appSettingsJson);
      cache.put(strAppSettings, appSettingsJson);
    }
    cache.put(varName, currentAppSettings[varName]);
    return currentAppSettings[varName];
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
    const currentAppSettings = {};
    const appSettingsLookup = myUtils.getLookupData('appSettingsLookup');
    appSettingsLookup.forEach((el) => (currentAppSettings[el.varName] = el.default));
    appSettingsJson = JSON.stringify(currentAppSettings);
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
    const output = [];

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
      output.push([`(${setting.id}) ${setting.name}`, setting.description, setting.default]);
    }

    return output;
  }

  /**
   * function to retrieve app settings from settings page
   * @return {string} output message indicating the status of the action
   */
  function saveAppSettingsFromSheet() {
    // get settings infos from remote lookup sheet
    const appSettingsLookup = myUtils.getLookupData('appSettingsLookup');
    if (!appSettingsLookup || appSettingsLookup.length < 1) {
      return 'Invalid settings lookup data';
    }

    // read all values from data region around named range (starting point in settings sheet)
    const appSettingsData = SpreadsheetApp.getActiveSpreadsheet()
      .getRangeByName('appSettings')
      .offset(0, 0, appSettingsLookup.length, 4) // 4 matches getAppSettingsForSheet output length + 1 for new values
      .getValues();

    // helper index
    const index = {};
    index.Name = 0;
    index.Description = 1;
    index.CurrentValue = 2;
    index.NewValue = 3;

    // prepare output and create helper variables
    const currentAppSettings = {};
    const validBoolTrues = ['true', 'on', '1'];
    const validBoolFalses = ['false', 'off', '0'];
    const validationErrors = [];
    const changedSettings = [];

    // loop over all settings data from sheet
    for (let i = 0; i < appSettingsData.length; i++) {
      const setting = appSettingsData[i];
      let id;
      try {
        id = parseInt(setting[index.Name].match(/(\d+)/gi)[0], 10);
      } catch (e) {
        return 'Invalid settings structure, missing ID info.';
      }

      // check if this setting also exists on remote sheet, otherwhise ask for refresh first
      const lookup = appSettingsLookup.find((el) => el.id === id);
      if (!lookup) {
        return 'Settings mismatch, please refresh sheet and try again';
      }

      // read new value and check if it is not empty
      let newValue = setting[index.NewValue];
      if (newValue === null || newValue.toString().length === 0) {
        // setting is empty, so instead the existing value will be used
        newValue = getAppSetting(lookup.varName);
      } else {
        // new value detected, mark as changed
        changedSettings.push(lookup.varName);
      }

      // input validation
      switch (lookup.type) {
        case 'bool': {
          if (typeof newValue === 'boolean') {
            currentAppSettings[lookup.varName] = newValue;
          } else {
            if (validBoolTrues.indexOf(newValue.toLowerCase()) >= 0) {
              currentAppSettings[lookup.varName] = true;
            } else if (validBoolFalses.indexOf(newValue.toLowerCase()) >= 0) {
              currentAppSettings[lookup.varName] = false;
            } else {
              validationErrors.push(`Invalid bool value for ${lookup.name}`);
              continue;
            }
          }
          break;
        }

        case 'number': {
          const value = parseFloat(newValue);
          if (isNaN(value)) {
            validationErrors.push(`Expected a number value for ${lookup.name}`);
            continue;
          }
          currentAppSettings[lookup.varName] = value;
          break;
        }

        default: {
          currentAppSettings[lookup.varName] = newValue.trim();
          break;
        }
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
    const appSettingsJson = JSON.stringify(currentAppSettings);
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

      const rankBlacklist = parseInt(row[0], 10);
      if (!isNaN(rankBlacklist)) {
        settings.rankBlacklist.push(rankBlacklist);
      }

      const rankWhitelist = parseInt(row[1], 10);
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
    const clientId = getAppSetting('BlizzClientId');
    const clientSecret = getAppSetting('BlizzClientSecret');
    if (clientId === '' || clientSecret === '') {
      throw new Error('Error missing Blizz client id or client secret');
    }

    const tokenUrl = `https://${region}.battle.net/oauth/token`;
    return getAccessToken(strBlizzToken, tokenUrl, clientId, clientSecret);
  }

  /**
   * function to retrieve or refresh WCL access token
   * @return {string} WCL access token
   */
  function getWclAccessToken() {
    const clientId = getAppSetting('WclClientId');
    const clientSecret = getAppSetting('WclClientSecret');
    if (clientId === '' || clientSecret === '') {
      throw new Error('Error missing WCL client id or client secret');
    }

    const tokenUrl = 'https://www.warcraftlogs.com/oauth/token';
    return getAccessToken(strWclToken, tokenUrl, clientId, clientSecret);
  }

  /**
   * function to retrieve or refresh API access tokens
   * @param {string} tokenName name of the token to store in cache/properties
   * @param {string} endpoint API token endpoint
   * @param {string} clientId API client id / username
   * @param {string} clientSecret API client secret / password
   */
  function getAccessToken(tokenName, endpoint, clientId, clientSecret) {
    // first try to get token from cache or script properties
    let tokenString = cache.get(tokenName);
    if (!tokenString) {
      tokenString = PropertiesService.getScriptProperties().getProperty(tokenName);
      if (tokenString) {
        cache.put(tokenName, tokenString);
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

    // if no longer valid or missing, refresh token
    if (clientId === '' || clientSecret === '') {
      throw new Error('Error missing client id or client secret');
    }

    const tokenResponse = myUtils.responseFetch(endpoint, {
      headers: {
        Authorization: `Basic ${Utilities.base64Encode(`${clientId}:${clientSecret}`)}`,
        'Cache-Control': 'max-age=0',
      },
      payload: { grant_type: 'client_credentials' },
    });
    if (tokenResponse.getResponseCode() === 200) {
      // success, store new token and use it
      const token = JSON.parse(tokenResponse.getContentText()).access_token;
      const expiry = JSON.parse(tokenResponse.getContentText()).expires_in / 3600;
      tokenString = JSON.stringify({ token, expiry });
      PropertiesService.getScriptProperties().setProperty(tokenName, tokenString);
      cache.put(tokenName, tokenString);
      return token;
    }

    console.error('Error getting access token', tokenResponse);
    throw new Error('Error getting an API token.');
  }

  return Object.freeze({
    objectName,
    getAppSetting,
    getAppSettingsForSheet,
    saveAppSettingsFromSheet,
    getGuildRosterSettingsFromSheet,
    getBlizzAccessToken,
    getWclAccessToken,
    getAccessToken,
  });
}
