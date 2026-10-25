const { MongoClient, ObjectId, GridFSBucket } = require('mongodb');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function nowUtcIso() {
  return new Date().toISOString();
}

function generateJobAppRefNumber() {
  const year = new Date().getFullYear();
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let rand = "";
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AST-${year}-${rand}`;
}

function storeResumeInGridFS(db, filename, contentType, buffer) {
  return new Promise((resolve, reject) => {
    try {
      const bucket = new GridFSBucket(db, { bucketName: "career_resumes" });
      const safeFilename = (filename || "resume.pdf")
        .replace(/[/\\?%*:|"<>]/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "_");
      const uploadStream = bucket.openUploadStream(safeFilename, {
        contentType: contentType || "application/pdf",
        metadata: { uploadedAt: nowUtcIso() },
      });
      const stream = Readable.from(buffer);
      stream.on("error", (err) => reject(err));
      uploadStream.on("error", (err) => reject(err));
      uploadStream.on("finish", () => {
        resolve({ fileId: uploadStream.id, filename: safeFilename });
      });
      stream.pipe(uploadStream);
    } catch (err) {
      reject(err);
    }
  });
}

const CANDIDATES = [
  // 1. Sales Executive (id: 6adb513f67eabd2b14554441)
  {
    jobId: '6adb513f67eabd2b14554441',
    jobTitle: 'Sales Executive',
    jobSlug: 'sales-executive',
    name: 'Rahul Sen',
    email: 'rahul.sen.realty@gmail.com',
    phone: '+919830244719',
    linkedin: 'https://linkedin.com/in/rahul-sen-realty-kolkata',
    portfolioUrl: '',
    coverNote: 'Proven experience of over 4 years in luxury residential advisory across Rajarhat, Action Area II, and EM Bypass corridors.',
    experienceYears: 4,
    currentCompany: 'Ambuja Neotia Realty',
    currentCtc: '7.2',
    expectedCtc: '9.0',
    noticePeriodDays: 30,
    resumeFilename: 'Rahul_Sen_Curriculum_Vitae.pdf',
    status: 'Shortlisted',
    notes: [
      {
        id: 'note-rs-1',
        text: 'Strong track record in premium high-rise closures. Excellent product knowledge and client negotiation skills.',
        author: 'admin@astitva.com',
        createdAt: '2026-10-24T11:20:00.000Z'
      }
    ],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-23T14:10:00.000Z', reason: 'Online application' },
      { fromStatus: 'New', toStatus: 'Under Review', changedBy: 'admin@astitva.com', changedAt: '2026-10-24T09:30:00.000Z', reason: 'Resume shortlisted for review' },
      { fromStatus: 'Under Review', toStatus: 'Shortlisted', changedBy: 'admin@astitva.com', changedAt: '2026-10-24T11:25:00.000Z', reason: 'Passed initial screening call' }
    ]
  },
  {
    jobId: '6adb513f67eabd2b14554441',
    jobTitle: 'Sales Executive',
    jobSlug: 'sales-executive',
    name: 'Priyanka Mukherjee',
    email: 'priyanka.m.realty@gmail.com',
    phone: '+919831188204',
    linkedin: 'https://linkedin.com/in/priyanka-mukherjee-sales',
    portfolioUrl: '',
    coverNote: 'Specialized in customer relationship management, project walkthroughs, and high-conversion client follow-ups.',
    experienceYears: 2.5,
    currentCompany: 'Siddha Group',
    currentCtc: '5.5',
    expectedCtc: '7.0',
    noticePeriodDays: 15,
    resumeFilename: 'Priyanka_Mukherjee_Resume.pdf',
    status: 'Interview Scheduled',
    notes: [
      {
        id: 'note-pm-1',
        text: 'F2F interview scheduled with Sales Director for Tuesday 3:00 PM at Astittva Corporate Lounge.',
        author: 'admin@astitva.com',
        createdAt: '2026-10-25T08:15:00.000Z'
      }
    ],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-23T16:00:00.000Z', reason: 'Online application' },
      { fromStatus: 'New', toStatus: 'Under Review', changedBy: 'admin@astitva.com', changedAt: '2026-10-24T10:00:00.000Z', reason: 'Profile assessment' },
      { fromStatus: 'Under Review', toStatus: 'Shortlisted', changedBy: 'admin@astitva.com', changedAt: '2026-10-24T15:30:00.000Z', reason: 'Screening passed' },
      { fromStatus: 'Shortlisted', toStatus: 'Interview Scheduled', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T08:15:00.000Z', reason: 'Scheduled F2F round' }
    ]
  },
  {
    jobId: '6adb513f67eabd2b14554441',
    jobTitle: 'Sales Executive',
    jobSlug: 'sales-executive',
    name: 'Subhashis Roy',
    email: 'subhashis.roy1996@outlook.com',
    phone: '+919433055192',
    linkedin: '',
    portfolioUrl: '',
    coverNote: 'Enthusiastic property consultant with direct experience assisting HNIs in premium residential acquisitions.',
    experienceYears: 3,
    currentCompany: 'PS Group Residential',
    currentCtc: '6.0',
    expectedCtc: '8.0',
    noticePeriodDays: 30,
    resumeFilename: 'Subhashis_Roy_Profile.pdf',
    status: 'Under Review',
    notes: [],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-24T10:20:00.000Z', reason: 'Online application' },
      { fromStatus: 'New', toStatus: 'Under Review', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T09:00:00.000Z', reason: 'HR profile assessment' }
    ]
  },

  // 2. Assistant Manager (id: 6adb520588f963cfa3554442)
  {
    jobId: '6adb520588f963cfa3554442',
    jobTitle: 'Assistant Manager',
    jobSlug: 'assistant-manager',
    name: 'Amitava Banerjee',
    email: 'amitava.banerjee.kol@gmail.com',
    phone: '+919830012894',
    linkedin: 'https://linkedin.com/in/amitava-banerjee-realestate-leader',
    portfolioUrl: '',
    coverNote: 'Over 6 years directing high-value real estate transaction teams and channel partner ecosystems across Kolkata.',
    experienceYears: 6,
    currentCompany: 'Mani Group & RDB Realty',
    currentCtc: '10.5',
    expectedCtc: '13.5',
    noticePeriodDays: 45,
    resumeFilename: 'Amitava_Banerjee_AM_CV.pdf',
    status: 'Interview Scheduled',
    notes: [
      {
        id: 'note-ab-1',
        text: 'Final leadership round scheduled with Founder & MD. Candidate demonstrates exceptional team leadership capability.',
        author: 'admin@astitva.com',
        createdAt: '2026-10-25T07:45:00.000Z'
      }
    ],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-22T11:00:00.000Z', reason: 'Portal referral' },
      { fromStatus: 'New', toStatus: 'Under Review', changedBy: 'admin@astitva.com', changedAt: '2026-10-23T09:00:00.000Z', reason: 'Executive profile review' },
      { fromStatus: 'Under Review', toStatus: 'Shortlisted', changedBy: 'admin@astitva.com', changedAt: '2026-10-24T12:00:00.000Z', reason: 'Screened by HR head' },
      { fromStatus: 'Shortlisted', toStatus: 'Interview Scheduled', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T07:45:00.000Z', reason: 'Final stage interview' }
    ]
  },
  {
    jobId: '6adb520588f963cfa3554442',
    jobTitle: 'Assistant Manager',
    jobSlug: 'assistant-manager',
    name: 'Sreeparna Bhattacharya',
    email: 'sreeparna.bhatt@gmail.com',
    phone: '+919748863219',
    linkedin: 'https://linkedin.com/in/sreeparna-bhattacharya-realty',
    portfolioUrl: '',
    coverNote: '5.5 years in real estate sales leadership, managing institutional channel partners and closing marquee residential projects.',
    experienceYears: 5.5,
    currentCompany: 'Forum Group',
    currentCtc: '9.8',
    expectedCtc: '12.0',
    noticePeriodDays: 30,
    resumeFilename: 'Sreeparna_Bhattacharya_Resume.pdf',
    status: 'Selected',
    notes: [
      {
        id: 'note-sb-1',
        text: 'Offer letter dispatched and confirmed. Onboarding planned for 1st of next month.',
        author: 'admin@astitva.com',
        createdAt: '2026-10-25T09:10:00.000Z'
      }
    ],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-20T10:00:00.000Z', reason: 'Direct application' },
      { fromStatus: 'New', toStatus: 'Under Review', changedBy: 'admin@astitva.com', changedAt: '2026-10-21T11:00:00.000Z', reason: 'HR evaluation' },
      { fromStatus: 'Under Review', toStatus: 'Shortlisted', changedBy: 'admin@astitva.com', changedAt: '2026-10-22T14:00:00.000Z', reason: 'Technical interview passed' },
      { fromStatus: 'Shortlisted', toStatus: 'Interview Scheduled', changedBy: 'admin@astitva.com', changedAt: '2026-10-23T16:00:00.000Z', reason: 'Executive round' },
      { fromStatus: 'Interview Scheduled', toStatus: 'Selected', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T09:10:00.000Z', reason: 'Candidate selected & accepted offer' }
    ]
  },
  {
    jobId: '6adb520588f963cfa3554442',
    jobTitle: 'Assistant Manager',
    jobSlug: 'assistant-manager',
    name: 'Kunal Karmakar',
    email: 'kunal.karmakar.mgmt@gmail.com',
    phone: '+919836577103',
    linkedin: '',
    portfolioUrl: '',
    coverNote: 'Experienced team lead with focus on corporate client management and CRM pipeline optimization.',
    experienceYears: 4.5,
    currentCompany: 'Eden Realty',
    currentCtc: '8.4',
    expectedCtc: '11.0',
    noticePeriodDays: 30,
    resumeFilename: 'Kunal_Karmakar_CV.pdf',
    status: 'Under Review',
    notes: [],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-24T12:00:00.000Z', reason: 'Online application' },
      { fromStatus: 'New', toStatus: 'Under Review', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T08:30:00.000Z', reason: 'Profile assessment' }
    ]
  },

  // 3. Resales Executive (id: 6adb519788f963cfa3554441) - Sabrin already exists
  {
    jobId: '6adb519788f963cfa3554441',
    jobTitle: 'Resales Executive',
    jobSlug: 'resales-executive',
    name: 'Debanjan Ghosh',
    email: 'debanjan.resales@gmail.com',
    phone: '+919831944320',
    linkedin: 'https://linkedin.com/in/debanjan-ghosh-resale-expert',
    portfolioUrl: '',
    coverNote: 'Expert in resale property verification, title search coordination, and secondary market valuations.',
    experienceYears: 3.5,
    currentCompany: 'Srijan Realty Secondary Desk',
    currentCtc: '5.8',
    expectedCtc: '7.5',
    noticePeriodDays: 30,
    resumeFilename: 'Debanjan_Ghosh_Resale_Specialist.pdf',
    status: 'Under Review',
    notes: [
      {
        id: 'note-dg-1',
        text: 'Strong understanding of registration and legal due diligence processes for resale apartments in Kolkata.',
        author: 'admin@astitva.com',
        createdAt: '2026-10-25T10:15:00.000Z'
      }
    ],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-24T15:00:00.000Z', reason: 'Online application' },
      { fromStatus: 'New', toStatus: 'Under Review', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T10:15:00.000Z', reason: 'Reviewing background' }
    ]
  },
  {
    jobId: '6adb519788f963cfa3554441',
    jobTitle: 'Resales Executive',
    jobSlug: 'resales-executive',
    name: 'Arpita Chakraborty',
    email: 'arpita.chakraborty.re@gmail.com',
    phone: '+919874099812',
    linkedin: '',
    portfolioUrl: '',
    coverNote: 'Experienced in handling resale apartment listings, customer documentation, and seller client relations.',
    experienceYears: 2,
    currentCompany: 'Square Yards Kolkata',
    currentCtc: '4.8',
    expectedCtc: '6.5',
    noticePeriodDays: 15,
    resumeFilename: 'Arpita_Chakraborty_CV.pdf',
    status: 'Shortlisted',
    notes: [],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-24T09:00:00.000Z', reason: 'Online application' },
      { fromStatus: 'New', toStatus: 'Shortlisted', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T11:00:00.000Z', reason: 'Good resale transaction experience' }
    ]
  },

  // 4. Telecaller (id: 6adb524a88f963cfa3554443) - Biswabrata Chanda already exists
  {
    jobId: '6adb524a88f963cfa3554443',
    jobTitle: 'Telecaller',
    jobSlug: 'telecaller',
    name: 'Ananya Das',
    email: 'ananya.das.telecall@gmail.com',
    phone: '+919830511984',
    linkedin: 'https://linkedin.com/in/ananya-das-lead-nurturing',
    portfolioUrl: '',
    coverNote: 'Fluent in English, Hindi, and Bengali. Over 2.5 years of experience converting real estate inbound/outbound leads into confirmed site visits.',
    experienceYears: 2.5,
    currentCompany: 'MagicBricks Lead Desk',
    currentCtc: '3.8',
    expectedCtc: '5.0',
    noticePeriodDays: 7,
    resumeFilename: 'Ananya_Das_Telecaller_CV.pdf',
    status: 'Shortlisted',
    notes: [
      {
        id: 'note-ad-1',
        text: 'Superb phone presence and clarity. Demonstrated 35% site-visit conversion rate in previous position.',
        author: 'admin@astitva.com',
        createdAt: '2026-10-25T10:45:00.000Z'
      }
    ],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-24T14:30:00.000Z', reason: 'Online application' },
      { fromStatus: 'New', toStatus: 'Shortlisted', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T10:45:00.000Z', reason: 'Top-tier telephonic screening score' }
    ]
  },
  {
    jobId: '6adb524a88f963cfa3554443',
    jobTitle: 'Telecaller',
    jobSlug: 'telecaller',
    name: 'Rohit Sengupta',
    email: 'rohit.sengupta.crm@gmail.com',
    phone: '+919832233451',
    linkedin: '',
    portfolioUrl: '',
    coverNote: 'Dedicated customer outreach executive with experience managing CRM lead records and outbound call schedules.',
    experienceYears: 1.5,
    currentCompany: 'Justdial Real Estate Outbound',
    currentCtc: '3.0',
    expectedCtc: '4.2',
    noticePeriodDays: 15,
    resumeFilename: 'Rohit_Sengupta_Resume.pdf',
    status: 'Under Review',
    notes: [],
    statusHistory: [
      { fromStatus: null, toStatus: 'New', changedBy: 'candidate', changedAt: '2026-10-25T08:00:00.000Z', reason: 'Online application' },
      { fromStatus: 'New', toStatus: 'Under Review', changedBy: 'admin@astitva.com', changedAt: '2026-10-25T11:30:00.000Z', reason: 'Reviewing communication sample' }
    ]
  }
];

async function seed() {
  const client = new MongoClient(process.env.MONGO_URL);
  try {
    await client.connect();
    console.log('[Seed] Connected to MongoDB Atlas');
    const db = client.db('astitva_realestate');

    // 1. Fix typo in Sales Exeutive -> Sales Executive if present
    const salesJob = await db.collection('job_openings').findOne({ _id: new ObjectId('6adb513f67eabd2b14554441') });
    if (salesJob && salesJob.title !== 'Sales Executive') {
      await db.collection('job_openings').updateOne(
        { _id: salesJob._id },
        { $set: { title: 'Sales Executive', slug: 'sales-executive' } }
      );
      console.log('[Seed] Corrected job title from "Sales Exeutive" to "Sales Executive"');
    }

    // 2. Prepare PDF buffer for candidate CVs
    const artifactPdfPath = 'C:/Users/lenovo/.gemini/antigravity-ide/brain/8e2c776c-0c1f-4d4c-ae3e-013b7fbfca20/.user_uploaded/media_1791965784872.pdf';
    let basePdfBuffer;
    if (fs.existsSync(artifactPdfPath)) {
      basePdfBuffer = fs.readFileSync(artifactPdfPath);
      console.log(`[Seed] Loaded base CV PDF from artifact (${basePdfBuffer.length} bytes)`);
    } else {
      // Fallback valid minimal PDF
      basePdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 50 700 Td (Candidate CV) Tj ET\nendstream endobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000213 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n308\n%%EOF');
      console.log('[Seed] Used generated minimal PDF buffer');
    }

    // 3. Process candidates
    let seededCount = 0;
    for (const cand of CANDIDATES) {
      const existing = await db.collection('job_applications').findOne({ email: cand.email });
      if (existing) {
        console.log(`[Seed] Candidate ${cand.name} (${cand.email}) already exists, skipping.`);
        continue;
      }

      // Upload CV to GridFS
      const stored = await storeResumeInGridFS(db, cand.resumeFilename, 'application/pdf', basePdfBuffer);
      const insertedId = new ObjectId();
      const refNum = generateJobAppRefNumber();

      const doc = {
        _id: insertedId,
        referenceNumber: refNum,
        jobId: new ObjectId(cand.jobId),
        jobTitle: cand.jobTitle,
        jobSlug: cand.jobSlug,
        name: cand.name,
        email: cand.email,
        phone: cand.phone,
        linkedin: cand.linkedin,
        portfolioUrl: cand.portfolioUrl || '',
        coverNote: cand.coverNote || '',
        experienceYears: cand.experienceYears,
        currentCompany: cand.currentCompany || '',
        currentCtc: cand.currentCtc || '',
        expectedCtc: cand.expectedCtc || '',
        noticePeriodDays: cand.noticePeriodDays || 30,
        resumeFileId: String(stored.fileId),
        resumeFilename: stored.filename,
        resumeContentType: 'application/pdf',
        resumeSize: basePdfBuffer.length,
        resumeUrl: `/api/admin/recruitment/applications/${insertedId}/resume`,
        status: cand.status || 'New',
        statusHistory: cand.statusHistory || [
          {
            fromStatus: null,
            toStatus: cand.status || 'New',
            changedBy: 'candidate',
            changedAt: nowUtcIso(),
            reason: 'Application submitted via online portal'
          }
        ],
        notes: cand.notes || [],
        source: 'careers-job-board',
        ipAddress: '106.219.132.238',
        createdAt: nowUtcIso(),
        updatedAt: nowUtcIso()
      };

      await db.collection('job_applications').insertOne(doc);
      seededCount++;
      console.log(`[Seed] Inserted candidate: ${cand.name} (${cand.jobTitle}) -> Ref: ${refNum}, CV File: ${stored.fileId}`);
    }

    // 4. Update applicationsCount on each job opening to match live count
    const jobs = await db.collection('job_openings').find({}).toArray();
    console.log('\n[Seed] Updating live applicationsCount on job_openings...');
    for (const job of jobs) {
      const count = await db.collection('job_applications').countDocuments({
        $or: [{ jobId: job._id }, { jobId: String(job._id) }]
      });
      await db.collection('job_openings').updateOne(
        { _id: job._id },
        { $set: { applicationsCount: count, updatedAt: nowUtcIso() } }
      );
      console.log(` - ${job.title} (${job._id}): ${count} applicants`);
    }

    const totalApps = await db.collection('job_applications').countDocuments({});
    console.log(`\n[Seed] Done! Successfully seeded ${seededCount} candidates. Total applicants in database: ${totalApps}`);

  } catch (err) {
    console.error('[Seed Error]:', err);
  } finally {
    await client.close();
  }
}

seed();
