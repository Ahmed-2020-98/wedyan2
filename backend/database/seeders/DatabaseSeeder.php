<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'مدير النظام',
            'email' => 'admin@wedyan.store',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'عميل تجريبي',
            'email' => 'customer@wedyan.store',
            'role' => 'customer',
        ]);

        $categories = [
            ['name_ar' => 'إلكترونيات', 'slug' => 'electronics', 'image' => null],
            ['name_ar' => 'ملابس وأزياء', 'slug' => 'fashion', 'image' => null],
            ['name_ar' => 'العناية الشخصية', 'slug' => 'beauty', 'image' => null],
            ['name_ar' => 'المنزل والمطبخ', 'slug' => 'home-kitchen', 'image' => null],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category + ['is_active' => true]
            );
        }

        $brands = [
            ['name_ar' => 'تكنو', 'slug' => 'techno'],
            ['name_ar' => 'أوريكس', 'slug' => 'oryx'],
            ['name_ar' => 'لؤلؤة', 'slug' => 'loloa'],
            ['name_ar' => 'نسمة', 'slug' => 'nasma'],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(
                ['slug' => $brand['slug']],
                $brand + ['is_active' => true]
            );
        }

        $products = [
            // إلكترونيات
            ['category' => 'electronics', 'brand' => 'techno', 'name' => 'سماعات لاسلكية بخاصية إلغاء الضوضاء', 'price' => 349.00, 'discount' => 279.00, 'stock' => 40, 'desc' => 'سماعات بلوتوث 5.3 مع صوت نقي وعمر بطارية يصل إلى 30 ساعة، مثالية للعمل والسفر.'],
            ['category' => 'electronics', 'brand' => 'techno', 'name' => 'ساعة ذكية بشاشة أموليد', 'price' => 899.00, 'discount' => 749.00, 'stock' => 25, 'desc' => 'ساعة ذكية تتابع نبضات القلب والنوم مع أكثر من 100 نمط رياضي ومقاومة للماء.'],
            ['category' => 'electronics', 'brand' => 'oryx', 'name' => 'شاحن سريع 65 واط متعدد المنافذ', 'price' => 159.00, 'discount' => null, 'stock' => 80, 'desc' => 'شاحن جداري بثلاثة منافذ يدعم الشحن السريع للأجهزة المحمولة والحاسبات المحمولة.'],
            ['category' => 'electronics', 'brand' => 'oryx', 'name' => 'لوحة مفاتيح ميكانيكية عربية مضيئة', 'price' => 285.00, 'discount' => 229.00, 'stock' => 35, 'desc' => 'لوحة مفاتيح ميكانيكية بمفاتيح زرقاء وإضاءة خلفية RGB ودعم كامل للحروف العربية.'],
            ['category' => 'electronics', 'brand' => 'techno', 'name' => 'مكبر صوت محمول مقاوم للماء', 'price' => 219.00, 'discount' => null, 'stock' => 50, 'desc' => 'مكبر صوت بلوتوث بقوة 20 واط ومقاومة للماء IPX7، مثالي للرحلات والتخييم.'],
            ['category' => 'electronics', 'brand' => 'oryx', 'name' => 'كاميرا ويب بدقة 4K', 'price' => 459.00, 'discount' => 399.00, 'stock' => 18, 'desc' => 'كاميرا ويب احترافية بدقة 4K وتصحيح تلقائي للإضاءة مع ميكروفونين مدمجين.'],

            // ملابس وأزياء
            ['category' => 'fashion', 'brand' => 'loloa', 'name' => 'عباية كلاسيكية بقماش الكريب', 'price' => 420.00, 'discount' => null, 'stock' => 30, 'desc' => 'عباية أنيقة من قماش الكريب الفاخر بتصميم كلاسيكي يناسب جميع المناسبات.'],
            ['category' => 'fashion', 'brand' => 'loloa', 'name' => 'قميص قطني رجالي بأكمام طويلة', 'price' => 145.00, 'discount' => 109.00, 'stock' => 60, 'desc' => 'قميص من القطن المصري الطبيعي بخياطة متينة وقصة عصرية مريحة.'],
            ['category' => 'fashion', 'brand' => 'nasma', 'name' => 'حجاب شيفون فاخر - مجموعة 3 قطع', 'price' => 120.00, 'discount' => 95.00, 'stock' => 100, 'desc' => 'مجموعة من ثلاثة حجابات شيفون بألوان متنوعة وخامة لا تنزلق.'],
            ['category' => 'fashion', 'brand' => 'nasma', 'name' => 'حقيبة يد جلد طبيعي', 'price' => 380.00, 'discount' => 299.00, 'stock' => 20, 'desc' => 'حقيبة يد نسائية من الجلد الطبيعي بحزام كتف قابل للفصل وجيوب داخلية متعددة.'],
            ['category' => 'fashion', 'brand' => 'loloa', 'name' => 'حزام جلد رجالي كلاسيكي', 'price' => 99.00, 'discount' => null, 'stock' => 70, 'desc' => 'حزام من الجلد الطبيعي بإبزيم ستانلس ستيل مقاوم للصدأ.'],

            // العناية الشخصية
            ['category' => 'beauty', 'brand' => 'nasma', 'name' => 'عطر شرقي فاخر 100 مل', 'price' => 320.00, 'discount' => 255.00, 'stock' => 45, 'desc' => 'عطر شرقي بمزيج من العود والعنبر والمسك، ثبات يصل إلى 12 ساعة.'],
            ['category' => 'beauty', 'brand' => 'nasma', 'name' => 'سيروم فيتامين سي المركّز', 'price' => 180.00, 'discount' => null, 'stock' => 55, 'desc' => 'سيروم بتركيز 20% من فيتامين سي لتوحيد لون البشرة وتقليل البقع الداكنة.'],
            ['category' => 'beauty', 'brand' => 'loloa', 'name' => 'مجموعة العناية بالشعر - شامبو وبلسم', 'price' => 165.00, 'discount' => 132.00, 'stock' => 65, 'desc' => 'مجموعة غنية بالكيراتين وزيت الأرجان لتقوية الشعر ولمعانه الطبيعي.'],
            ['category' => 'beauty', 'brand' => 'nasma', 'name' => 'كريم مرطب بزبدة الشيا', 'price' => 89.00, 'discount' => null, 'stock' => 90, 'desc' => 'كريم مرطب غني بزبدة الشيا العضوية لبشرة ناعمة ورطبة طوال اليوم.'],

            // المنزل والمطبخ
            ['category' => 'home-kitchen', 'brand' => 'techno', 'name' => 'غلاية كهربائية سريعة 1.7 لتر', 'price' => 175.00, 'discount' => 139.00, 'stock' => 48, 'desc' => 'غلاية ستانلس ستيل بسعة 1.7 لتر وإيقاف تلقائي عند الغليان.'],
            ['category' => 'home-kitchen', 'brand' => 'oryx', 'name' => 'طقم أواني طهي مضاد للالتصاق - 7 قطع', 'price' => 690.00, 'discount' => 549.00, 'stock' => 15, 'desc' => 'طقم أواني بطبقة جرانيت مضادة للالتصاق ومناسب لجميع أنواع المواقد.'],
            ['category' => 'home-kitchen', 'brand' => 'nasma', 'name' => 'مكنسة كهربائية عمودية لاسلكية', 'price' => 850.00, 'discount' => 699.00, 'stock' => 12, 'desc' => 'مكنسة لاسلكية بقوة شفط 25 كيلو باسكال وعمر بطارية 45 دقيقة.'],
            ['category' => 'home-kitchen', 'brand' => 'oryx', 'name' => 'طقم أكواب زجاجي مزخرف - 6 قطع', 'price' => 85.00, 'discount' => null, 'stock' => 110, 'desc' => 'أكواب زجاجية بتصميم عربي مزخرف، مقاومة للحرارة وآمنة في غسالة الأطباق.'],
            ['category' => 'home-kitchen', 'brand' => 'techno', 'name' => 'خلاط كهربائي متعدد الوظائف 1200 واط', 'price' => 395.00, 'discount' => 315.00, 'stock' => 28, 'desc' => 'خلاط قوي بشفرات ستانلس ستيل ستية مع إبريق زجاجي 1.5 لتر وطاحونة قهوة.'],
        ];

        foreach ($products as $item) {
            $slug = trim(preg_replace('/[^\p{Arabic}a-z0-9]+/u', '-', strtolower($item['name'])), '-') . '-' . Str::lower(Str::random(4));

            Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => Category::where('slug', $item['category'])->value('id'),
                    'brand_id' => Brand::where('slug', $item['brand'])->value('id'),
                    'name_ar' => $item['name'],
                    'description_ar' => $item['desc'],
                    'price' => $item['price'],
                    'discount_price' => $item['discount'],
                    'stock' => $item['stock'],
                    'sku' => strtoupper(Str::random(8)),
                    'is_active' => true,
                ]
            );
        }

        Coupon::updateOrCreate(['code' => 'WELCOME10'], [
            'type' => 'percent',
            'value' => 10,
            'min_total' => 200,
            'is_active' => true,
        ]);

        Coupon::updateOrCreate(['code' => 'SAVE50'], [
            'type' => 'fixed',
            'value' => 50,
            'min_total' => 300,
            'usage_limit' => 100,
            'is_active' => true,
        ]);
    }
}
