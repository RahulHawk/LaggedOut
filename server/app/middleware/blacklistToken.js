const blacklistedTokens = new Map();

const addToken = (token, expiresAt) => {
  blacklistedTokens.set(token, expiresAt);
};

const isBlacklisted = (token) => {
  const expiry = blacklistedTokens.get(token);
  if (!expiry) return false;

  if (Date.now() > expiry) {
    blacklistedTokens.delete(token); 
    return false;
  }

  return true;
};

module.exports = { addToken, isBlacklisted };
