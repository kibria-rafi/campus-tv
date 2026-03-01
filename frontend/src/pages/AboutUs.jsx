import { useState } from 'react';
import { Award, Target, Eye, Mail, MapPin, Send, CheckCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { API_BASE } from '../config/api';

const CONTACT_EMAIL = 'info@campustv.ac';
const MAPS_LINK = 'https://maps.app.goo.gl/iPgc4mEGBg6peBat7';
const MAP_EMBED_URL = 'https://www.google.com/maps?q=23.8768956,90.3201592&z=16&output=embed';

const SUBJECTS = [
  { value: 'general', label: { bn: 'সাধারণ', en: 'General' } },
  { value: 'news-tip', label: { bn: 'নিউজ টিপ', en: 'News Tip' } },
  { value: 'advertising', label: { bn: 'বিজ্ঞাপন', en: 'Advertising' } },
  { value: 'technical', label: { bn: 'টেকনিক্যাল', en: 'Technical' } },
];

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brandRed placeholder:text-muted-foreground transition disabled:opacity-50';

function MapCard({ lang }) {
  const [embedFailed, setEmbedFailed] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-video relative">
      {embedFailed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted p-6 text-center">
          <MapPin size={40} className="text-brandRed" />
          <p className="text-sm font-semibold text-foreground">
            {lang === 'bn' ? 'ম্যাপ লোড হয়নি' : 'Map could not load'}
          </p>
          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-brandRed text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition"
          >
            <ExternalLink size={14} />
            {lang === 'bn' ? 'Google Maps-এ দেখুন' : 'View on Google Maps'}
          </a>
        </div>
      ) : (
        <iframe
          title="Campus TV Location"
          src={MAP_EMBED_URL}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onError={() => setEmbedFailed(true)}
        />
      )}
    </div>
  );
}

