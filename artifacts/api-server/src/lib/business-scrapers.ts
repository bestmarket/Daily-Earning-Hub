/**
 * business-scrapers.ts
 *
 * Multi-source business directory scraper — no API keys required.
 * Runs 8 sources in parallel (Yelp, Yellow Pages, Google Local, Manta, Hotfrog,
 * Yell.com, Foursquare, Bing Local), extracts JSON-LD / embedded app state /
 * raw HTML from each, deduplicates across sources, then scrapes each website
 * for a real contact email before returning.
 */

export interface ScrapedBusiness {
  businessName: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  category: string;
  source: string;
  email: string;
}

// ─── Shared HTTP fetch ────────────────────────────────────────────────────────

/** Fetch a URL with realistic browser headers; throws on timeout or non-2xx. */
async function browserFetch(url: string, timeoutMs = 14000): Promise<string> {
  const res = await Promise.race([
    fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://www.google.com/",
      },
    }),
    new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), timeoutMs)),
  ]) as Response;
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

// ─── Structured data extraction ───────────────────────────────────────────────

/** Pull every JSON-LD / schema.org block out of raw HTML. */
function extractJsonLd(html: string): any[] {
  const out: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const d = JSON.parse(m[1].trim());
      out.push(...(Array.isArray(d) ? d : [d]));
    } catch {}
  }
  return out;
}

const BUSINESS_TYPES = new Set([
  "LocalBusiness","Restaurant","Store","FoodEstablishment","HealthAndBeautyBusiness",
  "EntertainmentBusiness","HomeAndConstructionBusiness","LodgingBusiness","TouristAttraction",
  "AutomotiveBusiness","FinancialService","LegalService","MedicalBusiness","Dentist",
  "Physician","RealEstateAgent","TravelAgency","SportsClub","BeautySalon","HairSalon",
  "Plumber","Electrician","HVACBusiness","AccountingService","InsuranceAgency","Hotel",
  "Motel","GroceryStore","ClothingStore","ElectronicsStore","HomeGoodsStore","PetStore",
  "ShoeStore","SportingGoodsStore","ToyStore","BookStore","Florist","Bakery","CafeOrCoffeeShop",
  "BarOrPub","FastFoodRestaurant","IceCreamShop","Brewery","Winery","NightClub",
  "MovieTheater","AmusementPark","Aquarium","Zoo","Museum","Library","Gym",
  "MartialArtsOrSportsFacility","TennisComplex","GolfCourse","BowlingAlley",
  "ChildCare","Preschool","School","CollegeOrUniversity","Language","Tutoring",
  "AutoDealer","AutoRepair","AutoBodyShop","CarWash","GasStation","Locksmith",
  "MovingCompany","StorageUnit","PhotoStudio","PrintingShop","TailoringShop",
  "VeterinaryCare","Dentist","Hospital","MedicalClinic","Pharmacy","BodyCare",
  "DaySpa","NailSalon","TattooParlor","MassageTherapy","Chiropractor","Optician",
]);

function schemaTypeLooksLikeBusiness(t: string): boolean {
  if (!t) return false;
  if (BUSINESS_TYPES.has(t)) return true;
  return t.includes("Business") || t.includes("Service") || t.includes("Store") ||
    t.includes("Shop") || t.includes("Salon") || t.includes("Clinic");
}

/** Convert JSON-LD schemas to ScrapedBusiness objects. */
function schemasToBusinesses(
  schemas: any[], category: string, city: string, country: string, source: string
): ScrapedBusiness[] {
  return schemas
    .filter(s => s && s.name && schemaTypeLooksLikeBusiness(String(s["@type"] ?? "")))
    .map(s => ({
      businessName: String(s.name).trim(),
      phone: String(s.telephone ?? s.phone ?? "").trim(),
      website: String(s.url ?? s.sameAs ?? "").trim(),
      address: typeof s.address === "string"
        ? s.address
        : [s.address?.streetAddress, s.address?.addressLocality].filter(Boolean).join(", "),
      city,
      country,
      category,
      source,
      email: String(s.email ?? "").trim(),
    }))
    .filter(b => b.businessName.length >= 2);
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
}

