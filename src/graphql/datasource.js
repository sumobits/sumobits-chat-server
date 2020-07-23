/**
 * @format
 */
import { DataSource } from 'apollo-datasource';
import { MongoClient } from 'mongodb';
import moment from 'moment';
import Locker from '../util/locker';

class MongoDataSource extends DataSource {
    static USER_COLLECTION = 'user';
    static CONVERSATION_COLLECTION = 'conversation';

    constructor () {
        super();
        const url = process.env.MONGODB_URL || 'mongodb://localhost:27017/sumobits_chat';
        this.dbName = process.env.MONGO_DBNAME || 'chat';
        this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    addMessageToConversation = async (id, msg) => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        msg.id = Locker.generateUniqueId(false);
        msg.sent = moment();

        let conversation;

        try {
            await this.client.connect();

            const database = this.client.db(this.dbName);
            return await database.collection(MongoDataSource.conversation).findOneAndUpdate(
                { id }, { $addToSet: { messages: [ msg ] } }, { 
                    returnOriginal: false, 
                    upsert: true
                });
        } catch (err) {
            console.error(`Error creating message: ${err}`);
            throw err;
        }
    }

    close = () => {
        if(this.client) {
            this.client.close();
            console.debug('Successfully closed MongoClient');
        }
    }

    createConversation = async msg => {
        if(!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        msg.id = Locker.generateUniqueId(false);
        msg.sent = moment().format();

        const conversation = {
            id: Locker.generateUniqueId(false),
            created: moment().format(),
        };

        try {
            await this.client.connect();

            const database = this.client.db(this.dbName);            
            
            const from = await database.collection(
                MongoDataSource.USER_COLLECTION).findOne({ id: { $eq: msg.from.id } });
            if (!from) {
                throw new Error('Failed to locate from user');
            }

            const to = await database.collection(
                MongoDataSource.USER_COLLECTION).findOne({ id: { $eq: msg.to.id } });
            if (!to) {
                throw new Error('Failed to locate from user');
            }

            msg.from = from;
            msg.to = to;

            conversation.messages = [ msg ];

            const result = await database.collection(
                MongoDataSource.CONVERSATION_COLLECTION).insertOne(conversation);
            
            if (result && result.insertedCount === 1) {
                console.debug('Successfully created new conversation.');
            }

            return conversation;
        } catch(err) {
            console.error(`Error creating message: ${err}`);
            throw err;
        }
    }

    createUser = async (firstName, lastName, email, password) => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        const user = {
            id: Locker.generateUniqueId(false),
            firstName,
            lastName,
            email,
            password,
            created: moment().format(),
            online: false,
        };

        try {
            await this.client.connect();

            const database = this.client.db(this.dbName);
            const result = await database.collection(
                MongoDataSource.USER_COLLECTION).insertOne(user);

            if (result && result.insertedCount === 1) {
                console.debug('Successfully created new user');
            }

            return user;
        } catch (err) {
            console.error(`Error creating user: ${err}`);
            throw err;
        }
    }

    deleteConversation = async id => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            await this.client.connect();

            const database = this.client.db(this.dbName);
            const result = await database.collection(
                MongoDataSource.CONVERSATION_COLLECTION).deleteOne({ id });

            if (result && result.deletedCount === 1) {
                console.debug('Successfully deleted conversation');
            }

            return true;
        } catch (err) {
            console.error(`Error deleting coversation: ${err}`);
            throw err;
        }
    }

    deleteUser = async id => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            await this.client.connect();

            const database = this.client.db(this.dbName);
            const result = await database.collection(
                MongoDataSource.USER_COLLECTION).deleteOne({ id });

            if (result && result.deletedCount === 1) {
                console.debug('Successfully deleted user');
            }

            return true;
        } catch (err) {
            console.error(`Error deleting user: ${err}`);
            throw err;
        }
    }

    findConversation = async id => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            await this.client.connect();

            const database = this.client.db(this.dbName);
            const conversations = await database.collection(
                MongoDataSource.CONVERSATION_COLLECTION).find({ id: { $eq: id } }).toArray();
            
            if(conversations) {
                return conversations[0];
            }
        } catch (err) {
            console.error(`Error finding conversation: ${err}`);
            throw err;
        }
    }

    findUser = async id => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            await this.client.connect();

            const database = this.client.db(this.dbName);
            const users = await database.collection(
                MongoDataSource.USER_COLLECTION).find({ id: { $eq: id } }).toArray();
            
            if (users) {
                return users[0];
            }
        } catch (err) {
            console.error(`Error finding user: ${err}`);
            throw err;
        }
    }

    findUserConversations = async id => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            await this.client.connect();

            const database = this.client.db(this.dbName);
            return await database.collection(MongoDataSource.CONVERSATION_COLLECTION).find($or[
                { 'messages.from.id': { $eq: id } }, { 'messages.to.id': { $eq: id } } ]).toArray();
        } catch (err) {
            console.error(`Error finding user conversations: ${err}`);
            throw err;
        }
    }
};

export default MongoDataSource;
