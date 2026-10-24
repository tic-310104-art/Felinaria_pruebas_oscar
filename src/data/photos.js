import toastSmall from '../assets/pan-frances-640.webp'
import toastMedium from '../assets/pan-frances-800.webp'
import toastLarge from '../assets/pan-frances-1440.webp'
import chickenSmall from '../assets/pollo-a-la-naranja-640.webp'
import chickenMedium from '../assets/pollo-a-la-naranja-800.webp'
import chickenLarge from '../assets/pollo-a-la-naranja-1440.webp'
import mochiSmall from '../assets/mochis-dulces-640.webp'
import mochiMedium from '../assets/mochis-dulces-800.webp'
import mochiLarge from '../assets/mochis-dulces-1440.webp'

export const photos = {
  'pan-frances': { small: toastSmall, medium: toastMedium, large: toastLarge, width: 1440, height: 1442 },
  'pollo-a-la-naranja': { small: chickenSmall, medium: chickenMedium, large: chickenLarge, width: 1440, height: 2167 },
  'mochis-dulces': { small: mochiSmall, medium: mochiMedium, large: mochiLarge, width: 1352, height: 845 },
}

export const photoCredits = [
  { name: 'Pan francés', author: 'Daderot', source: 'https://commons.wikimedia.org/wiki/File:French_toast_with_berries_and_maple_syrup_-_Pasadena,_CA.jpg', license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { name: 'Pollo a la naranja', author: 'Evan Joshua Swigart / TheCulinaryGeek', source: 'https://commons.wikimedia.org/wiki/File:Flickr_preppybyday_4786746354--Orange_chicken.jpg', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/' },
  { name: 'Mochis dulces', author: 'Alice Wiegand / Lyzzy', source: 'https://commons.wikimedia.org/wiki/File:Daifuku_1.jpg', license: 'CC BY 2.5', licenseUrl: 'https://creativecommons.org/licenses/by/2.5/' },
]
