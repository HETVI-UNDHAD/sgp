const http = require('http');
const data = JSON.stringify({ fullName: 'Node Test', email: 'node@test.example', password: 'pass', enrollment: '111', course: 'CS', semester: '1', college: 'X' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log('BODY:', chunk);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error('Problem with request:', e.message);
});

req.write(data);
req.end();
