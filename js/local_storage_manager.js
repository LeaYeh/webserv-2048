window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function LocalStorageManager() {
  this.bestScoreKey     = "bestScore";
  this.gameStateKey     = "gameState";

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";

  try {
    var storage = window.localStorage;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'bestScore') return parseInt(value, 10) || 0;
  }
  return 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  document.cookie = `bestScore=${score}; path=/`;
  this.updateStateOnServer();
};

LocalStorageManager.prototype.updateStateOnServer = async function () {
  const bestScore = this.getBestScore();

  try {
    const response = await fetch('/update-2048-state', {
      method: 'POST',
    });

    if (response.ok) {
      console.log('Best score updated on the server!');
    } else {
      console.error('Failed to update best score on the server:', response.statusText);
    }
  } catch (error) {
    console.error('Error while updating best score on the server:', error);
  }
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === this.gameStateKey) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (error) {
        console.error('Failed to parse game state from cookie:', error);
        return null;
      }
    }
  }
  return null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  try {
    const stateJSON = encodeURIComponent(JSON.stringify(gameState));
    document.cookie = `${this.gameStateKey}=${stateJSON}; path=/`;
    this.updateStateOnServer();
  } catch (error) {
    console.error('Failed to save game state to cookie:', error);
  }
};

LocalStorageManager.prototype.clearGameState = function () {
  document.cookie = `${this.gameStateKey}=; path=/`;
};