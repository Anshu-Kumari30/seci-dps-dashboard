const {UserLogs} = require("../models").models;

async function getAllAuditLogs(req, res) {
    try {
        const allUserLogs = await UserLogs.findAll();
        return res.status(200).json({
            data: allUserLogs
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
}



module.exports = { getAllAuditLogs };