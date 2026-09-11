<?php

namespace Database\Seeders;

use App\Models\HomepageBanner;
use App\Models\HomepageSection;
use App\Models\HomepageSetting;
use Illuminate\Database\Seeder;

class HomepageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear existing homepage records
        HomepageBanner::truncate();
        HomepageSection::truncate();
        HomepageSetting::truncate();

        // 2. Seed 6 Banners (matching the 6-photo banner slider requirement)
        $banners = [
            [
                'badge' => 'Your Perfect Event Starts Here',
                'title' => 'Find the Best Suppliers for Your Special Moments',
                'subtitle' => 'Connect with trusted suppliers, explore amazing packages, and make your dream event a reality.',
                'image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80',
                'button_text' => 'Explore Suppliers',
                'button_url' => '/suppliers',
                'secondary_button_text' => 'View Packages',
                'secondary_button_url' => '/packages',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'badge' => 'Unforgettable Celebrations',
                'title' => 'Curated Wedding & Gala Experiences',
                'subtitle' => 'From intimate vows to grand ballroom receptions, discover professionals who craft memories that last a lifetime.',
                'image_url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=80',
                'button_text' => 'Explore Suppliers',
                'button_url' => '/suppliers',
                'secondary_button_text' => 'View Packages',
                'secondary_button_url' => '/packages',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'badge' => 'Masterful Culinary & Catering',
                'title' => 'Exquisite Menus Designed for Every Occasion',
                'subtitle' => 'Treat your guests to culinary masterpieces curated by top-rated caterers and banquet specialists.',
                'image_url' => 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=2000&q=80',
                'button_text' => 'Browse Catering',
                'button_url' => '/suppliers?category=Catering',
                'secondary_button_text' => 'View Packages',
                'secondary_button_url' => '/packages',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'badge' => 'Artistic Floral & Decor Styling',
                'title' => 'Transforming Venues into Breathtaking Worlds',
                'subtitle' => 'Award-winning event stylists and floral designers ready to bring your Pinterest dream board to life.',
                'image_url' => 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2000&q=80',
                'button_text' => 'View Decorators',
                'button_url' => '/suppliers?category=Decoration',
                'secondary_button_text' => 'Explore Gallery',
                'secondary_button_url' => '/gallery',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'badge' => 'Timeless Photography & Cinematography',
                'title' => 'Capture Every Heartbeat and Golden Glow',
                'subtitle' => 'Elite visual storytellers capturing genuine smiles, heartfelt tears, and unforgettable celebrations.',
                'image_url' => 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=2000&q=80',
                'button_text' => 'Find Photographers',
                'button_url' => '/suppliers?category=Photography',
                'secondary_button_text' => 'Browse Gallery',
                'secondary_button_url' => '/gallery',
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'badge' => 'Flawless Coordination & Planning',
                'title' => 'Relax and Enjoy, Leave Every Detail to the Pros',
                'subtitle' => 'Experienced coordinators handling timeline, suppliers, logistics, and guest hospitality seamlessly.',
                'image_url' => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2000&q=80',
                'button_text' => 'Explore Coordinators',
                'button_url' => '/suppliers',
                'secondary_button_text' => 'View Packages',
                'secondary_button_url' => '/packages',
                'sort_order' => 6,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $bannerData) {
            HomepageBanner::create($bannerData);
        }

        // 3. Seed Homepage Sections
        $sections = [
            [
                'section_key' => 'hero_slider',
                'title' => 'Main Hero Banner Slider',
                'subtitle' => '6-photo rotating banner slider with quick call to actions',
                'is_active' => true,
                'sort_order' => 1,
                'content' => [],
            ],
            [
                'section_key' => 'feature_highlights',
                'title' => 'Platform Highlights Bar',
                'subtitle' => 'Key value propositions displayed directly below the banner',
                'is_active' => true,
                'sort_order' => 2,
                'content' => [
                    [
                        'icon' => 'shield-check',
                        'title' => 'Trusted Suppliers',
                        'subtitle' => 'Verified & Professional',
                    ],
                    [
                        'icon' => 'sparkles',
                        'title' => 'Quality Services',
                        'subtitle' => 'Premium Experience',
                    ],
                    [
                        'icon' => 'calendar-check',
                        'title' => 'Easy Booking',
                        'subtitle' => 'Simple & Secure',
                    ],
                    [
                        'icon' => 'gift',
                        'title' => 'Best Packages',
                        'subtitle' => 'For Every Occasion',
                    ],
                ],
            ],
            [
                'section_key' => 'featured_suppliers',
                'title' => 'Featured Suppliers',
                'subtitle' => 'Top-rated suppliers based on customer reviews and bookings.',
                'is_active' => true,
                'sort_order' => 3,
                'content' => [
                    'view_all_text' => 'View All',
                    'view_all_url' => '/suppliers',
                ],
            ],
            [
                'section_key' => 'promo_banner',
                'title' => 'Make Your Event More Special',
                'subtitle' => 'From weddings to birthdays, debuts, corporate events, and intimate milestones, our verified partners bring the expertise and passion to make every detail unforgettable.',
                'is_active' => true,
                'sort_order' => 4,
                'content' => [
                    'button_text' => 'Browse Packages',
                    'button_url' => '/packages',
                    'image_url' => 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=2000&q=80',
                ],
            ],
        ];

        foreach ($sections as $sectionData) {
            HomepageSection::create($sectionData);
        }

        // 4. Seed Homepage Settings (Buttons & copy)
        HomepageSetting::set('site_title', 'Event & Wedding Supplier Management');
        HomepageSetting::set('site_tagline', 'Your Special Moments, Our Priority');
        HomepageSetting::set('hero_autoplay_interval', '5000');
        HomepageSetting::set('promo_button_text', 'Browse Packages');
        HomepageSetting::set('promo_button_url', '/packages');
        HomepageSetting::set('promo_heading', 'Make Your Event More Special');
        HomepageSetting::set('promo_description', 'From weddings to birthdays, debuts, corporate events, and intimate milestones, our verified partners bring the expertise and passion to make every detail unforgettable.');
        HomepageSetting::set('promo_background_image', 'https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=2000&q=80');
    }
}
