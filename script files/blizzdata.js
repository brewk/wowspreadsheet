/**
 * @OnlyCurrentDoc
 */

/* globals appSettings, appUtils */

/**
 * The appBlizzData object
 * @param {Object} par The main parameter object.
 * @return {Object} The BlizzCache Object.
 */
function appBlizzData(par = {}) {
  const objectName = 'appBlizzData';
  const mySettings = par.settings || appSettings();
  const myUtils = par.utils || appUtils();
  const cache = CacheService.getScriptCache();

  const myBaseUrls = [
    {
      type: 'data',
      url: 'https://{REGION}.api.blizzard.com/data/wow/{ENDPOINT}?namespace=profile-{REGION}&locale=en_US',
    },
    {
      type: 'profile',
      url: 'https://{REGION}.api.blizzard.com/profile/wow/{ENDPOINT}?namespace=profile-{REGION}&locale=en_US',
    },
  ];
  const myApiEndpoints = [
    { name: 'guildRoster', enabled: true, type: 'data', endpoint: 'guild/{REALM}/{NAME}/roster' },
    { name: 'charProfileStatus', enabled: false, type: 'profile', endpoint: 'character/{REALM}/{NAME}/status' },
    { name: 'charProfile', enabled: true, type: 'profile', endpoint: 'character/{REALM}/{NAME}' },
    { name: 'charCharacterSoulbinds', enabled: true, type: 'profile', endpoint: 'character/{REALM}/{NAME}/soulbinds' },
    {
      name: 'charCharacterMedia',
      enabled: true,
      type: 'profile',
      endpoint: 'character/{REALM}/{NAME}/character-media',
    },
    { name: 'charEquipment', enabled: true, type: 'profile', endpoint: 'character/{REALM}/{NAME}/equipment' },
    {
      name: 'charQuestsCompleted',
      enabled: true,
      type: 'profile',
      endpoint: 'character/{REALM}/{NAME}/quests/completed',
    },
    {
      name: 'charEncountersRaids',
      enabled: true,
      type: 'profile',
      endpoint: 'character/{REALM}/{NAME}/encounters/raids',
    },
    {
      name: 'charEncountersDungeons',
      enabled: true,
      type: 'profile',
      endpoint: 'character/{REALM}/{NAME}/encounters/dungeons',
    },
    { name: 'charProfessions', enabled: true, type: 'profile', endpoint: 'character/{REALM}/{NAME}/professions' },
    { name: 'charReputations', enabled: true, type: 'profile', endpoint: 'character/{REALM}/{NAME}/reputations' },
    { name: 'charAchievements', enabled: true, type: 'profile', endpoint: 'character/{REALM}/{NAME}/achievements' },
  ];

  /**
   * helper function to build url to fetch Blizz API data
   * @param {string} region region of target object (toon, guild, etc.)
   * @param {string} realm realm of target object (toon, guild, etc.)
   * @param {string} name name of target object (toon, guild, etc.)
   * @param {string} endpointName requested API endpoint @see myApiEndpoints
   * @return {string} generated Blizz API url ready to be fetched
   */
  function buildUrl(region, realm, name, endpointName) {
    // just stitch the full url together and replace placeholders
    const apiEndpoint = myApiEndpoints.find((el) => el.name === endpointName);
    const baseUrl = myBaseUrls.find((el) => el.type === apiEndpoint.type);
    let fetchUrl = baseUrl.url.replace('{ENDPOINT}', apiEndpoint.endpoint);
    fetchUrl = fetchUrl
      .replace(/\{REGION\}/g, region)
      .replace(/\{REALM\}/g, realm)
      .replace(/\{NAME\}/g, name);
    return fetchUrl;
  }

  /**
   * function to call Blizz API (handling authentication, additional options/headers and errors) and return JSON parsed result
   * @param {string} url Blizz API url to fetch data from
   * @param {string} region region to use for Blizz API call
   * @param {object} options the options to use for the fetch (optional)
   * @param {array} addHeaders response headers to include in result JSON object
   * @return {any} JSON parsed return object of the Blizz API call
   */
  function fetchWoW(url, region, options = { muteHttpExceptions: true }, addHeaders = []) {
    // first take care of the access token
    let token = '';
    try {
      token = mySettings.getBlizzAccessToken(region);
    } catch (e) {
      console.error('Error missing token', e);
      throw e;
    }
    // passing the token via header instead of url parameter to avoid
    // token being displayed in errors that include url
    const myOptions = options;
    const requestHeaders = myOptions.headers || {};
    requestHeaders.Authorization = `Bearer ${token}`;
    myOptions.headers = requestHeaders;

    // get data from API and add optional header values to response data object
    const response = myUtils.responseFetch(url, myOptions);
    const responseData = JSON.parse(response.getContentText());
    const responseAllHeaders = response.getAllHeaders();
    addHeaders.forEach((el) => {
      const responseHeader = responseAllHeaders[el];
      responseData[el] = responseHeader;
    });

    // some response validation & error handling
    switch (response.getResponseCode()) {
      case 200:
        return responseData;
      case 403: {
        if (responseData.code && responseData.detail) {
          // 'successful' 403 containing blizz infos
          return responseData;
        }
        console.error('Error getting API data (403)', url, response);
        throw new Error('Error getting API data (403)');
      }
      case 404: {
        if (responseData.code && responseData.detail) {
          // 'successful' 404 containing blizz infos
          return responseData;
        }
        console.error('Error getting API data (404)', url, response);
        throw new Error('Error getting API data (404)');
      }
      default:
        console.error('Error getting API data', url, response);
        throw new Error('Error getting API data');
    }
  }

  /**
   * function to get Blizz API data for the guild roster
   * @param {string} region region of target guild
   * @param {string} realm realm of target guild
   * @param {string} guildName name of target guild
   * @return {any} JSON parsed return object for guild roster
   */
  function getGuildRoster(region, realm, guildName) {
    const fixedNames = myUtils.fixNames(region, realm, guildName);
    const fetchUrl = buildUrl(fixedNames.region, fixedNames.realm, fixedNames.name, 'guildRoster');
    let guild;
    try {
      guild = fetchWoW(fetchUrl, fixedNames.region);
    } catch (e) {
      throw new Error(e.message);
    }
    return guild;
  }

  /**
   * function to get Blizz API data for a toon
   * @param {string} region region of target toon
   * @param {string} realm realm of target toon
   * @param {string} name name of target toon
   * @param {string} endpointName requested API endpoint @see myApiEndpoints
   * @return {any} JSON parsed return object for the toon
   */
  function getCharData(region, realm, name, endpointName) {
    const fixedNames = myUtils.fixNames(region, realm, name);
    const fetchUrl = buildUrl(fixedNames.region, fixedNames.realm, fixedNames.name, endpointName);
    let charData;
    try {
      charData = fetchWoW(fetchUrl, fixedNames.region);
    } catch (e) {
      throw new Error(e.message);
    }
    return charData;
  }

  /**
   * function to retrieve reputation headers from lookup data
   * @return {array} reputation headers
   */
  function getReputationHeaders() {
    const reps = myUtils.getLookupData('repsLookup');
    reps.sort((a, b) => a.position - b.position);
    const repHeaders = reps.map((el) => el.header);
    return repHeaders;
  }

  /**
   * function to retrieve raid headers from lookup data
   * @param {number} count # of headers to return, starting from the most current raid
   * @return {array} raid headers
   */
  function getRaidHeaders(count = 0) {
    const raids = myUtils.getLookupData('raidsLookup');
    raids.sort((a, b) => b.number - a.number);
    let output = [];
    for (let i = 0; i < raids.length; i++) {
      // only use the first #count raids for headers
      if (count > 0 && i > count - 1 ) {
        break;
      }
      output.push(`${raids[i].name} Lockouts`, '', '', '', `${raids[i].name} Progression [active weeks]`, '', '', '');
    }
    return output;
  }
  
  /**
   * function to retrieve mythic ilvl for current raid and offset for color scaling
   * @param {number} count # of headers to return, starting from the most current raid
   * @return {array} [ilvl, mod#]
   */
  function getRaidIlvl() {
    const raids = myUtils.getLookupData('raidsLookup');
    return [raids[0].mythicIlvl, raids[0].ilvlMod];
  }


  return Object.freeze({
    objectName,
    getGuildRoster,
    getCharData,
    getReputationHeaders,
    getRaidHeaders,
    getRaidIlvl
  });
}