const swipper1 = document.querySelector('.swiper.catalog1 .swiper-wrapper');
const swipper2 = document.querySelector('.swiper.catalog2 .swiper-wrapper');
const swipper3 = document.querySelector('.swiper.catalog3 .swiper-wrapper');
const search = document.querySelector('.search');
const input = search.querySelector('input');
const button = search.querySelector('button');
const genreList = document.querySelector('.listeGenre');
const genreLinks = genreList.querySelectorAll('li a');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjYmNmYjUwYzI3NjQ1NWE0YjkxNDk4ZDY4YmQ1OTBjYyIsInN1YiI6IjY3MzMzYzA2YjljYmRhYmUyOWMyYzNiMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KHFm4xZD7SuXnmN4ypN7o_9E6nx7WNp1YuE9A8LiBNs';

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
        apiUrl = `https://api.themoviedb.org/3/movie/now_playing?language=fr-FR&page=1`;
    } else {
        apiUrl = `https://api.themoviedb.org/3/discover/movie?language=fr-FR&sort_by=original_title.asc`;
        if (genre) {
            apiUrl += `&with_genres=${genre}`;
        }
    }

    try {
        const callAp = await fetch(apiUrl, { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
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
        .forEach(element => {
            const myFilmCard = document.createElement('div');
            myFilmCard.classList.add('swiper-slide');
                
            const myFilmImg = document.createElement('img');
            myFilmImg.src = `https://image.tmdb.org/t/p/w500${element.poster_path}`;
            myFilmImg.alt = element.title || 'Film image';
                
            myFilmCard.appendChild(myFilmImg);
            swipper.appendChild(myFilmCard);

            // Ajout d'un événement de clic pour ouvrir le pop-up
            myFilmCard.addEventListener('click', () => {
                openModal(element);
            });
        });
};

// Fonction pour ouvrir le pop-up avec le contenu du film
const openModal = (film) => {
    const modal = document.querySelector('.modal');
    const modalImage = modal.querySelector('.mimage');
    const modalTitle = modal.querySelector('.Film');
    const modalRate = modal.querySelector('.rate');
    const modalType = modal.querySelector('.typeFilm');
    const modalSynopsis = modal.querySelector('.sinopsys');

    // Remplir le contenu de la modale avec les données du film
    modalImage.src = `https://image.tmdb.org/t/p/w500${film.poster_path}`;
    modalTitle.textContent = film.title || 'Titre indisponible';
    modalRate.textContent = `Note : ${film.vote_average || 'N/A'}`;
    modalType.textContent = `Genre : ${film.genre_ids.join(', ') || 'N/A'}`;
    modalSynopsis.innerHTML = `<li>${film.overview || 'Synopsis indisponible'}</li>`;

    // Afficher la modale
    modal.style.display = 'flex';
};

// Fermeture de la modale
document.querySelector('.modal .close-btn').addEventListener('click', () => {
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
        loop: true,
        navigation: {
            nextEl: '.custom-button-next',
            prevEl: '.custom-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            600: {
                slidesPerView: 2,
            },
            900: {
                slidesPerView: 3,
            },
            1440: {
                slidesPerView: 5,
            },
            1800: {
                slidesPerView: 6,
            },
            2000: {
                slidesPerView: 8,
            }
        }
    };
    
    new Swiper('.catalog1', swiperSettings);
    new Swiper('.catalog2', swiperSettings);
    new Swiper('.catalog3', swiperSettings);
})();

// Événements pour la recherche
button.addEventListener('click', (event) => {
    event.preventDefault();
    hasSearched = true;
    displayFilms(swipper1);
});

// Écouteur d'événements pour la sélection de genre
genreLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        hasGenreSelected = true;
        const genreId = event.target.id;
        displayFilms(swipper3, genreId);
        genreLinks.forEach(l => l.classList.remove('active'));
        event.target.classList.add('active');
    });
});
