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
        password: String!
        contacts: [User]!
        created: DateTime!
        lastLogin: DateTime
        online: Boolean!
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
        addMessageToConversation(id: String!, msg: MessageInput): Conversation!
        createConversation(msg: MessageInput!): Conversation!
        createUser(firstName: String!, lastName: String!, email: String!, password: String): User!
        deleteConversation(id: String!): Boolean!
        deleteMessageFromConversation(conversationId: String!, msgId: String!): Boolean!
        deleteUser(id: String!): Boolean!
        loginUser(id: String!): User!
        logoutUser(id: String!): User!
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
        addMessageToConversation: async (src, { id, msg }, { dataSources }) => {
            return await dataSources.mongo.addMessageToConversation(id, msg);
        },
        createConversation: async (src, { msg }, { dataSources }) => {
            return await dataSources.mongo.createConversation(msg);
        },
        createUser: async (src, { firstName, lastName, email, password }, { dataSources }) => {
            return await dataSources.mongo.createUser(firstName, lastName, email, password);
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
        loginUser: async (src, { id }, { dataSources }) => {
            return await dataSources.mongo.loginUser(id);
        },
        logoutUser: async (src, { id }, { dataSources }) => {
            return await dataSources.mongo.logoutUser(id);
        },
    },
};
