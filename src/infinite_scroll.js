import { per_page, page, fetchImages } from './fetch_images';
import './css/styles.css';
import Notiflix from 'notiflix';

import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

let sumPerPage = 0;
let nextPage = 0;

let isLoading = false;

let shouldLoad = true;

const formEl = document.querySelector('#search-form');
const inputEl = document.querySelector('input');
const galleryEl = document.querySelector('.gallery');

formEl.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
    event.preventDefault();
    galleryEl.innerHTML = '';
    isLoading = false;
    shouldLoad = true;

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

            sumPerPage = per_page;
            nextPage = page;

            window.addEventListener('scroll', throttle(checkPosition, 250));
            window.addEventListener('resize', throttle(checkPosition, 250));
        }
    } catch (error) {
        console.log(error.message);
    }
}

async function fetchNewPageImagesWithScroll() {
    const dataInput = inputEl.value;

    try {

        if (isLoading || !shouldLoad) {
            return;
        }

        isLoading = true;

        nextPage += page;
        sumPerPage += per_page;

        const newPagedataOfImages = await fetchImages(dataInput, nextPage);
        const newArrayImages = newPagedataOfImages.hits;
        const maxQuantityImages = newPagedataOfImages.totalHits;

        if (maxQuantityImages <= sumPerPage) {
            Notiflix.Notify.info(
                "We're sorry, but you've reached the end of search results."
            );

            renderMarkupAndSmoothScroll(newArrayImages);

            window.removeEventListener('scroll', throttle(checkPosition, 250));
            window.removeEventListener('resize', throttle(checkPosition, 250));

            shouldLoad = false;

            return;
        }

        renderMarkupAndSmoothScroll(newArrayImages);

        isLoading = false;
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

async function checkPosition() {
    const height = document.body.offsetHeight;
    const screenHeight = window.innerHeight;

    const scrolled = window.scrollY;

    const threshold = height - screenHeight / 4;

    const position = scrolled + screenHeight;

    if (position >= threshold) {


        try {
            await fetchNewPageImagesWithScroll();
        } catch (error) {
            console.log(error.message);
        }
    }
}

function renderMarkupAndSmoothScroll(newArrayImages) {
    renderPhotoCard(newArrayImages);

    const gallery = new SimpleLightbox('.gallery a');
}

