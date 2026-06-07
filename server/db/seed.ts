import db from './index.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Seed test user for e2e tests
const testUserEmail = 'alice@caliguide.com';
const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(testUserEmail);
if (!existingUser) {
  const testUserId = crypto.randomUUID();
  const hashedPassword = bcrypt.hashSync('hello123', 10);
  const avatarUrl = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="100" fill="#8bd3dd"/><text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="80" font-weight="700" fill="white">A</text></svg>`)}`;
  db.prepare('INSERT INTO users (id, name, email, password, avatar_url, member_since, role) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(testUserId, 'Alice Chen', testUserEmail, hashedPassword, avatarUrl, 'January 2026', 'admin');

  // Seed default checklist for test user
  const defaultItems = [
    'Passport', 'Visa Documentation', 'Social Security Card',
    'Proof of Address', 'Driver\'s License', 'Health Insurance Card',
    'Bank Account Statement', 'Employment Letter', 'I-94 Record',
    'Vaccination Records', 'Rental Agreement', 'Tax ID (ITIN)',
  ];
  const insertItem = db.prepare('INSERT INTO document_checklist (id, user_id, name, checked, sort_order) VALUES (?, ?, ?, 0, ?)');
  defaultItems.forEach((item, i) => {
    insertItem.run(crypto.randomUUID(), testUserId, item, i);
  });

  console.log('Test user alice@caliguide.com created (admin role)');
}

// Seed guides
const guides = [
  {
    id: 'guide-ssn',
    title: 'How to Get Your Social Security Number (SSN)',
    category: 'Essential',
    description: 'The SSN is essential for working, paying taxes, and accessing government services in the US.',
    content: 'A step-by-step guide to applying for your Social Security Number.',
    image_url: '',
    read_time: '5 min read',
    fee: 'Free',
    steps: JSON.stringify([
      { icon: 'FileText', title: '1. Gather Documents', desc: 'Prepare your passport, visa, and I-94 form.' },
      { icon: 'Calendar', title: '2. Visit SSA Office', desc: 'Find your nearest Social Security Administration office.' },
      { icon: 'UserPlus', title: '3. Complete Application', desc: 'Fill out Form SS-5 at the office.' },
      { icon: 'Clock', title: '4. Wait for Card', desc: 'Receive your SSN card by mail in 2-4 weeks.' },
    ]),
    documents: JSON.stringify([
      { title: 'Valid Passport', desc: 'Your unexpired foreign passport.' },
      { title: 'Visa', desc: 'Your current US visa (work, student, etc.).' },
      { title: 'I-94 Form', desc: 'Arrival/departure record (available online).' },
      { title: 'Work Authorization', desc: 'EAD card if applicable.' },
    ]),
    faq: JSON.stringify([
      { q: 'When should I apply for SSN?', a: 'Apply as soon as you have work authorization. You can apply at the same time as your visa if entering the US.' },
      { q: 'Can I work without an SSN?', a: 'You need an SSN to legally work in the US. However, you can start the application process while waiting.' },
    ]),
  },
  {
    id: 'guide-visa',
    title: 'Understanding Your Visa Status & Rights',
    category: 'Essential',
    description: 'Know your visa type, rights, and responsibilities to stay compliant with US immigration law.',
    content: 'A comprehensive guide to common visa types and what you can do under each.',
    image_url: '',
    read_time: '10 min read',
    fee: 'Free',
    steps: JSON.stringify([
      { icon: 'Search', title: '1. Know Your Status', desc: 'Check your I-94 for visa type and expiration date.' },
      { icon: 'FileText', title: '2. Understand Restrictions', desc: 'Each visa has specific work and travel rules.' },
      { icon: 'Calendar', title: '3. Track Deadlines', desc: 'Mark expiration dates and renewal windows.' },
      { icon: 'Shield', title: '4. Maintain Status', desc: 'Follow all requirements to keep your status valid.' },
    ]),
    documents: JSON.stringify([
      { title: 'I-94 Record', desc: 'Your official arrival/departure record.' },
      { title: 'Visa Stamp', desc: 'The stamp in your passport.' },
      { title: 'I-20/DS-2019', desc: 'For students and exchange visitors.' },
      { title: 'I-797', desc: 'Approval notice for work visas.' },
    ]),
    faq: JSON.stringify([
      { q: 'What happens if my visa expires?', a: 'Overstaying your visa can result in bars from re-entering the US. Always apply for extensions before expiration.' },
      { q: 'Can I change my visa status?', a: 'Yes, in many cases you can apply for a change of status while in the US. Consult an immigration attorney.' },
    ]),
  },
  {
    id: 'guide-dmv',
    title: 'How to Apply for Your First California Driver\'s License',
    category: 'DMV',
    description: 'Getting a driver\'s license is essential for mobility in California.',
    content: 'This guide breaks down the requirements and steps for new residents.',
    image_url: '',
    read_time: '8 min read',
    fee: '$45.00',
    steps: JSON.stringify([
      { icon: 'UserPlus', title: '1. Online Application', desc: 'Complete the DL 44 form on the DMV website.' },
      { icon: 'Calendar', title: '2. Book Appointment', desc: 'Schedule your visit at a local DMV field office.' },
      { icon: 'Eye', title: '3. Field Tests', desc: 'Vision exam and fingerprinting at the office.' },
      { icon: 'HelpCircle', title: '4. Knowledge Test', desc: 'Pass the written law and signs examination.' },
      { icon: 'Car', title: '5. Driving Test', desc: 'Final behind-the-wheel performance evaluation.' },
    ]),
    documents: JSON.stringify([
      { title: 'Identity & Birth Date', desc: 'Valid foreign passport with I-94 or Permanent Resident Card.' },
      { title: 'Social Security Number', desc: 'SSN card or proof of ineligibility if applicable.' },
      { title: 'Residency Proof (x2)', desc: 'Utility bills, rental agreements, or employment records.' },
      { title: 'REAL ID Requirement', desc: 'Recommended for domestic air travel after May 2025.', special: true },
    ]),
    faq: JSON.stringify([
      { q: 'Can I use a license from my home country?', a: 'California recognizes a valid driver\'s license from your home country for a short period. However, once you become a resident, you must obtain a California license within 10 days.' },
      { q: 'Is the written test available in other languages?', a: 'Yes, the DMV offers the knowledge test in many languages, including Spanish, Chinese, Hindi, and more.' },
    ]),
  },
  {
    id: 'guide-housing',
    title: 'Navigating the Rental Market: A Newcomer\'s Handbook',
    category: 'Housing',
    description: 'Finding a place to live in California can be overwhelming for newcomers.',
    content: 'This guide covers everything from understanding rental applications to tenant rights.',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-K9DsVJH-QkarCUZtSS1HPYFbl0Ai-apnPW9qURHeUaCcCZso4JfsJ4bsAZcTZ7riVxJkm74cEJClIZ1qj3sa-zpvRNzKeFSdA-XLxXu4GVX0wtWi9oEIS982mKpBSA6UMpLL824T0phfByQKM98zZ5fSqhTf--_hxj-1JJSMCtVPVFB3XZPLpy4vSmSPnVrs8PY9v-2BLTdDDuJjK-dLKI3QjxXv4WKK0B1kRN28MtagZRJ62LKWPJ95iL3ZHt-UsvGPsshPfK0',
    read_time: '12 min read',
    fee: 'Varies',
    steps: JSON.stringify([
      { icon: 'Search', title: '1. Research Areas', desc: 'Compare neighborhoods for safety, commute, and amenities.' },
      { icon: 'FileText', title: '2. Prepare Documents', desc: 'Gather pay stubs, ID, references, and credit report.' },
      { icon: 'Calendar', title: '3. Tour Properties', desc: 'Schedule viewings and inspect units carefully.' },
      { icon: 'ClipboardCheck', title: '4. Submit Application', desc: 'Fill out rental applications and pay deposits.' },
      { icon: 'Key', title: '5. Sign Lease & Move In', desc: 'Review lease terms, sign, and get your keys.' },
    ]),
    documents: JSON.stringify([
      { title: 'Government ID', desc: 'Passport, state ID, or driver\'s license.' },
      { title: 'Proof of Income', desc: 'Recent pay stubs or employment offer letter.' },
      { title: 'Rental History', desc: 'Previous landlord references or rental agreement.' },
      { title: 'Credit Report', desc: 'Some landlords require a credit check.' },
    ]),
    faq: JSON.stringify([
      { q: 'What is a security deposit?', a: 'A security deposit is typically 1-2 months rent, refundable at lease end minus damages.' },
      { q: 'Can a landlord refuse me because of my immigration status?', a: 'In California, it is illegal for landlords to discriminate based on immigration status.' },
    ]),
  },
  {
    id: 'guide-banking',
    title: 'Opening Your First Bank Account in California',
    category: 'Banking',
    description: 'Setting up a bank account is essential for managing your finances in the US.',
    content: 'Learn what documents you need and how to choose the right bank.',
    image_url: '',
    read_time: '6 min read',
    fee: 'Free - $25',
    steps: JSON.stringify([
      { icon: 'Landmark', title: '1. Choose a Bank', desc: 'Compare banks for fees, locations, and services.' },
      { icon: 'FileText', title: '2. Gather Documents', desc: 'Prepare ID, SSN/ITIN, and proof of address.' },
      { icon: 'UserPlus', title: '3. Visit Branch', desc: 'Open account in person or online.' },
      { icon: 'CreditCard', title: '4. Get Debit Card', desc: 'Receive and activate your debit card.' },
    ]),
    documents: JSON.stringify([
      { title: 'Government ID', desc: 'Passport or state-issued ID.' },
      { title: 'SSN or ITIN', desc: 'Social Security Number or Individual Taxpayer ID.' },
      { title: 'Proof of Address', desc: 'Utility bill or lease agreement.' },
    ]),
    faq: JSON.stringify([
      { q: 'Can I open an account without an SSN?', a: 'Yes, some banks accept an ITIN or passport for non-residents.' },
      { q: 'What is the minimum balance?', a: 'Varies by bank. Some have no minimum, others require $25-$100.' },
    ]),
  },
  {
    id: 'guide-healthcare',
    title: 'Understanding Healthcare in California',
    category: 'Health',
    description: 'Navigate the California healthcare system, from insurance to finding a doctor.',
    content: 'A comprehensive guide to staying healthy and covered in California.',
    image_url: '',
    read_time: '10 min read',
    fee: 'Varies',
    steps: JSON.stringify([
      { icon: 'HeartPulse', title: '1. Understand Insurance', desc: 'Learn about Covered California, employer plans, and Medi-Cal.' },
      { icon: 'Search', title: '2. Find a Provider', desc: 'Search for doctors accepting new patients.' },
      { icon: 'Calendar', title: '3. Schedule Visit', desc: 'Book your first appointment.' },
      { icon: 'FileText', title: '4. Get Prescriptions', desc: 'Fill prescriptions at local pharmacies.' },
    ]),
    documents: JSON.stringify([
      { title: 'Insurance Card', desc: 'Your health insurance member ID card.' },
      { title: 'Government ID', desc: 'Passport or state ID.' },
      { title: 'Medical Records', desc: 'Any relevant medical history from your home country.' },
    ]),
    faq: JSON.stringify([
      { q: 'Can I get health insurance as an immigrant?', a: 'Yes, many options are available depending on your immigration status.' },
      { q: 'What is Covered California?', a: 'It\'s the state marketplace for health insurance under the Affordable Care Act.' },
    ]),
  },
  {
    id: 'guide-emergency',
    title: 'Emergency Contacts & Resources',
    category: 'Essential',
    description: 'Know who to call in emergencies and where to find help when you need it most.',
    content: 'Essential contacts and resources for immigrants in California.',
    image_url: '',
    read_time: '3 min read',
    fee: 'Free',
    steps: JSON.stringify([
      { icon: 'Phone', title: '1. Save Emergency Numbers', desc: '911 for emergencies, 211 for social services.' },
      { icon: 'MapPin', title: '2. Find Local Resources', desc: 'Locate nearest hospitals, police stations, and consulates.' },
      { icon: 'Shield', title: '3. Know Your Rights', desc: 'Learn about your rights when interacting with authorities.' },
      { icon: 'Users', title: '4. Build Support Network', desc: 'Connect with community organizations and support groups.' },
    ]),
    documents: JSON.stringify([
      { title: 'Emergency Contacts', desc: 'Family, friends, and employer contact information.' },
      { title: 'Consulate Info', desc: 'Your country\'s consulate address and phone number.' },
      { title: 'Insurance Card', desc: 'Health insurance card for medical emergencies.' },
    ]),
    faq: JSON.stringify([
      { q: 'Can I call 911 without documentation?', a: 'Yes. Emergency services are available to everyone regardless of immigration status. Your information is protected.' },
      { q: 'What is 211?', a: '211 connects you with local social services including food, housing, and healthcare assistance.' },
    ]),
  },
  {
    id: 'guide-legal',
    title: 'Finding Legal Help & Immigration Attorneys',
    category: 'Essential',
    description: 'Find affordable legal assistance for immigration matters and know when you need an attorney.',
    content: 'A guide to finding and working with immigration attorneys.',
    image_url: '',
    read_time: '7 min read',
    fee: 'Free - $$$',
    steps: JSON.stringify([
      { icon: 'Search', title: '1. Research Options', desc: 'Look for non-profit legal aid and pro bono services.' },
      { icon: 'FileText', title: '2. Prepare Documents', desc: 'Gather all immigration paperwork before your consultation.' },
      { icon: 'Calendar', title: '3. Schedule Consultation', desc: 'Many attorneys offer free initial consultations.' },
      { icon: 'Shield', title: '4. Verify Credentials', desc: 'Check attorney is licensed and in good standing.' },
    ]),
    documents: JSON.stringify([
      { title: 'All Immigration Documents', desc: 'Passport, visa, I-94, any USCIS notices.' },
      { title: 'Timeline', desc: 'Written summary of your immigration history.' },
      { title: 'Questions List', desc: 'Write down all questions you want to ask.' },
    ]),
    faq: JSON.stringify([
      { q: 'How do I find a legitimate attorney?', a: 'Use the State Bar of California website to verify licenses. Avoid notarios who are not authorized to practice law.' },
      { q: 'What if I can\'t afford an attorney?', a: 'Many non-profits offer free or low-cost legal services. Search for "immigration legal aid" in your area.' },
    ]),
  },
  {
    id: 'guide-employment',
    title: 'Finding a Job in California',
    category: 'Jobs',
    description: 'Learn how to search for jobs, write a US-style resume, and understand your work rights.',
    content: 'A comprehensive guide to entering the California job market.',
    image_url: '',
    read_time: '12 min read',
    fee: 'Free',
    steps: JSON.stringify([
      { icon: 'FileText', title: '1. Prepare Resume', desc: 'Create a US-style resume with relevant experience.' },
      { icon: 'Search', title: '2. Search Jobs', desc: 'Use Indeed, LinkedIn, and company websites.' },
      { icon: 'Users', title: '3. Network', desc: 'Attend job fairs and connect with professionals.' },
      { icon: 'Calendar', title: '4. Interview', desc: 'Practice common interview questions.' },
      { icon: 'Check', title: '5. Follow Up', desc: 'Send thank-you emails after interviews.' },
    ]),
    documents: JSON.stringify([
      { title: 'Resume', desc: 'Updated US-style resume.' },
      { title: 'Work Authorization', desc: 'EAD card, visa, or green card.' },
      { title: 'References', desc: 'List of professional references.' },
      { title: 'Certifications', desc: 'Any relevant certifications or licenses.' },
    ]),
    faq: JSON.stringify([
      { q: 'Can I work while my visa is pending?', a: 'It depends on your visa type. Some visas allow work authorization while others do not. Check with an immigration attorney.' },
      { q: 'What if my credentials are from another country?', a: 'You may need to get your credentials evaluated or certified. Organizations like WES can help with credential evaluation.' },
    ]),
  },
  {
    id: 'guide-education',
    title: 'Education & Training Opportunities',
    category: 'Education',
    description: 'Explore educational opportunities from ESL classes to professional certifications.',
    content: 'A guide to continuing your education in California.',
    image_url: '',
    read_time: '9 min read',
    fee: 'Free - $$$$',
    steps: JSON.stringify([
      { icon: 'Search', title: '1. Assess Needs', desc: 'Determine what skills or credentials you need.' },
      { icon: 'FileText', title: '2. Research Programs', desc: 'Look into community colleges, universities, and training programs.' },
      { icon: 'Calendar', title: '3. Apply', desc: 'Submit applications and required documents.' },
      { icon: 'CreditCard', title: '4. Financial Aid', desc: 'Explore scholarships, grants, and loans.' },
    ]),
    documents: JSON.stringify([
      { title: 'Transcripts', desc: 'Academic transcripts from previous schools.' },
      { title: 'English Proficiency', desc: 'TOEFL or IELTS scores if applicable.' },
      { title: 'Financial Documents', desc: 'Bank statements for financial aid.' },
    ]),
    faq: JSON.stringify([
      { q: 'Can I attend school on a tourist visa?', a: 'Generally no. You need a student visa (F-1) for full-time study. Some short courses may be allowed.' },
      { q: 'Are there free ESL classes?', a: 'Yes! Many community colleges and libraries offer free ESL classes. Check your local Adult School.' },
    ]),
  },
  {
    id: 'guide-transportation',
    title: 'Getting Around California',
    category: 'Transportation',
    description: 'Learn about public transit, ride-sharing, and buying a car in California.',
    content: 'A guide to transportation options for newcomers.',
    image_url: '',
    read_time: '8 min read',
    fee: 'Varies',
    steps: JSON.stringify([
      { icon: 'Search', title: '1. Research Options', desc: 'Look into public transit, ride-sharing, and car ownership.' },
      { icon: 'FileText', title: '2. Get License', desc: 'Obtain a California driver\'s license if needed.' },
      { icon: 'CreditCard', title: '3. Budget', desc: 'Calculate costs for each transportation option.' },
      { icon: 'Check', title: '4. Choose', desc: 'Select the best option for your needs.' },
    ]),
    documents: JSON.stringify([
      { title: 'Driver\'s License', desc: 'California or international driver\'s license.' },
      { title: 'Insurance', desc: 'Auto insurance if owning a car.' },
      { title: 'Transit Card', desc: 'Clipper card for Bay Area transit.' },
    ]),
    faq: JSON.stringify([
      { q: 'Do I need a car in California?', a: 'It depends on where you live. Major cities have public transit, but suburban areas often require a car.' },
      { q: 'Can I use my foreign driver\'s license?', a: 'You can use it temporarily, but you should get a California license within 10 days of becoming a resident.' },
    ]),
  },
  {
    id: 'guide-shopping',
    title: 'Shopping & Groceries in California',
    category: 'Daily Life',
    description: 'Learn where to shop for groceries, household items, and more.',
    content: 'A guide to shopping and managing daily expenses in California.',
    image_url: '',
    read_time: '6 min read',
    fee: 'Free',
    steps: JSON.stringify([
      { icon: 'Search', title: '1. Find Stores', desc: 'Locate grocery stores, markets, and shopping centers.' },
      { icon: 'FileText', title: '2. Compare Prices', desc: 'Compare prices at different stores.' },
      { icon: 'CreditCard', title: '3. Budget', desc: 'Create a monthly shopping budget.' },
      { icon: 'Check', title: '4. Save Money', desc: 'Use coupons and shop sales.' },
    ]),
    documents: JSON.stringify([
      { title: 'Store Loyalty Cards', desc: 'Sign up for store rewards programs.' },
      { title: 'Coupons', desc: 'Collect coupons from newspapers and apps.' },
    ]),
    faq: JSON.stringify([
      { q: 'What are the cheapest grocery stores?', a: 'Trader Joe\'s, Aldi, and Walmart are known for affordable prices. Asian and Latino markets often have good deals on produce.' },
      { q: 'Do I need to tip at stores?', a: 'Tipping is not expected at retail stores or grocery stores.' },
    ]),
  },
];

const insertGuide = db.prepare(`
  INSERT OR IGNORE INTO guides (id, title, category, description, content, image_url, read_time, fee, steps, documents, faq)
  VALUES (@id, @title, @category, @description, @content, @image_url, @read_time, @fee, @steps, @documents, @faq)
`);

const seedGuides = db.transaction(() => {
  for (const guide of guides) {
    insertGuide.run(guide);
  }
});

seedGuides();

// Seed forum posts if none exist
const postCount = db.prepare('SELECT COUNT(*) as count FROM forum_posts').get() as { count: number };
if (postCount.count === 0) {
  // Create a system user for seed posts
  const systemUserId = 'system-user';
  db.prepare(`INSERT OR IGNORE INTO users (id, name, email, password, avatar_url, member_since) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(systemUserId, 'CaliGuide', 'system@caliguide.com', '', '', 'January 2026');

  const insertPost = db.prepare(`
    INSERT INTO forum_posts (id, author_id, title, content, category, tags, views, status, created_at)
    VALUES (@id, @author_id, @title, @content, @category, @tags, @views, 'approved', @created_at)
  `);

  const seedPosts = db.transaction(() => {
    insertPost.run({
      id: 'post-1',
      author_id: systemUserId,
      title: 'Best areas for new families in the San Francisco Bay Area with school access?',
      content: 'I\'m moving from Toronto and looking for a safe neighborhood that has strong public elementary schools. Budget is around $3k-$4k for a 2-bedroom rental.',
      category: 'Housing',
      tags: JSON.stringify(['#RentalMarket', '#Schools']),
      views: 1200,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-2',
      author_id: systemUserId,
      title: 'How long does it typically take to open a Chase account with a non-resident ID?',
      content: 'I have my passport and local proof of address ready, just wondering if I can do it in one visit.',
      category: 'Banking',
      tags: JSON.stringify(['#Banking', '#Chase']),
      views: 800,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-3',
      author_id: systemUserId,
      title: 'Understanding the current job market for tech in SoCal vs NorCal?',
      content: 'I\'m hearing mixed things about the job availability in Irvine compared to Mountain View.',
      category: 'Employment',
      tags: JSON.stringify(['#Jobs', '#Tech']),
      views: 2100,
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-4',
      author_id: systemUserId,
      title: 'Tips for passing the California DMV written test on first try?',
      content: 'I\'m taking my DMV written test next week. Any tips on how to prepare? Are there good practice tests available online?',
      category: 'DMV',
      tags: JSON.stringify(['#DMV', '#DriverLicense']),
      views: 1500,
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-5',
      author_id: systemUserId,
      title: 'How to find a good immigration lawyer in California?',
      content: 'I need help with my visa extension. Can anyone recommend a good immigration lawyer? What should I expect to pay?',
      category: 'Legal',
      tags: JSON.stringify(['#Legal', '#Immigration']),
      views: 950,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-6',
      author_id: systemUserId,
      title: 'Best health insurance options for new immigrants?',
      content: 'Just moved to California and need health insurance. What are the best options for someone without employer coverage?',
      category: 'Health',
      tags: JSON.stringify(['#Health', '#Insurance']),
      views: 1800,
      created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-7',
      author_id: systemUserId,
      title: 'Where to find affordable housing in Bay Area?',
      content: 'Moving to Bay Area for work. Looking for affordable housing options. Any suggestions for neighborhoods?',
      category: 'Housing',
      tags: JSON.stringify(['#Housing', '#BayArea']),
      views: 2500,
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-8',
      author_id: systemUserId,
      title: 'Best apps for learning English as a second language?',
      content: 'Looking for recommendations on apps or websites to improve my English. What has worked for you?',
      category: 'Education',
      tags: JSON.stringify(['#ESL', '#Learning']),
      views: 1100,
      created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-9',
      author_id: systemUserId,
      title: 'How to build credit score as a new immigrant?',
      content: 'Just arrived in the US and need to build credit history. What are the best ways to start?',
      category: 'Banking',
      tags: JSON.stringify(['#Credit', '#Finance']),
      views: 1900,
      created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    });
    insertPost.run({
      id: 'post-10',
      author_id: systemUserId,
      title: 'Community events for newcomers in Los Angeles?',
      content: 'Just moved to LA and looking to meet other immigrants. Any recommendations for community events or groups?',
      category: 'Social',
      tags: JSON.stringify(['#Community', '#LA']),
      views: 800,
      created_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    });
  });

  seedPosts();

  // Seed replies
  const replyCount = db.prepare('SELECT COUNT(*) as count FROM forum_replies').get() as { count: number };
  if (replyCount.count === 0) {
    const insertReply = db.prepare(`
      INSERT INTO forum_replies (id, post_id, author_id, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Add replies to post-1
    insertReply.run(
      'reply-1',
      'post-1',
      systemUserId,
      'I recommend checking out Fremont or Union City. Great schools and reasonable rent compared to SF.',
      new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    );
    insertReply.run(
      'reply-2',
      'post-1',
      systemUserId,
      'San Jose has some good options too. Look into the Evergreen or Almaden areas.',
      new Date(Date.now() - 30 * 60 * 1000).toISOString()
    );

    // Add replies to post-2
    insertReply.run(
      'reply-3',
      'post-2',
      systemUserId,
      'It took me about 30 minutes. Make sure you have your I-94 printout as well.',
      new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    );

    // Add replies to post-4
    insertReply.run(
      'reply-4',
      'post-4',
      systemUserId,
      'I used the DMV practice test app and passed on my first try. Highly recommend it!',
      new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
    );
    insertReply.run(
      'reply-5',
      'post-4',
      systemUserId,
      'The written test is available in multiple languages. I took it in Chinese.',
      new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    );

    // Add replies to post-8
    insertReply.run(
      'reply-6',
      'post-8',
      systemUserId,
      'Duolingo is great for beginners. For more advanced learning, try Coursera or edX ESL courses.',
      new Date(Date.now() - 70 * 60 * 60 * 1000).toISOString()
    );

    // Add replies to post-9
    insertReply.run(
      'reply-7',
      'post-9',
      systemUserId,
      'Start with a secured credit card. Discover and Capital One have good options for newcomers.',
      new Date(Date.now() - 90 * 60 * 60 * 1000).toISOString()
    );
    insertReply.run(
      'reply-8',
      'post-9',
      systemUserId,
      'Pay all your bills on time and keep your credit utilization low. It takes 6-12 months to build a good score.',
      new Date(Date.now() - 85 * 60 * 60 * 1000).toISOString()
    );

    // Add replies to post-10
    insertReply.run(
      'reply-9',
      'post-10',
      systemUserId,
      'Check out Meetup.com for immigrant groups in LA. There are also many cultural festivals throughout the year.',
      new Date(Date.now() - 110 * 60 * 60 * 1000).toISOString()
    );
  }
}

// Seed events if none exist
const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
if (eventCount.count === 0) {
  const adminUser = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get() as any;
  if (adminUser) {
    const insertEvent = db.prepare(`
      INSERT INTO events (id, title, description, type, category, location, online_link, start_date, end_date, max_participants, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    insertEvent.run(
      'event-1',
      'Immigration Workshop: Understanding Your Rights',
      'Learn about your rights as an immigrant in California. Topics include: workplace rights, housing rights, and interactions with law enforcement. Free legal consultation available after the workshop.',
      'hybrid',
      'workshop',
      'Community Center, 123 Main St, Los Angeles',
      'https://meet.google.com/abc-defg-hij',
      nextWeek.toISOString(),
      new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      50,
      adminUser.id
    );

    insertEvent.run(
      'event-2',
      'Volunteer: Community Food Drive',
      'Help distribute food packages to immigrant families in need. No experience required. Bring comfortable shoes and a positive attitude!',
      'offline',
      'volunteer',
      '456 Oak Ave, San Francisco',
      '',
      new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      30,
      adminUser.id
    );

    insertEvent.run(
      'event-3',
      'Online: Resume Writing for US Job Market',
      'Learn how to write a US-style resume. We\'ll cover format, keywords, and tips to stand out. Perfect for newcomers entering the job market.',
      'online',
      'workshop',
      '',
      'https://zoom.us/j/123456789',
      new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString(),
      100,
      adminUser.id
    );

    insertEvent.run(
      'event-4',
      'Newcomers Social Mixer',
      'Meet other new immigrants in a relaxed setting. Share experiences, make friends, and build your network. Light refreshments provided.',
      'offline',
      'social',
      '789 Elm St, San Jose',
      '',
      new Date(nextMonth.toISOString()).toISOString(),
      new Date(nextMonth.getTime() + 3 * 60 * 60 * 1000).toISOString(),
      40,
      adminUser.id
    );

    insertEvent.run(
      'event-5',
      'Volunteer: English Conversation Practice',
      'Help immigrants practice English conversation skills. No teaching experience needed - just be a friendly conversation partner!',
      'offline',
      'volunteer',
      'Library, 321 Pine St, Oakland',
      '',
      new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      20,
      adminUser.id
    );

    insertEvent.run(
      'event-6',
      'Tax Filing Workshop for Immigrants',
      'Learn how to file taxes in the US. Topics include: ITIN application, tax credits, and common mistakes to avoid.',
      'hybrid',
      'workshop',
      'Community Center, 456 Oak St, San Diego',
      'https://zoom.us/j/987654321',
      new Date(nextMonth.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(nextMonth.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      60,
      adminUser.id
    );

    insertEvent.run(
      'event-7',
      'Volunteer: School Supply Drive',
      'Help collect and distribute school supplies for immigrant children. Every child deserves a good start to the school year!',
      'offline',
      'volunteer',
      'School District Office, 789 Pine Ave, Sacramento',
      '',
      new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(nextMonth.getTime() + 15 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
      25,
      adminUser.id
    );

    insertEvent.run(
      'event-8',
      'Cultural Exchange Night',
      'Share your culture and learn about others! Bring a dish from your home country and stories to share.',
      'offline',
      'social',
      'Community Hall, 321 Main St, Los Angeles',
      '',
      new Date(nextMonth.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      new Date(nextMonth.getTime() + 20 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      75,
      adminUser.id
    );

    console.log('Events seeded successfully');
  }
}

// Seed announcements if none exist
const announcementCount = db.prepare('SELECT COUNT(*) as count FROM announcements').get() as { count: number };
if (announcementCount.count === 0) {
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (id, title, content, type, active)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertAnnouncement.run(
    'announcement-1',
    'Welcome to CaliGuide!',
    'Your one-stop resource for navigating life in California. Explore guides, join community discussions, and connect with other newcomers.',
    'info',
    1
  );

  insertAnnouncement.run(
    'announcement-2',
    'New: Immigration Workshop Next Week',
    'Join our free workshop on understanding your rights as an immigrant. Register now in the Events section!',
    'info',
    1
  );

  insertAnnouncement.run(
    'announcement-3',
    'Important: Document Checklist Updated',
    'We\'ve updated our document checklist with new requirements. Check your Profile to see the latest items.',
    'warning',
    1
  );

  console.log('Announcements seeded successfully');
}

console.log('Database seeded successfully');
