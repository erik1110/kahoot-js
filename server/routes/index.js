const authRouter = require('./auth');
const gameRouter = require('./game');
const leaderboardRouter = require('./leaderboard');
const playerResultRouter = require('./playerResult');
const quizRouter = require('./quiz');
const userRouter = require('./user');
const { authenticateToken, regenerateAccessToken } = require("../middleware/auth");
/** 生成 Swagger 套件 */
const swaggerUI = require('swagger-ui-express');
const swaggerFile = require('../swagger-output.json');

module.exports = (app) => {
    app.use('/api/auth', authRouter);
    app.use("/api/users", authenticateToken, userRouter);
    app.use("/api/quizes", authenticateToken, quizRouter);
    app.use("/api/games", authenticateToken, gameRouter);
    app.use("/api/playerResults", authenticateToken, playerResultRouter);
    app.use("/api/leaderboard", authenticateToken, leaderboardRouter);
    app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));
};
