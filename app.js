const express = require('express')
const app = express();
require('dotenv').config()
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')
const initRoutes = require('./routes');

const PORT = process.env.PORT || 3000

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', '*']
}))

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

initRoutes(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`)
})

module.exports = app;