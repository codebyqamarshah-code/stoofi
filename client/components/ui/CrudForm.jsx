"use client";
import { useState } from "react";
import { Button } from "./button";
import { Loader2 } from "lucide-react";

export function CrudForm({ 
  title, 
  buttonText = "Save", 
  onSubmit, 
  isLoading = false,
  children 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      {title && <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">{title}</h2>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
