const path = require( 'path' )

const util = require( 'util' )

const noop = require( 'no-op' )

const root_dir = require( 'app-root-dir' ).get()

const { EventEmitter } = require( 'events' )

// private function - internal only
const createConnection = function ()
{
  switch ( this.conf.type )
  {
    case 'udp':
    default:
      return new UNS.Connection.UDP();
    case 'tcp':
      return new UNS.Connection.TCP();
  }
}

class UNS
{
  constructor( conf )
  {
    this.conf = UNS.fn.mergeDeep(
      {
        autoConnect: true,

        connection: null,

        host: '127.0.0.1',

        port:
        {
          in: 9000,

          out: 9000
        },

        type: 'udp'
      },

      conf || {}
    )

    this.status = 'disconnected'

    EventEmitter.call( this )

    if ( this.conf.connection
      && this.conf.connection instanceof UNS.Connection )
    {
      this.connection = this.conf.connection
    }

    else
    {
      this.connection = createConnection.call( this )
    }

    this.connection.conf = UNS.fn.mergeDeep( this.conf, this.connection.conf || {} )

    // delete ref to self
    delete this.connection.conf.connection

    this.connection.on( 'error', err => this.emit( 'error', err ) )
    this.connection.on( 'message', data =>
      {
        for ( let key in data )
        {
          this.emit( key, data[ key ] )
        }
      }
    )

    if ( this.conf.autoConnect )
    {
      this.connect( err =>
        {
          if ( err )
          {
            throw err
          }


        }
      )
    }

    // process.on( 'exit', code => this.disconnect() )
  }

  get( key )
  {
    if ( this.conf.hasOwnProperty( key ) )
    {
      return this.conf[ key ]
    }

    return null
  }

  set( key, value )
  {
    this.conf[ key ] = value
  }

  connect( callback = noop )
  {
    if ( !this.connection )
    {
      return process.nextTick( callback.bind( null, [ new Error( 'INVALID_CONNECTION' ) ] ) )
      // return callback( new Error( 'INVALID_CONNECTION' ) )
    }

    if ( !( this.connection instanceof UNS.Connection ) )
    {
      return process.nextTick( callback.bind( null, [ new Error( 'INVALID_CONNECTION_TYPE' ) ] ) )
      // return callback( new Error( 'INVALID_CONNECTION_TYPE' ) )
    }

    this.connection.connect( callback )
  }

  disconnect( callback = noop )
  {
    if ( !this.connection )
    {
      this.status = 'disconnected'

      return process.nextTick( callback )
    }

    this.connection.disconnect( err =>
      {
        if ( err )
        {
          return callback( err )
        }

        this.status = 'disconnected'

        callback()
      }
    )
  }

  send( key, value, callback = noop )
  {
    if ( !this.connection )
    {
      return process.nextTick( callback.bind( null, [ new Error( 'NO_CONNECTION' ) ] ) )
      // return callback( new Error( 'NO_CONNECTION' ) )
    }

    this.connection.send( key, value, callback )
  }
}

util.inherits( UNS, EventEmitter )

UNS.logger = require( path.join( root_dir, 'src', 'logger' ) )
UNS.fn = require( path.join( root_dir, 'src', 'fn' ) )

module.exports = UNS

require( path.join( root_dir, 'src', 'connection' ) )
