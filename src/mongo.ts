import mongoose from 'mongoose';

const mongoURI='mongodb+srv://mongo_admin:powerx@cluster0.3wmjdvj.mongodb.net/defi?retryWrites=true&w=majority'

export const mongooseConnection = mongoose.createConnection(mongoURI)
