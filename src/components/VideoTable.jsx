import React from 'react';
import { Table, Tag, Typography, Space, Progress } from 'antd';
import { PlayCircleFilled, EyeFilled, CalendarFilled, ThunderboltFilled, VideoCameraFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Text, Link } = Typography;

const VideoTable = ({ data, loading }) => {
    const columns = [
        {
            title: 'Content Details',
            key: 'video',
            render: (_, record) => {
                const isLive = record.type === 'Live';
                const isShort = record.type === 'Short';
                const isUpcoming = record.type === 'Upcoming';
                const isStream = record.type === 'Stream';

                return (
                    <Space size="large" align="start">
                        <div style={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' }}
                            className="table-img-container"
                            onClick={() => window.open(record.link, '_blank')}>
                            <img
                                src={record.thumbnail}
                                alt="thumbnail"
                                style={{
                                    width: 140,
                                    height: 78,
                                    objectFit: 'cover',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                            <div style={{
                                position: 'absolute', bottom: 6, right: 6,
                                background: isLive ? '#ff4d4f' : 'rgba(0,0,0,0.75)',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 700,
                                backdropFilter: 'blur(4px)'
                            }}>
                                {isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : formatDuration(record.seconds)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: 400 }}>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: 2 }}>
                                {isLive ? <Tag color="red" icon={<VideoCameraFilled />}>LIVE</Tag> :
                                    isShort ? <Tag color="purple" icon={<ThunderboltFilled />}>SHORT</Tag> :
                                        isUpcoming ? <Tag color="orange" icon={<CalendarFilled />}>UPCOMING</Tag> :
                                            isStream ? <Tag color="cyan" icon={<VideoCameraFilled />}>STREAM</Tag> :
                                                <Tag color="blue" icon={<PlayCircleFilled />}>VIDEO</Tag>}
                            </div>
                            <Link href={record.link} target="_blank" style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: '#1e293b',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }} title={record.title}>
                                {record.title}
                            </Link>
                            <Text type="secondary" style={{ fontSize: 12 }}>{record.channelTitle}</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Performance',
            key: 'performance',
            sorter: (a, b) => parseInt(a.viewCount || 0) - parseInt(b.viewCount || 0),
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Space style={{ marginBottom: 4 }}>
                        <EyeFilled style={{ color: '#64748b' }} />
                        <Text strong style={{ fontSize: 15 }}>{parseInt(record.viewCount || 0).toLocaleString()}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>Total Views</Text>
                </Space>
            ),
            width: 180,
            responsive: ['md'],
        },
        {
            title: 'Publishing Date',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            defaultSortOrder: 'descend',
            sorter: (a, b) => dayjs.tz(a.publishedAt, 'Asia/Bangkok').unix() - dayjs.tz(b.publishedAt, 'Asia/Bangkok').unix(),
            render: (date) => (
                <Space direction="vertical" size={0}>
                    <Space style={{ marginBottom: 4 }}>
                        <CalendarFilled style={{ color: '#ff4d4f' }} />
                        <Text strong style={{ fontSize: 14 }}>{dayjs.tz(date, 'Asia/Bangkok').fromNow()}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs.tz(date, 'Asia/Bangkok').format('MMM DD, YYYY • HH:mm')}
                    </Text>
                </Space>
            ),
            width: 200,
            responsive: ['lg'],
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{
                pageSize: 7,
                showSizeChanger: false,
                style: { paddingRight: 24, paddingBottom: 16 }
            }}
            style={{ background: '#fff' }}
        />
    );
};

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default VideoTable;
