import moment from 'moment'
import ioredis from 'ioredis'
import redisClientConfig from '../config/redis-client-config'

const redis = new ioredis(redisClientConfig)

export default {}
