/**
 * @format
 */
import { DataSource } from 'apollo-datasource';
import { MongoClient } from 'mongodb';
import moment from 'moment';
import Locker from '../util/locker';

const lookupUser = async (database, userId) => {
    if(!database || !userId) {
        return;
    }

    console.debug(`Looking for user: ${userId}`);
    const users = await database.collection(
        MongoDataSource.USER_COLLECTION).find({ id: { $eq: userId } }).toArray();

    return users[0];
};

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
        msg.sent = moment().format();

        try {
            const from = await lookupUser(this.database, msg.from.id);
            if (!from) {
                throw new Error(`User with id: ${msg.from.id} not found`);
            }

            msg.from = from;

            const to = await lookupUser(this.database, msg.to.id);
            if (!to) {
                throw new Error(`User with id: ${msg.to.id} not found`);
            }

            msg.to = to;

            const conversation = await this.database.collection(
                MongoDataSource.CONVERSATION_COLLECTION).findOneAndUpdate(
                    { id: { $eq: id } }, { $push: { messages: msg } }, { returnOriginal: false });

            if (conversation) {
                return conversation.value;
            }
        } catch (err) {
            console.error(`Error creating message: ${err}`);
            throw err;
        }
    }

    close = () => {
        if (this.client) {
            this.client.close();
            console.debug('Successfully closed MongoClient');
        }
    }

    connect = async () => {
        if (!this.client) {
            throw new Error('MongoCloent failed to initalize');
        } 

        try{
            await this.client.connect();
            this.database = this.client.db(this.dbName);
            console.info(`Successfully connected to: ${this.dbName}`);
        } catch(err) {
            console.error(`Error connecting to: ${this.dbName} - ${err}`);
            throw err;
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
            const from = await lookupUser(this.database, msg.from.id);
            if (!from) {
                throw new Error('Failed to locate from user');
            }

            const to = await lookupUser(this.database, msg.to.id);
            if (!to) {
                throw new Error('Failed to locate from user');
            }

            msg.from = from;
            msg.to = to;

            conversation.messages = [ msg ];

            const result = await this.database.collection(
                MongoDataSource.CONVERSATION_COLLECTION).insertOne(conversation);
            
            if (result && result.insertedCount === 1) {
                console.debug('Successfully created new conversation.');
            }

            return conversation;
        } catch(err) {
            console.error(`Error creating conversation: ${err}`);
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
            const result = await this.database.collection(
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
            const result = await this.database.collection(
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

    deleteMessageFromConversation = async (conversationId, msgId) => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            const result = await this.database.collection(
                MongoDataSource.CONVERSATION_COLLECTION).updateOne(
                    { id: conversationId }, { $pull: { 'messages': { id: { $eq: msgId } } } });

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
            const result = await this.database.collection(
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
            const conversations = await this.database.collection(
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
            const users = await this.database.collection(
                MongoDataSource.USER_COLLECTION).find({ id: { $eq: id } }).toArray();
            
            if (users) {
                return users[0];
            }
        } catch (err) {
            console.error(`Error finding user: ${err}`);
            throw err;
        }
    }

    findUserByEmail = async email => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            const users = await this.database.collection(
                MongoDataSource.USER_COLLECTION).find({ email: { $eq: email } }).toArray();
            console.log(JSON.stringify(users));
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
            return await this.database.collection(
                MongoDataSource.CONVERSATION_COLLECTION).find(
                    { $or: [ { 'messages.from.id': { $eq: id } }, { 'messages.to.id': { $eq: id } } ] }).toArray();
        } catch (err) {
            console.error(`Error finding user conversations: ${err}`);
            throw err;
        }
    }

    loginUser = async id => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            const user = await this.database.collection(
                MongoDataSource.USER_COLLECTION).findOneAndUpdate({ id }, 
                    {
                        $set: {
                            lastLogin: moment().format(), 
                            online: true 
                        } 
                    }, { returnOriginal: false });

            if (user) {
                return user.value;
            }
        } catch (err) {
            console.error(`Error logging in user: ${err}`);
            throw err;
        }
    }

    logoutUser = async id => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        try {
            const user = await this.database.collection(
                MongoDataSource.USER_COLLECTION).findOneAndUpdate({ id },
                    { $set: { online: false } }, { returnOriginal: false });

            if (user) {
                return user.value;
            }
        } catch (err) {
            console.error(`Error logging in user: ${err}`);
            throw err;
        }
    }

    searchUsers = async input => {
        if (!this.client) {
            throw new Error('MongoClient failed to initialize');
        }

        const regex = `^${input}`;
        try {
            const users = await this.database.collection(
                MongoDataSource.USER_COLLECTION).find(
                    { 
                        $or: [
                            { firstName: { $regex: regex } },
                            { lastName: { $regex: regex } },
                            { email: { $regex: regex } },
                        ]
                    }).toArray();

            return users;
        } catch (err) {
            console.error(`Error finding user: ${err}`);
            throw err;
        }        
    }
};

export default MongoDataSource;
