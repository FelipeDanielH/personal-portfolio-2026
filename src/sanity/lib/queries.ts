import { defineQuery } from "next-sanity";

export const PORTFOLIO_QUERY = defineQuery(`{
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    name,
    role,
    eyebrow,
    summary,
    bio,
    location,
    availability,
    email,
    phone,
    "cvUrl": cv.asset->url,
    "avatar": select(defined(avatar.asset) => {
      "url": avatar.asset->url,
      "alt": avatar.alt
    }),
    socialLinks[]{label, url},
    aboutSections[]{
      "id": id.current,
      title,
      body
    },
    seo{title, description}
  },
  "skills": *[_type == "skillCategory"] | order(order asc){
    "id": _id,
    title,
    description,
    order,
    skills[]{name, highlights}
  },
  "experience": *[_type == "experience"] | order(order asc){
    "id": _id,
    title,
    company,
    period,
    location,
    summary,
    responsibilities,
    achievements,
    technologies,
    projectType,
    order
  },
  "projects": *[_type == "project"] | order(order asc){
    "id": _id,
    name,
    description,
    longDescription,
    technologies,
    frameworks,
    languages,
    roles,
    links[]{label, url},
    status,
    year,
    featured,
    order,
    "image": select(defined(image.asset) => {
      "url": image.asset->url,
      "alt": image.alt
    })
  },
  "credentials": *[_type == "credential"] | order(order asc){
    "id": _id,
    type,
    title,
    institution,
    year,
    date,
    description,
    details,
    duration,
    location,
    certificateUrl,
    skills,
    status,
    order
  }
}`);
