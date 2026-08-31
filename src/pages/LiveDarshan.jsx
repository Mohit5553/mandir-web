import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { Heart, Users, MessageSquare, Radio, Calendar, Volume2, VolumeX, Shield, User, HelpCircle, Maximize, Minimize } from 'lucide-react';
import './LiveDarshan.css';

const SOCKET_URL = import.meta.env.VITE_USE_LOCAL_API === 'true' || 
  (['localhost', '127.0.0.1'].includes(window.location.hostname) && !window.Capacitor)
  ? 'http://localhost:5000'
  : 'https://mandir-backend-8pc7.onrender.com';

const LiveDarshan = () => {
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('Live Darshan');
  const [description, setDescription] = useState('');
  const [streamType, setStreamType] = useState('youtube');
  const [streamUrl, setStreamUrl] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Nickname
  const [nickname, setNickname] = useState(localStorage.getItem('devotee_nickname') || '');
  const [tempNickname, setTempNickname] = useState('');
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(!localStorage.getItem('devotee_nickname'));

  // Video State
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playerError, setPlayerError] = useState('');

  const socketRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const chatContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const isAdminPausedRef = useRef(false);
  const streamTypeRef = useRef(streamType);
  const streamUrlRef = useRef(streamUrl);

  useEffect(() => {
    streamTypeRef.current = streamType;
  }, [streamType]);

  useEffect(() => {
    streamUrlRef.current = streamUrl;
  }, [streamUrl]);

  useEffect(() => {
    // 1. Fetch current status
    const fetchStatus = async () => {
      try {
        const data = await api.getLiveStatus();
        if (data && !data.message) {
          setIsLive(data.isLive);
          setTitle(data.title || 'Live Darshan');
          setDescription(data.description || '');
          setStreamType(data.streamType || 'youtube');
          setStreamUrl(data.streamUrl || '');
          isAdminPausedRef.current = !!data.isPaused;
        }
      } catch (err) {
        console.error('Error fetching stream status:', err);
      }
    };

    // 2. Fetch Chat History
    const fetchChatHistory = async () => {
      try {
        const history = await api.getLiveChat();
        if (history && Array.isArray(history)) {
          setChatMessages(history);
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    fetchStatus();
    fetchChatHistory();

    // 3. Setup Socket Connection (Runs ONCE on mount)
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('📡 Viewer Socket Connected:', socket.id);
      socket.emit('join-live');
      if (streamTypeRef.current === 'webrtc' || !streamTypeRef.current) {
        socket.emit('viewer-join-stream');
      }
    });

    socket.emit('join-live');

    socket.on('viewer-count', (count) => {
      setViewerCount(count);
    });

    socket.on('stream-active', (data) => {
      if (data.isLive) {
        setIsLive(true);
        if (data.streamType) setStreamType(data.streamType);
        fetchStatus();
        if (data.streamType === 'webrtc') {
          setTimeout(() => {
            if (socketRef.current) socketRef.current.emit('viewer-join-stream');
          }, 300);
        }
      } else {
        setIsLive(false);
        cleanupVideoPlayer();
      }
    });

    socket.on('request-viewers-handshake', () => {
      console.log('📡 Admin requested WebRTC handshake...');
      if (socketRef.current) {
        socketRef.current.emit('viewer-join-stream');
      }
    });

    socket.on('new-chat-message', (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // WebRTC Signaling handlers
    socket.on('receive-offer', async ({ senderSocketId, offer }) => {
      console.log('📡 Received WebRTC offer from admin host');
      initWebRTCPeerConnection(senderSocketId, offer, socket);
    });

    socket.on('receive-ice-candidate', async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    });

    socket.on('peer-disconnected', () => {
      console.log('🔌 Host peer disconnected');
      if (streamTypeRef.current === 'webrtc') {
        setPlayerError('WebRTC stream disconnected by broadcaster.');
        cleanupWebRTC();
      }
    });

    socket.on('playback-state-change', ({ isPaused, currentTime }) => {
      console.log('📡 Synchronized playback state change:', isPaused, 'at time:', currentTime);
      isAdminPausedRef.current = isPaused;
      if (streamTypeRef.current === 'youtube' && ytPlayerRef.current) {
        if (isPaused) {
          ytPlayerRef.current.pauseVideo();
        } else {
          ytPlayerRef.current.playVideo();
        }
        if (currentTime !== undefined) {
          try {
            const ytTime = ytPlayerRef.current.getCurrentTime() || 0;
            if (Math.abs(ytTime - currentTime) > 2) {
              ytPlayerRef.current.seekTo(currentTime, true);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else if (videoRef.current) {
        if (isPaused) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(err => console.log('Video play failed:', err));
        }
        if (currentTime !== undefined) {
          const hlsTime = videoRef.current.currentTime || 0;
          if (Math.abs(hlsTime - currentTime) > 2) {
            videoRef.current.currentTime = currentTime;
          }
        }
      }
    });

    socket.on('sync-current-time', ({ currentTime }) => {
      console.log(`📡 Received sync-current-time: ${currentTime}s`);
      if (streamTypeRef.current === 'youtube' && ytPlayerRef.current) {
        try {
          const ytTime = ytPlayerRef.current.getCurrentTime() || 0;
          if (Math.abs(ytTime - currentTime) > 2) {
            console.log(`📡 Seeking YouTube to ${currentTime}s (diff: ${Math.abs(ytTime - currentTime)}s)`);
            ytPlayerRef.current.seekTo(currentTime, true);
          }
        } catch (e) {
          console.error(e);
        }
      } else if (videoRef.current) {
        const hlsTime = videoRef.current.currentTime || 0;
        if (Math.abs(hlsTime - currentTime) > 2) {
          console.log(`📡 Seeking Video to ${currentTime}s (diff: ${Math.abs(hlsTime - currentTime)}s)`);
          videoRef.current.currentTime = currentTime;
        }
      }
    });

    return () => {
      cleanupVideoPlayer();
      socket.disconnect();
    };
  }, []);

  // Handle player type initialization on stream settings changes
  useEffect(() => {
    if (isLive) {
      setPlayerError('');
      cleanupVideoPlayer();
      
      if (streamType === 'youtube' && streamUrl) {
        initYoutubePlayer();
      } else if (streamType === 'hls' && streamUrl && videoRef.current) {
        initHlsPlayer();
      } else if (streamType === 'webrtc') {
        // Request host to send offer
        if (socketRef.current) {
          console.log('📡 Emitting viewer-join-stream to request WebRTC offer...');
          socketRef.current.emit('viewer-join-stream');
        }
      }
    }
  }, [isLive, streamType, streamUrl]);

  // Auto-retry WebRTC handshake if video stream is not attached
  useEffect(() => {
    let interval;
    if (isLive && streamType === 'webrtc') {
      interval = setInterval(() => {
        if (socketRef.current && (!remoteStreamRef.current || (videoRef.current && !videoRef.current.srcObject))) {
          console.log('📡 Auto-retrying WebRTC handshake for viewer...');
          socketRef.current.emit('viewer-join-stream');
        }
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive, streamType]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement || 
           document.webkitFullscreenElement || 
           document.mozFullScreenElement || 
           document.msFullscreenElement)
      );
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const container = document.querySelector('.player-container');
    if (container) {
      if (!document.fullscreenElement && 
          !document.webkitFullscreenElement && 
          !document.mozFullScreenElement && 
          !document.msFullscreenElement) {
        
        if (container.requestFullscreen) {
          container.requestFullscreen().catch(err => console.error(err));
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Dynamic HLS.js Loader
  const loadHlsScript = () => {
    return new Promise((resolve) => {
      if (window.Hls) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.0/dist/hls.min.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const initHlsPlayer = async () => {
    const scriptLoaded = await loadHlsScript();
    if (!scriptLoaded) {
      setPlayerError('Failed to load HLS.js video framework.');
      return;
    }

    if (videoRef.current) {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;

        hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
          if (isAdminPausedRef.current) {
            videoRef.current.pause();
          } else {
            videoRef.current.play().catch(err => {
              console.warn('HLS autoplay blocked. Muting and retrying...', err);
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(e => console.error(e));
            });
          }
        });

        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setPlayerError('Fatal playback error. Trying to reconnect...');
                break;
            }
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
        if (isAdminPausedRef.current) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(err => {
            console.warn('Native HLS autoplay blocked. Muting...', err);
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(e => console.log(e));
          });
        }
      } else {
        setPlayerError('Your browser does not support HLS video streaming.');
      }
    }
  };

  const pendingCandidatesRef = useRef([]);

  const initWebRTCPeerConnection = async (hostSocketId, offer, socket) => {
    cleanupWebRTC();

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    peerConnectionRef.current = pc;
    pendingCandidatesRef.current = [];

    pc.ontrack = (event) => {
      console.log('📡 Received track from Host:', event.track, 'Streams:', event.streams);
      setPlayerError('');
      
      let stream = (event.streams && event.streams[0]) ? event.streams[0] : null;
      if (!stream) {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(event.track);
        stream = remoteStreamRef.current;
      } else {
        remoteStreamRef.current = stream;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name === 'AbortError') return;
            console.warn('Autoplay with sound blocked. Retrying muted...', err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(e => console.error('Play error after mute:', e));
            }
          });
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send-ice-candidate', {
          targetSocketId: hostSocketId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`📡 Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        setPlayerError('');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setPlayerError('WebRTC Connection to Broadcaster failed. Trying to reconnect...');
      }
    };

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Flush queued candidates
      if (pendingCandidatesRef.current.length > 0) {
        for (const cand of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(() => {});
        }
        pendingCandidatesRef.current = [];
      }

      const answer = await pc.createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      });
      await pc.setLocalDescription(answer);
      socket.emit('send-answer', {
        targetSocketId: hostSocketId,
        answer
      });
    } catch (err) {
      console.error('WebRTC setup error:', err);
      setPlayerError('Failed to establish peer stream.');
    }
  };

  const cleanupWebRTC = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const loadYoutubeScript = () => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve(true);
        return;
      }
      if (document.getElementById('youtube-iframe-api-script')) {
        const checkReady = () => {
          if (window.YT && window.YT.Player) {
            resolve(true);
          } else {
            setTimeout(checkReady, 50);
          }
        };
        checkReady();
        return;
      }
      
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      const oldReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (oldReady) oldReady();
        resolve(true);
      };
    });
  };

  const initYoutubePlayer = async () => {
    await loadYoutubeScript();
    
    const checkContainer = () => {
      const el = document.getElementById('youtube-player-placeholder');
      if (el) {
        if (window.YT && window.YT.Player) {
          try {
            ytPlayerRef.current = new window.YT.Player('youtube-player-placeholder', {
              videoId: streamUrl,
              playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                rel: 0,
                modestbranding: 1,
                fs: 0,
                playsinline: 1,
                iv_load_policy: 3
              },
              events: {
                onReady: (event) => {
                  event.target.unMute();
                  setIsMuted(false);
                  if (isAdminPausedRef.current) {
                    event.target.pauseVideo();
                  } else {
                    event.target.playVideo();
                  }
                },
                onStateChange: (event) => {
                  if (event.data === 2 && !isAdminPausedRef.current) { // 2 = PAUSED
                    // Autoplay block recovery
                    console.log('📡 YouTube autoplay blocked. Muting and retrying...');
                    event.target.mute();
                    setIsMuted(true);
                    event.target.playVideo();
                  }
                },
                onError: (event) => {
                  console.error('YouTube player error:', event.data);
                  setPlayerError('Error playing YouTube Live feed.');
                }
              }
            });
          } catch (e) {
            console.error('Failed to create YouTube player:', e);
          }
        }
      } else {
        setTimeout(checkContainer, 100);
      }
    };
    checkContainer();
  };

  const cleanupVideoPlayer = () => {
    cleanupWebRTC();
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (e) {
        console.error(e);
      }
      ytPlayerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.src = '';
    }
  };

  // Chat message submit
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    if (!nickname) {
      setIsNicknameModalOpen(true);
      return;
    }

    socketRef.current.emit('send-chat-message', {
      username: nickname,
      message: newMessage,
      isAdmin: false
    });
    setNewMessage('');
  };

  // Nickname Submit
  const handleSaveNickname = (e) => {
    e.preventDefault();
    if (!tempNickname.trim()) return;

    const formattedNickname = tempNickname.trim().substring(0, 15);
    setNickname(formattedNickname);
    localStorage.setItem('devotee_nickname', formattedNickname);
    setIsNicknameModalOpen(false);
  };

  const toggleMute = () => {
    if (streamType === 'youtube' && ytPlayerRef.current) {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
      } else {
        ytPlayerRef.current.mute();
        setIsMuted(true);
      }
    } else if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="live-darshan-page bg-mandala">
      <div className="container">
        {isLive ? (
          <div className="darshan-live-active fade-in">
            {/* Header */}
            <div className="live-header glass">
              <div className="live-badge-row">
                <span className="live-pill blinking">
                  <Radio size={16} /> लाइव दर्शन चालू है
                </span>
                <span className="viewer-pill">
                  <Users size={16} /> {viewerCount} श्रद्धालु देख रहे हैं
                </span>
              </div>
              <h2>{title}</h2>
              {description && <p className="text-light">{description}</p>}
            </div>

            {/* Main Video & Chat Grid */}
            <div className="darshan-grid">
              {/* Left Video Player */}
              <div className="player-container glass">
                {playerError && (
                  <div className="player-error-overlay">
                    <p>{playerError}</p>
                    <button 
                      onClick={() => {
                        setPlayerError('');
                        cleanupVideoPlayer();
                        if (streamType === 'hls') initHlsPlayer();
                        else if (streamType === 'webrtc' && socketRef.current) socketRef.current.emit('viewer-join-stream');
                      }}
                      className="btn btn-primary"
                    >
                      पुनः प्रयास करें
                    </button>
                  </div>
                )}
                
                {streamType === 'youtube' ? (
                  <div className="video-player-box">
                    <div id="youtube-player-placeholder" style={{ width: '100%', height: '100%' }}></div>
                    <div className="custom-player-controls" style={{ zIndex: 10 }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button onClick={toggleMute} className="btn-mute" title={isMuted ? 'ध्वनि चालू करें' : 'ध्वनि बंद करें'}>
                          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <button onClick={toggleFullscreen} className="btn-mute" title={isFullscreen ? 'फुलस्क्रीन बंद करें' : 'फुलस्क्रीन करें'}>
                          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                      </div>
                      <span className="live-tag">लाइव दर्शन फ़ीड</span>
                    </div>
                  </div>
                ) : (
                  <div className="video-player-box">
                    <video
                      ref={(el) => {
                        videoRef.current = el;
                        if (el && remoteStreamRef.current && el.srcObject !== remoteStreamRef.current) {
                          console.log('📡 Ref callback attaching stream to video element...');
                          el.srcObject = remoteStreamRef.current;
                          const p = el.play();
                          if (p !== undefined) {
                            p.catch(err => {
                              console.warn('Autoplay blocked on ref callback. Muting...', err);
                              el.muted = true;
                              setIsMuted(true);
                              el.play().catch(e => console.error(e));
                            });
                          }
                        }
                      }}
                      autoPlay={!isAdminPausedRef.current}
                      playsInline
                      muted={isMuted}
                      onPause={() => {
                        if (!isAdminPausedRef.current && videoRef.current) {
                          videoRef.current.play().catch((err) => {
                            console.warn('Autoplay block on pause. Muting and retrying...');
                            videoRef.current.muted = true;
                            setIsMuted(true);
                            videoRef.current.play().catch(e => console.log(e));
                          });
                        }
                      }}
                      className="html5-live-video"
                    />
                    <div className="custom-player-controls" style={{ zIndex: 10 }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button onClick={toggleMute} className="btn-mute" title={isMuted ? 'ध्वनि चालू करें' : 'ध्वनि बंद करें'}>
                          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <button onClick={toggleFullscreen} className="btn-mute" title={isFullscreen ? 'फुलस्क्रीन बंद करें' : 'फुलस्क्रीन करें'}>
                          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                      </div>
                      <span className="live-tag">लाइव दर्शन फ़ीड</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Chat Container */}
              <div className="chat-container glass">
                <div className="chat-header">
                  <h3>
                    <MessageSquare size={18} /> लाइव संवाद / प्रार्थना कक्ष
                  </h3>
                  {nickname && (
                    <button 
                      onClick={() => setIsNicknameModalOpen(true)}
                      className="btn-change-nickname"
                      title="नाम बदलें"
                    >
                      <User size={14} /> नाम: {nickname}
                    </button>
                  )}
                </div>

                <div className="chat-timeline" ref={chatContainerRef}>
                  {chatMessages.length === 0 ? (
                    <div className="empty-chat">
                      <MessageSquare size={36} className="text-light" />
                      <p>लाइव दर्शन में आपका स्वागत है! अपनी मनोकामनाएँ लिखें अथवा 'हर हर महादेव' कहें।</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg._id || Math.random()} className={`msg-bubble ${msg.isAdmin ? 'admin-msg' : ''}`}>
                        <div className="msg-info">
                          <span className="username">
                            {msg.isAdmin && <Shield size={12} className="admin-badge" />}
                            {msg.username}
                            {msg.isAdmin && <span className="admin-label">मंदिर ट्रस्ट</span>}
                          </span>
                          <span className="time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="msg-text">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendChatMessage} className="chat-footer">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={nickname ? "अपनी प्रार्थना या टिप्पणी लिखें..." : "अपना संदेश दर्ज करें..."}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-chat-send">
                    भेजें
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Offline Darshan Timing / Schedule Page */
          <div className="darshan-offline fade-in">
            <div className="offline-hero glass">
              <Radio size={48} className="pulse-offline-icon" />
              <h1>लाइव दर्शन अभी उपलब्ध नहीं है</h1>
              <p className="subtitle">
                आरती एवं विशेष अभिषेक का लाइव प्रसारण निर्धारित समय पर किया जाता है। आप नीचे दैनिक मंदिर समय सारणी देख सकते हैं।
              </p>
            </div>

            <div className="offline-content-grid">
              {/* Daily Timetable */}
              <div className="timetable-section glass">
                <h2>दैनिक आरती एवं दर्शन समय सारणी</h2>
                <div className="timetable-grid">
                  <div className="time-card">
                    <strong>मंगला आरती</strong>
                    <span>प्रातः 05:30 - 06:00</span>
                  </div>
                  <div className="time-card">
                    <strong>प्रातः अभिषेक</strong>
                    <span>प्रातः 07:00 - 08:30</span>
                  </div>
                  <div className="time-card">
                    <strong>भव्य श्रृंगार एवं आरती</strong>
                    <span>सायं 06:30 - 07:15</span>
                  </div>
                  <div className="time-card">
                    <strong>शयन आरती</strong>
                    <span>रात्रि 09:00 - 09:30</span>
                  </div>
                </div>
              </div>

              {/* Devotional CTA */}
              <div className="support-section glass">
                <h2>मंदिर ट्रस्ट को सहयोग प्रदान करें</h2>
                <p>
                  मंदिर परिसर के रख-रखाव, दैनिक अन्नक्षेत्र (निशुल्क भोजन वितरण) और धार्मिक आयोजनों में अपना पावन योगदान दें।
                </p>
                <div className="cta-actions">
                  <Link to="/donate" className="btn btn-primary">
                    <Heart size={18} /> दान अर्पित करें
                  </Link>
                  <Link to="/events" className="btn btn-outline">
                    <Calendar size={18} /> कार्यक्रम देखें
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nickname Prompt Modal */}
        {isNicknameModalOpen && (
          <div className="nickname-modal-overlay">
            <div className="nickname-modal glass">
              <div className="modal-header">
                <h3>चैट के लिए अपना नाम दर्ज करें</h3>
                {!isLive && <p className="text-light">लाइव संवाद कक्ष में भाग लेने के लिए अपना नाम लिखें।</p>}
              </div>
              <form onSubmit={handleSaveNickname} className="modal-form">
                <input
                  type="text"
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="अपना नाम दर्ज करें (जैसे: राहुल शर्मा)"
                  maxLength={15}
                  required
                  autoFocus
                />
                <div className="modal-buttons">
                  {nickname && (
                    <button 
                      type="button" 
                      onClick={() => setIsNicknameModalOpen(false)} 
                      className="btn btn-outline"
                    >
                      रद्द करें
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    नाम सहेजें
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDarshan;
