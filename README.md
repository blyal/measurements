# Running the local server

This guide will help you to set up the local server and run the Measurements app.

## Prerequisites

Before you start, please make sure that you have the following:

- A macOS or Windows computer
- An internet connection

## For Mac:

### A. Installing Node.js

1. Open a web browser and go to https://nodejs.org
2. Click the "Download" button to download the latest version of the Node.js installer for macOS.
3. Double-click the downloaded installer file to start the installation process.
4. Follow the instructions in the installer to complete the installation.

### B. Running Terminal

Terminal is included in macOS by default. You can find it in the Utilities folder, which is located in the Applications folder.

1. Open the Finder and navigate to the Applications folder.
2. Open the Utilities folder.
3. Double-click the Terminal application to open it.
4. Type in `node --version` to verify that the node installation was correct, and hit `enter`. The result should be something like `v18.x.x`

### C. Running the Server on a Mac

1. In the terminal, navigate to the directory containing the server files and this readme. For example, if the "measurements" folder/directory is in your Downloads folder, you can navigate to that directory by typing:

`cd ~/Downloads/measurements` (+ Enter)

1. Start the local server by running the following command:

`node local-server.js`

3. The server should now be running. Go to a browser window, and type in `http://localhost:1010`. This should take you to the web page for the app, running from the local server. If it doesn't, something has gone wrong in a previous step.

4. To stop the server, go to the terminal window and press `Ctrl+C`

## For Windows:

### A. Installing Node.js

1. Open a web browser and go to https://nodejs.org
2. Click the "Download" button to download the latest version of the Node.js installer for Windows.
3. Double-click the downloaded installer file to start the installation process.
4. Follow the instructions in the installer to complete the installation.

### B. Installing PowerShell

PowerShell is included in Windows 10 by default. If you are using an older version of Windows, you may need to download and install PowerShell separately.

1. Open a web browser and go to https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-windows?view=powershell-7.2
2. Follow the instructions on the page to download and install PowerShell.

### C. Running the Server on Windows

1. Open PowerShell by pressing the Windows key + R and typing "powershell" in the Run dialog box. Then click "OK" or press Enter.
2. Verify that node has been correctly installed by running the following command in PowerShell: `node -v` (this will print a version number if the earlier node installation was successful)
3. In PowerShell, navigate to the directory containing the server files and this readme. For example, if the "measurements" folder/directory is in your Downloads folder, you can navigate to that directory by typing:

`cd $HOME\Downloads\measurements` (+ Enter)

1. Start the local server by running the following command:

`node local-server.js`

4. The server should now be running. Go to a browser window, and type in `http://localhost:1010`. This should take you to the web page for the app, running from the local server. If it doesn't, something has gone wrong in a previous step.

5. To stop the server, go back to the PowerShell window and press `Ctrl+C` to stop the server.

## Explanation

ICMP pings cannot be sent from the browser (due to security issues), so running a local server is necessary. The local server also allows us to serve the frontend locally, but send remote HTTP calls. The frontend also sends an HTTP call to the local server to initiate the ICMP Test (a series of ICMP trials from local server to remote server), and another HTTP call again to retrieve the results after the HTTP Test has concluded (HTTP and ICMP tests run in parallel). All CSV files are handled in the remote server (written, stored, and downloaded from, via HTTP).

## Troubleshooting

If you encounter any issues while running the server, please refer to the error messages in the Terminal (macOS) or PowerShell (Windows). If issues persist, contact the developer.
