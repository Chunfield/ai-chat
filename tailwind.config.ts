
import { Config } from 'tailwindcss';

const config: Config = {
content: [
  './index.html',
  './src/**/*.{js,jsx,ts,tsx}',
],
  theme: {
    extend: {
        colors: {
        'custom-gradient-start': '#ff7e5f', 
            'custom-gradient-middle': '#feb47b', 
            'custom-gradient-end': '#6a11cb', 
        },
        gradientColorStopPositions: {
            35: '35%',
            65: '65%',
        }
    },
  },
  plugins: [],
}

export default config;