/**
 * ContentLoader — Dynamically renders public page content from DataManager.
 * Include this script (after data-manager.js) on every public-facing page.
 * It detects which page it's on and renders the appropriate sections.
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var page = detectPage();

        switch (page) {
            case 'index':
                loadSliders();
                loadHeroContent();
                break;
            case 'team':
                loadTeamMembers();
                break;
            case 'patent':
                loadPublications();
                break;
            case 'product':
                loadProducts();
                break;
        }
    });

    function detectPage() {
        var path = window.location.pathname.toLowerCase();
        if (path.indexOf('team') !== -1) return 'team';
        if (path.indexOf('patent') !== -1) return 'patent';
        if (path.indexOf('product') !== -1) return 'product';
        if (path.indexOf('news') !== -1) return 'news';
        if (path.indexOf('contact') !== -1) return 'contact';
        return 'index';
    }

    // ─── Slider Loader (index.html) ─────────────────────────────

    function loadSliders() {
        var container = document.getElementById('slider');
        if (!container) return;

        var sliders = DataManager.getSliders();
        if (!sliders || sliders.length === 0) return;

        container.innerHTML = '';
        sliders.forEach(function (slide) {
            var div = document.createElement('div');
            div.className = 'slide';
            var img = document.createElement('img');
            img.src = slide.image;
            img.alt = slide.heading || 'Banner';
            div.appendChild(img);

            if (slide.heading) {
                var overlay = document.createElement('div');
                overlay.className = 'slide-overlay';
                overlay.innerHTML = '<h2>' + escapeHtml(slide.heading) + '</h2>' +
                    (slide.description ? '<p>' + escapeHtml(slide.description) + '</p>' : '');
                div.appendChild(overlay);
            }

            container.appendChild(div);
        });
    }

    // ─── Hero Content Loader (index.html) ────────────────────────

    function loadHeroContent() {
        var hero = DataManager.getHeroContent();
        if (!hero) return;

        var heroHeading = document.getElementById('hero-heading');
        var heroTagline = document.getElementById('hero-tagline');
        var heroIntro = document.getElementById('hero-intro');

        if (heroHeading && hero.heading) heroHeading.innerHTML = hero.heading;
        if (heroTagline && hero.tagline) heroTagline.textContent = hero.tagline;
        if (heroIntro && hero.intro) heroIntro.textContent = hero.intro;
    }

    // ─── Team Loader (team.html) ─────────────────────────────────

    function loadTeamMembers() {
        loadTeamSection('founders', 'founders-grid');
        loadTeamSection('technical', 'technical-grid');
        loadTeamSection('advisory', 'advisory-slider');
    }

    function loadTeamSection(section, containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var members = DataManager.getTeamMembers(section);
        if (!members || members.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 40px;">No team members added yet.</p>';
            return;
        }

        container.innerHTML = '';
        members.forEach(function (member) {
            var card = document.createElement('a');
            card.href = member.linkedin || '#';
            card.target = '_blank';
            card.className = 'member-card';

            var roleHtml = escapeHtml(member.role).replace(/\n/g, '<br>');

            card.innerHTML =
                '<div class="member-img"><img src="' + escapeHtml(member.image) + '" alt="' + escapeHtml(member.name) + '"></div>' +
                '<div class="member-info">' +
                '<h3>' + escapeHtml(member.name) + '</h3>' +
                '<p>' + roleHtml + '</p>' +
                (member.description ? '<p class="member-desc">' + escapeHtml(member.description) + '</p>' : '') +
                '</div>';

            container.appendChild(card);
        });
    }

    // ─── Publications Loader (patent.html) ───────────────────────

    function loadPublications() {
        var tbody = document.getElementById('publications-body');
        if (!tbody) return;

        var pubs = DataManager.getPublications(true); // only visible
        if (!pubs || pubs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888; padding:40px;">No publications available.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        pubs.forEach(function (pub) {
            var tr = document.createElement('tr');

            var statusClass = pub.status === 'Published' ? 'published' :
                pub.status === 'Pending' ? 'pending' : 'pending';

            var downloadHtml = '';
            if (pub.pdfUrl && pub.pdfUrl !== '#') {
                downloadHtml = '<a href="' + pub.pdfUrl + '" class="link-btn" download="' + escapeHtml(pub.pdfName || pub.title) + '.pdf">Download PDF</a>';
            } else {
                downloadHtml = '<a href="#" class="link-btn" style="opacity:0.5; pointer-events:none;">No PDF</a>';
            }

            tr.innerHTML =
                '<td data-label="Title">' + escapeHtml(pub.title) + '</td>' +
                '<td data-label="Type">' + escapeHtml(pub.type) + '</td>' +
                '<td data-label="Status"><span class="status ' + statusClass + '">' + escapeHtml(pub.status) + '</span></td>' +
                '<td data-label="Link">' + downloadHtml + '</td>';

            tbody.appendChild(tr);
        });
    }

    // ─── Products Loader (product.html) ──────────────────────────

    function loadProducts() {
        var container = document.getElementById('products-container');
        if (!container) return;

        var products = DataManager.getProducts();
        if (!products || products.length === 0) {
            container.innerHTML = '<p style="color: #888; text-align: center; padding: 60px 20px; font-size: 1.1rem;">No products available yet. Check back soon!</p>';
            container.style.display = 'block';
            return;
        }

        container.innerHTML = '';
        container.style.display = 'block';

        products.forEach(function (product, idx) {
            var row = document.createElement('div');
            row.className = 'product-row';

            // Build image gallery
            var imagesHtml = '';
            if (product.images && product.images.length > 0) {
                imagesHtml = '<img src="' + product.images[0] + '" alt="' + escapeHtml(product.name) + '" id="main-img-' + idx + '">';
                if (product.images.length > 1) {
                    imagesHtml += '<div class="product-thumbnails">';
                    product.images.forEach(function (img, imgIdx) {
                        imagesHtml += '<img src="' + img + '" alt="Thumbnail" class="thumb' + (imgIdx === 0 ? ' active' : '') + '" onclick="switchProductImage(' + idx + ', \'' + img + '\', this)">';
                    });
                    imagesHtml += '</div>';
                }
            } else {
                imagesHtml = '<div style="width:100%;height:300px;background:#1a1a1a;border-radius:20px;display:flex;align-items:center;justify-content:center;color:#555;">No Image</div>';
            }

            // PDF download button
            var pdfHtml = '';
            if (product.pdfUrl && product.pdfUrl !== '#') {
                pdfHtml = '<a href="' + product.pdfUrl + '" class="btn-shop" download="' + escapeHtml(product.pdfName || product.name) + '.pdf">Download Technical PDF</a>';
            }

            row.innerHTML =
                '<div class="product-description">' +
                '<h2>' + escapeHtml(product.name) + '</h2>' +
                '<p>' + escapeHtml(product.description) + '</p>' +
                '<a href="#" class="btn-shop" onclick="event.preventDefault()">View Details</a> ' +
                pdfHtml +
                '</div>' +
                '<div class="product-image">' + imagesHtml + '</div>';

            container.appendChild(row);
        });
    }

    // ─── Helper: Escape HTML ─────────────────────────────────────

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

})();

// Global function for product image switching
function switchProductImage(productIdx, imgSrc, thumbEl) {
    var mainImg = document.getElementById('main-img-' + productIdx);
    if (mainImg) mainImg.src = imgSrc;
    // Update active thumb
    var thumbs = thumbEl.parentElement.querySelectorAll('.thumb');
    thumbs.forEach(function (t) { t.classList.remove('active'); });
    thumbEl.classList.add('active');
}