function dedup(list: ScrapedBusiness[]): ScrapedBusiness[] {
  const seen = new Set<string>();
  return list.filter(b => {
    const key = normalizeName(b.businessName);
    if (!key || key.length < 2 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── SCRAPER 1: Yelp ─────────────────────────────────────────────────────────

async function scrapeYelp(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(category)}&find_loc=${encodeURIComponent(`${city}, ${country}`)}&ns=1&sortby=recommended`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "yelp");

  // Strategy 2 — Yelp's server-side hypernova JSON comment block
  const hypernovaMatch = html.match(/data-hypernova-key="yelpfrontend_[^"]*BizListingApp"[^>]*><!--([\s\S]*?)--><\/div>/i);
  if (hypernovaMatch) {
    try {
      const parsed = JSON.parse(hypernovaMatch[1]);
      const listProps =
        parsed?.legacyProps?.searchAppProps?.searchPageProps?.mainContentComponentsListProps ??
        parsed?.searchPageProps?.mainContentComponentsListProps ?? [];
      for (const item of listProps) {
        const biz = item?.bizListingProps ?? item?.bizListing;
        if (!biz?.name) continue;
        businesses.push({
          businessName: biz.name,
          phone: biz.phone ?? "",
          website: biz.websiteUrl ?? biz.bizUrl ?? "",
          address: [biz.address1, biz.city].filter(Boolean).join(", "),
          city, country, category, source: "yelp", email: "",
        });
      }
    } catch {}
  }

  // Strategy 3 — window.__YELP_STATE__
  const stateMatch = html.match(/window\.__YELP_STATE__\s*=\s*(\{[\s\S]+?\});\s*(?:window\.|<\/script>)/);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      const bizList: any[] =
        state?.search?.mapState?.businessList ??
        state?.bizs?.businesses ?? [];
      for (const biz of bizList) {
        if (!biz?.name) continue;
        businesses.push({
          businessName: biz.name,
          phone: biz.phone ?? "",
          website: biz.website?.url ?? biz.websiteUrl ?? "",
          address: biz.formattedAddress ?? "",
          city, country, category, source: "yelp", email: "",
        });
      }
    } catch {}
  }

  // Strategy 4 — Raw HTML business-name links
  const cardRe = /<h3[^>]*>\s*<span[^>]*>\s*(?:\d+\.\s*)?<\/span>\s*<a[^>]+href="\/biz\/([^"?]+)"[^>]*>([^<]{2,80})<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = cardRe.exec(html)) !== null) {
    const name = m[2].trim();
    if (name) businesses.push({ businessName: name, phone: "", website: `https://www.yelp.com/biz/${m[1]}`, address: "", city, country, category, source: "yelp", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 2: Yellow Pages (US + Canada) ───────────────────────────────────

async function scrapeYellowPages(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const isCA = /\b(canada|ontario|british columbia|alberta|quebec|manitoba|nova scotia|new brunswick|newfoundland|saskatchewan|prince edward)\b/i.test(country);
  const domain = isCA ? "yellowpages.ca" : "yellowpages.com";
  const url = `https://www.${domain}/search?search_terms=${encodeURIComponent(category)}&geo_location_terms=${encodeURIComponent(city)}`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "yellowpages");

  // Split by result cards — both .organic and .sponsored
  const sections = html.split(/<div[^>]+class="[^"]*(?:v-card|result)[^"]*"/i).slice(1);
  for (const sec of sections) {
    if (businesses.length >= count * 2) break;

    const name =
      (/<a[^>]+class="[^"]*business-name[^"]*"[^>]*>(?:<span[^>]*>)?([^<]{2,80})(?:<\/span>)?<\/a>/i.exec(sec))?.[1]?.trim() ??
      (/<h2[^>]*>[\s\S]{0,20}<a[^>]*>([^<]{2,80})<\/a>/i.exec(sec))?.[1]?.trim();
    if (!name) continue;

    const phone =
      (/<div[^>]+class="[^"]*(?:phones|phone primary)[^"]*"[^>]*>[\s\S]*?([+\d][(\d\s\-)\.]{6,18}\d)/i.exec(sec))?.[1]?.trim() ?? "";
    const website =
      (/<a[^>]+class="[^"]*track-visit-website[^"]*"[^>]+href="([^"]+)"/i.exec(sec))?.[1]?.trim() ??
      (/rel="noopener nofollow"[^>]+href="([^"]+)"/i.exec(sec))?.[1]?.trim() ?? "";
    const address =
      (/<span[^>]+class="[^"]*street-address[^"]*"[^>]*>([^<]+)<\/span>/i.exec(sec))?.[1]?.trim() ?? "";

    businesses.push({ businessName: name, phone, website, address, city, country, category, source: "yellowpages", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 3: Google Local / GMB (tbm=lcl gives the My Business results tab) ─

async function scrapeGoogleLocal(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const q = `${category} in ${city} ${country}`;
  const businesses: ScrapedBusiness[] = [];

  // ── Pass 1: tbm=lcl — Google's local/GMB results tab ──────────────────────
  // This is the same data shown in the "Places" section and pulls directly from
  // Google My Business profiles (name, address, phone, website, rating).
  const lclUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=lcl&num=20&hl=en`;
  const lclHtml = await browserFetch(lclUrl);

  // JSON-LD is sometimes embedded in local results
  businesses.push(...schemasToBusinesses(extractJsonLd(lclHtml), category, city, country, "google-gmb"));

  // The local results page embeds business data in JS callback blobs like:
  //   AF_initDataCallback({key:'ds:1', data:[[["Business Name","address","phone",...]],...}
  // We extract all strings that look like business names near phone/address patterns.
  const afBlocks = lclHtml.matchAll(/AF_initDataCallback\(\{[^}]+data:([\s\S]+?)\}\);/g);
  for (const block of afBlocks) {
    try {
      // Pull quoted strings of plausible business-name length from the blob
      const names = [...block[1].matchAll(/"([A-Z][^"]{2,60})"/g)]
        .map(x => x[1])
        .filter(n => /^[A-Z]/.test(n) && !/^https?:/.test(n) && n.split(" ").length <= 8);
      // Pull phone numbers
      const phones = [...block[1].matchAll(/"(\+?[\d\s\-().]{7,20})"/g)].map(x => x[1].trim());
      // Pull website-like URLs
      const sites = [...block[1].matchAll(/"(https?:\/\/[^"]{4,100})"/g)].map(x => x[1]);
      for (let i = 0; i < names.length; i++) {
        businesses.push({
          businessName: names[i],
          phone: phones[i] ?? "",
          website: sites[i] ?? "",
          address: "",
          city, country, category,
          source: "google-gmb",
          email: "",
        });
      }
    } catch {}
  }

  // Known GMB card HTML patterns for the local results page
  // <div class="rllt__details"> <div class="dbg0pd">Name</div> ... </div>
  const lclCardRe = /<div[^>]+class="[^"]*rllt__details[^"]*"[^>]*>([\s\S]{20,500}?)<\/div>\s*<\/div>/gi;
  let lm: RegExpExecArray | null;
  while ((lm = lclCardRe.exec(lclHtml)) !== null) {
    const card = lm[1];
    const name = (/<div[^>]+class="[^"]*(?:dbg0pd|OSrXXb|NsNu7e|uMdZh)[^"]*"[^>]*>([^<]{2,80})<\/div>/i.exec(card))?.[1]?.trim();
    const phone = (/(\+?[\d\s\-().]{7,20})/.exec(
      (/<span[^>]+class="[^"]*(?:rllt__wrapped-text|LrzXr)[^"]*"[^>]*>([^<]+)<\/span>/i.exec(card))?.[1] ?? ""
    ))?.[1]?.trim() ?? "";
    const website = (/<a[^>]+href="(https?:\/\/[^"]{4,100})"[^>]*class="[^"]*(?:yYlJEf|rllt__link)[^"]*"/i.exec(card))?.[1] ?? "";
    if (name) {
      businesses.push({ businessName: name, phone, website, address: "", city, country, category, source: "google-gmb", email: "" });
    }
  }

  // ── Pass 2: regular search — local 3-pack JSON-LD + script blocks ──────────
  const url = `https://www.google.com/search?q=${encodeURIComponent(q)}&num=20&hl=en`;
  const html = await browserFetch(url);
  businesses.push(...schemasToBusinesses(extractJsonLd(html), category, city, country, "google"));

  const bigJsonRe = /<script[^>]*>\s*(?:window\._sharedData\s*=\s*|AF_initDataCallback\(|var _pageData\s*=\s*)?(\{[\s\S]{200,}?\})\s*(?:;|\))\s*<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = bigJsonRe.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]);
      const stringify = JSON.stringify(obj);
      const innerSchemas = extractJsonLd(`<script type="application/ld+json">${stringify}</script>`);
      businesses.push(...schemasToBusinesses(innerSchemas, category, city, country, "google"));
    } catch {}
  }

  // HTML fallback: known 3-pack class names
  const nameRe = /<(?:div|span|h3)[^>]+class="(?:OSrXXb|dbg0pd|qrShPb|uMdZh tNxQIb yl|fc9yUc|Zt0a5e|NsNu7e)[^"]*"[^>]*>([^<]{3,80})<\/(?:div|span|h3)>/gi;
  while ((m = nameRe.exec(html)) !== null) {
    const name = m[1].trim();
    if (name && name.length >= 3) {
      businesses.push({ businessName: name, phone: "", website: "", address: "", city, country, category, source: "google", email: "" });
    }
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 4: Manta (US SMB directory) ─────────────────────────────────────

async function scrapeManta(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const q = encodeURIComponent(`${category} ${city}`);
  const url = `https://www.manta.com/mb?search%5Bq%5D=${q}&search%5Blocation%5D=${encodeURIComponent(city)}`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "manta");

  // Manta card: <article class="... listing-card ..."> <h2 ...><a>Name</a></h2>
  const cards = html.split(/<article[^>]+class="[^"]*(?:listing-card|result-item)[^"]*"/i).slice(1);
  for (const card of cards) {
    if (businesses.length >= count * 2) break;
    const name =
      (/<h[23][^>]*>[\s\S]{0,30}<a[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim() ??
      (/<a[^>]+class="[^"]*(?:company-name|listing-name)[^"]*"[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim();
    if (!name) continue;

    const phone = (/<span[^>]+class="[^"]*phone[^"]*"[^>]*>([^<]+)<\/span>/i.exec(card))?.[1]?.trim() ?? "";
    const website = (/<a[^>]+class="[^"]*(?:website|web-url)[^"]*"[^>]+href="([^"]+)"/i.exec(card))?.[1]?.trim() ?? "";
    businesses.push({ businessName: name, phone, website, address: "", city, country, category, source: "manta", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 5: Hotfrog (international) ──────────────────────────────────────

const HOTFROG_TLD: Record<string, string> = {
  "australia": "com.au", "au": "com.au",
  "united kingdom": "co.uk", "uk": "co.uk", "england": "co.uk",
  "scotland": "co.uk", "wales": "co.uk", "northern ireland": "co.uk",
  "canada": "ca", "ca": "ca",
  "new zealand": "co.nz", "nz": "co.nz",
  "south africa": "co.za", "za": "co.za",
  "india": "in", "ireland": "ie",
  "singapore": "sg", "malaysia": "my",
  "philippines": "ph", "nigeria": "ng",
};

async function scrapeHotfrog(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const tld = HOTFROG_TLD[country.toLowerCase()] ?? "com";
  const url = `https://www.hotfrog.${tld}/search/${encodeURIComponent(country)}/${encodeURIComponent(city)}/${encodeURIComponent(category)}`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "hotfrog");

  const cards = html.split(/<(?:div|article)[^>]+class="[^"]*(?:listing-card|result-item|business-card)[^"]*"/i).slice(1);
  for (const card of cards) {
    if (businesses.length >= count * 2) break;
    const name =
      (/<h[23][^>]*>[\s\S]{0,20}<a[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim() ??
      (/<a[^>]+class="[^"]*(?:company|business|title|name)[^"]*"[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim();
    if (!name) continue;

    const phone =
      (/<span[^>]+class="[^"]*phone[^"]*"[^>]*>([^<]+)<\/span>/i.exec(card))?.[1]?.trim() ??
      (/href="tel:([^"]+)"/i.exec(card))?.[1]?.trim() ?? "";
    const website =
      (/<a[^>]+(?:class="[^"]*website[^"]*"|rel="nofollow")[^>]+href="(https?:\/\/[^"]+)"/i.exec(card))?.[1]?.trim() ?? "";
    businesses.push({ businessName: name, phone, website, address: "", city, country, category, source: "hotfrog", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 6: Yell.com (UK) ─────────────────────────────────────────────────

async function scrapeYell(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  if (!/\b(uk|united kingdom|england|scotland|wales|ireland|northern ireland)\b/i.test(country)) return [];
  const catSlug = category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const citySlug = city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const url = `https://www.yell.com/s/${catSlug}/${citySlug}/`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "yell");

  const cards = html.split(/<article[^>]+class="[^"]*businessCapsule[^"]*"/i).slice(1);
  for (const card of cards) {
    if (businesses.length >= count * 2) break;
    const name =
      (/<a[^>]+class="[^"]*businessCapsule--title[^"]*"[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim() ??
      (/<h3[^>]*>[\s\S]{0,30}<a[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim();
    if (!name) continue;

    const phone =
      (/href="tel:([^"]+)"/i.exec(card))?.[1]?.trim() ??
      (/<span[^>]+class="[^"]*(?:phone|tel)[^"]*"[^>]*>([^<]+)<\/span>/i.exec(card))?.[1]?.trim() ?? "";
    const website =
      (/<a[^>]+(?:class="[^"]*website[^"]*"|data-type="website")[^>]+href="(https?:\/\/[^"]+)"/i.exec(card))?.[1]?.trim() ?? "";
    businesses.push({ businessName: name, phone: phone.replace(/^tel:/, ""), website, address: "", city, country, category, source: "yell", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 7: Foursquare ────────────────────────────────────────────────────

async function scrapeFoursquare(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const url = `https://foursquare.com/explore?mode=url&near=${encodeURIComponent(`${city}, ${country}`)}&q=${encodeURIComponent(category)}`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "foursquare");

  // Foursquare embeds all venue data in Next.js __NEXT_DATA__
  const nextMatch = /<script id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/i.exec(html);
  if (nextMatch) {
    try {
      const data = JSON.parse(nextMatch[1]);
      // Explore results are nested under props.pageProps
      const groups: any[] =
        data?.props?.pageProps?.data?.explore?.groups ?? [];
      for (const group of groups) {
        for (const item of (group?.items ?? [])) {
          const v = item?.venue;
          if (!v?.name) continue;
          businesses.push({
            businessName: v.name,
            phone: v.contact?.formattedPhone ?? v.contact?.phone ?? "",
            website: v.url ?? v.contact?.facebookUrl ?? "",
            address: v.location?.address ?? "",
            city: v.location?.city ?? city,
            country,
            category,
            source: "foursquare",
            email: v.contact?.email ?? "",
          });
        }
      }
    } catch {}
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 8: Bing Local ────────────────────────────────────────────────────

async function scrapeBingLocal(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const q = `${category} near ${city} ${country}`;
  const url = `https://www.bing.com/local/search?q=${encodeURIComponent(q)}&setlang=en-US`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "bing");

  // Bing local card blocks
  const cards = html.split(/<div[^>]+class="[^"]*(?:b_localListItemHolder|loc_detail)[^"]*"/i).slice(1);
  for (const card of cards) {
    if (businesses.length >= count * 2) break;
    const name =
      (/<h2[^>]+class="[^"]*b_entityTitle[^"]*"[^>]*>([^<]{2,80})<\/h2>/i.exec(card))?.[1]?.trim() ??
      (/<span[^>]+class="[^"]*nc_tc[^"]*"[^>]*>([^<]{2,80})<\/span>/i.exec(card))?.[1]?.trim();
    if (!name) continue;

    const phone =
      (/href="tel:([^"]+)"/i.exec(card))?.[1]?.trim() ??
      (/<span[^>]+class="[^"]*b_phone[^"]*"[^>]*>([^<]+)<\/span>/i.exec(card))?.[1]?.trim() ?? "";
    const website =
      (/<a[^>]+href="(https?:\/\/(?!www\.bing\.|www\.microsoft\.)[^"]+)"[^>]*>\s*(?:Website|Visit|Go to)/i.exec(card))?.[1]?.trim() ?? "";
    businesses.push({ businessName: name, phone: phone.replace(/^tel:/, ""), website, address: "", city, country, category, source: "bing", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 9: TripAdvisor ───────────────────────────────────────────────────

async function scrapeTripAdvisor(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const q = `${category} ${city} ${country}`;
  const url = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(q)}&searchSessionId=x&sid=x&blockRedirect=true`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "tripadvisor");

  // TripAdvisor search result cards: <div class="result-title">
  const nameRe = /<div[^>]+class="[^"]*(?:result-title|listing_title|property_title)[^"]*"[^>]*>[\s\S]{0,60}?<a[^>]*>([^<]{2,80})<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = nameRe.exec(html)) !== null) {
    const name = m[1].trim().replace(/^\d+\.\s*/, "");
    if (name.length >= 2) {
      businesses.push({ businessName: name, phone: "", website: "", address: "", city, country, category, source: "tripadvisor", email: "" });
    }
  }

  // Also try: restaurant/attraction listing pages for the city
  const cityUrl = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(`${category} in ${city}`)}&geo=1`;
  try {
    const html2 = await browserFetch(cityUrl);
    businesses.push(...schemasToBusinesses(extractJsonLd(html2), category, city, country, "tripadvisor"));
    let m2: RegExpExecArray | null;
    const re2 = /<a[^>]+class="[^"]*(?:BMQDV|property_title|listing_title)[^"]*"[^>]*>([^<]{2,80})<\/a>/gi;
    while ((m2 = re2.exec(html2)) !== null) {
      const name = m2[1].trim().replace(/^\d+\.\s*/, "");
      if (name.length >= 2) businesses.push({ businessName: name, phone: "", website: "", address: "", city, country, category, source: "tripadvisor", email: "" });
    }
  } catch {}

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 10: BBB — Better Business Bureau (US/Canada) ────────────────────

async function scrapeBBB(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  // BBB is primarily US/Canada
  if (!/\b(usa|us|united states|america|canada)\b/i.test(country || "usa")) return [];
  const url = `https://www.bbb.org/search?find_text=${encodeURIComponent(category)}&find_loc=${encodeURIComponent(city)}`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "bbb");

  // BBB result cards
  const cards = html.split(/<div[^>]+class="[^"]*(?:result-card|SearchResults_result)[^"]*"/i).slice(1);
  for (const card of cards) {
    if (businesses.length >= count * 2) break;
    const name =
      (/<a[^>]+class="[^"]*(?:result-business-name|BusinessName)[^"]*"[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim() ??
      (/<h3[^>]*>[\s\S]{0,20}<a[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim();
    if (!name) continue;
    const phone = (/<span[^>]+class="[^"]*phone[^"]*"[^>]*>([^<]+)<\/span>/i.exec(card))?.[1]?.trim() ?? "";
    const website = (/<a[^>]+href="(https?:\/\/(?!www\.bbb\.org)[^"]+)"[^>]*>(?:Visit Website|Website)/i.exec(card))?.[1] ?? "";
    const address = (/<address[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i.exec(card))?.[1]?.trim() ?? "";
    businesses.push({ businessName: name, phone, website, address, city, country, category, source: "bbb", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 11: Thumbtack (US service businesses) ────────────────────────────

async function scrapeThumbtrack(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  if (!/\b(usa|us|united states|america)\b/i.test(country || "usa")) return [];
  const catSlug = category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const citySlug = city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const url = `https://www.thumbtack.com/k/${catSlug}/${citySlug}/`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "thumbtack");

  // Thumbtack Next.js data
  const nextMatch = /<script id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/i.exec(html);
  if (nextMatch) {
    try {
      const data = JSON.parse(nextMatch[1]);
      const pros: any[] =
        data?.props?.pageProps?.pros ??
        data?.props?.pageProps?.initialSearchState?.pros ??
        data?.props?.pageProps?.data?.pros ?? [];
      for (const pro of pros) {
        if (!pro?.name) continue;
        businesses.push({
          businessName: pro.name,
          phone: pro.phone ?? "",
          website: pro.website ?? pro.websiteUrl ?? "",
          address: pro.location?.address ?? "",
          city, country, category, source: "thumbtack", email: pro.email ?? "",
        });
      }
    } catch {}
  }

  // HTML fallback: pro card names
  const nameRe = /<span[^>]+class="[^"]*(?:provider-name|pro-name|ProName)[^"]*"[^>]*>([^<]{2,80})<\/span>/gi;
  let m: RegExpExecArray | null;
  while ((m = nameRe.exec(html)) !== null) {
    const name = m[1].trim();
    if (name.length >= 2) businesses.push({ businessName: name, phone: "", website: "", address: "", city, country, category, source: "thumbtack", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 12: Cylex (international business directory) ────────────────────

async function scrapeCylex(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  // Cylex has country-specific domains
  const domain = (/\b(uk|united kingdom|england)\b/i.test(country)) ? "cylex.co.uk"
    : (/\b(canada)\b/i.test(country)) ? "cylex.ca"
    : (/\b(australia)\b/i.test(country)) ? "cylex.com.au"
    : (/\b(germany|deutschland)\b/i.test(country)) ? "cylex.de"
    : "cylex.us.com";
  const url = `https://www.${domain}/results/${encodeURIComponent(city)}/${encodeURIComponent(category)}.html`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "cylex");

  // Cylex listing cards
  const cards = html.split(/<(?:div|li)[^>]+class="[^"]*(?:m-result|result-item|module-provider)[^"]*"/i).slice(1);
  for (const card of cards) {
    if (businesses.length >= count * 2) break;
    const name =
      (/<h2[^>]*>[\s\S]{0,20}<a[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim() ??
      (/<a[^>]+class="[^"]*(?:company-name|entry-name)[^"]*"[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim();
    if (!name) continue;
    const phone = (/href="tel:([^"]+)"/i.exec(card))?.[1]?.trim() ?? "";
    const website = (/<a[^>]+(?:class="[^"]*website[^"]*"|rel="nofollow external")[^>]+href="(https?:\/\/(?!www\.cylex)[^"]+)"/i.exec(card))?.[1] ?? "";
    const address = (/<span[^>]+class="[^"]*(?:address|street)[^"]*"[^>]*>([^<]{5,100})<\/span>/i.exec(card))?.[1]?.trim() ?? "";
    businesses.push({ businessName: name, phone: phone.replace(/^tel:/, ""), website, address, city, country, category, source: "cylex", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 13: SuperPages (US) ─────────────────────────────────────────────

async function scrapeSuperPages(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  if (!/\b(usa|us|united states|america)\b/i.test(country || "usa")) return [];
  const url = `https://www.superpages.com/search?search_terms=${encodeURIComponent(category)}&geo_location_terms=${encodeURIComponent(city)}`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "superpages");

  const cards = html.split(/<div[^>]+class="[^"]*(?:v-card|search-result-item)[^"]*"/i).slice(1);
  for (const card of cards) {
    if (businesses.length >= count * 2) break;
    const name =
      (/<a[^>]+class="[^"]*business-name[^"]*"[^>]*>([^<]{2,80})<\/a>/i.exec(card))?.[1]?.trim() ??
      (/<span[^>]+class="[^"]*business-name[^"]*"[^>]*>([^<]{2,80})<\/span>/i.exec(card))?.[1]?.trim();
    if (!name) continue;
    const phone = (/<a[^>]+href="tel:([^"]+)"/i.exec(card))?.[1]?.trim() ??
      (/<div[^>]+class="[^"]*phones[^"]*"[^>]*>[\s\S]{0,50}?([+\d][(\d\s\-)\.]{6,18}\d)/i.exec(card))?.[1]?.trim() ?? "";
    const website = (/<a[^>]+class="[^"]*track-visit-website[^"]*"[^>]+href="([^"]+)"/i.exec(card))?.[1]?.trim() ?? "";
    const address = (/<span[^>]+class="[^"]*street-address[^"]*"[^>]*>([^<]+)<\/span>/i.exec(card))?.[1]?.trim() ?? "";
    businesses.push({ businessName: name, phone, website, address, city, country, category, source: "superpages", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── SCRAPER 14: Bark.com (global service marketplace) ───────────────────────

async function scrapeBark(category: string, city: string, country: string, count: number): Promise<ScrapedBusiness[]> {
  const countryCode = (/\b(uk|united kingdom|england|scotland|wales)\b/i.test(country)) ? "gb"
    : (/\b(canada)\b/i.test(country)) ? "ca"
    : (/\b(australia)\b/i.test(country)) ? "au"
    : (/\b(ireland)\b/i.test(country)) ? "ie"
    : "us";
  const catSlug = category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const citySlug = city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const url = `https://www.bark.com/en/${countryCode}/near-me/${catSlug}/${citySlug}/`;
  const html = await browserFetch(url);
  const businesses: ScrapedBusiness[] = schemasToBusinesses(extractJsonLd(html), category, city, country, "bark");

  // Bark Next.js data
  const nextMatch = /<script id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/i.exec(html);
  if (nextMatch) {
    try {
      const data = JSON.parse(nextMatch[1]);
      const pros: any[] =
        data?.props?.pageProps?.profiles ??
        data?.props?.pageProps?.professionals ??
        data?.props?.pageProps?.sellers ?? [];
      for (const pro of pros) {
        const name = pro?.name ?? pro?.display_name ?? pro?.businessName;
        if (!name) continue;
        businesses.push({
          businessName: String(name),
          phone: pro.phone ?? "",
          website: pro.website ?? pro.url ?? "",
          address: pro.location ?? pro.address ?? "",
          city, country, category, source: "bark", email: pro.email ?? "",
        });
      }
    } catch {}
  }

  // HTML fallback
  const nameRe = /<(?:h[23]|span)[^>]+class="[^"]*(?:profile-name|seller-name|pro-name)[^"]*"[^>]*>([^<]{2,80})<\/(?:h[23]|span)>/gi;
  let m: RegExpExecArray | null;
  while ((m = nameRe.exec(html)) !== null) {
    const name = m[1].trim();
    if (name.length >= 2) businesses.push({ businessName: name, phone: "", website: "", address: "", city, country, category, source: "bark", email: "" });
  }

  return dedup(businesses).slice(0, count);
}

// ─── Email extraction from websites ──────────────────────────────────────────

const SKIP_EMAIL = /noreply|no-reply|donotreply|unsubscribe|privacy|legal|abuse|spam|webmaster|admin@|sentry\.io|cloudflare|wix\.com|squarespace|shopify|wordpress|example\.com|test@|@yelp\.|@manta\.|@hotfrog\.|@yell\.|foursquare|@tripadvisor\.|@bbb\.|@thumbtack\.|@bark\.|@superpages\.|@cylex\.|@yellowpages\./i;

// Directory domains whose URLs we should NOT try to scrape for a business email
const SKIP_WEBSITE = /^https?:\/\/(?:www\.)?(yelp\.com|manta\.com|hotfrog\.|yell\.com|foursquare\.com|yellowpages\.|bing\.com|google\.com|facebook\.com|instagram\.com|twitter\.com|linkedin\.com|tripadvisor\.com|bbb\.org|thumbtack\.com|bark\.com|superpages\.com|cylex\.)/i;

async function scrapeEmailFromSite(rawUrl: string): Promise<string> {
  if (!rawUrl || SKIP_WEBSITE.test(rawUrl)) return "";
  const fullUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  const tryFetch = async (u: string): Promise<string> => {
    try {
      const r = await Promise.race([
        fetch(u, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; DevStudio/1.0)",
            "Accept": "text/html",
          },
        }),
        new Promise<never>((_, rj) => setTimeout(() => rj(new Error("timeout")), 8000)),
      ]) as Response;
      if (!r.ok) return "";
      const html = await r.text();

      // Priority 1: explicit mailto: href links (most reliable — real contact emails)
      const mailtoRe = /href="mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})"/gi;
      let mm: RegExpExecArray | null;
      while ((mm = mailtoRe.exec(html)) !== null) {
        if (!SKIP_EMAIL.test(mm[1])) return mm[1].toLowerCase();
      }

      // Priority 2: email addresses anywhere in the HTML
      const emails = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? [];
      const found = emails.find(e => !SKIP_EMAIL.test(e));
      return found?.toLowerCase() ?? "";
    } catch { return ""; }
  };

  // Try main page first
  const fromMain = await tryFetch(fullUrl);
  if (fromMain) return fromMain;

  // Probe common contact/about pages
  try {
    const origin = new URL(fullUrl).origin;
    for (const path of [
      "/contact", "/contact-us", "/contact-us/", "/contacts",
      "/about", "/about-us", "/about/",
      "/get-in-touch", "/reach-us", "/our-team", "/team", "/staff",
    ]) {
      const found = await tryFetch(`${origin}${path}`);
      if (found) return found;
    }
  } catch {}

  return "";
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export interface ScrapeResult {
  businesses: ScrapedBusiness[];
  /** Which sources returned at least one result */
  sources: string[];
  /** Per-source errors for diagnostics */
  errors: Record<string, string>;
}

/**
 * Run all 8 directory scrapers in parallel, merge + deduplicate results,
 * then enrich each business with a real contact email scraped from its website.
 */
/**
 * Run all 14 directory scrapers in parallel, merge + deduplicate results,
 * then enrich each business with a real contact email scraped from its website.
 *
 * Sources:
 *  1  Yelp          6  Yell.com (UK)       11 Thumbtack (US)
 *  2  Yellow Pages  7  Foursquare          12 Cylex (intl)
 *  3  Google GMB    8  Bing Local          13 SuperPages (US)
 *  4  Manta         9  TripAdvisor         14 Bark.com (global)
 *  5  Hotfrog       10 BBB (US/CA)
 */
export async function scrapeBusinessDirectories(
  category: string,
  city: string,
  country: string,
  count: number
): Promise<ScrapeResult> {
  // No artificial cap — caller decides how many it wants
  const needed = count;

  const scrapers: Array<[string, () => Promise<ScrapedBusiness[]>]> = [
    ["yelp",         () => scrapeYelp(category, city, country, needed)],
    ["yellowpages",  () => scrapeYellowPages(category, city, country, needed)],
    ["google",       () => scrapeGoogleLocal(category, city, country, needed)],
    ["manta",        () => scrapeManta(category, city, country, needed)],
    ["hotfrog",      () => scrapeHotfrog(category, city, country, needed)],
    ["yell",         () => scrapeYell(category, city, country, needed)],
    ["foursquare",   () => scrapeFoursquare(category, city, country, needed)],
    ["bing",         () => scrapeBingLocal(category, city, country, needed)],
    ["tripadvisor",  () => scrapeTripAdvisor(category, city, country, needed)],
    ["bbb",          () => scrapeBBB(category, city, country, needed)],
    ["thumbtack",    () => scrapeThumbtrack(category, city, country, needed)],
    ["cylex",        () => scrapeCylex(category, city, country, needed)],
    ["superpages",   () => scrapeSuperPages(category, city, country, needed)],
    ["bark",         () => scrapeBark(category, city, country, needed)],
  ];

  const settled = await Promise.allSettled(scrapers.map(([, fn]) => fn()));

  const all: ScrapedBusiness[] = [];
  const sources: string[] = [];
  const errors: Record<string, string> = {};

  scrapers.forEach(([name], i) => {
    const r = settled[i];
    if (r.status === "fulfilled") {
      if (r.value.length > 0) {
        all.push(...r.value);
        sources.push(name);
      }
    } else {
      errors[name] = String((r.reason as Error)?.message ?? r.reason);
    }
  });

  // Cross-source dedup by name, then also by email to avoid duplicate outreach
  const nameDeduped = dedup(all);
  const emailSeen = new Set<string>();
  const deduped = nameDeduped.filter(b => {
    if (!b.email) return true; // keep — email will be found during enrichment
    const key = b.email.toLowerCase();
    if (emailSeen.has(key)) return false;
    emailSeen.add(key);
    return true;
  });

  // Enrich with emails — 10 concurrent for speed
  const CONCURRENCY = 10;
  for (let i = 0; i < deduped.length; i += CONCURRENCY) {
    await Promise.all(
      deduped.slice(i, i + CONCURRENCY).map(async biz => {
        if (!biz.email && biz.website) {
          biz.email = await scrapeEmailFromSite(biz.website);
        }
      })
    );
  }

  // Final dedup by email after enrichment (multiple businesses may share a domain)
  const finalEmailSeen = new Set<string>();
  const finalBusinesses = deduped.filter(b => {
    if (!b.email) return true;
    const key = b.email.toLowerCase();
    if (finalEmailSeen.has(key)) return false;
    finalEmailSeen.add(key);
    return true;
  });

  return { businesses: finalBusinesses, sources, errors };
}
