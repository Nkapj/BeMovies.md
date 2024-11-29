const swipper1 = document.querySelector('.swiper.catalog1 .swiper-wrapper');
const swipper2 = document.querySelector('.swiper.catalog2 .swiper-wrapper');
const swipper3 = document.querySelector('.swiper.catalog3 .swiper-wrapper');
const search = document.querySelector('.search');
const input = search.querySelector('input');
const button = search.querySelector('button');
const genreList = document.querySelector('.listeGenre');
const genreLinks = genreList.querySelectorAll('li a');
const signLink = document.querySelector('.signLink');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjYmNmYjUwYzI3NjQ1NWE0YjkxNDk4ZDY4YmQ1OTBjYyIsIm5iZiI6MTczMTU4NDI5Mi44NjUxMzg4LCJzdWIiOiI2NzMzM2MwNmI5Y2JkYWJlMjljMmMzYjMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.kgbG2Nuddero3_Fm5zPKBFy0Ff6_2X6B45O4SEx5qis';

const legenre = document.querySelector(".legenre");
const results = document.querySelector(".results");

let hasSearched = false;
let hasGenreSelected = false;

const searchFilm = async (swipper, genre = null) => {
    let apiUrl;
    if (swipper === swipper1 && !hasSearched) {
        apiUrl = `https://api.themoviedb.org/3/movie/now_playing?language=fr-FR&page=1`;
    } else if (swipper === swipper1) {
        apiUrl = `https://api.themoviedb.org/3/search/collection?query=${input.value}`;
    } else if (swipper === swipper2) {
        apiUrl = `https://api.themoviedb.org/3/movie/now_playing?language=fr-FR&page=1`;
    } else if (swipper === swipper3 && !hasGenreSelected) {
        apiUrl = `https://api.themoviedb.org/3/discover/movie?language=fr-FR&sort_by=original_title.asc&with_genres=35`;
    } else {
        apiUrl = `https://api.themoviedb.org/3/discover/movie?language=fr-FR&sort_by=original_title.asc`;
        if (genre) {
            apiUrl += `&with_genres=${genre}`;
        }
    }
    results.innerHTML= `Result for: ${input.value}`;

    try {
        const callAp = await fetch(apiUrl, { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${await token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!callAp.ok) {
            throw new Error('Erreur dans la requête API');
        }
        
        const searchedFilms = await callAp.json();
        return searchedFilms;
    } catch (error) {
        console.error('Erreur:', error);
    }
};

const displayFilms = async (swipper, genre = null) => {
    const searchedFilms = await searchFilm(swipper, genre);
    if (!searchedFilms || !searchedFilms.results) {
        console.error('Aucun film trouvé');
        return;
    }

    swipper.innerHTML = '';

    searchedFilms.results
        .filter(element => element.poster_path !== null && element.poster_path !== undefined)
        .forEach( async element => {
            const myFilmCard = document.createElement('div');
            myFilmCard.classList.add('swiper-slide');
                
            const cardContainer = document.createElement('div');
            cardContainer.classList.add('card-container');
            
            const myFilmImg = document.createElement('img');
            myFilmImg.src = `https://image.tmdb.org/t/p/w500${element.poster_path}`;
            myFilmImg.alt = element.title || 'Film image';
            

             // Récupérer les genres pour ce film
            const genreNames = await fetchGenreNames(element.genre_ids);

            const hoverInfo = document.createElement('div');
            hoverInfo.classList.add('hover-info');
            hoverInfo.innerHTML = `
                <h3>${element.title || 'Titre indisponible'}</h3>
                <p style="font-size: 25px;"><strong></strong> ${element.release_date.slice(0,4) || 'Non disponible'}</p>
                <p class="genres" style="font-size: 10px;">${genreNames.map(genre => genre.toUpperCase()).join(' / ') || 'Non disponible'}</p>
                <p class="rate" style="color: red; font-weight: bold; font-size: 30px;">${element.vote_average || 'N/A'}/10</p>
            `;
            
            cardContainer.appendChild(myFilmImg);
            cardContainer.appendChild(hoverInfo);
            myFilmCard.appendChild(cardContainer);
            swipper.appendChild(myFilmCard);
            myFilmCard.addEventListener('click', () => {
                openModal(element);
            });
        });
};

// Fonction pour récupérer les noms des genres
const fetchGenreNames = async (genreIds) => {
    try {
        const response = await fetch('https://api.themoviedb.org/3/genre/movie/list?language=fr-FR', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Erreur lors de la récupération des genres');
        
        const data = await response.json();
        return genreIds.map(id => {
            const genre = data.genres.find(g => g.id === id);
            return genre ? genre.name : '';
        }).filter(name => name !== '');
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
};

// Fonction pour ouvrir le pop-up avec le contenu du film
const openModal = async (film) => {
    const modal = document.querySelector('.modal');
    const modalImage = modal.querySelector('.mimage');
    const modalTitle = modal.querySelector('.Film');
    const modalRate = modal.querySelector('.rate');
    const modalType = modal.querySelector('.typeFilm');
    const modalSynopsis = modal.querySelector('.sinopsys');
    const MC = document.querySelector('.MC');

    // Nettoyer les anciennes dates avant d'en ajouter une nouvelle
    const oldDates = modal.querySelectorAll('.movie-date');
    oldDates.forEach(date => date.remove());
    // Remplir le contenu de base de la modale
    modalImage.src = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
    // Style du titre en rouge
    modalTitle.style.color = 'red';
    modalTitle.textContent = film.title || 'Titre indisponible';
    
    // Ajouter l'année sous le titre avec une classe spécifique
    const dateElement = document.createElement('div');
    dateElement.className = 'movie-date';
    dateElement.style.marginTop = '10px';
    dateElement.style.marginBottom = '10px';
    dateElement.textContent = film.release_date?.slice(0,4) || 'Non disponible';
    
    // Insérer la date après le titre
    modalTitle.after(dateElement);

    // Note avec étoile
    modalRate.innerHTML = `${film.vote_average || 'N/A'}`;

    try {
        // Afficher les genres en majuscules
        const genreNames = await fetchGenreNames(film.genre_ids);
        modalType.innerHTML = `${genreNames.map(genre => genre.toUpperCase()).join(' / ') || 'NON DISPONIBLE'}`;

        // Requête pour obtenir le casting
        const castResponse = await fetch(`https://api.themoviedb.org/3/movie/${film.id}/credits`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!castResponse.ok) throw new Error('Erreur lors de la récupération du casting');
        
        const castData = await castResponse.json();
        
        // Créer ou mettre à jour la section casting
        let castingSection = modal.querySelector('.casting');
        if (!castingSection) {
            castingSection = document.createElement('div');
            castingSection.classList.add('casting');
            modalSynopsis.after(castingSection);
        }

        // Afficher le casting avec "CAST : "
        castingSection.innerHTML = `<p style="margin-top: 20px;">CAST : ${castData.cast.slice(0, 4).map(actor => actor.name).join(', ')}</p>`;
    } catch (error) {
        console.error('Erreur:', error);
    }

    // Afficher le synopsis sans puce
    modalSynopsis.innerHTML = `<p>${film.overview || 'Synopsis indisponible'}</p>`;

    // Afficher la modale
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    if (window.innerWidth < 765) {
        MC.style.flexDirection = 'column';
        MC.style.overflow = 'auto';
    }
};







signLink.addEventListener('click', () => {
    document.querySelector('.modalSign').style.display = 'block';
});

// Fermeture de la modale
document.querySelector('.close-btn').addEventListener('click', () => {
    document.querySelector('.modalSign').style.display = 'none';
});
document.querySelector('.modal .close-btn1').addEventListener('click', () => {
    document.querySelector('.modal').style.display = 'none';
});

// Chargement initial des films pour chaque Swiper
(async () => {
    await displayFilms(swipper1);
    await displayFilms(swipper2);
    await displayFilms(swipper3);

    // Initialisation des Swipers après le chargement des films
    const swiperSettings = {
        slidesPerView: 1,
        slidesPerGroup: 1,
        fixedHeight: "230px",
        loop: true,
        navigation: {
            nextEl: '.custom-button-next',
            prevEl: '.custom-button-prev',
        },
        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            900: {
                slidesPerView: 3,
            },
            1440: {
                slidesPerView: 4,
            },
            1800: {
                slidesPerView: 4,
            },
            2000: {
                slidesPerView: 5,
            }
        }
    };
    
    new Swiper('.catalog1', swiperSettings);
    new Swiper('.catalog2', swiperSettings);
    new Swiper('.catalog3', swiperSettings);
})();

// Événements pour la recherche
button.addEventListener('click', async (event) => {
    event.preventDefault();
    hasSearched = true;
    await displayFilms(swipper1);
});

// Écouteur d'événements pour la sélection de genre
genreLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        hasGenreSelected = true;
        const genreId = event.target.id;
        legenre.innerHTML = link.innerText;
        displayFilms(swipper3, genreId);
        genreLinks.forEach(l => l.classList.remove('active'));
        event.target.classList.add('active');
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth < 600 || (window.innerWidth >= 600 && window.innerWidth < 900) || (window.innerWidth >= 900 && window.innerWidth < 1440) || (window.innerWidth >= 1440 && window.innerWidth < 1800) || window.innerWidth >= 1800) {
        location.reload();
    }
});