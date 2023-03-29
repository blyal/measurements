const http = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const server = http.createServer();

const isDev = process.env.NODE_ENV === 'development';
const serverUrl = isDev ? 'http://localhost:1414' : 'http://4.196.218.4:1414';

const fileSizeInBytes = 513024;

const textFilePath = path.resolve(__dirname, './random.txt');
const summaryDataFilePath = path.resolve(__dirname, './summaryData.csv');
const icmpDataFilePath = path.resolve(__dirname, './icmpData.csv');
const uplinkDataFilePath = path.resolve(__dirname, './uplinkData.csv');
const downlinkDataFilePath = path.resolve(__dirname, './downlinkData.csv');

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
  res.setHeader('Connection', 'close');
  if (req.method === 'OPTIONS') {
    // Preflight request
    res.writeHead(200);
    res.end();
    return;
  } else if (req.url === '/get-file' && req.method === 'GET') {
    provider(res, textFilePath, 'text file', 'text/plain', 'utf8');
  } else if (req.url === '/download-summary-data' && req.method === 'GET') {
    provider(
      res,
      summaryDataFilePath,
      'CSV file',
      'text/csv',
      null,
      'attachment; filename="summaryData.csv'
    );
  } else if (req.url === '/download-icmp-data' && req.method === 'GET') {
    provider(
      res,
      icmpDataFilePath,
      'CSV file',
      'text/csv',
      null,
      'attachment; filename="icmpData.csv'
    );
  } else if (req.url === '/download-uplink-data' && req.method === 'GET') {
    provider(
      res,
      uplinkDataFilePath,
      'CSV file',
      'text/csv',
      null,
      'attachment; filename="uplinkData.csv'
    );
  } else if (req.url === '/download-downlink-data' && req.method === 'GET') {
    provider(
      res,
      downlinkDataFilePath,
      'CSV file',
      'text/csv',
      null,
      'attachment; filename="downlinkData.csv'
    );
  } else if (req.url === '/uplink' && req.method === 'POST') {
    let body = [];
    req
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        console.log(`Received file of size: ${body.length}`);
        if (body.length !== fileSizeInBytes) {
          console.log('File received was wrong size');
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Wrong file size');
        }
        res.end('File uploaded');
      });
  } else if (req.url === '/append-data' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!fs.existsSync('summaryData.csv')) {
        const header = `${summaryDataColumnTitles.testLabel},${summaryDataColumnTitles.remoteEndpoint},${summaryDataColumnTitles.remoteEndpointLocation},${summaryDataColumnTitles.testingLocation},${summaryDataColumnTitles.typeOfService},${summaryDataColumnTitles.operator},${summaryDataColumnTitles.testLocalStartTime},${summaryDataColumnTitles.timeElapsed},${summaryDataColumnTitles.ICMPTrialsAttempted},${summaryDataColumnTitles.successfulICMPTrials},${summaryDataColumnTitles.latency},${summaryDataColumnTitles.minRTT},${summaryDataColumnTitles.maxRTT},${summaryDataColumnTitles.packetLossRatio},${summaryDataColumnTitles.advertisedDataRate},${summaryDataColumnTitles.httpUpTrialsAttempted},${summaryDataColumnTitles.successfulHttpUpTrials},${summaryDataColumnTitles.meanSuccessHttpUpTime},${summaryDataColumnTitles.minSuccessHttpUpTime},${summaryDataColumnTitles.maxSuccessHttpUpTime},${summaryDataColumnTitles.uplinkThroughput},${summaryDataColumnTitles.uplinkUnsuccessfulFileAccess},${summaryDataColumnTitles.httpDownTrialsAttempted},${summaryDataColumnTitles.successfulHttpDownTrials},${summaryDataColumnTitles.meanSuccessHttpDownTime},${summaryDataColumnTitles.minSuccessHttpDownTime},${summaryDataColumnTitles.maxSuccessHttpDownTime},${summaryDataColumnTitles.downlinkThroughput},${summaryDataColumnTitles.downlinkUnsuccessfulFileAccess}\n`;
        fs.writeFileSync('summaryData.csv', header);
      }
      if (!fs.existsSync('icmpData.csv')) {
        const header = `${trialColumnTitles.testLabel},${summaryDataColumnTitles.remoteEndpoint},${summaryDataColumnTitles.remoteEndpointLocation},${summaryDataColumnTitles.testingLocation},${summaryDataColumnTitles.typeOfService},${summaryDataColumnTitles.operator},${trialColumnTitles.testLocalStartTime},${trialColumnTitles.trialNumber},${trialColumnTitles.trialResult},${trialColumnTitles.trialTimeInMs}\n`;
        fs.writeFileSync('icmpData.csv', header);
      }
      if (!fs.existsSync('uplinkData.csv')) {
        const header = `${trialColumnTitles.testLabel},${summaryDataColumnTitles.remoteEndpoint},${summaryDataColumnTitles.remoteEndpointLocation},${summaryDataColumnTitles.testingLocation},${summaryDataColumnTitles.typeOfService},${summaryDataColumnTitles.operator},${trialColumnTitles.testLocalStartTime},${trialColumnTitles.trialNumber},${trialColumnTitles.trialResult},${trialColumnTitles.trialTimeInMs}\n`;
        fs.writeFileSync('uplinkData.csv', header);
      }
      if (!fs.existsSync('downlinkData.csv')) {
        const header = `${trialColumnTitles.testLabel},${summaryDataColumnTitles.remoteEndpoint},${summaryDataColumnTitles.remoteEndpointLocation},${summaryDataColumnTitles.testingLocation},${summaryDataColumnTitles.typeOfService},${summaryDataColumnTitles.operator},${trialColumnTitles.testLocalStartTime},${trialColumnTitles.trialNumber},${trialColumnTitles.trialResult},${trialColumnTitles.trialTimeInMs}\n`;
        fs.writeFileSync('downlinkData.csv', header);
      }
      const parsedBody = JSON.parse(body);

      if (parsedBody.summaryData === undefined) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('There was an error with the data received');
      }

      const {
        summaryData,
        icmpTrialData,
        httpUplinkTrialData,
        httpDownlinkTrialData,
      } = parsedBody;

      const summaryCsvRow = `${summaryData.testLabel},${summaryData.remoteEndpoint},${summaryData.remoteEndpointLocation},${summaryData.testingLocation},${summaryData.typeOfService},${summaryData.operator},"${summaryData.testLocalStartTime}",${summaryData.timeElapsed},${summaryData.ICMPTrialsAttempted},${summaryData.successfulICMPTrials},${summaryData.latency},${summaryData.minRTT},${summaryData.maxRTT},${summaryData.packetLossRatio},${summaryData.advertisedDataRate},${summaryData.httpUpTrialsAttempted},${summaryData.successfulHttpUpTrials},${summaryData.meanSuccessHttpUpTime},${summaryData.minSuccessHttpUpTime},${summaryData.maxSuccessHttpUpTime},${summaryData.uplinkThroughput},${summaryData.uplinkUnsuccessfulFileAccess},${summaryData.httpDownTrialsAttempted},${summaryData.successfulHttpDownTrials},${summaryData.meanSuccessHttpDownTime},${summaryData.minSuccessHttpDownTime},${summaryData.maxSuccessHttpDownTime},${summaryData.downlinkThroughput},${summaryData.downlinkUnsuccessfulFileAccess}\n`;
      fs.appendFile('summaryData.csv', summaryCsvRow, function (err) {
        if (err) throw err;
      });

      for (let i = 0; i < icmpTrialData.length; i++) {
        const icmpCsvRow = `${summaryData.testLabel},${
          summaryData.remoteEndpoint
        },${summaryData.remoteEndpointLocation},${
          summaryData.testingLocation
        },${summaryData.typeOfService},${summaryData.operator},"${
          summaryData.testLocalStartTime
        }",${icmpTrialData[i].trialNumber},${icmpTrialData[i].trialResult},${
          icmpTrialData[i].trialTimeInMs
            ? icmpTrialData[i].trialTimeInMs.toFixed(2)
            : null
        }\n`;
        fs.appendFile('icmpData.csv', icmpCsvRow, function (err) {
          if (err) throw err;
        });
      }

      for (let j = 0; j < httpUplinkTrialData.length; j++) {
        const uplinkCsvRow = `${summaryData.testLabel},${
          summaryData.remoteEndpoint
        },${summaryData.remoteEndpointLocation},${
          summaryData.testingLocation
        },${summaryData.typeOfService},${summaryData.operator},"${
          summaryData.testLocalStartTime
        }",${httpUplinkTrialData[j].trialNumber},${
          httpUplinkTrialData[j].trialResult
        },${
          httpUplinkTrialData[j].trialTimeInMs
            ? httpUplinkTrialData[j].trialTimeInMs.toFixed(2)
            : null
        }\n`;
        fs.appendFile('uplinkData.csv', uplinkCsvRow, function (err) {
          if (err) throw err;
        });
      }

      for (let k = 0; k < httpDownlinkTrialData.length; k++) {
        const downlinkCsvRow = `${summaryData.testLabel},${
          summaryData.remoteEndpoint
        },${summaryData.remoteEndpointLocation},${
          summaryData.testingLocation
        },${summaryData.typeOfService},${summaryData.operator},"${
          summaryData.testLocalStartTime
        }",${httpDownlinkTrialData[k].trialNumber},${
          httpDownlinkTrialData[k].trialResult
        },${
          httpDownlinkTrialData[k].trialTimeInMs
            ? httpDownlinkTrialData[k].trialTimeInMs.toFixed(2)
            : null
        }\n`;
        fs.appendFile('downlinkData.csv', downlinkCsvRow, function (err) {
          if (err) throw err;
        });
      }

      res.end('Added data to CSV');
    });
  } else if (req.url === '/delete-csv' && req.method === 'DELETE') {
    fs.unlink(path.join(__dirname, 'summaryData.csv'), (err) => {
      if (err) {
        console.error(err);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Error while deleting one of the CSV files: ${err}`);
        return;
      }
      console.log('Summary CSV file successfully deleted');
    });
    fs.unlink(path.join(__dirname, 'icmpData.csv'), (err) => {
      if (err) {
        console.error(err);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Error while deleting one of the CSV files: ${err}`);
        return;
      }
      console.log('ICMP CSV file successfully deleted');
    });
    fs.unlink(path.join(__dirname, 'uplinkData.csv'), (err) => {
      if (err) {
        console.error(err);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Error while deleting one of the CSV files: ${err}`);
        return;
      }
      console.log('Uplink CSV file successfully deleted');
    });
    fs.unlink(path.join(__dirname, 'downlinkData.csv'), (err) => {
      if (err) {
        console.error(err);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Error while deleting one of the CSV files: ${err}`);
        return;
      }
      console.log('Downlink CSV file successfully deleted');
    });
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('CSV files successfully deleted');
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
    } else {
      res.writeHead(200, {
        'Content-Type': contentTypeHeader,
        'Content-Disposition': contentDispositionHeader,
      });
      res.end(data);
    }
  });
}

