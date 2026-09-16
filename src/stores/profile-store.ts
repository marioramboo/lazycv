import { create } from 'zustand';
import { db } from '../lib/db';
import { UserProfile, PersonalInfo, Education, Experience, Skill, Certification } from '../types/profile';

interface ProfileState extends UserProfile {
  isLoaded: boolean;
  lastSaved: string | null;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: Partial<UserProfile>) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  
  // Education
  addEducation: (edu: Education) => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (startIndex: number, endIndex: number) => void;
  
  // Experience
  addExperience: (exp: Experience) => void;
  updateExperience: (id: string, data: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (startIndex: number, endIndex: number) => void;
  
  // Skills
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  
  // Certifications
  addCertification: (cert: Certification) => void;
  updateCertification: (id: string, data: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
}

const defaultProfile: UserProfile = {
  id: 'default',
  personalInfo: { fullName: '', phone: '', email: '', city: '', country: '', linkedinUrl: '', websiteUrl: '' },
  education: [],
  experience: [],
  skills: [],
  certifications: [],
  updatedAt: new Date().toISOString()
};

let saveTimeout: NodeJS.Timeout;

export const useProfileStore = create<ProfileState>((set, get) => ({
  ...defaultProfile,
  isLoaded: false,
  lastSaved: null,

  loadProfile: async () => {
    try {
      const profile = await db.profile.get('default');
      if (profile) {
        set({ ...profile, isLoaded: true, lastSaved: profile.updatedAt });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.error('Failed to load profile', e);
      set({ isLoaded: true });
    }
  },

  saveProfile: (updates) => {
    set((state) => {
      const nextState = { ...state, ...updates, updatedAt: new Date().toISOString() };
      
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(async () => {
        try {
          const state = get();
          const profileData: UserProfile = {
            id: state.id,
            personalInfo: state.personalInfo,
            education: state.education,
            experience: state.experience,
            skills: state.skills,
            certifications: state.certifications,
            updatedAt: state.updatedAt,
          };
          await db.profile.put(profileData);
          set({ lastSaved: profileData.updatedAt });
        } catch (error) {
          console.error("Failed to save profile to dexie:", error);
        }
      }, 500);

      return nextState;
    });
  },

  updatePersonalInfo: (info) => {
    const { personalInfo, saveProfile } = get();
    saveProfile({ personalInfo: { ...personalInfo, ...info } });
  },

  addEducation: (edu) => {
    const { education, saveProfile } = get();
    saveProfile({ education: [...education, edu] });
  },
  updateEducation: (id, data) => {
    const { education, saveProfile } = get();
    saveProfile({ education: education.map((e) => e.id === id ? { ...e, ...data } : e) });
  },
  removeEducation: (id) => {
    const { education, saveProfile } = get();
    saveProfile({ education: education.filter((e) => e.id !== id) });
  },
  reorderEducation: (startIndex, endIndex) => {
    const { education, saveProfile } = get();
    const result = Array.from(education);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    saveProfile({ education: result });
  },

  addExperience: (exp) => {
    const { experience, saveProfile } = get();
    saveProfile({ experience: [...experience, exp] });
  },
  updateExperience: (id, data) => {
    const { experience, saveProfile } = get();
    saveProfile({ experience: experience.map((e) => e.id === id ? { ...e, ...data } : e) });
  },
  removeExperience: (id) => {
    const { experience, saveProfile } = get();
    saveProfile({ experience: experience.filter((e) => e.id !== id) });
  },
  reorderExperience: (startIndex, endIndex) => {
    const { experience, saveProfile } = get();
    const result = Array.from(experience);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    saveProfile({ experience: result });
  },

  addSkill: (skill) => {
    const { skills, saveProfile } = get();
    saveProfile({ skills: [...skills, skill] });
  },
  updateSkill: (id, data) => {
    const { skills, saveProfile } = get();
    saveProfile({ skills: skills.map((s) => s.id === id ? { ...s, ...data } : s) });
  },
  removeSkill: (id) => {
    const { skills, saveProfile } = get();
    saveProfile({ skills: skills.filter((s) => s.id !== id) });
  },

  addCertification: (cert) => {
    const { certifications, saveProfile } = get();
    saveProfile({ certifications: [...certifications, cert] });
  },
  updateCertification: (id, data) => {
    const { certifications, saveProfile } = get();
    saveProfile({ certifications: certifications.map((c) => c.id === id ? { ...c, ...data } : c) });
  },
  removeCertification: (id) => {
    const { certifications, saveProfile } = get();
    saveProfile({ certifications: certifications.filter((c) => c.id !== id) });
  }
}));
