/**
 * Admin Panel Logic — Libran Technologies
 * Handles login, CRUD operations for all modules, and UI interactions.
 */

(function () {
    'use strict';

    // ─── CONFIG ──────────────────────────────────────────────────
    var ADMIN_PASSWORD = 'admin123';

    // ─── Temp storage for file uploads ───────────────────────────
    var tempTeamImage = null;
    var tempSliderImage = null;
    var tempPubPdf = null;
    var tempPubPdfName = '';
    var tempProductImages = [];
    var tempProductPdf = null;
    var tempProductPdfName = '';

    // ─── LOGIN ───────────────────────────────────────────────────

    window.attemptLogin = function () {
        var password = document.getElementById('loginPassword').value;
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('libran_admin_auth', 'true');
            showAdmin();
        } else {
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginPassword').focus();
        }
    };

    window.logout = function () {
        sessionStorage.removeItem('libran_admin_auth');
        document.getElementById('adminLayout').classList.remove('active');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginPassword').value = '';
    };

    function showAdmin() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminLayout').classList.add('active');
        refreshDashboard();
        refreshTeamTable();
        refreshSliderCards();
        refreshPubTable();
        refreshProductCards();
        loadHeroInputs();
    }

    // Check session on load
    if (sessionStorage.getItem('libran_admin_auth') === 'true') {
        showAdmin();
    }

    // ─── SIDEBAR NAVIGATION ──────────────────────────────────────

    window.switchSection = function (sectionName, linkEl) {
        event.preventDefault();
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(function (s) {
            s.classList.remove('active');
        });
        // Show target section
        var target = document.getElementById('section-' + sectionName);
        if (target) target.classList.add('active');

        // Update nav active state
        document.querySelectorAll('.sidebar-nav a').forEach(function (a) {
            a.classList.remove('active');
        });
        if (linkEl) linkEl.classList.add('active');

        // Close sidebar on mobile
        document.getElementById('sidebar').classList.remove('open');
    };

    window.toggleSidebar = function () {
        document.getElementById('sidebar').classList.toggle('open');
    };

    // ─── MODAL MANAGEMENT ────────────────────────────────────────

    window.closeModal = function (modalId) {
        document.getElementById(modalId).classList.remove('active');
    };

    function openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    // Close modals on overlay click
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });

    // ─── TOAST NOTIFICATIONS ─────────────────────────────────────

    function showToast(message, type) {
        var toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast ' + (type || 'success') + ' show';
        setTimeout(function () {
            toast.classList.remove('show');
        }, 3000);
    }

    // ─── DASHBOARD ───────────────────────────────────────────────

    function refreshDashboard() {
        document.getElementById('stat-team').textContent = DataManager.getTeamMembers().length;
        document.getElementById('stat-sliders').textContent = DataManager.getSliders().length;
        document.getElementById('stat-publications').textContent = DataManager.getPublications().length;
        document.getElementById('stat-products').textContent = DataManager.getProducts().length;
    }

    // ─── TEAM MANAGEMENT ─────────────────────────────────────────

    window.openTeamModal = function (id) {
        tempTeamImage = null;
        document.getElementById('team-edit-id').value = '';
        document.getElementById('team-name').value = '';
        document.getElementById('team-role').value = '';
        document.getElementById('team-section').value = 'technical';
        document.getElementById('team-linkedin').value = '';
        document.getElementById('team-description').value = '';
        document.getElementById('team-image-preview').innerHTML = '';
        document.getElementById('team-image-file').value = '';
        document.getElementById('teamModalTitle').textContent = 'Add Team Member';

        if (id) {
            var member = DataManager.getTeamMember(id);
            if (member) {
                document.getElementById('teamModalTitle').textContent = 'Edit Team Member';
                document.getElementById('team-edit-id').value = member.id;
                document.getElementById('team-name').value = member.name || '';
                document.getElementById('team-role').value = member.role || '';
                document.getElementById('team-section').value = member.section || 'technical';
                document.getElementById('team-linkedin').value = member.linkedin || '';
                document.getElementById('team-description').value = member.description || '';
                if (member.image) {
                    document.getElementById('team-image-preview').innerHTML = '<img src="' + member.image + '" alt="Preview">';
                    tempTeamImage = member.image;
                }
            }
        }

        openModal('teamModal');
    };

    window.previewTeamImage = function (input) {
        if (input.files && input.files[0]) {
            DataManager.fileToBase64(input.files[0]).then(function (base64) {
                tempTeamImage = base64;
                document.getElementById('team-image-preview').innerHTML = '<img src="' + base64 + '" alt="Preview">';
            });
        }
    };

    window.saveTeamMember = function () {
        var name = document.getElementById('team-name').value.trim();
        var role = document.getElementById('team-role').value.trim();
        if (!name || !role) {
            showToast('Name and Role are required!', 'error');
            return;
        }

        var member = {
            id: document.getElementById('team-edit-id').value || undefined,
            name: name.toUpperCase(),
            role: role.toUpperCase(),
            section: document.getElementById('team-section').value,
            linkedin: document.getElementById('team-linkedin').value.trim() || 'https://linkedin.com',
            description: document.getElementById('team-description').value.trim(),
            image: tempTeamImage || 'pics/girl.jpg'
        };

        DataManager.saveTeamMember(member);
        closeModal('teamModal');
        refreshTeamTable();
        refreshDashboard();
        showToast(member.id ? 'Team member updated!' : 'Team member added!');
    };

    window.deleteTeamMemberAdmin = function (id) {
        if (confirm('Are you sure you want to remove this team member?')) {
            DataManager.deleteTeamMember(id);
            refreshTeamTable();
            refreshDashboard();
            showToast('Team member removed.', 'error');
        }
    };

    function refreshTeamTable() {
        var tbody = document.getElementById('team-table-body');
        if (!tbody) return;
        var members = DataManager.getTeamMembers();

        if (members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">No team members. Click "+ Add Member" to get started.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        members.forEach(function (m) {
            var sectionLabel = m.section === 'founders' ? 'Founder' : m.section === 'technical' ? 'Technical' : 'Advisory';
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td><img src="' + (m.image || 'pics/girl.jpg') + '" class="thumb-img" alt="' + m.name + '"></td>' +
                '<td>' + m.name + '</td>' +
                '<td style="font-size:0.7rem;">' + m.role + '</td>' +
                '<td><span class="badge badge-published">' + sectionLabel + '</span></td>' +
                '<td class="actions">' +
                '<button class="btn btn-outline btn-sm" onclick="openTeamModal(\'' + m.id + '\')">Edit</button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteTeamMemberAdmin(\'' + m.id + '\')">Delete</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    }

    // ─── MEDIA & HERO MANAGEMENT ─────────────────────────────────

    function loadHeroInputs() {
        var hero = DataManager.getHeroContent();
        if (!hero) return;
        document.getElementById('hero-heading-input').value = hero.heading || '';
        document.getElementById('hero-tagline-input').value = hero.tagline || '';
        document.getElementById('hero-intro-input').value = hero.intro || '';
    }

    window.saveHeroEdit = function () {
        var hero = {
            heading: document.getElementById('hero-heading-input').value.trim(),
            tagline: document.getElementById('hero-tagline-input').value.trim(),
            intro: document.getElementById('hero-intro-input').value.trim()
        };
        DataManager.saveHeroContent(hero);
        showToast('Hero content saved!');
    };

    window.openSliderModal = function (id) {
        tempSliderImage = null;
        document.getElementById('slider-edit-id').value = '';
        document.getElementById('slider-heading').value = '';
        document.getElementById('slider-description').value = '';
        document.getElementById('slider-image-preview').innerHTML = '';
        document.getElementById('slider-image-file').value = '';
        document.getElementById('sliderModalTitle').textContent = 'Add Banner Slide';

        if (id) {
            var slider = DataManager.getSlider(id);
            if (slider) {
                document.getElementById('sliderModalTitle').textContent = 'Edit Banner Slide';
                document.getElementById('slider-edit-id').value = slider.id;
                document.getElementById('slider-heading').value = slider.heading || '';
                document.getElementById('slider-description').value = slider.description || '';
                if (slider.image) {
                    document.getElementById('slider-image-preview').innerHTML = '<img src="' + slider.image + '" alt="Preview">';
                    tempSliderImage = slider.image;
                }
            }
        }

        openModal('sliderModal');
    };

    window.previewSliderImage = function (input) {
        if (input.files && input.files[0]) {
            DataManager.fileToBase64(input.files[0]).then(function (base64) {
                tempSliderImage = base64;
                document.getElementById('slider-image-preview').innerHTML = '<img src="' + base64 + '" alt="Preview">';
            });
        }
    };

    window.saveSliderItem = function () {
        var editId = document.getElementById('slider-edit-id').value;
        if (!tempSliderImage && !editId) {
            showToast('Please upload a banner image!', 'error');
            return;
        }

        var slider = {
            id: editId || undefined,
            heading: document.getElementById('slider-heading').value.trim(),
            description: document.getElementById('slider-description').value.trim(),
            image: tempSliderImage || DataManager.getSlider(editId).image
        };

        DataManager.saveSlider(slider);
        closeModal('sliderModal');
        refreshSliderCards();
        refreshDashboard();
        showToast(editId ? 'Slide updated!' : 'Slide added!');
    };

    window.deleteSliderAdmin = function (id) {
        if (confirm('Remove this banner slide?')) {
            DataManager.deleteSlider(id);
            refreshSliderCards();
            refreshDashboard();
            showToast('Slide removed.', 'error');
        }
    };

    function refreshSliderCards() {
        var container = document.getElementById('slider-cards-container');
        if (!container) return;
        var sliders = DataManager.getSliders();

        if (sliders.length === 0) {
            container.innerHTML = '<div class="empty-state"><div class="empty-icon">🖼️</div><p>No banner slides added yet.</p></div>';
            return;
        }

        container.innerHTML = '';
        sliders.forEach(function (s) {
            var card = document.createElement('div');
            card.className = 'slider-card';
            card.innerHTML =
                '<img src="' + s.image + '" alt="Slide">' +
                '<div class="slider-card-body">' +
                '<span>' + (s.heading || 'Slide #' + s.order) + '</span>' +
                '<div class="actions">' +
                '<button class="btn btn-outline btn-sm" onclick="openSliderModal(\'' + s.id + '\')">Edit</button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteSliderAdmin(\'' + s.id + '\')">✕</button>' +
                '</div>' +
                '</div>';
            container.appendChild(card);
        });
    }

    // ─── PUBLICATIONS MANAGEMENT ─────────────────────────────────

    window.openPubModal = function (id) {
        tempPubPdf = null;
        tempPubPdfName = '';
        document.getElementById('pub-edit-id').value = '';
        document.getElementById('pub-title').value = '';
        document.getElementById('pub-type').value = '';
        document.getElementById('pub-status').value = 'Published';
        document.getElementById('pub-desc').value = '';
        document.getElementById('pub-pdf-name').textContent = '';
        document.getElementById('pub-pdf-file').value = '';
        document.getElementById('pubModalTitle').textContent = 'Add Publication';

        if (id) {
            var pub = DataManager.getPublication(id);
            if (pub) {
                document.getElementById('pubModalTitle').textContent = 'Edit Publication';
                document.getElementById('pub-edit-id').value = pub.id;
                document.getElementById('pub-title').value = pub.title || '';
                document.getElementById('pub-type').value = pub.type || '';
                document.getElementById('pub-status').value = pub.status || 'Published';
                document.getElementById('pub-desc').value = pub.description || '';
                if (pub.pdfName) {
                    document.getElementById('pub-pdf-name').textContent = '📎 ' + pub.pdfName;
                    tempPubPdf = pub.pdfUrl;
                    tempPubPdfName = pub.pdfName;
                }
            }
        }

        openModal('pubModal');
    };

    window.previewPubPdf = function (input) {
        if (input.files && input.files[0]) {
            tempPubPdfName = input.files[0].name;
            document.getElementById('pub-pdf-name').textContent = '📎 ' + tempPubPdfName;
            DataManager.fileToBase64(input.files[0]).then(function (base64) {
                tempPubPdf = base64;
            });
        }
    };

    window.savePublicationItem = function () {
        var title = document.getElementById('pub-title').value.trim();
        var type = document.getElementById('pub-type').value.trim();
        if (!title) {
            showToast('Title is required!', 'error');
            return;
        }

        var status = document.getElementById('pub-status').value;
        var pub = {
            id: document.getElementById('pub-edit-id').value || undefined,
            title: title,
            type: type || 'General',
            status: status,
            description: document.getElementById('pub-desc').value.trim(),
            visible: status !== 'Draft',
            pdfUrl: tempPubPdf || '#',
            pdfName: tempPubPdfName || ''
        };

        DataManager.savePublication(pub);
        closeModal('pubModal');
        refreshPubTable();
        refreshDashboard();
        showToast(pub.id ? 'Publication updated!' : 'Publication added!');
    };

    window.deletePubAdmin = function (id) {
        if (confirm('Delete this publication?')) {
            DataManager.deletePublication(id);
            refreshPubTable();
            refreshDashboard();
            showToast('Publication removed.', 'error');
        }
    };

    window.togglePubVisibility = function (id) {
        var result = DataManager.togglePublicationVisibility(id);
        if (result) {
            refreshPubTable();
            showToast('Status changed to: ' + result.status);
        }
    };

    function refreshPubTable() {
        var tbody = document.getElementById('pub-table-body');
        if (!tbody) return;
        var pubs = DataManager.getPublications();

        if (pubs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">No publications. Click "+ Add Publication" to start.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        pubs.forEach(function (p) {
            var statusClass = p.visible ? 'badge-published' : 'badge-draft';
            var statusText = p.status || (p.visible ? 'Published' : 'Draft');
            var toggleBtnClass = p.visible ? 'btn-warning' : 'btn-success';
            var toggleBtnText = p.visible ? 'Hide' : 'Publish';

            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + p.title + '</td>' +
                '<td style="font-size:0.7rem;">' + (p.type || '') + '</td>' +
                '<td><span class="badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td>' + (p.pdfName ? '📎 ' + p.pdfName : '—') + '</td>' +
                '<td class="actions">' +
                '<button class="btn ' + toggleBtnClass + ' btn-sm" onclick="togglePubVisibility(\'' + p.id + '\')">' + toggleBtnText + '</button>' +
                '<button class="btn btn-outline btn-sm" onclick="openPubModal(\'' + p.id + '\')">Edit</button>' +
                '<button class="btn btn-danger btn-sm" onclick="deletePubAdmin(\'' + p.id + '\')">Delete</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    }

    // ─── PRODUCTS MANAGEMENT ─────────────────────────────────────

    window.openProductModal = function (id) {
        tempProductImages = [];
        tempProductPdf = null;
        tempProductPdfName = '';
        document.getElementById('product-edit-id').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-desc').value = '';
        document.getElementById('product-images-preview').innerHTML = '';
        document.getElementById('product-images-file').value = '';
        document.getElementById('product-pdf-name').textContent = '';
        document.getElementById('product-pdf-file').value = '';
        document.getElementById('productModalTitle').textContent = 'Add Product';

        if (id) {
            var product = DataManager.getProduct(id);
            if (product) {
                document.getElementById('productModalTitle').textContent = 'Edit Product';
                document.getElementById('product-edit-id').value = product.id;
                document.getElementById('product-name').value = product.name || '';
                document.getElementById('product-desc').value = product.description || '';
                if (product.images && product.images.length > 0) {
                    tempProductImages = product.images.slice();
                    renderProductImagePreviews();
                }
                if (product.pdfName) {
                    tempProductPdf = product.pdfUrl;
                    tempProductPdfName = product.pdfName;
                    document.getElementById('product-pdf-name').textContent = '📎 ' + product.pdfName;
                }
            }
        }

        openModal('productModal');
    };

    window.previewProductImages = function (input) {
        if (input.files && input.files.length > 0) {
            var promises = [];
            for (var i = 0; i < input.files.length; i++) {
                promises.push(DataManager.fileToBase64(input.files[i]));
            }
            Promise.all(promises).then(function (results) {
                results.forEach(function (base64) {
                    tempProductImages.push(base64);
                });
                renderProductImagePreviews();
            });
        }
    };

    function renderProductImagePreviews() {
        var container = document.getElementById('product-images-preview');
        container.innerHTML = '';
        tempProductImages.forEach(function (img, idx) {
            var item = document.createElement('div');
            item.className = 'preview-item';
            item.innerHTML =
                '<img src="' + img + '" alt="Product Image">' +
                '<button class="remove-preview" onclick="removeProductImage(' + idx + ')">✕</button>';
            container.appendChild(item);
        });
    }

    window.removeProductImage = function (idx) {
        tempProductImages.splice(idx, 1);
        renderProductImagePreviews();
    };

    window.previewProductPdf = function (input) {
        if (input.files && input.files[0]) {
            tempProductPdfName = input.files[0].name;
            document.getElementById('product-pdf-name').textContent = '📎 ' + tempProductPdfName;
            DataManager.fileToBase64(input.files[0]).then(function (base64) {
                tempProductPdf = base64;
            });
        }
    };

    window.saveProductItem = function () {
        var name = document.getElementById('product-name').value.trim();
        var desc = document.getElementById('product-desc').value.trim();
        if (!name) {
            showToast('Product name is required!', 'error');
            return;
        }

        var product = {
            id: document.getElementById('product-edit-id').value || undefined,
            name: name,
            description: desc,
            images: tempProductImages.slice(),
            pdfUrl: tempProductPdf || '#',
            pdfName: tempProductPdfName || ''
        };

        DataManager.saveProduct(product);
        closeModal('productModal');
        refreshProductCards();
        refreshDashboard();
        showToast(product.id ? 'Product updated!' : 'Product added!');
    };

    window.deleteProductAdmin = function (id) {
        if (confirm('Delete this product and all its images?')) {
            DataManager.deleteProduct(id);
            refreshProductCards();
            refreshDashboard();
            showToast('Product removed.', 'error');
        }
    };

    function refreshProductCards() {
        var container = document.getElementById('products-cards-container');
        if (!container) return;
        var products = DataManager.getProducts();

        if (products.length === 0) {
            container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🧪</div><p>No products added yet.</p><button class="btn btn-primary" onclick="openProductModal()">+ Add First Product</button></div>';
            return;
        }

        container.innerHTML = '';
        products.forEach(function (p) {
            var card = document.createElement('div');
            card.className = 'admin-card';

            var imgSrc = (p.images && p.images.length > 0) ? p.images[0] : '';
            var imgHtml = imgSrc ? '<img src="' + imgSrc + '" class="admin-card-img" alt="' + p.name + '">' : '<div class="admin-card-img" style="background:var(--bg-input);display:flex;align-items:center;justify-content:center;color:var(--text-muted);">No Image</div>';

            card.innerHTML =
                imgHtml +
                '<div class="admin-card-body">' +
                '<h4>' + p.name + '</h4>' +
                '<p>' + (p.description ? p.description.substring(0, 100) + '...' : 'No description') + '</p>' +
                '<p style="font-size:0.7rem; color:var(--text-muted);">' + (p.images ? p.images.length : 0) + ' images · ' + (p.pdfName ? '📎 PDF' : 'No PDF') + '</p>' +
                '</div>' +
                '<div class="admin-card-actions">' +
                '<button class="btn btn-outline btn-sm" onclick="openProductModal(\'' + p.id + '\')">Edit</button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteProductAdmin(\'' + p.id + '\')">Delete</button>' +
                '</div>';

            container.appendChild(card);
        });
    }

})();
