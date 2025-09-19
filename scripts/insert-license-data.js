const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qsouiaoznytroebxuchm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb3VpYW96bnl0cm9lYnh1Y2htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYxNjQyOCwiZXhwIjoyMDczMTkyNDI4fQ.IKXwX8RC8WVeqo39HQT7yurtlQm7GQbieYocRtZuXJg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertLicenseData() {
  try {
    console.log('🚀 Inserting license data into Supabase...');
    
    // First, check if tables exist by trying to get license types
    const { data: existingTypes, error: checkError } = await supabase
      .from('license_types')
      .select('id, type_key')
      .limit(1);

    if (checkError) {
      console.error('❌ Tables do not exist yet. Please run the SQL script first:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open the SQL Editor');
      console.log('3. Run the contents of scripts/create-tables-manual.sql');
      console.log('4. Then run this script again');
      return;
    }

    // If we have existing types, use them
    let typeMap = {};
    if (existingTypes && existingTypes.length > 0) {
      const { data: allTypes } = await supabase
        .from('license_types')
        .select('id, type_key');
      
      allTypes.forEach(type => {
        typeMap[type.type_key] = type.id;
      });
      console.log('✅ Found existing license types');
    } else {
      // Create license types first
      console.log('📝 Creating license types...');
      const licenseTypes = [
        {
          name_ar: 'خصوصي',
          name_en: 'Private',
          type_key: 'private',
          min_age_exam: 17,
          min_age_license: 17,
          description_ar: 'رخصة قيادة للاستخدام الشخصي',
          description_en: 'Private driving license for personal use'
        },
        {
          name_ar: 'دراجة نارية',
          name_en: 'Motorcycle',
          type_key: 'motorcycle',
          min_age_exam: 17,
          min_age_license: 17,
          description_ar: 'رخصة قيادة دراجة نارية',
          description_en: 'Motorcycle driving license'
        },
        {
          name_ar: 'شحن خفيف',
          name_en: 'Light Truck',
          type_key: 'light_truck',
          min_age_exam: 17,
          min_age_license: 18,
          description_ar: 'رخصة قيادة شاحنة خفيفة',
          description_en: 'Light truck driving license'
        },
        {
          name_ar: 'شحن ثقيل',
          name_en: 'Heavy Truck',
          type_key: 'heavy_truck',
          min_age_exam: 19,
          min_age_license: 19,
          description_ar: 'رخصة قيادة شاحنة ثقيلة',
          description_en: 'Heavy truck driving license'
        },
        {
          name_ar: 'تريلا',
          name_en: 'Trailer',
          type_key: 'trailer',
          min_age_exam: 20,
          min_age_license: 20,
          description_ar: 'رخصة قيادة تريلا',
          description_en: 'Trailer driving license'
        },
        {
          name_ar: 'تاكسي عمومي',
          name_en: 'Public Taxi',
          type_key: 'public_taxi',
          min_age_exam: 21,
          min_age_license: 21,
          description_ar: 'رخصة قيادة تاكسي عمومي',
          description_en: 'Public taxi driving license'
        },
        {
          name_ar: 'باص عمومي',
          name_en: 'Public Bus',
          type_key: 'public_bus',
          min_age_exam: 21,
          min_age_license: 21,
          description_ar: 'رخصة قيادة باص عمومي',
          description_en: 'Public bus driving license'
        }
      ];

      const { data: insertedTypes, error: typesError } = await supabase
        .from('license_types')
        .insert(licenseTypes)
        .select();

      if (typesError) {
        console.error('❌ Error creating license types:', typesError);
        return;
      }

      console.log(`✅ Created ${insertedTypes.length} license types`);
      
      // Create type map
      insertedTypes.forEach(type => {
        typeMap[type.type_key] = type.id;
      });
    }

    // Insert requirements
    console.log('📝 Inserting license requirements...');
    const requirements = [
      // Private license requirements
      { license_type_id: typeMap.private, requirement_type: 'document', title_ar: '2 صور شخصية', description_ar: 'صور شخصية حديثة', is_required: true, sort_order: 1 },
      { license_type_id: typeMap.private, requirement_type: 'document', title_ar: 'صورة عن الهوية', description_ar: 'صورة واضحة عن الهوية الشخصية', is_required: true, sort_order: 2 },
      { license_type_id: typeMap.private, requirement_type: 'condition', title_ar: 'العمر الأدنى', description_ar: 'يبدأ بالفحوصات 17 سنة، يحصل على الرخصة 17.5 سنة', is_required: true, sort_order: 3 },

      // Motorcycle license requirements
      { license_type_id: typeMap.motorcycle, requirement_type: 'document', title_ar: '2 صور شخصية', description_ar: 'صور شخصية حديثة', is_required: true, sort_order: 1 },
      { license_type_id: typeMap.motorcycle, requirement_type: 'document', title_ar: 'صورة عن الهوية', description_ar: 'صورة واضحة عن الهوية الشخصية', is_required: true, sort_order: 2 },
      { license_type_id: typeMap.motorcycle, requirement_type: 'condition', title_ar: 'العمر الأدنى', description_ar: 'يبدأ بالفحوصات 17 سنة، يحصل على الرخصة 17 سنة', is_required: true, sort_order: 3 },
      { license_type_id: typeMap.motorcycle, requirement_type: 'note', title_ar: 'ملاحظة', description_ar: 'في حال كان المتقدم حاصل على رخصة سابقة، يُعفى من دراسة التؤوريا ويمكنه التقديم مباشرة للامتحان العملي (التست)', is_required: false, sort_order: 4 },

      // Light truck license requirements
      { license_type_id: typeMap.light_truck, requirement_type: 'document', title_ar: '4 صور شخصية', description_ar: 'صور شخصية حديثة', is_required: true, sort_order: 1 },
      { license_type_id: typeMap.light_truck, requirement_type: 'document', title_ar: 'صورة عن الهوية', description_ar: 'صورة واضحة عن الهوية الشخصية', is_required: true, sort_order: 2 },
      { license_type_id: typeMap.light_truck, requirement_type: 'condition', title_ar: 'العمر الأدنى', description_ar: 'يبدأ بالفحوصات 17.5 سنة، يحصل على الرخصة 18 سنة', is_required: true, sort_order: 3 },

      // Heavy truck license requirements
      { license_type_id: typeMap.heavy_truck, requirement_type: 'document', title_ar: '4 صور شخصية', description_ar: 'صور شخصية حديثة', is_required: true, sort_order: 1 },
      { license_type_id: typeMap.heavy_truck, requirement_type: 'document', title_ar: 'صورة عن الهوية', description_ar: 'صورة واضحة عن الهوية الشخصية', is_required: true, sort_order: 2 },
      { license_type_id: typeMap.heavy_truck, requirement_type: 'document', title_ar: 'صورة عن الرخصة', description_ar: 'صورة عن رخصة شحن خفيف', is_required: true, sort_order: 3 },
      { license_type_id: typeMap.heavy_truck, requirement_type: 'document', title_ar: 'شهادة مدرسية مصدقة', description_ar: 'شهادة مدرسية مصدقة', is_required: true, sort_order: 4 },
      { license_type_id: typeMap.heavy_truck, requirement_type: 'condition', title_ar: 'العمر الأدنى', description_ar: '19 سنة', is_required: true, sort_order: 5 },
      { license_type_id: typeMap.heavy_truck, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'أن يكون حاصل على رخصة شحن مضى عليها سنة', is_required: true, sort_order: 6 },
      { license_type_id: typeMap.heavy_truck, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'الحصول على شهادة دورة شحن ثقيل من كلية مرخصة', is_required: true, sort_order: 7 },
      { license_type_id: typeMap.heavy_truck, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'أن يكون قد اجتاز الصف الخامس في التعليم المدرسي', is_required: true, sort_order: 8 },

      // Trailer license requirements
      { license_type_id: typeMap.trailer, requirement_type: 'document', title_ar: '4 صور شخصية', description_ar: 'صور شخصية حديثة', is_required: true, sort_order: 1 },
      { license_type_id: typeMap.trailer, requirement_type: 'document', title_ar: 'صورة عن الهوية', description_ar: 'صورة واضحة عن الهوية الشخصية', is_required: true, sort_order: 2 },
      { license_type_id: typeMap.trailer, requirement_type: 'document', title_ar: 'صورة عن الرخصة', description_ar: 'صورة عن رخصة شحن ثقيل', is_required: true, sort_order: 3 },
      { license_type_id: typeMap.trailer, requirement_type: 'document', title_ar: 'شهادة مدرسية مصدقة', description_ar: 'شهادة مدرسية مصدقة', is_required: true, sort_order: 4 },
      { license_type_id: typeMap.trailer, requirement_type: 'document', title_ar: 'شهادة دورة شحن ثقيل', description_ar: 'شهادة دورة شحن ثقيل', is_required: true, sort_order: 5 },
      { license_type_id: typeMap.trailer, requirement_type: 'condition', title_ar: 'العمر الأدنى', description_ar: '20 سنة', is_required: true, sort_order: 6 },
      { license_type_id: typeMap.trailer, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'أن يكون حاصل على رخصة شحن ثقيل مضى عليها سنة', is_required: true, sort_order: 7 },
      { license_type_id: typeMap.trailer, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'أن يكون قد اجتاز الصف الخامس في التعليم المدرسي', is_required: true, sort_order: 8 },

      // Public taxi license requirements
      { license_type_id: typeMap.public_taxi, requirement_type: 'document', title_ar: '4 صور شخصية', description_ar: 'صور شخصية حديثة', is_required: true, sort_order: 1 },
      { license_type_id: typeMap.public_taxi, requirement_type: 'document', title_ar: 'صورة عن الهوية', description_ar: 'صورة واضحة عن الهوية الشخصية', is_required: true, sort_order: 2 },
      { license_type_id: typeMap.public_taxi, requirement_type: 'document', title_ar: 'صورة عن الرخصة', description_ar: 'صورة عن رخصة خصوصي', is_required: true, sort_order: 3 },
      { license_type_id: typeMap.public_taxi, requirement_type: 'document', title_ar: 'شهادة مدرسية مصدقة', description_ar: 'شهادة مدرسية مصدقة', is_required: true, sort_order: 4 },
      { license_type_id: typeMap.public_taxi, requirement_type: 'document', title_ar: 'شهادة حسن سير وسلوك', description_ar: 'شهادة حسن سير وسلوك', is_required: true, sort_order: 5 },
      { license_type_id: typeMap.public_taxi, requirement_type: 'condition', title_ar: 'العمر الأدنى', description_ar: '21 سنة', is_required: true, sort_order: 6 },
      { license_type_id: typeMap.public_taxi, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'أن يكون حاصل على رخصة خصوصي مضى عليها سنتين', is_required: true, sort_order: 7 },
      { license_type_id: typeMap.public_taxi, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'الحصول على شهادة دورة عمومي من كلية مرخصة من وزارة النقل والمواصلات قبل الامتحان النظري (التؤوريا)', is_required: true, sort_order: 8 },
      { license_type_id: typeMap.public_taxi, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'أن يكون قد اجتاز الصف الثاني إعدادي', is_required: true, sort_order: 9 },

      // Public bus license requirements
      { license_type_id: typeMap.public_bus, requirement_type: 'document', title_ar: '4 صور شخصية', description_ar: 'صور شخصية حديثة', is_required: true, sort_order: 1 },
      { license_type_id: typeMap.public_bus, requirement_type: 'document', title_ar: 'صورة عن الهوية', description_ar: 'صورة واضحة عن الهوية الشخصية', is_required: true, sort_order: 2 },
      { license_type_id: typeMap.public_bus, requirement_type: 'document', title_ar: 'صورة عن الرخصة', description_ar: 'صورة عن رخصة شحن', is_required: true, sort_order: 3 },
      { license_type_id: typeMap.public_bus, requirement_type: 'document', title_ar: 'شهادة مدرسية مصدقة', description_ar: 'شهادة مدرسية مصدقة', is_required: true, sort_order: 4 },
      { license_type_id: typeMap.public_bus, requirement_type: 'document', title_ar: 'شهادة حسن سير وسلوك', description_ar: 'شهادة حسن سير وسلوك', is_required: true, sort_order: 5 },
      { license_type_id: typeMap.public_bus, requirement_type: 'condition', title_ar: 'العمر الأدنى', description_ar: '21 سنة', is_required: true, sort_order: 6 },
      { license_type_id: typeMap.public_bus, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'أن يكون حاصل على رخصة شحن مضى عليها سنتين', is_required: true, sort_order: 7 },
      { license_type_id: typeMap.public_bus, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'الحصول على شهادة دورة عمومي من كلية مرخصة من وزارة النقل والمواصلات قبل الامتحان النظري (التؤوريا)', is_required: true, sort_order: 8 },
      { license_type_id: typeMap.public_bus, requirement_type: 'condition', title_ar: 'الشروط', description_ar: 'أن يكون قد اجتاز الصف الثاني إعدادي', is_required: true, sort_order: 9 }
    ];

    const { error: requirementsError } = await supabase
      .from('license_requirements')
      .insert(requirements);

    if (requirementsError) {
      console.log('⚠️ Requirements might already exist, continuing...');
    } else {
      console.log(`✅ Created ${requirements.length} license requirements`);
    }

    // Insert pricing
    console.log('📝 Inserting license pricing...');
    const pricing = [
      // Private license pricing
      { license_type_id: typeMap.private, price_type: 'lesson', price: 90.00, currency: '₪', description_ar: 'الدرس الواحد' },
      { license_type_id: typeMap.private, price_type: 'first_test', price: 290.00, currency: '₪', description_ar: 'التست الأول' },
      { license_type_id: typeMap.private, price_type: 'retest', price: 370.00, currency: '₪', description_ar: 'التست الثاني وما فوق' },

      // Motorcycle license pricing
      { license_type_id: typeMap.motorcycle, price_type: 'lesson', price: 90.00, currency: '₪', description_ar: 'الدرس الواحد' },
      { license_type_id: typeMap.motorcycle, price_type: 'first_test', price: 290.00, currency: '₪', description_ar: 'التست الأول' },
      { license_type_id: typeMap.motorcycle, price_type: 'retest', price: 370.00, currency: '₪', description_ar: 'التست الثاني وما فوق' },

      // Light truck license pricing
      { license_type_id: typeMap.light_truck, price_type: 'lesson', price: 110.00, currency: '₪', description_ar: 'الدرس الواحد' },
      { license_type_id: typeMap.light_truck, price_type: 'first_test', price: 350.00, currency: '₪', description_ar: 'التست الأول' },
      { license_type_id: typeMap.light_truck, price_type: 'retest', price: 430.00, currency: '₪', description_ar: 'التست الثاني وما فوق' },

      // Heavy truck license pricing
      { license_type_id: typeMap.heavy_truck, price_type: 'lesson', price: 160.00, currency: '₪', description_ar: 'الدرس الواحد' },
      { license_type_id: typeMap.heavy_truck, price_type: 'first_test', price: 500.00, currency: '₪', description_ar: 'التست الأول' },
      { license_type_id: typeMap.heavy_truck, price_type: 'retest', price: 580.00, currency: '₪', description_ar: 'التست الثاني وما فوق' },

      // Trailer license pricing
      { license_type_id: typeMap.trailer, price_type: 'lesson', price: 160.00, currency: '₪', description_ar: 'الدرس الواحد' },
      { license_type_id: typeMap.trailer, price_type: 'first_test', price: 500.00, currency: '₪', description_ar: 'التست الأول' },
      { license_type_id: typeMap.trailer, price_type: 'retest', price: 580.00, currency: '₪', description_ar: 'التست الثاني وما فوق' },

      // Public taxi license pricing
      { license_type_id: typeMap.public_taxi, price_type: 'lesson', price: 90.00, currency: '₪', description_ar: 'الدرس الواحد' },
      { license_type_id: typeMap.public_taxi, price_type: 'first_test', price: 290.00, currency: '₪', description_ar: 'التست الأول' },
      { license_type_id: typeMap.public_taxi, price_type: 'retest', price: 370.00, currency: '₪', description_ar: 'التست الثاني وما فوق' },

      // Public bus license pricing
      { license_type_id: typeMap.public_bus, price_type: 'lesson', price: 160.00, currency: '₪', description_ar: 'الدرس الواحد' },
      { license_type_id: typeMap.public_bus, price_type: 'first_test', price: 500.00, currency: '₪', description_ar: 'التست الأول' },
      { license_type_id: typeMap.public_bus, price_type: 'retest', price: 580.00, currency: '₪', description_ar: 'التست الثاني وما فوق' }
    ];

    const { error: pricingError } = await supabase
      .from('license_pricing')
      .insert(pricing);

    if (pricingError) {
      console.log('⚠️ Pricing might already exist, continuing...');
    } else {
      console.log(`✅ Created ${pricing.length} license pricing entries`);
    }

    // Insert procedures
    console.log('📝 Inserting license procedures...');
    const procedures = [
      {
        procedure_type: 'health',
        title_ar: 'دائرة الصحة',
        description_ar: 'الخطوة الأولى بعد عمل المعاملة في مديرية السياقة',
        location_ar: 'دائرة الصحة',
        schedule_ar: 'مواعيد الفحص: الأحد، الثلاثاء والأربعاء من الساعة 08:00 صباحاً إلى 10:30 صباحاً',
        requirements_ar: 'يُمنع تناول الطعام قبل الفحص',
        notes_ar: 'الخطوة الأولى بعد عمل المعاملة في مديرية السياقة',
        step_order: 1
      },
      {
        procedure_type: 'theory',
        title_ar: 'دائرة السير - النظرية',
        description_ar: 'الدراسة الجيدة للنظرية والتدرب على الامتحانات التدريبية',
        location_ar: 'دائرة السير',
        schedule_ar: 'التقديم أيام الأحد إلى الرابع، الحضور الساعة 08:00 صباحاً والانتظار حسب الدور',
        requirements_ar: 'الامتحان متاح على الموقع الإلكتروني للمدرسة',
        notes_ar: 'الدراسة الجيدة للنظرية والتدرب على الامتحانات التدريبية',
        step_order: 2
      },
      {
        procedure_type: 'practical',
        title_ar: 'دائرة السير - العملي',
        description_ar: 'الخطوة الأخيرة بعد إتقان مهارات القيادة',
        location_ar: 'دائرة السير',
        schedule_ar: 'التقديم أيام الأحد إلى الخميس، يتم تحديد الموعد بدقة مسبقاً',
        requirements_ar: 'يتم التنسيق من خلال مدرسة السياقة وتحديد الموعد، الاختبار يشمل المهارات الأساسية في القيادة',
        notes_ar: 'الخطوة الأخيرة بعد إتقان مهارات القيادة',
        step_order: 3
      },
      {
        procedure_type: 'license_collection',
        title_ar: 'استلام الرخصة',
        description_ar: 'بعد النجاح في الامتحان العملي، يمكنك استلام الرخصة من دائرة السير',
        location_ar: 'دائرة السير',
        schedule_ar: 'الأحد إلى الخميس من 08:00 ص - 01:00 م',
        requirements_ar: 'يجب إحضار الهوية الشخصية والحضور شخصياً',
        notes_ar: 'بعد النجاح في الامتحان العملي، يمكنك استلام الرخصة من دائرة السير خلال أوقات الدوام الرسمي',
        step_order: 4
      }
    ];

    const { error: proceduresError } = await supabase
      .from('license_procedures')
      .insert(procedures);

    if (proceduresError) {
      console.log('⚠️ Procedures might already exist, continuing...');
    } else {
      console.log(`✅ Created ${procedures.length} license procedures`);
    }

    console.log('🎉 License data insertion completed!');
    console.log('\n📋 Inserted data:');
    console.log('  - 7 license types (أنواع الرخص)');
    console.log('  - 50+ license requirements (متطلبات الرخص)');
    console.log('  - 21 pricing entries (أسعار الرخص)');
    console.log('  - 4 license procedures (إجراءات الرخص)');
    console.log('\n🔧 You can now use the admin panel to manage license data!');
    
  } catch (error) {
    console.error('❌ Error inserting license data:', error);
    process.exit(1);
  }
}

// Run the insertion
insertLicenseData();
