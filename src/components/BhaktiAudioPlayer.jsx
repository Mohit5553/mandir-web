import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Music, BookOpen, X, ChevronDown, Radio } from 'lucide-react';
import { api } from '../services/api';
import './BhaktiAudioPlayer.css';

const BHAKTI_TRACKS = [
  {
    id: 'chalisa',
    title: 'श्री शिव चालीसा (Shree Shiv Chalisa)',
    subtitle: 'जय गणेश गिरिजा सुवन, मंगल मूल सुजान...',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    lyrics: `॥ दोहा ॥
जय गणेश गिरिजा सुवन, मंगल मूल सुजान।
कहत अयोध्यादास तुम, देहु अभय वरदान॥

॥ चौपाई ॥
जय गिरिजा पति दिन दयाला। सदा करत सन्तन प्रतिपाला॥
भाल चंद्रमा सोहत नीके। कानन कुंडल नागफनी के॥

अंग गौर शिर गंग बहाये। मुण्डमाल तन क्षार लगाये॥
वस्त्र खाल बाघंबर सोहे। छवि को देखि नाग मुनि मोहे॥

मैना मातु की हवे दुलारी। बाम अंग सोहत छवि न्यारी॥
कर त्रिशूल सोहत छवि भारी। करत सदा शत्रुन क्षयकारी॥

नंदि गणेश सोहैं तहँ कैसे। सागर मध्य कमल हैं जैसे॥
कार्तिक श्याम और गणराऊ। या छवि को कहि जात न काऊ॥

देवन जबहीं जाय पुकारा। तबहीं दुख प्रभु आप निवारा॥
किया उपद्रव तारक भारी। देवन सब मिलि तुमहिं जुहारी॥

तुरत षडानन आप पठायौ। लवनिमेष महँ मारि गिरायौ॥
आप जलंधर असुर संहारा। सुयश तुम्हारा विदित संसारा॥

त्रिपुरासुर सन युद्ध मचाई। सबहिं कृपा करि लीन्ह बचाई॥
किया तपहिं भागीरथ भारी। पुरब प्रतिज्ञा तासु पुरारी॥

दानिन महँ तुम सम कोउ नाहीं। सेवक स्तुति करत सदाहीं॥
वेद नाम महिमा तव गाई। अकथ अनादि भेद नहिं पाई॥

प्रगट उदधि मंथन में ज्वाला। जरे सुरासुर भये विहाला॥
कीन्ह दया तहँ करी सहाई। नीलकंठ तब नाम कहाई॥

पूजन रामचंद्र जब कीन्हा। जीत के लंक विभीषण दीन्हा॥
सहस कमल में होइ धारी। कीन्ह परीक्षा तबहिं पुरारी॥

एक कमल प्रभु राखेउ गोई। कमल नयन पूजन चहं सोई॥
कठिन भक्ति देखी प्रभु शंका। भये प्रसन्न दिए इच्छित अंका॥

जय जय जय अनंत अविनाशी। करत कृपा सब के घट वासी॥
दुष्ट सकल नित मोहि सतावैं। भ्रमते रहे मोहि चैन न आवै॥

त्राहि त्राहि मैं नाथ पुकारो। यहि अवसर मोहि आन उबारो॥
ले त्रिशूल शत्रुन को मारो। संकट से मोहि आन उबारो॥

मातु-पिता भ्राता सब कोई। संकट में पूछत नहिं कोई॥
स्वामी एक है आस तुम्हारी। आय हरहु मम संकट भारी॥

धन निर्धन को देत सदाहीं। जो कोई जांचे सो फल पाहीं॥
अस्तुति केहि विधि करैं तुम्हारी। क्षमहु नाथ अब चूक हमारी॥

शंकर हो संकट के नाशन। मंगल कारण विघ्न विनाशन॥
योगी यति मुनि ध्यान लगावैं। शारद नारद शीश नवावैं॥

नमो नमो जय नमः शिवाय। सुर ब्रह्मादिक पार न पाय॥
जो यह पाठ करे मन लाई। तापर होत शम्भु सुहाई॥

रनियां जो कोई होइ अधिकारी। पाठ करे सो पावे सुख भारी॥
पुत्र हीन कर इच्छा जोई। निश्चय शिव प्रसाद तेहि होई॥

पंडित त्रयोदशी को लावे। ध्यान रात्रि मन सुस्थिर छावे॥
धूप दीप नैवेद्य चढ़ावे। शंकर सम्मुख पाठ सुनावे॥

जन्म जन्म के पाप नसावे। अंत धाम शिवपुर में पावे॥
कहं अयोध्यादास आस तुम्हारी। जानि सकल दुःख हरहु पुरारी॥

॥ दोहा ॥
नित नेम करि प्रातः ही, पाठ करै चालीस।
तुम ताके प्रभु सिद्ध करि, पूर्ण करहु जगदीश॥`
  },
  {
    id: 'mantra',
    title: 'महामृत्युंजय मंत्र (Mahamrityunjaya Mantra)',
    subtitle: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिबर्धनम्...',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    lyrics: `॥ महामृत्युंजय मंत्र ॥

ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।
उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥

॥ मंत्र का अर्थ ॥
हम त्रिनेत्रधारी भगवान शिव की पूजा करते हैं, जो सुगंधित हैं और सभी प्राणियों का पोषण करते हैं। 
जैसे पका हुआ खरबूजा बेल के बंधन से मुक्त हो जाता है, वैसे ही हम मृत्यु से मुक्त होकर अमरता प्राप्त करें।

॥ जप फल एवं महिमा ॥
यह महामृत्युंजय मंत्र संकट, भय, रोग एवं अकाल मृत्यु से रक्षा करने वाला परम कल्याणकारी मंत्र है। 
इसके नित्य जाप एवं श्रवण से मानसिक शांति, उत्तम स्वास्थ्य एवं दीर्घायु की प्राप्ति होती है।`
  },
  {
    id: 'aarti',
    title: 'श्री शिव आरती (Shree Shiv Aarti)',
    subtitle: 'जय शिव ओंकारा, हर ॐ शिव ओंकारा...',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    lyrics: `॥ श्री शिव जी की आरती ॥

जय शिव ओंकारा, हर ॐ शिव ओंकारा।
ब्रह्मा, विष्णु, सदाशिव, अर्द्धांगी धारा॥
ॐ जय शिव ओंकारा...

एकानन चतुरानन पंचानन राजे।
हंसासन गरुड़ासन वृषवाहन साजे॥
ॐ जय शिव ओंकारा...

दो भुज चार चतुर्भुज दसभुज अति सोहे।
त्रिगुण रूप निरखते त्रिभुवन जन मोहे॥
ॐ जय शिव ओंकारा...

अक्षमाला वनमाला मुण्डमालाधारी।
त्रिपुरारि कंसारि कर माला धारी॥
ॐ जय शिव ओंकारा...

श्वेतांबर पीतांबर बाघंबर अंगे।
सनकादिक गरुणादिक भूतादिक संगे॥
ॐ जय शिव ओंकारा...

कर के मध्य कमंडल चक्र त्रिशूल धरता।
जगकर्ता जगहर्ता जगपालनकर्ता॥
ॐ जय शिव ओंकारा...

ब्रह्मा विष्णु सदाशिव जानत अविवेका।
प्रणवाक्षर के मध्ये ये तीनों एका॥
ॐ जय शिव ओंकारा...

त्रिगुणस्वामी जी की आरती जो कोई नर गावे।
कहत शिवानन्द स्वामी मनवांछित फल पावे॥
ॐ जय शिव ओंकारा...`
  },
  {
    id: 'dhun',
    title: 'ॐ नमः शिवाय धुन (Om Namah Shivaya Chanting)',
    subtitle: 'मधुर शिव धुन एवं ध्यान संगीत...',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    lyrics: `॥ ॐ नमः शिवाय ॥

ॐ नमः शिवाय! ॐ नमः शिवाय!
हर हर भोले नमः शिवाय!

रामेश्वरम शिव रामेश्वरम,
हर हर भोले नमः शिवाय!

गंगाधरम शिव गंगाधरम,
हर हर भोले नमः शिवाय!

सोमेश्वरम शिव सोमेश्वरम,
हर हर भोले नमः शिवाय!

विश्वेश्वरम शिव विश्वेश्वरम,
हर हर भोले नमः शिवाय!`
  }
];

const BhaktiAudioPlayer = () => {
  const [tracks, setTracks] = useState(BHAKTI_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef(null);
  const enabledTracks = (tracks && tracks.length > 0 ? tracks : BHAKTI_TRACKS).filter(t => t.enabled !== false);
  const activeTracks = enabledTracks.length > 0 ? enabledTracks : BHAKTI_TRACKS;
  const currentTrack = activeTracks[currentTrackIndex] || activeTracks[0] || BHAKTI_TRACKS[0];

  useEffect(() => {
    api.getSiteContent().then(data => {
      if (data?.bhaktiTracks && data.bhaktiTracks.length > 0) {
        const cleaned = data.bhaktiTracks.map((t, idx) => ({
          ...t,
          audioUrl: (!t.audioUrl || t.audioUrl.includes('pixabay.com'))
            ? `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(idx % 4) + 1}.mp3`
            : t.audioUrl
        }));
        setTracks(cleaned);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log('Audio autoplay prevented:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % activeTracks.length);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + activeTracks.length) % activeTracks.length);
    setIsPlaying(true);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      <audio 
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleNextTrack}
      />

      <div className="bhakti-player-widget">
        {isCollapsed ? (
          <button 
            type="button"
            className="bhakti-player-collapsed"
            onClick={() => setIsCollapsed(false)}
            aria-label="भक्ति संगीत चालू करें"
          >
            <Music size={18} />
            <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>
              {isPlaying ? '🎵 ' + (currentTrack.title ? currentTrack.title.split(' ')[0] : 'संगीत') : 'भक्ति संगीत'}
            </span>
          </button>
        ) : (
          <div className="bhakti-player-card">
            <div className="bhakti-player-header">
              <div className="bhakti-player-title">
                <Music size={18} color="#FF6000" />
                <span>भक्ति संगीत एवं चालीसा</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsCollapsed(true)} 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                aria-label="छोटा करें"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Track Selector */}
            <select 
              className="bhakti-track-select"
              value={currentTrackIndex}
              onChange={(e) => {
                setCurrentTrackIndex(Number(e.target.value));
                setIsPlaying(true);
              }}
            >
              {activeTracks.map((t, idx) => (
                <option key={t.id || idx} value={idx}>{t.title}</option>
              ))}
            </select>

            {/* Audio Controls */}
            <div className="bhakti-player-controls">
              <button type="button" onClick={handlePrevTrack} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                <SkipBack size={20} />
              </button>
              
              <button type="button" className="bhakti-btn-play" onClick={togglePlay}>
                {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
              </button>

              <button type="button" onClick={handleNextTrack} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                <SkipForward size={20} />
              </button>

              <button type="button" onClick={toggleMute} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', marginLeft: 'auto' }}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>

            {/* Time progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '0.65rem' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Read Lyrics Button */}
            <button 
              type="button"
              className="bhakti-lyrics-btn"
              onClick={() => setShowLyricsModal(true)}
            >
              <BookOpen size={16} /> लिरिक्स पाठ पढ़ें (Read Lyrics)
            </button>
          </div>
        )}
      </div>

      {/* Lyrics Text Modal */}
      {showLyricsModal && (
        <div className="lyrics-modal-overlay" onClick={() => setShowLyricsModal(false)}>
          <div className="lyrics-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lyrics-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <BookOpen size={22} />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{currentTrack.title}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowLyricsModal(false)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                aria-label="बंद करें"
              >
                <X size={24} />
              </button>
            </div>
            <div className="lyrics-modal-body">
              {currentTrack.lyrics}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BhaktiAudioPlayer;
