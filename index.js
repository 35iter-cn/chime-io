const path = require("path");
const { pathToFileURL } = require("url");

const api = require("./src");

// OpenCode may load this package via require() (exports.require -> this file).
// The loader expects `module.exports.default` to be the async plugin function.
api.default = async (ctx) => {
  const url = pathToFileURL(
    path.join(__dirname, "plugins", "opencode-telegram.mjs"),
  ).href;
  const { default: plugin } = await import(url);
  return plugin(ctx);
};

module.exports = api;
