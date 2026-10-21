import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Banknote, Briefcase, ChevronRight, MapPin, type LucideIcon } from 'lucide-react';
import Seo from '../components/Seo';
import { CAREERS_SEO, hiringOrganization, jobPath, jobSeo, type JobOpening } from '../lib/jobSeo';

interface JobViewProps {
  /** Opening id from the URL (/careers/39-marketing-intern). */
  jobId: string;
  /** Live openings (GET /api/careers.php), as CareersView maps them. */
  positions: JobOpening[];
  loaded: boolean;
  /** The openings could not be loaded: the opening may well be open, so it is not called closed. */
  failed: boolean;
}

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0803]';
const APPLY_CLASS = `inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest text-neutral-950 shadow-lg transition-colors hover:bg-[#FFF3D1] ${FOCUS}`;
const nonBlank = (items: string[] = []) => items.filter((item) => item.trim() !== '');
// The application form replaces this page: start it at the top.
// Braces: newer Chrome returns a promise from scrollTo, which React would take for an effect's cleanup.
const toTop = () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
};

/**
 * An opening's own page, alphapremiergroup.com/careers/{id}-{title-slug}: the role, its company and an Apply link into
 * CareersView's application form, with JobPosting JSON-LD (lib/jobSeo). A closed or unknown opening shows the open
 * positions instead (noindex). Crawlers get the same page as server HTML (api/careers-page.php).
 */
export function JobView({ jobId, positions, loaded, failed }: JobViewProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const job = loaded && !failed ? positions.find((p) => String(p.id) === jobId) : undefined;
  const canonical = job ? jobPath(job) : null;

  // A missing or outdated slug (the opening was renamed) moves to the opening's own URL.
  useEffect(() => {
    if (canonical && location.pathname !== canonical) navigate(`${canonical}${location.search}${location.hash}`, { replace: true });
  }, [canonical, location.pathname, location.search, location.hash, navigate]);

  useEffect(toTop, [jobId]);

  // No <h1> until the opening is known: src/main.jsx swaps a crawler snapshot for the app on the first one.
  if (!loaded) return <div className="min-h-screen" aria-busy="true" />;
  if (!job) return <NotOpen positions={failed ? [] : positions} failed={failed} />;

  const org = hiringOrganization(job.enterprise_slug);
  const applyHref = `/careers/apply?job=${job.id}`;
  const description = job.description.trim();
  const sections: [string, string[]][] = [['Responsibilities', nonBlank(job.responsibilities)], ['Requirements', nonBlank(job.requirements)]];
  const facts: [string, string, LucideIcon][] = [['Location', job.location, MapPin], ['Employment type', job.type, Briefcase]];
  if (job.salary) facts.push(['Salary', job.salary, Banknote]);

  return (
    <div className="pt-12 pb-24 min-h-screen bg-[#0A0803] text-neutral-100 font-sans">
      <Seo {...jobSeo(job)} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-400">
            <li className="flex items-center gap-1.5">
              <Link to="/careers" className={`rounded font-semibold text-[#D4AF37] hover:text-[#FFF3D1] ${FOCUS}`}>Careers</Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </li>
            <li aria-current="page" className="min-w-0 break-words text-neutral-300">{job.title}</li>
          </ol>
        </nav>

        <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">{org.name}</p>
        <h1 className="mt-2 break-words text-balance text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{job.title}</h1>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {facts.map(([label, value, Icon]) => (
            <div key={label} className="flex min-w-0 items-center gap-2">
              <Icon className="w-4 h-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
              <dt className="sr-only">{label}</dt>
              <dd className="break-words text-neutral-200">{value}</dd>
            </div>
          ))}
        </dl>
        <Link to={applyHref} onClick={toTop} className={`mt-8 ${APPLY_CLASS}`}>
          Apply now <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>

        {description && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-white">About the role</h2>
            <p className="mt-3 whitespace-pre-line break-words leading-relaxed text-neutral-300">{description}</p>
          </section>
        )}
        {sections.filter(([, items]) => items.length > 0).map(([heading, items]) => (
          <section key={heading} className="mt-10">
            <h2 className="text-lg font-bold text-white">{heading}</h2>
            <ul className="mt-3 space-y-2.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 break-words leading-relaxed text-neutral-300">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" aria-hidden="true" />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-[#D4AF37]/20 pt-8">
          <Link to={applyHref} onClick={toTop} className={APPLY_CLASS}>Apply for this position</Link>
          <Link to="/careers" className={`rounded text-sm font-semibold text-[#D4AF37] hover:text-[#FFF3D1] ${FOCUS}`}>See all open positions</Link>
        </div>
      </article>
    </div>
  );
}

/** A closed or unknown opening (noindex), or openings that failed to load: the open positions instead. */
function NotOpen({ positions, failed }: { positions: JobOpening[]; failed: boolean }) {
  return (
    <div className="pt-12 pb-24 min-h-screen bg-[#0A0803] text-neutral-100 font-sans">
      {failed ? (
        <Seo {...CAREERS_SEO} />
      ) : (
        <Seo
          title="Position no longer open | Alpha Premier Group Careers"
          description="This job opening is no longer accepting applications. See the current openings at Alpha Premier Group companies."
          noindex
        />
      )}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {failed ? "We couldn't load this position" : 'This position is no longer open'}
        </h1>
        <p className="mt-3 text-neutral-300" role="status">
          {failed
            ? 'Please check your connection and try again in a moment.'
            : positions.length > 0 ? 'It may have been filled or closed. Here are our current openings.' : 'It may have been filled or closed. There are no open roles right now.'}
        </p>
        {positions.length > 0 && (
          <ul className="mt-8 divide-y divide-[#D4AF37]/15 border-y border-[#D4AF37]/15">
            {positions.map((p) => (
              <li key={p.id} className="py-4">
                <Link to={jobPath(p)} className={`rounded break-words text-base font-bold text-white hover:text-[#D4AF37] ${FOCUS}`}>{p.title}</Link>
                <p className="mt-1 break-words text-sm text-neutral-400">
                  {[hiringOrganization(p.enterprise_slug).name, p.location, p.type].join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
          <Link to="/careers" className={`rounded text-[#D4AF37] hover:text-[#FFF3D1] ${FOCUS}`}>See all careers</Link>
          <Link to="/careers/apply?job=general" className={`rounded text-[#D4AF37] hover:text-[#FFF3D1] ${FOCUS}`}>Send a general application</Link>
        </p>
      </div>
    </div>
  );
}
