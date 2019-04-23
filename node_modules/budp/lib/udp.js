/*!
 * udp.js - udp backend for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

/* eslint prefer-arrow-callback: "off" */

'use strict';

const EventEmitter = require('events');
const dgram = require('dgram');

/**
 * Socket
 * @extends EventEmitter
 */

class Socket extends EventEmitter {
  /**
   * Create a UDP socket.
   * @constructor
   * @param {Function?} handler
   */

  constructor(socket) {
    super();

    this.socket = socket;
    this._reject = null;

    this.socket.on('close', () => {
      this.emit('close');
    });

    this.socket.on('error', (err) => {
      const reject = this._reject;

      if (reject) {
        this._reject = null;
        reject(err);
        return;
      }

      this.emit('error', err);
    });

    this.socket.on('listening', () => {
      this.emit('listening', this.address());
    });

    this.socket.on('message', (msg, rinfo) => {
      this.emit('message', msg, rinfo);
    });
  }

  addMembership(addr, iface) {
    this.socket.addMembership(addr, iface);
    return this;
  }

  address() {
    return this.socket.address();
  }

  async bind(...args) {
    return new Promise((resolve, reject) => {
      this._reject = reject;

      args.push(() => {
        this._reject = null;
        resolve(this.address());
      });

      try {
        this.socket.bind(...args);
      } catch (e) {
        this._reject = null;
        reject(e);
      }
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      this._reject = reject;

      const cb = () => {
        this._reject = null;
        resolve();
      };

      try {
        this.socket.close(cb);
      } catch (e) {
        this._reject = null;
        reject(e);
      }
    });
  }

  dropMembership(addr, iface) {
    this.socket.dropMembership(addr, iface);
    return this;
  }

  getRecvBufferSize() {
    if (!this.socket.getRecvBufferSize)
      return 512;
    return this.socket.getRecvBufferSize();
  }

  getSendBufferSize() {
    if (!this.socket.getSendBufferSize)
      return 512;
    return this.socket.getSendBufferSize();
  }

  hasBufferSize() {
    return typeof this.socket.setRecvBufferSize === 'function';
  }

  ref() {
    this.socket.ref();
    return this;
  }

  async send(...args) {
    return new Promise((resolve, reject) => {
      const cb = (err) => {
        if (err)
          this.emit('error', err);
        resolve();
      };

      try {
        this.socket.send(...args, cb);
      } catch (e) {
        this.emit('error', e);
      }
    });
  }

  setBroadcast(flag) {
    this.socket.setBroadcast(flag);
    return this;
  }

  setMulticastInterface(iface) {
    if (this.socket.setMulticastInterface)
      this.socket.setMulticastInterface(iface);
    return this;
  }

  setMulticastLoopback(flag) {
    this.socket.setMulticastLoopback(flag);
    return this;
  }

  setMulticastTTL(ttl) {
    this.socket.setMulticastTTL(ttl);
    return this;
  }

  setRecvBufferSize(size) {
    if (this.socket.setRecvBufferSize)
      this.socket.setRecvBufferSize(size);
    return this;
  }

  setSendBufferSize(size) {
    if (this.socket.setSendBufferSize)
      this.socket.setSendBufferSize(size);
    return this;
  }

  setTTL(ttl) {
    this.socket.setTTL(ttl);
    return this;
  }

  unref() {
    this.socket.unref();
    return this;
  }
}

/*
 * Constants
 */

exports.unsupported = false;

/**
 * Create a UDP socket.
 * @param {Object|String} options
 * @param {Function} cb
 * @returns {Object}
 */

exports.createSocket = function createSocket(options, cb) {
  const socket = dgram.createSocket(options, cb);
  return new Socket(socket);
};
