import express from 'express';
import path from 'path';
import fs from 'fs';
import net from 'net';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
let PORT = 3000;

// Dynamic port finder to ensure compatibility across localhost and external platforms
function getAvailablePort(desiredPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(getAvailablePort(desiredPort + 1));
      } else {
        resolve(desiredPort);
      }
    });
    server.once('listening', () => {
      server.close(() => {
        resolve(desiredPort);
      });
    });
    server.listen(desiredPort, '0.0.0.0');
  });
}

// Middleware for JSON
app.use(express.json({ limit: '10mb' }));

// Database filepath
const DB_FILE = path.join(process.cwd(), 'db_store.json');

// Helper to initialize local persistent DB
interface DBStore {
  users: any[];
  counselorSessions: any[];
  chatHistory: Record<string, any[]>;
  customCareers: any[];
  systemLog: any[];
}

function loadDB(): DBStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading database store:', error);
  }
  
  // Default Seed Data
  const defaultStore: DBStore = {
    users: [
      {
        id: 'student-1',
        email: 'student@careerai.pro',
        password: 'password123', // In a production app with auth, we use bcrypt. For local sandboxing, plain is safe.
        name: 'Alex Rivera',
        role: 'student',
        bio: 'Computer Science sophomore passionate about machine learning and cloud development.',
        academicBackground: 'B.S. in Computer Science (GPA: 3.8/4.0)',
        skills: ['Python', 'JavaScript', 'SQL', 'Data structures'],
        interests: ['Artificial Intelligence', 'Web Development', 'Cloud Systems'],
        careerGoals: 'Build scalable AI applications and lead an engineering team.',
        profileCompleted: true,
        mbti: 'INTJ',
        bigFive: {
          openness: 85,
          conscientiousness: 90,
          extraversion: 40,
          agreeableness: 70,
          neuroticism: 30
        },
        aptitudeScore: 88
      },
      {
        id: 'counselor-1',
        email: 'counselor@careerai.pro',
        password: 'password123',
        name: 'Dr. Evelyn Carter',
        role: 'counselor',
        bio: 'Senior Career Psychologist with 12+ years of guiding students in tech, healthcare, and finance.',
        academicBackground: 'Ph.D. in Counseling Psychology, Stanford University',
        skills: ['Mentorship', 'Behavioral Therapy', 'Resume Consulting', 'SaaS Careers'],
        interests: [],
        careerGoals: '',
        profileCompleted: true
      },
      {
        id: 'admin-1',
        email: 'admin@careerai.pro',
        password: 'password123',
        name: 'Admin Supervisor',
        role: 'admin',
        bio: 'Chief System Administrator of CareerAI Pro.',
        skills: [],
        interests: [],
        careerGoals: '',
        profileCompleted: true
      }
    ],
    counselorSessions: [
      {
        id: 'session-1',
        studentId: 'student-1',
        studentName: 'Alex Rivera',
        counselorId: 'counselor-1',
        counselorName: 'Dr. Evelyn Carter',
        dateTime: '2026-08-25T14:00:00.000Z',
        status: 'scheduled',
        notes: 'Initial strategy meeting to map out AI Research assistantships.'
      }
    ],
    chatHistory: {},
    customCareers: [],
    systemLog: [
      { timestamp: new Date().toISOString(), message: 'Platform database initialized with seed data' }
    ]
  };
  
  saveDB(defaultStore);
  return defaultStore;
}

function saveDB(store: DBStore) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database store:', error);
  }
}

const db = loadDB();

// Dynamic Questions Data
const ASSESSMENT_QUESTIONS = [
  // MBTI
  { id: 'mbti-1', category: 'personality', type: 'mbti', questionText: 'Do you feel more energized after spending time with a vibrant group of people, or when reflecting in a quiet setting?', options: [{ label: 'Vibrant group of people (Extraversion)', value: 'E' }, { label: 'Quiet individual setting (Introversion)', value: 'I' }] },
  { id: 'mbti-2', category: 'personality', type: 'mbti', questionText: 'When examining facts, do you focus more on immediate realities and specific details, or on patterns, connections, and future possibilities?', options: [{ label: 'Immediate realities and data (Sensing)', value: 'S' }, { label: 'Patterns, meanings, and ideas (Intuition)', value: 'N' }] },
  { id: 'mbti-3', category: 'personality', type: 'mbti', questionText: 'When making important decisions, do you rely more on objective analysis, logic, and fairness, or do you weigh feelings, personal values, and harmony?', options: [{ label: 'Logic, data, and objectivity (Thinking)', value: 'T' }, { label: 'Values, relationships, and human impact (Feeling)', value: 'F' }] },
  { id: 'mbti-4', category: 'personality', type: 'mbti', questionText: 'Do you prefer to organize your life with clear schedules, plans, and structures, or do you prefer to keep options open, adapt to events, and stay spontaneous?', options: [{ label: 'Detailed schedules and closure (Judging)', value: 'J' }, { label: 'Spontaneous adaptation and flexibility (Perceiving)', value: 'P' }] },
  
  // Big Five
  { id: 'b5-1', category: 'personality', type: 'bigfive', questionText: 'I have a rich imagination, enjoy art/literature, and appreciate novel, abstract ideas.', options: [{ label: 'Strongly Disagree', value: '1' }, { label: 'Disagree', value: '2' }, { label: 'Neutral', value: '3' }, { label: 'Agree', value: '4' }, { label: 'Strongly Agree', value: '5' }] }, // Openness
  { id: 'b5-2', category: 'personality', type: 'bigfive', questionText: 'I am always well-prepared, methodical, pay close attention to detail, and meet deadlines diligently.', options: [{ label: 'Strongly Disagree', value: '1' }, { label: 'Disagree', value: '2' }, { label: 'Neutral', value: '3' }, { label: 'Agree', value: '4' }, { label: 'Strongly Agree', value: '5' }] }, // Conscientiousness
  { id: 'b5-3', category: 'personality', type: 'bigfive', questionText: 'I am outgoing, talkative, feel comfortable in crowds, and easily start conversations.', options: [{ label: 'Strongly Disagree', value: '1' }, { label: 'Disagree', value: '2' }, { label: 'Neutral', value: '3' }, { label: 'Agree', value: '4' }, { label: 'Strongly Agree', value: '5' }] }, // Extraversion
  { id: 'b5-4', category: 'personality', type: 'bigfive', questionText: 'I sympathize with others’ feelings, have a soft heart, and actively strive for social cooperation.', options: [{ label: 'Strongly Disagree', value: '1' }, { label: 'Disagree', value: '2' }, { label: 'Neutral', value: '3' }, { label: 'Agree', value: '4' }, { label: 'Strongly Agree', value: '5' }] }, // Agreeableness
  { id: 'b5-5', category: 'personality', type: 'bigfive', questionText: 'I easily get stressed out, worry about small things, or feel frequent mood fluctuations.', options: [{ label: 'Strongly Disagree', value: '1' }, { label: 'Disagree', value: '2' }, { label: 'Neutral', value: '3' }, { label: 'Agree', value: '4' }, { label: 'Strongly Agree', value: '5' }] }, // Neuroticism

  // Aptitude
  { id: 'apt-1', category: 'aptitude', type: 'aptitude', questionText: 'If 5 machines can package 5 crates in 5 minutes, how many minutes will it take 100 machines to package 100 crates?', options: [{ label: '100 minutes', value: 'A' }, { label: '20 minutes', value: 'B' }, { label: '5 minutes', value: 'C' }, { label: '1 minute', value: 'D' }], correctOption: 'C' },
  { id: 'apt-2', category: 'aptitude', type: 'aptitude', questionText: 'All widgets are gadgets. Some gadgets are gizmos. Therefore, some widgets are definitely gizmos.', options: [{ label: 'True', value: 'A' }, { label: 'False', value: 'B' }, { label: 'Inconclusive / Cannot be determined', value: 'C' }], correctOption: 'C' },
  { id: 'apt-3', category: 'aptitude', type: 'aptitude', questionText: 'A laptop price is reduced by 20% for a seasonal sale. The sale price is $800. What was the original price?', options: [{ label: '$1,000', value: 'A' }, { label: '$960', value: 'B' }, { label: '$880', value: 'C' }, { label: '$1,200', value: 'D' }], correctOption: 'A' },
  { id: 'apt-4', category: 'aptitude', type: 'aptitude', questionText: 'Identify the odd one out from the following professions:', options: [{ label: 'Architect', value: 'A' }, { label: 'Civil Engineer', value: 'B' }, { label: 'Building Inspector', value: 'C' }, { label: 'Landscape Painter', value: 'D' }], correctOption: 'D' }
];

// Lazy Cognitive Core Initialization & Fallback
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'ansar-build',
            }
          }
        });
        console.log('Cognitive Core client initialized successfully!');
      } catch (err) {
        console.error('Error initializing Cognitive Core Client:', err);
      }
    }
  }
  return aiClient;
}

// Robust JSON parser that strips markdown code blocks and catches syntax errors gracefully
function safeJSONParse(text: string, fallback: any): any {
  if (!text) return fallback;
  let cleanText = text.trim();
  
  // Strip Markdown JSON code fencing if present
  if (cleanText.startsWith('```')) {
    const lines = cleanText.split('\n');
    if (lines[0].startsWith('```json') || lines[0].startsWith('```')) {
      lines.shift();
    }
    if (lines[lines.length - 1].startsWith('```')) {
      lines.pop();
    }
    cleanText = lines.join('\n').trim();
  }
  
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn('JSON parsing failed. Attempted parsing text length:', cleanText.length);
    console.error('JSON Parse Error details:', e);
    return fallback;
  }
}

// Robust text generation with automatic model failover and parameter validation
async function generateContentWithRetry(contents: any, systemInstruction?: string, responseMimeType?: string) {
  const gemini = getGeminiClient();
  if (!gemini) throw new Error('Gemini API client not initialized');

  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const config: any = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }

      const response = await gemini.models.generateContent({
        model: modelName,
        contents,
        config
      });

      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Limit')) {
        console.log(`[Rate Limit] Cognitive Core model ${modelName} is rate-limited (429 Quota). Local premium fallback engine stands ready.`);
      } else {
        console.log(`[Notice] Cognitive Core model ${modelName} call: ${errMsg.slice(0, 120)}`);
      }
      lastError = err;
    }
  }

  throw lastError || new Error('All model generation attempts failed');
}

