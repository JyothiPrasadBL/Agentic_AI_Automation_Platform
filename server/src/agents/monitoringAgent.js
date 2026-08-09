function event(agent, eventType, message, metadata = {}, level = 'info') { return { agent, eventType, message, metadata, level }; }
module.exports = { event };
