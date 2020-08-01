/**
 * @format
 */
import { gql } from 'apollo-server-express';
import { GraphQLDateTime } from 'graphql-iso-date';

export const typeDefs = gql`
    scalar DateTime

    type Conversation {
        id: String!
        messages: [Message]!
        created: DateTime!
        updated: DateTime
    }

    type Message {
        id: String!
        from: User!
        to: User!
        subject: String
        body: String!
        sent: DateTime!
        delivered: DateTime
    }

    input MessageInput {
        from: UserInput!
        to: UserInput!
        subject: String
        body: String!
    }

    type User {
        id: String!
        firstName: String!
        lastName: String!
        email: String!
        nickname: String,
        password: String!
        contacts: [User]!
        created: DateTime!
        lastLogin: DateTime
        online: Boolean!
        refreshToken: String
        status: String
    }

    input UserInput {
        id: String!
    }

    type Query {
        findConversation(id: String!): Conversation
        findUser(id: String!): User
        findUserByEmail(email: String): User
        findUserConversations(id: String!): [Conversation]!
        searchUsers(input: String!): [User]!
    }

    type Mutation {
        addContact(userId: String!, contactId: String!): User
        addMessageToConversation(id: String!, msg: MessageInput): Conversation
        createConversation(msg: MessageInput!): Conversation
        createUser(firstName: String!, lastName: String!, email: String!, nickname: String!, password: String): User
        deleteContact(userId: String!, contactId: String!): User
        deleteConversation(id: String!): Boolean!
        deleteMessageFromConversation(conversationId: String!, msgId: String!): Boolean!
        deleteUser(id: String!): Boolean!
        editMessageInConversation(conversationId: String!, msgId: String!, body: String!): Conversation
        loginUser(email: String!, password: String!): User
        logoutUser(id: String!): User
    }
`;

export const resolvers = {
    DateTime: GraphQLDateTime,
    Query: {
        findConversation: async (src, { id }, { dataSources }) => {
            return await dataSources.mongo.findConversation(id);
        },
        findUser: async (src, { id }, { dataSources }) => {
            return await dataSources.mongo.findUser(id);
        },
        findUserByEmail: async (src, { email }, { dataSources }) => {
            return await dataSources.mongo.findUserByEmail(email);
        },
        findUserConversations: async (src, { id }, { dataSources }) => {
            return await dataSources.mongo.findUserConversations(id);
        },
        searchUsers: async (src, { input }, { dataSources }) => {
            return await dataSources.mongo.searchUsers(input);
        },
    },
    Mutation: {
        addContact: async (src, { userId, contactId }, { dataSources }) => {
            return await dataSources.mongo.addContact(userId, contactId);
        },
        addMessageToConversation: async (src, { id, msg }, { dataSources }) => {
            return await dataSources.mongo.addMessageToConversation(id, msg);
        },
        createConversation: async (src, { msg }, { dataSources }) => {
            return await dataSources.mongo.createConversation(msg);
        },
        createUser: async (src, { 
            firstName, 
            lastName, 
            email, 
            nickname, 
            password,
        }, { dataSources }) => {
            return await dataSources.mongo.createUser(
                firstName, lastName, email, nickname, password);
        },
        deleteContact: async (src, { userId, contactId }, { dataSources }) => {
            return await dataSources.mongo.deleteContact(userId, contactId);
        },
        deleteConversation: async (src, { id }, { dataSources }) => {
            return await dataSources.mongo.deleteConversation(id);
        },
        deleteMessageFromConversation: async (src, { conversationId, msgId }, { dataSources }) => {
            return await dataSources.mongo.deleteMessageFromConversation(conversationId, msgId);
        },
        deleteUser: async (src, { id }, { dataSources }) => {
            return await dataSources.mongo.deleteUser(id);
        },
        editMessageInConversation: async (src, { conversationId, msgId, body }, { dataSources }) => {
            return await dataSources.mongo.editMessageInConveration(conversationId, msgId, body);  
        },
        loginUser: async (src, { email, password }, { dataSources }) => {
            return await dataSources.mongo.loginUser(email, password);
        },
        logoutUser: async (src, { id }, { dataSources }) => {
            return await dataSources.mongo.logoutUser(id);
        },
    },
};