// REST APIs
// 1. AUTHENTICATION
app.post('/api/auth/signup', (req, res) => {
  const { email, password, confirmPassword, name, role } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Please provide email, password, and name.' });
  }

  // Admin accounts must NOT be publicly registerable
  if (role === 'admin') {
    return res.status(400).json({ error: 'Admin accounts cannot be publicly registered. Admins must be registered via the Admin Console.' });
  }

  // Validate password match
  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  // Password strength check: Min 6 chars, at least 1 letter and 1 number
  if (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters and contain both letters and numbers.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  // Generate simulated 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password, 10), // Secure Hash!
    name,
    role: role || 'student',
    profileCompleted: false,
    skills: [],
    interests: [],
    careerGoals: '',
    isVerified: false, // OTP Verification step required
    otpCode: otpCode,
    registeredAt: new Date().toISOString(),
    accountStatus: role === 'counselor' ? 'pending_approval' : 'active'
  };

  db.users.push(newUser);
  db.systemLog.push({ timestamp: new Date().toISOString(), message: `New user self-registered: ${name} (${role})` });
  saveDB(db);

  const { password: _, ...userNoPassword } = newUser;
  res.status(201).json({ 
    user: userNoPassword, 
    simulatedOtp: otpCode, 
    message: 'Registration successful! Verification code sent.' 
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otpCode } = req.body;
  if (!email || !otpCode) {
    return res.status(400).json({ error: 'Please provide email and verification OTP code.' });
  }

  const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User session not found.' });
  }

  const user = db.users[userIndex];
  if (user.otpCode !== otpCode) {
    return res.status(400).json({ error: 'Invalid verification OTP code.' });
  }

  // Successfully verified!
  db.users[userIndex].isVerified = true;
  db.users[userIndex].otpCode = undefined;
  
  db.systemLog.push({ timestamp: new Date().toISOString(), message: `Account verified successfully: ${user.name}` });
  saveDB(db);

  const { password: _, ...userNoPassword } = db.users[userIndex];
  res.json({ 
    user: userNoPassword, 
    token: `mock-jwt-${user.id}`,
    message: 'Account verified successfully!' 
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Check securely using bcrypt (with legacy plain-text fallback for seeded static profiles)
  const passwordMatch = bcrypt.compareSync(password, user.password) || user.password === password;
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Check if unverified. Only enforce on user-created profiles (seeded profiles don't have isVerified explicitly set to false)
  if (user.isVerified === false) {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = newOtp;
    saveDB(db);
    return res.status(403).json({
      error: 'Account email has not been verified yet.',
      requiresVerification: true,
      email: user.email,
      simulatedOtp: newOtp
    });
  }

  db.systemLog.push({ timestamp: new Date().toISOString(), message: `User logged in: ${user.name}` });
  saveDB(db);

  const { password: _, ...userNoPassword } = user;
  res.json({ user: userNoPassword, token: `mock-jwt-${user.id}` });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please provide your email address.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No user found with this email address.' });
  }

  const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = resetOtp;
  saveDB(db);

  res.json({
    message: 'Reset verification code sent!',
    simulatedOtp: resetOtp
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, otpCode, password, confirmPassword } = req.body;
  
  if (!email || !otpCode || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters and contain both letters and numbers.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (user.otpCode !== otpCode) {
    return res.status(400).json({ error: 'Invalid reset verification code.' });
  }

  // Update password
  user.password = bcrypt.hashSync(password, 10);
  user.otpCode = undefined;
  user.isVerified = true; // Auto-verify upon successful password reset verification
  
  db.systemLog.push({ timestamp: new Date().toISOString(), message: `Password reset successfully for: ${user.name}` });
  saveDB(db);

  res.json({ message: 'Password reset successfully!' });
});

// Admin database backup export API
app.get('/api/admin/export-db', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=db_store.json');
      const fileStream = fs.createReadStream(DB_FILE);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: 'Database store file not found on server.' });
    }
  } catch (err: any) {
    console.error('Database export failed:', err);
    res.status(500).json({ error: 'Internal server error while retrieving database.' });
  }
});

// 2. PROFILE MANAGEMENT
app.get('/api/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  const { password: _, ...userNoPassword } = user;
  res.json(userNoPassword);
});

app.put('/api/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const current = db.users[index];
  const { name, bio, academicBackground, skills, interests, careerGoals, profileCompleted } = req.body;

  db.users[index] = {
    ...current,
    name: name || current.name,
    bio: bio !== undefined ? bio : current.bio,
    academicBackground: academicBackground !== undefined ? academicBackground : current.academicBackground,
    skills: skills || current.skills || [],
    interests: interests || current.interests || [],
    careerGoals: careerGoals !== undefined ? careerGoals : current.careerGoals,
    profileCompleted: profileCompleted !== undefined ? profileCompleted : current.profileCompleted
  };

  saveDB(db);
  const { password: _, ...updatedUser } = db.users[index];
  res.json(updatedUser);
});

// 3. ASSESSMENT SYSTEM
app.get('/api/assessments/questions', (req, res) => {
  res.json(ASSESSMENT_QUESTIONS);
});

app.post('/api/assessments/submit', async (req, res) => {
  const { userId, submission } = req.body;
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { mbtiAnswers, bigFiveAnswers, aptitudeAnswers, skillsSelected, interestsSelected } = submission;

  // Compute MBTI
  // Seed calculation: count occurrences
  let eCount = 0, iCount = 0, sCount = 0, nCount = 0, tCount = 0, fCount = 0, jCount = 0, pCount = 0;
  Object.values(mbtiAnswers).forEach(val => {
    if (val === 'E') eCount++;
    if (val === 'I') iCount++;
    if (val === 'S') sCount++;
    if (val === 'N') nCount++;
    if (val === 'T') tCount++;
    if (val === 'F') fCount++;
    if (val === 'J') jCount++;
    if (val === 'P') pCount++;
  });

  // If some are empty, provide a balanced MBTI
  const mbti = `${eCount >= iCount ? 'E' : 'I'}${sCount >= nCount ? 'S' : 'N'}${tCount >= fCount ? 'T' : 'F'}${jCount >= pCount ? 'J' : 'P'}`;

  // Compute Big Five
  // We expect ratings 1-5. We calculate scores as percentage (rating * 20)
  const bigFive = {
    openness: Math.round(((bigFiveAnswers['b5-1'] || 4) / 5) * 100),
    conscientiousness: Math.round(((bigFiveAnswers['b5-2'] || 4) / 5) * 100),
    extraversion: Math.round(((bigFiveAnswers['b5-3'] || 3) / 5) * 100),
    agreeableness: Math.round(((bigFiveAnswers['b5-4'] || 4) / 5) * 100),
    neuroticism: Math.round(((bigFiveAnswers['b5-5'] || 2) / 5) * 100)
  };

  // Compute Aptitude
  let correct = 0;
  let totalApt = 0;
  ASSESSMENT_QUESTIONS.filter(q => q.type === 'aptitude').forEach(q => {
    totalApt++;
    if (aptitudeAnswers[q.id] === q.correctOption) {
      correct++;
    }
  });
  const aptitudeScore = Math.round((correct / (totalApt || 1)) * 100);

  // Update User profile
  db.users[userIndex].mbti = mbti;
  db.users[userIndex].bigFive = bigFive;
  db.users[userIndex].aptitudeScore = aptitudeScore;
  db.users[userIndex].skills = Array.from(new Set([...(db.users[userIndex].skills || []), ...skillsSelected]));
  db.users[userIndex].interests = Array.from(new Set([...(db.users[userIndex].interests || []), ...interestsSelected]));
  db.users[userIndex].profileCompleted = true;

  db.systemLog.push({ timestamp: new Date().toISOString(), message: `Student ${db.users[userIndex].name} finished Career Assessment (MBTI: ${mbti}, Aptitude: ${aptitudeScore}%)` });
  saveDB(db);

  const { password: _, ...updatedUser } = db.users[userIndex];
  res.json({ success: true, user: updatedUser });
});

