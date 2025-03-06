const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Dockerized Express server!');
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});