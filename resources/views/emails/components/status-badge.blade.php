@php
    $statusNormalized = strtolower($status ?? 'pending');
    
    $badgeStyles = match($statusNormalized) {
        'accepted', 'confirmed' => [
            'bg' => '#ECFDF5',
            'border' => '#A7F3D0',
            'text' => '#065F46',
            'label' => 'Accepted',
            'icon' => '✓'
        ],
        'rejected', 'declined' => [
            'bg' => '#FEF2F2',
            'border' => '#FECACA',
            'text' => '#991B1B',
            'label' => 'Rejected',
            'icon' => '✕'
        ],
        'cancelled' => [
            'bg' => '#F3F4F6',
            'border' => '#E5E7EB',
            'text' => '#374151',
            'label' => 'Cancelled',
            'icon' => '—'
        ],
        'completed' => [
            'bg' => '#F5F3FF',
            'border' => '#DDD6FE',
            'text' => '#5B21B6',
            'label' => 'Completed',
            'icon' => '★'
        ],
        default => [
            'bg' => '#FFFBEB',
            'border' => '#FDE68A',
            'text' => '#92400E',
            'label' => 'Pending',
            'icon' => '⏳'
        ]
    };
@endphp

<span style="display: inline-block; background-color: {{ $badgeStyles['bg'] }}; border: 1px solid {{ $badgeStyles['border'] }}; color: {{ $badgeStyles['text'] }}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1;">
    <span style="margin-right: 3px; font-size: 10px;">{{ $badgeStyles['icon'] }}</span> {{ $badgeStyles['label'] }}
</span>