// 4. AI RECOMMENDATION ENGINE (Career Recommendations)
app.post('/api/recommendations', async (req, res) => {
  const { userId } = req.body;
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const userSkills = Array.isArray(user.skills) ? user.skills : [];
  const userInterests = Array.isArray(user.interests) ? user.interests : [];
  const userMBTI = user.mbti || '';
  const userGoals = user.careerGoals || '';

  const gemini = getGeminiClient();
  const prompt = `Analyze this student profile for Career Recommendations:
Name: ${user.name}
Academic: ${user.academicBackground || 'N/A'}
Skills: ${JSON.stringify(userSkills)}
Interests: ${JSON.stringify(userInterests)}
Goals: ${userGoals}
Personality (MBTI): ${userMBTI || 'INTJ'}
Personality (Big Five): ${JSON.stringify(user.bigFive || { openness: 70, conscientiousness: 70, extraversion: 50, agreeableness: 50, neuroticism: 50 })}
Aptitude Score: ${user.aptitudeScore !== undefined ? user.aptitudeScore : 75}%

Based on this profile and current industry demands, recommend the TOP 3 most aligned careers from the list: AI Engineer, Data Scientist, Software Engineer, Full Stack Developer, Cloud Engineer, Cyber Security Analyst, DevOps Engineer, Business Analyst, Product Manager, Digital Marketer, UX/UI Designer, Chartered Accountant, Teacher, Healthcare Professional.

Return JSON representing an array of 3 recommendation objects. Use the exact following JSON structure:
[
  {
    "careerId": "short-lowercase-kebab-case",
    "name": "Exact Name of Career",
    "description": "Short compelling professional overview.",
    "matchScore": 85-98 (integer),
    "demandScore": 75-98 (integer),
    "salaryScore": 75-98 (integer),
    "growthScore": 75-98 (integer),
    "overallScore": 80-98 (integer),
    "requiredSkills": ["skill1", "skill2", "skill3"],
    "educationPath": ["Step 1", "Step 2", "Step 3"],
    "salaryRange": "$80,000 - $140,000",
    "futureScope": "Highly promising future scope summary.",
    "growthTrends": "Strong compound annual growth of X% expected.",
    "relatedCareers": ["Related Career 1", "Related Career 2"]
  }
]`;

  if (gemini) {
    try {
      const response = await generateContentWithRetry(
        prompt,
        'You are an advanced Career Psychology and Enterprise HR matching engine. Analyze user profiles with strict realism, providing mathematically sound scoring and career guidance.',
        'application/json'
      );
      const dataStr = response.text?.trim() || '[]';
      const parsedRecommendations = safeJSONParse(dataStr, null);
      if (parsedRecommendations && Array.isArray(parsedRecommendations) && parsedRecommendations.length > 0) {
        return res.json(parsedRecommendations);
      }
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.log('[Notice] Career Recommendations: Rate-limit (429) active. Seamlessly invoking premium dynamic matchmaking engine.');
      } else {
        console.log('[Notice] Career Recommendations fallback activated:', errMsg.slice(0, 150));
      }
    }
  }

  // Purely high-fidelity simulated fallback if Gemini fails or is unconfigured
  const availableCareers = [
    {
      careerId: 'ai-engineer',
      name: 'AI Engineer',
      description: 'Design, develop, and integrate cutting-edge machine learning and generative AI architectures to solve complex business operations.',
      baseSkills: ['Python', 'PyTorch', 'Machine Learning', 'AI', 'TensorFlow', 'Data Science', 'SQL'],
      baseInterests: ['AI', 'Research', 'Coding', 'Mathematics', 'Algorithms'],
      demandScore: 98,
      salaryScore: 96,
      growthScore: 99,
      requiredSkills: ['Python', 'PyTorch', 'Large Language Models', 'SQL', 'Prompt Engineering', 'Deep Learning'],
      educationPath: ['B.S. in Computer Science or Data Science', 'Specialization in Generative AI / Neural Networks', 'Practical portfolio of LLM fine-tuning'],
      salaryRange: '$115,000 - $190,000',
      futureScope: 'Rapid global adoption of automated cognitive architectures guarantees sustained enterprise demand.',
      growthTrends: 'Strong compound annual growth of 35.6% projected until 2030.',
      relatedCareers: ['Data Scientist', 'MLOps Specialist', 'Software Engineer']
    },
    {
      careerId: 'data-scientist',
      name: 'Data Scientist',
      description: 'Extract actionable intelligence from complex, multi-structured datasets utilizing statistical algorithms, predictive models, and custom visualizations.',
      baseSkills: ['Python', 'R', 'SQL', 'Data Analysis', 'Statistics', 'Pandas', 'Tableau'],
      baseInterests: ['Data', 'Statistics', 'Research', 'Analytics', 'Visualization'],
      demandScore: 94,
      salaryScore: 92,
      growthScore: 91,
      requiredSkills: ['Python', 'SQL', 'Statistical Modeling', 'Machine Learning', 'Pandas/NumPy', 'Tableau'],
      educationPath: ['B.S. in Statistics, Mathematics, or Computer Science', 'Certification in Advanced Applied Data Science', 'Deploy production dashboards and analytics systems'],
      salaryRange: '$95,000 - $165,000',
      futureScope: 'Sustained prominence. Enterprise organizations rely heavily on predictive analytics to steer strategic directions.',
      growthTrends: 'Global data analytics demand expanding at a steady 22% CAGR.',
      relatedCareers: ['AI Engineer', 'Business Intelligence Developer', 'Data Analyst']
    },
    {
      careerId: 'software-engineer',
      name: 'Software Engineer',
      description: 'Architect, construct, and refine enterprise-grade software applications, services, and robust local infrastructure solutions.',
      baseSkills: ['Java', 'C++', 'Python', 'Algorithms', 'Data Structures', 'OOP', 'SQL'],
      baseInterests: ['Coding', 'Problem Solving', 'Software', 'Systems', 'Engineering'],
      demandScore: 95,
      salaryScore: 93,
      growthScore: 89,
      requiredSkills: ['Java/C++', 'Object-Oriented Design', 'Algorithms', 'SQL', 'Git & CI/CD', 'Systems Architecture'],
      educationPath: ['B.S. in Computer Science or Software Engineering', 'Build portfolio of structured backend algorithms', 'Learn modern containerization and version control'],
      salaryRange: '$100,000 - $170,000',
      futureScope: 'Essential foundational discipline. Modern business infrastructures are powered entirely by custom software products.',
      growthTrends: 'Global software engineering vacancies growing at 21% year-over-year.',
      relatedCareers: ['Full Stack Developer', 'Cloud Engineer', 'DevOps Engineer']
    },
    {
      careerId: 'full-stack-developer',
      name: 'Full Stack Developer',
      description: 'Engineer responsive web platforms on front-end architectures while integrating secure backend logic, schemas, and API routers.',
      baseSkills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Node.js', 'Express', 'Next.js'],
      baseInterests: ['Web Development', 'Design', 'Coding', 'SaaS', 'Building Applications'],
      demandScore: 93,
      salaryScore: 90,
      growthScore: 92,
      requiredSkills: ['JavaScript/TypeScript', 'React.js', 'Node.js/Express', 'Tailwind CSS', 'SQL/PostgreSQL', 'API Design'],
      educationPath: ['B.S. in Software Engineering or intensive coding certification', 'Construct a full portfolio of interactive CRUD applications', 'Learn systems design and cloud host deployments'],
      salaryRange: '$90,000 - $155,000',
      futureScope: 'Extremely high demand due to the continuous launch of SaaS platforms, mobile web products, and custom corporate dashboards.',
      growthTrends: 'Steady global software market growth at a compound annual rate of ~18%.',
      relatedCareers: ['Software Engineer', 'UX/UI Designer', 'Cloud Engineer']
    },
    {
      careerId: 'cloud-engineer',
      name: 'Cloud Engineer',
      description: 'Deploy, scale, and optimize high-availability cloud infrastructure and orchestration services across major hosting platforms.',
      baseSkills: ['AWS', 'Cloud', 'Azure', 'Docker', 'Kubernetes', 'Linux', 'Terraform'],
      baseInterests: ['Infrastructure', 'Servers', 'Networking', 'Cloud Platforms', 'DevOps'],
      demandScore: 92,
      salaryScore: 94,
      growthScore: 93,
      requiredSkills: ['AWS/Azure/GCP', 'Terraform (IaC)', 'Docker & Kubernetes', 'Linux Systems', 'Shell Scripting', 'Networking'],
      educationPath: ['B.S. in IT, Computer Science, or equivalent systems experience', 'Obtain AWS Certified Solutions Architect or Cloud Security Engineer credential', 'Build automated cloud deployment pipelines'],
      salaryRange: '$105,000 - $175,000',
      futureScope: 'Virtually all enterprise computing has transitioned to the cloud, ensuring high demand for infrastructure specialists.',
      growthTrends: 'Cloud services industry expansion expected at ~20% CAGR through 2030.',
      relatedCareers: ['DevOps Engineer', 'Cyber Security Analyst', 'Software Engineer']
    },
    {
      careerId: 'cyber-security-analyst',
      name: 'Cyber Security Analyst',
      description: 'Fortify digital perimeters, monitor for vulnerability vectors, and establish robust response protocols against malicious penetrations.',
      baseSkills: ['Security', 'Network Security', 'Penetration Testing', 'Linux', 'Cryptography', 'Firewalls'],
      baseInterests: ['Security', 'Hacking', 'Defense', 'Investigation', 'Troubleshooting'],
      demandScore: 96,
      salaryScore: 91,
      growthScore: 95,
      requiredSkills: ['Network Protocols', 'Ethical Hacking / Pentesting', 'Incident Response', 'Linux administration', 'SIEM Tools', 'SIEM Monitoring'],
      educationPath: ['B.S. in Cybersecurity or Information Technology', 'Earn CompTIA Security+ or Certified Information Systems Security Professional (CISSP)', 'Engage in capture-the-flag (CTF) security drills'],
      salaryRange: '$98,000 - $160,000',
      futureScope: 'Critical priority. Rising security threats and strict compliance mandates secure defensive computing as a permanent boardroom concern.',
      growthTrends: 'Information security analyst positions projected to grow 32% faster than average fields.',
      relatedCareers: ['Network Administrator', 'Cloud Engineer', 'DevOps Engineer']
    },
    {
      careerId: 'devops-engineer',
      name: 'DevOps Engineer',
      description: 'Bridge the division between development velocity and operational reliability through automated testing, integration, and deployment pipelines.',
      baseSkills: ['CI/CD', 'Git', 'Jenkins', 'Docker', 'Kubernetes', 'Python', 'Bash', 'Automation'],
      baseInterests: ['Automation', 'Engineering', 'Efficiency', 'Systems Integration', 'Workflow Design'],
      demandScore: 93,
      salaryScore: 95,
      growthScore: 91,
      requiredSkills: ['CI/CD Pipelines', 'Docker/Kubernetes', 'Infrastructure as Code (Terraform)', 'Python/Bash Scripting', 'Monitoring (Prometheus/Grafana)'],
      educationPath: ['B.S. in Computer Science or Software Systems', 'Master CI/CD automated orchestration platforms', 'Obtain Kubernetes Administrator (CKA) certification'],
      salaryRange: '$110,000 - $180,000',
      futureScope: 'Essential for scaling enterprises. High release velocities and continuous deployment models dictate DevOps integration.',
      growthTrends: 'Consistent industry integration generating 24% CAGR growth.',
      relatedCareers: ['Cloud Engineer', 'Software Engineer', 'Site Reliability Engineer']
    },
    {
      careerId: 'business-analyst',
      name: 'Business Analyst',
      description: 'Synthesize data metrics to bridge communication between executive leadership stakeholders and developer engineering teams.',
      baseSkills: ['SQL', 'Excel', 'Data Analysis', 'Agile', 'Requirements Gathering', 'PowerBI'],
      baseInterests: ['Business', 'Analytics', 'Strategy', 'Communication', 'Organization'],
      demandScore: 86,
      salaryScore: 82,
      growthScore: 84,
      requiredSkills: ['SQL & Excel', 'PowerBI/Tableau', 'Agile Methodologies', 'Requirements Gathering', 'Process Mapping', 'Stakeholder Communication'],
      educationPath: ['B.S. in Business Administration, Finance, or Management Information Systems', 'Obtain Certified Business Analysis Professional (CBAP) credential', 'Acquire practical data extraction and pipeline building skills'],
      salaryRange: '$75,000 - $125,000',
      futureScope: 'Steady core demand. Enterprises continually require analytical translators to justify technology spends against bottom-line results.',
      growthTrends: 'Stable market demand growing at 11% annually.',
      relatedCareers: ['Product Manager', 'Data Scientist', 'Digital Marketer']
    },
    {
      careerId: 'product-manager',
      name: 'Product Manager',
      description: 'Orchestrate cross-functional engineering, UX, and business metrics to define features, build roadmap schedules, and monitor launches.',
      baseSkills: ['Agile', 'Scrum', 'User Experience', 'Analytics', 'Roadmaps', 'Strategy'],
      baseInterests: ['Leadership', 'Strategy', 'Design', 'Product Design', 'Management'],
      demandScore: 91,
      salaryScore: 95,
      growthScore: 89,
      requiredSkills: ['Product Strategy & Lifecycle', 'Agile/Scrum Frameworks', 'Market Analysis', 'User Research', 'A/B Testing & Analytics', 'Leadership'],
      educationPath: ['B.S. in Business, Computer Science, or Related Management Field', 'Obtain Product Owner (CSPO) or Product Management certificates', 'Lead and launch small, multidisciplinary side-projects'],
      salaryRange: '$100,000 - $165,000',
      futureScope: 'Highly dynamic. Organizations prioritize customer centric design and rapid releases, keeping Elite Product Managers in top tier status.',
      growthTrends: 'Consistent double digit growth in technology product lead positions.',
      relatedCareers: ['Business Analyst', 'UX/UI Designer', 'Digital Marketer']
    },
    {
      careerId: 'ux-ui-designer',
      name: 'UX/UI Designer',
      description: 'Design elegant user interfaces, wireframes, and intuitive user journeys grounded in rigorous customer research and aesthetic standards.',
      baseSkills: ['Figma', 'UI Design', 'UX Research', 'CSS', 'Wireframing', 'Prototyping'],
      baseInterests: ['Design', 'Art', 'Aesthetics', 'User Experience', 'Creativity'],
      demandScore: 88,
      salaryScore: 85,
      growthScore: 87,
      requiredSkills: ['Figma / Sketch', 'Wireframing & Prototyping', 'User Research & Persona Building', 'Aesthetic & Typography principles', 'Basic HTML/CSS'],
      educationPath: ['B.S. or B.F.A. in Interaction Design, Human-Computer Interaction, or Graphic Arts', 'Assemble an exquisite portfolio demonstrating wireframes, iterations, and high-fidelity mockups', 'Understand basic frontend frameworks'],
      salaryRange: '$80,000 - $135,000',
      futureScope: 'Growing in importance. User experience serves as the key differentiator in competitive digital software markets.',
      growthTrends: 'Steady increase in UI/UX designer hiring targets at ~16% annually.',
      relatedCareers: ['Product Manager', 'Frontend Developer', 'Digital Marketer']
    },
    {
      careerId: 'digital-marketer',
      name: 'Digital Marketer',
      description: 'Drive user acquisition, lead generation, and brand visibility through SEO, content curation, paid advertising, and campaign optimization.',
      baseSkills: ['SEO', 'Marketing', 'Web Analytics', 'Content Writing', 'Ad Campaigns', 'Social Media'],
      baseInterests: ['Marketing', 'Writing', 'Social Media', 'Analytics', 'Advertising'],
      demandScore: 83,
      salaryScore: 78,
      growthScore: 81,
      requiredSkills: ['SEO & SEM Content Strategy', 'Web Analytics / Ad Campaigns', 'Pay-Per-Click (PPC) Campaign Management', 'Social Media Curation', 'Copywriting'],
      educationPath: ['B.S. in Marketing, Communications, or Business Administration', 'Earn advanced certifications in Web Analytics and inbound marketing', 'Manage and scale traffic for a personal blog or small-business website'],
      salaryRange: '$65,000 - $115,000',
      futureScope: 'Transitioning to highly analytic frameworks. Businesses must maintain digital footprints and high-performance ad returns.',
      growthTrends: 'Continuous pivot towards digital budgets keeping marketing targets robust.',
      relatedCareers: ['Business Analyst', 'UX/UI Designer', 'Product Manager']
    },
    {
      careerId: 'chartered-accountant',
      name: 'Chartered Accountant',
      description: 'Direct corporate financial audits, manage complex tax configurations, and ensure adherence to rigorous fiscal regulatory standards.',
      baseSkills: ['Accounting', 'Taxation', 'Excel', 'Financial Auditing', 'Budgeting'],
      baseInterests: ['Finance', 'Mathematics', 'Organization', 'Law', 'Business'],
      demandScore: 87,
      salaryScore: 90,
      growthScore: 82,
      requiredSkills: ['Financial Auditing', 'Tax Law Compliance', 'Advanced Excel Modeling', 'Corporate Budgeting', 'Enterprise Resource Planning (ERP)'],
      educationPath: ['B.S. in Accounting or Finance', 'Pass rigorous professional qualification exams (CPA, CA, or equivalent)', 'Complete 3-year structured audit training program'],
      salaryRange: '$85,000 - $150,000',
      futureScope: 'High professional stability. Regulatory oversight and corporate finance strategies keep Chartered Accountants as invaluable assets.',
      growthTrends: 'Stable historical demand growing at 7-9% annually.',
      relatedCareers: ['Financial Analyst', 'Investment Banker', 'Business Analyst']
    },
    {
      careerId: 'teacher',
      name: 'Teacher',
      description: 'Educate, inspire, and foster cognitive development in students through curriculum design, lectures, and individualized mentorship.',
      baseSkills: ['Public Speaking', 'Curriculum Design', 'Mentorship', 'Writing', 'Communication'],
      baseInterests: ['Education', 'Mentorship', 'Helping People', 'Speaking', 'Community'],
      demandScore: 85,
      salaryScore: 68,
      growthScore: 72,
      requiredSkills: ['Curriculum Planning', 'Classroom Management', 'Educational Psychology', 'Public Presentation', 'Student Progress Evaluation'],
      educationPath: ['B.S. in Education or relevant subject discipline', 'Obtain state/national teaching licensure and credentials', 'Complete student-teaching clinical classroom training'],
      salaryRange: '$50,000 - $85,000',
      futureScope: 'Indispensable social infrastructure. While remote/AI tools grow, human classroom mentorship remains absolutely critical.',
      growthTrends: 'Steady public demand with focus on personalized educational tracking.',
      relatedCareers: ['Corporate Trainer', 'Academic Counselor', 'Educational Content Creator']
    },
    {
      careerId: 'healthcare-professional',
      name: 'Healthcare Professional',
      description: 'Deliver clinical medical evaluations, customize treatment plans, and support physiological wellness across patient demographics.',
      baseSkills: ['Biology', 'Patient Care', 'Medicine', 'First Aid', 'Clinical Skills'],
      baseInterests: ['Science', 'Biology', 'Helping People', 'Medicine', 'Healthcare'],
      demandScore: 97,
      salaryScore: 94,
      growthScore: 96,
      requiredSkills: ['Clinical Diagnostics', 'Patient Care Protocols', 'Medical Software Systems', 'Emergency Care', 'Pharmacology basics'],
      educationPath: ['M.D., B.S. in Nursing, or related Professional Medical Doctorate', 'Complete hospital residency and clinical rotation schemas', 'Pass national medical licensing exams'],
      salaryRange: '$120,000 - $250,000',
      futureScope: 'Extremely high demand due to aging global populations and systemic focus on preventative clinical therapeutics.',
      growthTrends: 'Robust long term expansion projecting 26% vacancy growth.',
      relatedCareers: ['Medical Research Scientist', 'Biomedical Engineer', 'Clinical Administrator']
    }
  ];

  // Perform highly personalized scoring
  const recommendationsWithScores = availableCareers.map(career => {
    let matchScore = 72; // Baseline

    // Add score points for skills matched
    career.baseSkills.forEach(skill => {
      const isMatched = userSkills.some((us: string) => us.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(us.toLowerCase()));
      if (isMatched) matchScore += 4;
    });

    // Add score points for interests matched
    career.baseInterests.forEach(interest => {
      const isMatched = userInterests.some((ui: string) => ui.toLowerCase().includes(interest.toLowerCase()) || interest.toLowerCase().includes(ui.toLowerCase()));
      if (isMatched) matchScore += 3;
    });

    // Add extra alignment for academic field match
    const background = (user.academicBackground || '').toLowerCase();
    if (background.includes('computer') || background.includes('tech') || background.includes('science')) {
      if (['ai-engineer', 'software-engineer', 'full-stack-developer', 'cloud-engineer', 'devops-engineer', 'cyber-security-analyst'].includes(career.careerId)) {
        matchScore += 8;
      }
    } else if (background.includes('business') || background.includes('commerce') || background.includes('mba')) {
      if (['business-analyst', 'product-manager', 'digital-marketer', 'chartered-accountant'].includes(career.careerId)) {
        matchScore += 8;
      }
    } else if (background.includes('medical') || background.includes('health') || background.includes('nurse') || background.includes('bio')) {
      if (['healthcare-professional'].includes(career.careerId)) {
        matchScore += 12;
      }
    }

    // Goal alignment
    const goals = userGoals.toLowerCase();
    career.baseSkills.concat(career.baseInterests).forEach(keyword => {
      if (goals.includes(keyword.toLowerCase())) {
        matchScore += 2;
      }
    });

    // Personality MBTI adjustments
    if (userMBTI) {
      const isIntrovert = userMBTI.toUpperCase().startsWith('I');
      const isExtrovert = userMBTI.toUpperCase().startsWith('E');
      
      if (isIntrovert) {
        if (['ai-engineer', 'data-scientist', 'software-engineer', 'cyber-security-analyst', 'chartered-accountant'].includes(career.careerId)) {
          matchScore += 5;
        }
      } else if (isExtrovert) {
        if (['product-manager', 'digital-marketer', 'teacher', 'full-stack-developer'].includes(career.careerId)) {
          matchScore += 5;
        }
      }
    }

    // Include aptitude score context
    const userApt = user.aptitudeScore !== undefined ? user.aptitudeScore : 75;
    if (userApt > 85) {
      if (['ai-engineer', 'data-scientist', 'cyber-security-analyst', 'healthcare-professional'].includes(career.careerId)) {
        matchScore += 4;
      }
    }

    // Cap match score between 80 and 98
    matchScore = Math.min(98, Math.max(80, matchScore));

    // Calculate Overall score
    const overallScore = Math.round((matchScore + career.demandScore + career.salaryScore + career.growthScore) / 4);

    return {
      careerId: career.careerId,
      name: career.name,
      description: career.description,
      matchScore,
      demandScore: career.demandScore,
      salaryScore: career.salaryScore,
      growthScore: career.growthScore,
      overallScore,
      requiredSkills: career.requiredSkills,
      educationPath: career.educationPath,
      salaryRange: career.salaryRange,
      futureScope: career.futureScope,
      growthTrends: career.growthTrends,
      relatedCareers: career.relatedCareers
    };
  });

  // Sort and pick top 3
  recommendationsWithScores.sort((a, b) => b.overallScore - a.overallScore);
  const topRecommendations = recommendationsWithScores.slice(0, 3);

  res.json(topRecommendations);
});

