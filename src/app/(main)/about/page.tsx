'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Building2, Users, Award, Target, Heart, TrendingUp, Shield, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { AboutSettings } from '@/services/settings.service';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building2,
  users: Users,
  award: Award,
  target: Target,
  heart: Heart,
  trending: TrendingUp,
  trendingup: TrendingUp,
  shield: Shield,
  zap: Zap,
};

type AboutContent = {
  hero: {
    title: string;
    subtitle: string;
    stats: { icon?: string; label: string }[];
  };
  mission: { title: string; description: string };
  vision: { title: string; description: string };
  story: { title: string; paragraphs: string[] };
  values: { icon?: string; title: string; description: string }[];
  stats: { label: string; value: string }[];
};

const DEFAULT_ABOUT: AboutContent = {
  hero: {
    title: 'Welcome to Mawjood',
    subtitle: 'Your trusted platform connecting businesses and customers across Saudi Arabia',
    stats: [
      { icon: 'building', label: '1000+ Businesses' },
      { icon: 'users', label: '50,000+ Users' },
      { icon: 'award', label: 'Verified & Trusted' },
    ],
  },
  mission: {
    title: 'Our Mission',
    description:
      'To empower local businesses in Saudi Arabia by providing them with a powerful digital platform to reach more customers, grow their presence, and thrive in the digital economy. We believe every business deserves the opportunity to succeed online.',
  },
  vision: {
    title: 'Our Vision',
    description:
      'To become the leading business discovery platform in Saudi Arabia, where every local business is visible, accessible, and celebrated. We envision a future where finding trusted services and businesses is effortless for every Saudi resident.',
  },
  story: {
    title: 'Our Story',
    paragraphs: [
      'Mawjood was born from a simple observation: finding reliable local businesses in Saudi Arabia was harder than it should be. In 2024, we set out to change that by creating a platform that brings businesses and customers together seamlessly.',
      'What started as a small directory has grown into a comprehensive platform serving thousands of businesses across major Saudi cities. From restaurants and shops to professional services and entertainment venues, Mawjood has become the go-to platform for discovering local businesses.',
      "Today, we're proud to support Saudi Arabia's Vision 2030 by digitizing local commerce and helping businesses of all sizes reach their full potential in the digital age.",
    ],
  },
  values: [
    {
      icon: 'shield',
      title: 'Trust & Safety',
      description: 'We verify every business to ensure our users connect with legitimate, trustworthy services.',
    },
    {
      icon: 'zap',
      title: 'Innovation',
      description: 'We continuously improve our platform with cutting-edge features and user-friendly design.',
    },
    {
      icon: 'users',
      title: 'Community First',
      description: 'We prioritize the needs of our local communities and support Saudi businesses at every stage.',
    },
    {
      icon: 'heart',
      title: 'Passion',
      description: "We're passionate about helping businesses succeed and making life easier for our users.",
    },
  ],
  stats: [
    { label: 'Active Businesses', value: '1,000+' },
    { label: 'Happy Users', value: '50,000+' },
    { label: 'Cities Covered', value: '45+' },
    { label: 'Monthly Searches', value: '100,000+' },
  ],
};

export default function AboutPage() {
  const { data: siteSettings } = useSiteSettings();
  const aboutSettings = siteSettings?.about;

  const aboutContent = useMemo<AboutContent>(() => {
    if (!aboutSettings) {
      return DEFAULT_ABOUT;
    }

    return {
      hero: {
        title: aboutSettings.hero?.title ?? DEFAULT_ABOUT.hero.title,
        subtitle: aboutSettings.hero?.subtitle ?? DEFAULT_ABOUT.hero.subtitle,
        stats: aboutSettings.hero?.stats?.length ? aboutSettings.hero.stats : DEFAULT_ABOUT.hero.stats,
      },
      mission: {
        title: aboutSettings.mission?.title ?? DEFAULT_ABOUT.mission.title,
        description: aboutSettings.mission?.description ?? DEFAULT_ABOUT.mission.description,
      },
      vision: {
        title: aboutSettings.vision?.title ?? DEFAULT_ABOUT.vision.title,
        description: aboutSettings.vision?.description ?? DEFAULT_ABOUT.vision.description,
      },
      story: {
        title: aboutSettings.story?.title ?? DEFAULT_ABOUT.story.title,
        paragraphs: aboutSettings.story?.paragraphs?.length
          ? aboutSettings.story.paragraphs
          : DEFAULT_ABOUT.story.paragraphs,
      },
      values: aboutSettings.values?.length ? aboutSettings.values : DEFAULT_ABOUT.values,
      stats: aboutSettings.stats?.length ? aboutSettings.stats : DEFAULT_ABOUT.stats,
    };
  }, [aboutSettings]);

  const MissionIcon = ICON_MAP.target;
  const VisionIcon = ICON_MAP.trendingup ?? TrendingUp;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              {aboutContent.hero.title}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {aboutContent.hero.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {aboutContent.hero.stats.map((stat, index) => {
                const Icon = ICON_MAP[stat.icon?.toLowerCase?.() ?? ''] ?? Building2;
                const isLast = index === aboutContent.hero.stats.length - 1;
                return (
                  <div key={`${stat.label}-${index}`} className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span>{stat.label}</span>
                    {!isLast && <div className="hidden md:block w-1 h-4 bg-white/30" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <MissionIcon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{aboutContent.mission.title}</h2>
              <p className="text-gray-600 leading-relaxed">
                {aboutContent.mission.description}
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <VisionIcon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{aboutContent.vision.title}</h2>
              <p className="text-gray-600 leading-relaxed">
                {aboutContent.vision.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Mawjood Team"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
                alt="Mawjood Platform"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{aboutContent.story.title}</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>
          <div className="mb-8 relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop"
              alt="Our Story"
              fill
              className="object-cover"
            />
          </div>
          <div className="prose prose-lg max-w-none text-gray-600">
            {aboutContent.story.paragraphs.map((paragraph, index) => (
              <p key={index} className={`text-lg leading-relaxed ${index !== aboutContent.story.paragraphs.length - 1 ? 'mb-6' : ''}`}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutContent.values.map((value, index) => {
              const Icon = ICON_MAP[value.icon?.toLowerCase?.() ?? ''] ?? Shield;
              return (
                <div key={`${value.title}-${index}`} className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Mawjood in Numbers</h2>
            <p className="text-xl text-white/90">Our impact on Saudi Arabia's digital economy</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {aboutContent.stats.map((stat, index) => (
              <div key={`${stat.label}-${index}`} className="text-center">
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built by Experts</h2>
            <p className="text-xl text-gray-600">
              A dedicated team working to revolutionize local business discovery
            </p>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 text-center">
            <Users className="w-16 h-16 text-primary mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Team is Growing
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              We're a diverse team of developers, designers, and business experts passionate about 
              empowering Saudi businesses. Want to join us on this journey?
            </p>
            <Link
              href="/contact"
              className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Join Thousands of Businesses on Mawjood
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Whether you're a business owner looking to grow or a customer searching for trusted services, 
            Mawjood is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/businesses"
              className="inline-block bg-white hover:bg-gray-50 text-primary font-semibold px-8 py-4 rounded-lg border-2 border-primary transition-colors text-lg"
            >
              Explore Businesses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}