#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as io from 'socket.io-client';
import jwt from 'jsonwebtoken';
import get from 'lodash.get';

const generateAccessToken = function(payload, secret, expiration) {
  const token = jwt.sign(payload, secret, {
    expiresIn: expiration,
  });

  return token;
};

// Get secret key from the config file and generate an access token
const getUserHome = function() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
};

/**
 * Description of the function.
 *
 * @param {object} options - The options for the function.
 * @param {function} callback - The callback function.
 */
export function serverMain(options, callback) {
  options = options || {};
  console.log('options', options);
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

  const token = generateAccessToken(
      {id: '', name: 'cncjs-pendant'},
      options.secret,
      options.accessTokenLifetime,
  );
  const url = 'ws://' + options.socketAddress + ':' + options.socketPort + '?token=' + token;

  const socket = io.connect('ws://' + options.socketAddress + ':' + options.socketPort, {
    'query': 'token=' + token,
  });

  socket.on('connect', () => {
    console.log('Connected to ' + url);

    // Open port
    socket.emit('open', options.port, {
      baudrate: Number(options.baudrate),
      controllerType: options.controllerType,
    });
  });

  socket.on('error', (_err) => {
    console.error('Connection error.');
    if (socket) {
      socket.destroy();
      socket = null;
    }
  });

  socket.on('close', () => {
    console.log('Connection closed.');
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
  // force callback to debug HID component
  callback(null, socket);
};