// 5. AI CAREER COUNSELOR CHATBOT & VOICE
app.post('/api/counselor/chat', async (req, res) => {
  const { userId, message, history, language = 'en', generateSpeech = false } = req.body;
  
  const user = db.users.find(u => u.id === userId);
  const userContext = user 
    ? `Student Profile Details:
- Name: ${user.name}
- Skills: ${JSON.stringify(user.skills)}
- Interests: ${JSON.stringify(user.interests)}
- Goals: ${user.careerGoals}
- MBTI: ${user.mbti || 'N/A'}`
    : 'No active profile available yet.';

  const gemini = getGeminiClient();
  
  const systemInstruction = `You are "Counselor Pro", CareerAI Pro's leading, highly supportive AI Career Counselor.
Using the user's career goals, skills, MBTI personality type, and interests, provide warm, objective, structured, and action-oriented career consulting.
Provide guidance on career discovery, 30/90-day learning roadmap milestones, resume adjustments, behavioral or technical interview preparation, university courses, and scholarships.
Strictly support the chosen language: ${language === 'hi' ? 'Hindi / Hinglish' : 'English'}.
Maintain a positive professional counselor persona. Keep answers clear and use Markdown. Avoid unsolicited long essays unless requested.`;

  let responseText = '';
  
  if (gemini) {
    try {
      // Re-map messages for chats
      const chatHistory = (history || []).map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));

      // Create Chat with Primary Model with fallback loop
      let response;
      const chatModelsToTry = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
      let lastChatError: any = null;
      
      for (const modelName of chatModelsToTry) {
        try {
          const chat = gemini.chats.create({
            model: modelName,
            config: {
              systemInstruction: `${systemInstruction}\n\nActive Context: ${userContext}`,
              temperature: 0.7
            },
            history: chatHistory
          });
          response = await chat.sendMessage({ message });
          if (response && response.text) {
            break;
          }
        } catch (chatErr: any) {
          const errMsg = chatErr?.message || String(chatErr);
          if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
            console.log(`[Notice] Counselor Chat model ${modelName} rate limit: using failover model.`);
          } else {
            console.log(`[Notice] Counselor Chat model ${modelName} warning: ${errMsg.slice(0, 100)}`);
          }
          lastChatError = chatErr;
        }
      }

      if (!response && lastChatError) {
        throw lastChatError;
      }
      
      responseText = response ? (response.text || '') : '';
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.log('[Notice] Counselor Chat: Quota exceeded (429). Activating smart dynamic offline coaching response.');
      } else {
        console.log('[Notice] Counselor Chat fallback activated:', errMsg.slice(0, 120));
      }
    }
  }

  // If we couldn't get a live response (either because gemini was null or the live calls threw an exception)
  if (!responseText) {
    const skillsList = user?.skills && user.skills.length > 0 ? user.skills.join(', ') : 'technical development and analytics';
    const goalsText = user?.careerGoals ? `focus on "${user.careerGoals}"` : 'career advancement and high-impact learning';
    const mbtiText = user?.mbti ? `personality type (${user.mbti})` : 'collaborative planning skills';

    if (message.toLowerCase().includes('roadmap') || message.toLowerCase().includes('path') || message.toLowerCase().includes('learn')) {
      responseText = `### 🗺️ Tailored Learning Roadmap for ${user?.name || 'Student'}
Based on your skills in **${skillsList}** and your ${mbtiText}, here is a high-fidelity learning path:

1. **Phase 1: Deep Foundations (Days 1-30)**
   - Focus on expanding your core skills in **${skillsList}**.
   - Build 2 small sandboxed prototypes to cement fundamental syntax.
   - *Milestone:* Fully set up developer workspaces and configure schema repositories.

2. **Phase 2: Project Orchestration (Days 31-90)**
   - Integrate persistent CRUD database state controllers and secure API route gates.
   - Replicate an enterprise-grade production platform layout from industry standards.
   - *Milestone:* Deploy a functional full-stack project on standard cloud runtimes.

3. **Phase 3: Portfolio & Profile Polish (Month 4+)**
   - Perform layout audits using premium off-white and elegant dark elements.
   - Prepare an ATS-friendly, single-column resume aligned with your goal to ${goalsText}.
   - *Milestone:* Complete 3 mock behavioral interview trials.

What area of this custom milestone should we drill down on first?`;
    } else if (message.toLowerCase().includes('resume') || message.toLowerCase().includes('ats') || message.toLowerCase().includes('cv')) {
      responseText = `### 📝 Custom Resume Blueprint for ${user?.name || 'Student'}
To align your resume with your goals (**${goalsText}**), let's optimize your layout:

- **Structure:** Use a clean, single-column, top-down layout (no multi-column templates as legacy scanners fail on them).
- **Executive Summary:** Start with a 3-sentence profile emphasizing your strengths in **${skillsList}** and how you apply your ${mbtiText} to drive projects.
- **Experience Highlights:** Rewrite your bullet points using the proven X-Y-Z model (*"Accomplished [X] as measured by [Y], by doing [Z]"*).
- **Core Keyword Alignment:** Ensure terms like *RESTful API Integration*, *Systems Design*, and *Cloud Deployment* appear under a clean "Technical Core Skills" grid.

Would you like me to scan your actual resume text or do a mock review of a specific project description?`;
    } else if (message.toLowerCase().includes('interview') || message.toLowerCase().includes('question') || message.toLowerCase().includes('mock')) {
      responseText = `### 🎤 Mock Interview Prep for ${user?.name || 'Student'}
Let's practice! Based on your goal of **${goalsText}**, technical interviews will assess both coding and design. 

Here is a typical starting question:
> *"How do you approach scaling a service and managing persistent data caching when traffic spikes unexpectedly?"*

**Pro-Tips for Your Personality (${user?.mbti || 'INTJ'}):**
1. Use the **STAR method** (Situation, Task, Action, Result) for behavioral questions.
2. Discuss actual metrics (e.g., *"improved database response time by 35% using Redis caching"*).

Let me know your answer to the question above, and I'll evaluate it with constructives and strengths immediately!`;
    } else {
      responseText = `Hello **${user?.name || 'there'}**! I am **Dr. Evelyn**, your premium CareerAI Counselor. 

I've carefully analyzed your background:
- **Academic Profile:** ${user?.academicBackground || 'Broad Academic Background'}
- **Current Core Skills:** ${skillsList}
- **Primary Career Interest:** ${user?.careerGoals || 'Professional Technology Advancement'}
- **MBTI & Personality Matrix:** ${user?.mbti || 'INTJ (Architect)'}

You have a very strong profile. I am fully ready to guide you. We can design an **ATS-compliant resume blueprint**, build a detailed **30-day learning roadmap**, or run a customized **mock interview session** for your goals. 

What should we conquer first?`;
    }
  }

  // Check if speech generation is requested (TTS using Gemini TTS preview!)
  let speechBase64 = null;
  if (generateSpeech && gemini) {
    try {
      // Limit text length to make TTS super fast and reliable
      const cleanTTSInput = responseText.replace(/[\*\#\`]/g, '').slice(0, 200);
      const ttsResponse = await gemini.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say clearly: ${cleanTTSInput}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore', 'Puck', 'Zephyr'
            },
          },
        },
      });
      const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioPart) {
        speechBase64 = audioPart;
      }
    } catch (err) {
      console.error('Failed to generate counselor speech:', err);
    }
  }

  res.json({ content: responseText, audio: speechBase64 });
});

