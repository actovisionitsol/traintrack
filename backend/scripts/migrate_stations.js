require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('../models/Station');

const uri = process.env.MONGO_URI;

async function migrate() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log("Connected.");

        // Fetch the source data
        // We know it's in the 'rail' collection (implied by previous inspection)
        // We'll access it directly via mongoose.connection.db
        const sourceCollection = mongoose.connection.db.collection('rail');

        console.log("Fetching source document...");
        // Assuming there is one big document as seen in the inspection: "Total documents: 1"
        // and it has a "data" field which is an array of arrays: [ ["CODE", "NAME"], ... ]
        const sourceDoc = await sourceCollection.findOne({});

        if (!sourceDoc || !sourceDoc.data || !Array.isArray(sourceDoc.data)) {
            console.error("Source document or data array not found!");
            return;
        }

        const rawData = sourceDoc.data;
        console.log(`Found ${rawData.length} entries. Preparing to migrate...`);

        // Prepare bulk operations for efficiency
        const bulkOps = rawData.map(entry => {
            // entry is like ["0PG-D", "Gede Darshana Zero Point"]
            if (Array.isArray(entry) && entry.length >= 2) {
                const code = entry[0];
                const name = entry[1];
                return {
                    updateOne: {
                        filter: { code: code },
                        update: { $set: { code: code, name: name } },
                        upsert: true
                    }
                };
            }
            return null;
        }).filter(op => op !== null);

        if (bulkOps.length === 0) {
            console.log("No valid entries to migrate.");
            return;
        }

        console.log("Executing bulk write...");
        const result = await Station.bulkWrite(bulkOps);
        console.log("Migration complete!");
        console.log("Matched:", result.matchedCount);
        console.log("Modified:", result.modifiedCount);
        console.log("Upserted:", result.upsertedCount);

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

migrate();
