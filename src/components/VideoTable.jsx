import React from 'react';
import { Table, Tag, Typography, Space } from 'antd';
import { PlayCircleOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Link } = Typography;

const VideoTable = ({ data, loading }) => {
    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            filters: [
                { text: 'Video', value: 'Video' },
                { text: 'Short', value: 'Short' },
                { text: 'Live', value: 'Live' },
                { text: 'Upcoming', value: 'Upcoming' },
            ],
            onFilter: (value, record) => record.type.indexOf(value) === 0,
            render: (type) => {
                let color = 'geekblue';
                if (type === 'Live') color = 'red';
                if (type === 'Short') color = 'purple';
                if (type === 'Upcoming') color = 'orange';
                return (
                    <Tag color={color} icon={type === 'Live' ? <PlayCircleOutlined spin /> : null}>
                        {type.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Video',
            key: 'video',
            render: (_, record) => (
                <Space size="middle" align="start">
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => window.open(record.link, '_blank')}>
                        <img
                            src={record.thumbnail}
                            alt="thumbnail"
                            style={{
                                width: 120,
                                height: 68,
                                objectFit: 'cover',
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        />
                        <div style={{
                            position: 'absolute', bottom: 4, right: 4,
                            background: 'rgba(0,0,0,0.8)', color: 'white',
                            padding: '0 4px', borderRadius: 4, fontSize: 10
                        }}>
                            {record.type === 'Live' ? 'LIVE' : formatDuration(record.seconds)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Link href={record.link} target="_blank" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={record.title}>
                            {record.title}
                        </Link>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.channelTitle}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Views',
            dataIndex: 'viewCount',
            key: 'viewCount',
            sorter: (a, b) => parseInt(a.viewCount || 0) - parseInt(b.viewCount || 0),
            render: (views) => (
                <Space>
                    <EyeOutlined style={{ color: '#8c8c8c' }} />
                    <Text>{parseInt(views || 0).toLocaleString()}</Text>
                </Space>
            ),
            width: 140,
            responsive: ['md'],
        },
        {
            title: 'Published',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            defaultSortOrder: 'descend',
            sorter: (a, b) => dayjs(a.publishedAt).unix() - dayjs(b.publishedAt).unix(),
            render: (date) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <CalendarOutlined style={{ color: '#ff4d4f' }} />
                        <Text strong>{dayjs(date).fromNow()}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(date).format('DD/MM/YYYY HH:mm')}
                    </Text>
                </Space>
            ),
            width: 180,
            responsive: ['lg'],
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
        />
    );
};

// Helper for duration display (mm:ss or hh:mm:ss)
function formatDuration(seconds) {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default VideoTable;