// 6. LEARNING ROADMAP GENERATOR
app.post('/api/roadmaps/generate', async (req, res) => {
  const { userId, careerName, durationType } = req.body;
  const user = db.users.find(u => u.id === userId) || { skills: [], interests: [], academicBackground: '' };

  const gemini = getGeminiClient();
  const prompt = `Generate a rigorous, professional step-by-step career learning roadmap for:
Career: ${careerName}
Duration: ${durationType} (Choose from: 30day, 90day, 6month, 1year)
Student Background: ${user.academicBackground}
Skills: ${JSON.stringify(user.skills)}

You MUST return a JSON object with this EXACT structure:
{
  "careerName": "${careerName}",
  "durationType": "${durationType}",
  "aiGuidance": "Cohesive expert coaching paragraph focused on high fidelity execution.",
  "steps": [
    {
      "id": "step-1",
      "title": "Module Title",
      "description": "Clear explanation of what needs to be mastered.",
      "duration": "Days 1-10 or Weeks 1-2",
      "resources": [
        { "name": "Resource Name", "url": "https://example.com/learn" }
      ],
      "projects": ["Mini project description or title"],
      "certifications": ["Recommended industry certifications"],
      "skillMilestones": ["Key milestone skill 1", "Key milestone skill 2"]
    }
  ]
}

Provide 3 to 5 chronological roadmap steps that match the chosen duration. Keep URLs as realistic resource links.`;

  if (gemini) {
    try {
      const response = await generateContentWithRetry(
        prompt,
        undefined,
        'application/json'
      );
      const dataStr = response.text?.trim() || '{}';
      const parsedRoadmap = safeJSONParse(dataStr, null);
      if (parsedRoadmap && parsedRoadmap.steps && Array.isArray(parsedRoadmap.steps) && parsedRoadmap.steps.length > 0) {
        return res.json(parsedRoadmap);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.log('[Notice] Roadmap Generator: Quota exceeded (429). Activating premium dynamic local milestone compiler.');
      } else {
        console.log('[Notice] Roadmap Generator fallback activated:', errMsg.slice(0, 120));
      }
    }
  }

  // Fallback with highly customized, career-specific dynamic tracks
  let customSteps = [];
  const careerLower = (careerName || '').toLowerCase();

  if (careerLower.includes('design') || careerLower.includes('ux') || careerLower.includes('ui')) {
    customSteps = [
      {
        id: 'step-1',
        title: 'Heuristic Principles & Figma Foundations',
        description: `Master visual hierarchy, grid systems, and typographical pairs. Replicate professional layouts using industry-standard design tools.`,
        duration: durationType === '30day' ? 'Days 1-7' : 'Weeks 1-4',
        resources: [
          { name: 'Figma Design Academy', url: 'https://help.figma.com/hc/en-us' },
          { name: 'Nielsen Norman UX Guidelines', url: 'https://www.nngroup.com/articles/' }
        ],
        projects: ['Design system kit library', 'Heuristic teardown of a landing page'],
        certifications: [`Basic Figma UI/UX Associate Badge`],
        skillMilestones: ['Grid layout setups', 'Prototyping vectors', 'Typography pairing']
      },
      {
        id: 'step-2',
        title: 'User Research & Wireframing Iterations',
        description: 'Conduct user research and design wireframes based on feedback loop assessments.',
        duration: durationType === '30day' ? 'Days 8-20' : 'Weeks 5-12',
        resources: [
          { name: 'Interaction Design Foundation', url: 'https://www.interaction-design.org/' }
        ],
        projects: ['High-fidelity responsive application mock', 'Interactive interactive flow model'],
        certifications: [`Certified UX Researcher`],
        skillMilestones: ['User journey maps', 'High-fidelity wireframes', 'Information architecture']
      },
      {
        id: 'step-3',
        title: 'Portfolio Presentation & Developer Handover',
        description: 'Prepare high-impact portfolio case studies and export assets for direct engineering translation.',
        duration: durationType === '30day' ? 'Days 21-30' : 'Weeks 13-24',
        resources: [
          { name: 'Aesthetic Web Handover Guidelines', url: 'https://medium.com/' }
        ],
        projects: ['Fully documented UX Case Study', 'Figma developer inspection audit package'],
        certifications: [`Enterprise Portfolio Master Certification`],
        skillMilestones: ['Figma variables setups', 'Design-to-code exports', 'Case study composition']
      }
    ];
  } else if (careerLower.includes('security') || careerLower.includes('cyber')) {
    customSteps = [
      {
        id: 'step-1',
        title: 'Networking Architectures & Defensive CLI',
        description: 'Grasp the OSI model, TCP/IP fundamentals, and shell scripting to monitor network flows.',
        duration: durationType === '30day' ? 'Days 1-7' : 'Weeks 1-4',
        resources: [
          { name: 'CompTIA Network+ Reference', url: 'https://www.comptia.org/' },
          { name: 'Linux System Command Foundations', url: 'https://github.com/' }
        ],
        projects: ['Bash shell server scanner', 'IP Subnet planning sheet'],
        certifications: ['Junior Cybersecurity Practitioner (JSCP)'],
        skillMilestones: ['TCP/IP subnetting', 'Linux terminal monitoring', 'SSH server setups']
      },
      {
        id: 'step-2',
        title: 'Vulnerability Analysis & Firewalls Configuration',
        description: 'Deploy defensive scanning tools and configure network firewall rules to prevent standard penetrations.',
        duration: durationType === '30day' ? 'Days 8-20' : 'Weeks 5-12',
        resources: [
          { name: 'OWASP Security Risks Guide', url: 'https://owasp.org/' }
        ],
        projects: ['Vulnerability scanner script', 'Virtual local network firewall setup'],
        certifications: ['CompTIA Security+ Blueprint Certification'],
        skillMilestones: ['SIEM log scanning', 'WAF policy enforcement', 'Port vulnerability analysis']
      },
      {
        id: 'step-3',
        title: 'Ethical Penetration Drilling & Incident Response',
        description: 'Perform advanced mock penetration tests and prepare post-incident containment blueprints.',
        duration: durationType === '30day' ? 'Days 21-30' : 'Weeks 13-24',
        resources: [
          { name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/' }
        ],
        projects: ['Full penetration testing audit log', 'Disaster containment and backup protocol package'],
        certifications: ['Certified Information Systems Auditor (CISA)'],
        skillMilestones: ['Vulnerability scanning', 'Incident mitigation planning', 'Penetration testing reporting']
      }
    ];
  } else if (careerLower.includes('marketing') || careerLower.includes('digital')) {
    customSteps = [
      {
        id: 'step-1',
        title: 'Market Positioning & SEO Content Auditing',
        description: 'Understand target metrics, perform competitor content analysis, and draft high-conversion landing page copies.',
        duration: durationType === '30day' ? 'Days 1-7' : 'Weeks 1-4',
        resources: [
          { name: 'Enterprise SEO Starter Guide', url: 'https://developers.google.com/search' }
        ],
        projects: ['Competitor marketing SEO breakdown', 'Landing page copy conversion layout'],
        certifications: ['Enterprise SEO Foundations Specialist'],
        skillMilestones: ['Organic search auditing', 'Keyword intent parsing', 'Conversion copywriting']
      },
      {
        id: 'step-2',
        title: 'Paid Acquisitions & Analytics Pipelines',
        description: 'Configure and track paid campaign budgets while utilizing advanced dashboards to measure acquisition costs.',
        duration: durationType === '30day' ? 'Days 8-20' : 'Weeks 5-12',
        resources: [
          { name: 'Enterprise Analytics Academy', url: 'https://skillshop.exceedlms.com/' }
        ],
        projects: ['Paid acquisition dashboard modeling', 'Interactive campaign ROI spreadsheet'],
        certifications: ['Enterprise Analytics Professional Certification'],
        skillMilestones: ['Enterprise Tag Manager setups', 'A/B testing campaign designs', 'Customer acquisition analytics']
      },
      {
        id: 'step-3',
        title: 'Brand Growth Strategy & Campaign Integration',
        description: 'Create multi-channel growth funnels to drive consistent subscriber conversions.',
        duration: durationType === '30day' ? 'Days 21-30' : 'Weeks 13-24',
        resources: [
          { name: 'HubSpot Growth Strategy Guides', url: 'https://academy.hubspot.com/' }
        ],
        projects: ['Comprehensive quarterly growth funnel strategy', 'Automated email newsletter workflow system'],
        certifications: ['Inbound Growth Strategy Master Certification'],
        skillMilestones: ['Multi-channel orchestration', 'Conversion rate optimization', 'Brand funnel building']
      }
    ];
  } else {
    // Default high-fidelity engineering / technical track
    customSteps = [
      {
        id: 'step-1',
        title: 'Foundational Theory & Tooling Setup',
        description: `Grasp the essential concepts of ${careerName}. Configure local development workspaces, install core libraries, and write first projects.`,
        duration: durationType === '30day' ? 'Days 1-7' : 'Weeks 1-4',
        resources: [
          { name: 'Core Foundations Guide', url: 'https://docs.microsoft.com/en-us/' },
          { name: 'Developer Platform Setup', url: 'https://github.com/' }
        ],
        projects: ['Personal sandbox environment setup', 'Basic command-line script validation'],
        certifications: [`Basic ${careerName} Fundamentals Badge`],
        skillMilestones: ['Workspace setup', 'Fundamental CLI syntax', 'Configuration structures']
      },
      {
        id: 'step-2',
        title: 'Intermediate Core Engineering',
        description: 'Implement complex algorithms and work with advanced schemas, database connectivity, and error handlers.',
        duration: durationType === '30day' ? 'Days 8-20' : 'Weeks 5-12',
        resources: [
          { name: 'Intermediate Engineering Deep Dive', url: 'https://developer.mozilla.org/' },
          { name: 'Security & Database Standards', url: 'https://www.postgresql.org/' }
        ],
        projects: ['Robust data manager API', 'Realtime tracking sub-system'],
        certifications: [`Intermediate ${careerName} Associate Certification`],
        skillMilestones: ['REST API design', 'Data persistence models', 'Error telemetry']
      },
      {
        id: 'step-3',
        title: 'Enterprise Portfolio Deployment & ATS Prep',
        description: 'Polish frontend dashboards, implement modern CSS spacing, run full testing suites, and refine your resume alignment.',
        duration: durationType === '30day' ? 'Days 21-30' : 'Weeks 13-24',
        resources: [
          { name: 'System Design Patterns', url: 'https://medium.com/' },
          { name: 'Vercel & Cloud Deployments', url: 'https://vercel.com/' }
        ],
        projects: ['End-to-end production-grade MVP dashboard', 'Public technical portfolio showcase'],
        certifications: [`Enterprise ${careerName} Expert`],
        skillMilestones: ['Cloud orchestration', 'Performance tuning', 'Resume ATS optimization']
      }
    ];
  }

  res.json({
    careerName,
    durationType,
    aiGuidance: `This learning pathway is custom-tailored to help you transition into a professional ${careerName} role by prioritizing high-value real-world projects and ATS-grade certifications.`,
    steps: customSteps
  });
});

// 7. RESUME ANALYZER
app.post('/api/resume/analyze', async (req, res) => {
  const { resumeText, targetCareer } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: 'Please provide resume content text to analyze.' });
  }

  const gemini = getGeminiClient();
  const prompt = `Perform an enterprise-level ATS (Applicant Tracking System) scan and skill-gap evaluation on this resume:
Target Career Role: ${targetCareer || 'Software Engineer'}

Resume Content:
${resumeText}

You MUST return a JSON object with this EXACT structure:
{
  "atsScore": 45-100 (integer representing percentage rating),
  "skillGap": ["Required Skill A", "Required Skill B"],
  "missingKeywords": ["Keyword A", "Keyword B"],
  "formattingIssues": ["Formatting Issue 1", "Formatting Issue 2"],
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "careerAlignment": "Short analysis of how aligned this resume currently is to a ${targetCareer} position."
}`;

  if (gemini) {
    try {
      const response = await generateContentWithRetry(
        prompt,
        undefined,
        'application/json'
      );
      const dataStr = response.text?.trim() || '{}';
      const parsedAnalysis = safeJSONParse(dataStr, null);
      if (parsedAnalysis && parsedAnalysis.atsScore) {
        return res.json(parsedAnalysis);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.log('[Notice] Resume Analyzer: Quota exceeded (429). Invoking dynamic local ATS keyword scanner.');
      } else {
        console.log('[Notice] Resume Analyzer fallback activated:', errMsg.slice(0, 120));
      }
    }
  }

  // Fallback with highly customized, career-specific dynamic keyword scanner
  const textLower = resumeText.toLowerCase();
  const targetLower = (targetCareer || 'Software Engineer').toLowerCase();

  let targetKeywords: string[] = [];
  let designKeywords = ['figma', 'ui', 'ux', 'wireframe', 'user research', 'prototype', 'heuristic', 'typography'];
  let securityKeywords = ['firewall', 'network', 'siem', 'penetration', 'cyber', 'security', 'cryptography', 'owasp', 'linux'];
  let marketingKeywords = ['seo', 'sem', 'google analytics', 'ppc', 'campaign', 'adwords', 'content', 'copywriting', 'conversion'];
  let techKeywords = ['python', 'java', 'javascript', 'typescript', 'sql', 'react', 'node', 'docker', 'kubernetes', 'aws', 'ci/cd', 'git', 'api'];

  if (targetLower.includes('design') || targetLower.includes('ux') || targetLower.includes('ui')) {
    targetKeywords = designKeywords;
  } else if (targetLower.includes('security') || targetLower.includes('cyber')) {
    targetKeywords = securityKeywords;
  } else if (targetLower.includes('marketing') || targetLower.includes('digital')) {
    targetKeywords = marketingKeywords;
  } else {
    targetKeywords = techKeywords;
  }

  const matchedKeywords = targetKeywords.filter(keyword => textLower.includes(keyword));
  const missingKeywords = targetKeywords.filter(keyword => !textLower.includes(keyword));

  // Dynamic ATS Score Calculation
  let baseScore = 55;
  const keywordWeight = Math.round(40 / targetKeywords.length);
  baseScore += matchedKeywords.length * keywordWeight;
  const finalScore = Math.min(95, Math.max(45, baseScore));

  const skillGaps = missingKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1));
  const suggestionsList = [
    'Reformat resume into a clean, single-column, top-down layout for standard parser engines.',
    `Explicitly integrate your core missing industry keywords: ${missingKeywords.slice(0, 3).join(', ')} directly into your experience bullet points.`,
    'Quantify business impacts using the Google X-Y-Z formula: "Accomplished X as measured by Y by doing Z".'
  ];

  const formattingIssuesList = [];
  if (resumeText.length < 300) {
    formattingIssuesList.push('Resume length is extremely short; add comprehensive professional experiences.');
  }
  if (!textLower.includes('contact') && !textLower.includes('@') && !textLower.includes('phone')) {
    formattingIssuesList.push('Missing explicit email or phone contact details block.');
  }
  if (formattingIssuesList.length === 0) {
    formattingIssuesList.push('Ensure section headers match standard ATS-parsable tags (e.g. "Work Experience", "Education").');
  }

  const alignmentMessage = matchedKeywords.length > (targetKeywords.length / 2)
    ? `Strong alignment. You have demonstrated solid foundational skills in ${matchedKeywords.slice(0, 3).join(', ')}. Addressing minor formatting issues will maximize your parsing response.`
    : `Developing alignment. Your profile lists key skills, but lacks specific, dense keyword coverage for a competitive ${targetCareer || 'Software Engineer'} role. We recommend explicit keyword optimization.`;

  res.json({
    atsScore: finalScore,
    skillGap: skillGaps,
    missingKeywords: missingKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    formattingIssues: formattingIssuesList,
    suggestions: suggestionsList,
    careerAlignment: alignmentMessage
  });
});

