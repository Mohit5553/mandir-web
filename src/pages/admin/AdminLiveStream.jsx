import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { hasPermission } from '../../hooks/usePermission';
import { io } from 'socket.io-client';
import { Play, Square, Video, VideoOff, Settings, Users, MessageSquare, Trash2, Shield, Radio, Sparkles, RefreshCw } from 'lucide-react';
import './AdminLiveStream.css';

const SOCKET_URL = import.meta.env.VITE_USE_LOCAL_API === 'true' || 
  (['localhost', '127.0.0.1'].includes(window.location.hostname) && !window.Capacitor)
  ? 'http://localhost:5000'
  : 'https://mandir-backend-8pc7.onrender.com';

const AdminLiveStream = () => {
  const canUpdate = hasPermission('Live Stream', 'update');
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('Live Darshan');
  const [description, setDescription] = useState('Live streaming from Shree Manvat Baba Mahashiv Mandir');
  const [streamType, setStreamType] = useState('youtube');
  const [streamUrl, setStreamUrl] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // WebRTC States
  const [cameraActive, setCameraActive] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' is front, 'environment' is back camera
  
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // socketId -> RTCPeerConnection
  const chatContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const isAdminPausedRef = useRef(false);
  const streamTypeRef = useRef(streamType);

  useEffect(() => {
    streamTypeRef.current = streamType;
  }, [streamType]);

  // Get Admin profile details
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  useEffect(() => {
    // 1. Fetch initial live status
    const fetchLiveStatus = async () => {
      try {
        const status = await api.getLiveStatus();
        if (status && !status.message) {
          setIsLive(status.isLive);
          setTitle(status.title || 'Live Darshan');
          setDescription(status.description || '');
          setStreamType(status.streamType || 'youtube');
          setStreamUrl(status.streamUrl || '');
          isAdminPausedRef.current = !!status.isPaused;
        }
      } catch (err) {
        console.error('Error fetching stream status:', err);
      } finally {
        setIsLoading(false);
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

    fetchLiveStatus();
    fetchChatHistory();

    // 3. Setup Socket connection
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔑 Admin socket connected:', socket.id);
      socket.emit('join-live', { isAdmin: true });
      if (localStreamRef.current) {
        socket.emit('request-viewers-handshake');
      }
    });

    socket.emit('join-live', { isAdmin: true });

    socket.on('viewer-count', (count) => {
      setViewerCount(count);
    });

    socket.on('new-chat-message', (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on('request-current-time', ({ requesterId }) => {
      let currentTime = 0;
      if (streamTypeRef.current === 'youtube' && ytPlayerRef.current) {
        try {
          currentTime = ytPlayerRef.current.getCurrentTime() || 0;
        } catch (e) {
          console.error('Error getting youtube player current time:', e);
        }
      } else if (videoRef.current) {
        currentTime = videoRef.current.currentTime || 0;
      }
      console.log(`📡 Admin sending current playback position (${currentTime}s) to viewer ${requesterId}`);
      socket.emit('send-current-time', { requesterId, currentTime });
    });

    // WebRTC Signaling Handlers (Relaying messages from Viewers)
    socket.on('viewer-joined-stream', async ({ socketId }) => {
      console.log(`📡 Viewer joined stream: ${socketId}`);
      if (localStreamRef.current) {
        createPeerConnection(socketId, socket, localStreamRef.current);
      } else {
        console.warn('⚠️ Admin localStreamRef.current is null when viewer requested stream!');
      }
    });

    socket.on('receive-answer', async ({ senderSocketId, answer }) => {
      console.log(`📡 Received WebRTC answer from: ${senderSocketId}`);
      const pc = peerConnectionsRef.current[senderSocketId];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
          console.error('Error setting remote description:', e);
        }
      }
    });

    socket.on('receive-ice-candidate', async ({ senderSocketId, candidate }) => {
      const pc = peerConnectionsRef.current[senderSocketId];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate:', e);
        }
      }
    });

    socket.on('peer-disconnected', (socketId) => {
      console.log(`🔌 Peer disconnected: ${socketId}`);
      closePeerConnection(socketId);
    });

    return () => {
      // Cleanup WebRTC & Socket
      stopCameraAndBroadcast();
      socket.disconnect();
    };
  }, []);

  // Scroll to bottom of chat container only
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle player type initialization on stream settings changes for admin preview
  useEffect(() => {
    if (isLive) {
      cleanupVideoPlayer();
      if (streamType === 'youtube' && streamUrl) {
        initYoutubePlayer();
      } else if (streamType === 'hls' && streamUrl) {
        initHlsPlayer();
      }
    } else {
      cleanupVideoPlayer();
    }
  }, [isLive, streamType, streamUrl]);

  const loadYoutubeScript = () => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve(true);
        return;
      }
      if (document.getElementById('youtube-iframe-api-script-admin')) {
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
      tag.id = 'youtube-iframe-api-script-admin';
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
      const el = document.getElementById('admin-youtube-player-placeholder');
      if (el) {
        if (window.YT && window.YT.Player) {
          try {
            ytPlayerRef.current = new window.YT.Player('admin-youtube-player-placeholder', {
              videoId: streamUrl,
              playerVars: {
                autoplay: 1,
                controls: 1,
                rel: 0
              },
              events: {
                onReady: (event) => {
                  if (isAdminPausedRef.current) {
                    event.target.pauseVideo();
                  }
                },
                onStateChange: (event) => {
                  if (socketRef.current) {
                    const currentTime = event.target.getCurrentTime() || 0;
                    if (event.data === 1) { // 1 = PLAYING
                      isAdminPausedRef.current = false;
                      socketRef.current.emit('playback-state-change', { isPaused: false, currentTime });
                    } else if (event.data === 2) { // 2 = PAUSED
                      isAdminPausedRef.current = true;
                      socketRef.current.emit('playback-state-change', { isPaused: true, currentTime });
                    }
                  }
                }
              }
            });
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        setTimeout(checkContainer, 100);
      }
    };
    checkContainer();
  };

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
    if (scriptLoaded && videoRef.current) {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;
        if (isAdminPausedRef.current) {
          videoRef.current.pause();
        }
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = streamUrl;
        if (isAdminPausedRef.current) {
          videoRef.current.pause();
        }
      }
    }
  };

  const cleanupVideoPlayer = () => {
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

  const handleVideoPlay = () => {
    if (socketRef.current) {
      const currentTime = videoRef.current ? videoRef.current.currentTime : 0;
      isAdminPausedRef.current = false;
      socketRef.current.emit('playback-state-change', { isPaused: false, currentTime });
    }
  };

  const handleVideoPause = () => {
    if (socketRef.current) {
      const currentTime = videoRef.current ? videoRef.current.currentTime : 0;
      isAdminPausedRef.current = true;
      socketRef.current.emit('playback-state-change', { isPaused: true, currentTime });
    }
  };

  // Setup Peer Connection for a viewer
  const createPeerConnection = async (viewerSocketId, socket, stream) => {
    closePeerConnection(viewerSocketId);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ]
    });

    peerConnectionsRef.current[viewerSocketId] = pc;

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('send-ice-candidate', {
          targetSocketId: viewerSocketId,
          candidate: event.candidate
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`📡 Peer connection state for ${viewerSocketId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        closePeerConnection(viewerSocketId);
      }
    };

    try {
      const offer = await pc.createOffer({
        offerToReceiveVideo: false,
        offerToReceiveAudio: false
      });
      await pc.setLocalDescription(offer);
      socket.emit('send-offer', {
        targetSocketId: viewerSocketId,
        offer
      });
    } catch (err) {
      console.error('Error creating WebRTC offer:', err);
    }
  };

  const closePeerConnection = (socketId) => {
    const pc = peerConnectionsRef.current[socketId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[socketId];
    }
  };

  // Turn webcam on/off
  const toggleCamera = async () => {
    if (cameraActive) {
      stopCamera();
    } else {
      try {
        setErrorMessage('');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: facingMode
          },
          audio: true
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStream(stream);
        localStreamRef.current = stream;
        setCameraActive(true);

        // Auto sync isLive status in DB and notify all viewers
        try {
          await api.updateLiveStatus({
            isLive: true,
            title: title || 'श्री मन्वत बाबा लाइव दर्शन',
            description: description || 'मंदिर परिसर से सीधा प्रसारण',
            streamType: 'webrtc',
            streamUrl: ''
          });
          setIsLive(true);
          if (socketRef.current) {
            socketRef.current.emit('stream-active', { isLive: true, streamType: 'webrtc' });
            socketRef.current.emit('request-viewers-handshake');
          }
        } catch (e) {
          console.error('Error auto updating live status on camera start:', e);
        }
      } catch (err) {
        console.error('Webcam access failed:', err);
        setErrorMessage('Could not access Webcam or Microphone. Please check browser permissions.');
      }
    }
  };

  // Switch camera direction
  const switchCamera = async () => {
    if (!cameraActive || !localStreamRef.current) return;
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    try {
      setErrorMessage('');
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: newFacingMode
        }
      });
      
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
      }
      
      const newVideoTrack = newStream.getVideoTracks()[0];
      const audioTracks = localStreamRef.current.getAudioTracks();
      
      const combinedTracks = [];
      if (newVideoTrack) combinedTracks.push(newVideoTrack);
      combinedTracks.push(...audioTracks);
      
      const combinedStream = new MediaStream(combinedTracks);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = combinedStream;
      }
      
      setLocalStream(combinedStream);
      localStreamRef.current = combinedStream;
      
      // Replace the video track in all active RTCPeerConnections
      if (newVideoTrack) {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });
      }
    } catch (err) {
      console.error('Failed to switch camera:', err);
      setErrorMessage('Could not access the requested camera direction.');
    }
  };

  const stopCamera = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setLocalStream(null);
    localStreamRef.current = null;
    setCameraActive(false);

    // Close all peer connections
    Object.keys(peerConnectionsRef.current).forEach((socketId) => {
      closePeerConnection(socketId);
    });

    // Auto sync isLive: false in DB
    try {
      await api.updateLiveStatus({
        isLive: false,
        title,
        description,
        streamType: 'webrtc'
      });
      setIsLive(false);
      if (socketRef.current) {
        socketRef.current.emit('stream-active', { isLive: false, streamType: 'webrtc' });
      }
    } catch (e) {
      console.error('Error auto updating live status on camera stop:', e);
    }
  };

  const stopCameraAndBroadcast = () => {
    stopCamera();
    cleanupVideoPlayer();
  };

  // Update stream settings and go Live
  const handleStartStream = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let activeStream = localStreamRef.current;

    if (streamType === 'webrtc' && !activeStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: facingMode
          },
          audio: true
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLocalStream(stream);
        localStreamRef.current = stream;
        setCameraActive(true);
        activeStream = stream;
      } catch (err) {
        console.error('Webcam access failed:', err);
        setErrorMessage('Could not access Webcam or Microphone. Please check browser permissions and try again.');
        return;
      }
    }

    if (streamType !== 'webrtc' && !streamUrl) {
      setErrorMessage('Please provide a stream URL or YouTube Video ID.');
      return;
    }

    try {
      const streamData = {
        isLive: true,
        title,
        description,
        streamType,
        streamUrl: streamType === 'webrtc' ? '' : streamUrl
      };

      const result = await api.updateLiveStatus(streamData);
      if (result && !result.message) {
        setIsLive(true);
        setSuccessMessage('Stream started successfully!');
        
        // Notify socket
        if (socketRef.current) {
          socketRef.current.emit('stream-active', { isLive: true, streamType });
          if (streamType === 'webrtc') {
            socketRef.current.emit('request-viewers-handshake');
          }
        }
      } else {
        setErrorMessage(result.message || 'Failed to start stream.');
      }
    } catch (err) {
      setErrorMessage('Server error going live.');
    }
  };

  // Turn stream Off
  const handleStopStream = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const result = await api.updateLiveStatus({
        isLive: false,
        title,
        description,
        streamType,
        streamUrl: streamType === 'webrtc' ? '' : streamUrl
      });

      if (result && !result.message) {
        setIsLive(false);
        setSuccessMessage('Stream stopped successfully.');
        stopCamera();
        
        // Notify socket
        if (socketRef.current) {
          socketRef.current.emit('stream-active', { isLive: false });
        }
      } else {
        setErrorMessage(result.message || 'Failed to stop stream.');
      }
    } catch (err) {
      setErrorMessage('Server error stopping stream.');
    }
  };

  // Send a Chat Message as Admin
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('send-chat-message', {
      username: adminUser.name || 'Admin',
      message: newMessage,
      isAdmin: true
    });
    setNewMessage('');
  };

  // Clear Chat history
  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear the entire chat history?')) return;
    try {
      const result = await api.clearLiveChat();
      if (result && !result.message) {
        setChatMessages([]);
        setSuccessMessage('Chat history cleared!');
      } else {
        setErrorMessage(result.message || 'Failed to clear chat.');
      }
    } catch (err) {
      setErrorMessage('Server error clearing chat.');
    }
  };

  if (isLoading) {
    return (
      <div className="admin-live-loading">
        <div className="spinner"></div>
        <p>लाइव दर्शन कंट्रोल कंसोल लोड हो रहा है...</p>
      </div>
    );
  }

  return (
    <div className="admin-live-container fade-in">
      <div className="admin-live-header-banner glass">
        <div className="header-left">
          <div className={`live-badge ${isLive ? 'active' : ''}`}>
            <Radio size={16} />
            <span>{isLive ? 'लाइव चालू' : 'ऑफलाइन'}</span>
          </div>
          <h1>लाइव दर्शन कंट्रोल कंसोल</h1>
        </div>
        <div className="audience-stats">
          <div className="stat-card">
            <Users size={18} />
            <span>{viewerCount} ऑनलाइन श्रद्धालु दर्शक</span>
          </div>
        </div>
      </div>

      {successMessage && <div className="toast success-toast">{successMessage}</div>}
      {errorMessage && <div className="toast error-toast">{errorMessage}</div>}

      <div className="admin-live-grid">
        {/* Stream Player / WebRTC Capture Preview */}
        <div className="live-media-section card glass">
          <div className="media-header">
            <h3>
              <Sparkles size={16} className="text-primary" /> लाइव स्ट्रीम पूर्वावलोकन (Preview)
            </h3>
            {isLive && (
              <span className="rec-indicator">
                <span className="dot"></span> सीधे प्रसारण में
              </span>
            )}
          </div>
          
          <div className="video-player-container">
            {streamType === 'webrtc' ? (
              <div className="webrtc-preview-box">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="admin-webcam-preview"
                />
                {!cameraActive && (
                  <div className="camera-placeholder">
                    <Video size={48} />
                    <p>कैमरा बंद है। चालू करने के लिए नीचे बटन पर क्लिक करें।</p>
                  </div>
                )}
                <div className="webrtc-controls-container">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`btn-camera-toggle ${cameraActive ? 'active' : ''}`}
                  >
                    {cameraActive ? <VideoOff size={18} /> : <Video size={18} />}
                    {cameraActive ? 'कैमरा बंद करें' : 'कैमरा चालू करें'}
                  </button>
                  {cameraActive && (
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="btn-camera-switch"
                    >
                      <RefreshCw size={18} />
                      कैमरा बदलें
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="static-preview-box" style={{ width: '100%', height: '100%' }}>
                {streamType === 'youtube' ? (
                  <div id="admin-youtube-player-placeholder" style={{ width: '100%', height: '100%' }}></div>
                ) : streamType === 'hls' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    controls
                    playsInline
                    onPlay={handleVideoPlay}
                    onPause={handleVideoPause}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="camera-placeholder">
                    <Radio size={48} />
                    <p>कोई सक्रिय लाइव स्ट्रीम प्लेयर कॉन्फ़िगर नहीं है</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="stream-info-block">
            <h4>{title}</h4>
            <p className="text-light">{description}</p>
            {isLive && <span className="stream-mode-tag">प्रसारण माध्यम: {streamType === 'webrtc' ? 'वेबकैम (WebRTC)' : streamType === 'youtube' ? 'यूट्यूब (YouTube)' : 'HLS URL'}</span>}
          </div>
        </div>

        {/* Stream Settings */}
        <div className="live-settings-section card glass">
          <div className="section-title-box">
            <h3><Settings size={18} /> लाइव स्ट्रीम सेटिंग्स</h3>
          </div>
          <form onSubmit={handleStartStream} className="settings-form">
            <div className="form-group">
              <label>लाइव स्ट्रीम शीर्षक *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="जैसे: दैनिक मंगला आरती लाइव दर्शन"
                required
                disabled={isLive}
              />
            </div>
            
            <div className="form-group">
              <label>स्ट्रीम का विवरण</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="प्रसारण का विवरण दर्ज करें..."
                rows={3}
                disabled={isLive}
              />
            </div>

            <div className="form-group">
              <label>प्रसारण माध्यम (Broadcast Mode)</label>
              <div className="radio-group">
                <label className={streamType === 'youtube' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="streamType"
                    value="youtube"
                    checked={streamType === 'youtube'}
                    onChange={() => setStreamType('youtube')}
                    disabled={isLive}
                  />
                  YouTube इम्बेड
                </label>
                <label className={streamType === 'hls' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="streamType"
                    value="hls"
                    checked={streamType === 'hls'}
                    onChange={() => setStreamType('hls')}
                    disabled={isLive}
                  />
                  HLS (.m3u8) URL
                </label>
                <label className={streamType === 'webrtc' ? 'active' : ''}>
                  <input
                    type="radio"
                    name="streamType"
                    value="webrtc"
                    checked={streamType === 'webrtc'}
                    onChange={() => setStreamType('webrtc')}
                    disabled={isLive}
                  />
                  वेबकैम (WebRTC Direct)
                </label>
              </div>
            </div>

            {streamType !== 'webrtc' && (
              <div className="form-group">
                <label>
                  {streamType === 'youtube' ? 'YouTube वीडियो ID या URL' : 'HLS स्ट्रीम URL (.m3u8)'}
                </label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (streamType === 'youtube') {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = val.match(regExp);
                      if (match && match[2].length === 11) {
                        setStreamUrl(match[2]);
                      } else {
                        setStreamUrl(val);
                      }
                    } else {
                      setStreamUrl(val);
                    }
                  }}
                  placeholder={
                    streamType === 'youtube' 
                      ? 'जैसे: dQw4w9WgXcQ' 
                      : 'जैसे: https://domain.com/live/stream.m3u8'
                  }
                  required
                  disabled={isLive}
                />
                <small className="help-text text-light">
                  {streamType === 'youtube' 
                    ? '11-अंकीय यूट्यूब वीडियो ID या पूरा यूट्यूब लिंक दर्ज करें' 
                    : 'एचटीटीपी लाइव स्ट्रीमिंग (.m3u8) का सुरक्षित यूआरएल दर्ज करें'}
                </small>
              </div>
            )}

            <div className="action-buttons">
              {isLive ? (
                <button
                  type="button"
                  onClick={handleStopStream}
                  className="btn btn-stop-stream"
                >
                  <Square size={16} /> लाइव प्रसारण समाप्त करें
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-start-stream"
                >
                  <Play size={16} /> लाइव प्रसारण शुरू करें
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Chat Monitor */}
        <div className="live-chat-section card glass">
          <div className="chat-header">
            <h3>
              <MessageSquare size={18} /> लाइव चैट मॉनिटर (Live Chat)
            </h3>
            <button
              onClick={handleClearChat}
              className="btn-clear-chat text-light"
              title="चैट इतिहास साफ करें"
            >
              <Trash2 size={16} /> चैट साफ़ करें
            </button>
          </div>

          <div className="chat-messages-container" ref={chatContainerRef}>
            {chatMessages.length === 0 ? (
              <div className="empty-chat">
                <MessageSquare size={36} />
                <p>अभी तक कोई संदेश नहीं आया है। पहली चैट भेजें!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg._id || Math.random()} className={`chat-bubble ${msg.isAdmin ? 'admin' : ''}`}>
                  <div className="chat-bubble-header">
                    <span className="username">
                      {msg.isAdmin && <Shield size={12} className="admin-badge-icon" />}
                      {msg.username}
                      {msg.isAdmin && <small className="admin-label">मंदिर ट्रस्ट</small>}
                    </span>
                    <span className="timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="message-text">{msg.message}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="chat-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="प्रशासक के रूप में संदेश लिखें..."
              required
            />
            <button type="submit" className="btn-send-message">
              भेजें
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveStream;
