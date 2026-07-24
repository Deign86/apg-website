import { Link } from "react-router-dom";
import {
  Users, Monitor, Camera, Film, Lightbulb, Megaphone,
  ArrowRight, CheckCircle2, Sparkles, Target, Clock,
} from "lucide-react";

import model2 from "@/imports/model2.jpg";
import model3 from "@/imports/model3.jpg";
import model4 from "@/imports/model4.jpg";
import model5 from "@/imports/model5.jpg";

const SERVICES = [
  {
    icon: Users,
    title: "Model & Influencer Casting",
    description: "We curate and connect brands with the right faces—models, influencers, and personalities who embody your brand's vision and voice.",
    features: [
      "Talent scouting and management",
      "Brand-talent matching and alignment",
      "Contract negotiation and coordination",
      "Campaign-specific casting calls",
    ],
    image: model4,
  },
  {
    icon: Monitor,
    title: "TV, Digital & Online Advertising",
    description: "From broadcast commercials to targeted digital campaigns, we craft media that performs across every screen and digital platform.",
    features: [
      "Multi-channel advertising strategy",
      "Television commercial production",
      "Digital ad creation and optimization",
      "Performance tracking and analytics",
    ],
    image: model5,
  },
  {
    icon: Megaphone,
    title: "Product Launches & Social Campaigns",
    description: "Launch your product with strategic campaigns and buzz-building content that drives real engagement and lasting brand recall.",
    features: [
      "Launch strategy and planning",
      "Social media campaign design",
      "Influencer partnership coordination",
      "Event production and execution",
    ],
    image: model2,
  },
  {
    icon: Camera,
    title: "Fashion & Product Photography",
    description: "We produce studio-grade visual assets that elevate your brand's identity with editorial precision and creative vision.",
    features: [
      "Editorial fashion photography",
      "E-commerce product shoots",
      "Lifestyle and brand imagery",
      "Studio and on-location shoots",
    ],
    image: model3,
  },
  {
    icon: Film,
    title: "Video Direction & Production",
    description: "From concept to final cut, we craft compelling video stories that captivate, convert, and endure beyond the campaign.",
    features: [
      "Concept development and scripting",
      "Full-scale video production",
      "Post-production and editing",
      "Motion graphics and animation",
    ],
    image: model4,
  },
  {
    icon: Lightbulb,
    title: "Creative Campaign Development",
    description: "End-to-end campaign design that connects your brand to your audience with clarity, emotion, and commercial power.",
    features: [
      "Brand strategy and positioning",
      "Creative concept development",
      "Multi-touchpoint campaign design",
      "Brand identity and messaging",
    ],
    image: model5,
  },
];

const PROCESS = [
  {
    icon: Sparkles,
    title: "Discovery & Strategy",
    description: "We start by understanding your brand, audience, and goals to craft a tailored creative strategy.",
  },
  {
    icon: Target,
    title: "Concept & Planning",
    description: "Our team develops compelling concepts and detailed production plans that bring your vision to life.",
  },
  {
    icon: Film,
    title: "Production & Execution",
    description: "We manage every detail—from casting to post-production—ensuring excellence at every stage.",
  },
  {
    icon: Clock,
    title: "Delivery & Optimization",
    description: "Final assets are delivered on time, with ongoing support to optimize performance and impact.",
  },
];

export default function Services() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FAF0F5 0%, #FAF6F8 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] opacity-30"
            style={{
              background: "radial-gradient(circle, #F5ABBE 0%, #EF8FA8 30%, transparent 70%)",
              filter: "blur(90px)",
            }}
          />
          <div
            className="absolute top-20 right-1/4 w-[400px] h-[400px] opacity-25"
            style={{
              background: "radial-gradient(circle, #E05A7A 0%, transparent 65%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <span
            className="text-xs tracking-[0.28em] uppercase text-[#C84A72] font-semibold mb-5 inline-block"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Our Services
          </span>
          <h1
            className="text-5xl lg:text-6xl font-semibold text-[#1C1814] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Full-Service Creative{" "}
            <span style={{ fontStyle: "italic" }}>Solutions</span>
          </h1>
          <p
            className="text-base lg:text-lg text-[#6B5D65] max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
          >
            From casting to post-production, Dynamic Tree delivers comprehensive
            multimedia services that elevate brands and captivate audiences.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-24 bg-[#FAF4F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col gap-16">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              const isEven = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    isEven ? "" : "lg:grid-flow-dense"
                  }`}
                >
                  {/* Image */}
                  <div className={isEven ? "lg:col-start-1" : "lg:col-start-2"}>
                    <div className="relative rounded-3xl overflow-hidden bg-[#F0D8E4] aspect-[4/3]">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-[#C84A72]/10 to-transparent" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={isEven ? "lg:col-start-2" : "lg:col-start-1"}>
                    <div
                      className="w-14 h-14 rounded-2xl bg-[#C84A72] flex items-center justify-center mb-5"
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                    <h2
                      className="text-3xl lg:text-4xl font-semibold text-[#1C1814] mb-4 leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {service.title}
                    </h2>
                    <p
                      className="text-[#6B5D65] text-base leading-relaxed mb-6"
                      style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
                    >
                      {service.description}
                    </p>
                    <ul className="space-y-3">
                      {service.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle2 size={18} className="text-[#C84A72] flex-shrink-0 mt-0.5" />
                          <span
                            className="text-sm text-[#1C1814]/80"
                            style={{ fontFamily: "Outfit, sans-serif" }}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section
        className="py-20 lg:py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FAF4F7 0%, #F5EDF3 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span
              className="text-xs tracking-[0.25em] uppercase text-[#C84A72] font-medium"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Our Process
            </span>
            <h2
              className="text-4xl lg:text-5xl font-semibold text-[#1C1814] mt-3 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              How We{" "}
              <span style={{ fontStyle: "italic" }}>Work</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#E8C8D4]/40 hover:border-[#C84A72]/30 transition-all h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#F5E0EC] flex items-center justify-center mb-4">
                      <Icon size={20} className="text-[#C84A72]" />
                    </div>
                    <span
                      className="text-xs tracking-widest uppercase text-[#C84A72] font-medium mb-2 block"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      Step {i + 1}
                    </span>
                    <h3
                      className="text-lg font-semibold text-[#1C1814] mb-3"
                      style={{ fontFamily: "Outfit, sans-serif" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm text-[#8A7078] leading-relaxed"
                      style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-[#1C1814] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: "radial-gradient(circle, #C84A72 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2
            className="text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready to Elevate{" "}
            <span style={{ fontStyle: "italic" }}>Your Brand?</span>
          </h2>
          <p
            className="text-base text-white/70 max-w-xl mx-auto mb-8 leading-relaxed"
            style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
          >
            Let's create something extraordinary together. Contact us to discuss
            your next campaign.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#C84A72] text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-[#A0305A] transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Get in Touch
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}