// 8. AI MOCK INTERVIEW
app.post('/api/interview/start', async (req, res) => {
  const { targetCareer } = req.body;
  const gemini = getGeminiClient();
  
  const prompt = `Generate a technical and behavioral mock interview session for a ${targetCareer || 'Software Engineer'} candidate.
Return an array of exactly 3 progressive interview questions. Keep questions realistic, practical, and highly relevant.
Include the expected technical/conceptual answers in the validation structure.

Return a JSON array with this structure:
[
  {
    "id": "q-1",
    "question": "What is the primary difference between a relational database like PostgreSQL and a non-relational database like MongoDB, and when would you choose one over the other?",
    "category": "technical",
    "expectedConcepts": ["acid properties", "schema flexibility", "horizontal scaling", "foreign keys"]
  },
  ...
]`;

  if (gemini) {
    try {
      const response = await generateContentWithRetry(
        prompt,
        undefined,
        'application/json'
      );
      const dataStr = response.text?.trim() || '[]';
      const parsedQuestions = safeJSONParse(dataStr, null);
      if (parsedQuestions && Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        return res.json(parsedQuestions);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.log('[Notice] Interview Start: Quota exceeded (429). Generating custom local career interview set.');
      } else {
        console.log('[Notice] Interview Start fallback activated:', errMsg.slice(0, 120));
      }
    }
  }

  // Fallback with highly customized, career-specific questions
  const careerLower = (targetCareer || 'Software Engineer').toLowerCase();
  let customQuestions = [];

  if (careerLower.includes('design') || careerLower.includes('ux') || careerLower.includes('ui')) {
    customQuestions = [
      {
        id: 'mock-q-1',
        question: 'How do you establish a design system grid standard, and when would you use rem units vs pixel units for responsive layout scaling?',
        category: 'technical',
        expectedConcepts: ['grid', 'rem', 'responsive design', 'accessibility', 'viewport']
      },
      {
        id: 'mock-q-2',
        question: 'Can you describe a scenario where you had to present a controversial UX design iteration to stubborn stakeholder engineers? How did you align the team?',
        category: 'behavioral',
        expectedConcepts: ['empathy', 'data', 'user testing', 'collaboration', 'active listening']
      },
      {
        id: 'mock-q-3',
        question: 'What is your strategy for auditing and prioritizing usability repairs on a complex application with a tight production release deadline?',
        category: 'behavioral',
        expectedConcepts: ['heuristic evaluation', 'priority', 'focus', 'user journeys', 'impact']
      }
    ];
  } else if (careerLower.includes('security') || careerLower.includes('cyber')) {
    customQuestions = [
      {
        id: 'mock-q-1',
        question: 'What are the core differences between symmetric and asymmetric cryptography, and how does TLS utilize both during a secure handshake?',
        category: 'technical',
        expectedConcepts: ['symmetric', 'asymmetric', 'public key', 'handshake', 'tls', 'encryption']
      },
      {
        id: 'mock-q-2',
        question: 'Can you describe a time when you detected a false-positive security alert that team members ignored? How did you handle the verification?',
        category: 'behavioral',
        expectedConcepts: ['investigate', 'false positive', 'siem', 'integrity', 'thoroughness']
      },
      {
        id: 'mock-q-3',
        question: 'What is your strategy for explaining critical network security vulnerabilities to non-technical corporate business executives?',
        category: 'behavioral',
        expectedConcepts: ['risk assessment', 'business impact', 'clarity', 'plain language', 'solution']
      }
    ];
  } else if (careerLower.includes('marketing') || careerLower.includes('digital')) {
    customQuestions = [
      {
        id: 'mock-q-1',
        question: 'What are the main distinctions between organic SEO optimization and paid campaigns, and how do you measure acquisition cost relative to lifetime value?',
        category: 'technical',
        expectedConcepts: ['seo', 'adwords', 'ltv', 'cac', 'funnel', 'conversion']
      },
      {
        id: 'mock-q-2',
        question: 'Describe a marketing campaign that failed to meet its target conversion goals. How did you diagnose the leak and pivot?',
        category: 'behavioral',
        expectedConcepts: ['bounce rate', 'analytics', 'diagnose', 'pivot', 'test', 'metrics']
      },
      {
        id: 'mock-q-3',
        question: 'How do you ensure a cohesive brand voice and visual style guidelines are maintained across different paid search and social channels?',
        category: 'behavioral',
        expectedConcepts: ['brand voice', 'consistency', 'style guide', 'audience', 'cohesion']
      }
    ];
  } else {
    // Default high-fidelity engineering / technical questions
    customQuestions = [
      {
        id: 'mock-q-1',
        question: `For a competitive ${targetCareer || 'Software Engineer'} role, how do you approach performance tuning, database index optimization, and resource scaling under high traffic?`,
        category: 'technical',
        expectedConcepts: ['caching', 'load balancing', 'indexing', 'horizontal scale', 'redis']
      },
      {
        id: 'mock-q-2',
        question: 'Can you describe a time when you disagreed with a key design or project direction proposed by a team lead? How did you resolve it to ensure project success?',
        category: 'behavioral',
        expectedConcepts: ['active listening', 'collaboration', 'objective data', 'professional respect', 'compromise']
      },
      {
        id: 'mock-q-3',
        question: 'What is your strategy for learning a completely new technical stack or framework when assigned to a time-sensitive production deployment?',
        category: 'behavioral',
        expectedConcepts: ['hands-on building', 'documentation', 'minimally viable prototype', 'incremental tests', 'learning curve']
      }
    ];
  }

  res.json(customQuestions);
});

