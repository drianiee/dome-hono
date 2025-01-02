const { getDashboardSummary } = require('../services/dashboardService'); 

const getDashboardSummaryController = async (req, res) => {
    try {
        const roleId = req.user.id_roles; 
        const dashboardSummary = await getDashboardSummary(roleId); 
        console.log('Successfully retrieved dashboard summary.');
        res.json({ dashboardSummary });
    } catch (error) {
        console.error('Error retrieving dashboard summary:', error);
        res.status(500).json({ error: 'Error retrieving dashboard summary' });
    }
};

module.exports = {
    getDashboardSummaryController
};
