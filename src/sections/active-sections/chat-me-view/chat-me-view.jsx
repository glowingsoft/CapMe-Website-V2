import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';

import { Iconify } from 'src/components/iconify';
import HashtagSuggestions from 'src/components/hashtags/hashtag-suggestions';
import { HASHTAGS } from 'src/sections/active-sections/home-view/hashtags-mock';
import InterestsTab from './interests';
import SummaryTab from './summary';
import { AI_RESPONSES } from './mock';

const TABS = [
  { value: 'prompts', label: 'Prompts' },
  { value: 'interests', label: 'Interests' },
  { value: 'summary', label: 'Summary' },
];

const CARDS = [
  {
    title: 'Emotional Needs Decoder',
    subtitle: 'If this journal were a world, what would it look like?',
  },
  {
    title: 'World of ME',
    subtitle: 'If this journal were a world, what would it look like?',
  },
  {
    title: 'Top Content Type',
    subtitle: 'Type of content I share the most.',
  },
];


function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box component="img" src="/logo/logo-single.svg" sx={{ width: 18, height: 18 }} />
      </Box>
      <Box
        sx={{
          bgcolor: '#f7f7f8',
          border: '1px solid rgba(0,0,0,0.06)',
          px: 2,
          py: 1.5,
          borderRadius: '18px 18px 18px 4px',
          display: 'flex',
          gap: 0.6,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: '#bbb',
              animation: 'typingBounce 1.2s infinite',
              animationDelay: `${i * 0.2}s`,
              '@keyframes typingBounce': {
                '0%, 60%, 100%': { transform: 'translateY(0)' },
                '30%': { transform: 'translateY(-6px)' },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function ChatMeView() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tab = searchParams.get('tab') || 'prompts';
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [typewriterId, setTypewriterId] = React.useState(null);
  const [typewriterText, setTypewriterText] = React.useState('');
  const inputRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);
  const typewriterRef = React.useRef(null);

  const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
  const [chatHistoryDrawerOpen, setChatHistoryDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onChatHistoryChange = (e) => setChatHistoryDrawerOpen(e.detail);
    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('profileDrawerChange', onProfileChange);
    window.addEventListener('chatHistoryChange', onChatHistoryChange);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener('chatHistoryChange', onChatHistoryChange);
    };
  }, []);

  React.useEffect(() => {
    if (messages.length > 0 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, typewriterText]);

  // Typewriter: animate character by character using elapsed time so it continues in background tabs
  React.useEffect(() => {
    if (!typewriterId) return;
    const msg = messages.find((m) => m.id === typewriterId);
    if (!msg) return;
    const full = msg.content;
    const startTime = Date.now();
    setTypewriterText('');
    clearInterval(typewriterRef.current);
    typewriterRef.current = setInterval(() => {
      const i = Math.min(Math.floor((Date.now() - startTime) / 18), full.length);
      setTypewriterText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(typewriterRef.current);
        setTypewriterId(null);
      }
    }, 18);
    return () => clearInterval(typewriterRef.current);
  }, [typewriterId]);

  const anyRightDrawerOpen = accountDrawerOpen || profileDrawerOpen || chatHistoryDrawerOpen;

  const setTabWithUrl = React.useCallback((nextTab) => {
    const next = new URLSearchParams(location.search);
    if (nextTab === 'prompts') next.delete('tab');
    else next.set('tab', nextTab);
    navigate({ pathname: location.pathname, search: next.toString() ? `?${next.toString()}` : '' }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const sendMessage = React.useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping || typewriterId) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: trimmed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const id = Date.now() + 1;
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: 'assistant',
          content: response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTypewriterId(id);
    }, 1000 + Math.random() * 700);
  }, [isTyping, typewriterId]);

  const handleCardClick = React.useCallback((text) => {
    sendMessage(text);
  }, [sendMessage]);

  const handleSend = React.useCallback(() => {
    sendMessage(message);
  }, [message, sendMessage]);

  const handlePickHashtag = React.useCallback((tag) => {
    const value = message || '';
    const next = value.replace(/(?:^|\s)#([\p{L}\p{N}_]{0,32})$/u, (m, q) => m.replace(`#${q}`, `#${tag}`)) + ' ';
    setMessage(next);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [message]);

  const hasMessages = messages.length > 0;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#fff', height: 'calc(100vh - 105px)', display: 'flex', overflow: 'hidden', mr: anyRightDrawerOpen ? { md: '90px' } : 0, transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Tabs */}
        <Box sx={{ flexShrink: 0, px: { xs: 2, md: 4 }, pt: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTabWithUrl(v)}
            sx={{
              minHeight: 34,
              '& .MuiTabs-indicator': { bgcolor: '#4C4EFF', height: 3, borderRadius: 2 },
            }}
          >
            {TABS.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                label={t.label}
                sx={{
                  minHeight: 34,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  px: 2,
                  borderRadius: 1,
                  alignItems: 'flex-start',
                  '&.Mui-selected': { color: '#4C4EFF' },
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Scrollable body */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            px: { xs: 2, md: 4 },
            pt: hasMessages ? 3 : 3,
            pb: tab === 'prompts' ? 2 : 4,
            display: 'flex',
            justifyContent: 'center',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.12) transparent',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: '10px' },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 920 }}>

            {/* ── Prompts: initial suggestion state ── */}
            {tab === 'prompts' && !hasMessages && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box component="img" src="/logo/logo-single.svg" alt="Capme" sx={{ width: 70, height: 70 }} />
                </Box>

                <Stack spacing={2.5} sx={{ mb: 3 }}>
                  {CARDS.map((c) => (
                    <Box
                      key={c.title}
                      onClick={() => handleCardClick(c.subtitle)}
                      sx={{
                        bgcolor: '#f7f7f8',
                        borderRadius: 4,
                        px: { xs: 2.5, md: 4 },
                        py: { xs: 2.5, md: 3 },
                        textAlign: 'center',
                        border: '1px solid rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        transition: 'transform 0.12s, box-shadow 0.12s, border-color 0.12s',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0px 10px 30px rgba(0,0,0,0.10)',
                          borderColor: 'rgba(76,78,255,0.22)',
                        },
                      }}
                    >
                      <Typography fontSize={18} fontWeight={800} sx={{ mb: 0.6 }}>{c.title}</Typography>
                      <Typography fontSize={13.5} color="text.secondary">{c.subtitle}</Typography>
                    </Box>
                  ))}
                </Stack>

                <Typography textAlign="center" fontSize={14} color="text.secondary" sx={{ mb: 2 }}>
                  These are just a few recommended examples of what we can do!
                </Typography>
              </>
            )}

            {/* ── Prompts: chat messages ── */}
            {tab === 'prompts' && hasMessages && (
              <Stack spacing={2.5}>
                {messages.map((msg) => {
                      const isAnimating = msg.id === typewriterId;
                      const displayText = isAnimating ? typewriterText : msg.content;
                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-end',
                            gap: 1.5,
                          }}
                        >
                          {msg.role === 'assistant' && (
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                mb: 0.5,
                              }}
                            >
                              <Box component="img" src="/logo/logo-single.svg" sx={{ width: 18, height: 18 }} />
                            </Box>
                          )}

                          <Box
                            sx={{
                              maxWidth: '72%',
                              px: 2,
                              py: 1.3,
                              bgcolor: msg.role === 'user' ? '#4C4EFF' : '#f7f7f8',
                              color: msg.role === 'user' ? '#fff' : 'text.primary',
                              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              border: msg.role === 'assistant' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                              fontSize: 14,
                              lineHeight: 1.65,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {displayText}
                            {isAnimating && (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  width: '2px',
                                  height: '1em',
                                  bgcolor: '#4C4EFF',
                                  ml: '2px',
                                  verticalAlign: 'text-bottom',
                                  animation: 'cursorBlink 0.7s steps(1) infinite',
                                  '@keyframes cursorBlink': {
                                    '0%, 100%': { opacity: 1 },
                                    '50%': { opacity: 0 },
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      );
                    })}

                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </Stack>
            )}

            {tab === 'interests' && <InterestsTab />}
            {tab === 'summary' && <SummaryTab />}

          </Box>
        </Box>

        {/* Bottom input */}
        {tab === 'prompts' && (
          <Box sx={{ flexShrink: 0, px: { xs: 2, md: 4 }, pb: 2, pt: 1, bgcolor: '#fff' }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 980,
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 2.5,
                px: 1.25,
                py: 0.75,
                position: 'relative',
              }}
            >
              <InputBase
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type here..."
                inputRef={inputRef}
                multiline
                maxRows={4}
                sx={{ fontSize: 14, flex: 1 }}
              />
              <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: 52 }}>
                <HashtagSuggestions value={message} hashtags={HASHTAGS} onPick={handlePickHashtag} />
              </Box>
              <IconButton
                size="small"
                onClick={handleSend}
                disabled={!message.trim() || isTyping || !!typewriterId}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  bgcolor: '#4C4EFF',
                  color: '#fff',
                  '&:hover': { bgcolor: '#3b3bd6' },
                  '&.Mui-disabled': { bgcolor: '#c5c6ff', color: '#fff' },
                }}
              >
                <Iconify icon="mingcute:send-line" width={18} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
