import { readdir, readFile } from "node:fs/promises";
import qs from "qs";
import { marked } from "marked";

const CMS_URL = "http://localhost:1337";
export async function getFeaturedReview() {
  const reviews = await getReviews();
  return reviews[0];
  return { slug, title, date, image, body };
}

// slug: 'hellblade',
// title: 'Hellblade',
// date: '2023-05-06',
// image: '/images/hellblade.jpg',

//denna kod är den som hämtade data från localt sparade filen

export async function getReview(slug) {
  const { data } = await fetchReviews({
    filters: { slug: { $eq: slug } },
    fields: ["slug", "title", "subtitle", "publishedAt", "body"],
    populate: { image: { fields: ["url"] } },
    pagination: { pageSize: 1, withCount: false },
  });
  const item = data[0];
  return {
    ...toReview(item),
    body: marked(item.attributes.body),
  };
}

export async function getReviews() {
  const { data } = await fetchReviews({
    fields: ["slug", "title", "subtitle", "publishedAt"],
    populate: { image: { fields: ["url"] } },
    sort: ["publishedAt:desc"],
    pagination: { pageSize: 6 },
  });
  return data.map(toReview);
}

export async function getSlugs() {
  const files = await readdir("./content/reviews");
  return files.filter((file) => file.endsWith(".md")).map((file) => file.slice(0, -".md".length));
}

async function fetchReviews(parameters) {
  const url = `${CMS_URL}/api/reviews?` + qs.stringify(parameters, { encodeValuesOnly: true });
  console.log("[fetchReviews]:", url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CMS returned ${response.status} for ${url}`);
  }
  return await response.json();
}

function toReview(item) {
  const { attributes } = item;
  return {
    slug: attributes.slug,
    title: attributes.title,
    date: attributes.publishedAt.slice(0, "yyyy-mm-dd".length),
    image: CMS_URL + attributes.image.data.attributes.url,
  };
}
