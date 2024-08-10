require('dotenv').config();
const axios = require('axios');
const googleapis = require('googleapis');
const cred = require('../secret/credential.json');
const sheetId = process.env.GDRIVE_SHEET_ID;
const adminId = process.env.APP_ADMIN_ID;
const adminPwd = process.env.APP_ADMIN_PWD;

const BASE_URL = 'http://127.0.0.1:3000/api/v1';
const USERS_COLUMNS = [
  'name',
  'sex',
  'age',
  'dob',
  'nickname',
  'auth_id',
  'pwd',
  'team_id',
  'geo',
];

function bootstrap() {
  const authorize = new googleapis.google.auth.JWT({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  authorize.fromJSON(cred);
  return googleapis.google.sheets({ version: 'v4', auth: authorize });
}

async function authenticate() {
  const auth = await axios.post(`${BASE_URL}/auth/login`, {
    userId: adminId,
    password: adminPwd,
  });
  return auth.data.result.accessToken;
}

const main = async () => {
  // authenticate admin
  const token = await authenticate();
  const sheets = bootstrap();
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'users!A1:J99',
  });
  if (result.status === 200) {
    // cleanup data and make as an object
    const data = result.data.values;
    data.shift();
    const users = data
      .filter((sub) => {
        return sub.length === USERS_COLUMNS.length;
      })
      .map((sub) => {
        const user = {};
        for (let i = 0; i < sub.length; i++) {
          if (['sex', 'age'].includes(USERS_COLUMNS[i])) {
            user[USERS_COLUMNS[i]] = Number(sub[i]);
          } else {
            user[USERS_COLUMNS[i]] = sub[i];
          }
        }
        return user;
      });
    console.log(`${users.length} users found. Starting to create users...`);
    // calling API to create user
    let cbk = false; //circuit breaker
    for (const user of users) {
      try {
        const res = await axios.post(
          `${BASE_URL}/user/new`,
          {
            name: user.name,
            sex: user.sex,
            nickname: user.nickname,
            id: user.auth_id,
            pwd: user.pwd,
            teamName: user.team_id,
            dob: user.dob,
            geo: user.geo,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log(`${user.auth_id} => Result: `, res.data);
      } catch (e) {
        console.log(`${user.auth_id} => FAILED: `, e.message);
        cbk = true;
      }
      if (cbk) {
        break;
      }
    }
  } else {
    console.log('Failed to fetch data from google sheet');
  }
  console.log('done.');
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
