import { Navigate, useParams } from 'react-router-dom';

export function MobileInsuranceDetailPage() {
  const params = useParams();
  const policyId = Number(params.id);

  if (!Number.isInteger(policyId) || policyId <= 0) {
    return <Navigate to="/insurance" replace />;
  }

  return <Navigate to={`/insurance?policyId=${policyId}`} replace />;
}
