
/**
 * A simple mock hate speech detection utility
 * In a real application, this would integrate with an AI service
 */

// List of words that might indicate problematic content
const sensitiveWords = [
  "homo", "lesbian", "bastard", "fag", "nigger", "slut", "whore", "dyke", 
  "tranny", "retard", "cripple", "gimp", "mongoloid", "spastic", "bitch", 
  "cunt", "asshole", "fucktard", "cock", "dick", "shithead", "cocksucker", 
  "motherfucker", "twat", "freak", "psycho", "crazed", "nazi", "terrorist", 
  "racist", "racism", "bigot", "xenophobic", "homophobic", "sexist", "anti-semite", 
  "pedophile", "incest", "freakshow", "troll", "skank", "hooker", "prostitute", 
  "trash", "loser", "crackhead", "junkie", "addict", "drug addict", "stupid", 
  "idiot", "retarded", "moron", "imbecile", "idiot", "slimeball", "clown", 
  "bastardized", "arsehole", "pussy", "wanker", "dickhead", "bitchy", "fuckboy", 
  "whigger", "gook", "spic", "chink", "beaner", "redneck", "hillbilly", "cracker", 
  "kike", "gypsy", "faggy", "queer", "tranny", "cocksucker", "slutbag", "turd", 
  "cockwomble", "cuntface", "whorebag", "buttfucker", "penishead", "twatwaffle", 
  "fucktard", "dicknose", "fuckstick", "numbnuts", "douchebag", "asswipe", 
  "skanks", "shithead", "assclown", "assbag", "dildo", "faggotry", "homoerotic", 
  "gaylord", "sissy", "scumbag", "gimp", "smelly", "dirty", "punk", "assmuncher", 
  "douche", "assclown", "blowjob", "blowjobber", "masturbator", "twatsicle", 
  "whorehouse", "cockblock", "buttlicker", "nutcase", "cumguzzler", "fucktwat", 
  "fistfuck", "dickheadery", "bimbo", "pimp", "chick", "bimbo", "freakshow", 
  "fuckhole", "twathead", "ballbag", "dicklicker", "buttface", "asshat", "dickrag", 
  "pussyfucker", "dickbag", "chode", "cumbrain", "crackwhore", "cockroach", 
  "cuntwomble", "prickface", "fuckface", "fucknugget", "cockrider", "smegma", 
  "cumdump", "arsebandit", "ballbagger", "dickwads", "fisting", "cumshot", 
  "cocksmoker", "analbead", "vaginal", "buttplug", "deepthroat", "assholey", 
  "clit", "clitorally", "cunnilingus", "pussylicker", "slutty", "whorehouse", 
  "wankstain", "cuntmuffin", "cocksniffer", "spunkbucket", "cocksucker", 
  "cockwhore", "bastardized", "fistfucking", "fucking cunt", "assholeish", 
  "smut", "fuckedup", "cuntstain", "ballsack", "cockroach", "clitface", 
  "prickhead", "shitmuncher", "cocknose", "freakface", "fucking idiot", "shitforbrains", 
  "buttass", "fags", "cockface", "skankbag", "arsewipe", "dickwad", "cockcheese", 
  "moron", "imbecile", "arseclown", "assholey", "shitstain", "cocksucker", 
  "fuckwit", "lame", "blowjobber", "cuntlicker", "mothafucka", "jizz", 
  "assjacker", "twatbag", "testicle", "cumdumper", "spunk", "ejaculate", "fuckingretard", 
  "dickheadish", "cuntfuck", "wankoff", "shitspreader", "fatass", "uglyass", 
  "assspreader", "cuntbox", "slutbucket", "analhole", "buttstuff", "cuntass", 
  "queef", "dickstorm", "dickhole", "sluttybitch", "buttcrack", "assholefuck", 
  "cumfreak", "stinkypussy", "suckmydick", "fuckslut", "assface", "faggot", 
  "shitlicker", "clitlicker", "cockwhore", "dickrider", "pussywhore", "ballshagger", 
  "goddamn", "shitsucker", "assfucker", "turdlicker", "anallicker", "buttlick", 
  "bastardize", "suckmycock", "boobjob", "fistme", "cocklips", "cockgobbler", 
  "jizzwaste", "pussyass", "penisface", "bitchface", "whorebag", "dickface", 
  "chocodick", "buttsex", "shitjob", "pissjob", "cockspanker", "poophead", 
  "cumshitter", "cuntfuckery", "cumfart", "assclapper","fuck","dicktastic", "buttjuice"
  // Add more words as needed
];

export interface HateSpeechResult {
  isHateSpeech: boolean;
  confidence: number;
  reason?: string;
}

/**
 * Checks text for potential hate speech using a basic keyword matching
 * This is a very simple implementation and not suitable for production
 * A real implementation would use ML/AI models
 */
export function detectHateSpeech(text: string): HateSpeechResult {
  if (!text) {
    return { isHateSpeech: false, confidence: 0 };
  }
  
  const lowerText = text.toLowerCase();
  const foundWords = sensitiveWords.filter(word => lowerText.includes(word));
  
  // Calculate confidence based on number of found words and their context
  if (foundWords.length > 0) {
    // More sophisticated calculation that considers word count
    const textLength = lowerText.split(' ').length;
    const wordDensity = foundWords.length / textLength;
    const confidence = Math.min(0.3 + (wordDensity * 2) + (foundWords.length * 0.15), 0.95);
    
    return {
      isHateSpeech: confidence > 0.3,
      confidence,
      reason: `Detected sensitive language: ${foundWords.join(', ')}` 
    };
  }
  
  return { isHateSpeech: false, confidence: 0 };
}
