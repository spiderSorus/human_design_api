const swisseph = require('swisseph');
const { DateTime } = require('luxon');

function parseUtcDateTime(birthDate, birthTime) {
  const dt = DateTime.fromISO(`${birthDate}T${birthTime}`, { zone: 'utc' });
  if (!dt.isValid) {
    throw new Error('Invalid date/time format');
  }
  return dt;
}

function toJulianDayUT(dt) {
  const year = dt.year;
  const month = dt.month;
  const day = dt.day;
  const hour = dt.hour + dt.minute / 60 + dt.second / 3600;
  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

module.exports = { parseUtcDateTime, toJulianDayUT };

