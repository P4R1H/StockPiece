import process from 'node:process';

const clusterMiddleware = (req, res, next) => {
  // Add worker ID to response headers
  res.set('X-Worker-Id', process.pid.toString());
  next();
};

export default clusterMiddleware;