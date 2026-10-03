/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'os-bg': '#0f172a', // Slate 900
                'os-panel': 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
                'os-accent': '#38bdf8', // Sky 400
            },
            backgroundImage: {
                'desktop-wallpaper': "url('/jarvis-bg.png')",
            }
        },
    },
    plugins: [],
}