const summaryDataColumnTitles = {
  testLabel: 'Test Label',
  remoteEndpoint: 'Remote Endpoint',
  remoteEndpointLocation: 'Remote Server Location',
  testingLocation: 'Testing Location',
  typeOfService: 'Type of Service',
  operator: 'Operator',
  testLocalStartTime: 'Tests Started (local time)',
  timeElapsed: 'Time Elapsed',
  ICMPTrialsAttempted: 'ICMP Trials Attempted',
  successfulICMPTrials: 'ICMP Trials Successful',
  latency: 'Latency (ms)',
  minRTT: 'Min RTT (ms)',
  maxRTT: 'Max RTT (ms)',
  packetLossRatio: 'Packet Loss Ratio (%)',
  advertisedDataRate: 'Advertised Data Rate (Mb/s)',
  httpUpTrialsAttempted: 'Uplink Trials Attempted',
  successfulHttpUpTrials: 'Uplink Trials Successful',
  meanSuccessHttpUpTime: 'Mean Time per successful uplink trial (ms)',
  minSuccessHttpUpTime: 'Min successful uplink trial time (ms)',
  maxSuccessHttpUpTime: 'Max successful uplink trial time (ms)',
  uplinkThroughput: 'Uplink Throughput (%)',
  uplinkUnsuccessfulFileAccess: 'Uplink Unsuccessful file access ratio (%)',
  httpDownTrialsAttempted: 'Downlink Trials Attempted',
  successfulHttpDownTrials: 'Downlink Trials Successful',
  meanSuccessHttpDownTime: 'Mean Time per successful downlink trial (ms)',
  minSuccessHttpDownTime: 'Min successful downlink trial time (ms)',
  maxSuccessHttpDownTime: 'Max successful downlink trial time (ms)',
  downlinkThroughput: 'Downlink Throughput (%)',
  downlinkUnsuccessfulFileAccess: 'Downlink Unsuccessful file access ratio (%)',
};

const trialColumnTitles = {
  testLabel: 'Test Label',
  testLocalStartTime: 'Test Started (local time)',
  trialNumber: 'Trial Number',
  trialResult: 'Trial Result',
  trialTimeInMs: 'Trial Time (ms)',
};

server.on('request', requestListener);

server.listen(process.env.PORT || 1414, () => {
  // const { address, port } = server.address();
  console.log(`Server running at ${serverUrl}`);
});
