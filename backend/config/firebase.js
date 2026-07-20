import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let db;
let isMock = false;

// Local mock database path
const LOCAL_DB_PATH = path.resolve('local_db.json');

// Helper to load mock DB
const loadMockDb = () => {
    try {
        if (fs.existsSync(LOCAL_DB_PATH)) {
            return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
        }
    } catch (err) {
        console.error('Error reading mock database:', err);
    }
    return { timetables: {}, progress: {} };
};

// Helper to save mock DB
const saveMockDb = (data) => {
    try {
        fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error saving mock database:', err);
    }
};

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey
            })
        });
        
        db = admin.firestore();
        console.log('🔥 Firebase Admin SDK initialized successfully.');
    } catch (error) {
        console.error('❌ Firebase init failed. Falling back to local database mock. Error:', error.message);
        isMock = true;
    }
} else {
    console.warn('⚠️ Missing Firebase environment variables. Using local file database fallback.');
    isMock = true;
}

// Mock Firestore Interface to prevent app crashes when credentials are not loaded
if (isMock) {
    db = {
        collection: (collectionName) => {
            return {
                doc: (docId) => {
                    return {
                        get: async () => {
                            const data = loadMockDb();
                            const docData = data[collectionName]?.[docId];
                            return {
                                exists: !!docData,
                                data: () => docData
                            };
                        },
                        set: async (docData, options) => {
                            const data = loadMockDb();
                            if (!data[collectionName]) data[collectionName] = {};
                            
                            if (options?.merge && data[collectionName][docId]) {
                                data[collectionName][docId] = {
                                    ...data[collectionName][docId],
                                    ...docData
                                };
                            } else {
                                data[collectionName][docId] = docData;
                            }
                            
                            saveMockDb(data);
                            return { id: docId };
                        },
                        update: async (updateFields) => {
                            const data = loadMockDb();
                            if (!data[collectionName]) data[collectionName] = {};
                            if (!data[collectionName][docId]) data[collectionName][docId] = {};
                            
                            data[collectionName][docId] = {
                                ...data[collectionName][docId],
                                ...updateFields
                            };
                            
                            saveMockDb(data);
                            return { id: docId };
                        }
                    };
                }
            };
        }
    };
}

export { db, isMock };
