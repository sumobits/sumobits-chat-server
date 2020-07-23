/**
 * @format
 * 
 */
import { stable } from 'core-js';
import { runtime } from 'regenerator-runtime/runtime';
import readline from 'readline';
import Express from 'express';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import winston from 'winston';
import {
	resolvers,
	typeDefs, 
} from './graphql';
import MongoDataSource from './graphql/datasource';

dotenv.config();

/* logging */
const loggingFormat = winston.format.printf(({
	level,
	message,
	timestamp,
}) => {
	return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
	addColors: {
		error: 'red',
		warn: 'yellow',
		info: 'cyan',
		debug: 'green',
	},
	defaultMeta: { service: 'sumobits-chat' },
	exitOnError: false,
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.timestamp(),
		loggingFormat,
	),
	level: 'debug',
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: process.env.LOGFILE_PATH || './logs/sumobits-chat.log' }) ]
});

console.debug = (...args) => {
	return logger.debug.call(logger, ...args);
};

console.error = (...args) => {
	return logger.error.call(logger, ...args);
};

console.info = (...args) => {
	return logger.info.call(logger, ...args);
};

console.log = (...args) => {
	return logger.info.call(logger, ...args);
};

console.warn = (...args) => {
	return logger.warn.call(logger, ...args);
};
/* end logging */

const dataSource = new MongoDataSource();

const apolloServer = new ApolloServer({
	dataSources: () => {
		return { mongo: dataSource };
	},
	resolvers,
	typeDefs,
});

const app = Express();
const port = process.env.HOST_PORT || 3000;

apolloServer.applyMiddleware({ app });

app.listen({ port }, async () => {
	console.log(`API Endpoint listening at: http://localhost:${port}${apolloServer.graphqlPath}`);

	process.on('SIGINT', () => {
		console.log('Caught interrupt signal');
		dataSource.close();
		process.exit();
	});
});

if (process.platform === 'win32') {
	const reader = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	reader.on('SIGINT', () => {
		process.emit('SIGINT');
	});
}
