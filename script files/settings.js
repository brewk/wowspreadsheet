/**
 * @OnlyCurrentDoc
 */

/**
 * The appSettings Object
 * @param {Object} par The main parameter object.
 * @return {Object} The Settings Object.
 */
function appSettings(par = {}) {
    const objectName = 'appSettings';
    const strBlizzClientId = 'BlizzClientId';
    const strBlizzClientSecret = 'BlizzClientSecret';
    const strStoredToken = 'BlizzAccessToken';
    const strWarcraftLogsKey = 'WarcraftLogsKey';
    const strAuditLookupSheetName = 'auditLookup';
    const cache = CacheService.getScriptCache();
    const blizzClientId = par.blizzClientId || null;
    const blizzClientSecret = par.blizzClientSecret || null;
    const warcraftLogsKey = par.warcraftLogsKey || null;
    const useRaiderIoData = par.useRaiderIoData || false;
    const wowEpicGemIlvl = par.epicGemIlvl || 419;
    const wowAuditIlvl = par.auditIlvl || 309;
    const markLegendary = par.markLegendary || true;
  
    /**
     * function to retrieve Blizz client id from cache, script properties or provided value
     * @return {string} Blizz client id
     */
    function getBlizzClientId() {
      // return it from cache if possible
      let clientId = cache.get(strBlizzClientId);
      if (clientId != null && (blizzClientId === null || clientId === blizzClientId)) {
        return clientId;
      }
      // else return it from script properties and populate cache if possible
      clientId = PropertiesService.getScriptProperties().getProperty(strBlizzClientId);
      if (clientId != null && (blizzClientId === null || clientId === blizzClientId)) {
        cache.put(strBlizzClientId, clientId);
        return clientId;
      }
      // else fall back to provided value (initial setup) and populate cache and script properties
      if (blizzClientId != null) {
        PropertiesService.getScriptProperties().setProperty(strBlizzClientId, blizzClientId);
        cache.put(strBlizzClientId, blizzClientId);
        return blizzClientId;
      }
      return '';
    }
  
    /**
     * function to retrieve Blizz client secret from cache, script properties or provided value
     * @return {string} Blizz client secret
     */
    function getBlizzClientSecret() {
      // return it from cache if possible
      let clientSecret = cache.get(strBlizzClientSecret);
      if (clientSecret != null && (blizzClientSecret === null || clientSecret === blizzClientSecret)) {
        return clientSecret;
      }
      // else return it from script properties and populate cache if possible
      clientSecret = PropertiesService.getScriptProperties().getProperty(strBlizzClientSecret);
      if (clientSecret != null && (blizzClientSecret === null || clientSecret === blizzClientSecret)) {
        cache.put(strBlizzClientSecret, clientSecret);
        return clientSecret;
      }
      // else fall back to provided value (initial setup) and populate cache and script properties
      if (blizzClientSecret != null) {
        PropertiesService.getScriptProperties().setProperty(strBlizzClientSecret, blizzClientSecret);
        cache.put(strBlizzClientSecret, blizzClientSecret);
        return blizzClientSecret;
      }
      return '';
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
      const clientId = getBlizzClientId();
      const clientSecret = getBlizzClientSecret();
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
        const token = JSON.parse(tokenResponse.getContentText()).access_token;
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        tokenString = JSON.stringify({ token, expiry });
        PropertiesService.getScriptProperties().setProperty(strStoredToken, tokenString);
        cache.put(strStoredToken, tokenString);
        return token;
      }
      Logger.log('Error getting Blizzard access token', tokenResponse);
      throw new Error('Error getting an API token. Please visit https://develop.battle.net/ and sign up for an account');
    }
  
    /**
     * function to retrieve WCL API key from cache, script properties or provided value
     * @return {string} WCL API key
     */
    function getWarcraftLogsKey() {
      // return it from cache if possible
      let key = cache.get(strWarcraftLogsKey);
      if (key != null && (warcraftLogsKey === null || key === warcraftLogsKey)) {
        return key;
      }
      // else return it from script properties and populate cache if possible
      key = PropertiesService.getScriptProperties().getProperty(strWarcraftLogsKey);
      if (key != null && (warcraftLogsKey === null || key === warcraftLogsKey)) {
        cache.put(strWarcraftLogsKey, key);
        return key;
      }
      // else fall back to provided value (initial setup) and populate cache and script properties
      if (warcraftLogsKey != null) {
        PropertiesService.getScriptProperties().setProperty(strWarcraftLogsKey, warcraftLogsKey);
        cache.put(strWarcraftLogsKey, warcraftLogsKey);
        return warcraftLogsKey;
      }
      return '';
    }
  
    /**
     * function to retrieve WoW item improvement information from according sheet
     * @return {array} WoW item improvement information.
     */
    function getAuditLookupData() {
      // get all the item improvements from according sheet
      return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(strAuditLookupSheetName).getDataRange().getValues();
    }
  
    return Object.freeze({
      objectName,
      wowEpicGemIlvl,
      wowAuditIlvl,
      markLegendary,
      useRaiderIoData,
      getBlizzClientId,
      getBlizzClientSecret,
      getBlizzAccessToken,
      getWarcraftLogsKey,
      getAuditLookupData,
    });
  }
  