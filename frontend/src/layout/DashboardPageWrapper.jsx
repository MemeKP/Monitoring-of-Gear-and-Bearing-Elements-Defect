import { useParams, useNavigate } from 'react-router-dom';
import { DashboardPage } from '../routes/Dashboard copy';
import { SITES } from '../mock/SITES';

function DashboardPageWrapper() {
  const { siteId } = useParams();
  const navigate = useNavigate();

  // Find the site from SITES array
  //   const SITES = 'maemoh-mine'
  const site = SITES.find(s => s.id === siteId);

  if (!site) {
    return <div>Site not found</div>;
  }

  return (
    <DashboardPage
      siteName={site.name}
      onBack={() => navigate('/')}
    />
    // <DashboardPage/>
  );
}

export default DashboardPageWrapper