export default function AboutUs({ lang }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
    company: '', // honeypot
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');

  const change = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = lang === 'bn' ? 'নাম প্রয়োজন' : 'Name is required.';
    if (!form.email.trim())
      e.email = lang === 'bn' ? 'ইমেইল প্রয়োজন' : 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = lang === 'bn' ? 'সঠিক ইমেইল দিন' : 'Enter a valid email.';
    if (!form.message.trim())
      e.message = lang === 'bn' ? 'বার্তা প্রয়োজন' : 'Message is required.';
    else if (form.message.length > 2000)
      e.message =
        lang === 'bn'
          ? 'বার্তা ২০০০ অক্ষরের কম হতে হবে'
          : 'Message must be under 2000 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus('loading');
    setServerError('');

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setStatus('success');
      setForm({
        name: '',
        email: '',
        subject: 'general',
        message: '',
        company: '',
      });
    } catch (err) {
      setStatus('error');
      setServerError(
        err.message ||
          (lang === 'bn'
            ? 'বার্তা পাঠানো যায়নি। আবার চেষ্টা করুন।'
            : 'Could not send message. Please try again.')
      );
    }
  };

  const isLoading = status === 'loading';

  const aboutContent = {
    bn: {
      title: 'ক্যাম্পাস টিভি সম্পর্কে',
      description: `ক্যাম্পাস টিভি হলো একটি আধুনিক ডিজিটাল সংবাদ মাধ্যম যা শিক্ষার্থীদের জন্য সর্বশেষ ক্যাম্পাস সংবাদ, শিক্ষা সংক্রান্ত তথ্য, এবং বিশ্ববিদ্যালয়ের গুরুত্বপূর্ণ ইভেন্টগুলি সরবরাহ করে। আমরা প্রতিশ্রুতিবদ্ধ যে শিক্ষার্থীদের কাছে সঠিক, নির্ভরযোগ্য এবং সময়োপযোগী তথ্য পৌঁছে দিতে।

আমাদের লক্ষ্য হলো শিক্ষার্থীদের মধ্যে একটি শক্তিশালী যোগাযোগ মাধ্যম তৈরি করা যা তাদের ক্যাম্পাস জীবন, শিক্ষাগত সুযোগ, এবং সামাজিক দায়বদ্ধতা সম্পর্কে সচেতন করে তুলবে।

আমরা বিশ্বাস করি যে সংবাদ এবং তথ্য প্রচারের মাধ্যমে আমরা একটি শিক্ষিত এবং সচেতন প্রজন্ম গড়তে পারি যারা দেশ এবং সমাজের জন্য ইতিবাচক পরিবর্তন আনতে সক্ষম।`,
      mission: 'আমাদের লক্ষ্য',
      missionText:
        'শিক্ষার্থীদের সঠিক এবং নির্ভরযোগ্য তথ্য প্রদানের মাধ্যমে একটি সচেতন প্রজন্ম গড়ে তোলা।',
      vision: 'আমাদের দৃষ্টিভঙ্গি',
      visionText:
        'শিক্ষা ও সংবাদ মাধ্যমে একটি অগ্রণী ডিজিটাল প্ল্যাটফর্ম হিসেবে প্রতিষ্ঠিত হওয়া।',
      values: 'আমাদের মূল্যবোধ',
      valuesText:
        'সততা, স্বচ্ছতা, নির্ভরযোগ্যতা এবং শিক্ষার্থীদের প্রতি দায়বদ্ধতা।',
    },
    en: {
      title: 'About Campus TV',
      description: `Campus TV is a modern digital news platform that delivers the latest campus news, educational information, and important university events to students. We are committed to providing accurate, reliable, and timely information to students.

Our goal is to create a strong communication medium among students that will make them aware of their campus life, educational opportunities, and social responsibilities.

We believe that through news and information dissemination, we can build an educated and conscious generation capable of bringing positive changes to the country and society.`,
      mission: 'Our Mission',
      missionText:
        'To build a conscious generation by providing accurate and reliable information to students.',
      vision: 'Our Vision',
      visionText:
        'To establish ourselves as a leading digital platform in education and news media.',
      values: 'Our Values',
      valuesText:
        'Honesty, transparency, reliability, and commitment to students.',
    },
  };

  const content = aboutContent[lang] || aboutContent.bn;

  return (
    <div className="min-h-screen">
      {/* About Header */}
      <div className="bg-gradient-to-br from-brandRed via-red-700 to-brandBlack text-white py-16 mb-12 rounded-2xl shadow-2xl">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-black text-center mb-6 uppercase italic tracking-tight">
            {content.title}
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl leading-relaxed whitespace-pre-line text-center md:text-left">
              {content.description}
            </p>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-brandRed">
          <div className="flex items-center gap-3 mb-4">
            <Target
              className="text-brandRed"
              size={32}
            />
            <h3 className="text-xl font-black text-foreground uppercase">
              {content.mission}
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {content.missionText}
          </p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-brandRed">
          <div className="flex items-center gap-3 mb-4">
            <Eye
              className="text-brandRed"
              size={32}
            />
            <h3 className="text-xl font-black text-foreground uppercase">
              {content.vision}
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {content.visionText}
          </p>
        </div>

        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:border-brandRed">
          <div className="flex items-center gap-3 mb-4">
            <Award
              className="text-brandRed"
              size={32}
            />
            <h3 className="text-xl font-black text-foreground uppercase">
              {content.values}
            </h3>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {content.valuesText}
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mb-16">
        <div className="mb-10 border-l-8 border-brandRed pl-4">
          <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase italic">
            {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {lang === 'bn'
              ? 'আপনার মতামত, প্রশ্ন বা টিপস পাঠান।'
              : 'Send us your feedback, questions, or tips.'}
          </p>
        </div>

        {status === 'success' && (
          <div className="mb-6 flex items-start gap-3 bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 rounded-xl px-4 py-3 text-sm font-semibold">
            <CheckCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>
              {lang === 'bn'
                ? 'বার্তা পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।'
                : "Message sent! We'll get back to you within 24–48 hours."}
            </span>
          </div>
        )}

        {status === 'error' && serverError && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm font-semibold">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Contact Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-foreground mb-5 uppercase italic tracking-tight">
              {lang === 'bn' ? 'বার্তা পাঠান' : 'Send a Message'}
            </h3>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-4"
            >
              {/* Honeypot — visually hidden, real users never see or fill this */}
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={change('company')}
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                style={{ display: 'none' }}
              />

              <Field
                label={lang === 'bn' ? 'নাম *' : 'Name *'}
                error={errors.name}
              >
                <input
                  type="text"
                  className={inputCls}
                  placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your name'}
                  value={form.name}
                  onChange={change('name')}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field
                label={lang === 'bn' ? 'ইমেইল *' : 'Email *'}
                error={errors.email}
              >
                <input
                  type="email"
                  className={inputCls}
                  placeholder={
                    lang === 'bn' ? 'আপনার ইমেইল' : 'you@example.com'
                  }
                  value={form.email}
                  onChange={change('email')}
                  disabled={isLoading}
                  required
                />
              </Field>

              <Field label={lang === 'bn' ? 'বিষয়' : 'Subject'}>
                <select
                  className={inputCls}
                  value={form.subject}
                  onChange={change('subject')}
                  disabled={isLoading}
                >
                  {SUBJECTS.map((s) => (
                    <option
                      key={s.value}
                      value={s.value}
                    >
                      {s.label[lang]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label={lang === 'bn' ? 'বার্তা *' : 'Message *'}
                error={errors.message}
              >
                <textarea
                  rows={5}
                  className={`${inputCls} resize-none`}
                  placeholder={
                    lang === 'bn'
                      ? 'আপনার বার্তা লিখুন...'
                      : 'Write your message here...'
                  }
                  value={form.message}
                  onChange={change('message')}
                  disabled={isLoading}
                  maxLength={2000}
                  required
                />
                <p className="text-right text-[11px] text-muted-foreground">
                  {form.message.length}/2000
                </p>
              </Field>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 bg-brandRed text-white px-5 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    {lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending…'}
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="flex flex-col gap-6">
            {/* Contact info card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <h3 className="text-lg font-black text-foreground uppercase italic tracking-tight">
                {lang === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Info'}
              </h3>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-brandRed/10 text-brandRed">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    {lang === 'bn' ? 'ইমেইল' : 'Email'}
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-sm font-semibold text-foreground hover:text-brandRed transition break-all"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === 'bn'
                      ? '২৪–৪৮ ঘন্টার মধ্যে উত্তর দেওয়া হয়'
                      : 'We respond within 24–48 hours'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-brandRed/10 text-brandRed">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    {lang === 'bn' ? 'অবস্থান' : 'Location'}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    Campus TV Official
                  </p>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold bg-card border border-border hover:border-brandRed hover:text-brandRed text-foreground px-3 py-1.5 rounded-lg transition"
                  >
                    <ExternalLink size={12} />
                    {lang === 'bn' ? 'দিকনির্দেশনা পান' : 'Get Directions'}
                  </a>
                </div>
              </div>
            </div>

            <MapCard lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
