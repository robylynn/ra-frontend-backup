// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

export { default } from "next-auth/middleware";

export const config = {
  matcher: "/((?!ws$).*)", // match all paths except /ws
};
