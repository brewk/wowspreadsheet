/**
 * @OnlyCurrentDoc
 */

/**
 * The appUtils object
 * @param {Object} par The main parameter object.
 * @return {Object} The Utils Object.
 */
// eslint-disable-next-line no-unused-vars
function appUtils(par = {}) {
  const objectName = 'appUtils';
  // const cache = CacheService.getScriptCache();

  /**
   * utility function to fix names of toons, realms, etc.
   * @param {string} region toon region
   * @param {string} realm toon realm
   * @param {string} toon toon name
   * @param {boolean} asArray return result as array (or as object)
   * @return fixed names as array or object based on input.
   */
  function fixNames(region, realm, toon, asArray = false) {
    const lReg = region.replace(/\s/g, '').toLowerCase();
    let lRealm = realm
      .replace(/[\u200B-\u200D\uFEFF']/g, '')
      .replace(/\s/g, '-')
      .toLowerCase();
    const lToon = toon.toLowerCase().replace(/\s/g, '-');

    if (lRealm === 'arak-arahm' || lRealm === 'azjol-nerub' || lRealm === 'король-лич') {
      lRealm = lRealm.replace('-', '');
    }

    // return either as array or as object
    return asArray ? [lReg, lRealm, lToon] : { region: lReg, realm: lRealm, name: lToon };
  }

  /**
   * utility function to flatten input to one dimension
   * @param {array} input input to flatten
   * @return {array} one-dimensional array containing all values of input
   */
  function flatten(input) {
    const flatter = [];
    for (let i = 0; i < input.length; i++) {
      if (Array.isArray(input[i])) {
        for (let j = 0; j < input[i].length; j++) {
          flatter.push(input[i][j]);
        }
      } else {
        flatter.push(input[i]);
      }
    }
    return flatter;
  }

  /**
   * utility function to only allow upper case on first letters of words
   * @param {string} string input string to fix if needed
   * @return {string} return string only leaving upper case letters at the beginning of words
   */
  function lowerCaseAllWordsExceptFirstLetters(string) {
    return string.replace(/\w\S*/g, (word) => {
      return word.charAt(0) + word.slice(1).toLowerCase();
    });
  }

  /**
   * utility function to title case input string
   * @param {string} string input string to title case
   * @return {string} return input string in title case
   */
  function titleCase(string) {
    return string
      .toLowerCase()
      .split(' ')
      .map((word) => {
        return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
      })
      .join(' ');
  }

  /**
   * utility function to create an array of given length filled with defined default values
   * @param {number} length length of array to create
   * @param {any} defaultValue value to fill the array with
   * @return {array} array with length and content based on input
   */
  function initializedArray(length, defaultValue) {
    // helper that returns array with specified length and all elements are defaultValue
    return Array(...Array(length)).map(() => {
      return defaultValue;
    });
  }

  /**
   * utility function to compress data strings in chunks of encoded zipped blobs
   * @param {string} input data object to compress (most likely JSON string)
   * @return {array} array with junk sizes to match GAS cell data limit (so array can directly be stored in cells)
   */
  function zippedStringArray(input) {
    // helper function to compress and store large data in GAS
    const blob = Utilities.newBlob(input, 'application/octet-stream');
    const compressedBlob = Utilities.zip([blob]);
    const encodedResult = Utilities.base64Encode(compressedBlob.getBytes());
    // 50'000 is the cell characters limit
    const arrResult = encodedResult.match(/.{1,49900}/g);
    return arrResult;
  }

  /**
   * utility function to restore data compressed with function zippedStringArray
   * @see zippedStringArray
   * @param {array} input data array, output of zippedStringArray
   * @return {string} data string compressed with zippedStringArray
   */
  function unzippedStringArray(input) {
    // helper function to decompress and store large data in GAS
    const decoded = Utilities.base64Decode(input.join(''));
    const blob = Utilities.newBlob(decoded, 'application/zip');
    const unzipped = Utilities.unzip(blob);
    const resultString = unzipped[0].getAs('application/octet-stream').getDataAsString();
    return resultString;
  }

  /**
   * function to retrieve lookup data stored in according named sections within the spreadsheet
   * @param {string} section the region used for Blizz API calls (us/eu)
   * @return {any} JSON parsed return object of lookup data.
   */
  function getLookupData(section) {
    const compressedData = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(section).getValues();
    const data = unzippedStringArray(compressedData);
    return JSON.parse(data);
  }

  /**
   * utility function to shorten names of essences
   * @param {string} name name of essence to shorten
   * @return {string} shortened essence name
   */
  function shortEssenceName(name) {
    // helper for essence names
    const newName = name.replace('the ', '').replace('of ', '').replace('Essence ', '').replace('The ', '');
    const splitNames = newName.trim().split(' ');
    if (splitNames.length > 1) {
      let moreWords = splitNames[0];
      for (let k = 1; k < splitNames.length; k++) {
        moreWords += splitNames[k].charAt(0);
      }
      return moreWords;
    }
    return splitNames[0];
  }

  /**
   * utility function to get the UTC timestamp of the last daily reset
   * @param {string} region the region to calculate the daily reset for
   * @return {number} UTC timestamp value of last daily reset in provided region
   */
  function getWowDailyResetTimestamp(region) {
    // helper to calculate daily reset timestamp
    const now = new Date().getTime();
    let reset;
    if (region.toLowerCase() === 'eu') {
      reset = new Date().setUTCHours(7, 0, 0, 0);
    } else {
      reset = new Date().setUTCHours(15, 0, 0, 0);
    }
    if (now - reset < 0) {
      reset -= 24 * 60 * 60 * 1000; // if reset on current day is in the future, use last reset (substract one day)
    }
    return reset;
  }

  /**
   * utility function to get the UTC timestamp of the last weekly reset
   * @param {string} region the region to calculate the weekly reset for
   * @return {number} UTC timestamp value of last weekly reset in provided region
   */
  function getWowWeeklyResetTimestamp(region) {
    // helper to calculate weekly reset timestamp
    const now = new Date().getTime();
    const utcWeekday = new Date().getUTCDay();
    let reset;
    if (region.toLowerCase() === 'eu') {
      reset = new Date().setUTCHours(7, 0, 0, 0);
      reset += (3 - utcWeekday) * 24 * 60 * 60 * 1000; // offset from Wednesday (= 3)
    } else {
      reset = new Date().setUTCHours(15, 0, 0, 0);
      reset += (2 - utcWeekday) * 24 * 60 * 60 * 1000; // offset from Tuesday (= 2)
    }
    if (now - reset < 0) {
      reset -= 7 * 24 * 60 * 60 * 1000; // if reset of current week in the future, use last reset (substract one week)
    }
    return reset;
  }

  /**
   * utility function to do a simple url fetch
   * @param {string} requestUrl the url to fetch
   * @param {object} options the options to use for the fetch (optional)
   * @return {any} response object of the url fetch
   */
  function responseFetch(requestUrl, options = { muteHttpExceptions: true }) {
    return UrlFetchApp.fetch(requestUrl, options);
  }

  /**
   * utility function to do an url fetch with error handling and JSON parsed response
   * @param {string} requestUrl the url to fetch
   * @param {object} options the options to use for the fetch (optional)
   * @return {any} JSON parsed return object of the url fetch
   */
  function jsonFetch(requestUrl, options = { muteHttpExceptions: true }) {
    try {
      const response = responseFetch(requestUrl, options);
      const responseData = JSON.parse(response.getContentText());
      switch (response.getResponseCode()) {
        case 200:
          // handle WCL errors
          if (responseData.errors) {
            console.error('WCL API error', JSON.stringify(responseData.errors));
            if (Array.isArray(responseData.errors) && responseData.errors.length > 3) {
              throw new Error(
                `WCL API error: ${JSON.stringify(responseData.errors[0])} and ${
                  responseData.errors.length - 1
                } more errors`
              );
            }
            throw new Error(`WCL API error: ${JSON.stringify(responseData.errors)}`);
          }

          return responseData;
        case 403: {
          if (responseData.code && responseData.detail) {
            throw new Error(`${responseData.code} (${responseData.type}): ${responseData.detail}`);
          } else {
            console.error('Error getting API data (403)', requestUrl, response);
            throw new Error('Error getting API data (403)');
          }
        }
        case 404: {
          if (responseData.code && responseData.detail) {
            throw new Error(`${responseData.code} (${responseData.type}): ${responseData.detail}`);
          } else {
            console.error('Error getting API data (404)', requestUrl, response);
            throw new Error('Error getting API data (404)');
          }
        }
        default:
          console.error('Error getting API data', requestUrl, response);
          throw new Error('Error getting API data');
      }
    } catch (e) {
      console.error('Error getting API data', requestUrl, e, e.message);
      throw new Error(`Error getting API data ${e.message}`);
    }
  }

  /**
   * utility function to force a refresh in the roster
   */
  function refreshLastUpdate() {
    SpreadsheetApp.getActiveSpreadsheet().getRange('A1').setValue(new Date().toTimeString());
  }

  return Object.freeze({
    objectName,
    fixNames,
    flatten,
    lowerCaseAllWordsExceptFirstLetters,
    titleCase,
    initializedArray,
    zippedStringArray,
    unzippedStringArray,
    getLookupData,
    shortEssenceName,
    getWowDailyResetTimestamp,
    getWowWeeklyResetTimestamp,
    responseFetch,
    jsonFetch,
    refreshLastUpdate,
  });
}
