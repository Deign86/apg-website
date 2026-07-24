import { MapPin, Clock, Briefcase, ArrowRight, Heart, Users, Zap, Target } from "lucide-react";
import model4 from "@/imports/model4.jpg";
import model6 from "@/imports/model6.jpg";
import model8 from "@/imports/model8.jpg";

const OPEN_POSITIONS = [
  {
    title: "Creative Director",
    department: "Creative",
    type: "Full Time",
    location: "Manila, Philippines",
    description: "Lead our creative vision and oversee multimedia campaigns from concept to execution. Guide a team of designers, photographers, and videographers.",
  },
  {
    title: "Talent Scout & Manager",
    department: "Talent",
    type: "Full Time",
    location: "Manila, Philippines",
    description: "Discover and nurture emerging talent while managing relationships with models, influencers, and brand ambassadors.",
  },
  {
    title: "Senior Photographer",
    department: "Production",
    type: "Freelance",
    location: "Manila, Philippines",
    description: "Capture stunning editorial and commercial imagery for fashion brands, product launches, and advertising campaigns.",
  },
  {
    title: "Campaign Strategist",
    department: "Strategy",
    type: "Full Time",
    location: "Manila, Philippines",
    description: "Develop integrated marketing strategies that drive brand awareness and engagement across multiple channels.",
  },
  {
    title: "Video Producer & Editor",
    department: "Production",
    type: "Full Time",
    location: "Manila, Philippines",
    description: "Produce and edit compelling video content for digital platforms, TV commercials, and social media campaigns.",
  },
  {
    title: "Social Media Manager",
    department: "Digital",
    type: "Full Time",
    location: "Manila, Philippines",
    description: "Manage social strategies and content creation for clients while staying ahead of platform trends and algorithm changes.",
  },
];

const BENEFITS = [
  {
    icon: Heart,
    title: "Work-Life Balance",
    description: "Flexible schedules and remote work options to support your wellbeing.",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    description: "Join a diverse, creative team that values every voice and perspective.",
  },
  {
    icon: Zap,
    title: "Growth Opportunities",
    description: "Professional development, workshops, and career advancement paths.",
  },
  {
    icon: Target,
    title: "Impactful Projects",
    description: "Work on high-profile campaigns for leading brands and cultural events.",
  },
];

