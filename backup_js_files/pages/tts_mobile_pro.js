import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { Button, Input, List, Space, Spin, message } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { PlayCircleOutlined, MenuOutlined, SettingOutlined, SoundOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import styles from './tts_mobile_pro.less';
const TTSMobilePro = () => {
    const intl = useIntl();
    const [inputText, setInputText] = useState('');
    const [audioList, setAudioList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const audioRefs = useRef(new Map());
    const animationRefs = useRef(new Map());
    // 初始化测试数据
    useEffect(() => {
        const testAudio = {
            id: `test-${Date.now()}`,
            text: '这是一条测试音频，用于演示文字转语音功能。',
            audioUrl: '/test.wav',
            isPlaying: false,
            progress: 0,
        };
        setAudioList([testAudio]);
    }, []);
    // 播放音频
    const playAudio = (item) => {
        const audio = audioRefs.current.get(item.id);
        if (!audio)
            return;
        if (item.isPlaying) {
            // 暂停
            audio.pause();
            cancelAnimationFrame(animationRefs.current.get(item.id) || 0);
        }
        else {
            // 播放
            audio.play().catch(err => {
                message.error('音频播放失败：' + err.message);
            });
            // 启动进度动画
            const updateProgress = () => {
                if (audio.duration) {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    setAudioList(prev => prev.map(a => a.id === item.id ? { ...a, progress } : a));
                }
                animationRefs.current.set(item.id, requestAnimationFrame(updateProgress));
            };
            updateProgress();
        }
        // 更新播放状态
        setAudioList(prev => prev.map(a => a.id === item.id ? { ...a, isPlaying: !a.isPlaying } : a));
    };
    // 音频结束事件
    const handleAudioEnded = (id) => {
        setAudioList(prev => prev.map(a => a.id === id ? { ...a, isPlaying: false, progress: 0 } : a));
        cancelAnimationFrame(animationRefs.current.get(id) || 0);
    };
    // 生成语音
    const generateAudio = async () => {
        if (!inputText.trim()) {
            message.warning('请输入文本内容');
            return;
        }
        setLoading(true);
        try {
            // 调用HTTP接口获取音频链接（这里模拟接口调用）
            // 实际项目中替换为真实接口请求
            const mockAudioUrl = '/test.wav'; // 模拟返回的音频链接
            // 创建新的音频条目
            const newItem = {
                id: `audio-${Date.now()}`,
                text: inputText.trim().substring(0, 20), // 只显示前20个字
                audioUrl: mockAudioUrl,
                isPlaying: false,
                progress: 0,
            };
            // 插入列表数据结构尾部（注意：最新的数据在最上面，所以需要unshift）
            setAudioList(prev => [newItem, ...prev].slice(0, 10)); // 最多展示10条
            setInputText(''); // 清空输入框
            message.success('语音生成成功');
        }
        catch (error) {
            message.error('语音生成失败：' + error.message);
        }
        finally {
            setLoading(false);
        }
    };
    // 上拉加载更多
    const onLoadMore = () => {
        setLoadMoreLoading(true);
        // 模拟加载历史数据
        setTimeout(() => {
            // 这里可以添加加载历史数据的逻辑
            setLoadMoreLoading(false);
            message.info('已加载全部数据');
        }, 1500);
    };
    // 加载更多的组件
    const loadMore = () => {
        return (_jsx("div", { style: { textAlign: 'center', padding: '16px 0' }, children: loadMoreLoading ? _jsx(Spin, {}) : '上拉加载更多' }));
    };
    // 渲染音频列表项
    const renderAudioItem = (item) => (_jsxs("div", { className: styles.audioItem, children: [_jsxs("div", { className: styles.playBtnContainer, children: [_jsx("div", { className: `${styles.playBtn} ${item.isPlaying ? styles.playing : ''}`, style: { background: `conic-gradient(#00ff88 ${item.progress}%, transparent ${item.progress}%)` }, onClick: () => playAudio(item), children: _jsx("div", { className: styles.playIcon, children: _jsx(PlayCircleOutlined, {}) }) }), _jsx("audio", { ref: el => {
                            if (el)
                                audioRefs.current.set(item.id, el);
                        }, src: item.audioUrl, onEnded: () => handleAudioEnded(item.id) })] }), _jsx("div", { className: styles.textContent, children: item.text }), _jsx("div", { className: styles.menuBtn, children: _jsx(MenuOutlined, {}) })] }, item.id));
    return (_jsxs("div", { className: styles.container, children: [_jsxs("div", { className: styles.header, children: [_jsx("div", { className: styles.title, children: intl.formatMessage({ id: 'tts.title', defaultMessage: '文字转语音' }) }), _jsx(Button, { type: "primary", ghost: true, className: styles.registerBtn, children: intl.formatMessage({ id: 'tts.register', defaultMessage: '注册' }) })] }), _jsx("div", { className: styles.banner, children: _jsxs("div", { className: styles.bannerPlaceholder, children: [_jsx(SoundOutlined, { className: styles.bannerIcon }), _jsx("span", { children: intl.formatMessage({ id: 'tts.banner', defaultMessage: 'banner 图片' }) })] }) }), _jsx("div", { className: styles.contentList, children: _jsx(InfiniteScroll, { initialLoad: false, pageStart: 0, loadMore: onLoadMore, hasMore: !loadMoreLoading, useWindow: false, children: _jsx(List, { dataSource: audioList, renderItem: renderAudioItem, locale: { emptyText: '暂无音频数据' }, loadMore: loadMore() }) }) }), _jsxs("div", { className: styles.footer, children: [_jsx("div", { className: styles.inputContainer, children: _jsx(Input.TextArea, { placeholder: intl.formatMessage({ id: 'tts.inputPlaceholder', defaultMessage: '输入中英文' }), value: inputText, onChange: e => setInputText(e.target.value), onPressEnter: generateAudio, autoSize: { minRows: 1, maxRows: 3 } }) }), _jsxs(Space, { className: styles.footerButtons, children: [_jsx(Button, { type: "primary", onClick: generateAudio, loading: loading, className: styles.generateBtn, children: intl.formatMessage({ id: 'tts.generate', defaultMessage: '生成' }) }), _jsx(Button, { icon: _jsx(SettingOutlined, {}), className: styles.settingBtn })] })] })] }));
};
export default TTSMobilePro;
