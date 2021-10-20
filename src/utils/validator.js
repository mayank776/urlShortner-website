regex = /^(ftp|http|https):\/\/[^ "]+$/;

const validateUrl = function (url) {
  return regex.test(url);
};

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

module.exports = {
  validateUrl,
  isValid,
  isValidRequestBody,
};
