const Station = require('../models/Station');

exports.searchStations = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.length < 2) {
            return res.json({ success: true, results: [] });
        }

        // Case-insensitive regex search
        const regex = new RegExp(query, 'i');

        // Find matches in either code or name
        // Limit to 10 for performance
        const stations = await Station.find({
            $or: [
                { code: regex },
                { name: regex }
            ]
        })
            .select('code name -_id') // Return only code and name
            .limit(10)
            .sort({ name: 1 }); // Sort alphabetically

        return res.json({ success: true, results: stations });

    } catch (err) {
        console.error("Search Error:", err);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
