import axios from "axios"

export const fetchImageForCategory = async (query: string) => {
    try {
        const response = await axios.get('https:/api.pexels.com/v1/search', {
                    headers: {"Authorization": process.env.PEXELS_API_KEY},
                    params: {query: query, per_page: 1}
        })
        const photo = response.data.photos?.[0]
        if(photo) return photo.url
    } catch (error) {
        console.error("Error fetching category images from pexels: ", error)
    }
    return null
}