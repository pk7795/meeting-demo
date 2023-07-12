/** @type {import('tailwindcss').Config} */
module.exports = {
    important: true,
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#3333ff',
                primary_text: '#252528',
                gray_1: '#fafafa',
                gray_2: '#ebebef',
                gray_8: '#6e6e77',
                gray_9: '#494950',
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
}
