# ตัวอย่างการใช้งาน 
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination',
  params: {query: 'man'},
  headers: {
    'x-rapidapi-key': '554d58f9camsh3e8d343e5db1ccep163327jsn553f0f626807',
    'x-rapidapi-host': 'booking-com15.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();

# ตัวอย่าง Response จริง
{
  "status": true,
  "message": "Success",
  "timestamp": 1757830468022,
  "data": [
    {
      "dest_id": "13150272",
      "search_type": "hotel",
      "dest_type": "hotel",
      "latitude": 16.46424,
      "type": "ho",
      "lc": "en",
      "name": "โรงแรมเกิดมานอน ขอนแก่น",
      "nr_hotels": 1,
      "cc1": "th",
      "country": "Thailand",
      "region": "Khon Kaen Province",
      "hotels": 1,
      "roundtrip": "GhBhMGIxMmJlMTg5ZTIwMzdmIAAoATICZW46FeC4guC4reC4meC5geC4geC5iOC4mUAASgBQAA==",
      "image_url": "https://cf.bstatic.com/xdata/images/hotel/150x150/617928228.jpg?k=1976ddcbbeb0dd3da224a476fa1753c3b73179424188606cfc675b206247e73d&o=",
      "city_name": "Khon Kaen",
      "longitude": 102.82384,
      "city_ufi": -3249423,
      "label": "โรงแรมเกิดมานอน ขอนแก่น, Khon Kaen, Khon Kaen Province, Thailand"
    },
    {
      "dest_id": "10029324",
      "search_type": "hotel",
      "type": "ho",
      "lc": "en",
      "nr_hotels": 1,
      "name": "คานาโฮมฮัก ขอนแก่น",
      "dest_type": "hotel",
      "latitude": 16.497122,
      "hotels": 1,
      "country": "Thailand",
      "cc1": "th",
      "region": "Khon Kaen Province",
      "city_name": "Ban Tao No",
      "roundtrip": "GhBhMGIxMmJlMTg5ZTIwMzdmIAEoATICZW46FeC4guC4reC4meC5geC4geC5iOC4mUAASgBQAA==",
      "image_url": "https://cf.bstatic.com/xdata/images/hotel/150x150/456795966.jpg?k=11de5967e2d280b12ce8c0dfe720a91866bb4f78a90794169d3565254439a96b&o=",
      "longitude": 102.84285,
      "city_ufi": -3408211,
      "label": "คานาโฮมฮัก ขอนแก่น, Ban Tao No, Khon Kaen Province, Thailand"
    },
    {
      "dest_id": "3972469",
      "search_type": "hotel",
      "image_url": "https://cf.bstatic.com/xdata/images/hotel/150x150/422139763.jpg?k=07617aef6fc888315fc1b42aeedff069a20552b8c78ac57a2491741f029e3b90&o=",
      "roundtrip": "GhBhMGIxMmJlMTg5ZTIwMzdmIAIoATICZW46FeC4guC4reC4meC5geC4geC5iOC4mUAASgBQAA==",
      "city_name": "Ban Nong Waeng",
      "label": "อารมย์ดี อพาทเม้นท์ ขอนแก่น, Ban Nong Waeng, Khon Kaen Province, Thailand",
      "longitude": 102.83377,
      "city_ufi": -3405455,
      "latitude": 16.46618,
      "dest_type": "hotel",
      "name": "อารมย์ดี อพาทเม้นท์ ขอนแก่น",
      "nr_hotels": 1,
      "lc": "en",
      "type": "ho",
      "region": "Khon Kaen Province",
      "country": "Thailand",
      "cc1": "th",
      "hotels": 1
    },
    {
      "dest_id": "12011232",
      "search_type": "hotel",
      "label": "DM ขอนแก่น โรงพยาบาลศรีนครินทร์ มข, Ban Nong Waeng, Khon Kaen Province, Thailand",
      "longitude": 102.83626,
      "city_ufi": -3405455,
      "city_name": "Ban Nong Waeng",
      "image_url": "https://cf.bstatic.com/xdata/images/hotel/150x150/554625233.jpg?k=fbe6d7a26bb94396499f94ca0f60cb6f74f1c57f2ecf409406f007b72ce810f0&o=",
      "roundtrip": "GhBhMGIxMmJlMTg5ZTIwMzdmIAMoATICZW46FeC4guC4reC4meC5geC4geC5iOC4mUAASgBQAA==",
      "hotels": 1,
      "region": "Khon Kaen Province",
      "country": "Thailand",
      "cc1": "th",
      "lc": "en",
      "name": "DM ขอนแก่น โรงพยาบาลศรีนครินทร์ มข",
      "nr_hotels": 1,
      "type": "ho",
      "latitude": 16.4678,
      "dest_type": "hotel"
    },
    {
      "dest_id": "13081726",
      "search_type": "hotel",
      "region": "Khon Kaen Province",
      "country": "Thailand",
      "cc1": "th",
      "hotels": 1,
      "latitude": 16.466507,
      "dest_type": "hotel",
      "nr_hotels": 1,
      "name": "The Metal เดอะ เมทัล ขอนแก่น",
      "lc": "en",
      "type": "ho",
      "label": "The Metal เดอะ เมทัล ขอนแก่น, Ban Nong Waeng, Khon Kaen Province, Thailand",
      "longitude": 102.83338,
      "city_ufi": -3405455,
      "image_url": "https://cf.bstatic.com/xdata/images/hotel/150x150/613074382.jpg?k=1c5dc718bdb9b62ecf9c8da7dd07be5f35c94465c649d65057ffa23f10123992&o=",
      "roundtrip": "GhBhMGIxMmJlMTg5ZTIwMzdmIAQoATICZW46FeC4guC4reC4meC5geC4geC5iOC4mUAASgBQAA==",
      "city_name": "Ban Nong Waeng"
    }
  ]
}