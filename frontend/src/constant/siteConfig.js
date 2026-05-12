import tpi1 from '../assets/img/tpi1.webp'
import tpi2 from '../assets/img/tpi2.webp'
import tpi3 from '../assets/img/tpi3.webp'

import hpc1 from '../assets/img/hpc1.jpg'
import hpc2 from '../assets/img/hpc2.jpg'
import hpc3 from '../assets/img/hpc3.jpg'

import mmm from '../assets/img/mmm.jpg'
import mmm2 from '../assets/img/mmm2.jpg'
import mmm3 from '../assets/img/view4.webp'

import mmp1 from '../assets/img/mmp1.webp'
import mmp2 from '../assets/img/mmp2.webp'
import mmp3 from '../assets/img/mmp3.webp'

import nbp1 from '../assets/img/nbp1.webp'
import nbp2 from '../assets/img/nbp2.webp'
import nbp3 from '../assets/img/nbp3.webp'


/**
 * STATIC site configuration — only geography & map dot positions.
 * Grade counts / percentages come from the API, NOT from here.
 *
 */
export const SITE_CONFIG = [
  // --- REAL NEW DATA ---
  {
    id: "MMP",
    name: "MMP",
    provinces: ["lampang"],
    dot: { cx: 600, cy: 500 },
    lat: 18.29826537461988, 
    lng: 99.74240541400528,
    imgs: [mmp1, mmp2, mmp3],
  },
  {
    id: "NBP",
    name: "NBP",
    provinces: ["nonthaburi"],
    dot: { cx: 0, cy: 0 },
    lat: 13.813608,
    lng: 100.509824,
    imgs: [nbp3, nbp2, nbp1]
  },
  // --- REAL OLD DATA ---
  {
    id: "TPI",
    name: "TPI",
    provinces: ["saraburi"],
    dot: { cx: 600, cy: 500 },
    lat: 14.53,
    lng: 100.91,
    imgs: [tpi1, tpi2, tpi3],
  },
  {
    id: "HPC", // Laos
    name: "HPC",
    provinces: [],
    dot: { cx: 122, cy: 245 },
    lat: 19.72,
    lng: 101.47,
    imgs: [hpc1, hpc2, hpc3]
  },
  {
    id: "DEM",
    name: "DEM",
    provinces: ["lampang"],
    dot: { cx: 160, cy: 132 },
    lat: 18.29,
    lng: 99.49,
    imgs: [mmm, mmm2, mmm3]
  },

  // --- MOCK DATA ---
  {
    id: "WangNoi Power Plant",
    name: "WNP",
    provinces: ["ayutthaya"],
    dot: { cx: 0, cy: 0 },
    lat: 14.237223,
    lng: 100.777992,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "South Bangkok",
    name: "South Bangkok",
    provinces: ["samut prakan"],
    dot: { cx: 0, cy: 0 },
    lat: 13.621069,
    lng: 100.56,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "Chana PP",
    name: "Chana PP",
    provinces: ["songkhla"],
    dot: { cx: 0, cy: 0 },
    lat: 6.918908,
    lng: 100.715766,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-1",
    name: "TEST-1",
    provinces: ["phayao"],
    dot: { cx: 0, cy: 0 },
    lat: 19.170616,
    lng: 99.906991,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-2",
    name: "TEST-2",
    provinces: ["singburi"],
    dot: { cx: 0, cy: 0 },
    lat: 14.913931,
    lng: 100.315673,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-3",
    name: "TEST-3",
    provinces: ["singburi"],
    dot: { cx: 0, cy: 0 },
    lat: 14.913931,
    lng: 100.315673,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-4",
    name: "TEST-4",
    provinces: ["chiang mai"],
    dot: { cx: 0, cy: 0 },
    lat: 18.7883,
    lng: 98.9853,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-5",
    name: "TEST-5",
    provinces: ["phuket"],
    dot: { cx: 0, cy: 0 },
    lat: 7.8804,
    lng: 98.3923,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-6",
    name: "TEST-6",
    provinces: ["khon kaen"],
    dot: { cx: 0, cy: 0 },
    lat: 16.4322,
    lng: 102.8236,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-7",
    name: "TEST-7",
    provinces: ["chon buri"],
    dot: { cx: 0, cy: 0 },
    lat: 13.3611,
    lng: 100.9847,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-8",
    name: "TEST-8",
    provinces: ["surat thani"],
    dot: { cx: 0, cy: 0 },
    lat: 9.1387,
    lng: 99.3217,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-9",
    name: "TEST-9",
    provinces: ["nakhon ratchasima"],
    dot: { cx: 0, cy: 0 },
    lat: 14.9799,
    lng: 102.0978,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-10",
    name: "TEST-10",
    provinces: ["udon thani"],
    dot: { cx: 0, cy: 0 },
    lat: 17.415,
    lng: 102.7859,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-11",
    name: "TEST-11",
    provinces: ["kanchanaburi"],
    dot: { cx: 0, cy: 0 },
    lat: 14.0227,
    lng: 99.5328,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-12",
    name: "TEST-12",
    provinces: ["ayutthaya"],
    dot: { cx: 0, cy: 0 },
    lat: 14.3532,
    lng: 100.5681,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-13",
    name: "TEST-13",
    provinces: ["songkhla"],
    dot: { cx: 0, cy: 0 },
    lat: 7.1898,
    lng: 100.5954,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-14",
    name: "TEST-14",
    provinces: ["chiang rai"],
    dot: { cx: 0, cy: 0 },
    lat: 19.9105,
    lng: 99.8406,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-15",
    name: "TEST-15",
    provinces: ["rayong"],
    dot: { cx: 0, cy: 0 },
    lat: 12.6814,
    lng: 101.2813,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-16",
    name: "TEST-16",
    provinces: [""],
    dot: { cx: 0, cy: 0 },
    lat: 13.728879957518371,
    lng: 100.83776975486704,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-17",
    name: "TEST-17",
    provinces: ["buri ram"],
    dot: { cx: 0, cy: 0 },
    lat: 14.993,
    lng: 103.1029,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-18",
    name: "TEST-18",
    provinces: ["nakhon si thammarat"],
    dot: { cx: 0, cy: 0 },
    lat: 8.435,
    lng: 99.9631,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-19",
    name: "TEST-19",
    provinces: ["phetchaburi"],
    dot: { cx: 0, cy: 0 },
    lat: 13.1132,
    lng: 99.9443,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-20",
    name: "TEST-20",
    provinces: ["ratchaburi"],
    dot: { cx: 0, cy: 0 },
    lat: 13.5283,
    lng: 99.8134,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-21",
    name: "TEST-21",
    provinces: ["loei"],
    dot: { cx: 0, cy: 0 },
    lat: 17.486,
    lng: 101.7223,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-22",
    name: "TEST-22",
    provinces: ["nan"],
    dot: { cx: 0, cy: 0 },
    lat: 18.783,
    lng: 100.776,
    imgs: [mmm, mmm2, mmm3]

  },
  {
    id: "TEST-23",
    name: "TEST-23",
    provinces: ["trang"],
    dot: { cx: 0, cy: 0 },
    lat: 7.5645,
    lng: 99.6239,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-24",
    name: "TEST-24",
    provinces: ["phitsanulok"],
    dot: { cx: 0, cy: 0 },
    lat: 16.8211,
    lng: 100.2659,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-25",
    name: "TEST-25",
    provinces: ["nakhon pathom"],
    dot: { cx: 0, cy: 0 },
    lat: 13.814,
    lng: 100.0373,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-26",
    name: "TEST-26",
    provinces: ["sisaket"],
    dot: { cx: 0, cy: 0 },
    lat: 15.1188,
    lng: 104.322,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-27",
    name: "TEST-27",
    provinces: ["sakon nakhon"],
    dot: { cx: 0, cy: 0 },
    lat: 17.1636,
    lng: 104.1453,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-28",
    name: "TEST-28",
    provinces: ["narathiwat"],
    dot: { cx: 0, cy: 0 },
    lat: 6.4254,
    lng: 101.8253,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-29",
    name: "TEST-29",
    provinces: ["phrae"],
    dot: { cx: 0, cy: 0 },
    lat: 18.1446,
    lng: 100.1403,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-30",
    name: "TEST-30",
    provinces: ["chaiyaphum"],
    dot: { cx: 0, cy: 0 },
    lat: 15.8062,
    lng: 102.0315,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-31",
    name: "TEST-31",
    provinces: ["kamphaeng phet"],
    dot: { cx: 0, cy: 0 },
    lat: 16.4828,
    lng: 99.5227,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-32",
    name: "TEST-32",
    provinces: ["prachuap khiri khan"],
    dot: { cx: 0, cy: 0 },
    lat: 11.8124,
    lng: 99.7972,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-33",
    name: "TEST-33",
    provinces: ["nakhon phanom"],
    dot: { cx: 0, cy: 0 },
    lat: 17.392,
    lng: 104.7696,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-34",
    name: "TEST-34",
    provinces: [""],
    dot: { cx: 0, cy: 0 },
    lat: 14.66053476164695,
    lng: 100.38267715755725,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-35",
    name: "TEST-35",
    provinces: ["pathum thani"],
    dot: { cx: 0, cy: 0 },
    lat: 14.0208,
    lng: 100.525,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-36",
    name: "TEST-36",
    provinces: ["krabi"],
    dot: { cx: 0, cy: 0 },
    lat: 8.0863,
    lng: 98.9067,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-37",
    name: "TEST-37",
    provinces: ["phang nga"],
    dot: { cx: 0, cy: 0 },
    lat: 8.4501,
    lng: 98.5255,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-38",
    name: "TEST-38",
    provinces: ["mae hong son"],
    dot: { cx: 0, cy: 0 },
    lat: 19.302,
    lng: 97.9654,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-39",
    name: "TEST-39",
    provinces: ["chumphon"],
    dot: { cx: 0, cy: 0 },
    lat: 10.493,
    lng: 99.18,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-40",
    name: "TEST-40",
    provinces: ["kalasin"],
    dot: { cx: 0, cy: 0 },
    lat: 16.4353,
    lng: 103.5068,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-41",
    name: "TEST-41",
    provinces: ["yala"],
    dot: { cx: 0, cy: 0 },
    lat: 6.5411,
    lng: 101.2804,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-42",
    name: "TEST-42",
    provinces: ["phayao"],
    dot: { cx: 0, cy: 0 },
    lat: 19.1658,
    lng: 99.913,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-43",
    name: "TEST-43",
    provinces: ["nong khai"],
    dot: { cx: 0, cy: 0 },
    lat: 17.8785,
    lng: 102.7413,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-44",
    name: "TEST-44",
    provinces: ["ro iet"],
    dot: { cx: 0, cy: 0 },
    lat: 16.0538,
    lng: 103.652,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-45",
    name: "TEST-45",
    provinces: ["lop buri"],
    dot: { cx: 0, cy: 0 },
    lat: 14.7995,
    lng: 100.6534,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-46",
    name: "TEST-46",
    provinces: ["suphan buri"],
    dot: { cx: 0, cy: 0 },
    lat: 14.4746,
    lng: 100.1222,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-47",
    name: "TEST-47",
    provinces: ["chachoengsao"],
    dot: { cx: 0, cy: 0 },
    lat: 13.6888,
    lng: 101.0713,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-48",
    name: "TEST-48",
    provinces: ["mukdahan"],
    dot: { cx: 0, cy: 0 },
    lat: 16.5436,
    lng: 104.7245,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-49",
    name: "TEST-49",
    provinces: ["phichit"],
    dot: { cx: 0, cy: 0 },
    lat: 16.4428,
    lng: 100.3488,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-50",
    name: "TEST-50",
    provinces: ["u thai thani"],
    dot: { cx: 0, cy: 0 },
    lat: 15.3837,
    lng: 100.0247,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-51",
    name: "TEST-51",
    provinces: ["samut prakan"],
    dot: { cx: 0, cy: 0 },
    lat: 13.5991,
    lng: 100.5967,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-52",
    name: "TEST-52",
    provinces: ["samut sakhon"],
    dot: { cx: 0, cy: 0 },
    lat: 13.5475,
    lng: 100.2744,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-53",
    name: "TEST-53",
    provinces: ["tak"],
    dot: { cx: 0, cy: 0 },
    lat: 16.883,
    lng: 99.125,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-54",
    name: "TEST-54",
    provinces: ["nakhon nayok"],
    dot: { cx: 0, cy: 0 },
    lat: 14.2069,
    lng: 101.213,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-55",
    name: "TEST-55",
    provinces: ["yasothon"],
    dot: { cx: 0, cy: 0 },
    lat: 15.7971,
    lng: 104.1475,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-56",
    name: "TEST-56",
    provinces: ["pattani"],
    dot: { cx: 0, cy: 0 },
    lat: 6.87,
    lng: 101.25,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-57",
    name: "TEST-57",
    provinces: ["phetchabun"],
    dot: { cx: 0, cy: 0 },
    lat: 16.415,
    lng: 101.1557,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-58",
    name: "TEST-58",
    provinces: ["ranong"],
    dot: { cx: 0, cy: 0 },
    lat: 9.9529,
    lng: 98.6301,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-59",
    name: "TEST-59",
    provinces: ["sa kaeo"],
    dot: { cx: 0, cy: 0 },
    lat: 13.813,
    lng: 102.064,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-60",
    name: "TEST-60",
    provinces: ["trat"],
    dot: { cx: 0, cy: 0 },
    lat: 12.242,
    lng: 102.517,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-61",
    name: "TEST-61",
    provinces: ["phatthalung"],
    dot: { cx: 0, cy: 0 },
    lat: 7.6167,
    lng: 100.0833,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-62",
    name: "TEST-62",
    provinces: ["chai nat"],
    dot: { cx: 0, cy: 0 },
    lat: 15.185,
    lng: 100.125,
    imgs: [mmm, mmm2, mmm3]
  },
  {
    id: "TEST-63",
    name: "TEST-63",
    provinces: ["ang thong"],
    dot: { cx: 0, cy: 0 },
    lat: 14.588,
    lng: 100.453,
    imgs: [mmm, mmm2, mmm3]
  }
];

/**
 * Quick lookup: siteId → images[]
 * Used in Dashboard so don't have to search the array every time
 *  */
export const SITE_IMAGES = Object.fromEntries(
  SITE_CONFIG.map(s => [s.id, s.imgs])
);

/**
 * Maps province name → site id.
 * Auto-generated from SITE_CONFIG — no need to maintain separately.
 */
export const PROVINCE_TO_SITE = SITE_CONFIG.reduce((acc, site) => {
  site.provinces.forEach(province => {
    acc[province] = site.id;
  });
  return acc;
}, {});