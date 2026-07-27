import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Briefcase, MapPin, Search, ArrowRight } from 'lucide-react';
import { JobApplyModal } from '../components/JobApplyModal';
import AOS from 'aos';

const fallbackJobs = [
  { id: 'job-1', title: 'Real Estate Consultant', location: 'Makati City', type: 'Full-time', division: 'Real Estate', description: 'Drive high-value commercial and luxury residential property sales across Metro Manila CBDs.', requirements: ['3+ years experience in corporate or luxury real estate sales', 'Strong network of corporate tenants and investors'], responsibilities: ['Manage end-to-end lease and sale negotiations', 'Conduct site viewings and present investment reports'] },
  { id: 'job-2', title: 'Property Manager', location: 'BGC, Taguig', type: 'Full-time', division: 'Real Estate', description: 'Oversee premier property management and operations across high-profile developments.', requirements: ['Licensed Broker or equivalent experience', '2+ years in property or building management'], responsibilities: ['Oversee site operations and client relationships', 'Manage tenant request tickets and scheduling'] },
  { id: 'job-3', title: 'Marketing Associate', location: 'Quezon City', type: 'Part-time', division: 'Corporate', description: 'Develop and execute creative branding campaigns across digital channels.', requirements: ['Degree in Marketing, Communications or similar', 'Proficient in social media and design tools'], responsibilities: ['Create visual assets and copy for digital campaigns', 'Monitor analytics and lead generation performance'] },
];

