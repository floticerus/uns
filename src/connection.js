const util = require( 'util' )

const path = require( 'path' )

const root_dir = require( 'app-root-dir' ).get()

const noop = require( 'no-op' )

const { EventEmitter } = require( 'events' )

const UNS = require( path.join( root_dir, 'src' ) )

UNS.Connection = function ( conf )
{
  this.conf = UNS.fn.mergeDeep(
    {
      // set to override default send host
      host: null,

      port:
      {
        // set to override default server listen port
        in: null,

        // set to override default server send port
        out: null
      },

      // refresh rate in milliseconds
      rate: 1000 / 20,

      // rate:
      // {
      //   int: 1000 / 60,
      //
      //   out: 1000 / 60
      // },

      // method for communication
      transport: null,

      // enum type (udp, tcp, etc)
      type: null
    },

    conf || {}
  )

  // // set and check
  // if ( !( this.server = this.conf.server ) )
  // {
  //   throw new Error( 'CONNECTION_SERVER_REF_REQUIRED' )
  // }

  // // set and check
  // if ( !( this.type = this.conf.type ) )
  // {
  //   throw new Error( 'CONNECTION_TYPE_REQUIRED' )
  // }

  this.transport = this.conf.transport

  // if transport is a function, execute it.
  // must be synchronous
  if ( typeof this.transport === 'function' )
  {
    this.transport = this.transport()
  }

  if ( !this.transport )
  {
    throw new Error( 'CONNECTION_TRANSPORT_REQUIRED' )
  }

  EventEmitter.call( this )

  // udp stack
  this.stack = {}
  this.stack.in = Buffer.alloc( 0 )
  this.stack.out = Buffer.alloc( 0 )
  this.stack.interval = {}
  this.stack.interval.in = null
  this.stack.interval.out = null

  process.nextTick( this.init.bind( this ) )
}

UNS.Connection.prototype.init = function ()
{
  // if ( this.conf.server
  //   && this.conf.server instanceof UNS )
  // {
  //   // this.on( 'connected', data => this.conf.server.emit( 'connected', data ) )
  //   //
  //   // this.on( 'disconnected', data => this.conf.server.emit( 'disconnected', data ) )
  //
  //   this.on( 'error', err => this.conf.server.emit( 'error', err ) )
  //
  //   this.on( 'message', data =>
  //     {
  //       for ( let key in data )
  //       {
  //         this.conf.server.emit( key, data[ key ] )
  //       }
  //     }
  //   )
  // }
}

UNS.Connection.prototype.connect = function ( callback = noop )
{

}

UNS.Connection.prototype.disconnect = function ( callback = noop )
{

}

UNS.Connection.prototype.send = function ( key, value, callback = noop )
{

}

UNS.Connection.prototype.processIncomingStack = function ( callback = noop )
{
  if ( this.stack.in.length < 4 )
  {
    // UNS.logger.log( 'Incoming stack is empty' )

    return process.nextTick( callback )
  }

  let len = this.stack.in.slice( 0, 4 ).readUInt32LE( 0 )

  let message = this.stack.in.slice( 4, 4 + len )

  if ( message.length < len )
  {
    UNS.logger.log( 'Not enough data to process' )

    return process.nextTick( callback )
  }

  // UNS.logger.log( 'Got data: ' + message.toString( 'utf-8' ) )

  let data, err

  try
  {
    data = JSON.parse( message.toString( 'utf-8' ) )
  }

  catch ( e )
  {
    err = e
  }

  if ( err )
  {
    UNS.logger.error( err )

    return process.nextTick( callback.bind( null, [ new Error( 'INVALID_DATA' ) ] ) )
    // return callback( err )
  }

  if ( !data )
  {
    return process.nextTick( callback.bind( null, [ new Error( 'INVALID_DATA' ) ] ) )
    // return callback( new Error( 'INVALID_DATA' ) )
  }

  this.emit( 'message', data )

  this.stack.in = this.stack.in.slice( 4 + len )

  // try to avoid sync death
  process.nextTick( this.processIncomingStack.bind( this, callback ) )
}

UNS.Connection.prototype.processOutgoingStack = function ( callback = noop )
{
  if ( !this.stack.out.length )
  {
    return // stack is empty
  }


}

UNS.Connection.prototype.getIncomingPort = function ()
{
  return parseInt( this.conf.port.in )
}

UNS.Connection.prototype.getOutgoingPort = function ()
{
  return parseInt( this.conf.port.out )
}

UNS.Connection.prototype.getHost = function ()
{
  return this.conf.host // || this.server.conf.host
}

util.inherits( UNS.Connection, EventEmitter )

module.exports = UNS.Connection

// load connections
require( path.join( root_dir, 'src', 'connections' ) )
