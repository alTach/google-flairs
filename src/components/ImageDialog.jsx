"use client";

import { useEffect, useRef } from "react";

export function ImageDialog({ isOpen, src, alt, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialogRef.current?.close();
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className="w-[min(92vw,1120px)] max-w-[1120px] m-auto p-0 border-0 bg-transparent backdrop:bg-slate-900/70 backdrop:backdrop-blur-md"
    >
      <div className="relative m-0 p-3 sm:p-4 md:p-[18px] rounded-[22px] md:rounded-[28px] border border-white/15 bg-gradient-to-b from-slate-900/95 to-slate-900/80 shadow-[0_32px_100px_rgba(15,23,42,0.34)] flex items-center justify-center">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-10 w-10.5 h-10.5 border-0 rounded-full bg-white/10 text-white text-2xl leading-none cursor-pointer flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          ×
        </button>
        {src && (
          <img
            src={src}
            alt={alt}
            className="block w-full max-h-[min(84vh,980px)] rounded-2xl object-contain bg-white/5"
          />
        )}
      </div>
    </dialog>
  );
}
