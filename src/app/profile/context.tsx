import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PlayerProfile {
  avatar: string | null; // Base64 or URL
  bio: string;
  favoriteSpot: string;
  yearsSkating: number;
  stance: "regular" | "goofy";
  favoriteTrick: string;
}

interface ProfileContextType {
  profile: PlayerProfile;
  updateProfile: (updates: Partial<PlayerProfile>) => void;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => void;
  getDefaultAvatar: () => string;
}

const PROFILE_STORAGE_KEY = "street-champz-profile";

const DEFAULT_PROFILE: PlayerProfile = {
  avatar: null,
  bio: "",
  favoriteSpot: "",
  yearsSkating: 0,
  stance: "regular",
  favoriteTrick: "",
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load profile:", e);
      }
    }
  }, []);

  // Save profile to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<PlayerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const uploadAvatar = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        reject(new Error("Please select an image file"));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error("Image must be less than 5MB"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        // Create an image to resize if needed
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const maxSize = 256;
          let width = img.width;
          let height = img.height;

          // Scale down if needed
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8);
          updateProfile({ avatar: resizedBase64 });

          // Also save to backend
          try {
            const token = localStorage.getItem("token");
            if (token) {
              await fetch(import.meta.env["VITE_API_BASE"] + "/user/avatar", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + token,
                },
                body: JSON.stringify({ avatar: resizedBase64 }),
              });
            }
          } catch {}

          resolve();
        };
        img.onerror = () => reject(new Error("Failed to process image"));
        img.src = base64;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const removeAvatar = () => {
    updateProfile({ avatar: null });
    try {
      const token = localStorage.getItem("token");
      if (token) {
        fetch(import.meta.env["VITE_API_BASE"] + "/user/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
          body: JSON.stringify({ avatar: null }),
        });
      }
    } catch {}
  };

  // Generate a fun default avatar SVG based on username
  const getDefaultAvatar = () => {
    return "default"; // Signal to use the default character
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      updateProfile,
      uploadAvatar,
      removeAvatar,
      getDefaultAvatar,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}

