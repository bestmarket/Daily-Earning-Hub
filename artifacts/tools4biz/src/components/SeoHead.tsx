import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
}

export default function SeoHead({ title, description, keywords, canonicalPath, ogImage }: SeoHeadProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    if (ogImage) {
      setMeta("og:image", ogImage, true);
      setMeta("og:image:width", "1200", true);
      setMeta("og:image:height", "630", true);
      setMeta("og:image:type", "image/png", true);
    }

    setMeta("twitter:card", ogImage ? "summary_large_image" : "summary");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (ogImage) setMeta("twitter:image", ogImage);

    if (canonicalPath) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", `https://tools4biz.com${canonicalPath}`);
    }
  }, [title, description, keywords, canonicalPath, ogImage]);

  return null;
}
