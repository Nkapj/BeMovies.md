const swipper2 = document.querySelector('.swiper-container.catalog1 .swiper-wrapper'); // Sélection du swiper
const search = document.querySelector('.search');
const input = search.querySelector('input');
const button = search.querySelector('button');
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjYmNmYjUwYzI3NjQ1NWE0YjkxNDk4ZDY4YmQ1OTBjYyIsIm5iZiI6MTczMTQxMTI1Mi40ODk2MjgsInN1YiI6IjY3MzMzYzA2YjljYmRhYmUyOWMyYzNiMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.__psBxbcgVv5CNrhMA-YI9olUc3vCyIzpCmWJaAwBro'; // Token d'authentification

// Fonction pour appeler l'API
const searchFilm = async () => { 
    const apiUrl = `https://api.themoviedb.org/3/search/collection?query=${input.value}`; // Mettre à jour l'URL API à chaque appel
    try {
        const callAp = await fetch(apiUrl, { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Intégration du token dans l’en-tête Authorization
                'Content-Type': 'application/json'
            }
        });
        
        if (!callAp.ok) {
            throw new Error('Erreur dans la requête API');
        }
        
        const searchedFilms = await callAp.json();
        console.log(searchedFilms);
        return searchedFilms;
    } catch (error) {
        console.error('Erreur:', error);
    }
};

// Fonction pour afficher les films dans le swiper
const displayFilms = async () => {
    const searchedFilms = await searchFilm();
    if (!searchedFilms || !searchedFilms.results) {
        console.error('Aucun film trouvé');
        return;
    }
    
    // Vider le swiper avant d'ajouter de nouveaux films
    swipper2.innerHTML = '';

    searchedFilms.results.forEach(element => {
        const myFilmCard = document.createElement('div');
        myFilmCard.classList.add('swiper-slide'); // Ajout de la classe
            
        const myFilmImg = document.createElement('img'); // Ajout de l'image
        myFilmImg.src = `https://image.tmdb.org/t/p/w500${element["poster_path"]}`; // Ajout de l'URL complète
        myFilmImg.alt = element.title || 'Film image'; // Ajout d'un texte alternatif
            
        myFilmCard.appendChild(myFilmImg);
        swipper2.appendChild(myFilmCard);
    });
    
    input.value = ""; // Vider le champ de recherche
};

// Ajouter un écouteur d'événements pour le clic du bouton
button.addEventListener('click', displayFilms);