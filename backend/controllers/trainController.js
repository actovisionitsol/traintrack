const axios = require('axios');
const https = require('https');

const RAIL_BASE = process.env.RAIL_BASE;

// Force IPv4 to avoid DNS issues with IPv6
// Force IPv4 to avoid DNS issues with IPv6
// const httpsAgent = new https.Agent({ family: 4 }); // Removing global agent to avoid reuse issues causing timeouts

// Helper 1: Train Details (Loco Search)
function parseLocoDetails(respJson) {
    const out = { ok: false };
    try {
        if (!respJson) return out;
        out.ok = !!respJson.ok;
        out.trainNo = respJson.trainNo || null;
        out.currentDate = respJson.params?.currentDate || null;

        // Return all rows for the table
        out.spottings = Array.isArray(respJson.rows) ? respJson.rows : [];

        const firstRow = Array.isArray(respJson.rows) && respJson.rows.length > 0 ? respJson.rows[0] : null;
        if (firstRow) {
            out.loco_no = firstRow.loco_no || null;
            out.spotting_time = firstRow.spotting_time || null;
            out.spotting_station = firstRow.spotting_station || null;
            out.type = firstRow.type || null;
            out.base_shed = firstRow.base_shed || null;
            out.owning_rly = firstRow.owning_rly || null;
            out.spotting_zone = firstRow.spotting_zone || null;
            out.spotting_div = firstRow.spotting_div || null;
        }
    } catch (e) {
        out.ok = false;
        out.error = e.message;
    }
    return out;
}

// Helper 2: Loco Position (Map Data)
function parseLocoPosition(respJson) {
    const out = { ok: false };
    try {
        const raw = respJson.data;
        if (raw) {
            out.ok = true;
            out.lat = raw.lat ? parseFloat(raw.lat) : null;
            out.lng = raw.lon ? parseFloat(raw.lon) : null;
            out.specs = {
                loco_no: raw.loco_no,
                type: raw.type,
                owning_rly: raw.owning_rly,
                base_shed: raw.base_shed,
                traction: raw.traction,
                domain: raw.domain,
                service: raw.service,      // New
                zone: raw.zone,            // New
                division: raw.division,    // New
                train_no: raw.train_no,
                start_date: raw.start_date,
                status: raw.status,
                last_event: raw.last_event
            };
            out.location = raw.location;
        }
    } catch (e) { out.ok = false; }
    return out;
}

// Helper 3: Train Master Info (Name, Type, etc.)
function parseTrainInfo(respJson) {
    const out = { ok: false };
    try {
        // The API returns data: [ { ... }, { ... } ]
        if (respJson && respJson.data && respJson.data.length > 0) {
            const row = respJson.data[0]; // Take the first match
            out.ok = true;
            out.trainName = row.TRAIN_NAME;
            out.owningRly = row.OWNING_RLY;
            out.trainType = row.TRAIN_TYPE;
            out.src = row.TRAIN_SRC;
            out.dstn = row.TRAIN_DSTN;
        }
    } catch (e) {
        out.ok = false;
        out.error = e.message;
    }
    return out;
}

exports.getTrainDetails = async (req, res) => {
    try {
        const { trainNo, date } = req.query;
        const url = `${RAIL_BASE}/fetch_loco_details.php?trainNo=${trainNo}&date=${date}`;
        const resp = await axios.get(url, {
            timeout: 20000,
            httpsAgent: new https.Agent({ family: 4 })
        });
        return res.json(parseLocoDetails(resp.data));
    } catch (err) { return res.status(500).json({ error: err.message }); }
};

exports.getTrainInfo = async (req, res) => {
    try {
        const { trainNo } = req.query;
        const url = `${RAIL_BASE}/fetch_trainmaster.php?train_no=${trainNo}`;
        const resp = await axios.get(url, {
            timeout: 20000,
            httpsAgent: new https.Agent({ family: 4 })
        });
        return res.json(parseTrainInfo(resp.data));
    } catch (err) { return res.json({ ok: false }); }
};

exports.getLocoPosition = async (req, res) => {
    try {
        const locoNo = req.query.locoNo;
        const url = `${RAIL_BASE}/fetch_loco_position.php?loco_no=${encodeURIComponent(locoNo)}`;
        const resp = await axios.get(url, { timeout: 20000, httpsAgent: new https.Agent({ family: 4 }) });
        return res.json(parseLocoPosition(resp.data));
    } catch (err) { return res.status(500).json({ error: err.message }); }
};

