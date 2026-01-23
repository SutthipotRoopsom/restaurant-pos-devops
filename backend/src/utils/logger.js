const log = (level, message, meta = {}) => {
    const time = new Date().toISOString();
    console.log(JSON.stringify({ time, level, message, ...meta }));
};

module.exports = {
    info: (msg, meta) => log("INFO", msg, meta),
    error: (msg, meta) => log("ERROR", msg, meta),
};
