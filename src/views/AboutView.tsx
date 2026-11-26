import { AboutUsSection } from '../components/redesign/AboutUsSection';

interface AboutViewProps {
  onNavigate: (tab: string) => void;
}

/** /about: the group overview, CEO and corporate statement from the home page, as a page of its own. */
export function AboutView({ onNavigate }: AboutViewProps) {
  return (
    <>
      <h1 className="sr-only">About Alpha Premier Group of Companies</h1>
      <AboutUsSection onNavigateToEnterprises={() => onNavigate('enterprises')} />
    </>
  );
}
