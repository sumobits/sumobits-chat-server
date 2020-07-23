/**
 * @format
 */
import crypto from 'crypto';
import { uuid } from 'uuidv4';
import fs from 'fs-extra';
import path from 'path';

const CACHE_FILE = path.join(__dirname, 'data', 'cache.dat');

class Locker {

	constructor () {
		this.keyCache = new Set();

		const restoreKeyCache = () => {
			if (fs.existsSync(CACHE_FILE)) {
				const keys = fs.readFileSync(CACHE_FILE);
				if (keys) {
					keys.split('\r').forEach(key => this.keyCache.add(key));
				}
			}
		};

		const prepareKeyCache = () => {
			restoreKeyCache();

			if (this.keyCache.size < 100) {
				while (this.keyCache.size < 100) {
					this.keyCache.add(this.generateUniqueId(true));
				}
			}
		};

		this.keyCache = prepareKeyCache();
	}

    verifyKey = (key, passcode) => {
    	if (!key || !passcode) {
    		return;
    	}
    };

    generateKeypair = passcode => {
    	if (!passcode) {
    		return;
    	}

    	return crypto.generateKeyPairSync('rsa', {
    		modulusLength: 2048,
    		privateKeyEncoding: {
    			cipher: 'aes-256-cbc',
    			format: 'pem',
    			passphrase: passcode,
    			type: 'pkcs8',
    		},
    		publicKeyEncoding: {
    			format: 'pem',
    			type: 'pkcs1',
    		},
    	});
    };

    generateUniqueId = stripHyphens => {
    	const id = uuid();

    	if (stripHyphens) {
    		return id.replace(/-/g, '');
    	}

    	return id.toString();
    };
};

export default new Locker();
