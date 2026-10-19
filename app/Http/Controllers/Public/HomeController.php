<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\HomepageContentService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected HomepageContentService $homepageService
    ) {}

    /**
     * Display the public homepage.
     */
    public function index(): Response
    {
        $banners = $this->homepageService->getActiveBanners();
        $sections = $this->homepageService->getHomepageSections();
        $settings = $this->homepageService->getHomepageSettings();
        $eventCategories = $this->homepageService->getEventCategories();
        $featuredSuppliers = $this->homepageService->getFeaturedSuppliers();
        $topPackages = $this->homepageService->getTopPackages();
        $services = $this->homepageService->getServices();
        $galleryItems = $this->homepageService->getGalleryItems();
        $highlights = $this->homepageService->getHighlights($sections);

        return Inertia::render('Welcome', [
            'banners' => $banners,
            'sections' => $sections,
            'settings' => $settings,
            'eventCategories' => $eventCategories,
            'featuredSuppliers' => $featuredSuppliers,
            'topPackages' => $topPackages,
            'services' => $services,
            'galleryItems' => $galleryItems,
            'highlights' => $highlights,
        ]);
    }
}
