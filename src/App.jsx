import React, { useState, useEffect } from 'react';
import { Layout, Typography, ConfigProvider, theme, message, Calendar, Tag, Tooltip, Segmented, Card, Badge, Space } from 'antd';
import { fetchVideos } from './api/youtube';
import {
  YoutubeFilled,
  PlayCircleFilled,
  ClockCircleFilled,
  VideoCameraFilled,
  CalendarOutlined,
  TableOutlined,
  ThunderboltFilled
} from '@ant-design/icons';
import VideoTable from './components/VideoTable';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('table');

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await fetchVideos();
      if (results.length === 0) {
        message.info('No videos found.');
      }
      setData(results);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch videos. Check API Key or quota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getListData = (value) => {
    const dateString = value.format('YYYY-MM-DD');
    return data.filter(item => dayjs(item.publishedAt).format('YYYY-MM-DD') === dateString);
  };

  const getCardStyle = (type) => {
    switch (type) {
      case 'Live': return {
        bg: '#fff1f0',
        border: '#ffa39e',
        icon: <VideoCameraFilled style={{ color: '#ff4d4f' }} />,
        tag: 'red'
      };
      case 'Short': return {
        bg: '#f9f0ff',
        border: '#d3adf7',
        icon: <ThunderboltFilled style={{ color: '#722ed1' }} />,
        tag: 'purple'
      };
      case 'Upcoming': return {
        bg: '#fff7e6',
        border: '#ffd591',
        icon: <ClockCircleFilled style={{ color: '#fa8c16' }} />,
        tag: 'orange'
      };
      default: return {
        bg: '#e6f7ff',
        border: '#91d5ff',
        icon: <PlayCircleFilled style={{ color: '#1890ff' }} />,
        tag: 'blue'
      };
    }
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <div style={{ maxHeight: '100%', overflow: 'hidden' }}>
        {listData.map((item) => {
          const style = getCardStyle(item.type);
          return (
            <Tooltip
              key={item.id}
              title={
                <div style={{ padding: '4px' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>
                    {dayjs(item.publishedAt).format('HH:mm A')} • {item.viewCount ? parseInt(item.viewCount).toLocaleString() + ' views' : 'Upcoming'}
                  </div>
                </div>
              }
              overlayInnerStyle={{ borderRadius: '12px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="calendar-card"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  textDecoration: 'none'
                }}
              >
                <div style={{
                  background: style.bg,
                  padding: '6px 8px',
                  borderRadius: '10px',
                  border: `1px solid ${style.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {style.icon}
                    <Text strong ellipsis style={{ fontSize: '11px', color: '#1e293b', flex: 1 }}>
                      {item.title}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={style.tag} bordered={false} style={{ fontSize: '9px', margin: 0, padding: '0 4px', lineHeight: '16px' }}>
                      {item.type.toUpperCase()}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: '9px', fontWeight: 500 }}>
                      {dayjs(item.publishedAt).format('HH:mm')}
                    </Text>
                  </div>
                </div>
              </a>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#ff0000',
          borderRadius: 12,
          fontFamily: 'Inter, Outfit, sans-serif'
        },
        components: {
          Card: {
            boxShadowTertiary: '0 4px 20px rgba(0,0,0,0.05)'
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', width: '100%', background: '#f8fafc' }}>
        <Header className="glass-card" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: 80,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: '#ff0000',
              padding: '8px',
              borderRadius: '12px',
              display: 'flex',
              marginRight: 16,
              boxShadow: '0 4px 6px -1px rgba(255, 0, 0, 0.2)'
            }}>
              <YoutubeFilled style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>
                Channel Dashboard
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>UCXT92S422lAnfBfsPrxpEFw</Text>
            </div>
          </div>

          <Segmented
            options={[
              { label: 'Table List', value: 'table', icon: <TableOutlined /> },
              { label: 'Calendar', value: 'calendar', icon: <CalendarOutlined /> },
            ]}
            value={view}
            onChange={setView}
            size="large"
            style={{ padding: '4px', background: '#f1f5f9' }}
          />
        </Header>

        <Content style={{ padding: '16px', width: '100%', minHeight: 'calc(100vh - 80px)' }}>
          {view === 'calendar' ? (
            <Card
              bordered={false}
              bodyStyle={{ padding: 16 }}
              style={{ borderRadius: 16, boxShadow: '0 10px 25px -5px rgba(0, 10, 30, 0.05)', minHeight: '100%' }}
            >
              <Calendar
                cellRender={dateCellRender}
                style={{ background: 'transparent' }}
              />
            </Card>
          ) : (
            <Card
              bordered={false}
              bodyStyle={{ padding: 0 }}
              style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 10, 30, 0.05)' }}
            >
              <VideoTable data={data} loading={loading} />
            </Card>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
