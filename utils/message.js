const moment = require("moment");

const generateMessage = (from, text) => {
  return {
    from,
    text,
    createdAt: moment(new Date()).fromNow()
  };
};

const generateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    createdAt: moment(new Date()).fromNow()
  };
};

module.exports = { generateMessage, generateLocationMessage };
