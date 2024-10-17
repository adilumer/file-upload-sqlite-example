global.path = require("path");
global.fs = require("fs");

global.httpServerPort = 5050;

global.db = require("../lib/db");
global.dbAdapter = db.adapter;
global.Entity = require("./entity");