import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Users, Store, MapPin, Megaphone, Puzzle, AlertTriangle, Coins,
    ChevronRight, ChevronLeft, Star, Package, Zap, Heart, Route,
    Facebook, Twitter, Phone, Share2, ArrowUp, X
} from 'lucide-react'

// Image slider data
const heroSlides = [
    {
        title: 'MegatonCities',
        subtitle: 'MVX-World',
        description: 'The APP YOU Cannot be WITHOUT - This is Next Level involvement!',
        image: '/images/cities/city1.jpg',
    },
    {
        title: 'Carefully Built',
        subtitle: '',
        description: 'Flexibility, Speed, Ease of Use. And a host of features you cannot live without.',
        image: '/images/cities/city2.jpg',
    },
    {
        title: 'Elite Quality',
        subtitle: '',
        description: 'Mobile Website, App & PWA Ready.',
        image: '/images/cities/city3.jpg',
    },
    {
        title: 'Our DRIVE to Attempt',
        subtitle: '',
        description: 'Attempting to build the biggest financially independent community on planet earth!',
        image: '/images/cities/city4.jpg',
    },
]

// Features list with modal content
const features = [
    {
        icon: Users,
        name: 'Social Platform',
        description: 'Connect, share, and engage with the global community',
        modalContent: {
            title: 'MegaBook - Social Platform',
            details: 'Experience the ultimate social networking platform. Share your thoughts, connect with friends and family, join groups, create pages, and build your online presence. MegaBook offers all the social features you love, plus the unique opportunity to earn MegaBucks for your engagement!',
            highlights: ['Create posts, stories, and reels', 'Join and create groups', 'Business pages', 'Real-time messaging', 'Earn while you engage']
        }
    },
    {
        icon: Store,
        name: 'Online Market [Store]',
        description: 'Buy and sell in the MegaMall marketplace',
        modalContent: {
            title: 'MegaMall - Online Marketplace',
            details: 'Your one-stop digital marketplace! Buy and sell products, offer services, and trade with MegaBucks. Whether you\'re a small business owner or a savvy shopper, MegaMall connects you with opportunities worldwide.',
            highlights: ['List unlimited products', 'Accept MegaBucks payments', 'Secure transactions', 'Global reach', 'Seller verification']
        }
    },
    {
        icon: MapPin,
        name: 'Explore Cities',
        description: 'Discover and claim territories worldwide',
        modalContent: {
            title: 'CityBook - Explore & Claim',
            details: 'Stake your claim in the digital world! Explore cities, provinces, and countries. Claim territories and earn commissions from all activity in your region. Build your empire across the globe with our unique territory system.',
            highlights: ['195+ countries available', 'City-level territories', 'Earn territory commissions', 'Interactive world map', 'Limited positions available']
        }
    },
    {
        icon: Users,
        name: 'Partner Program',
        description: 'Earn through our referral and partner system',
        modalContent: {
            title: 'Partner Program',
            details: 'Grow together with MegaVX World! Our partner program rewards you for building the community. Invite friends, grow your network, and earn ongoing commissions from their activity. The more you share, the more you earn!',
            highlights: ['Multi-level rewards', 'Lifetime commissions', 'Partner dashboard', 'Promotional tools', 'Top partner bonuses']
        }
    },
    {
        icon: Megaphone,
        name: 'Advertising',
        description: 'MegaAds platform for businesses and brands',
        modalContent: {
            title: 'MegaAds - Advertising Platform',
            details: 'Reach millions of engaged users with MegaAds! Our powerful advertising platform lets businesses of all sizes create targeted campaigns. Users earn MegaBucks by viewing ads, creating a win-win ecosystem.',
            highlights: ['Targeted campaigns', 'Pay with MegaBucks', 'Analytics dashboard', 'Multiple ad formats', 'Users earn for viewing']
        }
    },
    {
        icon: Puzzle,
        name: 'Fragments',
        description: 'Collect and trade digital assets',
        modalContent: {
            title: 'Fragments - Digital Assets',
            details: 'Collect, trade, and own unique digital fragments! These special assets can be earned, purchased, or traded. Fragments unlock exclusive features, provide earning boosts, and can appreciate in value over time.',
            highlights: ['Collectible assets', 'Trading marketplace', 'Earning multipliers', 'Exclusive access', 'Limited editions']
        }
    },
    {
        icon: AlertTriangle,
        name: 'Emergency',
        description: 'Quick access emergency features',
        modalContent: {
            title: 'Emergency Services',
            details: 'Safety first! Our emergency feature provides quick access to critical services. One-touch emergency contacts, location sharing, and community alerts keep you and your loved ones safe.',
            highlights: ['One-touch SOS', 'Location sharing', 'Emergency contacts', 'Community alerts', 'Safety resources']
        }
    },
    {
        icon: Coins,
        name: 'MegaBuck Meme',
        description: 'Earn and spend with MegaBucks',
        modalContent: {
            title: 'MegaBucks - Digital Currency',
            details: 'MegaBucks is the lifeblood of MegaVX World! Earn MegaBucks through engagement, purchases, and referrals. Spend them in the marketplace, on advertising, or withdraw as real money. Your activity has real value!',
            highlights: ['Earn through engagement', 'Spend in marketplace', 'Withdraw to bank', 'Transfer to friends', 'Daily earning opportunities']
        }
    },
]

