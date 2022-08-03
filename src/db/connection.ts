import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongoServer = new MongoMemoryServer()

/**
 * Connect to the in-memory database.
 */
export const connect = async () => {
    await mongoServer.start()
    const uri = await mongoServer.getUri()

    const mongooseOpts = {
      autoIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    return mongoose.connect(uri, mongooseOpts)
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('Failed to connect to MongoDB', err))
}

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
}
