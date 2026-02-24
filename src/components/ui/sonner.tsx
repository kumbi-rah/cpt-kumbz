import { Toaster as Sonner, toast } from "sonner";
import React from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#FAF7F2",
          border: "1px solid rgba(200,131,42,0.3)",
          borderRadius: 10,
          boxShadow: "0 4px 16px rgba(80,60,30,0.18)",
          color: "#2A2218",
          fontSize: 13,
        },
        classNames: {
          toast: "group toast",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!border-l-[3px] !border-l-[#C8832A]",
          error: "!border-l-[3px] !border-l-[#8B3A2A]",
          info: "!border-l-[3px] !border-l-[#4A7A82]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
