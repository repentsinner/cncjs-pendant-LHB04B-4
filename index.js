#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
// Note that CNCjs app build is still using socket.io v2.x 🤮, and this will fail
// to connect if we use v3.x or v4.x
import * as io from 'socket.io-client';
import jwt from 'jsonwebtoken';
import get from 'lodash.get';

const generateAccessToken = function(payload, secret, expiration) {
  const token = jwt.sign(payload, secret, {
    expiresIn: expiration,
  });

  return token;
};

// Get location of local config file
const getUserHome = function() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

/**
 * TODO: this seems to double-define defaults that are already defined
 * in bin/cncjs-pendant-xxx
 *
 * @param {object} options - The options for the function.
 * @param {function} callback - The callback function.
 */
export function serverMain(options, callback) {
  options = options || {};
  options.secret = get(options, 'secret', process.env['CNCJS_SECRET']);
  options.baudrate = get(options, 'baudrate', 115200);
  options.socketAddress = get(options, 'socketAddress', 'localhost');
  options.socketPort = get(options, 'socketPort', 8000);
  options.controllerType = get(options, 'controllerType', 'Grbl');
  options.accessTokenLifetime = get(options, 'accessTokenLifetime', '30d');

  if (!options.secret) {
    const cncrc = path.resolve(getUserHome(), '.cncrc');
    try {
      const config = JSON.parse(fs.readFileSync(cncrc, 'utf8'));
      options.secret = config.secret;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
  console.log('options', options);

  const token = generateAccessToken(
      {id: '', name: 'cncjs-pendant'},
      options.secret,
      options.accessTokenLifetime,
  );

  const url = new URL('ws://' + options.socketAddress + ':' + options.socketPort + '?token=' + token);

  const socket = io.connect('ws://' + options.socketAddress + ':' + options.socketPort, {
    'query': 'token=' + token,
  });

  socket.on('connect', () => {
    console.log('Connected to CNCjs instance at ' + url);

    // request list of serial ports
    if (options.list) {
      socket.emit('list');
      // where should the callback be handled?
      // callback(null, socket);
    };

    // Open server's serial port
    // why is this not in `serialport:doOpen` or `sender.open` or somesuch
    // namespace? The callback is `serialport:open`
    // (instead of `serialport:onOpen`)...
    if (options.port) {
      socket.emit('open', options.port, {
        baudrate: Number(options.baudrate),
        controllerType: options.controllerType,
      });
    }
  });

  socket.on('error', (_err) => {
    console.error('Error connecting to CNCjs instance at ' + url);
    if (socket) {
      socket.destroy();
      socket = null;
    }
  });

  socket.on('close', () => {
    console.log('Connection closed.');
  });

  socket.on('serialport:list', function(ports) {
    console.log(ports);

    callback(null, socket);
  });

  socket.on('serialport:open', function(options) {
    options = options || {};

    console.log(
        'Connected to port "' +
        options.port +
        '" (Baud rate: ' + options.baudrate + ')');

    callback(null, socket);
  });

  socket.on('serialport:error', function(options) {
    callback(new Error('Error opening serial port "' + options.port + '"'));
  });

  socket.on('serialport:read', function(data) {
    console.log((data || '').trim());
  });


  socket.on('serialport:write', function(data) {
    console.log((data || '').trim());
  });
};
