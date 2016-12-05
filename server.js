'use strict';

var ftpd = require('./ftpd');

/**
 * [users description]
 * @type {Object}
 * permissions:
 *   M => mkdir
 *   R => removedir
 *   U => upload
 *   D => download
 *   L => List
 */
var users = {
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
        'permissions': 'LD',
    },
};

function makeServer(options) {
    users = options.users;
    var server = new ftpd.FtpServer(options.host, {
        getInitialCwd: function() {
            return options.cwd || '/';
        },
        getRoot: function() {
            return options.root || process.cwd();
        },
        pasvPortRangeStart: 1025,
        pasvPortRangeEnd: 1050,
        tlsOptions: options.tls,
        allowUnauthorizedTls: false,
        useWriteFile: false,
        useReadFile: false,
        uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
    });

    server.on('error', function(error) {
        console.log('FTP Server error:', error);
    });

    server.on('client:connected', function(connection) {
        var username = null;
        console.log('client connected: ' + connection.remoteAddress);
        connection.on('command:user', function(user, success, failure) {
            console.log(user);
            console.log(users);
            if (users.hasOwnProperty(user)) {
                username = user;
                success();
            } else {
                failure();
            }
        });

        connection.on('command:pass', function(pass, success, failure) {
            console.log(users[username]);
            if (users[username].pass === pass) {
                success(username);
            } else {
                failure();
            }
        });

        connection.on('command:mkd:before', function(mkdirRequest, success, failure) {
            if (users[username].permissions === '*' || users[username].permissions.includes('M')) {
                success();
            } else {
                failure('No permission');
            }
        });

        connection.on('command:rmd:before', function(rmdirRequest, success, failure) {
            if (users[username].permissions === '*' || users[username].permissions.includes('R')) {
                success();
            } else {
                failure('No permission');
            }
        });

        connection.on('command:list:before', function(listRequest, success, failure) {
            if (users[username].permissions === '*' || users[username].permissions.includes('L')) {
                success();
            } else {
                failure('No permission');
            }
        });
    });

    server.debugging = 4;
    return server;
}

module.exports = {
    makeServer: makeServer,
};
