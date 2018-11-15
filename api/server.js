const { google } = require("googleapis");
const express = require("express");
const clientInfo = require("../client_id.json");
const opn = require("opn");
const querystring = require("querystring");
const url = require("url");

const app = express();
const port = 3000;

const scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.metadata"
];

const oauthClient = new google.auth.OAuth2(
  clientInfo.web.client_id,
  clientInfo.web.client_secret,
  "http://localhost:3000/oauth/redirect"
);

const drive = google.drive({
  version: "v3",
  auth: oauthClient
});

const authorizeUrl = oauthClient.generateAuthUrl({
  access_type: "offline",
  scope: scopes.join(" ")
});

app.get("/oauth/redirect", async (req, res) => {
  const qs = querystring.parse(url.parse(req.url).query);
  res.end("Authentication successful! Please return to the console.");
  const { tokens } = await oauthClient.getToken(qs.code);
  oauthClient.setCredentials(tokens);
  oauth2client.on("tokens", tokens => {
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
  });
});

app.get("/authenticate", (req, res) => {
  opn(authorizeUrl, { wait: false, app: "google chrome" }).then(cp =>
    cp.unref()
  );
});

app.get("/list", async (req, res) => {
  try {
    const params = { pageSize: 3 };
    params.q = "mimeType='audio/wav'";
    const list = await drive.files.list(params);
    return res.send(list.data);
  } catch (e) {
    res.status(401).send(e.message);
  }
});

app.listen(port, () => console.log(`server listening on port ${port}!`));
