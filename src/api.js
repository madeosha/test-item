import axios from 'axios'

const apiUrl = "https://api.github.com";

export const fetchData = async (value, page) => {
    const response = await axios.get(
        `${apiUrl}/search/users?q=${value}&page=${page}`
    );
    return response.data;
}