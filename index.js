const path = require( 'path' )

require( 'app-root-dir' ).set( __dirname )

const root_dir = require( 'app-root-dir' ).get()

module.exports = require( require( 'path' ).join( __dirname, 'src' ) )

// testing

const UNS = module.exports

const uns = new UNS(
  {
    autoConnect: true,

    connection: new UNS.Connection.UDP(
      {

      }
    )
  }
)

uns.connection.on( 'connected', () =>
  {
    UNS.logger.log( 'UNS connected' )
  }
)

uns.on( 'test', data =>
  {
    UNS.logger.log( data )
  }
)

setInterval( () =>
  {
    uns.send( 'test',
      {
        rand: Math.random() * 1000
      },

      err =>
      {
        if ( err )
        {
          return UNS.logger.error( err )
        }


      }
    )

    uns.send( 'test',
      {
        package: require( './package.json' )
      },

      err =>
      {
        if ( err )
        {
          return UNS.logger.error( err )
        }


      }
    )
  },

  1000
)
