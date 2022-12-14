import { per_page, page, fetchImages } from './fetch_images';
import './css/styles.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

let sumPerPage = 0;
let nextPage = 0;

const formEl = document.querySelector('#search-form');
const inputEl = document.querySelector('input');
const galleryEl = document.querySelector('.gallery');
const btnLoadMoreEl = document.querySelector('.load-more');

formEl.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
    event.preventDefault();
    galleryEl.innerHTML = '';
    sumPerPage = 0;
    btnLoadMoreEl.classList.add('visually-hidden');

    const inputValue = event.currentTarget.elements.safesearch.value.trim();

    try {
        const dataOfImages = await fetchImages(inputValue);
        const arrayImages = dataOfImages.hits;
        const totalQuantityImages = dataOfImages.totalHits;

        if (arrayImages.length === 0) {
            Notiflix.Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.'
            );
        } else if (inputValue === '') {
            return;
        } else {
            Notiflix.Notify.success(
                `Hooray! We found ${totalQuantityImages} images.`,
                {
                    timeout: 3000,
                    position: 'left-top',
                }
            );

            renderPhotoCard(arrayImages);
            const lightbox = new SimpleLightbox('.gallery a', {
                /* options */
            });


            if (totalQuantityImages / per_page <= 1) {
                btnLoadMoreEl.classList.add('visually-hidden');
                return;
            }

            sumPerPage = per_page;
            nextPage = page;

            btnLoadMoreEl.classList.remove('visually-hidden');

            btnLoadMoreEl.addEventListener('click', onbtnLoadMoreEl);
        }
    } catch (error) {
        console.log(error.message);
    }
}

async function onbtnLoadMoreEl() {
    const dataInput = inputEl.value;

    nextPage += page;
    sumPerPage += per_page;

    btnLoadMoreEl.classList.add('visually-hidden');

    try {
        const newPagedataOfImages = await fetchImages(dataInput, nextPage);
        const newArrayImages = newPagedataOfImages.hits;
        const maxQuantityImages = newPagedataOfImages.totalHits;

        if (maxQuantityImages <= sumPerPage) {
            Notiflix.Notify.info(
                "We're sorry, but you've reached the end of search results."
            );

            renderMarkupAndSmoothScroll(newArrayImages);

            btnLoadMoreEl.classList.add('visually-hidden');
            btnLoadMoreEl.removeEventListener('click', onbtnLoadMoreEl);

            return;
        }

        renderMarkupAndSmoothScroll(newArrayImages);

        btnLoadMoreEl.classList.remove('visually-hidden');
    } catch (error) {
        console.log(error.message);
    }
}

function renderPhotoCard(arrayImages) {
    const markup = arrayImages
        .map(img => {
            const {
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            } = img;

            return `<div class="photo-card">
      <a class='link' href="${largeImageURL}">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" width='200' height='140' />
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
  </div>
      </a>
  </div>`;
        })
        .join('');

    galleryEl.insertAdjacentHTML('beforeend', markup);
}

function smoothScroll() {
    const positionCardToScroll =
        galleryEl.firstElementChild.getBoundingClientRect().height;

    window.scrollBy({
        top: positionCardToScroll * 2,
        behavior: 'smooth',
    });
}

function renderMarkupAndSmoothScroll(newArrayImages) {
    renderPhotoCard(newArrayImages);
    smoothScroll();

    const gallery = new SimpleLightbox('.gallery a');
    gallery.refresh();
}