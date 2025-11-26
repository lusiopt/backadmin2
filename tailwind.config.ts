import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			lusioBlue: '#0066CC',
  			lusioBlueDark: '#00479E',
  			lusioBlueLight: '#CCE5FF',
  			midnight_text: '#263238',
  			error: '#CF3127',
  			warning: '#F7931A',
  			success: '#3cd278',
  			light_grey: '#505050',
  			grey: '#F5F7FA',
  			dark_grey: '#1E2229',
  			darkmode: '#001529',
  			darklight: '#0c2d48',
  			dark_border: '#959595',
  			tealGreen: '#477E70',
  			charcoalGray: '#666C78',
  			deepSlate: '#001F3D',
  			slateGray: '#2F3543'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'collapsible-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-collapsible-content-height)'
  				}
  			},
  			'collapsible-up': {
  				from: {
  					height: 'var(--radix-collapsible-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'collapsible-down': 'collapsible-down 0.2s ease-out',
  			'collapsible-up': 'collapsible-up 0.2s ease-out'
  		},
  		maxWidth: {
  			'screen-xl': '75rem',
  			'screen-2xl': '83.75rem'
  		},
  		boxShadow: {
  			'cause-shadow': '0px 4px 17px 0px #00000008'
  		},
  		spacing: {
  			'25': '35.625rem',
  			'29': '28rem',
  			'45': '45rem',
  			'50': '50rem',
  			'51': '54.375rem',
  			'85': '21rem',
  			'94': '22.5rem',
  			'120': '120rem',
  			'6.25': '6.25rem',
  			'70%': '70%',
  			'40%': '40%',
  			'30%': '30%',
  			'80%': '80%',
  			'8.5': '8.5rem',
  			'3.75': '3.75rem'
  		},
  		zIndex: {
  			'1': '1',
  			'2': '2',
  			'999': '999'
  		},
  		fontSize: {
  			'14': [
  				'0.875rem',
  				{
  					lineHeight: '1.225rem'
  				}
  			],
  			'16': [
  				'1rem',
  				{
  					lineHeight: '1.6875rem'
  				}
  			],
  			'17': [
  				'1.0625rem',
  				{
  					lineHeight: '1.4875rem'
  				}
  			],
  			'18': [
  				'1.125rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			'21': [
  				'1.3125rem',
  				{
  					lineHeight: '1.875rem'
  				}
  			],
  			'22': [
  				'1.375rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'24': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'28': [
  				'1.75rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'30': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'36': [
  				'2.25rem',
  				{
  					lineHeight: '2.625rem'
  				}
  			],
  			'40': [
  				'2.5rem',
  				{
  					lineHeight: '3rem'
  				}
  			],
  			'44': [
  				'2.75rem',
  				{
  					lineHeight: '1.3'
  				}
  			],
  			'54': [
  				'3.375rem',
  				{
  					lineHeight: '1.2'
  				}
  			],
  			'70': [
  				'4.375rem',
  				{
  					lineHeight: '1.2'
  				}
  			],
  			'76': [
  				'4.75rem',
  				{
  					lineHeight: '1.2'
  				}
  			],
  			'86': [
  				'5.375rem',
  				{
  					lineHeight: '1.2'
  				}
  			]
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