app.post('/api/interview/evaluate', async (req, res) => {
  const { targetCareer, questionText, userAnswer, category } = req.body;
  const gemini = getGeminiClient();

  const prompt = `Analyze this mock interview response for a ${targetCareer || 'Software Engineer'} role:
Question: ${questionText}
Candidate Answer: ${userAnswer}
Category: ${category}

Evaluate the response objectively. Return a JSON object with this EXACT structure:
{
  "score": 0-100 (integer score),
  "strength": "Brief sentence highlighting what the candidate did well.",
  "improvement": "Constructive critique on missing keywords, architectural concepts, or structure.",
  "sampleAnswer": "An elegant, comprehensive model answer (2-3 sentences) that demonstrates elite expertise."
}`;

  if (gemini) {
    try {
      const response = await generateContentWithRetry(
        prompt,
        undefined,
        'application/json'
      );
      const dataStr = response.text?.trim() || '{}';
      const parsedEvaluation = safeJSONParse(dataStr, null);
      if (parsedEvaluation && parsedEvaluation.score !== undefined) {
        return res.json(parsedEvaluation);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        console.log('[Notice] Interview Evaluate: Quota exceeded (429). Activating smart local grading engine.');
      } else {
        console.log('[Notice] Interview Evaluate fallback activated:', errMsg.slice(0, 120));
      }
    }
  }

  // Premium, highly dynamic, fallback grading engine using concept matching
  const answerLower = (userAnswer || '').toLowerCase();
  const careerLower = (targetCareer || 'Software Engineer').toLowerCase();

  // Try to extract expected concepts dynamically based on question text keywords
  let defaultConcepts = ['experience', 'communication', 'objective', 'planning'];
  if (questionText.toLowerCase().includes('grid') || questionText.toLowerCase().includes('rem')) {
    defaultConcepts = ['grid', 'rem', 'responsive design', 'accessibility', 'viewport'];
  } else if (questionText.toLowerCase().includes('controversial') || questionText.toLowerCase().includes('ux')) {
    defaultConcepts = ['empathy', 'data', 'user testing', 'collaboration', 'active listening'];
  } else if (questionText.toLowerCase().includes('vulnerabilities') || questionText.toLowerCase().includes('security')) {
    defaultConcepts = ['risk assessment', 'business impact', 'clarity', 'plain language', 'solution'];
  } else if (questionText.toLowerCase().includes('seo') || questionText.toLowerCase().includes('campaign')) {
    defaultConcepts = ['seo', 'adwords', 'ltv', 'cac', 'funnel', 'conversion'];
  } else if (questionText.toLowerCase().includes('tuning') || questionText.toLowerCase().includes('scaling')) {
    defaultConcepts = ['caching', 'load balancing', 'indexing', 'horizontal scale', 'redis'];
  } else if (questionText.toLowerCase().includes('disagreed') || questionText.toLowerCase().includes('direction')) {
    defaultConcepts = ['active listening', 'collaboration', 'objective data', 'professional respect', 'compromise'];
  } else if (questionText.toLowerCase().includes('new technical') || questionText.toLowerCase().includes('framework')) {
    defaultConcepts = ['hands-on building', 'documentation', 'minimally viable prototype', 'incremental tests', 'learning curve'];
  }

  const hits = defaultConcepts.filter(concept => answerLower.includes(concept.toLowerCase()));
  const misses = defaultConcepts.filter(concept => !answerLower.includes(concept.toLowerCase()));

  // Score calculation: base 55, add up to 40 based on concepts hit, add up to 5 based on response length
  let scorePoints = 55;
  if (defaultConcepts.length > 0) {
    scorePoints += Math.round((hits.length / defaultConcepts.length) * 35);
  }
  if (userAnswer.length > 80) {
    scorePoints += 5;
  }
  if (userAnswer.length > 200) {
    scorePoints += 5;
  }
  const calculatedScore = Math.min(98, Math.max(45, scorePoints));

  // Build feedback
  let strengthText = '';
  let improvementText = '';
  let sampleText = '';

  if (hits.length > 0) {
    strengthText = `Excellent work explicitly demonstrating core awareness of: ${hits.slice(0, 3).join(', ')}. Your conversational structure flows logically.`;
  } else {
    strengthText = 'You provided a clear, conversational description of your background and methodology.';
  }

  if (misses.length > 0) {
    improvementText = `To elevate this to an elite standard, incorporate specific industrial concepts like: ${misses.join(', ')}. Quantify your achievements using real-world numbers where possible.`;
  } else {
    improvementText = 'Excellent response density. For further improvement, include brief mentions of specific tools or timelines from your portfolio.';
  }

  // Model answers
  if (questionText.toLowerCase().includes('grid') || questionText.toLowerCase().includes('rem')) {
    sampleText = 'A professional approach establishes a fluid 8px spacing grid inside Figma. Rem units are preferred for structural sizing to respect the browser root font size for accessibility, while specific static borders use hardcoded pixel values.';
  } else if (questionText.toLowerCase().includes('controversial') || questionText.toLowerCase().includes('ux')) {
    sampleText = 'To align stakeholders, we run lightweight A/B user testing sessions and present objective metrics rather than opinions. Actively listening to engineering constraints and validating their concerns builds immediate collaborative trust.';
  } else if (questionText.toLowerCase().includes('tuning') || questionText.toLowerCase().includes('scaling')) {
    sampleText = 'An enterprise tuning pipeline begins with adding robust caching layers (Redis), establishing database connection pools, optimizing slow query indexes, and configuring horizontal scaling groups behind standard load balancers.';
  } else {
    sampleText = 'A senior approach balances technical depth with business impact. We build a minimally viable prototype to isolate bugs early, establish a regression testing suite, and document key architecture pivots clearly for the team.';
  }

  res.json({
    score: calculatedScore,
    strength: strengthText,
    improvement: improvementText,
    sampleAnswer: sampleText
  });
});

