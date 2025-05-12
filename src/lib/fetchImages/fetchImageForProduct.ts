import axios from "axios"

export const fetchImageForProduct = async (query: string) => {
    const API_KEY = process.env.GOOGLE_CUSTOM_SEARCH_API
    const CX = process.env.SEARCH_ENGINE_ID

    try {
        const res = await axios.get("https://customsearch.googleapis.com/customsearch/v1", {
            params: {
                key: API_KEY,
                cx: CX,
                searchType: "image",
                q: query,
                num: 1
            }
        })
        const imageUrl = res.data.items?.[0]?.link
        if(imageUrl) return imageUrl
    } catch (error) {
        console.log("Error fetching product image: ", error)
    }
    return null
}