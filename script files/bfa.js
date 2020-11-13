/**
 * @OnlyCurrentDoc
 */

/* globals appSettings, appUtils, appBlizzData */

/**
 * The appWowBfa object
 * @param {Object} par The main parameter object.
 * @return {Object} The WowBfa Object.
 */
function appWowBfa(par) {
  const objectName = 'appWowBfa';
  const strApiError = 'Error: invalid data received from API';
  const currentVersionBfa = 2.31;
  const mySettings = par.settings || appSettings();
  const myUtils = par.utils || appUtils();
  const myBlizzData = par.blizzData || appBlizzData();
  const useRaiderIo = mySettings.useRaiderIo || false;

  /**
   * function to get quest spreadsheet data for a toon
   * @param {string} region region of target toon
   * @param {string} realm realm of target toon
   * @param {string} toonName name of target toon
   * @return {array} toon quest data for spreadsheet
   */
  function quest(region, realmName, toonName) {
    if (!toonName || !realmName) {
      return ' '; // If there's nothing in the column, don't even bother calling the API
    }

    // get API data
    let quests;
    try {
      quests = myBlizzData.getCharData(region, realmName, toonName, 'charQuestsCompleted');
    } catch (e) {
      return e.message;
    }
    if (!quests.quests) {
      if (quests.code && quests.detail) {
        return `Blizz message: ${quests.detail} (${quests.code})`;
      }
      return strApiError;
    }

    // emissaries
    const emissaryLookup = [];
    emissaryLookup[50562] = '💎CoA';
    emissaryLookup[50598] = '🏯ZE';
    emissaryLookup[50599] = '⚓PA';
    emissaryLookup[50600] = '🔥OoE';
    emissaryLookup[50601] = '🌄SW';
    emissaryLookup[50602] = '🐸TE';
    emissaryLookup[50603] = '🏜️V';
    emissaryLookup[50604] = '🐢TS';
    emissaryLookup[50605] = '💙AWE';
    emissaryLookup[50606] = '❤️HWE';
    emissaryLookup[56120] = '🦈️‍️UnS';
    emissaryLookup[56119] = '🐟WA';
    emissaryLookup[57157] = '🐪Uldum';
    emissaryLookup[56308] = '🐜Uldum';
    emissaryLookup[55350] = '😾Uldum';
    emissaryLookup[56064] = '🐼Vale';
    emissaryLookup[57008] = '👹Vale';
    emissaryLookup[57728] = '🐜Vale';
    emissaryLookup[58168] = 'Vision'; // vision
    emissaryLookup[58155] = 'Vision'; // vision
    emissaryLookup[58151] = 'Vision'; // vision
    emissaryLookup[58167] = 'Vision'; // vision
    emissaryLookup[58156] = 'Vision'; // vision

    const worldBosses = [52196, 52163, 52169, 52181, 52157, 52166]; // world bosses
    let emsComplete = ''; // emissaries completed
    let worldBossKill = ''; // world boss kills
    let warfront = ''; // warfronts done
    let islandExpeditions = ''; // island expeditions

    for (let i = 0; i < quests.quests.length; i++) {
      // check world boss weekly
      if (worldBosses.indexOf(quests.quests[i].id) > -1) {
        worldBossKill += '🌏 Weekly: \u2713 '; // unicode checkmark
      }
      // check emissaries
      if (emissaryLookup[quests.quests[i].id]) {
        emsComplete = `${emsComplete + emissaryLookup[quests.quests[i].id]}\u2713 `; // unicode checkmark
      }

      // check individual world bosses
      if (quests.quests[i].id === 56057) {
        worldBossKill += '🦑Soulbinder: \u2713 ';
      }
      if (quests.quests[i].id === 56056) {
        worldBossKill += '🐛Terror: \u2713 ';
      }

      if (quests.quests[i].id === 58705) {
        worldBossKill += '👑Empress: \u2713 ';
      }

      if (quests.quests[i].id === 55466) {
        worldBossKill += "🐞Vuk'laz: \u2713 ";
      }

      if (quests.quests[i].id === 54895 || quests.quests[i].id === 54896) {
        worldBossKill += '🌳 Ivus : \u2713 ';
      }
      if (quests.quests[i].id === 52847 || quests.quests[i].id === 52848) {
        worldBossKill += '⚙️ Tank: \u2713 ';
      }

      // check warfront
      if (quests.quests[i].id === 53414 || quests.quests[i].id === 53416) {
        warfront += '🏰 Stormgarde: \u2713 ';
      }

      if (quests.quests[i].id === 56136 || quests.quests[i].id === 56136) {
        warfront += '🏯 Heroic-Storm: \u2713 ';
      }

      if (quests.quests[i].id === 57959 || quests.quests[i].id === 57960) {
        warfront += '🌚 Heroic-Dark: \u2713 ';
      }

      if (quests.quests[i].id === 53955 || quests.quests[i].id === 53992) {
        warfront += '🌘 Darkshore: \u2713 ';
      }

      // check island expedition
      if (quests.quests[i].id === 53435 || quests.quests[i].id === 53436) {
        islandExpeditions = '\u2713 ';
      }
    }

    return [worldBossKill, warfront, emsComplete, islandExpeditions];
  }

  /**
   * function to get raid and dungeon spreadsheet data for a toon
   * @param {string} region region of target toon
   * @param {string} realm realm of target toon
   * @param {string} toonName name of target toon
   * @return {array} toon raid and dungeon data for spreadsheet
   */
  function raidsDungeons(region, realmName, toonName) {
    if (!toonName || !realmName) {
      return ' '; // If there's nothing in the column, don't even bother calling the API
    }

    // Due to changes in the API this now has to be updated everytime a raid is added
    const currentXpacId = 396; // Battle for Azeroth
    const currentXpacDungeonCount = 11; // dungeon count for current x-pac
    // raid info list
    const raidList = [
      {
        name: "Ny'alotha, the Waking City",
        id: 1180,
        bosses: 12,
      },
      {
        name: 'The Eternal Palace',
        id: 1179,
        bosses: 8,
      },
      {
        name: 'Crucible of Storms',
        id: 1177,
        bosses: 2,
      },
      {
        name: "Battle of Dazar'alor",
        id: 1176,
        bosses: 9,
      },
      {
        name: 'Uldir',
        id: 1031,
        bosses: 8,
      },
    ];

    const raidModes = ['LFR', 'NORMAL', 'HEROIC', 'MYTHIC']; // raid difficulty modes
    const dungeonOutputLength = 4; // array offset for dungeon/mythic dungeons HC (2) and mythic (2) dungeon infos
    const outputLength = raidList.length * (raidModes.length * 2) + dungeonOutputLength; // for each raid 2 times the difficulty count (progress and lockout for each difficulty) plus dungeon infos

    // get raid API data
    let progression;
    try {
      progression = myBlizzData.getCharData(region, realmName, toonName, 'charEncountersRaids');
    } catch (e) {
      return myUtils.initializedArray(outputLength, e.message);
    }
    if (!progression._links) {
      if (progression.code && progression.detail) {
        return myUtils.initializedArray(outputLength, `Blizz message: ${progression.detail} (${progression.code})`);
      }
      return myUtils.initializedArray(outputLength, strApiError);
    }

    // get dungeon API data
    let dungeons;
    try {
      dungeons = myBlizzData.getCharData(region, realmName, toonName, 'charEncountersDungeons');
    } catch (e) {
      return myUtils.initializedArray(outputLength, e.message);
    }
    if (!dungeons._links) {
      if (dungeons.code && dungeons.detail) {
        return myUtils.initializedArray(outputLength, `Blizz message: ${dungeons.detail} (${dungeons.code})`);
      }
      return myUtils.initializedArray(outputLength, strApiError);
    }

    // get RaiderIO API data
    let raider;
    if (useRaiderIo) {
      const fetchUrl = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realmName}&name=${toonName.toUpperCase()}&fields=mythic_plus_highest_level_runs,mythic_plus_scores,mythic_plus_weekly_highest_level_runs`;
      try {
        raider = myUtils.jsonFetch(fetchUrl, region);
      } catch (e) {
        Logger.log('Error getting RaiderIO data, skipping', e.message);
      }
      if (!raider.name) {
        Logger.log('Error in RaiderIO data structure, skipping', raider);
        raider = null;
      }
    }

    let progressionOut = []; // output variable

    // dungeon part
    const lastDailyReset = myUtils.getWowDailyResetTimestamp(region);

    const dungeonLockouts = []; // dungeon lockout infos
    const dungeonProgress = []; // dungeon progress infos
    const dungeonTotals = []; // dungeon totals infos
    // initalize dungeon info arrays with 0 per difficulty
    raidModes.forEach((el) => {
      dungeonLockouts[el] = 0;
      dungeonProgress[el] = 0;
      dungeonTotals[el] = 0;
    });

    // find index of the expansion array entry for the current x-pac id



    if (dungeons.expansions) {
      const currentXpacDungeonIndex = dungeons.expansions.findIndex((el) => el.expansion.id === currentXpacId);


      if (currentXpacDungeonIndex >= 0) {
        // get list of all dungeons for the current x-pac
        const currentXpacDungeons = dungeons.expansions[currentXpacDungeonIndex].instances || [];
        // loop through all the found dungeons
        for (let i = 0; i < currentXpacDungeons.length; i++) {
          // loop through all found difficulty modes
          for (let j = 0; j < currentXpacDungeons[i].modes.length; j++) {
            // update existing data for progress, totals and lockouts
            dungeonProgress[currentXpacDungeons[i].modes[j].difficulty.type] += 1;
            dungeonTotals[currentXpacDungeons[i].modes[j].difficulty.type] +=
              currentXpacDungeons[i].modes[j].progress.encounters[0].completed_count;
            const timestampCheck =
              currentXpacDungeons[i].modes[j].difficulty.type === 'MYTHIC' ? lastWeeklyReset : lastDailyReset;
            if (currentXpacDungeons[i].modes[j].progress.encounters[0].last_kill_timestamp > timestampCheck)
              dungeonLockouts[currentXpacDungeons[i].modes[j].difficulty.type] += 1;
          }
        }
      }


      // add RaiderIO data
      if (raider) {
        let mythicLockoutString = `${dungeonLockouts.MYTHIC}/${currentXpacDungeonCount}`;
        let mythicProgressString = `${dungeonProgress.MYTHIC}/${currentXpacDungeonCount} (${dungeonTotals.MYTHIC})`;
        // add highest weekly, key and score info
        if (raider.mythic_plus_weekly_highest_level_runs[0]) {
          mythicLockoutString = `${dungeonLockouts.MYTHIC}/${currentXpacDungeonCount} weekly highest M+: ${raider.mythic_plus_weekly_highest_level_runs[0].mythic_level}`;
        }
        if (raider.mythic_plus_highest_level_runs[0]) {
          mythicProgressString = `${dungeonProgress.MYTHIC}/${currentXpacDungeonCount} highest season M+: ${raider.mythic_plus_highest_level_runs[0].mythic_level}`;
        }
        if (raider.mythic_plus_scores) {
          mythicProgressString = `${mythicProgressString} Score: ${raider.mythic_plus_scores.all}`;
        }
        // attach dungeon info to output
        progressionOut.push(
          `${dungeonLockouts.HEROIC}/${currentXpacDungeonCount}`,
          `${dungeonProgress.HEROIC}/${currentXpacDungeonCount} (${dungeonTotals.HEROIC})`,
          mythicLockoutString,
          mythicProgressString
        );
      } else {
        // attach dungeon info to output
        progressionOut.push(
          `${dungeonLockouts.HEROIC}/${currentXpacDungeonCount}`,
          `${dungeonProgress.HEROIC}/${currentXpacDungeonCount} (${dungeonTotals.HEROIC})`,
          `${dungeonLockouts.MYTHIC}/${currentXpacDungeonCount}`,
          `${dungeonProgress.MYTHIC}/${currentXpacDungeonCount} (${dungeonTotals.MYTHIC})`
        );
      }

    } else {
      progressionOut = [...progressionOut, ...myUtils.initializedArray(dungeonOutputLength, 'N/A')];
    }

    // raid part
    const lastWeeklyReset = myUtils.getWowWeeklyResetTimestamp(region);

    // find index of the expansion array entry for the current x-pac id



    if (progression.expansions) {
      const currentXpacRaidIndex = progression.expansions.findIndex((el) => el.expansion.id === currentXpacId);
      if (currentXpacRaidIndex < 0) {
        // no raids played in current xpac
        progressionOut = [...progressionOut, ...myUtils.initializedArray(outputLength - dungeonOutputLength, 'N/A')];
      } else {
        let o = dungeonOutputLength; // index of output array
        // get list of all raids for the current x-pac
        const currentXpacRaids = progression.expansions[currentXpacRaidIndex].instances || [];
        // loop through raid info list
        for (let i = 0; i < raidList.length; i++) {
          // by default zero everything out
          progressionOut = [...progressionOut, ...myUtils.initializedArray(8, `${0}/${raidList[i].bosses}`)];

          const thisRaid = currentXpacRaids.find((el) => el.instance.id === raidList[i].id);
          // if raid has been played
          if (thisRaid && thisRaid.modes) {
            // check all difficulty modes
            for (let j = 0; j < raidModes.length; j++) {
              const modeIndex = thisRaid.modes.findIndex((el) => el.difficulty.type === raidModes[j]);
              // if mode has been played
              if (modeIndex > -1 && thisRaid.modes[modeIndex].progress && thisRaid.modes[modeIndex].progress.encounters) {
                const progressCompletedCount = thisRaid.modes[modeIndex].progress.completed_count;
                let progressWeeks = 0;
                let progressTotalKills = 0;
                let progressLockoutKills = 0;
                // calculate data
                for (let k = 0; k < thisRaid.modes[modeIndex].progress.encounters.length; k++) {
                  progressTotalKills += thisRaid.modes[modeIndex].progress.encounters[k].completed_count;
                  if (thisRaid.modes[modeIndex].progress.encounters[k].completed_count > progressWeeks)
                    progressWeeks = thisRaid.modes[modeIndex].progress.encounters[k].completed_count;
                  if (thisRaid.modes[modeIndex].progress.encounters[k].last_kill_timestamp > lastWeeklyReset)
                    progressLockoutKills += 1;
                }
                // overwrite placeholder zeros with actual data
                progressionOut[o + j] = `${progressLockoutKills}/${raidList[i].bosses}`; // lockout infos
                progressionOut[
                  o + j + raidModes.length
                ] = `${progressCompletedCount}/${raidList[i].bosses} [${progressWeeks}] (${progressTotalKills})`; // progress infos
              }
            }
          }
          o += 2 * raidModes.length; // next raid instance block
        }
      }

    } else {
      progressionOut = [...progressionOut, ...myUtils.initializedArray(outputLength - dungeonOutputLength, 'N/A')];
    }
    

    return progressionOut;
  }

  /**
   * function to get equipment spreadsheet data for a toon
   * @param {string} region region of target toon
   * @param {string} realm realm of target toon
   * @param {string} toonName name of target toon
   * @return {array} toon equipment data for spreadsheet
   */
  function equipment(region, realmName, toonName) {
    if (!toonName || !realmName) {
      return ' '; // If there's nothing in the column, don't even bother calling the API
    }

    // get API data
    let gear;
    try {
      gear = myBlizzData.getCharData(region, realmName, toonName, 'charEquipment');
    } catch (e) {
      return myUtils.initializedArray(70, e.message);
    }
    if (!gear.equipped_items) {
      if (gear.code && gear.detail) {
        return myUtils.initializedArray(4, `Blizz message: ${gear.detail} (${gear.code})`);
      }
      return myUtils.initializedArray(4, strApiError);
    }

    // get audit lookup info from config sheet
    const auditLookup = mySettings.getAuditLookupData();
    const headerRow = auditLookup.shift();
    // create easy to use index (like auditLookup[alIndex.shortName])
    const alIndex = {};
    headerRow.forEach((el, i) => {
      alIndex[el] = i;
    });

    // slot sort order
    const sortOrder = {};
    sortOrder.HEAD = 0;
    sortOrder.NECK = 1;
    sortOrder.SHOULDER = 2;
    sortOrder.BACK = 3;
    sortOrder.CHEST = 4;
    sortOrder.WRIST = 5;
    sortOrder.HANDS = 6;
    sortOrder.WAIST = 7;
    sortOrder.LEGS = 8;
    sortOrder.FEET = 9;
    sortOrder.FINGER_1 = 10;
    sortOrder.FINGER_2 = 11;
    sortOrder.TRINKET_1 = 12;
    sortOrder.TRINKET_2 = 13;
    sortOrder.MAIN_HAND = 14;
    sortOrder.OFF_HAND = 15;

    // enchant slot order
    const enchantOrder = {};
    enchantOrder.MAIN_HAND = 0;
    enchantOrder.OFF_HAND = 1;
    enchantOrder.FINGER_1 = 2;
    enchantOrder.FINGER_2 = 3;
    enchantOrder.HANDS = 4;

    // stat order
    const statOrder = [];
    statOrder.STAMINA = 0;
    statOrder.STRENGTH = 1;
    statOrder.AGILITY = 1;
    statOrder.INTELLECT = 1;
    statOrder.CRIT_RATING = 2;
    statOrder.HASTE_RATING = 3;
    statOrder.MASTERY_RATING = 4;
    statOrder.VERSATILITY = 5;
    statOrder.CORRUPTION = 6;
    statOrder.CORRUPTION_RESISTANCE = 7;

    // initialize audit result with default values and useful attributes
    const gemAudit = [
      { bool: 0, issue: 'Old:', category: 'Old', text: ' UnCom:' },
      { bool: 0, issue: 'Cheap:', category: 'Cheap', text: ' Rare:' },
      { bool: 0, issue: 'No Leviathan', category: 'Leviathan', text: ' PrimeEpic:' },
      { bool: 0, issue: 'Missing Epic:', category: 'Epic', text: ' Epic:' },
      { bool: 0, issue: 'Missing Trinket Punchcard', category: 'Punchcard', text: ' Punchcard:' },
    ];

    // initialize gem infos with default values and useful attributes
    const gemStats = [
      { value: 0, stat: 'Critical Strike', shortStat: 'Crit' },
      { value: 0, stat: 'Haste', shortStat: 'Haste' },
      { value: 0, stat: 'Versatility', shortStat: 'Vers' },
      { value: 0, stat: 'Mastery', shortStat: 'Mast' },
      { value: 0, stat: 'Experience', shortStat: '%XP' },
      { value: 0, stat: 'Movement', shortStat: '%Move' },
      { value: 0, stat: 'Strength', shortStat: 'Str' },
      { value: 0, stat: 'Agility', shortStat: 'Agi' },
      { value: 0, stat: 'Intellect', shortStat: 'Int' },
      { value: 0, stat: 'N/A', shortStat: 'OLD GEMS' },
    ];

    const enchantableItems = ['MAIN_HAND', 'OFF_HAND', 'FINGER_1', 'FINGER_2', 'HANDS']; // slots available for enchants
    const azeriteItems = ['HEAD', 'SHOULDER', 'CHEST']; // slots available for Azerite items

    // helper variables
    const uniqueStatsCount = Object.values(statOrder).filter((el, i, self) => {
      return self.indexOf(el) === i; // get array of distinct values
    }).length; // count of distinct stats (so only counting INT, AGI or STR - not all of them)
    let azeriteItemsCount = 0; // track Azerite items
    let maleficCoreCount = 0; // track Malefic Cores
    const equippedGems = myUtils.initializedArray(4, 0); // count equipped gems per category (see gemAudit)
    const slotsWithEmptySockets = []; // all slots with empty sockets

    // output variables
    let averageIlvl = 0; // calculated average iLvl
    const slotData = myUtils.initializedArray(Object.keys(sortOrder).length, ''); // info shown in slot columns
    let heartOfAzerothLevel = 0; // Heart of Azeroth level
    let cloakRank = ''; // rank of cloak
    const essences = myUtils.initializedArray(4, '-'); // active essences
    const enchants = myUtils.initializedArray(enchantableItems.length, ''); // applied enchants per slot
    let gemInfo = ''; // info string containing all infos about equipped (or missing) gems
    const azeriteTraits = []; // traits on azerite items
    const azeritePower = []; // count of unlocked azerite traits
    const totalStats = myUtils.initializedArray(uniqueStatsCount, 0); // keep track of amount for all stats
    const itemInfos = []; // details of item (name, slot, stats etc.)
    const bonusStats = myUtils.initializedArray(gemStats.length, 0); // stats gained from item enhancements

    // loop through all items
    for (let i = 0; i < gear.equipped_items.length; i++) {
      const item = gear.equipped_items[i]; // current item
      const slotIndex = sortOrder[item.slot.type]; // current slot index

      // handle iLvl for all items except tabards and shirts
      if (item.slot.type !== 'TABARD' && item.slot.type !== 'SHIRT') {
        slotData[slotIndex] = item.level.value;
        averageIlvl += item.level.value;
      }

      // item info
      itemInfos[slotIndex] = `${item.name}\n` || ''; // add name line to item info
      if (item.name_description) {
        itemInfos[slotIndex] += `${item.name_description.display_string} `; // add description line to item info
      }
      itemInfos[slotIndex] += `${myUtils.lowerCaseAllWordsExceptFirstLetters(item.slot.type)}\n`; // add slot line to item info

      // stats
      if (item.stats) {
        // loop through all stats
        for (let j = 0; j < item.stats.length; j++) {
          if (item.stats[j] && !item.stats[j].is_negated) {
            // negation occurs when gear has multiple primaries and only one is active
            const statType = item.stats[j].type.type;
            const statIndex = statOrder[statType];

            itemInfos[slotIndex] += `${statType.replace('_RATING', '')} = ${item.stats[j].value}\n`; // add stat line to item info
            totalStats[statIndex] += item.stats[j].value;

            // handle corruption
            if (mySettings.markCorruption && statType === 'CORRUPTION') {
              slotData[slotIndex] += item.stats[j].value / 100; // decimal values for corruption
            }

            // calculate malefic cores collected
            if (item.slot.type === 'BACK' && statType === 'CORRUPTION_RESISTANCE') {
              maleficCoreCount = (item.stats[j].value - 50) / 3;
            }
          }
        }
      }

      // spells
      if (item.spells) {
        itemInfos[slotIndex] += `\n${item.spells[0].description}`; // add spell description line to item info
      }

      // azerite item stuff and things
      if (azeriteItems.indexOf(item.slot.type) > -1) {
        // initialize defaults
        azeritePower[azeriteItemsCount] = 0;
        azeriteTraits[azeriteItemsCount] = '';
        // check if toon is wearing Azerite item
        if (item.azerite_details) {
          // loop through all traits
          for (let j = 0; j < item.azerite_details.selected_powers.length; j++) {
            if (item.azerite_details.selected_powers[j].spell_tooltip) {
              azeritePower[azeriteItemsCount] += 1;
              azeriteTraits[
                azeriteItemsCount
              ] = `${item.azerite_details.selected_powers[j].spell_tooltip.spell.name}\n${azeriteTraits[azeriteItemsCount]}`;
            }
          }

          azeritePower[
            azeriteItemsCount
          ] = `${azeritePower[azeriteItemsCount]}/${item.azerite_details.selected_powers.length}`; // how many traits are unlocked
        }

        azeriteItemsCount += 1;
      }

      // Heart of Azeroth
      if (item.slot.type === 'NECK' && item.name === 'Heart of Azeroth') {
        heartOfAzerothLevel =
          item.azerite_details.level.value + Math.round(item.azerite_details.percentage_to_next_level * 100) / 100;

        // essences
        if (item.azerite_details.level.value >= 35 && item.azerite_details.selected_essences) {
          let corruptionResistanceApplied = false;

          // loop through all essences
          for (let j = 0; j < item.azerite_details.selected_essences.length; j++) {
            const essence = item.azerite_details.selected_essences[j]; // current essence
            if (essence.rank) {
              // if there's no rank there's no reason to continue

              // handle additional corruption resistance from essence
              const resistCheck = essence.passive_spell_tooltip.description.indexOf(
                'Corruption Resistance increased by 10.'
              );
              if (!corruptionResistanceApplied && resistCheck > -1) {
                // add one time corruption resistance bonus
                totalStats[7] += 10;
                corruptionResistanceApplied = true;
              }

              essences[j] = `${myUtils.shortEssenceName(essence.essence.name)}(${essence.rank})`; // add essence short name to the list
            }
          }
        }
      }

      // handle legendary items
      if (item.quality.type === 'LEGENDARY') {
        if (mySettings.markLegendary) {
          slotData[slotIndex] += `+`;
        }

        // cloak stuff
        if (item.name === "Ashjra'kamas, Shroud of Resolve") {
          cloakRank = item.name_description.display_string.replace('Rank ', '');

          // leaving this in, some folks want fewer columns and this allows you to hide the cloak rank column. some people are die hard for that extra column though
          if (mySettings.showCloakRank) {
            if (mySettings.showCoresAfterRank15 && cloakRank === '15') {
              slotData[slotIndex] = mySettings.markLegendary
                ? `${slotData[slotIndex]}${maleficCoreCount}/25`
                : `${slotData[slotIndex]}+${maleficCoreCount}/25`;
              cloakRank += `+${maleficCoreCount}`;
            } else {
              slotData[slotIndex] += ` r${cloakRank}`;
            }
          } else if (mySettings.showCoresAfterRank15 && cloakRank === '15') {
            // we're only doing the rank in the extra column
            cloakRank = `15+${maleficCoreCount}/25`;
          } else {
            cloakRank = parseInt(cloakRank, 10);
          }
        }
      }

      // enchant checks
      if (enchantableItems.indexOf(item.slot.type) > -1 && item.level.value >= mySettings.wowAuditIlvl) {
        // initialize defaults
        const enchantIndex = enchantOrder[item.slot.type];
        enchants[enchantIndex] = 'None';
        if (
          item.slot.type === 'OFF_HAND' &&
          !(item.inventory_type.type === 'TWOHWEAPON' || item.inventory_type.type === 'WEAPON')
        ) {
          // ignore non-weapon offhands
          enchants[enchantIndex] = '';
        } else if (item.enchantments) {
          let auditLookupItem = auditLookup.find((el) => el[alIndex.effectId] === item.enchantments[0].enchantment_id); // search for enchant in lookup table
          if (!auditLookupItem && item.enchantments[0].source_item) {
            // if not found try to find it by source item id
            auditLookupItem = auditLookup.find((el) => el[alIndex.id] === item.enchantments[0].source_item.id);
          }
          if (auditLookupItem) {
            enchants[enchantIndex] = auditLookupItem[alIndex.shortName]; // add enchant short name to the list

            // this bit adds our stats to the stat boost array for the inspect/compare sheet
            if (auditLookupItem[alIndex.stat] && auditLookupItem[alIndex.value]) {
              const bonusStatIndex = gemStats.findIndex((el) => el.stat === auditLookupItem[alIndex.stat]);
              const value = parseInt(auditLookupItem[alIndex.value], 10);
              if (value && bonusStatIndex > -1) {
                bonusStats[bonusStatIndex] += value;
              }
            }
          } else {
            enchants[enchantIndex] = 'Old';
          }
        }
      }

      // gem audit stuff.. oh boy!
      if (item.item.id === 167555) {
        // some temporary punch card stuff, not sure how robust this'll be
        if (!item.sockets[2].item) {
          // it's always (99% of the time) that last blue punch card that's missing
          gemAudit[4].bool = 1;
        }
        // check if item is valid for gem check
      } else if (item.level.value > mySettings.wowAuditIlvl && item.sockets) {
        // loop through all sockets
        for (let j = 0; j < item.sockets.length; j++) {
          if (item.sockets[j].socket_type.type === 'PRISMATIC' && item.quality.type !== 'ARTIFACT') {
            // don't check artifacts in case people are still using those!

            if (!item.sockets[j].item) {
              // empty socket
              slotsWithEmptySockets.push(` ${item.slot.type}`);
            } else {
              const gem = item.sockets[j].item; // current gem
              const auditLookupItem = auditLookup.find((el) => el[alIndex.id] === gem.id); // search for current gem in lookup table
              if (auditLookupItem) {
                // add gem stat value to the list
                const gemStatIndex = gemStats.findIndex((el) => el.stat === auditLookupItem[alIndex.stat]);
                const value = parseInt(auditLookupItem[alIndex.value], 10);
                gemStats[gemStatIndex].value += value;
              } else {
                // unknown gem, add it to the last entry 'old'
                gemStats[gemStats.length - 1].value += 1;
              }

              // do stuff based on gem category
              const gemAuditIndex = auditLookupItem
                ? gemAudit.findIndex((el) => el.category === auditLookupItem[alIndex.auditCategory])
                : 0;

              if (gemAuditIndex < 2) {
                // not epic
                if (item.level.value > mySettings.wowEpicGemIlvl) {
                  // iLvl high enough to force epic gem
                  gemAudit[2].bool = 1;
                  gemAudit[3].bool = 1;
                  gemAudit[3].issue += ` ${item.slot.type}`;
                } else {
                  // cheap, old or unkown
                  gemAudit[gemAuditIndex].bool = 1;
                  gemAudit[gemAuditIndex].issue += ` ${item.slot.type}`;
                }
              }

              equippedGems[gemAuditIndex] += 1; // add gem to total count
            }
          }
        }
      }

      // adjust ilvl for 2h weapons
      if (item.slot.type === 'MAIN_HAND' && (item.inventory_type.name !== 'One-Hand' && item.item_subclass.name !== 'Wand')) {
        averageIlvl += item.level.value;
      }
    }

    // fix ilvl with 2x2h weapons
    const mainhandItem = gear.equipped_items.find((item) => item.slot.type === 'MAIN_HAND');
    const offhandItem = gear.equipped_items.find((item) => item.slot.type === 'OFF_HAND');
    if (
      offhandItem &&
      offhandItem.inventory_type.name === 'Two-Hand' &&
      mainhandItem &&
      mainhandItem.inventory_type.name !== 'One-Hand'
    ) {
      averageIlvl -= mainhandItem.level.value;
    }

    averageIlvl /= 16; // calculated average iLvl

    // build gem audit info string
    if (equippedGems.some((el) => el > 0)) {
      // gems exist!
      gemInfo += 'Gems';
      for (let i = 0; i < equippedGems.length; i++) {
        if (equippedGems[i] > 0) {
          gemInfo += `${gemAudit[i].text}${equippedGems[i]}`; // add category:count to info string
          if (i === 2) {
            gemAudit[i].bool = 0; // Leviathan gem exists, so no issues here
          }
        }
      }

      for (let i = 0; i < gemStats.length; i++) {
        if (gemStats[i].value > 0) {
          gemInfo += ` +${gemStats[i].value}${gemStats[i].shortStat}`; // add stats gained through gems to info string
          bonusStats[i] += gemStats[i].value; // add stats gained through gems to bonus stat counter
        }
      }
    }

    // report gem issues if needed
    for (let i = 0; i < gemAudit.length; i++) {
      if (gemAudit[i].bool > 0) {
        gemInfo += `${gemInfo.length > 0 ? ', ' : ''}${gemAudit[i].issue}`;
      }
    }

    // report empty sockets if needed
    if (slotsWithEmptySockets.length > 0) {
      gemInfo += `${gemInfo.length > 0 ? ', ' : ''}${slotsWithEmptySockets.length
        } Empty Sockets (${slotsWithEmptySockets})`;
    }

    return myUtils.flatten([
      averageIlvl,
      slotData,
      heartOfAzerothLevel,
      cloakRank,
      azeritePower,
      essences,
      enchants,
      gemInfo,
      totalStats[6] - totalStats[7],
      azeriteTraits,
      totalStats,
      itemInfos,
      bonusStats,
    ]);
  }

  /**
   * function to get profile spreadsheet data for a toon
   * @param {string} region region of target toon
   * @param {string} realm realm of target toon
   * @param {string} toonName name of target toon
   * @return {array} toon profile data for spreadsheet
   */
  function profile(region, realmName, toonName) {
    if (!toonName || !realmName) {
      return ' '; // If there's nothing in the column, don't even bother calling the API
    }

    // get API data
    let profileData;
    try {
      profileData = myBlizzData.getCharData(region, realmName, toonName, 'charProfile');
    } catch (e) {
      return e.message;
    }
    if (!profileData.id) {
      if (profileData.code && profileData.detail) {
        return `Blizz message: ${profileData.detail} (${profileData.code})`;
      }
      return strApiError;
    }

    // calculate last logout time
    const logout = new Date(0);
    logout.setUTCSeconds(profileData.last_login_timestamp / 1000);

    // initialize defaults
    let title = '';
    let guild = '';

    if (profileData.active_title) {
      title = profileData.active_title.name; // set title
    }

    if (profileData.guild) {
      guild = profileData.guild.name; // set guild name
    }

    if (profileData.character_class.name === 'Death Knight' && profileData.active_spec.name === 'Frost') {
      profileData.active_spec.name += ' '; // adding this space will make the sheet able to tell frost mages and frost DKs apart, so we can assign melee/ranged
    }

    // build return array
    const profileArray = [
      profileData.character_class.name,
      profileData.level,
      profileData.active_spec.name,
      profileData.equipped_item_level,
      logout,
      profileData.achievement_points,
      title,
      guild,
      profileData.race.name,
      profileData.gender.name,
      profileData.faction.name,
    ];
    return profileArray;
  }

  /**
   * function to get avatar spreadsheet data for a toon
   * @param {string} region region of target toon
   * @param {string} realm realm of target toon
   * @param {string} toonName name of target toon
   * @return {array} toon avatar data for spreadsheet
   */
  function avatar(region, realmName, toonName) {
    if (!toonName || !realmName) {
      return ' '; // If there's nothing in the column, don't even bother calling the API
    }

    // get API data
    let media;
    try {
      media = myBlizzData.getCharData(region, realmName, toonName, 'charCharacterMedia');
    } catch (e) {
      return myUtils.initializedArray(4, e.message);
    }
    if (!media.assets) {
      if (media.code && media.detail) {
        return myUtils.initializedArray(4, `Blizz message: ${media.detail} (${media.code})`);
      }
      return myUtils.initializedArray(4, strApiError);
    }

    return [
      media.assets[0].value,  //avatar
      media.assets[1].value,  //bust
      media.assets[2].value,  //render
      `https://worldofwarcraft.com/en-${region}/character/${region}/${realmName}/${toonName}`,
    ];
  }

  /**
   * function to get reputation spreadsheet data for a toon
   * @param {string} region region of target toon
   * @param {string} realm realm of target toon
   * @param {string} toonName name of target toon
   * @return {array} toon reputation data for spreadsheet
   */
  function rep(region, realmName, toonName) {
    if (!toonName || !realmName) {
      return ' '; // If there's nothing in the column, don't even bother calling the API
    }

    // list of factions to track including sort order
    const reps = [
      { id: 2164, position: 0 }, // Champions of Azeroth
      { id: 2163, position: 1 }, // Tortollan Seekers

      // alliance factions

      { id: 2160, position: 3 }, // Proudmoore Admiralty
      { id: 2161, position: 4 }, // Order of Embers
      { id: 2162, position: 5 }, // Storm's Wake
      { id: 2159, position: 2 }, // 7th Legion
      { id: 2400, position: 6 }, // Waveblade Ankoan

      // horde factions
      { id: 2103, position: 3 }, // Zandalari Empire
      { id: 2156, position: 5 }, // Talanji's Expedition
      { id: 2158, position: 4 }, // Voldunai
      { id: 2157, position: 2 }, // The Honorbound
      { id: 2373, position: 6 }, // Unshackled

      { id: 2391, position: 7 }, // Rustbolt Resistance
      { id: 2415, position: 8 }, // Rajani
      { id: 2417, position: 9 }, // Uldum
    ];
    const maxPosition = Math.max(...reps.map((el) => el.position))+1; // get max position for array length

    // get API data
    let reputations;
    try {
      reputations = myBlizzData.getCharData(region, realmName, toonName, 'charReputations');
    } catch (e) {
      return myUtils.initializedArray(maxPosition, e.message);
    }
    if (!reputations.reputations) {
      if (reputations.code && reputations.detail) {
        return myUtils.initializedArray(maxPosition, `Blizz message: ${reputations.detail} (${reputations.code})`);
      }
      return myUtils.initializedArray(maxPosition, strApiError);
    }

    // initialize defaults
    const repArray = myUtils.initializedArray(maxPosition, 'unmet'); // our output array

    // loop through all factions of tracking list
    for (let i = 0; i < reps.length; i++) {
      const reputation = reputations.reputations.find((el) => el.faction.id === reps[i].id); // lookup faction in API data
      if (reputation) {
        // faction data found, generate output string including paragon information
        if (reputation.paragon) {
          repArray[reps[i].position] =
            reputation.paragon.value / reputation.paragon.max === 1
              ? `Paragon ✅ ${reputation.paragon.value}/${reputation.paragon.max}`
              : `Paragon ${reputation.paragon.value}/${reputation.paragon.max}`;
        } else {
          repArray[
            reps[i].position
          ] = `${reputation.standing.name} ${reputation.standing.value}/${reputation.standing.max}`;
        }
      }
    }
    return repArray;
  }

  /**
   * function to get professions spreadsheet data for a toon
   * @param {string} region region of target toon
   * @param {string} realm realm of target toon
   * @param {string} toonName name of target toon
   * @return {array} toon professions data for spreadsheet
   */
  function professions(region, realmName, toonName) {
    if (!toonName || !realmName) {
      return ' '; // If there's nothing in the column, don't even bother calling the API
    }

    // initialize output with defaults
    const profListOut = myUtils.initializedArray(5, 'none');

    // get API data
    let profs;
    try {
      profs = myBlizzData.getCharData(region, realmName, toonName, 'charProfessions');
    } catch (e) {
      return myUtils.initializedArray(profListOut.length, e.message);
    }
    if (!profs._links) {
      if (profs.code && profs.detail) {
        return myUtils.initializedArray(profListOut.length, `Blizz message: ${profs.detail} (${profs.code})`);
      }
      return myUtils.initializedArray(profListOut.length, strApiError);
    }

    // helper function to parse professions data
    const getProfString = (prof) => {
      if (!prof.profession) {
        // prof input has no profession data
        return 'none';
      }
      if (!prof.tiers) {
        // profession without tier information, directly return skill values
        return `${prof.profession.name} ${prof.skill_points}/${prof.max_skill_points}`;
      }

      // lookup matrix: each row is a tier, each column a profession in that tier
      const profIdLookup = [
        [2477, 2532, 2485, 2556, 2548, 2572, 2540, 2506, 2494, 2592, 2564, 2524, 2514],
        [2476, 2531, 2484, 2555, 2547, 2571, 2539, 2505, 2493, 2591, 2563, 2523, 2513],
        [2475, 2530, 2483, 2554, 2546, 2570, 2538, 2504, 2492, 2590, 2562, 2522, 2512],
        [2474, 2529, 2482, 2553, 2545, 2569, 2537, 2503, 2491, 2589, 2561, 2521, 2511],
        [2473, 2528, 2481, 2552, 2544, 2568, 2536, 2502, 2489, 2588, 2560, 2520, 2510],
        [2472, 2527, 2480, 2551, 2543, 2567, 2535, 2501, 2488, 2587, 2559, 2519, 2509],
        [2454, 2526, 2479, 2550, 2542, 2566, 2534, 2500, 2487, 2586, 2558, 2518, 2508],
        [2437, 2525, 2478, 2549, 2541, 2565, 2533, 2499, 2486, 2585, 2557, 2517, 2507],
      ];
      // initialize output with defaults
      const profOut = ['Va-', 'Bc-', 'Lk-', 'Ca-', 'Pa-', 'Wa-', 'Lg-', 'Ba-'];

      // loop through all tiers
      for (let i = 0; i < prof.tiers.length; i++) {
        const tier = prof.tiers[i]; // current tier
        const lookupId = profIdLookup.findIndex((el) => el.indexOf(tier.tier.id) > -1); // search for profession tier id in lookup matrix
        profOut[lookupId] = tier.skill_points >= tier.max_skill_points ? '\u2713' : tier.skill_points; // replace output defaults with current data
      }

      return `${prof.profession.name} ${profOut}`;
    };

    // checking primary professions
    if (profs.primaries) {
      for (let i = 0; i < profs.primaries.length; i++) {
        // use helper function to generate output string
        profListOut[i] = getProfString(profs.primaries[i]);
      }
    }

    // checking secondary professions
    if (profs.secondaries) {
      const offset = 2;
      for (let i = 0; i < profs.secondaries.length; i++) {
        // use helper function to generate output string
        profListOut[i + offset] = getProfString(profs.secondaries[i]);
      }
    }

    return profListOut;
  }

  /**
   * function to get the version of this module
   * @return {number} version of this module
   */
  function verCheck() {
    return currentVersionBfa;
  }

  return Object.freeze({
    objectName,
    quest,
    raidsDungeons,
    equipment,
    profile,
    avatar,
    rep,
    professions,
    verCheck,
  });
}
