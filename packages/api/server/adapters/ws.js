const Adapter = require('./adapter.js')
const Middleware = require('../../middleware/native/ws.js')
const Listener = require('../listeners/ws.js')
const Primus = require('primus')
const Rooms = require('primus-redis-rooms')

class WsAdapter extends Adapter {
  constructor (config, server) {
    super(config)
    const middleware = new Middleware(config)
    const listener = new Listener(config, this)
    this.nodes = [] // Cubic nodes to contact in request handler
    this.app = new Primus(server, {
      pathname: '/ws',
      redis: {
        host: this.config.redisUrl.replace('redis://', ''),
        port: 6379,
        channel: 'ws'
      }
    })
    this.app.plugin('rooms', Rooms)
    this.app.authorize(middleware.authorize.bind(middleware))
    this.app.on('connection', listener.default.bind(listener))
    this.app.on('error', cubic.log.verbose)
  }

  async runMiddleware (req, res) {
    const done = await this.stack.run(req, res)

    if (done) {
      await this.endpoints.getResponse(req, res)
    }
  }
}

module.exports = WsAdapter
