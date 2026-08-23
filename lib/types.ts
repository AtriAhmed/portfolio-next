export type About = { _id: string; title: string; content: string; order?: number; isVisible?: boolean };
export type Experience = {
  _id: string;
  name: string;
  position: string;
  date: string;
  description: string;
  image?: string;
  showInCV?: boolean;
  order?: number;
  isVisible?: boolean;
};
export type Work = {
  _id: string;
  name: string;
  description: string;
  technologies: string;
  image?: string;
  link?: string;
  showInCV?: boolean;
  order?: number;
  isVisible?: boolean;
};
export type Skill = { _id: string; name: string; level: string; type: string; order?: number; isVisible?: boolean };
export type SkillType = { _id: string; name: string; skills: Skill[]; order?: number; isVisible?: boolean };
export type Contact = {
  _id: string;
  name: string;
  lastname: string;
  title: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  github?: string;
  linkedin?: string;
  website?: string;
  image?: string;
};
export type Education = {
  _id: string;
  certificate: string;
  institute: string;
  date: string;
  location: string;
};
