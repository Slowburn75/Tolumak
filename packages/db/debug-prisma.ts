import prisma from "./src/index";

console.log("Available models:", Object.keys(prisma).filter(k => k[0] !== '_'));
