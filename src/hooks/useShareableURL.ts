import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function useShareableURL(parameters: any) {
  const [shareURL, setShareURL] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(parameters).forEach(([key, value]) => {
      params.set(key, String(value));
    });
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    setShareURL(url);
  }, [parameters]);

  const copyShareURL = async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const loadFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const loaded: any = {};
    
    params.forEach((value, key) => {
      const num = parseFloat(value);
      loaded[key] = isNaN(num) ? value : num;
    });
    
    if (Object.keys(loaded).length > 0) {
      toast.success("Parameters loaded from URL!");
      return loaded;
    }
    return null;
  };

  return { shareURL, copyShareURL, loadFromURL };
}
