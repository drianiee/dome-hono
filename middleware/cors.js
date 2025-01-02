const cors = (options) => {
    return (req, res, next) => {
    const allowedOrigin = '*';

    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigin, 
        'Access-Control-Allow-Methods': options.methods || 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': options.allowedHeaders || 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': options.credentials ? 'true' : 'false',
    };

    if (req.method === 'OPTIONS') {
        return res.status(204).set(corsHeaders).end();
    }

    res.set(corsHeaders);
    next();  
    };
};

export default cors;