// Power features
const powerFeatures = [
    { icon: Package, title: 'Future Proof', desc: 'Built to last, with the latest quality code' },
    { icon: Zap, title: 'Powerful', desc: 'Speed, Features and Flexibility all in One!' },
    { icon: Route, title: 'Easy to Use', desc: 'Customers love our work for its ease.' },
    { icon: Heart, title: 'Customer Care', desc: 'We treat others like we want to be treated.' },
]

export function AboutPage() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null)

    // Auto-advance slider
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>

            {/* Hero Slider Section */}
            <section className="relative" style={{ backgroundColor: '#d4af37' }}>
                <div className="max-w-2xl mx-auto px-4 py-6">
                    <div className="relative rounded-xl overflow-hidden shadow-2xl" style={{ minHeight: '300px' }}>
                        {/* Slide */}
                        <div
                            className="relative w-full h-80 bg-cover bg-center transition-all duration-500"
                            style={{
                                backgroundImage: `url(${heroSlides[currentSlide].image})`,
                                backgroundColor: '#1a1a1a'
                            }}
                        >
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                                <h1 className="text-3xl font-bold text-white mb-1">
                                    {heroSlides[currentSlide].title}
                                    {heroSlides[currentSlide].subtitle && (
                                        <><br />{heroSlides[currentSlide].subtitle}</>
                                    )}
                                </h1>
                                <p className="text-sm font-semibold" style={{ color: '#d4af37' }}>
                                    {heroSlides[currentSlide].description}
                                </p>
                            </div>
                        </div>

                        {/* Navigation arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        >
                            <ChevronLeft size={24} style={{ color: '#d4af37' }} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        >
                            <ChevronRight size={24} style={{ color: '#d4af37' }} />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                            {heroSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className="w-2 h-2 rounded-full transition-all"
                                    style={{ backgroundColor: currentSlide === idx ? '#d4af37' : 'rgba(255,255,255,0.5)' }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Building Boundless Metropolises */}
            <section className="py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#f5f5f5' }}>
                            BUILDING <span style={{ color: '#d4af37' }}>BOUNDLESS METROPOLISES</span> of the FUTURE!
                        </h1>
                        <p className="text-center font-semibold mb-4" style={{ color: '#ef4444' }}>
                            It's a CINCH!
                        </p>
                        <p className="text-center mb-6" style={{ color: '#cccccc' }}>
                            Converging Cities, Social Connections, VR & AR Shopping, Brand Games, and More -
                            Unleashing the Ultimate Online Metropolis!
                        </p>

                        <h2 className="text-center text-3xl font-bold mb-4" style={{ color: '#d4af37' }}>
                            YOU Are Significant!
                        </h2>
                        <p className="text-center text-lg mb-6" style={{ color: '#cccccc' }}>
                            "Engage, Explore, Earn! Interact with brand messages, advertisements,
                            and thrilling VR & AR games on our platform to earn MegaBucks.
                            Your interactions unlock rewards, exclusive offers, and exciting opportunities,
                            giving you the power to turn your engagement into real value."
                        </p>

                        <div className="text-center">
                            <p className="text-4xl font-bold mb-4" style={{ color: '#d4af37' }}>SO!</p>
                            <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                                dive in,<br />
                                have fun,<br />
                                watch your MegaBucks grow<br />
                                enjoy the immersive experiences within our VIBRANT COMMUNITY!
                            </p>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-4xl font-bold mb-4" style={{ color: '#d4af37' }}>IMAGINE A</p>
                            <p className="text-2xl font-bold mb-4" style={{ color: '#d4af37' }}>
                                Swiss army knife for the internet,
                            </p>
                            <img
                                src="/images/about/armyknife1.png"
                                alt="Swiss Army Knife"
                                className="mx-auto max-w-xs mb-4"
                                style={{ maxHeight: '150px' }}
                            />
                            <p className="text-2xl font-bold" style={{ color: '#d4af37' }}>
                                assisting you with your endeavor's...
                            </p>
                            <p className="text-3xl font-bold mt-4" style={{ color: '#ef4444' }}>
                                That's MegatonCities - A new approach to our social being!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join & Login Section */}
            <section className="py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#f5f5f5' }}>
                            YES! - Action does speak louder than words!<br />NOW - IT's YOUR MOVE!
                        </h3>
                        <p className="font-bold mb-2" style={{ color: '#ef4444' }}>
                            No credit or debit card details are required to join!
                        </p>
                        <p className="font-bold mb-6" style={{ color: '#ef4444' }}>
                            You can "LIVE" in the system for free - FOREVER!
                        </p>

                        <div className="space-y-3">
                            <Link
                                to="/auth"
                                className="block w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(to right, #d4af37, #c9a227)', color: '#0a0a0a' }}
                            >
                                JOIN NOW - It's FREE
                            </Link>
                            <Link
                                to="/auth"
                                className="block w-full py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(to right, #d4af37, #c9a227)', color: '#0a0a0a' }}
                            >
                                LOGIN
                            </Link>
                        </div>

                        <img
                            src="/images/about/mclogo.png"
                            alt="MegatonCities Logo"
                            className="mx-auto mt-6 max-w-xs"
                        />
                    </div>
                </div>
            </section>

            {/* The Power Within */}
            <section className="py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#f5f5f5' }}>
                            The <span style={{ color: '#d4af37' }}>POWER</span> Within
                        </h1>
                        <p className="text-center font-semibold mb-4" style={{ color: '#d4af37' }}>
                            We can do IT!
                        </p>
                        <p className="text-center italic mb-4" style={{ color: '#cccccc' }}>
                            "Never doubt that a small group of thoughtful, committed citizens can change the world.
                            Indeed, it's the only thing that ever has."
                        </p>
                        <p className="text-center text-sm mb-4" style={{ color: '#888888' }}>
                            – Margaret Mead
                        </p>

                        <p className="text-center font-semibold mb-2" style={{ color: '#d4af37' }}>
                            AND - YES - of course WE can do IT!
                        </p>
                        <p className="text-center font-bold text-lg mb-4" style={{ color: '#d4af37' }}>
                            AND - YES - YOU ARE SIGNIFICANT!
                        </p>

                        <p className="text-center" style={{ color: '#cccccc' }}>
                            You are mistaken if you believe that your voice does not matter,
                            that your decision does not matter,
                            or that you do not make a difference.
                        </p>
                        <p className="text-center mt-4 italic" style={{ color: '#cccccc' }}>
                            There is an ancient West African adage that says,
                            "If YOU think you are too small to make an impact,
                            try spending the night in a room with a few mosquito's."
                        </p>
                    </div>
                </div>
            </section>

            {/* Intro to MegatonCities */}
            <section className="py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                        <img
                            src="/images/about/mclogo.png"
                            alt="MegatonCities Logo"
                            className="mx-auto mb-4 max-w-xs"
                        />
                        <h1 className="text-2xl font-bold text-center mb-4" style={{ color: '#f5f5f5' }}>
                            Intro to MegatonCities - MVX
                        </h1>
                        <p className="text-center mb-4" style={{ color: '#cccccc' }}>
                            "Welcome to the MegatonCities platform! We're excited to have you join us on this journey."
                        </p>
                        <p className="text-center mb-6" style={{ color: '#cccccc' }}>
                            Our app is the pinnacle of mobile innovation, boasting{' '}
                            <span style={{ color: '#d4af37' }} className="font-bold">"MAST-PWA-Technology"</span>,
                            bringing together exciting cutting-edge functionality with awesome fun social elements.
                        </p>

                        <p className="text-center" style={{ color: '#cccccc' }}>
                            Maintain your social life, make new contacts, and have access to a wealth of conveniences,
                            all at the touch of a button. Participate in an active group, share your experiences,
                            and uncover uncharted territory.
                        </p>

                        {/* Features List */}
                        <h2 className="text-xl font-bold text-center mt-8 mb-4" style={{ color: '#f5f5f5' }}>
                            Features
                        </h2>
                        <p className="text-center mb-4" style={{ color: '#cccccc' }}>
                            The user-friendliness of the system is prioritized in its design.
                        </p>

                        <div
                            className="rounded-xl p-4 space-y-3"
                            style={{ border: '1px solid #d4af37' }}
                        >
                            {features.map((feature, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedFeature(feature)}
                                    className="flex items-center gap-3 w-full text-left hover:bg-white/5 rounded-lg p-2 -m-2 transition-all"
                                >
                                    <div
                                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#22c55e' }}
                                    >
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                    <span style={{ color: '#f5f5f5' }} className="flex-1">{feature.name}</span>
                                    <ChevronRight size={16} style={{ color: '#d4af37' }} />
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-xs mt-4" style={{ color: '#888888' }}>
                            Tap any feature to learn more
                        </p>
                    </div>
                </div>
            </section>

            {/* Incredible Aspects */}
            <section className="py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                        <h1 className="text-2xl font-bold text-center mb-6" style={{ color: '#d4af37' }}>
                            Incredible Aspects
                        </h1>

                        <h2 className="text-xl font-bold text-center mb-2" style={{ color: '#d4af37' }}>
                            What is MegatonCities?
                        </h2>
                        <p className="text-center font-semibold mb-4" style={{ color: '#d4af37' }}>
                            A platform BOASTING many aspects!
                        </p>
                        <p className="text-center mb-6" style={{ color: '#cccccc' }}>
                            Social "MegaBook", e-Commerce "MegaMall", Business Listings & MicroSites "CityBook",
                            Wallet "MegaWallet", Advertising "MegaAds", Virtual & Augmented Reality "MVX",
                            Gamification "MegaGames"...
                        </p>

                        <div className="text-center">
                            <Link
                                to="/auth"
                                className="inline-block px-8 py-3 rounded-lg font-bold transition-all hover:scale-105"
                                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                            >
                                Join Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Packed with Power */}
            <section className="py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-6" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                        <h1 className="text-2xl font-bold text-center mb-2" style={{ color: '#d4af37' }}>
                            Packed with POWER
                        </h1>
                        <p className="text-center font-semibold mb-2" style={{ color: '#d4af37' }}>
                            The Absolute Best accessibility & value!
                        </p>
                        <p className="text-center mb-6" style={{ color: '#cccccc' }}>
                            Allowing you access to many awesome features!
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            {powerFeatures.map((feature, idx) => (
                                <div key={idx} className="text-center">
                                    <feature.icon size={40} style={{ color: '#d4af37' }} className="mx-auto mb-3" />
                                    <h3 className="font-bold mb-1" style={{ color: '#f5f5f5' }}>{feature.title}</h3>
                                    <p className="text-sm" style={{ color: '#888888' }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Care & Quality */}
            <section className="py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: '#d4af37' }}>
                            Care & Quality
                        </h1>
                        <p className="mb-4" style={{ color: '#d4af37' }}>
                            No stone left unturned, no aspect overlooked. Ensuring your journey to be one to talk about!
                        </p>
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={24} fill="#d4af37" style={{ color: '#d4af37' }} />
                            ))}
                        </div>
                        <Link
                            to="/testimonials"
                            className="inline-block px-6 py-2 rounded-lg font-bold transition-all"
                            style={{ background: 'linear-gradient(to right, #d4af37, #c9a227)', color: '#0a0a0a' }}
                        >
                            More Testimonials
                        </Link>
                    </div>
                </div>
            </section>

            {/* Get MVX Today */}
            <section className="py-4 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="rounded-xl p-6 text-center" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                        <h1 className="text-2xl font-bold mb-2" style={{ color: '#d4af37' }}>
                            Get MVX Today
                        </h1>
                        <p className="font-semibold mb-2" style={{ color: '#d4af37' }}>
                            Tons of Awesome Features just for You.
                        </p>
                        <p className="text-sm mb-6" style={{ color: '#cccccc' }}>
                            Fast, easy to use and filled with features. Get MVX Today and give your PRESENCE
                            on the WEB the VALUE it deserves.
                        </p>
                        <Link
                            to="/auth"
                            className="inline-block px-8 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(to right, #d4af37, #c9a227)', color: '#0a0a0a' }}
                        >
                            Join Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4" style={{ borderTop: '1px solid #2a2a2a' }}>
                <div className="max-w-2xl mx-auto text-center">
                    <img
                        src="/images/about/mclogo.png"
                        alt="MegatonCities Logo"
                        className="mx-auto mb-4"
                        style={{ maxHeight: '60px' }}
                    />
                    <p className="mb-2" style={{ color: '#cccccc' }}>
                        Fearless Innovation
                    </p>
                    <p className="text-sm mb-4" style={{ color: '#888888' }}>
                        by Megaton Devco Ltd<br />
                        Powered by the best Mobile <span style={{ color: '#d4af37' }}>"MAST-PWA" Technology.</span>
                    </p>

                    {/* Social Icons */}
                    <div className="flex justify-center gap-3 mb-4">
                        <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1877f2' }}>
                            <Facebook size={20} className="text-white" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1da1f2' }}>
                            <Twitter size={20} className="text-white" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
                            <Phone size={20} className="text-white" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                            <Share2 size={20} className="text-white" />
                        </a>
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: '#333333' }}
                        >
                            <ArrowUp size={20} className="text-white" />
                        </button>
                    </div>

                    <p className="text-xs mb-2" style={{ color: '#888888' }}>
                        Copyright © Gunstro Holdings (Pty) Ltd 2017 - {new Date().getFullYear()}.<br />
                        All Rights Reserved.
                    </p>

                    <div className="flex justify-center gap-4 text-sm">
                        <Link to="/privacy" style={{ color: '#d4af37' }} className="hover:underline">Privacy Policy</Link>
                        <span style={{ color: '#888888' }}>|</span>
                        <Link to="/terms" style={{ color: '#d4af37' }} className="hover:underline">Terms and Conditions</Link>
                        <span style={{ color: '#888888' }}>|</span>
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            style={{ color: '#d4af37' }}
                            className="hover:underline"
                        >
                            Back to Top
                        </button>
                    </div>
                </div>
            </footer>

            {/* Feature Modal */}
            {selectedFeature && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                    onClick={() => setSelectedFeature(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl p-6 relative"
                        style={{ backgroundColor: '#1a1a1a', border: '1px solid #d4af37' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedFeature(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                            style={{ color: '#888888' }}
                        >
                            <X size={20} />
                        </button>

                        {/* Icon */}
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                            style={{ background: 'linear-gradient(to bottom right, #d4af37, #c9a227)' }}
                        >
                            <selectedFeature.icon size={32} style={{ color: '#0a0a0a' }} />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#f5f5f5' }}>
                            {selectedFeature.modalContent.title}
                        </h2>

                        {/* Description */}
                        <p className="text-center mb-6" style={{ color: '#cccccc' }}>
                            {selectedFeature.modalContent.details}
                        </p>

                        {/* Highlights */}
                        <div className="space-y-2 mb-6">
                            {selectedFeature.modalContent.highlights.map((highlight, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: '#d4af37' }}
                                    >
                                        <span className="text-xs" style={{ color: '#0a0a0a' }}>✓</span>
                                    </div>
                                    <span className="text-sm" style={{ color: '#f5f5f5' }}>{highlight}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Link
                            to="/auth"
                            className="block w-full py-3 rounded-xl font-bold text-center transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(to right, #d4af37, #c9a227)', color: '#0a0a0a' }}
                            onClick={() => setSelectedFeature(null)}
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
