const Unit = require('../models/Unit');
const Building = require('../models/Building');

// Auto-generates Unit (flat) documents for a newly-created society based on
// how many buildings/towers and how many flats per building the admin entered
// during signup. Also creates matching Building records so the Society
// Structure screen immediately shows them and the Chairman can keep adding
// more floors/buildings afterwards. Flats are distributed across floors (5
// flats per floor) with flat numbers like "A-101", "A-102" ... "B-101" etc.
const provisionUnits = async (societyId, buildingsCount, flatsPerBuilding) => {
  const towerLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const flatsPerFloor = 5;
  const docs = [];
  const buildingDocs = [];

  for (let b = 0; b < buildingsCount; b++) {
    const towerLetter = towerLetters[b] || `T${b + 1}`;
    const towerName = `Tower ${towerLetter}`;
    buildingDocs.push({ society: societyId, name: towerName });

    let created = 0;
    let floor = 1;

    while (created < flatsPerBuilding) {
      for (let u = 1; u <= flatsPerFloor && created < flatsPerBuilding; u++) {
        docs.push({
          society: societyId,
          flatNo: `${towerLetter}-${floor}0${u}`,
          tower: towerName,
          floor: `${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor`,
          type: '2 BHK',
          areaSqft: 1100,
          status: 'Vacant',
        });
        created++;
      }
      floor++;
    }
  }

  if (buildingDocs.length) await Building.insertMany(buildingDocs);
  if (docs.length) await Unit.insertMany(docs);
  return docs.length;
};

// For "Individual Houses" type societies: just creates N standalone houses,
// no buildings/floors involved.
const provisionHouses = async (societyId, housesCount) => {
  const docs = [];
  for (let i = 1; i <= housesCount; i++) {
    docs.push({
      society: societyId,
      flatNo: `House-${i}`,
      tower: 'Individual Houses',
      floor: 'Ground',
      type: 'Independent House',
      areaSqft: 1200,
      status: 'Vacant',
    });
  }
  if (docs.length) await Unit.insertMany(docs);
  return docs.length;
};

module.exports = provisionUnits;
module.exports.provisionHouses = provisionHouses;
