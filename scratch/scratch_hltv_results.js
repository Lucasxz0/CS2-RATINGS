const { HLTV } = require('hltv');

async function testHLTV() {
  try {
    const results = await HLTV.getResults({pages: 1});
    console.log('Results fetched:', results.length);
    if (results.length > 0) {
      console.log('First result:', JSON.stringify(results[0], null, 2));
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

testHLTV();
