import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-champagnegold bg-champagne text-darkgold focus:border-indigo-700 focus:bg-champagne focus:text-indigo-800'
                    : 'border-transparent text-warmgray hover:border-warmbeige hover:bg-ivory hover:text-softcharcoal focus:border-warmbeige focus:bg-ivory focus:text-softcharcoal'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
