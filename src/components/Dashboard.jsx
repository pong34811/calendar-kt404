import React, { useMemo } from 'react';
import { Card, Col, Row, Statistic, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, EyeFilled, VideoCameraFilled, ThunderboltFilled, PlayCircleFilled } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;

const Dashboard = ({ data }) => {
    // Process Data
    const stats = useMemo(() => {
        const now = dayjs();
        const startOfMonth = now.startOf('month');
        const startOfWeek = now.startOf('week');

        let totalViews = 0;
        let monthlyViews = 0;
        let weeklyViews = 0;
        let videoCount = data.length;
        let monthlyVideos = 0;
        let weeklyVideos = 0;

        const typeDistribution = {
            Video: 0,
            Short: 0,
            Live: 0,
            Stream: 0,
            Upcoming: 0
        };

        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            last30Days.push({
                date: now.subtract(i, 'day').format('MM-DD'),
                views: 0,
                fullDate: now.subtract(i, 'day').format('YYYY-MM-DD')
            });
        }

        const last4Weeks = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = now.subtract(i, 'week').startOf('week');
            last4Weeks.push({
                name: `${weekStart.format('MMM DD')} - ${weekStart.endOf('week').format('MMM DD')}`,
                start: weekStart,
                end: weekStart.endOf('week'),
                views: 0,
                count: 0,
                Video: 0,
                Short: 0,
                Live: 0,
                Stream: 0,
                Upcoming: 0,
                VideoList: [],
                ShortList: [],
                LiveList: [],
                StreamList: [],
                UpcomingList: []
            });
        }

        let topVideo = null;

        data.forEach(item => {
            const pubDate = dayjs(item.publishedAt);
            const views = parseInt(item.viewCount || 0);

            totalViews += views;
            typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1;

            if (!topVideo || views > parseInt(topVideo.viewCount || 0)) {
                topVideo = item;
            }

            if (pubDate.isSameOrAfter(startOfMonth)) {
                monthlyViews += views;
                monthlyVideos++;
            }
            if (pubDate.isSameOrAfter(startOfWeek)) {
                weeklyViews += views;
                weeklyVideos++;
            }

            // Daily Trend (approximate based on publish date for now, as we don't have daily analytics)
            // Ideally this would come from analytics API, but we map total views to publish date for visualization of "content impact"
            const dayStat = last30Days.find(d => d.fullDate === pubDate.format('YYYY-MM-DD'));
            if (dayStat) {
                dayStat.views += views;
            }

            // Weekly Trend
            const weekStat = last4Weeks.find(w => pubDate.isSameOrAfter(w.start) && pubDate.isSameOrBefore(w.end));
            if (weekStat) {
                weekStat.views += views;
                weekStat.count++;
                weekStat[item.type] = (weekStat[item.type] || 0) + 1;
                if (weekStat[item.type + 'List']) {
                    weekStat[item.type + 'List'].push(item.title);
                }
            }
        });

        const pieData = Object.keys(typeDistribution)
            .filter(key => typeDistribution[key] > 0)
            .map(key => ({ name: key, value: typeDistribution[key] }));

        return {
            totalViews,
            monthlyViews,
            weeklyViews,
            videoCount,
            monthlyVideos,
            weeklyVideos,
            pieData,
            dailyTrend: last30Days,
            weeklyTrend: last4Weeks,
            topVideo
        };
    }, [data]);

    const COLORS = {
        Video: '#1890ff',
        Short: '#722ed1',
        Live: '#ff4d4f',
        Stream: '#13c2c2',
        Upcoming: '#fa8c16'
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'rgba(255, 255, 255, 0.96)', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxWidth: 350 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>{label}</div>
                    {payload.map((entry, index) => {
                        if (entry.value === 0) return null;
                        const type = entry.dataKey;
                        const listKey = type + 'List';
                        const titles = entry.payload[listKey] || [];

                        return (
                            <div key={index} style={{ marginBottom: 8 }}>
                                <div style={{ color: entry.color, fontWeight: 600, fontSize: 13 }}>
                                    {type} : {entry.value}
                                </div>
                                <ul style={{ margin: '4px 0 0 0', paddingLeft: 16, fontSize: 11, color: '#595959' }}>
                                    {titles.map((title, i) => (
                                        <li key={i} style={{ marginBottom: 2, lineHeight: '1.3' }}>{title}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Total Views"
                            value={stats.totalViews}
                            prefix={<EyeFilled style={{ color: '#1890ff' }} />}
                            formatter={val => val.toLocaleString()}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                            All time performance
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Monthly Views"
                            value={stats.monthlyViews}
                            prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#3f8600' }}
                            formatter={val => val.toLocaleString()}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                            {stats.monthlyVideos} new videos this month
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Weekly Views"
                            value={stats.weeklyViews}
                            prefix={<ThunderboltFilled style={{ color: '#fa8c16' }} />}
                            formatter={val => val.toLocaleString()}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                            {stats.weeklyVideos} new videos this week
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Content Distribution */}
                <Col xs={24} lg={12}>
                    <Card title="Content Distribution" bordered={false} style={{ borderRadius: 16, height: '100%' }}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={stats.pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Weekly Views Bar Chart */}
                <Col xs={24} lg={12}>
                    <Card title="Weekly Views Impact" bordered={false} style={{ borderRadius: 16, height: '100%' }}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats.weeklyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} tickFormatter={val => `${val / 1000}k`} />
                                    <Tooltip formatter={val => val.toLocaleString()} />
                                    <Bar dataKey="views" fill="#1890ff" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                {/* Weekly Content Output Stacked Chart */}
                <Col xs={24} lg={24}>
                    <Card title="Weekly Content Output" bordered={false} style={{ borderRadius: 16 }}>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={stats.weeklyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} />
                                    <YAxis fontSize={12} allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="Video" stackId="a" fill={COLORS.Video} />
                                    <Bar dataKey="Short" stackId="a" fill={COLORS.Short} />
                                    <Bar dataKey="Live" stackId="a" fill={COLORS.Live} />
                                    <Bar dataKey="Stream" stackId="a" fill={COLORS.Stream} />
                                    <Bar dataKey="Upcoming" stackId="a" fill={COLORS.Upcoming} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Top Video */}
            {stats.topVideo && (
                <Card title="Top Performing Video" bordered={false} style={{ borderRadius: 16 }}>
                    <Row gutter={16} align="middle">
                        <Col flex="160px">
                            <img
                                src={stats.topVideo.thumbnail}
                                alt={stats.topVideo.title}
                                style={{
                                    width: 160,
                                    height: 90,
                                    objectFit: 'cover',
                                    borderRadius: 12
                                }}
                            />
                        </Col>
                        <Col flex="auto">
                            <Title level={5} style={{ margin: 0 }}>{stats.topVideo.title}</Title>
                            <Space size="large" style={{ marginTop: 8 }}>
                                <Text type="secondary"><EyeFilled /> {parseInt(stats.topVideo.viewCount).toLocaleString()} views</Text>
                                <Text type="secondary" style={{ textTransform: 'uppercase' }}>{stats.topVideo.type}</Text>
                                <Text type="secondary">{dayjs(stats.topVideo.publishedAt).format('YYYY-MM-DD')}</Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}
        </Space>
    );
};

export default Dashboard;
