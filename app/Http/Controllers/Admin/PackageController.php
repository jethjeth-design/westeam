<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $query = Package::with([
            'supplier:id,name',
            'eventCategory:id,name',
            'team:id,name',
        ]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn ($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        if ($type = $request->input('type')) {
            if ($type === 'team') {
                $query->whereNotNull('team_id');
            } elseif ($type === 'solo') {
                $query->whereNull('team_id');
            }
        }

        $packages = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
            'filters' => $request->only(['search', 'type']),
        ]);
    }
}