exports.getCoachComposition = async (req, res) => {
    try {
        const { trainNo } = req.query;
        // Using the URL provided by the user
        const url = `https://railjournal.in/RailRadar/Train/fetch_cc.php/${trainNo}`;
        // The user's example showed a direct JSON response, so we just proxy it.
        // We might need to handle headers if the external API requires them, but for now we'll try simple GET.
        const resp = await axios.get(url, { timeout: 20000, httpsAgent: new https.Agent({ family: 4 }) });
        return res.json(resp.data);
    } catch (err) {
        console.error("Coach Composition Error:", err.message);
        // Return a safe error structure so frontend doesn't crash
        return res.status(500).json({ error: "Failed to fetch coach composition", details: err.message });
    }
};

exports.getDelayAnalysis = async (req, res) => {
    try {
        const { trainNo, startDate } = req.query;
        // The external API expects startDate in "dd mm yyyy" format (e.g., "25 11 2025")
        // We might receive it as "yyyy-mm-dd" or "dd-mm-yyyy" from frontend, so let's ensure it's formatted correctly if needed.
        // However, the user request example shows "25 11 2025" in the URL.
        // Let's assume the frontend sends it in a compatible format or we just pass it through if it's already encoded.

        // If the frontend sends "25-11-2025", we might need to replace '-' with '%20' or space.
        // Let's just pass the raw string if the user handles formatting, or do a quick replace.
        // The user example: startDate=25%2011%202025

        const formattedDate = startDate.replace(/-/g, ' '); // Simple replacement if it comes as dd-mm-yyyy

        const url = `https://railjournal.in/RailRadar/get_delay_analysis.php?trainNo=${trainNo}&startDate=${encodeURIComponent(formattedDate)}`;

        const resp = await axios.get(url, { timeout: 12000, httpsAgent: new https.Agent({ family: 4 }) });
        return res.json(resp.data);
    } catch (err) {
        console.error("Delay Analysis Error:", err.message);
        return res.status(500).json({ error: "Failed to fetch delay analysis", details: err.message });
    }
};

exports.getLiveTrainStatus = async (req, res) => {
    try {
        const { trainNo, startDate } = req.query;
        // API expects start_date in format dd-MMM-yy (e.g. 27-Nov-25)
        const url = `https://railjournal.in/RailRadar/fetch_traininfo.php?trainNo=${trainNo}&start_date=${startDate}`;

        // We need to be careful with headers. Sometimes these PHP scripts require specific headers.
        // But based on the user request, it seems like a simple GET.
        const resp = await axios.get(url, {
            timeout: 20000,
            httpsAgent: new https.Agent({ family: 4 }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        return res.json(resp.data);
    } catch (err) {
        console.error("Live Train Status Error:", err.message);
        return res.status(500).json({ error: "Failed to fetch live train status", details: err.message });
    }
};

exports.getTrainSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        const url = `https://railjournal.in/RailRadar/fetch_train_number_suggestion.php?query=${encodeURIComponent(query)}`;

        const resp = await axios.get(url, {
            timeout: 10000,
            httpsAgent: new https.Agent({ family: 4 }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        return res.json(resp.data);
    } catch (err) {
        console.error("Train Suggestions Error:", err.message);
        return res.status(500).json({ error: "Failed to fetch train suggestions", details: err.message });
    }
};

exports.getSeatAvailability = async (req, res) => {
    try {
        const { trainNo, src, dst, classes, date } = req.query;
        // API URL: https://railjournal.in/RailRadar/Train/fetch_availability.php?trainNo=12259&src=SDAH&dst=BKN&classes=1A&date=18-12-2025
        const url = `https://railjournal.in/RailRadar/Train/fetch_availability.php?trainNo=${trainNo}&src=${src}&dst=${dst}&classes=${classes}&date=${date}`;

        const resp = await axios.get(url, {
            timeout: 20000,
            httpsAgent: new https.Agent({ family: 4 }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        return res.json(resp.data);
    } catch (err) {
        console.error("Seat Availability Error:", err.message);
        // Return a safe error so frontend handles it gracefully
        return res.status(500).json({ error: "Failed to fetch seat availability", details: err.message });
    }
};

exports.getLiveStation = async (req, res) => {
    try {
        const { stationCode } = req.query;
        // https://railradar.in/api/v1/stations/HWH/live?hours=2
        const url = `https://railradar.in/api/v1/stations/${stationCode}/live?hours=4`; // Using 4 hours to get more data, user said "hours=2" in URL example but maybe we want more? I'll stick to 2 as per URL example if strictly needed, but 4 is usually better for boards. Let's stick to 2 as per user request example: https://railradar.in/api/v1/stations/HWH/live?hours=2
        // Actually, let's use 2 as per the prompt's URL example.
        const url2 = `https://railradar.in/api/v1/stations/${stationCode}/live?hours=2`;

        const resp = await axios.get(url2, {
            timeout: 20000,
            httpsAgent: new https.Agent({ family: 4 }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        return res.json(resp.data);
    } catch (err) {
        console.error("Live Station Error:", err.message);
        return res.status(500).json({ error: "Failed to fetch live station data", details: err.message });
    }
};
