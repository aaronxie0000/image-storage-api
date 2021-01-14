const bcrypt = require("bcrypt");

async function checkAuth(isPrivate, attemptCode, correctCode) {
  if (!isPrivate) return true;

  const match = await bcrypt.compare(attemptCode, correctCode);

  return match;
}

module.exports.checkAuth = checkAuth;
