import { useState } from 'react';
import {
  Heart, Users, Globe, Shield, Mail, Phone, MapPin,
  ExternalLink, ChevronRight, Star, Award, Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { Page } from '../types';
import { useI18n } from '../i18n';

interface AboutProps {
  onNavigate: (page: Page, params?: any) => void;
}

export default function About({ onNavigate }: AboutProps) {
  const { t } = useI18n();

  const stats = [
    { icon: Users, label: 'Community Members', value: '10,000+', color: 'text-blue-600' },
    { icon: Globe, label: 'Languages Supported', value: '5', color: 'text-green-600' },
    { icon: Star, label: 'Guides Available', value: '11+', color: 'text-yellow-600' },
    { icon: Award, label: 'Volunteer Hours', value: '5,000+', color: 'text-purple-600' },
  ];

  const features = [
    {
      icon: Globe,
      title: 'Multilingual Support',
      desc: 'Available in English, Chinese (Simplified & Traditional), Cantonese, and Spanish.',
    },
    {
      icon: Users,
      title: 'Community Forum',
      desc: 'Connect with other immigrants, share experiences, and get answers to your questions.',
    },
    {
      icon: Shield,
      title: 'Trusted Resources',
      desc: 'Verified guides and resources from official sources and community experts.',
    },
    {
      icon: Heart,
      title: 'Volunteer Opportunities',
      desc: 'Give back to the community by volunteering at events and helping newcomers.',
    },
  ];

  const team = [
    { name: 'CaliGuide Team', role: 'Platform Development', avatar: 'CG' },
    { name: 'Community Volunteers', role: 'Content & Support', avatar: 'CV' },
    { name: 'Legal Advisors', role: 'Immigration Guidance', avatar: 'LA' },
  ];

  return (
    <div className="pt-16 pb-4 px-4">
      {/* Hero Section */}
      <section className="py-8 text-center">
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl font-bold text-white">C</span>
        </div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">CaliGuide</h1>
        <p className="text-lg text-on-surface-variant mb-4">
          Your Trusted Guide to Life in California
        </p>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          CaliGuide is a comprehensive platform designed to help immigrants and newcomers
          navigate life in California. From DMV appointments to healthcare access, we provide
          the resources you need to thrive.
        </p>
      </section>

      {/* Stats */}
      <section className="mb-8">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4 text-center"
            >
              <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
              <p className="text-xs text-on-surface-variant">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-4">What We Offer</h2>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4 flex items-start gap-4"
            >
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                <feature.icon size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface mb-1">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mb-8">
        <div className="card p-6 bg-gradient-to-br from-primary-light to-white">
          <h2 className="text-xl font-bold text-on-surface mb-3">Our Mission</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            We believe every immigrant deserves access to reliable information and a supportive
            community. CaliGuide bridges the gap between newcomers and the resources they need
            to build a successful life in California.
          </p>
          <div className="flex items-center gap-2 text-primary font-medium">
            <Heart size={18} />
            <span>Building bridges, one guide at a time</span>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-4">Our Team</h2>
        <div className="grid grid-cols-3 gap-3">
          {team.map((member, index) => (
            <div key={index} className="card p-4 text-center">
              <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lg font-bold text-primary">{member.avatar}</span>
              </div>
              <p className="text-sm font-medium text-on-surface">{member.name}</p>
              <p className="text-[10px] text-on-surface-variant mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-4">Contact Us</h2>
        <div className="card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Mail size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">Email</p>
              <p className="text-sm text-primary">support@caliguide.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Phone size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">Phone</p>
              <p className="text-sm text-primary">+1 (800) CALI-GUIDE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <MapPin size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface">Office</p>
              <p className="text-sm text-on-surface-variant">San Francisco, CA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-4">Resources</h2>
        <div className="space-y-2">
          <a
            href="https://www.uscis.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center justify-between hover:bg-surface-variant/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-primary" />
              <span className="text-sm font-medium">USCIS Official Website</span>
            </div>
            <ExternalLink size={16} className="text-on-surface-variant" />
          </a>
          <a
            href="https://www.dmv.ca.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center justify-between hover:bg-surface-variant/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-primary" />
              <span className="text-sm font-medium">California DMV</span>
            </div>
            <ExternalLink size={16} className="text-on-surface-variant" />
          </a>
          <a
            href="https://www.coveredca.com"
            target="_blank"
            rel="noopener noreferrer"
            className="card p-4 flex items-center justify-between hover:bg-surface-variant/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-primary" />
              <span className="text-sm font-medium">Covered California</span>
            </div>
            <ExternalLink size={16} className="text-on-surface-variant" />
          </a>
        </div>
      </section>

      {/* Version */}
      <section className="text-center py-4">
        <p className="text-xs text-on-surface-variant">
          CaliGuide v1.0.0 • Made with ❤️ for immigrants
        </p>
      </section>
    </div>
  );
}
