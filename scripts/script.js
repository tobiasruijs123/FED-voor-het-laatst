document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------
    // 1. DOM elementen selecteren
    // -------------------------------
    const header = document.querySelector('header');
    
    // Selecteer de menuknop
    const menuToggle = document.querySelector('[aria-controls="main-navigation"]'); 
    
    // Selecteer de navigatie container
    const mainNavigation = document.querySelector('nav[role="navigation"]');
    
    // Selecteer de UL van de hoofdnavigatie
    const menuUl = mainNavigation ? mainNavigation.querySelector('ul') : null;

    // Selecteer de 'Shop' link
    const shopDropdownLink = document.querySelector('nav[role="navigation"] a[aria-haspopup="true"]');
    const shopDropdownSubmenu = shopDropdownLink ? shopDropdownLink.nextElementSibling : null;

    const allNavLinks = mainNavigation ? mainNavigation.querySelectorAll('a') : [];

    // ✅ FIX: CAROUSEL SELECTOREN GECORRIGEERD
    const carouselSection = document.querySelector('main section[aria-label="Shop per Collectie"]');
    const carouselList = carouselSection ? carouselSection.querySelector('ul') : null;
    const prevButton = carouselSection ? carouselSection.querySelector('button[data-direction="prev"]') : null;
    const nextButton = carouselSection ? carouselSection.querySelector('button[data-direction="next"]') : null;

    // -------------------------------
    // SEMANTISCHE SELECTOREN VOOR STYLING
    // -------------------------------
    const logoContainer = document.querySelector('header h1 a');
    const logoWit = logoContainer ? logoContainer.querySelector('img:nth-child(1)') : null;
    const logoZwart = logoContainer ? logoContainer.querySelector('img:nth-child(2)') : null;
    
    // Selecteer de SVG direct in de Cart <a>
    const cartIcon = document.querySelector('header section a[aria-label="Winkelwagen"] svg');
    
    // Selector voor de Valuta Tekst
    const currencyText = document.querySelector('header section p');
    
    // Selecteer alle <a> elementen in de header
    const headerLinks = document.querySelectorAll('header a'); 
    
    // Hulpfuncties voor kleuren
    const primaryText = 'black'; 
    const secondaryText = 'white';
    const drempel = 100; // Scroll drempel in pixels


    // -------------------------------
    // 2. Mobiele menu toggle
    // -------------------------------
    
    const toggleMobileMenu = (newState) => {
        if (!menuToggle || !header) return;
        const isCurrentlyExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        const finalState = newState !== undefined ? newState : !isCurrentlyExpanded;

        // Toggle de 'menu-open' klasse voor CSS (transform: translateX(0))
        header.classList.toggle('menu-open', finalState);

        // Update ARIA status voor het hamburger icoon
        menuToggle.setAttribute('aria-expanded', finalState);
        
        if (window.innerWidth < 768) {
            document.body.style.overflow = finalState ? 'hidden' : '';
            
            // ✅ FIX: Forceer alle header links naar ZWART als het menu OPENT (Wit op Wit probleem)
            if (finalState) {
                headerLinks.forEach(link => {
                    link.style.color = primaryText;
                });
                
                // Zorg ervoor dat de header bij openen wit is, ongeacht de scroll
                header.style.backgroundColor = secondaryText; 
                
            } else {
                // Herstel de kleur bij sluiten op basis van de huidige scrollpositie
                updateHeaderStyle(); 
            }
        }

        // De transform wordt primair via de CSS geregeld (header.menu-open nav ul), 
        // maar dit stukje kan als fallback dienen of als u de CSS-oplossing niet gebruikt.
        if (menuUl) {
            menuUl.style.transform = finalState ? 'translateX(0)' : 'translateX(-100%)';
        }
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => toggleMobileMenu());
    }

    // Sluit menu na klik op link
    if (allNavLinks.length) {
        allNavLinks.forEach(link => {
            if (!link.getAttribute('aria-haspopup')) {
                link.addEventListener('click', () => {
                    if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true' && window.innerWidth < 768) {
                        setTimeout(() => toggleMobileMenu(false), 100);
                    }
                });
            }
        });
    }


    // -------------------------------
    // 3. Mobiele dropdown (Shop)
    // -------------------------------
    if (shopDropdownLink && shopDropdownSubmenu) {
        
        shopDropdownLink.addEventListener('click', (event) => {
            if (window.innerWidth < 768) {
                event.preventDefault();

                const isOpen = shopDropdownLink.getAttribute('aria-expanded') === 'true';
                const newState = !isOpen;

                shopDropdownLink.setAttribute('aria-expanded', newState);
                
                if (newState) {
                    shopDropdownSubmenu.style.maxHeight = shopDropdownSubmenu.scrollHeight + 'px';
                } else {
                    shopDropdownSubmenu.style.maxHeight = '0';
                }
            }
        });
    }

    // -------------------------------
    // 4. Scroll-hide header
    // -------------------------------
    if (header) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const headerHeight = header.offsetHeight; 
            
            // Sla scroll-hide over als het mobiele menu open is
            if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
                 lastScroll = currentScroll;
                 return; 
            }

            if (currentScroll > lastScroll && currentScroll > headerHeight) {
                // Scroll omlaag → Verberg ALLEEN de hoofdheader
                header.style.transform = `translateY(-${headerHeight}px)`; 

            } else {
                // Scroll omhoog → Toon de hoofdheader
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll <= 0 ? 0 : currentScroll;
        });
    }

    // ------------------------------------------
    // 5. Carousel functionaliteit
    // ------------------------------------------
    if (carouselList && prevButton && nextButton) {
        
        // Functie om de scrollafstand en de status van de knoppen bij te werken
        const updateCarousel = () => {
            if (!carouselList || !carouselList.firstElementChild) {
                prevButton.disabled = true;
                nextButton.disabled = true;
                return;
            }

            // Gebruik de offsetWidth van het eerste item (<li>) als scrollafstand
            const itemWidth = carouselList.firstElementChild.offsetWidth;
            const currentScroll = carouselList.scrollLeft;
            const maxScroll = carouselList.scrollWidth - carouselList.offsetWidth; 

            // Deactiveer knoppen bij begin/eind van de lijst
            prevButton.disabled = currentScroll <= 1;
            nextButton.disabled = currentScroll >= maxScroll - 1; 
        };

        // Navigeer naar het vorige item
        prevButton.addEventListener('click', () => {
            const itemWidth = carouselList.firstElementChild.offsetWidth;
            carouselList.scrollLeft -= itemWidth;
            // Update de knopstatus nadat de scroll (met animatie) is voltooid
            setTimeout(updateCarousel, 300); 
        });

        // Navigeer naar het volgende item
        nextButton.addEventListener('click', () => {
            const itemWidth = carouselList.firstElementChild.offsetWidth;
            carouselList.scrollLeft += itemWidth;
            // Update de knopstatus nadat de scroll (met animatie) is voltooid
            setTimeout(updateCarousel, 300);
        });

        // Update knoppen tijdens scrollen door de gebruiker (muis/touch)
        carouselList.addEventListener('scroll', updateCarousel);

        // Update de carousel bij het laden van de pagina en bij het wijzigen van de grootte
        window.addEventListener('resize', updateCarousel);
        
        // Roep direct aan om de initiële staat in te stellen
        updateCarousel();
    }

    // ------------------------------------------
    // 6. Dynamische Navigatiebalk Stijl
    // ------------------------------------------
    const updateHeaderStyle = () => {
        const scrollPosition = window.scrollY;

        // Skip styling if the mobile menu is open, the menuOpen state handles the color
        if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true' && window.innerWidth < 768) {
             return; 
        }

        if (scrollPosition > drempel) {
            // SCROLLED TOESTAND (WITTE NAV, DONKERE TEKST/ICONEN)
            
            // Header Achtergrond en Rand
            header.style.backgroundColor = secondaryText; 
           
            
            // Logo's wisselen
            if (logoWit) logoWit.style.display = 'none';
            if (logoZwart) logoZwart.style.display = 'block';

            // Hamburger Icon kleur (Zwart)
            if (menuToggle) menuToggle.style.color = primaryText;
            
            // Navigatie Links kleur (Zwart)
            headerLinks.forEach(link => {
                 link.style.color = primaryText;
            });
            
            // Valuta Tekst kleur (Zwart)
            if (currencyText) currencyText.style.color = primaryText;

        } else {
            // INITIËLE TOESTAND (TRANSPARANTE NAV, WITTE TEKST/ICONEN)

            // Header Achtergrond en Rand
            header.style.backgroundColor = 'transparent';
            header.style.borderBottom = 'none'; 
            
            // Logo's wisselen
            if (logoWit) logoWit.style.display = 'block';
            if (logoZwart) logoZwart.style.display = 'none';
            
            // Hamburger Icon kleur (Wit)
            if (menuToggle) menuToggle.style.color = secondaryText;
            
            // Navigatie Links kleur (Wit)
            headerLinks.forEach(link => {
                link.style.color = secondaryText;
            });
            
            // Valuta Tekst kleur (Wit)
            if (currencyText) currencyText.style.color = secondaryText;
        }
    };

    // Voeg event listener toe om stijl bij te werken tijdens scrollen
    window.addEventListener('scroll', updateHeaderStyle);
    
    // Voer de functie eenmaal uit bij het laden van de pagina voor de initiële staat
    updateHeaderStyle();
    
    
    // ------------------------------------------
    // 7. Community Tegels Rotatie 
    // ------------------------------------------
    
    // Selecteer de eerste 5 li's in de community-sectie (de roterende tegels)
    const rotatingTiles = document.querySelectorAll('section[aria-label="Join The TØTE Community"] ul li:nth-of-type(-n+5) a');

    rotatingTiles.forEach(tileLink => {
        const images = tileLink.querySelectorAll('img');
        
        // Sla deze tegel over als er geen afbeeldingen zijn (bijv. de @totelabel tegel)
        if (images.length === 0) return; 
        
        let currentIndex = 0;

        // Functie om de volgende afbeelding te tonen
        const showNextImage = () => {
            // Verberg de huidige afbeelding
            images[currentIndex].style.opacity = 0;
            
            // Bereken de index van de volgende afbeelding (terug naar 0 na de laatste)
            currentIndex = (currentIndex + 1) % images.length;
            
            // Toon de nieuwe (volgende) afbeelding
            images[currentIndex].style.opacity = 1;
        };

        // Bepaal een willekeurige vertraging voor deze specifieke tegel
        // Tussen 2000 ms (2 sec) en 4000 ms (4 sec)
        const randomDelay = Math.random() * 2000 + 2000;

        // Zorg ervoor dat de eerste afbeelding na het laden van de DOM zeker zichtbaar is
        images[0].style.opacity = 1; 

        // Start het automatisch roteren voor deze tegel
        setInterval(showNextImage, randomDelay);
    });
});