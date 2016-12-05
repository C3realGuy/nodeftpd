'use strict';

var ftpServer = require('./server.js');
var Path = require('path');

var options = {
  users: {
    'testA': {
      'pass': 'test123',
      'permissions': '*',
    },
    'testB': {
      'pass': '1337pa$$',
      'permissions': 'MRUD',
    },
    'testC': {
      'pass': 'test',
      'permissions': 'D',
    },
  },
  host: process.env.IP || '127.0.0.1',
  port: process.env.PORT || 7002,
  useList: true,
  cwd: '/',
  root: Path.join(process.cwd(), 'testhome'),
  tls: null,
};

var _server = ftpServer.makeServer(options);
_server.listen(options.port);
