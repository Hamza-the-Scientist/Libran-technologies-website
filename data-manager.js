/**
 * DataManager — Central localStorage CRUD module for Libran Technologies
 * All admin-managed data flows through this module.
 * Seed data mirrors the existing hardcoded HTML content.
 */

const DataManager = (function () {
    'use strict';

    // ─── Storage Keys ───────────────────────────────────────────
    const KEYS = {
        TEAM: 'libran_team',
        SLIDERS: 'libran_sliders',
        HERO: 'libran_hero',
        PUBLICATIONS: 'libran_publications',
        PRODUCTS: 'libran_products',
        INITIALIZED: 'libran_initialized'
    };

    // ─── Default Seed Data ──────────────────────────────────────

    const DEFAULT_TEAM = [
        {
            id: 't1',
            name: 'ABBAS AZIZ',
            role: 'FOUNDER | CHIEF EXECUTIVE OFFICER (CEO)',
            section: 'founders',
            image: 'pics/abbas.jpeg',
            linkedin: 'https://www.linkedin.com/in/abbasaziz95/',
            description: ''
        },
        {
            id: 't2',
            name: 'KISSA E ZEHRA',
            role: 'CHIEF INNOVATIVE OFFICER(CIO) \nCo-Founder',
            section: 'founders',
            image: 'pics/kissa.jpeg',
            linkedin: 'https://www.linkedin.com/in/kissa-e-zehra-782489204/',
            description: ''
        },
        {
            id: 't3',
            name: 'AMNA ABBAS',
            role: 'DIRECTOR OF LICENSING AND COMMERCIALIZATION (DLC) | \n Co-Founder',
            section: 'founders',
            image: 'pics/amna.jpeg',
            linkedin: 'https://www.linkedin.com/in/amna-abbas-6ba336287/',
            description: ''
        },
        {
            id: 't4',
            name: 'ABDUL MAJID',
            role: 'DATA ANALYST',
            section: 'technical',
            image: 'pics/majid.jpeg',
            linkedin: 'https://www.linkedin.com/in/abdul-majid-memon-026797270/',
            description: ''
        },
        {
            id: 't5',
            name: 'BAKHTAWAR JAWED',
            role: 'MEDIA OUTREACH',
            section: 'technical',
            image: 'pics/girl.jpg',
            linkedin: 'https://linkedin.com',
            description: ''
        },
        {
            id: 't6',
            name: 'MUHAMMAD HAMZA',
            role: 'FULL STACK DEVELOPER',
            section: 'technical',
            image: 'pics/hamza.jpg',
            linkedin: 'https://www.linkedin.com/in/muhammad-hamza-9784ba287',
            description: ''
        },
        {
            id: 't7',
            name: 'ENGR. FATIMA JAWED',
            role: 'PRODUCT DESIGNER',
            section: 'technical',
            image: 'pics/girl.jpg',
            linkedin: 'https://linkedin.com',
            description: ''
        },
        {
            id: 't8',
            name: 'PROF. DR. NAJMA MEMON',
            role: 'TECHNICAL OFFICER',
            section: 'advisory',
            image: 'pics/najma.jpeg',
            linkedin: 'https://www.linkedin.com/in/najma-memon-122b7213/',
            description: ''
        },
        {
            id: 't9',
            name: 'PROF. DR. NUMAN ARSHID',
            role: 'TECHNICAL OFFICER',
            section: 'advisory',
            image: 'pics/noman.jpeg',
            linkedin: 'https://www.linkedin.com/in/numan-arshid-a2885b44/',
            description: ''
        },
        {
            id: 't10',
            name: 'PROF. DR. FARMAN SHAH',
            role: 'ENGINEERING SUPPORT',
            section: 'advisory',
            image: 'pics/farman.jpeg',
            linkedin: 'https://linkedin.com',
            description: ''
        },
        {
            id: 't11',
            name: 'PROF. DR. MUHAMMAD RAZA SHAH',
            role: 'FACILITY PROVIDER',
            section: 'advisory',
            image: 'pics/raza.jpeg',
            linkedin: 'https://linkedin.com',
            description: ''
        },
        {
            id: 't12',
            name: 'PROF. DR. SIRAJ UDDIN',
            role: 'IP SUPPORT',
            section: 'advisory',
            image: 'pics/siraj.jpeg',
            linkedin: 'https://linkedin.com',
            description: ''
        }
    ];

    const DEFAULT_SLIDERS = [
        { id: 's1', image: 'banner_pics/2.jpeg', heading: '', description: '', order: 1 },
        { id: 's2', image: 'banner_pics/3.jpeg', heading: '', description: '', order: 2 },
        { id: 's3', image: 'banner_pics/4.jpeg', heading: '', description: '', order: 3 },
        { id: 's4', image: 'banner_pics/5.jpeg', heading: '', description: '', order: 4 }
    ];

    const DEFAULT_HERO = {
        heading: 'LIBRAN <span>TECHNOLOGIES</span><br>PVT.LTD',
        tagline: 'INNOVATION ENGINEERED FOR TOMORROW',
        intro: 'Libran Technologies is an innovative and intellectual property development company dedicated to converting laboratory challenges into commercially valuable technological solutions. Built on a strong foundation of research, creativity, and strategic insight, the company focuses on generating patentable technologies with measurable laboratory impact. Libran Technologies operates on a forward-thinking model: independently identifying real laboratory challenges, designing practical solutions, transforming them into high-quality patents, and licensing these innovations to laboratory equipment companies seeking a competitive edge. Through this approach, the company bridges the gap between industrial need and technological advancement.'
    };

    const DEFAULT_PUBLICATIONS = [
        {
            id: 'p1',
            title: 'Industrial Design of temperature based jacket',
            type: 'Design/Utility Patent',
            status: 'Pending',
            pdfUrl: '#',
            pdfName: '',
            description: '',
            visible: true
        }
    ];

    const DEFAULT_PRODUCTS = [];

    // ─── Utility Functions ──────────────────────────────────────

    function generateId(prefix) {
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    function getData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) return defaultValue;
            return JSON.parse(data);
        } catch (e) {
            console.error('DataManager: Error reading ' + key, e);
            return defaultValue;
        }
    }

    function setData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('DataManager: Error writing ' + key, e);
            if (e.name === 'QuotaExceededError') {
                alert('Storage is full. Please remove some items before adding new ones.');
            }
            return false;
        }
    }

    /**
     * Convert a File object to a Base64 data URL string.
     * Returns a Promise that resolves with the data URL.
     */
    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function () { reject(reader.error); };
            reader.readAsDataURL(file);
        });
    }

    // ─── Initialization ─────────────────────────────────────────

    function initializeDefaults() {
        if (!localStorage.getItem(KEYS.INITIALIZED)) {
            setData(KEYS.TEAM, DEFAULT_TEAM);
            setData(KEYS.SLIDERS, DEFAULT_SLIDERS);
            setData(KEYS.HERO, DEFAULT_HERO);
            setData(KEYS.PUBLICATIONS, DEFAULT_PUBLICATIONS);
            setData(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
            localStorage.setItem(KEYS.INITIALIZED, 'true');
        }
    }

    // Run on load
    initializeDefaults();

    // ─── Team CRUD ───────────────────────────────────────────────

    function getTeamMembers(section) {
        var all = getData(KEYS.TEAM, DEFAULT_TEAM);
        if (section) {
            return all.filter(function (m) { return m.section === section; });
        }
        return all;
    }

    function getTeamMember(id) {
        var all = getTeamMembers();
        return all.find(function (m) { return m.id === id; }) || null;
    }

    function saveTeamMember(member) {
        var all = getTeamMembers();
        if (member.id) {
            // Update existing
            var idx = all.findIndex(function (m) { return m.id === member.id; });
            if (idx !== -1) {
                all[idx] = Object.assign({}, all[idx], member);
            } else {
                all.push(member);
            }
        } else {
            // Create new
            member.id = generateId('t');
            all.push(member);
        }
        return setData(KEYS.TEAM, all) ? member : null;
    }

    function deleteTeamMember(id) {
        var all = getTeamMembers();
        var filtered = all.filter(function (m) { return m.id !== id; });
        return setData(KEYS.TEAM, filtered);
    }

    // ─── Slider CRUD ────────────────────────────────────────────

    function getSliders() {
        var sliders = getData(KEYS.SLIDERS, DEFAULT_SLIDERS);
        return sliders.sort(function (a, b) { return a.order - b.order; });
    }

    function getSlider(id) {
        var all = getSliders();
        return all.find(function (s) { return s.id === id; }) || null;
    }

    function saveSlider(slider) {
        var all = getSliders();
        if (slider.id) {
            var idx = all.findIndex(function (s) { return s.id === slider.id; });
            if (idx !== -1) {
                all[idx] = Object.assign({}, all[idx], slider);
            } else {
                slider.order = all.length + 1;
                all.push(slider);
            }
        } else {
            slider.id = generateId('s');
            slider.order = all.length + 1;
            all.push(slider);
        }
        return setData(KEYS.SLIDERS, all) ? slider : null;
    }

    function deleteSlider(id) {
        var all = getSliders();
        var filtered = all.filter(function (s) { return s.id !== id; });
        // Re-order
        filtered.forEach(function (s, i) { s.order = i + 1; });
        return setData(KEYS.SLIDERS, filtered);
    }

    // ─── Hero Content ────────────────────────────────────────────

    function getHeroContent() {
        return getData(KEYS.HERO, DEFAULT_HERO);
    }

    function saveHeroContent(hero) {
        return setData(KEYS.HERO, hero);
    }

    // ─── Publications CRUD ──────────────────────────────────────

    function getPublications(onlyVisible) {
        var all = getData(KEYS.PUBLICATIONS, DEFAULT_PUBLICATIONS);
        if (onlyVisible) {
            return all.filter(function (p) { return p.visible !== false; });
        }
        return all;
    }

    function getPublication(id) {
        var all = getPublications();
        return all.find(function (p) { return p.id === id; }) || null;
    }

    function savePublication(pub) {
        var all = getPublications();
        if (pub.id) {
            var idx = all.findIndex(function (p) { return p.id === pub.id; });
            if (idx !== -1) {
                all[idx] = Object.assign({}, all[idx], pub);
            } else {
                all.push(pub);
            }
        } else {
            pub.id = generateId('p');
            pub.visible = true;
            all.push(pub);
        }
        return setData(KEYS.PUBLICATIONS, all) ? pub : null;
    }

    function deletePublication(id) {
        var all = getPublications();
        var filtered = all.filter(function (p) { return p.id !== id; });
        return setData(KEYS.PUBLICATIONS, filtered);
    }

    function togglePublicationVisibility(id) {
        var all = getPublications();
        var pub = all.find(function (p) { return p.id === id; });
        if (pub) {
            pub.visible = !pub.visible;
            pub.status = pub.visible ? 'Published' : 'Draft';
            setData(KEYS.PUBLICATIONS, all);
            return pub;
        }
        return null;
    }

    // ─── Products CRUD ──────────────────────────────────────────

    function getProducts() {
        return getData(KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    }

    function getProduct(id) {
        var all = getProducts();
        return all.find(function (p) { return p.id === id; }) || null;
    }

    function saveProduct(product) {
        var all = getProducts();
        if (product.id) {
            var idx = all.findIndex(function (p) { return p.id === product.id; });
            if (idx !== -1) {
                all[idx] = Object.assign({}, all[idx], product);
            } else {
                all.push(product);
            }
        } else {
            product.id = generateId('prod');
            if (!product.images) product.images = [];
            all.push(product);
        }
        return setData(KEYS.PRODUCTS, all) ? product : null;
    }

    function deleteProduct(id) {
        var all = getProducts();
        var filtered = all.filter(function (p) { return p.id !== id; });
        return setData(KEYS.PRODUCTS, filtered);
    }

    // ─── Reset / Export / Import ─────────────────────────────────

    function resetAll() {
        localStorage.removeItem(KEYS.INITIALIZED);
        localStorage.removeItem(KEYS.TEAM);
        localStorage.removeItem(KEYS.SLIDERS);
        localStorage.removeItem(KEYS.HERO);
        localStorage.removeItem(KEYS.PUBLICATIONS);
        localStorage.removeItem(KEYS.PRODUCTS);
        initializeDefaults();
    }

    function exportAll() {
        return {
            team: getTeamMembers(),
            sliders: getSliders(),
            hero: getHeroContent(),
            publications: getPublications(),
            products: getProducts()
        };
    }

    function importAll(data) {
        if (data.team) setData(KEYS.TEAM, data.team);
        if (data.sliders) setData(KEYS.SLIDERS, data.sliders);
        if (data.hero) setData(KEYS.HERO, data.hero);
        if (data.publications) setData(KEYS.PUBLICATIONS, data.publications);
        if (data.products) setData(KEYS.PRODUCTS, data.products);
        localStorage.setItem(KEYS.INITIALIZED, 'true');
    }

    // ─── Public API ──────────────────────────────────────────────

    return {
        // Team
        getTeamMembers: getTeamMembers,
        getTeamMember: getTeamMember,
        saveTeamMember: saveTeamMember,
        deleteTeamMember: deleteTeamMember,

        // Sliders
        getSliders: getSliders,
        getSlider: getSlider,
        saveSlider: saveSlider,
        deleteSlider: deleteSlider,

        // Hero
        getHeroContent: getHeroContent,
        saveHeroContent: saveHeroContent,

        // Publications
        getPublications: getPublications,
        getPublication: getPublication,
        savePublication: savePublication,
        deletePublication: deletePublication,
        togglePublicationVisibility: togglePublicationVisibility,

        // Products
        getProducts: getProducts,
        getProduct: getProduct,
        saveProduct: saveProduct,
        deleteProduct: deleteProduct,

        // Utilities
        fileToBase64: fileToBase64,
        resetAll: resetAll,
        exportAll: exportAll,
        importAll: importAll
    };

})();
