import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const API_KEY = 'AIzaSyAbREclgeyXQkGpy9-JABmY_Cdb34J8cVU';
const CHANNEL_ID = 'UCXT92S422lAnfBfsPrxpEFw';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

async function getChannelInfo() {
    try {
        const response = await axios.get(`${BASE_URL}/channels`, {
            params: {
                part: 'snippet,statistics,contentDetails,brandingSettings',
                id: CHANNEL_ID,
                key: API_KEY
            }
        });

        const channel = response.data.items[0];
        if (!channel) {
            console.log('Channel not found.');
            return;
        }

        console.log('--- Channel Information ---');
        console.log(`Title: ${channel.snippet.title}`);
        console.log(`Description: ${channel.snippet.description}`);
        console.log(`Custom URL: ${channel.snippet.customUrl}`);
        console.log(`Published At: ${dayjs(channel.snippet.publishedAt).add(6, 'hour').tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss')}`);
        console.log(`Country: ${channel.snippet.country}`);

        console.log('\n--- Statistics ---');
        console.log(`Subscriber Count: ${channel.statistics.subscriberCount}`);
        console.log(`Video Count: ${channel.statistics.videoCount}`);
        console.log(`View Count: ${channel.statistics.viewCount}`);

        console.log('\n--- Branding ---');
        console.log(`Keywords: ${channel.brandingSettings?.channel?.keywords}`);

        console.log('\n--- Raw Data (truncated) ---');
        console.log(JSON.stringify(channel, null, 2));

    } catch (error) {
        console.error('Error fetching channel data:', error.response ? error.response.data : error.message);
    }
}

getChannelInfo();
