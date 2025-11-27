'use client';

import { JSX, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Mail, Phone, Globe, Facebook, Instagram, Twitter, Linkedin, Send } from 'lucide-react';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import axiosInstance from '@/lib/axios';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ContactPage() {
  const { data: siteSettings } = useSiteSettings();
  const contactSettings = siteSettings?.contact;

  const emails = contactSettings?.emails?.length
    ? contactSettings.emails
    : ['info@mawjood.sa', 'support@mawjood.sa'];

  const phones = contactSettings?.phones?.length
    ? contactSettings.phones
    : ['+966 11 234 5678', '+966 50 987 6543'];

  const socialLinks = contactSettings?.socialLinks?.length
    ? contactSettings.socialLinks
    : [
        { name: 'Facebook', url: 'https://facebook.com' },
        { name: 'Instagram', url: 'https://instagram.com' },
        { name: 'Twitter', url: 'https://twitter.com' },
        { name: 'LinkedIn', url: 'https://linkedin.com' },
      ];

  const officeLocation = {
    lat: contactSettings?.location?.latitude ?? 24.7136,
    lng: contactSettings?.location?.longitude ?? 46.6753,
    address: contactSettings?.location?.address ?? 'King Fahd Road, Riyadh, Saudi Arabia',
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fix Leaflet map z-index to prevent overlay on navbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-container {
        z-index: 0 !important;
      }
      .leaflet-top,
      .leaflet-bottom {
        z-index: 1 !important;
      }
      .leaflet-pane {
        z-index: 0 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const SOCIAL_ICON_MAP: Record<string, JSX.Element> = {
    Facebook: <Facebook className="w-5 h-5 text-white" />,
    Instagram: <Instagram className="w-5 h-5 text-white" />,
    Twitter: <Twitter className="w-5 h-5 text-white" />,
    Linkedin: <Linkedin className="w-5 h-5 text-white" />,
    LinkedIn: <Linkedin className="w-5 h-5 text-white" />,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/api/contact', formData);

      if (response.data.success) {
        toast.success(response.data.message || 'Message Sent Successfully! We Will Get Response Soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        toast.error(response.data.message || 'Failed to send message. Please try again.');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <div className="relative h-[400px] bg-cover bg-center" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920")',
      }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-white/90">
            Get in touch with us and we'll respond as soon as possible
          </p>
        </div>
      </div>

      {/* Contact Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Drop a Mail Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Drop a Mail</h3>
            <div className="space-y-2">
              {emails.map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="block text-gray-600 hover:text-primary transition-colors"
                >
                  {email}
                </a>
              ))}
            </div>
          </div>

          {/* Call Us Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Call Us</h3>
            <div className="space-y-2">
              {phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="block text-gray-600 hover:text-primary transition-colors"
                >
                  {phone}
                </a>
              ))}
            </div>
          </div>

          {/* Connect with Social Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center hover:shadow-2xl transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Connect with Social</h3>
            <p className="text-gray-600 mb-4">Let's Connect with Us via social media</p>
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  className="w-10 h-10 bg-gray-800 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  aria-label={link.name}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {SOCIAL_ICON_MAP[link.name] ?? <Globe className="w-5 h-5 text-white" />}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form and Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Drop Us a Line</h2>
              <p className="text-gray-600">
                Get in touch via form below and we will reply as soon as we can.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone No.
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="+966 50 123 4567"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Query
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  placeholder="Write your message here..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map */}
          <div className="relative z-0">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[600px] relative z-0">
              <MapContainer
                center={[officeLocation.lat, officeLocation.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[officeLocation.lat, officeLocation.lng]}>
                  <Popup>
                    <div className="text-center p-2">
                      <h3 className="font-bold text-gray-900 mb-1">Mawjood Office</h3>
                      <p className="text-sm text-gray-600">{officeLocation.address}</p>
                      <a
                        href={`https://www.google.com/maps?q=${officeLocation.lat},${officeLocation.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm hover:underline mt-2 inline-block"
                      >
                        Get Directions
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}