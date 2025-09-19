import { useState, useEffect } from 'react';

export function useLicenseData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLicenseData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/license-data');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch license data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenseData();
  }, []);

  return { data, loading, error };
}

export function useLicenseType(typeKey) {
  const { data, loading, error } = useLicenseData();
  
  const licenseType = data?.licenseTypes?.find(type => type.type_key === typeKey);
  
  return {
    licenseType,
    loading,
    error
  };
}

export function useLicenseProcedures() {
  const { data, loading, error } = useLicenseData();
  
  return {
    procedures: data?.procedures,
    allProcedures: data?.allProcedures,
    loading,
    error
  };
}
