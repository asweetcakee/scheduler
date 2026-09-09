const app = require('./app')
const config = require('./utils/config')
const db = require('./db')

const PORT = config.PORT || 3001
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})