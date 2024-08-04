// Frontend Web Application for RA Products
// Developed by R2 Labs

// Modal.js
import React, { ReactNode } from "react";
// import '@/lib/components/client_components/Modal.css';
// import { R2Button } from "./click_button";

interface ModalInterface {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ className, isOpen, onClose, children }: ModalInterface) => {
  if (!isOpen) return null;

  return (
    // <div className="modal-overlay">
    <div
      className={`flex fixed inset-0 bg-black/[0.7] justify-center items-center z-1000 ${className ? className : ""}`}
    >
      {/* <div className="modal-content"> */}
      <div className="bg-white p-[20px] border-[8px] relative w-[25%]">
        {/* <button className="modal-close" onClick={onClose}>×</button> */}
        <button
          className="absolute top-[10px] right-[10px] text-[24px] bg-none border-none cursor-pointer"
          onClick={onClose}
        >
          ×
        </button>
        {/* <R2Button
          className='absolute top-[10px] right-[10px] text-[24px]'
          text={""}
          onClick={onClose}
        /> */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
