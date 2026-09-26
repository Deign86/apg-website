import { Helmet } from 'react-helmet-async';

export default function TermsConditions() {
  return (
    <article className="mx-auto w-full max-w-4xl px-6 py-16 text-neutral-200">
      <Helmet>
        <title>Terms and Conditions | Alpha Premier Group</title>
        <meta name="description" content="Review the terms that apply to use of the Alpha Premier Group website." />
      </Helmet>
      <h1 className="mb-6 text-3xl font-bold text-[#E2B857]">Terms and Conditions</h1>
      <p className="mb-4">These terms apply to your use of the Alpha Premier Group of Companies website. By using this site, you agree to use it lawfully and in a way that does not interfere with its operation or other visitors.</p>
      <h2 className="mb-2 mt-8 text-xl font-semibold">Website information</h2>
      <p className="mb-4">Content is provided for general information and may change without notice. Service availability, property details, career opportunities, and other offerings are subject to confirmation by the relevant Alpha Premier Group business unit; website content does not itself create a contract or guarantee availability.</p>
      <h2 className="mb-2 mt-8 text-xl font-semibold">Intellectual property and third-party links</h2>
      <p className="mb-4">Unless otherwise stated, website text, branding, and media belong to Alpha Premier Group or its licensors and may not be reused commercially without permission. Links to third-party sites are provided for convenience; Alpha Premier Group does not control or endorse their content.</p>
      <h2 className="mb-2 mt-8 text-xl font-semibold">Limitations and updates</h2>
      <p>To the extent permitted by law, Alpha Premier Group is not responsible for loss arising from reliance on information on this site or temporary interruption of access. We may revise these terms by updating this page. For questions, contact <a className="underline" href="mailto:contact@alphapremiergroup.com">contact@alphapremiergroup.com</a>.</p>
    </article>
  );
}
