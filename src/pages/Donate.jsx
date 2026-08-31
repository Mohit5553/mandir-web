import { useEffect, useRef, useState } from 'react';
import { Heart, Building2, Utensils, Sprout, CheckCircle2, Upload, Camera, X } from 'lucide-react';
import qrCode from '../assets/donation_qr.jpeg';
import { api } from '../services/api';

const Donate = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    amount: '501',
    category: 'General Donation',
    utr: '',
    screenshot: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((current) => ({ ...current, screenshot: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser.');
      return;
    }

    setCameraError('');
    setCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      setCameraError(error.name === 'NotAllowedError' ? 'Please allow camera permission and try again.' : 'Unable to open camera. Please use Upload instead.');
      setCameraOpen(false);
      stopCamera();
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setForm((current) => ({ ...current, screenshot: canvas.toDataURL('image/jpeg', 0.9) }));
    closeCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const causes = [
    { title: 'सामान्य दान', id: 'General Donation', icon: <Heart /> },
    { title: 'मंदिर निर्माण कोष', id: 'Construction Fund', icon: <Building2 /> },
    { title: 'अन्नदान सेवा', id: 'Annadan', icon: <Utensils /> },
    { title: 'गौ सेवा (गौ माता संरक्षण)', id: 'Gau Seva', icon: <Sprout /> }
  ];

  const amounts = ['101', '501', '1001', '5001'];

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.utr.trim() && !form.screenshot) {
      alert('कृपया यूटीआर / ट्रांजैक्शन आईडी दर्ज करें या भुगतान का स्क्रीनशॉट अपलोड / कैप्चर करें।');
      return;
    }

    setLoading(true);
    try {
      await api.createDonation(form);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch {
      alert('दान आवेदन जमा करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '1rem' };

  if (success) {
    const shareOnWhatsApp = () => {
      const text = `🚩 *श्री मन्वत बाबा महाशिव मंदिर ट्रस्ट - दान प्राप्ति* 🚩\n\nप्रणाम ${form.name || ''} जी,\n\nश्री मन्वत बाबा महाशिव मंदिर निर्माण एवं जनसेवा हेतु आपके ₹${form.amount || '0'} के पावन दान का आवेदन सफलता पूर्वक प्राप्त हुआ है।\n\n📌 सेवा श्रेणी: ${form.category || 'सामान्य दान'}\n🔰 आयकर धारा 80G के अंतर्गत कर छूट योग्य।\n\nहर हर महादेव! 🙏\nhttps://manvatmandir.org`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    };

    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <CheckCircle2 size={80} color="#166534" style={{ marginBottom: '1.5rem' }} />
        <h1 style={{ marginBottom: '1rem' }}>दान आवेदन सफलता पूर्वक प्राप्त हुआ!</h1>
        <p className="text-light" style={{ maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
          आपके पवित्र योगदान के लिए कोटि-कोटि धन्यवाद। मंदिर प्रशासन आपके भुगतान का सत्यापन कर 80G दान रसीद जारी करेगा।
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={shareOnWhatsApp} 
            style={{ background: '#25D366', borderColor: '#25D366', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            📲 व्हाट्सएप पर रसीद शेयर करें
          </button>
          <button className="btn" onClick={() => window.location.href = '/'} style={{ background: '#f1f5f9', color: '#334155' }}>
            होमपेज पर लौटें
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="donate-page">
      <section className="section bg-primary" style={{ padding: '2rem 0', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>मंदिर ट्रस्ट को दान अर्पित करें</h1>
          <p style={{ fontSize: '1rem', opacity: 0.95, lineHeight: 1.4 }}>अपनी श्रद्धा और योगदान से धार्मिक एवं सामाजिक सेवाओं में भागीदार बनें।</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '700px' }}>
          <div className="responsive-actions" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center', opacity: step === 1 ? 1 : 0.5 }}>
              <div style={{ background: 'var(--color-primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: 700 }}>1</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>विवरण दर्ज करें</span>
            </div>
            <div style={{ textAlign: 'center', opacity: step === 2 ? 1 : 0.5 }}>
              <div style={{ background: step === 2 ? 'var(--color-primary)' : '#ccc', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: 700 }}>2</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>भुगतान एवं रसीद</span>
            </div>
          </div>

          <div className="content-card">
            {step === 1 ? (
              <form onSubmit={handleNext}>
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>चरण 1: आपका विवरण एवं दान श्रेणी</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>दान की श्रेणी चुनें</label>
                  <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {causes.map(c => (
                      <div key={c.id} onClick={() => setForm({ ...form, category: c.id })} style={{ padding: '0.75rem', border: `2px solid ${form.category === c.id ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', background: form.category === c.id ? 'var(--color-primary-alpha)' : 'transparent' }}>
                        <div style={{ color: form.category === c.id ? 'var(--color-primary)' : '#666' }}>{c.icon}</div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>दान राशि (₹ रुपये)</label>
                  <div className="responsive-actions" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    {amounts.map(amt => (
                      <button key={amt} type="button" onClick={() => setForm({ ...form, amount: amt })} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: `2px solid ${form.amount === amt ? 'var(--color-primary)' : 'var(--border-color)'}`, background: form.amount === amt ? 'var(--color-primary)' : 'transparent', color: form.amount === amt ? 'white' : 'inherit', fontWeight: 600 }}>₹{amt}</button>
                    ))}
                  </div>
                  <input type="number" placeholder="अन्य राशि दर्ज करें" style={inputStyle} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <input type="text" placeholder="पूरा नाम *" required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  <input type="tel" placeholder="मोबाइल नंबर *" required style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <input type="email" placeholder="ई-मेल आईडी (वैकल्पिक)" style={{ ...inputStyle, marginBottom: '2rem' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>आगे बढ़ें: स्कैन एवं भुगतान करें</button>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem' }}>← वापस जाएं</button>
                <div style={{ textAlign: 'center', marginBottom: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ background: 'white', padding: '0.5rem', display: 'inline-block', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)', marginBottom: '1rem' }}>
                    <img src={qrCode} alt="भुगतान QR कोड" style={{ width: '220px', maxWidth: '100%', borderRadius: '4px' }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary)' }}>देय दान राशि: ₹{form.amount}</p>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>यूटीआर / ट्रांजैक्शन आईडी (UTR / Ref No.)</label>
                  <input type="text" placeholder="12 अंकों की ट्रांजैक्शन आईडी दर्ज करें" style={inputStyle} value={form.utr} onChange={e => setForm({ ...form, utr: e.target.value })} />
                  <p style={{ margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>भुगतान की यूटीआर संख्या दर्ज करें या नीचे भुगतान की फोटो अपलोड करें।</p>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>भुगतान का स्क्रीनशॉट / रसीद</label>
                  <div className="responsive-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <label style={{ ...inputStyle, minHeight: '52px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, color: '#334155', background: '#fff' }}>
                      <Upload size={18} /> फोटो चुनें
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    <button type="button" onClick={openCamera} style={{ ...inputStyle, minHeight: '52px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-alpha)', borderColor: 'var(--color-primary)' }}>
                      <Camera size={18} /> फोटो खींचें
                    </button>
                  </div>
                  {cameraError && <p style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.75rem' }}>{cameraError}</p>}
                  {form.screenshot && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#166534', fontSize: '0.85rem', fontWeight: 700 }}>
                      <img src={form.screenshot} alt="चयनित रसीद फोटो" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #bbf7d0' }} />
                      फोटो संलग्न हो गई है
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>{loading ? 'जमा हो रहा है...' : 'दान रसीद आवेदन जमा करें'}</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {cameraOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '560px', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0 }}>रसीद की फोटो खींचें</h3>
              <button type="button" onClick={closeCamera} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: '#020617', aspectRatio: '4 / 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeCamera} className="btn btn-outline">रद्द करें</button>
              <button type="button" onClick={capturePhoto} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} /> फोटो लें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donate;
