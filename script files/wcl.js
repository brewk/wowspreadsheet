/**
 * @OnlyCurrentDoc
 */

/* globals appSettings, appUtils */

/**
 * The appWowWarcraftLogs object
 * @param {Object} par The main parameter object.
 * @return {Object} The WowWarcraftLogs Object.
 */
// eslint-disable-next-line no-unused-vars
function appWowWarcraftLogs(par) {
  const objectName = 'appWowWarcraftLogs';
  const currentVersionWcl = 1.0;
  const mySettings = par.settings || appSettings();
  const myUtils = par.utils || appUtils();

  /**
   * function to retrieve data for raid instance dropdown
   * @return {array} WCL raid zone name / id pairs
   */
  function getRaidInfoForDropdown() {
    let raids = myUtils.getLookupData('raidsLookup');
    raids.sort((a, b) => b.number - a.number); // put newest raid first
    const output = [];
    raids.forEach((raid) => output.push([raid.name, raid.wclZoneId]));
    return output;
  }

  /**
   * function to fetch WCL GraphQL API data
   * @param {string} query the GraphQL query to execute
   * @param {Object} queryVariables object containing GrapQL query variables used in query parameter
   * @param {Object} options URLFetch options object
   * @return {Object} JSON parsed object of GraphQL query result data
   */
  function fetchWcl(query, queryVariables = null, options = { muteHttpExceptions: true }) {
    // first take care of the access token
    let token = '';
    try {
      token = mySettings.getWclAccessToken();
    } catch (e) {
      console.error('Error missing WCL token', e);
      throw e;
    }

    // API endpoint
    const endpoint = 'https://www.warcraftlogs.com/api/v2/client';
    // build request body depending on used queryVariables parameter
    const body = queryVariables
      ? { query: `${query}`, variables: `${JSON.stringify(queryVariables)}` }
      : { query: `${query}` };

    // generating/adjusting URL fetch options
    const myOptions = options;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    myOptions.headers = headers;
    myOptions.method = 'POST';
    myOptions.payload = JSON.stringify(body);

    // get data from API
    const response = myUtils.jsonFetch(endpoint, myOptions);
    return response;
  }

  /**
   * function to get all WCL data
   * @param {string} guildName name of the guild to fetch WCL reports from
   * @param {string} serverName guild server name
   * @param {string} region guild server region
   * @param {number} startTime unix timestamp for start date to fetch reports
   * @param {number} difficulty WCL difficulty id to use for reports
   * @param {number} zoneId WCL zone id to use for reports
   * @param {array} members list of all members to fetch data for (in format [realm, name, role])
   * @return {array} output array containing all WCL data
   */
  function getFullData(guildName, serverName, region, startTime, difficulty, zoneId, members) {
    // is WCL enabled?
    const clientId = mySettings.getAppSetting('WclClientId');
    if (!clientId || clientId === '') {
      return 'WCL not enabled, provide API credentials on settings page';
    }
    // are there any members provided?
    if (!members || members.length < 1) {
      return 'No members found!';
    }
    // are all member properties loaded already?
    if (
      members.some((member) =>
        member.some((prop) => prop === null || prop.length < 1 || prop === '#N/A' || prop === 'Loading...')
      )
    ) {
      return 'Incomplete data, aborting';
    }
    // check other input parameters for validity
    if (!Number.isInteger(startTime) || !Number.isInteger(difficulty) || !Number.isInteger(zoneId)) {
      return 'Illegal parameter values provided';
    }

    // prepare memberData object that stores basic WCL player data
    const memberData = {};
    members.forEach((el) => {
      memberData[el[1]] = {
        realm: el[0],
        role: el[2],
        metric: el[2] === 'Healer' ? 'hps' : 'dps',
        bestPerformanceAverage: 0,
        medianPerformanceAverage: 0,
        rank: 0,
        rankPercent: 0,
        attendance: [],
        experience: [],
      };
    });

    // prepare query 1 to retrieve player WCL data
    let charQuery = '';
    let index = 0;
    Object.entries(memberData).forEach(([toon, el]) => {
      charQuery = `${charQuery}c${index}: character(name: "${toon}", serverSlug: "${el.realm}", serverRegion: "${region}"){
        name
        zoneRankings(metric: ${el.metric}, difficulty: ${difficulty}, zoneID: ${zoneId})
      }`;
      index++;
    });
    const rankingQuery = `{
      characterData {
        ${charQuery}
      }
    }`;

    // call API to retrieve player WCL data
    let apiData = fetchWcl(rankingQuery);
    if (apiData && apiData.data && apiData.data.characterData) {
      // populate memberData object with API data for each member
      Object.keys(apiData.data.characterData).forEach((el) => {
        const member = apiData.data.characterData[el];
        memberData[member.name].bestPerformanceAverage = member.zoneRankings.bestPerformanceAverage;
        memberData[member.name].medianPerformanceAverage = member.zoneRankings.medianPerformanceAverage;
        memberData[member.name].rank = member.zoneRankings.allStars[member.zoneRankings.allStars.length - 1].rank;
        memberData[member.name].rankPercent =
          member.zoneRankings.allStars[member.zoneRankings.allStars.length - 1].rankPercent;
      });
    }

    // prepare query 2 to retrieve list of WCL reports with metadata using query variables
    const raidMetaQuery = `query RaidMetaData($r: String, $sn: String, $gn: String, $st: Float, $zi: Int, $page: Int) {
      reportData {
        reports(guildServerRegion: $r, guildServerSlug: $sn, guildName: $gn, startTime: $st, zoneID: $zi, page: $page) {
          total
          current_page
          last_page
          has_more_pages
          data {
            code
            startTime
            endTime
            masterData {
              actors(type: "player") {
                id
                name
              }
            }
            zone {
              id
              name
            }
          }
        }
      }
    }
    `;
    const queryVariables = {
      r: region,
      sn: serverName,
      gn: guildName,
      st: startTime,
      zi: zoneId,
      page: 1,
    };

    // call API to retrieve list of reports
    apiData = fetchWcl(raidMetaQuery, queryVariables);
    let allReports = []; // array of all report objects containing report information (like code, startTime, etc.)
    if (
      apiData &&
      apiData.data &&
      apiData.data.reportData &&
      apiData.data.reportData.reports &&
      apiData.data.reportData.reports.data
    ) {
      allReports = [...allReports, ...apiData.data.reportData.reports.data];
      // API uses paging with a 100 element hard limit, so fetch additional result pages if needed
      while (apiData.data.reportData.reports.has_more_pages === true) {
        queryVariables.page++; // get next result page
        apiData = fetchWcl(raidMetaQuery, queryVariables);
        allReports = [...allReports, ...apiData.data.reportData.reports.data];
      }
    }

    // output placeholder
    const output = [];

    // check if there are any reports at all
    if (allReports.length > 0) {
      // add calculated properties to the report objects
      allReports.forEach((report) => {
        report.duration = report.endTime - report.startTime;
        const startDate = new Date(report.startTime);
        report.dayString = startDate.toISOString().slice(0, 10); // e.g. "2021-01-01", needed to only parse 1 report per day if there are multiple loggers
        report.weekDay = startDate.getDay(); // weekday number
      });

      // remove duplicate reports (same raids logged by multiple raiders)
      const distinctReports = [];
      allReports.forEach((report) => {
        // check if there is already an entry for this day
        const idx = distinctReports.findIndex((item) => item.dayString === report.dayString);
        if (idx === -1) {
          // new entry
          distinctReports.push(report);
        } else if (report.duration > distinctReports[idx].duration) {
          // replace existing entry if the new one has a longer duration
          distinctReports[idx] = report;
        }
      });

      // generate query for report detail information
      let raidsQuery = '';
      distinctReports.forEach(
        (el, i) =>
          (raidsQuery = `${raidsQuery}r${i}: report(code: "${el.code}") {
      code
      fights(killType: Encounters){
        encounterID
        name
        kill
        difficulty
        friendlyPlayers
      }
    }
    `)
      );
      const raidDetailsQuery = `{
      reportData {
        ${raidsQuery}
      }
    }`;

      // call API to get report details
      apiData = fetchWcl(raidDetailsQuery);
      // add fight details to distinct report data
      Object.keys(apiData.data.reportData).forEach((el) => {
        const repDetail = apiData.data.reportData[el];
        const idx = distinctReports.findIndex((report) => report.code === repDetail.code);
        if (idx > -1) {
          distinctReports[idx].fights = repDetail.fights; // list of all boss fights for this raid
        }
      });

      // filter reports by difficulty and sort with oldest report first
      const filteredReports = distinctReports
        .filter((report) => report.fights.some((fight) => fight.difficulty === difficulty))
        .sort((a, b) => a.startTime - b.startTime);

      // object to store all totals with initial values
      const totals = {
        raids: 0,
        raidDays: [],
        raidDayRaids: [],
        fights: 0,
        kills: 0,
        encounters: [],
      };

      // object to store all raider data with initial values
      const raiderData = {};
      Object.keys(memberData).forEach(
        (member) =>
          (raiderData[member] = {
            raids: 0,
            fights: 0,
            kills: 0,
            attendance: [],
            experience: [],
          })
      );

      // loop through all valid reports
      filteredReports.forEach((report) => {
        totals.raids++;
        // handle list of raid week days
        if (totals.raidDays.indexOf(report.weekDay) < 0) {
          totals.raidDays.push(report.weekDay);
        }
        // handle total count of raids per week day
        if (totals.raidDayRaids[report.weekDay]) {
          totals.raidDayRaids[report.weekDay]++;
        } else {
          totals.raidDayRaids[report.weekDay] = 1;
        }

        // helper to store all raiders that participated in any of the fights in this report
        const raiders = [];

        // loop through all fights of this report
        report.fights.forEach((fight) => {
          // make sure difficulty matches
          if (fight.difficulty === difficulty) {
            totals.fights++;
            // handle list of encounters in total
            let encounterIndex = totals.encounters.findIndex((el) => el.id === fight.encounterID);
            if (encounterIndex < 0) {
              // add new encounter
              totals.encounters.push({ id: fight.encounterID, name: fight.name, fights: 0, kills: 0 });
              encounterIndex = totals.encounters.length - 1;
            }
            totals.encounters[encounterIndex].fights++;
            // handle boss kills
            if (fight.kill) {
              totals.kills++;
              totals.encounters[encounterIndex].kills++;
            }

            // loop through all raiders that participated in this boss fight
            fight.friendlyPlayers.forEach((raiderId) => {
              // report.masterData.actors contains id <-> name mapping infos for all raiders in one report
              const actorIndex = report.masterData.actors.findIndex((el) => el.id === raiderId);
              if (actorIndex > -1) {
                const raiderName = report.masterData.actors[actorIndex].name;
                if (raiderData[raiderName]) {
                  raiderData[raiderName].fights++;

                  // if needed add raider to list of all raider of this report
                  if (raiders.indexOf(raiderName) < 0) {
                    raiders.push(raiderName);
                  }

                  // handle raider encounter experience
                  if (raiderData[raiderName].experience[encounterIndex]) {
                    raiderData[raiderName].experience[encounterIndex].fights++;
                  } else {
                    raiderData[raiderName].experience[encounterIndex] = { fights: 1, kills: 0 };
                  }
                  // handle raider boss kill
                  if (fight.kill) {
                    raiderData[raiderName].kills++;
                    raiderData[raiderName].experience[encounterIndex].kills++;
                  }
                }
              }
            });
          }
        });

        // loop through all raiders that participated in one of the fights in this report
        raiders.forEach((raider) => {
          raiderData[raider].raids++;
          // handle week day attendance
          if (raiderData[raider].attendance[report.weekDay]) {
            raiderData[raider].attendance[report.weekDay]++;
          } else {
            raiderData[raider].attendance[report.weekDay] = 1;
          }
        });
      });

      // get week day for weekly reset based on region
      const resetWeekDay = new Date(myUtils.getWowWeeklyResetTimestamp(region)).getDay();
      // sort raid week days starting with weekly reset week day
      totals.raidDays.sort((a, b) => ((6 + a - resetWeekDay) % 6) - ((6 + b - resetWeekDay) % 6));
      // create list of week day names
      const weekDays = [];
      for (let day = 4; day <= 10; day++) {
        weekDays.push(
          new Date(1970, 0, day).toLocaleDateString(
            SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetLocale().replace('_', '-'),
            {
              weekday: 'short',
            }
          )
        );
      }

      // push output header
      output.push([
        'Best Perf.\nAvg %',
        'Median Perf.\nAvg %',
        'Rank',
        'Rank %',
        `Raids\nTotal: ${totals.raids}`,
        `Fights\nTotal: ${totals.fights}`,
        `Kills\nTotal: ${totals.kills}`,
        ...totals.raidDays.map((raidDay) => `${weekDays[raidDay]}\nTotal: ${totals.raidDayRaids[raidDay]}`), // list of week days with totals
        ...myUtils.initializedArray(7 - totals.raidDays.length, ''), // fill not used week days with empty strings to maintain output length
        ...totals.encounters.reduceRight((result, encounter) => {
          // encounters in reverse order to diaply newest first
          result.push(`${encounter.name}\nFights: ${encounter.fights}\tKills: ${encounter.kills}`, ''); // encounter name with totals
          return result;
        }, []),
      ]);

      // loop through all members to create output
      members.forEach((member) => {
        const memberName = member[1];
        const mData = memberData[memberName];
        const rData = raiderData[memberName];

        output.push([
          mData.bestPerformanceAverage,
          mData.medianPerformanceAverage,
          mData.rank,
          mData.rankPercent,
          rData.raids / totals.raids, // percentage
          rData.fights / totals.fights, // percentage
          rData.kills / totals.kills, // percentage
          ...totals.raidDays.map((raidDay) =>
            rData.attendance[raidDay] ? rData.attendance[raidDay] / totals.raidDayRaids[raidDay] : 0 // percentage
          ),
          ...myUtils.initializedArray(7 - totals.raidDays.length, ''), // empty placeholder
          ...totals.encounters.reduceRight((result, encounter, encounterIndex) => {
            const encounterExperience = rData.experience[encounterIndex];
            if (encounterExperience) {
              result.push(encounterExperience.fights, encounterExperience.kills);
            } else {
              result.push(0, 0);
            }
            return result;
          }, []),
        ]);
      });
    } else {
      // no raid reports, just member infos
      // push header
      output.push(['Best Perf.\nAvg %', 'Median Perf.\nAvg %', 'Rank', 'Rank %']);

      // loop through all members to create output
      members.forEach((member) => {
        const memberName = member[1];
        const mData = memberData[memberName];

        output.push([mData.bestPerformanceAverage, mData.medianPerformanceAverage, mData.rank, mData.rankPercent]);
      });
    }

    return output;
  }

  /**
   * function to get the version of the WCL module
   * @return {number} version of WCL module
   */
  function verCheckWarcraftLogs() {
    return currentVersionWcl;
  }

  return Object.freeze({
    objectName,
    getRaidInfoForDropdown,
    fetchWcl,
    getFullData,
    verCheckWarcraftLogs,
  });
}