export default function Careers() {
  const { onOpenInquire } = useOutletContext();
  const [jobs, setJobs] = useState(null);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  
  // Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [activeApplyJob, setActiveApplyJob] = useState(null);

  const divisions = ['ALL', 'Real Estate', 'Construction', 'Corporate', 'Business Hub', 'Swift Clear'];

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    supabase.from('job_openings').select('*').eq('status', 'active').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          setJobs(data.map(j => ({
            id: String(j.id || Math.random()),
            title: j.title,
            location: j.location || 'Pasig City',
            type: j.type || 'Full-time',
            division: j.division || j.tag || 'Real Estate',
            description: j.description || 'Apply for this exciting role under Alpha Premier Group.',
            requirements: Array.isArray(j.requirements) ? j.requirements : (j.requirements ? j.requirements.split('\n') : ['Prior experience in the role', 'Excellent communication skills']),
            responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities : (j.responsibilities ? j.responsibilities.split('\n') : ['Manage daily operations and support stakeholders', 'Collaborate with cross-functional teams'])
          })));
        }
      })
      .catch(() => { /* Query failed — fallback renders */ });

    supabase.from('site_settings').select('key,value').in('key', ['careers_hero_title', 'careers_hero_subtitle'])
      .then(({ data }) => {
        if (data?.length) {
          data.forEach(s => {
            if (s.key === 'careers_hero_title') setHeroTitle(s.value);
            if (s.key === 'careers_hero_subtitle') setHeroSubtitle(s.value);
          });
        }
      })
      .catch(() => {});
  }, []);

  const displayJobs = jobs || fallbackJobs;

  const filteredJobs = displayJobs.filter((job) => {
    const matchesDiv = selectedDivision === 'ALL' || job.division.toLowerCase() === selectedDivision.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDiv && matchesSearch;
  });

  const handleOpenApply = (job) => {
    setActiveApplyJob(job);
    setApplyModalOpen(true);
  };

  return (
    <>
      <Helmet><title>Careers | Alpha Premier</title></Helmet>
      
      <div className="bg-black text-neutral-100 font-sans min-h-screen pb-20 pt-24">
        
        {/* Header Banner */}
        <section className="bg-[#08080A] border-b border-[#1C1C22] py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-3 relative z-10">
            <span className="text-[10px] font-bold tracking-[0.25em] text-[#E2B857] uppercase font-display">
              JOIN OUR TEAM
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-display">
              {heroTitle || 'Careers & Opportunities'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle || 'Build your future with one of the Philippines\' fastest-growing conglomerates. Explore open positions across our real estate, construction, and corporate divisions.'}
            </p>
          </div>
        </section>

        {/* Filter & Search Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-aos="fade-up">
          
          <div className="bg-[#10141E] border border-[#232938] p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search positions, keywords..."
                className="w-full bg-[#151A26] border border-[#2B3142] focus:border-[#E2B857] pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 outline-none"
              />
            </div>

            {/* Division Filters */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {divisions.map((div) => (
                <button
                  key={div}
                  onClick={() => setSelectedDivision(div)}
                  className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                    selectedDivision === div
                      ? 'bg-[#E2B857] text-neutral-950 font-extrabold'
                      : 'bg-[#151A26] text-neutral-400 border border-[#2B3142] hover:text-white hover:border-[#E2B857]'
                  }`}
                >
                  {div}
                </button>
              ))}
            </div>

          </div>

        </section>

        {/* Job Cards Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" data-aos="fade-up">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#10141E] border border-[#232938] hover:border-[#E2B857] p-6 space-y-4 flex flex-col justify-between transition-all duration-200 group"
              >
                <div className="space-y-3">
                  
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#E2B857] uppercase block mb-0.5 font-display">
                        {job.division}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#E2B857] transition-colors font-display">
                        {job.title}
                      </h3>
                    </div>
                    <span className="bg-[#E2B857]/15 text-[#E2B857] border border-[#E2B857]/40 text-[10px] font-extrabold px-2.5 py-1 tracking-wider shrink-0 font-display">
                      {job.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <MapPin className="w-3.5 h-3.5 text-[#E2B857]" />
                    <span>{job.location}</span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Key Requirements snippet */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="pt-2 border-t border-[#1F2533] space-y-1">
                      <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Key Requirements:
                      </h4>
                      <ul className="list-disc list-inside text-[11px] text-neutral-400 space-y-0.5">
                        {job.requirements.slice(0, 2).map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

                <div className="pt-4 border-t border-[#1F2533] flex items-center justify-between">
                  <span className="text-[10px] text-neutral-500">Ref: {job.id.toUpperCase().substring(0, 8)}</span>
                  <button
                    onClick={() => handleOpenApply(job)}
                    className="px-5 py-2 bg-[#E2B857] hover:bg-[#cfa543] text-neutral-950 font-extrabold text-xs tracking-widest uppercase flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <span>APPLY NOW</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12 bg-[#10141E] border border-[#232938]">
              <p className="text-xs text-neutral-400">No open roles found matching your search.</p>
            </div>
          )}

        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12" data-aos="fade-up">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-extrabold tracking-[0.3em] text-[#E2B857] uppercase font-michroma font-display">
              WHY WORK WITH US?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase font-michroma font-display">
              Benefits & Perks
            </h2>
            <div className="w-16 h-0.5 bg-[#E2B857] mx-auto shadow-[0_0_12px_#E2B857] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-[#10141E] border border-[#232938] hover:border-[#E2B857]/50 rounded-xl transition-colors">
              <span className="text-[#E2B857] text-2xl">💎</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mt-3 mb-2 font-display">Premium Growth</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Access to high-value listings and elite training in the real estate industry tailored for future leaders.
              </p>
            </div>
            <div className="p-6 bg-[#10141E] border border-[#232938] hover:border-[#E2B857]/50 rounded-xl transition-colors">
              <span className="text-[#E2B857] text-2xl">🤝</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mt-3 mb-2 font-display">Elite Networking</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Build lifelong connections with top-tier investors, property developers, and high-net-worth clients.
              </p>
            </div>
            <div className="p-6 bg-[#10141E] border border-[#232938] hover:border-[#E2B857]/50 rounded-xl transition-colors">
              <span className="text-[#E2B857] text-2xl">🚀</span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mt-3 mb-2 font-display">Innovation First</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Utilize state-of-the-art digital marketing tools and CRM systems to stay ahead of the competition.
              </p>
            </div>
          </div>
        </section>

        {/* Career Inquiry CTA */}
        <section className="py-16 text-center bg-[#07090D] border-t border-neutral-900" data-aos="fade-up">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-display">Not Finding Your Role?</h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              We are always seeking exceptional talents. Send us a general application file and let's explore.
            </p>
            <button 
              onClick={() => handleOpenApply(null)} 
              className="px-6 py-3 bg-[#E2B857] hover:bg-[#cfa543] text-neutral-950 font-extrabold text-xs tracking-widest uppercase transition-colors cursor-pointer"
            >
              SEND GENERAL RESUME
            </button>
          </div>
        </section>

      </div>

      <JobApplyModal
        job={activeApplyJob}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
      />
    </>
  );
}