export default function Careers() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FAF0F5 0%, #FAF6F8 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/3 w-[500px] h-[500px] opacity-30"
            style={{
              background: "radial-gradient(circle, #F5ABBE 0%, transparent 70%)",
              filter: "blur(90px)",
            }}
          />
          <div
            className="absolute top-32 right-1/3 w-[400px] h-[400px] opacity-25"
            style={{
              background: "radial-gradient(circle, #EDE0F5 0%, transparent 65%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <span
            className="text-xs tracking-[0.28em] uppercase text-[#C84A72] font-semibold mb-5 inline-block"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Join Our Team
          </span>
          <h1
            className="text-5xl lg:text-6xl font-semibold text-[#1C1814] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Build Your Career in{" "}
            <span style={{ fontStyle: "italic" }}>Creative Excellence</span>
          </h1>
          <p
            className="text-base lg:text-lg text-[#6B5D65] max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
          >
            Be part of a team that brings ideas to life through multimedia
            storytelling, innovative campaigns, and award-winning creative work.
          </p>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16 lg:py-24 bg-[#FAF4F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            <div>
              <span
                className="text-xs tracking-[0.25em] uppercase text-[#C84A72] font-medium mb-4 inline-block"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                Our Culture
              </span>
              <h2
                className="text-4xl lg:text-5xl font-semibold text-[#1C1814] mb-6 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Where Creativity{" "}
                <span style={{ fontStyle: "italic" }}>Thrives</span>
              </h2>
              <p
                className="text-base text-[#6B5D65] leading-relaxed mb-6"
                style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
              >
                At Dynamic Tree, we believe great work comes from passionate people
                who are empowered to take risks, experiment, and push creative
                boundaries. Our collaborative environment celebrates diverse
                perspectives and rewards bold thinking.
              </p>
              <p
                className="text-base text-[#6B5D65] leading-relaxed"
                style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
              >
                From runway shows to digital campaigns, we work with leading brands
                and cultural institutions to create moments that matter. Join us and
                make your mark on the industry.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden bg-[#F0D8E8]" style={{ aspectRatio: "3/4" }}>
                <img
                  src={model8}
                  alt="Dynamic Tree team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-4 pt-8">
                <div className="rounded-2xl overflow-hidden bg-[#F0D8E8]" style={{ aspectRatio: "1/1" }}>
                  <img
                    src={model6}
                    alt="Creative team at work"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden bg-[#F0D8E8]" style={{ aspectRatio: "1/1" }}>
                  <img
                    src={model4}
                    alt="Behind the scenes production"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#E8C8D4]/40 hover:border-[#C84A72]/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F5E0EC] flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[#C84A72]" />
                  </div>
                  <h3
                    className="text-lg font-semibold text-[#1C1814] mb-2"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    className="text-sm text-[#8A7078] leading-relaxed"
                    style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
                  >
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section
        className="py-20 lg:py-28 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FAF4F7 0%, #F5EDF3 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <span
              className="text-xs tracking-[0.25em] uppercase text-[#C84A72] font-medium mb-4 inline-block"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              Open Positions
            </span>
            <h2
              className="text-4xl lg:text-5xl font-semibold text-[#1C1814] mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Current{" "}
              <span style={{ fontStyle: "italic" }}>Opportunities</span>
            </h2>
            <p
              className="text-base text-[#6B5D65] max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
            >
              Explore our open roles and find where your talents can make an impact.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {OPEN_POSITIONS.map((job, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 lg:p-8 border border-[#E8C8D4]/40 hover:border-[#C84A72]/40 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-xl lg:text-2xl font-semibold text-[#1C1814] mb-2 group-hover:text-[#C84A72] transition-colors"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#8A7078]">
                      <span
                        className="flex items-center gap-1.5"
                        style={{ fontFamily: "Outfit, sans-serif" }}
                      >
                        <Briefcase size={14} />
                        {job.department}
                      </span>
                      <span
                        className="flex items-center gap-1.5"
                        style={{ fontFamily: "Outfit, sans-serif" }}
                      >
                        <Clock size={14} />
                        {job.type}
                      </span>
                      <span
                        className="flex items-center gap-1.5"
                        style={{ fontFamily: "Outfit, sans-serif" }}
                      >
                        <MapPin size={14} />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('inquire');
                      else if (window.enterpriseNavigate) window.enterpriseNavigate('inquire');
                    }}
                    className="group/btn flex items-center gap-2 bg-[#C84A72] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#A0305A] transition-all self-start cursor-pointer"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Apply Now
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
                <p
                  className="text-sm text-[#6B5D65] leading-relaxed"
                  style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
                >
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-[#1C1814] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: "radial-gradient(circle, #C84A72 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2
            className="text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Don't See Your{" "}
            <span style={{ fontStyle: "italic" }}>Perfect Role?</span>
          </h2>
          <p
            className="text-base text-white/70 max-w-xl mx-auto mb-8 leading-relaxed"
            style={{ fontFamily: "Outfit, sans-serif", fontWeight: 300 }}
          >
            We're always looking for talented individuals. Send us your portfolio
            and let's explore how you can contribute to Dynamic Tree.
          </p>
          <button
            onClick={() => {
              if (onNavigate) onNavigate('inquire');
              else if (window.enterpriseNavigate) window.enterpriseNavigate('inquire');
            }}
            className="inline-flex items-center gap-2 bg-[#C84A72] text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-[#A0305A] transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            Submit Your Portfolio
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </>
  );
}