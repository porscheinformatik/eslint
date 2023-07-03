/**
 * @fileoverview Provides custom eslint rules for Porscheinformatik
 * @author Marcel Ring
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require("requireindex");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------


// import all rules in lib/rules
module.exports = {
  configs: {
    recommended: require('../configs/recommended')
  },
  rules: requireIndex(__dirname + "/rules")
};



