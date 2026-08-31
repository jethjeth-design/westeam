import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Figtree', ...defaultTheme.fontFamily.sans],
                serif: ['Playfair Display', 'Cinzel', ...defaultTheme.fontFamily.serif],
            },
            colors: {
                cream: {
                    DEFAULT: '#F8F5EF',
                    50: '#FCFAF7',
                    100: '#F8F5EF',
                    200: '#F0EADF',
                    300: '#E7DFCF',
                },
                gold: {
                    50: '#FAF6ED',
                    100: '#F4EDDA',
                    200: '#E9DBB5',
                    300: '#DFC88F',
                    400: '#D4B66B',
                    500: '#C8A96B',
                    DEFAULT: '#C8A96B',
                    600: '#B39355',
                    700: '#967840',
                    800: '#7A6032',
                    900: '#5E4824',
                },
                charcoal: {
                    50: '#F5F5F4',
                    100: '#E7E6E5',
                    200: '#D0CECC',
                    300: '#9F9B96',
                    400: '#6E6A64',
                    500: '#524E4A',
                    600: '#3D3A37',
                    DEFAULT: '#292725',
                    800: '#292725',
                    900: '#1B1A19',
                },
                warmgray: {
                    50: '#F9F8F7',
                    100: '#EFECE9',
                    200: '#DFDAD4',
                    300: '#BFB8AF',
                    400: '#9E978D',
                    DEFAULT: '#716D67',
                    500: '#716D67',
                    600: '#5E5B56',
                    700: '#4C4945',
                    800: '#3A3834',
                    900: '#282725',
                },
                softbeige: {
                    50: '#FAF7F2',
                    100: '#F4EFE7',
                    DEFAULT: '#E9E1D4',
                    200: '#E9E1D4',
                    300: '#D8CEBD',
                    400: '#C5BAA5',
                    500: '#B2A58E',
                },
                sage: {
                    50: '#F4F6F3',
                    100: '#E5EAE3',
                    200: '#CCD5C9',
                    300: '#B2BCAE',
                    400: '#97A393',
                    DEFAULT: '#7D8A78',
                    500: '#7D8A78',
                    600: '#657061',
                    700: '#4E574B',
                    800: '#383E36',
                    900: '#232722',
                },
            },
        },
    },

    plugins: [forms],
};
