import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function useLicenseData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLicenseData = async () => {
      try {
        setLoading(true);

        // Fetch all license data using direct Supabase calls
        const [licenseTypesResult, requirementsResult, pricingResult, proceduresResult] = await Promise.all([
          supabase
            .from('license_types')
            .select('*')
            .eq('is_active', true)
            .order('id'),

          supabase
            .from('license_requirements')
            .select('*')
            .order('sort_order'),

          supabase
            .from('license_pricing')
            .select('*')
            .eq('is_active', true)
            .order('price_type'),

          supabase
            .from('license_procedures')
            .select('*')
            .eq('is_active', true)
            .order('step_order')
        ]);

        // Check for errors
        if (licenseTypesResult.error) throw licenseTypesResult.error;
        if (requirementsResult.error) throw requirementsResult.error;
        if (pricingResult.error) throw pricingResult.error;
        if (proceduresResult.error) throw proceduresResult.error;

        // Group requirements by license type
        const requirementsByType = {};
        requirementsResult.data.forEach(req => {
          if (!requirementsByType[req.license_type_id]) {
            requirementsByType[req.license_type_id] = [];
          }
          requirementsByType[req.license_type_id].push(req);
        });

        // Group pricing by license type
        const pricingByType = {};
        pricingResult.data.forEach(price => {
          if (!pricingByType[price.license_type_id]) {
            pricingByType[price.license_type_id] = [];
          }
          pricingByType[price.license_type_id].push(price);
        });

        // Group procedures by type
        const proceduresByType = {};
        proceduresResult.data.forEach(proc => {
          if (!proceduresByType[proc.procedure_type]) {
            proceduresByType[proc.procedure_type] = [];
          }
          proceduresByType[proc.procedure_type].push(proc);
        });

        // Combine all data
        const licenseTypes = licenseTypesResult.data.map(type => ({
          ...type,
          requirements: requirementsByType[type.id] || [],
          pricing: pricingByType[type.id] || []
        }));

        const licenseData = {
          licenseTypes,
          licenseRequirements: requirementsResult.data,
          licensePricing: pricingResult.data,
          licenseProcedures: proceduresResult.data,
          procedures: proceduresByType,
          allProcedures: proceduresResult.data
        };

        setData(licenseData);
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
