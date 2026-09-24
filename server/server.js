require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('\n?? BACKEND WAS CONNECTED!');
    console.log('? Server is running on port ' + PORT + '\n');
  });
}

module.exports = app;
