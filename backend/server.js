require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log('================================================');
  console.log(`🚀  GovAI Backend Server`);
  console.log(`🌐  Running on: http://localhost:${PORT}`);
  console.log(`📊  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖  AI Provider: ${process.env.AI_PROVIDER || 'groq'}`);
  console.log('================================================');
});
