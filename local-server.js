const http = require('http');
const path = require('path');
const fs = require('fs');
const ping = require('ping');
const os = require('os');
require('dotenv').config();

const server = http.createServer();

let pingTestResults = [];

const environment = process.env.NODE_ENV;

const frontendDirectoryLocation = './frontend';
const htmlFilePath = path.resolve(
  path.dirname(__filename),
  `${frontendDirectoryLocation}/index.html`
);
const cssFilePath = path.resolve(
  path.dirname(__filename),
  `${frontendDirectoryLocation}/styles.css`
);
const jsFilePath = path.resolve(
  path.dirname(__filename),
  `${frontendDirectoryLocation}/app.js`
);

const requestListener = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader('Access-Control-Allow-Private-Network', true);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    // Preflight request
    res.writeHead(200);
    res.end();
    return;
  } else if (req.url === '/' && req.method === 'GET') {
    provider(res, htmlFilePath, 'HTML', 'text/html');
  } else if (req.url === '/styles.css' && req.method === 'GET') {
    provider(res, cssFilePath, 'CSS', 'text/css');
  } else if (req.url === '/app.js' && req.method === 'GET') {
    provider(res, jsFilePath, 'JavaScript', 'application/javascript');
  } else if (req.url === '/start-ping-test' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const parsedBody = JSON.parse(body);
      runPingTest(
        parsedBody.numberOfTrials,
        parsedBody.remoteEndpointForTest,
        parsedBody.runTimeoutInMs
      );
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Ping tests running');
    });
  } else if (req.url === '/get-ping-test-results' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ pingTestResults }));
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
};

function provider(
  res,
  filepath,
  contentType,
  contentTypeHeader,
  encoding,
  contentDispositionHeader = 'inline'
) {
  fs.readFile(filepath, encoding, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error loading ${contentType}`);
    } else if (contentType === 'HTML') {
      const urlScriptTag = `<script>window.environment = '${environment}'</script>`;
      data = data
        .toString()
        .replace(
          '<script src="app.js">',
          `${urlScriptTag}\n<script src="app.js">`
        );
      res.writeHead(200, {
        'Content-Type': contentTypeHeader,
      });
      res.end(data);
    } else {
      res.writeHead(200, {
        'Content-Type': contentTypeHeader,
        'Content-Disposition': contentDispositionHeader,
      });
      res.end(data);
    }
  });
}

async function runPingTest(numberOfTrials, remoteEndpoint, runTimeoutInMs) {
  console.log(remoteEndpoint);
  remoteEndpoint = remoteEndpoint.replace('http://', '').replace(':1414', '');
  pingTestResults = [];
  let isRunning = true;

  // run timeout
  const timeout = setTimeout(() => {
    isRunning = false;
  }, runTimeoutInMs);

  for (let i = 0; i < numberOfTrials; i++) {
    if (!isRunning) {
      break;
    }
    try {
      const pingResult = await new Promise((resolve) => {
        const pingSession = ping.promise.probe(remoteEndpoint, {
          timeout: 2000,
        });

        let timeoutId = setTimeout(() => {
          resolve({
            trialNumber: pingTestResults.length + 1,
            trialTimeInMs: null,
            trialResult: 'timeout',
          });
        }, 2000);

        pingSession.then((response) => {
          clearTimeout(timeoutId);
          const result = {
            trialNumber: pingTestResults.length + 1,
            trialTimeInMs: response.time,
            trialResult: undefined,
          };
          let numBytes;
          if (os.platform() === 'win32') {
            const windowsMatch = response.output.match(
              /Reply from .* bytes=(\d+)/
            );
            if (windowsMatch) {
              numBytes = parseInt(windowsMatch[1]);
            }
          } else {
            try {
              const match = response.output.match(/(\d+) bytes from/);
              numBytes = parseInt(match[1]);
            } catch {
              numBytes = null;
            }
          }

          if (numBytes < 32 || numBytes > 96) {
            result.trialResult = 'payloadError';
          } else if (response.alive) {
            result.trialResult = 'success';
          } else if (response.time === undefined) {
            result.trialResult = 'timeout';
          } else {
            result.trialResult = 'error';
          }

          resolve(result);
        });
      });
      pingTestResults.push(pingResult);
    } catch (error) {
      const result = {
        trialNumber: pingTestResults.length + 1,
        trialResult: 'error',
        trialTimeInMs: null,
      };
      console.error(error);
      pingTestResults.push(result);
    }
  }
  clearTimeout(timeout);
}

server.on('request', requestListener);

server.listen(1010, () => {
  // const { address, port } = server.address();
  console.log(`Server running at http://localhost:1010`);
});
