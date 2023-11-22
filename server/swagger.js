const swaggerAutogen = require('swagger-autogen')();
// const definitions = require('./swagger-defintion');

const doc = {
    info: {
        title: 'Kahoot',
        description: 'This is kahoot.',
    },
    host: process.env.FRONTEND_URL,
    schemes: ['http', 'https'],
    tags: [
        { name: 'Auth', description: '登入相關' },
        { name: 'User', description: '使用者' },
        { name: 'Quiz', description: '測驗' },
        { name: 'Games', description: '遊戲' },
        { name: 'PlayerResults', description: '遊戲結果' },
        { name: 'Leaderboard', description: '排行榜' },
    ],
    // definitions,
    securityDefinitions: {
        // Token
        Bearer: {
            type: 'apiKey',
            in: 'header', // can be "header", "query" or "cookie"
            name: 'Authorization', // name of the header, query parameter or cookie
            description: 'JWT Token',
        },
    },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/index.js']; // 進入點/注入點，分析 router 和自動生成

swaggerAutogen(outputFile, endpointsFiles, doc);
