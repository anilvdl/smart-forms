import moment from "moment-timezone";

export const timeZoneOptions = moment.tz.names().map((tz) => ({
  value: tz,
  label: `(UTC${moment.tz(tz).format("Z")}) ${tz}`,
}));
