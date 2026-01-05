const swisseph = require('swisseph');

function fetchBodyData(jd, id) {
  return new Promise((resolve, reject) => {
    swisseph.swe_calc_ut(jd, id, swisseph.SEFLG_SWIEPH, (data) => {
      if (data.error) reject(new Error(data.error));
      else resolve(data);
    });
  });
}

module.exports = { fetchBodyData };

