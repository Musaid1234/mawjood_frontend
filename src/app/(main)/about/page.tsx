import Link from 'next/link';
import { Building2, Users, Award, Target, Heart, TrendingUp, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Welcome to Mawjood
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Your trusted platform connecting businesses and customers across Saudi Arabia
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span>1000+ Businesses</span>
              </div>
              <div className="w-1 h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>50,000+ Users</span>
              </div>
              <div className="w-1 h-4 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Verified & Trusted</span>
              </div>
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
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To empower local businesses in Saudi Arabia by providing them with a powerful digital platform 
                to reach more customers, grow their presence, and thrive in the digital economy. We believe 
                every business deserves the opportunity to succeed online.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become the leading business discovery platform in Saudi Arabia, where every local business 
                is visible, accessible, and celebrated. We envision a future where finding trusted services 
                and businesses is effortless for every Saudi resident.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="text-lg leading-relaxed mb-6">
              Mawjood was born from a simple observation: finding reliable local businesses in Saudi Arabia 
              was harder than it should be. In 2024, we set out to change that by creating a platform that 
              brings businesses and customers together seamlessly.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              What started as a small directory has grown into a comprehensive platform serving thousands 
              of businesses across major Saudi cities. From restaurants and shops to professional services 
              and entertainment venues, Mawjood has become the go-to platform for discovering local businesses.
            </p>
            <p className="text-lg leading-relaxed">
              Today, we're proud to support Saudi Arabia's Vision 2030 by digitizing local commerce and 
              helping businesses of all sizes reach their full potential in the digital age.
            </p>
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
            {/* Value 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trust & Safety</h3>
              <p className="text-gray-600">
                We verify every business to ensure our users connect with legitimate, trustworthy services.
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously improve our platform with cutting-edge features and user-friendly design.
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community First</h3>
              <p className="text-gray-600">
                We prioritize the needs of our local communities and support Saudi businesses at every stage.
              </p>
            </div>

            {/* Value 4 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Passion</h3>
              <p className="text-gray-600">
                We're passionate about helping businesses succeed and making life easier for our users.
              </p>
            </div>
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
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">1,000+</div>
              <div className="text-white/80 text-lg">Active Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">50,000+</div>
              <div className="text-white/80 text-lg">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">45+</div>
              <div className="text-white/80 text-lg">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">100,000+</div>
              <div className="text-white/80 text-lg">Monthly Searches</div>
            </div>
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