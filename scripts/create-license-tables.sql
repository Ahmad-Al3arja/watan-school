-- Create tables for driving license management

-- License types table
CREATE TABLE IF NOT EXISTS license_types (
  id SERIAL PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  type_key VARCHAR(50) UNIQUE NOT NULL,
  min_age_exam INTEGER NOT NULL,
  min_age_license INTEGER NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License requirements table
CREATE TABLE IF NOT EXISTS license_requirements (
  id SERIAL PRIMARY KEY,
  license_type_id INTEGER REFERENCES license_types(id) ON DELETE CASCADE,
  requirement_type VARCHAR(50) NOT NULL, -- 'document', 'condition', 'note'
  title_ar VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description_ar TEXT,
  description_en TEXT,
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License pricing table
CREATE TABLE IF NOT EXISTS license_pricing (
  id SERIAL PRIMARY KEY,
  license_type_id INTEGER REFERENCES license_types(id) ON DELETE CASCADE,
  price_type VARCHAR(50) NOT NULL, -- 'lesson', 'first_test', 'retest'
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT '₪',
  description_ar VARCHAR(200),
  description_en VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License procedures table
CREATE TABLE IF NOT EXISTS license_procedures (
  id SERIAL PRIMARY KEY,
  procedure_type VARCHAR(50) NOT NULL, -- 'health', 'theory', 'practical', 'license_collection'
  title_ar VARCHAR(200) NOT NULL,
  title_en VARCHAR(200),
  description_ar TEXT,
  description_en TEXT,
  location_ar VARCHAR(200),
  location_en VARCHAR(200),
  schedule_ar TEXT,
  schedule_en TEXT,
  requirements_ar TEXT,
  requirements_en TEXT,
  notes_ar TEXT,
  notes_en TEXT,
  step_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default license types
INSERT INTO license_types (name_ar, name_en, type_key, min_age_exam, min_age_license, description_ar, description_en) VALUES
('خصوصي', 'Private', 'private', 17, 17, 'رخصة قيادة للاستخدام الشخصي', 'Private driving license for personal use'),
('دراجة نارية', 'Motorcycle', 'motorcycle', 17, 17, 'رخصة قيادة دراجة نارية', 'Motorcycle driving license'),
('شحن خفيف', 'Light Truck', 'light_truck', 17, 18, 'رخصة قيادة شاحنة خفيفة', 'Light truck driving license'),
('شحن ثقيل', 'Heavy Truck', 'heavy_truck', 19, 19, 'رخصة قيادة شاحنة ثقيلة', 'Heavy truck driving license'),
('تريلا', 'Trailer', 'trailer', 20, 20, 'رخصة قيادة تريلا', 'Trailer driving license'),
('تاكسي عمومي', 'Public Taxi', 'public_taxi', 21, 21, 'رخصة قيادة تاكسي عمومي', 'Public taxi driving license'),
('باص عمومي', 'Public Bus', 'public_bus', 21, 21, 'رخصة قيادة باص عمومي', 'Public bus driving license');

-- Insert default requirements for each license type
INSERT INTO license_requirements (license_type_id, requirement_type, title_ar, description_ar, is_required, sort_order) VALUES
-- Private license requirements
(1, 'document', '2 صور شخصية', 'صور شخصية حديثة', true, 1),
(1, 'document', 'صورة عن الهوية', 'صورة واضحة عن الهوية الشخصية', true, 2),
(1, 'condition', 'العمر الأدنى', 'يبدأ بالفحوصات 17 سنة، يحصل على الرخصة 17.5 سنة', true, 3),

-- Motorcycle license requirements
(2, 'document', '2 صور شخصية', 'صور شخصية حديثة', true, 1),
(2, 'document', 'صورة عن الهوية', 'صورة واضحة عن الهوية الشخصية', true, 2),
(2, 'condition', 'العمر الأدنى', 'يبدأ بالفحوصات 17 سنة، يحصل على الرخصة 17 سنة', true, 3),
(2, 'note', 'ملاحظة', 'في حال كان المتقدم حاصل على رخصة سابقة، يُعفى من دراسة التؤوريا ويمكنه التقديم مباشرة للامتحان العملي (التست)', false, 4),

-- Light truck license requirements
(3, 'document', '4 صور شخصية', 'صور شخصية حديثة', true, 1),
(3, 'document', 'صورة عن الهوية', 'صورة واضحة عن الهوية الشخصية', true, 2),
(3, 'condition', 'العمر الأدنى', 'يبدأ بالفحوصات 17.5 سنة، يحصل على الرخصة 18 سنة', true, 3),

-- Heavy truck license requirements
(4, 'document', '4 صور شخصية', 'صور شخصية حديثة', true, 1),
(4, 'document', 'صورة عن الهوية', 'صورة واضحة عن الهوية الشخصية', true, 2),
(4, 'document', 'صورة عن الرخصة', 'صورة عن رخصة شحن خفيف', true, 3),
(4, 'document', 'شهادة مدرسية مصدقة', 'شهادة مدرسية مصدقة', true, 4),
(4, 'condition', 'العمر الأدنى', '19 سنة', true, 5),
(4, 'condition', 'الشروط', 'أن يكون حاصل على رخصة شحن مضى عليها سنة', true, 6),
(4, 'condition', 'الشروط', 'الحصول على شهادة دورة شحن ثقيل من كلية مرخصة', true, 7),
(4, 'condition', 'الشروط', 'أن يكون قد اجتاز الصف الخامس في التعليم المدرسي', true, 8),

-- Trailer license requirements
(5, 'document', '4 صور شخصية', 'صور شخصية حديثة', true, 1),
(5, 'document', 'صورة عن الهوية', 'صورة واضحة عن الهوية الشخصية', true, 2),
(5, 'document', 'صورة عن الرخصة', 'صورة عن رخصة شحن ثقيل', true, 3),
(5, 'document', 'شهادة مدرسية مصدقة', 'شهادة مدرسية مصدقة', true, 4),
(5, 'document', 'شهادة دورة شحن ثقيل', 'شهادة دورة شحن ثقيل', true, 5),
(5, 'condition', 'العمر الأدنى', '20 سنة', true, 6),
(5, 'condition', 'الشروط', 'أن يكون حاصل على رخصة شحن ثقيل مضى عليها سنة', true, 7),
(5, 'condition', 'الشروط', 'أن يكون قد اجتاز الصف الخامس في التعليم المدرسي', true, 8),

-- Public taxi license requirements
(6, 'document', '4 صور شخصية', 'صور شخصية حديثة', true, 1),
(6, 'document', 'صورة عن الهوية', 'صورة واضحة عن الهوية الشخصية', true, 2),
(6, 'document', 'صورة عن الرخصة', 'صورة عن رخصة خصوصي', true, 3),
(6, 'document', 'شهادة مدرسية مصدقة', 'شهادة مدرسية مصدقة', true, 4),
(6, 'document', 'شهادة حسن سير وسلوك', 'شهادة حسن سير وسلوك', true, 5),
(6, 'condition', 'العمر الأدنى', '21 سنة', true, 6),
(6, 'condition', 'الشروط', 'أن يكون حاصل على رخصة خصوصي مضى عليها سنتين', true, 7),
(6, 'condition', 'الشروط', 'الحصول على شهادة دورة عمومي من كلية مرخصة من وزارة النقل والمواصلات قبل الامتحان النظري (التؤوريا)', true, 8),
(6, 'condition', 'الشروط', 'أن يكون قد اجتاز الصف الثاني إعدادي', true, 9),

-- Public bus license requirements
(7, 'document', '4 صور شخصية', 'صور شخصية حديثة', true, 1),
(7, 'document', 'صورة عن الهوية', 'صورة واضحة عن الهوية الشخصية', true, 2),
(7, 'document', 'صورة عن الرخصة', 'صورة عن رخصة شحن', true, 3),
(7, 'document', 'شهادة مدرسية مصدقة', 'شهادة مدرسية مصدقة', true, 4),
(7, 'document', 'شهادة حسن سير وسلوك', 'شهادة حسن سير وسلوك', true, 5),
(7, 'condition', 'العمر الأدنى', '21 سنة', true, 6),
(7, 'condition', 'الشروط', 'أن يكون حاصل على رخصة شحن مضى عليها سنتين', true, 7),
(7, 'condition', 'الشروط', 'الحصول على شهادة دورة عمومي من كلية مرخصة من وزارة النقل والمواصلات قبل الامتحان النظري (التؤوريا)', true, 8),
(7, 'condition', 'الشروط', 'أن يكون قد اجتاز الصف الثاني إعدادي', true, 9);

-- Insert default pricing for each license type
INSERT INTO license_pricing (license_type_id, price_type, price, description_ar) VALUES
-- Private license pricing
(1, 'lesson', 90.00, 'الدرس الواحد'),
(1, 'first_test', 290.00, 'التست الأول'),
(1, 'retest', 370.00, 'التست الثاني وما فوق'),

-- Motorcycle license pricing
(2, 'lesson', 90.00, 'الدرس الواحد'),
(2, 'first_test', 290.00, 'التست الأول'),
(2, 'retest', 370.00, 'التست الثاني وما فوق'),

-- Light truck license pricing
(3, 'lesson', 110.00, 'الدرس الواحد'),
(3, 'first_test', 350.00, 'التست الأول'),
(3, 'retest', 430.00, 'التست الثاني وما فوق'),

-- Heavy truck license pricing
(4, 'lesson', 160.00, 'الدرس الواحد'),
(4, 'first_test', 500.00, 'التست الأول'),
(4, 'retest', 580.00, 'التست الثاني وما فوق'),

-- Trailer license pricing
(5, 'lesson', 160.00, 'الدرس الواحد'),
(5, 'first_test', 500.00, 'التست الأول'),
(5, 'retest', 580.00, 'التست الثاني وما فوق'),

-- Public taxi license pricing
(6, 'lesson', 90.00, 'الدرس الواحد'),
(6, 'first_test', 290.00, 'التست الأول'),
(6, 'retest', 370.00, 'التست الثاني وما فوق'),

-- Public bus license pricing
(7, 'lesson', 160.00, 'الدرس الواحد'),
(7, 'first_test', 500.00, 'التست الأول'),
(7, 'retest', 580.00, 'التست الثاني وما فوق');

-- Insert default procedures
INSERT INTO license_procedures (procedure_type, title_ar, description_ar, location_ar, schedule_ar, requirements_ar, notes_ar, step_order) VALUES
('health', 'دائرة الصحة', 'الخطوة الأولى بعد عمل المعاملة في مديرية السياقة', 'دائرة الصحة', 'مواعيد الفحص: الأحد، الثلاثاء والأربعاء من الساعة 08:00 صباحاً إلى 10:30 صباحاً', 'يُمنع تناول الطعام قبل الفحص', 'الخطوة الأولى بعد عمل المعاملة في مديرية السياقة', 1),

('theory', 'دائرة السير - النظرية', 'الدراسة الجيدة للنظرية والتدرب على الامتحانات التدريبية', 'دائرة السير', 'التقديم أيام الأحد إلى الرابع، الحضور الساعة 08:00 صباحاً والانتظار حسب الدور', 'الامتحان متاح على الموقع الإلكتروني للمدرسة', 'الدراسة الجيدة للنظرية والتدرب على الامتحانات التدريبية', 2),

('practical', 'دائرة السير - العملي', 'الخطوة الأخيرة بعد إتقان مهارات القيادة', 'دائرة السير', 'التقديم أيام الأحد إلى الخميس، يتم تحديد الموعد بدقة مسبقاً', 'يتم التنسيق من خلال مدرسة السياقة وتحديد الموعد، الاختبار يشمل المهارات الأساسية في القيادة', 'الخطوة الأخيرة بعد إتقان مهارات القيادة', 3),

('license_collection', 'استلام الرخصة', 'بعد النجاح في الامتحان العملي، يمكنك استلام الرخصة من دائرة السير', 'دائرة السير', 'الأحد إلى الخميس من 08:00 ص - 01:00 م', 'يجب إحضار الهوية الشخصية والحضور شخصياً', 'بعد النجاح في الامتحان العملي، يمكنك استلام الرخصة من دائرة السير خلال أوقات الدوام الرسمي', 4);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_license_requirements_type_id ON license_requirements(license_type_id);
CREATE INDEX IF NOT EXISTS idx_license_pricing_type_id ON license_pricing(license_type_id);
CREATE INDEX IF NOT EXISTS idx_license_procedures_type ON license_procedures(procedure_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_license_types_updated_at BEFORE UPDATE ON license_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_license_requirements_updated_at BEFORE UPDATE ON license_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_license_pricing_updated_at BEFORE UPDATE ON license_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_license_procedures_updated_at BEFORE UPDATE ON license_procedures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
