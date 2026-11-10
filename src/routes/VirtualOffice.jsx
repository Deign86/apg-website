import React from 'react';
import { EnterpriseSeo } from '../components/Seo';
import VirtualOfficeApp from './virtual-office/VirtualOfficeApp';
import { useSearchParams } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { VO_FALLBACK_PACKAGES } from '@/data/virtualOffice';
import EnterpriseInquire from './subsidiaries/EnterpriseInquire';

export default function VirtualOffice() {
  return (
    <>
      <EnterpriseSeo slug="virtual-office" />
      <VirtualOfficeApp />
    </>
  );
}

/**
 * /virtual-office/inquire (virtual-office.alphapremiergroup.com/inquire): the shared enterprise
 * inquiry form for Virtual Office, with ?package=<plan> pre-filled and the plans as topics.
 */
export function VirtualOfficeInquire() {
  const [searchParams] = useSearchParams();
  const plan = (searchParams.get('package') || '').trim().slice(0, 200);
  const { services: plans } = useServices('virtual-office', VO_FALLBACK_PACKAGES);
  const config = {
    slug: 'virtual-office',
    name: 'Virtual Office',
    botTitle: 'Alpha Premier AI',
    accentColor: '#C5A059',
    quickPrompts: plans.map((pkg) => pkg.title).filter(Boolean),
  };
  return <EnterpriseInquire key={plan} interest={plan} config={config} />;
}
