const swisseph = require('swisseph');
const { DateTime } = require('luxon');

function parseUtcDateTime(birthDate, birthTime) {
  const dt = DateTime.fromISO(`${birthDate}T${birthTime}`, { zone: 'utc' });
  if (!dt.isValid) {
    throw new Error('Invalid date/time format');
  }
  return dt;
}

// Parses a *local* date+time in a specific IANA timezone and converts it to UTC.
// Example: parseZonedDateTimeToUtc('1982-11-09','06:13','America/Los_Angeles')
// returns a luxon DateTime in UTC.
function parseZonedDateTimeToUtc(localDate, localTime, timezone) {
  const dtLocal = DateTime.fromISO(`${localDate}T${localTime}`, { zone: timezone });
  if (!dtLocal.isValid) {
    throw new Error('Invalid date/time/timezone');
  }
  return dtLocal.toUTC();
}

function toJulianDayUT(dt) {
  const year = dt.year;
  const month = dt.month;
  const day = dt.day;
  const hour = dt.hour + dt.minute / 60 + dt.second / 3600;
  return swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);
}

module.exports = { parseUtcDateTime, parseZonedDateTimeToUtc, toJulianDayUT };
