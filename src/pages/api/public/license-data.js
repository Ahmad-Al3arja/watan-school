import { supabase } from '../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Fetch all license data
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

    const response = {
      success: true,
      data: {
        licenseTypes,
        licenseRequirements: requirementsResult.data,
        licensePricing: pricingResult.data,
        licenseProcedures: proceduresResult.data,
        procedures: proceduresByType,
        allProcedures: proceduresResult.data
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching license data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
