// Lightweight Swahili/English detector
const swahiliKeywords = [
  'habari', 'karibu', 'tafadhali', 'asante', 'ndiyo', 'hapana',
  'nataka', 'ninahitaji', 'msaada', 'miadi', 'daktari', 'leo',
  'kesho', 'saa', 'asubuhi', 'jioni', 'usiku', 'jina', 'simu',
];

const detectLanguage = (text) => {
  const lower = text.toLowerCase();
  const hits = swahiliKeywords.filter((word) => lower.includes(word));
  return hits.length >= 2 ? 'sw' : 'en';
};

module.exports = { detectLanguage };
