var express, server;

express = require("express");
server = express();

require("./app")(server);