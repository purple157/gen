
const { Worker, isMainThread } = require('worker_threads');
const axios = require('./utils/axiosUtils');
const generateRandomEmail = require('./utils/emailUtils');
const { registerUser } = require('./utils/accountUtils');
const { getOffers } = require('./utils/offerUtils');
const redeemOffer = require('./utils/redeemUtils');

async function getUserData(cookies) {
  try {
    const userResponse = await axios.get('https://app2.hm.com/tr_tr/v2/user', { headers: { Cookie: cookies } });
    return userResponse.data;
  } catch (error) {
    throw error;
  }
}

async function main() {
  try {
    const cookies = await registerUser();
    const userData = await getUserData(cookies);
    const offersData = await getOffers(cookies);

      const offer = offersData.find(item => item.offerKey === 'OFR92316');
    if (offer) {
      await redeemOffer(cookies, userData, offer);
    } else {
        console.log('Offer with offerKey OFR92316 not found.');
    }
  } catch (error) {
    console.log(error)
  }
}

async function runWorker() {
  while (true) {
    await main();
  }
}

if (isMainThread) {
  for (let i = 0; i < 20; i++) {
    const worker = new Worker(__filename);
    worker.on('error', err => {
      console.error('Worker error:', err);
    });
    worker.on('exit', code => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  }
} else {
  runWorker();
}