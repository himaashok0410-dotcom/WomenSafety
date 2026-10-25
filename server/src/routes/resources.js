const express = require('express');
const router = express.Router();

// Curated verified helplines across India
const HELPLINES = [
  {
    id: 'all-in-one-112',
    name: 'National Emergency Response (All-in-One)',
    number: '112',
    telUrl: 'tel:112',
    description: 'Unified 24/7 emergency response for Police, Fire, and Ambulance across all Indian States and Union Territories.',
    category: 'police_medical',
    badge: 'National Priority'
  },
  {
    id: 'women-police-1091',
    name: 'Women Police Helpline',
    number: '1091',
    telUrl: 'tel:1091',
    description: 'Dedicated toll-free 24/7 police assistance helpline for women experiencing distress or harassment.',
    category: 'women_safety',
    badge: '24/7 Toll-Free'
  },
  {
    id: 'women-distress-181',
    name: 'Women in Distress (National Commission for Women)',
    number: '181',
    telUrl: 'tel:181',
    description: 'National helpline providing counselling, rescue referral, and legal support for women facing domestic violence or harassment.',
    category: 'women_safety',
    badge: 'Counselling & Support'
  },
  {
    id: 'women-powerline-1090',
    name: 'Women Power Line',
    number: '1090',
    telUrl: 'tel:1090',
    description: 'Specialised response unit addressing stalking, digital harassment, and public eve-teasing.',
    category: 'women_safety',
    badge: 'Anti-Stalking'
  },
  {
    id: 'cyber-crime-1930',
    name: 'National Cyber Crime Reporting Helpline',
    number: '1930',
    telUrl: 'tel:1930',
    description: 'For online harassment, morphed media, cyberstalking, and financial fraud reporting (portal: cybercrime.gov.in).',
    category: 'cyber_crime',
    badge: 'Digital Safety'
  },
  {
    id: 'childline-1098',
    name: 'Childline India',
    number: '1098',
    telUrl: 'tel:1098',
    description: 'Emergency assistance, rescue, and rehabilitation for children and teenagers under 18 in distress.',
    category: 'children',
    badge: 'Minors & Youth'
  },
  {
    id: 'ncw-whatsapp',
    name: 'NCW 24/7 WhatsApp Grievance',
    number: '+91 72177 35372',
    telUrl: 'tel:+917217735372',
    whatsappUrl: 'https://wa.me/917217735372',
    description: 'Direct WhatsApp helpline managed by the National Commission for Women for rapid incident reporting.',
    category: 'women_safety',
    badge: 'WhatsApp Support'
  }
];

// Practical safety guides
const SAFETY_GUIDES = [
  {
    id: 'cab-transit',
    title: 'Safe Commuting & Taxi Best Practices',
    category: 'transit',
    summary: 'Practical precautions when using cabs, auto-rickshaws, or late-night transit.',
    steps: [
      'Verify vehicle license plate, driver photo, and car model before opening the door.',
      'Check child-lock status on back doors before pulling away.',
      'Share your live trip status or SafeHer journey link with a trusted family member or friend.',
      'Keep your phone charged above 20% and avoid using both earbuds while commuting alone in unfamiliar areas.',
      'If the driver deviates from the planned route, speak firmly asking for an explanation and immediately call a friend or dial 112.'
    ]
  },
  {
    id: 'digital-evidence',
    title: 'Preserving Evidence for Harassment & Cyberstalking',
    category: 'legal',
    summary: 'How to legally document digital abuse, threatening messages, or stalking without losing admissibility.',
    steps: [
      'Take full screenshot captures including sender handles, timestamps, phone numbers, and URL bars.',
      'Do not delete abusive chat threads or emails; export the raw chat history with media attached.',
      'Record URL links to social media profiles and preserve any voice notes or voicemails.',
      'Report immediately via cybercrime.gov.in or dial 1930 before digital records are wiped.',
      'Remember you have the right to request a woman police officer when filing a statement.'
    ]
  },
  {
    id: 'zero-fir',
    title: 'Understanding Your Legal Rights: The Zero FIR',
    category: 'legal',
    summary: 'What Indian law guarantees when you need police intervention.',
    steps: [
      'Zero FIR: Any police station in India is legally mandated to register an FIR regarding a cognizable offense against a woman, regardless of jurisdiction or where the crime took place.',
      'Right to Free Legal Aid: Under the Legal Services Authorities Act, women in India are entitled to free legal assistance regardless of financial income.',
      'Privacy & Dignity: Under Section 164 CrPC / BNSS, statements of survivors of sexual offenses must be recorded in private, by or before a female magistrate or police officer.'
    ]
  },
  {
    id: 'situation-deescalation',
    title: 'Public Street Awareness & De-escalation',
    category: 'street',
    summary: 'Situational strategies when walking alone or navigating uncomfortable encounters.',
    steps: [
      'Walk with confidence, head up, and maintain open peripheral vision.',
      'If you feel followed, cross the street, enter an open shop, pharmacy, petrol pump, or well-lit commercial establishment.',
      'Use the SafeHer Fake Call tool to pretend you are actively conversing with someone expecting you within 2 minutes.',
      'Do not hesitate to create noise or call out loudly for help; predatory individuals rely on silence and isolation.'
    ]
  }
];

// Quick emergency checklist
const CHECKLIST_ITEMS = [
  { id: '1', task: 'Charge your phone and enable Battery Saver mode if below 30%', category: 'phone' },
  { id: '2', task: 'Add at least two trusted emergency contacts with updated phone numbers', category: 'contacts' },
  { id: '3', task: 'Share your SafeHer live journey link before boarding evening transit', category: 'journey' },
  { id: '4', task: 'Set an active Check-In timer if travelling through isolated corridors', category: 'checkin' },
  { id: '5', task: 'Confirm location services / GPS permissions are active in your browser', category: 'device' }
];

// GET /api/resources/helplines
router.get('/helplines', (req, res) => {
  res.json({
    success: true,
    helplines: HELPLINES,
    primaryEmergencyNumber: '112',
    disclaimer: 'Helplines are maintained by national and state government authorities. SafeHer provides verified quick dial shortcuts for immediate accessibility.'
  });
});

// GET /api/resources/guidance
router.get('/guidance', (req, res) => {
  res.json({
    success: true,
    guides: SAFETY_GUIDES
  });
});

// GET /api/resources/checklist
router.get('/checklist', (req, res) => {
  res.json({
    success: true,
    checklist: CHECKLIST_ITEMS
  });
});

module.exports = router;
