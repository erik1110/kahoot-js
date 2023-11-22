const authRouter = require('./auth');
const { isAuth } = require('../middleware/auth');
/** 生成 Swagger 套件 */
const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('../swagger-output.json');

module.exports = (app) => {
    app.use('/', authRouter);
    app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));
};
