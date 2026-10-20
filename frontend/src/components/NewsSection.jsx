import React from "react";
import MinnalNewsMobile from "./MinnalNewsMobile";

export default function NewsSection({ lang = "ta", onClose }) {
  return (
    <div className="w-full flex justify-center py-2 animate-fade-in">
      <MinnalNewsMobile onClose={onClose} isModal={false} lang={lang} />
    </div>
  );
}