// 9. SCHEDULE COUNSELOR SESSIONS
app.get('/api/counselors', (req, res) => {
  const counselors = db.users
    .filter(u => u.role === 'counselor')
    .map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      avatar: c.avatar,
      bio: c.bio,
      academicBackground: c.academicBackground,
      specialization: c.skills || ['General Guidance'],
      rating: 4.9
    }));
  res.json(counselors);
});

app.post('/api/sessions/schedule', (req, res) => {
  const { studentId, studentName, counselorId, counselorName, dateTime, notes } = req.body;
  if (!studentId || !counselorId || !dateTime) {
    return res.status(400).json({ error: 'Missing session criteria.' });
  }

  const newSession = {
    id: `session-${Date.now()}`,
    studentId,
    studentName,
    counselorId,
    counselorName,
    dateTime,
    status: 'scheduled',
    notes: notes || 'General consultation.'
  };

  db.counselorSessions.push(newSession);
  db.systemLog.push({ timestamp: new Date().toISOString(), message: `New counseling session scheduled: ${studentName} with ${counselorName}` });
  saveDB(db);

  res.status(201).json(newSession);
});

app.get('/api/sessions/student/:studentId', (req, res) => {
  const list = db.counselorSessions.filter(s => s.studentId === req.params.studentId);
  res.json(list);
});

app.get('/api/sessions/counselor/:counselorId', (req, res) => {
  const list = db.counselorSessions.filter(s => s.counselorId === req.params.counselorId);
  res.json(list);
});

app.put('/api/sessions/:id', (req, res) => {
  const index = db.counselorSessions.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  const { status, notes } = req.body;
  db.counselorSessions[index].status = status || db.counselorSessions[index].status;
  db.counselorSessions[index].notes = notes !== undefined ? notes : db.counselorSessions[index].notes;

  saveDB(db);
  res.json(db.counselorSessions[index]);
});

// 10. SYSTEM ANALYTICS & MONITORING (ADMIN VIEW)
app.get('/api/admin/stats', (req, res) => {
  const stats = {
    totalUsers: db.users.length,
    studentsCount: db.users.filter(u => u.role === 'student').length,
    counselorsCount: db.users.filter(u => u.role === 'counselor').length,
    sessionsCount: db.counselorSessions.length,
    activeSessions: db.counselorSessions.filter(s => s.status === 'scheduled').length,
    systemLogs: db.systemLog.slice(-15).reverse(), // Last 15 logs
    isCoreActive: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  };
  res.json(stats);
});

// 11. STATIC DATABASES
// Jobs database matching recommended careers
const JOBS_DB = [
  { id: 'job-1', title: 'Associate AI Developer', company: 'Horizon Intelligent Solutions', location: 'San Francisco, CA (Hybrid)', salaryRange: '$120,000 - $160,000', skillsRequired: ['Python', 'Large Language Models', 'PyTorch', 'SQL'], applyLink: 'https://example.com' },
  { id: 'job-2', title: 'Data Scientist - Marketing Analytics', company: 'Netflix', location: 'Los Gatos, CA', salaryRange: '$135,000 - $180,000', skillsRequired: ['Python', 'SQL', 'A/B Testing', 'Pandas'], applyLink: 'https://jobs.netflix.com' },
  { id: 'job-3', title: 'Frontend Systems Engineer', company: 'Stripe', location: 'Remote (US)', salaryRange: '$110,000 - $150,000', skillsRequired: ['JavaScript/TypeScript', 'React.js', 'Tailwind CSS', 'Git'], applyLink: 'https://stripe.com/jobs' },
  { id: 'job-4', title: 'Junior Cloud Engineer', company: 'Amazon Web Services', location: 'Seattle, WA', salaryRange: '$100,000 - $135,000', skillsRequired: ['AWS', 'Linux', 'SQL', 'Git'], applyLink: 'https://amazon.jobs' },
  { id: 'job-5', title: 'Cyber Security Analyst', company: 'CrowdStrike', location: 'Austin, TX', salaryRange: '$105,000 - $140,000', skillsRequired: ['Network Security', 'Linux', 'Python'], applyLink: 'https://crowdstrike.com/careers' },
  { id: 'job-6', title: 'Associate Product Manager', company: 'Atlassian', location: 'Sydney, AU (Remote)', salaryRange: '$95,000 - $130,000', skillsRequired: ['Agile Methodologies', 'User Experience (UX)', 'Market Analytics'], applyLink: 'https://atlassian.com/careers' }
];

// Universities Database
const UNIVERSITIES_DB = [
  { id: 'uni-1', name: 'Stanford University', location: 'Stanford, CA', courses: ['M.S. in Computer Science (AI Track)', 'B.S. in Management Science & Engineering'], eligibility: 'GPA 3.8+, TOEFL 105+, strong coding portfolio', fees: '$55,000 / year', scholarships: ['Stanford Graduate Fellowship', 'Knight-Hennessy Scholars Program'], placementStatistics: '96% placed within 3 months, Median starting salary $145,000' },
  { id: 'uni-2', name: 'Massachusetts Institute of Technology (MIT)', location: 'Cambridge, MA', courses: ['Master of Engineering in Electrical Engineering & Computer Science', 'B.S. in Cognitive Science'], eligibility: 'GPA 3.9+, GRE Quantitative 168+, 3 Letters of Recommendation', fees: '$57,500 / year', scholarships: ['MIT Presidential Fellowship', 'Legatum Fellowship'], placementStatistics: '98% placement, Median starting salary $155,000' },
  { id: 'uni-3', name: 'National University of Singapore (NUS)', location: 'Singapore', courses: ['Master of Computing in Artificial Intelligence', 'Bachelor of Computing in Information Systems'], eligibility: 'GPA 3.7+, GRE 320+, IELTS 7.0+', fees: '$28,000 / year', scholarships: ['NUS Graduate Scholarship', 'ASEAN Graduate Scholarship'], placementStatistics: '92% placement, Median starting salary SGD 84,000' },
  { id: 'uni-4', name: 'Indian Institute of Technology (IIT) Delhi', location: 'New Delhi, India', courses: ['M.Tech in Computer Science', 'M.Tech in Data Science'], eligibility: 'GATE Score 850+, B.Tech in CSE/EE with 8.0+ CGPA', fees: 'INR 2,50,000 / year', scholarships: ['IITD Merit Scholarship', 'Prime Minister Research Fellowship (PMRF)'], placementStatistics: '95% placement, Median salary INR 22,00,000' }
];

// Scholarships Database
const SCHOLARSHIPS_DB = [
  { id: 'sch-1', name: 'Next-Gen Women in Tech Scholarship', criteria: 'Enrolled in STEM / Computer Science field, identified female leadership potential', amount: '$10,000', coverage: 'Full Tuition Support & Mentorship', eligibility: 'Female students, minimum GPA 3.5', deadline: '2026-12-15' },
  { id: 'sch-2', name: 'Global AI Research Excellence Grant', criteria: 'Engaged in machine learning, NLP, or computer vision graduate projects', amount: '$15,000', coverage: 'Direct stipend for research and conference travel', eligibility: 'Graduate or Ph.D. students with accepted papers', deadline: '2026-11-01' },
  { id: 'sch-3', name: 'Emerging Markets Talent Bursary', criteria: 'Financial constraints, demonstrating strong academic and community leadership', amount: '$8,000', coverage: 'Tuition discount & living expenses allowance', eligibility: 'Students from developing countries', deadline: '2026-10-10' }
];

app.get('/api/jobs', (req, res) => {
  res.json(JOBS_DB);
});

app.get('/api/universities', (req, res) => {
  res.json(UNIVERSITIES_DB);
});

app.get('/api/scholarships', (req, res) => {
  res.json(SCHOLARSHIPS_DB);
});


// Server setup
async function startServer() {
  const desiredPort = parseInt(process.env.PORT || '3000', 10);
  PORT = await getAvailablePort(desiredPort);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerAI Pro server listening on http://localhost:${PORT}`);
  });
}

startServer();
