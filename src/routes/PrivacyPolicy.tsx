import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <article className="mx-auto w-full max-w-4xl px-6 py-16 text-neutral-200">
      <Helmet>
        <title>Privacy Policy | Alpha Premier Group</title>
        <meta name="description" content="Learn how Alpha Premier Group collects, uses, and protects personal information." />
      </Helmet>
      <h1 className="mb-6 text-3xl font-bold text-[#E2B857]">Privacy Policy</h1>
      <p className="mb-4">Alpha Premier Group of Companies respects your privacy and handles personal information in accordance with applicable Philippine laws, including the Data Privacy Act of 2012 (Republic Act No. 10173).</p>
      <h2 className="mb-2 mt-8 text-xl font-semibold">Information and its use</h2>
      <p className="mb-4">When you contact us, apply for a position, or request information about our services, we may use the details you provide to respond, assess your request, and deliver relevant services. Please provide only information needed for your inquiry.</p>
      <h2 className="mb-2 mt-8 text-xl font-semibold">Sharing and retention</h2>
      <p className="mb-4">Information may be shared with the relevant Alpha Premier Group business unit or service providers supporting our operations, subject to appropriate safeguards. We retain information only as long as reasonably necessary for its stated purpose or legal obligations.</p>
      <h2 className="mb-2 mt-8 text-xl font-semibold">Your choices and contact</h2>
      <p>For questions, access or correction requests, or concerns about personal information, contact Alpha Premier Group at <a className="underline" href="mailto:contact@alphapremiergroup.com">contact@alphapremiergroup.com</a>. This policy may be updated as our practices or legal requirements change.</p>
    </article>
  );
}
