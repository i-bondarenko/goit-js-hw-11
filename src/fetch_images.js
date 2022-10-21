import axios from 'axios';

const KEY_API = '30262490-03bcd09aff61aef6d7939f62f';
const URL = 'https://pixabay.com/api/';

export const page = 1;
export const per_page = 40;

export async function fetchImages(name, page) {
    const options = {
        params: {
            key: KEY_API,
            q: `${name}`,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            per_page: per_page,
            page: page,
        },
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = await axios.get(URL, options);
    const data = response.data;

    return data;
}