import React, { useState, useEffect } from 'react';
import { Layout, Typography, ConfigProvider, theme, message, Calendar, Tag, Tooltip, Segmented, Card } from 'antd';
import { fetchVideos } from './api/youtube';
import { YoutubeFilled, PlayCircleOutlined, ClockCircleOutlined, VideoCameraOutlined, CalendarOutlined, TableOutlined } from '@ant-design/icons';
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
    const listData = [];
    const dateString = value.format('YYYY-MM-DD');

    data.forEach(item => {
      const itemDate = dayjs(item.publishedAt).format('YYYY-MM-DD');
      if (itemDate === dateString) {
        listData.push(item);
      }
    });
    return listData;
  };

  const getTypeTag = (type) => {
    switch (type) {
      case 'Live': return <Tag color="red">Live</Tag>;
      case 'Short': return <Tag color="purple">Short</Tag>;
      case 'Upcoming': return <Tag color="orange">Upcoming</Tag>;
      default: return <Tag color="geekblue">Video</Tag>;
    }
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item) => (
          <li key={item.id} style={{ marginBottom: 8 }}>
            <Tooltip title={item.title}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                <div style={{
                  background: '#fff',
                  padding: '8px',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: '1px solid #f0f0f0',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    {item.type === 'Live' ? <VideoCameraOutlined style={{ marginRight: 4, color: 'red' }} /> :
                      item.type === 'Short' ? <ClockCircleOutlined style={{ marginRight: 4, color: 'purple' }} /> :
                        <PlayCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />}
                    <Text strong ellipsis style={{ width: '100%' }}>{item.title}</Text>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {getTypeTag(item.type)}
                  </div>
                </div>
              </a>
            </Tooltip>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#ff0000',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          borderBottom: '1px solid #e9ecef',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: 72,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <YoutubeFilled style={{ fontSize: 32, color: '#ff0000', marginRight: 12 }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Channel Dashboard
            </Title>
          </div>

          <Segmented
            options={[
              { label: 'Table List', value: 'table', icon: <TableOutlined /> },
              { label: 'Calendar', value: 'calendar', icon: <CalendarOutlined /> },
            ]}
            value={view}
            onChange={setView}
            size="large"
          />
        </Header>

        <Content style={{ padding: '24px', maxWidth: 1600, margin: '0 auto', width: '100%' }}>
          {view === 'calendar' ? (
            <Card bordered={false} bodyStyle={{ padding: 24 }} style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Calendar
                cellRender={dateCellRender}
                style={{ background: 'transparent' }}
              />
            </Card>
          ) : (
            <Card bordered={false} bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <VideoTable data={data} loading={loading} />
            </Card>
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
