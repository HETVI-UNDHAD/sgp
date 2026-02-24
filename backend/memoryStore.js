// In-memory storage fallback when MongoDB is not available
const memoryStore = {
  users: [],
  groups: [],
  files: [],
  messages: []
};

let userIdCounter = 1;
let groupIdCounter = 1;
let fileIdCounter = 1;
let messageIdCounter = 1;

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

module.exports = { memoryStore, generateId };
