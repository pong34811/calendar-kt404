import axios from 'axios';
import dayjs from 'dayjs';

const API_KEY = 'AIzaSyAbREclgeyXQkGpy9-JABmY_Cdb34J8cVU';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const fetchVideos = async () => {
    try {
        const CHANNEL_ID = 'UCXT92S422lAnfBfsPrxpEFw';

        // 1. Get Channel's Uploads Playlist ID (more reliable than guessing UU...)
        const channelResponse = await axios.get(`${BASE_URL}/channels`, {
            params: {
                part: 'contentDetails',
                id: CHANNEL_ID,
                key: API_KEY
            }
        });

        const uploadsPlaylistId = channelResponse.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsPlaylistId) {
            console.error("Could not find uploads playlist ID");
            return [];
        }

        // 2. Fetch data from 3 sources to be comprehensive
        const [uploadsRel, liveRel, upcomingRel] = await Promise.all([
            // Regular uploads (most reliable for recent videos)
            axios.get(`${BASE_URL}/playlistItems`, {
                params: {
                    part: 'snippet',
                    maxResults: 50,
                    playlistId: uploadsPlaylistId,
                    key: API_KEY
                }
            }),
            // Specific search for currently Live
            axios.get(`${BASE_URL}/search`, {
                params: {
                    part: 'snippet',
                    maxResults: 10,
                    channelId: CHANNEL_ID,
                    eventType: 'live',
                    type: 'video',
                    key: API_KEY
                }
            }),
            // Specific search for Upcoming scheduled streams
            axios.get(`${BASE_URL}/search`, {
                params: {
                    part: 'snippet',
                    maxResults: 10,
                    channelId: CHANNEL_ID,
                    eventType: 'upcoming',
                    type: 'video',
                    key: API_KEY
                }
            })
        ]);

        // Merge all IDs found
        const playlistVideoIds = uploadsRel.data.items.map(item => item.snippet.resourceId.videoId);
        const searchVideoIds = [...liveRel.data.items, ...upcomingRel.data.items].map(item => item.id.videoId);
        const uniqueVideoIds = [...new Set([...playlistVideoIds, ...searchVideoIds])].join(',');

        if (!uniqueVideoIds) return [];

        // 3. Get full details for all videos
        const detailsResponse = await axios.get(`${BASE_URL}/videos`, {
            params: {
                part: 'snippet,contentDetails,statistics,liveStreamingDetails',
                id: uniqueVideoIds,
                key: API_KEY
            }
        });

        return detailsResponse.data.items.map(item => {
            const isLive = item.snippet.liveBroadcastContent === 'live';
            const isUpcoming = item.snippet.liveBroadcastContent === 'upcoming';
            const duration = item.contentDetails.duration;

            const parseDuration = (d) => {
                const match = d.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
                if (!match) return 0;
                const h = parseInt((match[1] || '0').replace('H', ''));
                const m = parseInt((match[2] || '0').replace('M', ''));
                const s = parseInt((match[3] || '0').replace('S', ''));
                return (h * 3600) + (m * 60) + s;
            }

            const totalSeconds = parseDuration(duration);

            let type = 'Video';
            if (isLive) type = 'Live';
            else if (isUpcoming) type = 'Upcoming';
            else if (totalSeconds > 0 && totalSeconds <= 60) type = 'Short';
            else if (item.liveStreamingDetails) type = 'Stream';

            return {
                id: item.id,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: dayjs(item.snippet.publishedAt).add(-6, 'hour').toISOString(),
                viewCount: item.statistics.viewCount,
                duration: duration,
                seconds: totalSeconds,
                type: type,
                link: `https://www.youtube.com/watch?v=${item.id}`
            };
        }).sort((a, b) => dayjs(b.publishedAt).diff(dayjs(a.publishedAt)));

    } catch (error) {
        console.error("Error fetching YouTube data", error);
        throw error;
    }
};
