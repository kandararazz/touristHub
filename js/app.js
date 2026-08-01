/**
 * TouristHub - Created By Raza
 * Main Application Logic, 500+ Attractions & Interactive Reviews
 */

document.addEventListener('DOMContentLoaded', () => {
  let attractions = [];
  let filteredAttractions = [];
  let favorites = JSON.parse(localStorage.getItem('touristhub_favorites') || '[]');
  let customReviews = JSON.parse(localStorage.getItem('touristhub_custom_reviews') || '{}');

  let activeCategory = 'All';
  let activeEmirate = 'All';
  let activeSort = 'rating';
  let searchQuery = '';
  let activeView = 'grid';
  let activeAttractionForReview = null;
  let selectedReviewRating = 5;

  let modalMap = null;
  let modalMarker = null;
  let fullMap = null;
  let fullMapMarkers = [];

  const categoryFallbackImages = {
    "Modern Architecture": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    "Historical Site": "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=800&q=80",
    "Museum & Art": "https://images.unsplash.com/photo-1650390192534-118fa30026db?auto=format&fit=crop&w=800&q=80",
    "Nature & Outdoors": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "Beach & Waterfront": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "Culture & Entertainment": "https://images.unsplash.com/photo-1578895210405-907db48a7812?auto=format&fit=crop&w=800&q=80",
    "Theme Park": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
  };

  const gridContainer = document.getElementById('attractions-grid');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const emirateSelect = document.getElementById('emirate-filter');
  const sortSelect = document.getElementById('sort-filter');
  const categoryPillsContainer = document.getElementById('category-pills');
  const resultsCountEl = document.getElementById('results-count');
  const favCounterEl = document.getElementById('fav-counter');
  const viewGridBtn = document.getElementById('view-grid-btn');
  const viewMapBtn = document.getElementById('view-map-btn');
  const fullMapSection = document.getElementById('full-map-section');

  const modalOverlay = document.getElementById('map-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalBadge = document.getElementById('modal-badge');
  const modalAddress = document.getElementById('modal-address');
  const modalDescription = document.getElementById('modal-description');
  const modalHighlights = document.getElementById('modal-highlights');
  const modalGoogleLink = document.getElementById('modal-google-link');
  const modalReviewsList = document.getElementById('modal-reviews-list');
  const reviewNameInput = document.getElementById('review-author-input');
  const reviewCommentInput = document.getElementById('review-comment-input');
  const submitReviewBtn = document.getElementById('submit-review-btn');
  const starRatingBox = document.getElementById('star-rating-box');

  const aiTriggerBtn = document.getElementById('ai-trigger-btn');
  const aiDrawer = document.getElementById('ai-chat-drawer');
  const aiCloseBtn = document.getElementById('ai-close-btn');
  const aiChatBody = document.getElementById('ai-chat-body');
  const aiInput = document.getElementById('ai-input');
  const aiSendBtn = document.getElementById('ai-send-btn');

  async function initApp() {
    try {
      const response = await fetch('./data/attractions.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      attractions = await response.json();
      
      attractions.forEach(item => {
        if (customReviews[item.id]) {
          item.userReviews = [...(item.userReviews || []), ...customReviews[item.id]];
        }
      });

      filteredAttractions = [...attractions];
      
      updateFavoritesCounter();
      renderCategoryPills();
      applyFilters();
      setupEventListeners();
      setupAIAssistant();
      setupReviewStarSelection();
    } catch (error) {
      console.error('Error loading dataset:', error);
      gridContainer.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
          <i class="ri-error-warning-line" style="font-size: 3rem; color: #f43f5e;"></i>
          <h3 style="margin-top: 1rem;">Failed to load tourist attractions</h3>
          <p>Please check your connection or local server configuration.</p>
        </div>
      `;
    }
  }

  function renderCategoryPills() {
    const categories = ['All', ...new Set(attractions.map(item => item.category))];
    categoryPillsContainer.innerHTML = categories.map(cat => `
      <button class="pill-btn ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
        ${cat === 'All' ? '<i class="ri-apps-2-line"></i>' : ''} ${cat}
      </button>
    `).join('');

    categoryPillsContainer.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.currentTarget.dataset.category;
        categoryPillsContainer.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        applyFilters();
      });
    });
  }

  function applyFilters() {
    filteredAttractions = attractions.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery) ||
        item.emirate.toLowerCase().includes(searchQuery) ||
        item.category.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery);

      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesEmirate = activeEmirate === 'All' || item.emirate === activeEmirate;

      return matchesSearch && matchesCategory && matchesEmirate;
    });

    filteredAttractions.sort((a, b) => {
      if (activeSort === 'rating') return b.rating - a.rating;
      if (activeSort === 'reviews') {
        const parseReviews = str => parseInt(str.replace(/,/g, '')) || 0;
        return parseReviews(b.reviews) - parseReviews(a.reviews);
      }
      if (activeSort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    renderGrid();
    updateResultsCount();

    if (activeView === 'map') {
      updateFullMapView();
    }
  }

  function renderGrid() {
    if (filteredAttractions.length === 0) {
      gridContainer.innerHTML = `
        <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-light);">
          <div style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 1rem;"><i class="ri-search-eye-line"></i></div>
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.4rem; color: var(--text-heading); margin-bottom: 0.5rem;">No Attractions Found</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">We couldn't find any places matching your current search or filters.</p>
          <button class="pill-btn active" id="reset-filters-btn" style="display: inline-flex; margin: 0 auto;">Reset All Filters</button>
        </div>
      `;
      document.getElementById('reset-filters-btn')?.addEventListener('click', resetFilters);
      return;
    }

    gridContainer.innerHTML = filteredAttractions.map(item => {
      const isFav = favorites.includes(item.id);
      const totalReviewsCount = (item.userReviews ? item.userReviews.length : 0);
      const fallbackImg = categoryFallbackImages[item.category] || categoryFallbackImages["Modern Architecture"];

      return `
        <article class="card" data-id="${item.id}">
          <div class="card-media">
            <img src="${item.imageUrl}" alt="${item.name}" class="card-img" loading="lazy" onError="this.onerror=null;this.src='${fallbackImg}';" />
            
            <div class="card-top-badges">
              <span class="card-badge">${item.tag}</span>
            </div>

            <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${item.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              <i class="${isFav ? 'ri-heart-3-fill' : 'ri-heart-3-line'}"></i>
            </button>

            <span class="card-emirate-tag">
              <i class="ri-map-pin-2-fill"></i> ${item.emirate}
            </span>

            <span class="entry-fee-tag">
              <i class="ri-ticket-2-fill"></i> ${item.entryFee}
            </span>
          </div>

          <div class="card-content">
            <div class="card-meta">
              <span class="category-tag">${item.category}</span>
              <div class="rating-badge">
                <i class="ri-star-fill"></i> ${item.rating} (${totalReviewsCount > 0 ? totalReviewsCount + ' reviews' : item.reviews})
              </div>
            </div>

            <h3 class="card-title">${item.name}</h3>
            <p class="card-description">${item.description}</p>

            <div class="card-actions">
              <button class="btn-view-map btn-open-modal" data-id="${item.id}">
                <i class="ri-map-pin-line"></i> View & Reviews
              </button>
              
              <a href="${item.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-external-link" title="Open directly in Google Maps">
                <i class="ri-external-link-line"></i>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    gridContainer.querySelectorAll('.btn-open-modal').forEach(btn => {
      btn.addEventListener('click', (e) => openMapModal(e.currentTarget.dataset.id));
    });

    gridContainer.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => toggleFavorite(e.currentTarget.dataset.id));
    });
  }

  function openMapModal(id) {
    const attraction = attractions.find(item => item.id === id);
    if (!attraction) return;

    activeAttractionForReview = attraction;
    modalTitle.textContent = attraction.name;
    modalBadge.textContent = `${attraction.emirate} • ${attraction.entryFee}`;
    modalAddress.innerHTML = `<i class="ri-map-pin-2-line"></i> ${attraction.address}`;
    modalDescription.textContent = attraction.description;
    
    modalHighlights.innerHTML = attraction.highlights.map(h => `
      <span class="highlight-chip"><i class="ri-checkbox-circle-line"></i> ${h}</span>
    `).join('');

    renderModalReviews(attraction);
    modalGoogleLink.href = attraction.googleMapsUrl;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (!modalMap) {
        modalMap = L.map('modal-map').setView([attraction.latitude, attraction.longitude], 14);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(modalMap);

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background:#0284c7; color:#fff; width:36px; height:36px; border-radius:50%; display:grid; place-items:center; box-shadow:0 0 15px rgba(2,132,199,0.6); border:2px solid #fff;"><i class="ri-map-pin-fill" style="font-size:1.2rem;"></i></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        modalMarker = L.marker([attraction.latitude, attraction.longitude], { icon: customIcon }).addTo(modalMap);
      } else {
        modalMap.invalidateSize();
        modalMap.setView([attraction.latitude, attraction.longitude], 14);
        modalMarker.setLatLng([attraction.latitude, attraction.longitude]);
      }

      modalMarker.bindPopup(`
        <div style="text-align:center; padding: 4px;">
          <strong style="color:#fff; font-size:1rem;">${attraction.name}</strong><br>
          <span style="color:#38bdf8; font-size:0.8rem;">★ ${attraction.rating} • ${attraction.entryFee}</span>
        </div>
      `).openPopup();
    }, 200);
  }

  function renderModalReviews(attraction) {
    const reviews = attraction.userReviews || [];
    if (reviews.length === 0) {
      modalReviewsList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">No reviews yet. Be the first to add a review below!</p>`;
      return;
    }

    modalReviewsList.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <span class="review-author">${r.author}</span>
          <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        </div>
        <div class="review-comment">${r.comment}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">${r.date || 'Recent'}</div>
      </div>
    `).join('');
  }

  function setupReviewStarSelection() {
    starRatingBox.querySelectorAll('i').forEach(star => {
      star.addEventListener('click', (e) => {
        const val = parseInt(e.target.dataset.value);
        selectedReviewRating = val;
        starRatingBox.querySelectorAll('i').forEach((s, idx) => {
          if (idx < val) {
            s.className = 'ri-star-fill';
          } else {
            s.className = 'ri-star-line';
          }
        });
      });
    });

    submitReviewBtn.addEventListener('click', () => {
      if (!activeAttractionForReview) return;
      const author = reviewNameInput.value.trim() || 'Anonymous Traveler';
      const comment = reviewCommentInput.value.trim();

      if (!comment) {
        alert('Please enter a review comment!');
        return;
      }

      const newReview = {
        author,
        rating: selectedReviewRating,
        comment,
        date: new Date().toISOString().split('T')[0]
      };

      if (!activeAttractionForReview.userReviews) {
        activeAttractionForReview.userReviews = [];
      }
      activeAttractionForReview.userReviews.unshift(newReview);

      if (!customReviews[activeAttractionForReview.id]) {
        customReviews[activeAttractionForReview.id] = [];
      }
      customReviews[activeAttractionForReview.id].unshift(newReview);
      localStorage.setItem('touristhub_custom_reviews', JSON.stringify(customReviews));

      reviewCommentInput.value = '';
      reviewNameInput.value = '';
      renderModalReviews(activeAttractionForReview);
      renderGrid();
    });
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter(favId => favId !== id);
    } else {
      favorites.push(id);
    }
    localStorage.setItem('touristhub_favorites', JSON.stringify(favorites));
    updateFavoritesCounter();
    renderGrid();
  }

  function updateFavoritesCounter() {
    favCounterEl.textContent = favorites.length;
  }

  function updateResultsCount() {
    resultsCountEl.innerHTML = `Showing <strong>${filteredAttractions.length}</strong> of <strong>${attractions.length}</strong> tourist attractions`;
  }

  function resetFilters() {
    searchQuery = '';
    activeCategory = 'All';
    activeEmirate = 'All';
    activeSort = 'rating';

    searchInput.value = '';
    emirateSelect.value = 'All';
    sortSelect.value = 'rating';
    clearSearchBtn.style.display = 'none';

    renderCategoryPills();
    applyFilters();
  }

  function updateFullMapView() {
    if (!fullMap) {
      fullMap = L.map('map-container').setView([25.0, 55.0], 8);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(fullMap);
    }

    fullMapMarkers.forEach(m => fullMap.removeLayer(m));
    fullMapMarkers = [];

    const bounds = L.latLngBounds();

    filteredAttractions.forEach(item => {
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background: #0284c7; color: #fff; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; box-shadow: 0 0 12px rgba(2,132,199,0.5); border: 2px solid #fff;"><i class="ri-map-pin-fill"></i></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon })
        .addTo(fullMap)
        .bindPopup(`
          <div style="padding: 4px; max-width: 200px;">
            <strong style="color:#fff; font-size: 0.95rem;">${item.name}</strong>
            <p style="font-size: 0.75rem; color:#9ca3af; margin: 4px 0;">${item.emirate} • ${item.entryFee}</p>
            <button onclick="document.dispatchEvent(new CustomEvent('open-modal-event', {detail: '${item.id}'}))" style="background:#38bdf8; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer; width:100%;">View Details</button>
          </div>
        `);

      fullMapMarkers.push(marker);
      bounds.extend([item.latitude, item.longitude]);
    });

    if (filteredAttractions.length > 0) {
      fullMap.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  document.addEventListener('open-modal-event', (e) => openMapModal(e.detail));

  function setupAIAssistant() {
    aiTriggerBtn.addEventListener('click', () => aiDrawer.classList.toggle('active'));
    aiCloseBtn.addEventListener('click', () => aiDrawer.classList.remove('active'));

    aiSendBtn.addEventListener('click', handleUserAISubmit);
    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleUserAISubmit();
    });

    document.querySelectorAll('.ai-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const query = e.target.textContent.replace(/^[✨🔥🌙🎟️📍]\s*/, '');
        aiInput.value = query;
        handleUserAISubmit();
      });
    });
  }

  function handleUserAISubmit() {
    const query = aiInput.value.trim();
    if (!query) return;

    appendAIMessage(query, 'user');
    aiInput.value = '';

    setTimeout(() => {
      const response = generateAIRecommendation(query.toLowerCase());
      appendAIMessage(response.text, 'bot', response.places);
    }, 450);
  }

  function appendAIMessage(text, sender, places = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ${sender}`;
    
    let html = `<div>${text}</div>`;

    if (places && places.length > 0) {
      html += `<div style="margin-top: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem;">`;
      places.forEach(place => {
        html += `
          <button onclick="document.dispatchEvent(new CustomEvent('open-modal-event', {detail: '${place.id}'}))" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 0.4rem 0.65rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer; text-align: left; display: flex; justify-content: space-between; align-items: center;">
            <span>📍 ${place.name} (${place.emirate})</span>
            <span style="color: #fbbf24;">${place.entryFee}</span>
          </button>
        `;
      });
      html += `</div>`;
    }

    msgDiv.innerHTML = html;
    aiChatBody.appendChild(msgDiv);
    aiChatBody.scrollTop = aiChatBody.scrollHeight;
  }

  function generateAIRecommendation(q) {
    let matched = [];
    let replyText = "";

    if (q.includes("3 hour") || q.includes("afternoon") || q.includes("quick")) {
      matched = attractions.slice(0, 3);
      replyText = "Here are 3 excellent spots perfect for a 2-3 hour afternoon visit:";
    } else if (q.includes("free") || q.includes("cheap") || q.includes("budget")) {
      matched = attractions.filter(a => a.entryFee.toLowerCase().includes("free")).slice(0, 4);
      replyText = "Here are top places with Free Entry across the UAE:";
    } else if (q.includes("abu dhabi")) {
      matched = attractions.filter(a => a.emirate === "Abu Dhabi").slice(0, 4);
      replyText = "Top recommended attractions in Abu Dhabi:";
    } else if (q.includes("dubai")) {
      matched = attractions.filter(a => a.emirate === "Dubai").slice(0, 4);
      replyText = "Iconic highlights you must see in Dubai:";
    } else {
      matched = attractions.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.category.toLowerCase().includes(q) || 
        a.description.toLowerCase().includes(q)
      ).slice(0, 3);

      if (matched.length === 0) {
        matched = attractions.slice(0, 3);
        replyText = "I highly recommend these top UAE attractions:";
      } else {
        replyText = `Based on your request "${q}", here are my top picks:`;
      }
    }

    return { text: replyText, places: matched };
  }

  function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      applyFilters();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      applyFilters();
    });

    emirateSelect.addEventListener('change', (e) => {
      activeEmirate = e.target.value;
      applyFilters();
    });

    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      applyFilters();
    });

    viewGridBtn.addEventListener('click', () => {
      activeView = 'grid';
      viewGridBtn.classList.add('active');
      viewMapBtn.classList.remove('active');
      gridContainer.style.display = 'grid';
      fullMapSection.classList.remove('active');
    });

    viewMapBtn.addEventListener('click', () => {
      activeView = 'map';
      viewMapBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      gridContainer.style.display = 'none';
      fullMapSection.classList.add('active');
      setTimeout(() => {
        updateFullMapView();
        fullMap.invalidateSize();
      }, 100);
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    });
  }

  initApp();
});
